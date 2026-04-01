"use client"

import { useEffect, useMemo, useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import { useGlobalStore } from "@/store";
import { toast } from "sonner";
import type { OverviewStatsType, RecentTicketType, Ticket } from "../../../types/ticketing.types";
import { useRouter, useSearchParams } from "next/navigation";

const STATIC_OVERVIEW: OverviewStatsType = {
  totalTickets: 0,
  overDueTickets: 0,
  openTickets: 0,
  onHoldTickets: 0,
  closedTickets: 0,
  unassignedTickets: 0,
  totalHighPriorityTickets: 0,
  totalMediumPriorityTickets: 0,
  totalLowPriorityTickets: 0,
};

const STATIC_SUMMARY_INFO = {
  totalTickets: "0 last week",
  overdueTickets: "0 breaching SLA",
  dueTodayTickets: "0 high priority",
  openTickets: "across 0 departments",
  onHoldTickets: "waiting for response",
  unassignedTickets: "attention required",
};

const STATIC_SOURCE_BREAKDOWN = {
  instagram: 0,
  whatsapp: 0,
  facebook: 0,
};

type UserShape = {
  _id?: string;
  id?: string;
  userId?: string;
  email?: string;
  username?: string;
  department?: string;
  departmentName?: string;
  dept?: string;
  organizationalDetails?: {
    departmentName?: string;
  };
  policies?: Array<string | { name?: string; label?: string; policy?: string }>;
};

type DepartmentGroup = {
  departmentName?: string;
  name?: string;
  department?: string;
  groupName?: string;
  admin?: Array<string | Record<string, unknown>>;
  admins?: Array<string | Record<string, unknown>>;
};

type DepartmentDashboardData = {
  summary?: {
    totalTickets?: { count?: number; info?: string };
    overdueTickets?: { count?: number; info?: string };
    dueTodayTickets?: { count?: number; info?: string };
    openTickets?: { count?: number; info?: string };
    onHoldTickets?: { count?: number; info?: string };
    unassignedTickets?: { count?: number; info?: string };
  };
  department?: string;
  lastFiveTickets?: RecentTicketType[];
  agentPerformance?: Array<{
    agentId?: string;
    _id?: string;
    name?: string;
    agentName?: string;
    department?: string;
    departmentName?: string;
    assignedTotalTickets?: number;
    assignedTickets?: number;
    totalTickets?: number;
    resolutionRate?: number;
    designation?: string;
  }>;
  performanceTrend?: Array<{ date?: string; totalCreated?: number; totalResolved?: number }>;
  sourceBreakdown?: { instagram?: number; whatsapp?: number; facebook?: number };
  closedTickets?: number;
  totalHighPriorityTickets?: number;
  totalMediumPriorityTickets?: number;
  totalLowPriorityTickets?: number;
};

const pickFirstNonEmptyString = (values: unknown[], fallback = "") => {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return fallback;
};

const normalize = (value: unknown) => String(value ?? "").trim().toLowerCase();

const getPolicyKey = (policy: string | { name?: string; label?: string; policy?: string }) => {
  if (typeof policy === "string") {
    return policy.trim();
  }
  return pickFirstNonEmptyString([policy.name, policy.label, policy.policy]);
};

export default function TicketingDepartmentDashboard() {
  const { user, fetchTicketingDepartmentDashboard, fetchTicketingDepartmentGroups  } = useGlobalStore();
  const searchParams = useSearchParams();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const router = useRouter();

  const departmentFromQuery = (searchParams.get("department") ?? "").trim();
  const rawUser = useMemo(() => (user ?? {}) as UserShape, [user]);
  const userDepartment = useMemo(() => {
    return pickFirstNonEmptyString([
      rawUser.department,
      rawUser.departmentName,
      rawUser.dept,
      rawUser.organizationalDetails?.departmentName,
    ]);
  }, [rawUser]);

  const policyList = Array.isArray(rawUser.policies) ? rawUser.policies : [];
  const hasPolicy = (policyKey: string) => policyList.some((policy) => getPolicyKey(policy) === policyKey);
  const superAdminPolicies = ["ticketingFullAccess", "ticketingRootAccess", "rootAccess"];
  const isSuperAdmin = superAdminPolicies.some((policyKey) => hasPolicy(policyKey));
  const isAdmin = hasPolicy("ticketingDeptAccess");
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [canAccessDepartmentDashboard, setCanAccessDepartmentDashboard] = useState(false);

  const initialDepartment = isSuperAdmin
    ? pickFirstNonEmptyString([departmentFromQuery, userDepartment], "not-available")
    : pickFirstNonEmptyString([userDepartment, departmentFromQuery], "not-available");
  const [selectedDepartment, setSelectedDepartment] = useState<string>(initialDepartment);
  const [overviewStats, setOverviewStats] = useState<OverviewStatsType>(STATIC_OVERVIEW);
  const [recentTickets, setRecentTickets] = useState<RecentTicketType[]>([]);
  const [summaryInfo, setSummaryInfo] = useState(STATIC_SUMMARY_INFO);
  const [dueTodayCount, setDueTodayCount] = useState(0);
  const [agentPerformanceRows, setAgentPerformanceRows] = useState<Array<{ agentId?: string; name: string; department: string; assignedTickets: number; resolutionRate: number }>>([]);
  const [performanceTrend, setPerformanceTrend] = useState<Array<{ date: string; totalCreated: number; totalResolved: number }>>([]);
  const [sourceBreakdownData, setSourceBreakdownData] = useState(STATIC_SOURCE_BREAKDOWN);

  useEffect(() => {
    if (isSuperAdmin && departmentFromQuery) {
      setSelectedDepartment(departmentFromQuery);
      return;
    }
    if (userDepartment) {
      setSelectedDepartment(userDepartment);
    }
  }, [departmentFromQuery, userDepartment, isSuperAdmin]);

  useEffect(() => {
    const resolveFirstAdminIdentifier = (entry: unknown) => {
      if (typeof entry === "string") {
        return entry;
      }
      if (entry && typeof entry === "object") {
        const adminUser = entry as Record<string, unknown>;
        return pickFirstNonEmptyString([
          adminUser._id,
          adminUser.id,
          adminUser.userId,
          adminUser.email,
          adminUser.username,
        ]);
      }
      return "";
    };

    const verifyAccess = async () => {
      if (isSuperAdmin) {
        setCanAccessDepartmentDashboard(true);
        setCheckingAccess(false);
        return;
      }

      if (!isAdmin) {
        setCanAccessDepartmentDashboard(false);
        setCheckingAccess(false);
        return;
      }

      const userIdentifiers = new Set(
        [rawUser._id, rawUser.id, rawUser.userId, rawUser.email, rawUser.username]
          .map((value) => normalize(value))
          .filter(Boolean),
      );

      if (userIdentifiers.size === 0 || !userDepartment) {
        setCanAccessDepartmentDashboard(false);
        setCheckingAccess(false);
        return;
      }

      const res = await fetchTicketingDepartmentGroups();
      if (!res?.success || !Array.isArray(res.data)) {
        setCanAccessDepartmentDashboard(false);
        setCheckingAccess(false);
        return;
      }

      const groups = res.data as DepartmentGroup[];
      const matchingDepartment = groups.find((group) => {
        const groupDepartment = normalize(
          pickFirstNonEmptyString([
            group.departmentName,
            group.name,
            group.department,
            group.groupName,
          ]),
        );
        return groupDepartment === normalize(userDepartment);
      });

      const adminList = Array.isArray(matchingDepartment?.admin)
        ? matchingDepartment.admin
        : Array.isArray(matchingDepartment?.admins)
          ? matchingDepartment.admins
          : [];

      const firstAdminIdentifier = normalize(resolveFirstAdminIdentifier(adminList[0]));
      const isPrimaryDepartmentAdmin = Boolean(firstAdminIdentifier) && userIdentifiers.has(firstAdminIdentifier);

      setCanAccessDepartmentDashboard(isPrimaryDepartmentAdmin);
      setCheckingAccess(false);
    };

    verifyAccess();
  }, [isSuperAdmin, isAdmin, rawUser, userDepartment]);

  useEffect(() => {
    const loadOverview = async () => {
      if (!canAccessDepartmentDashboard) {
        return;
      }
      try {
        const res = await fetchTicketingDepartmentDashboard(selectedDepartment, selectedYear);
        if (res?.success) {
          const data = (res.data ?? {}) as DepartmentDashboardData;
          const summary = data.summary;
          const apiDepartment = (data.department ?? "").trim();

          setOverviewStats({
            totalTickets: Number(summary?.totalTickets?.count ?? 0),
            overDueTickets: Number(summary?.overdueTickets?.count ?? 0),
            openTickets: Number(summary?.openTickets?.count ?? 0),
            onHoldTickets: Number(summary?.onHoldTickets?.count ?? 0),
            closedTickets: Number(data.closedTickets ?? 0),
            unassignedTickets: Number(summary?.unassignedTickets?.count ?? 0),
            totalHighPriorityTickets: Number(data.totalHighPriorityTickets ?? 0),
            totalMediumPriorityTickets: Number(data.totalMediumPriorityTickets ?? 0),
            totalLowPriorityTickets: Number(data.totalLowPriorityTickets ?? 0),
          });
          setSummaryInfo({
            totalTickets: String(summary?.totalTickets?.info ?? STATIC_SUMMARY_INFO.totalTickets),
            overdueTickets: String(summary?.overdueTickets?.info ?? STATIC_SUMMARY_INFO.overdueTickets),
            dueTodayTickets: String(summary?.dueTodayTickets?.info ?? STATIC_SUMMARY_INFO.dueTodayTickets),
            openTickets: String(summary?.openTickets?.info ?? STATIC_SUMMARY_INFO.openTickets),
            onHoldTickets: String(summary?.onHoldTickets?.info ?? STATIC_SUMMARY_INFO.onHoldTickets),
            unassignedTickets: String(summary?.unassignedTickets?.info ?? STATIC_SUMMARY_INFO.unassignedTickets),
          });
          setDueTodayCount(Number(summary?.dueTodayTickets?.count ?? 0));
          setRecentTickets(data.lastFiveTickets ?? []);

          if (apiDepartment && (isAdmin || !departmentFromQuery)) {
            setSelectedDepartment(apiDepartment);
          }

          setAgentPerformanceRows(
            (data.agentPerformance ?? []).map((agent) => ({
              agentId: pickFirstNonEmptyString([agent.agentId, agent._id]),
              name: pickFirstNonEmptyString([agent.name, agent.agentName], "Unknown Agent"),
              department: pickFirstNonEmptyString(
                [agent.department, agent.departmentName, apiDepartment, selectedDepartment],
                "General",
              ),
              assignedTickets: Number(agent.assignedTotalTickets ?? agent.assignedTickets ?? agent.totalTickets ?? 0),
              resolutionRate: Number(agent.resolutionRate ?? 0),
            })),
          );

          setPerformanceTrend(
            (data.performanceTrend ?? []).map((item) => ({
              date: String(item.date ?? ""),
              totalCreated: Number(item.totalCreated ?? 0),
              totalResolved: Number(item.totalResolved ?? 0),
            })),
          );

          setSourceBreakdownData({
            instagram: Number(data.sourceBreakdown?.instagram ?? 0),
            whatsapp: Number(data.sourceBreakdown?.whatsapp ?? 0),
            facebook: Number(data.sourceBreakdown?.facebook ?? 0),
          });
        } else {
          toast.error("An error occurred while fetching details.");
        }
      } catch {
        toast.error("Unable to load ticket overview due to a network or server issue.");
      }
    };

    loadOverview();
  }, [selectedDepartment, selectedYear, canAccessDepartmentDashboard]);
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
  }, []);

  const summaryTiles = [
    {
      label: "All Tickets",
      value: overviewStats?.totalTickets ?? 0,
      hint: summaryInfo.totalTickets,
      colorClass: "summary-blue",
      icon: <ConfirmationNumberOutlinedIcon className="tile-icon" />,
    },
    {
      label: "Overdue Tickets",
      value: overviewStats?.overDueTickets ?? 0,
      hint: summaryInfo.overdueTickets,
      colorClass: "summary-red",
      icon: <WarningAmberOutlinedIcon className="tile-icon" />,
    },
    {
      label: "Tickets Due Today",
      value: dueTodayCount,
      hint: summaryInfo.dueTodayTickets,
      colorClass: "summary-amber",
      icon: <CheckCircleOutlineOutlinedIcon className="tile-icon" />,
    },
    {
      label: "Open Tickets",
      value: overviewStats?.openTickets ?? 0,
      hint: summaryInfo.openTickets,
      colorClass: "summary-green",
      icon: <MarkEmailUnreadOutlinedIcon className="tile-icon" />,
    },
    {
      label: "Tickets on Hold",
      value: overviewStats?.onHoldTickets ?? 0,
      hint: summaryInfo.onHoldTickets,
      colorClass: "summary-yellow",
      icon: <PendingActionsOutlinedIcon className="tile-icon" />,
    },
    {
      label: "Unassigned Tickets",
      value: overviewStats?.unassignedTickets ?? 0,
      hint: summaryInfo.unassignedTickets,
      colorClass: "summary-teal",
      icon: <PersonOffOutlinedIcon className="tile-icon" />,
    },
  ];

  const sourceTotal = Object.values(sourceBreakdownData).reduce((sum, value) => sum + value, 0);
  const sourceBreakdown = [
    { source: "Instagram", total: sourceBreakdownData.instagram, percent: sourceTotal > 0 ? Math.round((sourceBreakdownData.instagram / sourceTotal) * 100) : 0, colorClass: "source-1" },
    { source: "WhatsApp", total: sourceBreakdownData.whatsapp, percent: sourceTotal > 0 ? Math.round((sourceBreakdownData.whatsapp / sourceTotal) * 100) : 0, colorClass: "source-2" },
    { source: "Facebook", total: sourceBreakdownData.facebook, percent: sourceTotal > 0 ? Math.round((sourceBreakdownData.facebook / sourceTotal) * 100) : 0, colorClass: "source-3" },
  ];

  const totalTickets = overviewStats?.totalTickets ?? 0;
  const priorityCounts = {
    high: overviewStats?.totalHighPriorityTickets ?? 0,
    medium: overviewStats?.totalMediumPriorityTickets ?? 0,
    low: overviewStats?.totalLowPriorityTickets ?? 0,
  };
  const priorityTotal = priorityCounts.high + priorityCounts.medium + priorityCounts.low;
  const highPriorityPercent = priorityTotal > 0 ? Math.round((priorityCounts.high / priorityTotal) * 100) : 0;
  const mediumPriorityPercent = priorityTotal > 0 ? Math.round((priorityCounts.medium / priorityTotal) * 100) : 0;
  const lowPriorityPercent = priorityTotal > 0 ? Math.max(0, 100 - highPriorityPercent - mediumPriorityPercent) : 0;
  const priorityDonutStyle = {
    background: `conic-gradient(#f44747 0 ${highPriorityPercent}%, #dca53d ${highPriorityPercent}% ${highPriorityPercent + mediumPriorityPercent}%, #3fa652 ${highPriorityPercent + mediumPriorityPercent}% 100%)`,
  };

  const prioritySplit = [
    { label: "High", count: priorityCounts.high, value: highPriorityPercent, className: "legend-high" },
    { label: "Low", count: priorityCounts.low, value: lowPriorityPercent, className: "legend-low" },
    { label: "Medium", count: priorityCounts.medium, value: mediumPriorityPercent, className: "legend-medium" },
  ];
  const trendPoints = useMemo(() => {
    const points = performanceTrend;
    if (points.length === 0) {
      return { created: "", resolved: "" };
    }
    const maxValue = Math.max(
      ...points.map((item) => Math.max(Number(item.totalCreated ?? 0), Number(item.totalResolved ?? 0))),
      1,
    );
    const toPolyline = (key: "totalCreated" | "totalResolved") =>
      points
        .map((item, index) => {
          const x = points.length === 1 ? 50 : (index / (points.length - 1)) * 100;
          const y = 100 - (Number(item[key] ?? 0) / maxValue) * 100;
          return `${x},${y}`;
        })
        .join(" ");
    return {
      created: toPolyline("totalCreated"),
      resolved: toPolyline("totalResolved"),
    };
  }, [performanceTrend]);

  const filteredAgentRows = agentPerformanceRows.filter(
    (agent) => agent.department.toLowerCase() === selectedDepartment.toLowerCase(),
  );
  const agentNameById = useMemo(() => {
    const map: Record<string, string> = {};
    agentPerformanceRows.forEach((agent) => {
      if (agent.agentId) {
        map[agent.agentId] = agent.name;
      }
    });
    return map;
  }, [agentPerformanceRows]);

  const ticketRows = recentTickets.map((ticket: any) => {
    const normalizedStatus = ticket.status === "onHold" ? "In Progress" : ticket.status;
    const statusClass =
      normalizedStatus === "Open" ? "status-open" : normalizedStatus === "Closed" ? "status-closed" : "status-pending";
    const ticketWithAgents = ticket as RecentTicketType & { agents?: string[] };
    const firstAssignedAgentId = Array.isArray(ticketWithAgents.agents)
      ? String(ticketWithAgents.agents[0] ?? "")
      : "";
    const assignedToFromAgentMap = firstAssignedAgentId ? agentNameById[firstAssignedAgentId] : "";
    const dueDate = ticket.dueDate
      ? new Date(ticket.dueDate).toLocaleDateString("en-GB").replace(/\//g, "-")
      : "-";

    const assignedTo = ticket.lastAgentDetail?.email ?? assignedToFromAgentMap ?? "Unassigned";
    const ticketId = ticket.ticketId ? `#${ticket.ticketId}` : "#-";
    const priority = ticket.priority
      ? `${ticket.priority.charAt(0).toUpperCase()}${ticket.priority.slice(1)}`
      : "Low";

    return {
      id: ticketId,
      priority,
      status: normalizedStatus,
      assignedTo,
      dueDate,
      statusClass,
    };
  });

  if (checkingAccess) {
    return (
      <div className="ticketing-wireframe">
        <div className="w-full py-10 flex justify-center">
          <span className="loading loading-spinner loading-lg" />
        </div>
      </div>
    );
  }

  if (!canAccessDepartmentDashboard) {
    router.replace("/ticketing/inbox");
  }

  return (
<div className="pt-[0.875rem] px-[1.25rem] pb-[1.5rem] bg-[#F7FAFC]">

  {/* Filter Row */}
  <div className="mb-[0.875rem]">
    <div className="relative">
      <button
        type="button"
        disabled
        className="border border-[#d1d5db] rounded-[0.4375rem] bg-white text-[#0F141A] min-w-[11.25rem] h-[2.625rem] px-[0.75rem] text-[0.875rem] inline-flex items-center gap-[0.5rem]"
      >
        {selectedDepartment}
      </button>
    </div>
  </div>

  {/* Summary Grid */}
  <div className="grid gap-[0.5rem] grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-[0.5rem]">
    {summaryTiles.map((tile) => (
      <div
        key={tile.label}
        className={`border border-[#d1d5db] border-l-[0.25rem] rounded-[0.5rem] px-[0.75rem] py-[0.625rem] min-h-[6.875rem] bg-white ${
          tile.colorClass === "summary-blue"
            ? "border-l-[#3259d6]"
            : tile.colorClass === "summary-red"
            ? "border-l-[#f44747]"
            : tile.colorClass === "summary-amber"
            ? "border-l-[#d99a33]"
            : tile.colorClass === "summary-green"
            ? "border-l-[#5da360]"
            : tile.colorClass === "summary-yellow"
            ? "border-l-[#f1ba22]"
            : "border-l-[#5bc7ca]"
        }`}
      >
        <div className="flex items-center justify-between text-[#929292] text-[0.875rem]">
          <span>{tile.label}</span>

          <span
            className={`w-[1.375rem] h-[1.375rem] rounded-full flex items-center justify-center ${
              tile.colorClass === "summary-blue"
                ? "bg-[rgba(50,89,214,0.14)] text-[#3259d6]"
                : tile.colorClass === "summary-red"
                ? "bg-[rgba(244,71,71,0.13)] text-[#f44747]"
                : tile.colorClass === "summary-amber"
                ? "bg-[rgba(217,154,51,0.15)] text-[#d99a33]"
                : tile.colorClass === "summary-green"
                ? "bg-[rgba(93,163,96,0.17)] text-[#5da360]"
                : tile.colorClass === "summary-yellow"
                ? "bg-[rgba(241,186,34,0.15)] text-[#f1ba22]"
                : "bg-[rgba(91,199,202,0.15)] text-[#5bc7ca]"
            }`}
          >
            {tile.icon}
          </span>
        </div>

        <div className="mt-[0.25rem] text-[1.375rem] text-[#0F141A] font-semibold">
          {tile.value.toLocaleString()}
        </div>

        <div className="mt-[0.625rem] text-[#3B8AEC] text-[0.75rem]">
          {tile.hint}
        </div>
      </div>
    ))}
  </div>

  {/* Main Grid */}
  <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.85fr] gap-[0.5rem] mb-[0.5rem]">

    {/* Priority Panel */}
    <section className="border border-[#d1d5db] rounded-[0.5rem] bg-white overflow-hidden">
      <header className="h-[2.75rem] border-b border-[#d1d5db] px-[0.875rem] flex items-center text-[1.25rem] font-medium text-[#0F141A]">
        Priority Metrics Overview
      </header>

      <div className="p-[0.875rem] flex items-center justify-center gap-[1.375rem] min-h-[17.5rem]">

        <div className="relative w-[11.625rem] h-[11.625rem]">
          <div
            className="w-full h-full rounded-full relative"
            style={priorityDonutStyle}
          >
            <div className="absolute w-[6.875rem] h-[6.875rem] rounded-full bg-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

            <div className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-[1.875rem] font-medium text-[#0F141A] leading-none">
                {totalTickets}
              </div>
              <div className="text-[0.8125rem] text-[#424650] mt-[0.25rem]">
                Total Tickets
              </div>
            </div>

            <span className="absolute w-[2.25rem] h-[2.25rem] rounded-full border border-[#d1d5db] bg-white text-[#424650] text-[0.625rem] flex items-center justify-center right-[-0.75rem] top-[6.125rem]">
              {prioritySplit[1].value}%
            </span>

            <span className="absolute w-[2.25rem] h-[2.25rem] rounded-full border border-[#d1d5db] bg-white text-[#424650] text-[0.625rem] flex items-center justify-center top-[-0.5rem] left-1/2 -translate-x-1/2">
              {prioritySplit[0].value}%
            </span>

            <span className="absolute w-[2.25rem] h-[2.25rem] rounded-full border border-[#d1d5db] bg-white text-[#424650] text-[0.625rem] flex items-center justify-center left-[-0.75rem] top-[6.125rem]">
              {prioritySplit[2].value}%
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-[0.875rem]">
          {prioritySplit.map((item) => (
            <div key={item.label} className="flex items-center gap-[0.5rem] text-[0.875rem] text-[#0F141A]">
              <span
                className={`w-[0.6875rem] h-[0.6875rem] rounded-full ${
                  item.className === "legend-high"
                    ? "bg-[#f44747]"
                    : item.className === "legend-low"
                    ? "bg-[#3fa652]"
                    : "bg-[#dca53d]"
                }`}
              />
              <span>{item.label}</span>
              <span className="ml-auto text-[#3B8AEC] font-semibold">
                {item.count} ({item.value}%)
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>

    {/* Agent Performance */}
    <section className="border border-[#d1d5db] rounded-[0.5rem] bg-white overflow-hidden">
      <header className="h-[2.75rem] border-b border-[#d1d5db] px-[0.875rem] flex items-center text-[1.25rem] font-medium text-[#0F141A]">
        Agent Performance
      </header>

      <div className="px-[0.875rem] pr-[1rem] py-[0.875rem]">
        <div className="grid grid-cols-[1.35fr_0.9fr_1.9fr_0.9fr] gap-[0.75rem] text-[#929292] text-[0.8125rem] mb-[0.625rem]">
          <span>Agent Name</span>
          <span>Assigned Tickets</span>
          <span>Resolution Rate</span>
          <span>Action</span>
        </div>

        {filteredAgentRows.length > 0 ? (
          filteredAgentRows.map((agent, index) => (
            <div key={index} className="grid grid-cols-[1.35fr_0.9fr_1.9fr_0.9fr] gap-[0.75rem] h-[2.125rem] items-center pr-[1rem]">
              <div className="text-[#0F141A] text-[0.8125rem] font-medium">{agent.name}</div>
              <div className="text-[#0F141A] text-[0.8125rem]">{agent.assignedTickets}</div>

              <div className="relative w-full h-[0.5rem] bg-[#f3ebde] rounded-[6.25rem]">
                <span className="block h-full bg-[#cf9332] rounded-[6.25rem]" style={{ width: `${agent.resolutionRate}%` }} />
                <span className="absolute right-[-2rem] top-1/2 -translate-y-1/2 text-[0.75rem]">{agent.resolutionRate}%</span>
              </div>

              <button className="text-[#2d57d8] text-[0.75rem] flex items-center gap-[0.25rem]">
                View Details <OpenInNewOutlinedIcon className="text-[0.75rem]" />
              </button>
            </div>
          ))
        ) : (
          <div className="text-[0.8125rem] text-[#0F141A]">No agents found</div>
        )}
      </div>
    </section>

  </div>

  {/* Bottom Section */}
  <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.85fr] gap-[0.5rem]">

    {/* Source */}
    <section className="border border-[#d1d5db] rounded-[0.5rem] bg-white overflow-hidden">
      <header className="h-[2.75rem] border-b border-[#d1d5db] px-[0.875rem] flex items-center text-[1.25rem] font-medium">
        Tickets by Source
      </header>

      <div className="p-[0.875rem] flex flex-col gap-[1rem]">
        {sourceBreakdown.map((item, index) => (
          <div key={index} className="grid grid-cols-[5rem_1fr_2.5rem] items-center gap-[0.625rem]">
            <span className="text-[0.875rem]">{item.source}</span>

            <div className="w-full h-[0.75rem] rounded-full">
              <span className="block h-full rounded-full bg-[#4f6fe0]" style={{ width: `${item.percent}%` }} />
            </div>

            <span className="text-[0.75rem] font-medium">{item.total}</span>
          </div>
        ))}
      </div>
    </section>

    {/* Tickets Table */}
    <section className="border border-[#d1d5db] rounded-[0.5rem] bg-white overflow-hidden">
      <header className="h-[2.75rem] border-b border-[#d1d5db] px-[0.875rem] flex items-center justify-between text-[1.25rem]">
        <span>Tickets</span>

        <div className="flex items-center gap-[0.5rem]">
          <button className="bg-[#2b57df] text-white h-[1.75rem] px-[0.625rem] rounded-[0.375rem] text-[0.75rem] flex items-center gap-[0.25rem]">
            <AddIcon className="text-[0.875rem]" /> Add
          </button>
          <button className="border border-[#2b57df] text-[#2b57df] h-[1.75rem] px-[0.625rem] rounded-[0.375rem] text-[0.75rem]">
            View All
          </button>
        </div>
      </header>

      <div className="overflow-x-auto pt-[0.625rem] pb-[0.75rem]">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["Ticket ID", "Priority", "Status", "Assigned to", "Due Date"].map((h) => (
                <th key={h} className="text-[#929292] text-[0.8125rem] font-medium px-[0.875rem] py-[0.5rem] border-b border-[#e5e7eb] text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {ticketRows.map((row, idx) => (
              <tr key={idx}>
                <td className="px-[0.875rem] py-[0.5rem] border-b">{row.id}</td>
                <td className="px-[0.875rem] py-[0.5rem] border-b">{row.priority}</td>
                <td className="px-[0.875rem] py-[0.5rem] border-b">
                  <span
                    className={`inline-flex items-center justify-center min-w-[5.25rem] h-[1.5rem] rounded-[0.5rem] text-[0.75rem] font-medium ${
                      row.statusClass === "status-open"
                        ? "bg-[#dcfce7] text-[#22a447]"
                        : row.statusClass === "status-pending"
                        ? "bg-[#fef3c7] text-[#d19023]"
                        : "bg-[#fee2e2] text-[#ef4444]"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-[0.875rem] py-[0.5rem] border-b">{row.assignedTo}</td>
                <td className="px-[0.875rem] py-[0.5rem] border-b">{row.dueDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>

  </div>
</div>
  );
}
