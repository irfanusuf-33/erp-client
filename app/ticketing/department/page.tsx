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
    <div className="ticketing-wireframe">
      <div className="wireframe-filter-row">
        <div className="department-select-wrap">
          <button type="button" className="department-select" disabled>
            {selectedDepartment}
          </button>
        </div>
      </div>

      <div className="wireframe-summary-grid">
        {summaryTiles.map((tile) => (
          <div className={`wireframe-summary-card ${tile.colorClass}`} key={tile.label}>
            <div className="card-header-row">
              <span>{tile.label}</span>
              <span className="tile-icon-wrap">{tile.icon}</span>
            </div>
            <div className="metric-value">{tile.value.toLocaleString()}</div>
            <div className="metric-hint">{tile.hint}</div>
          </div>
        ))}
      </div>

      <div className="wireframe-main-grid">
        <section className="wireframe-panel">
          <header className="wireframe-panel-header">Priority Metrics Overview</header>
          <div className="priority-content">
            <div className="priority-donut-wrap">
              <div className="priority-donut" style={priorityDonutStyle}>
                <div className="donut-label">
                  <div className="donut-main">{totalTickets}</div>
                  <div className="donut-sub">Total Tickets</div>
                </div>
                <span className="donut-badge donut-low">{prioritySplit[1].value}%</span>
                <span className="donut-badge donut-high">{prioritySplit[0].value}%</span>
                <span className="donut-badge donut-medium">{prioritySplit[2].value}%</span>
              </div>
            </div>
            <div className="priority-legend">
              {prioritySplit.map((item) => (
                <div className="legend-item" key={item.label}>
                  <span className={`legend-dot ${item.className}`} />
                  <span>{item.label}</span>
                  <span className="legend-value">{item.count} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="wireframe-panel">
          <header className="wireframe-panel-header">Agent Performance</header>
          <div className="department-table">
            <div className="department-head">
              <span>Agent Name</span>
              <span>Assigned Tickets</span>
              <span>Resolution Rate</span>
              <span>Action</span>
            </div>
            {filteredAgentRows.length > 0 ? (
              filteredAgentRows.map((agent, index) => (
                <div className="department-row" key={`${agent.name}-${index}`}>
                  <div className="department-name">{agent.name}</div>
                  <div className="department-total">{agent.assignedTickets}</div>
                  <div className="progress-wrap">
                    <span className="progress-fill" style={{ width: `${agent.resolutionRate}%` }} />
                    <span className="progress-text">{agent.resolutionRate}%</span>
                  </div>
                  <button
                    type="button"
                    className="view-link"
                    onClick={() => {
                      const query = new URLSearchParams({
                        agentId: agent.agentId ?? "",
                        department: selectedDepartment,
                        name: agent.name,
                        assignedTickets: String(agent.assignedTickets),
                        resolutionRate: String(agent.resolutionRate),
                        designation: (agent as { designation?: string }).designation ?? "Support Executive",
                      });

                      router.push(`/ticketing/agent-performance?${query.toString()}`);
                    }}
                  >
                    View Details
                    <OpenInNewOutlinedIcon className="view-link-icon" />
                  </button>
                </div>
              ))
            ) : (
              <div className="department-row">
                <div className="department-name">No agents found</div>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="wireframe-middle-grid single-panel">
        <section className="wireframe-panel">
          <header className="wireframe-panel-header panel-actions-header">
            <span>Performance Trends</span>
            <label className="year-btn">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  cursor: "pointer",
                  appearance: "none",
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  paddingRight: "14px",
                }}
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <KeyboardArrowDownIcon className="year-btn-icon" />
            </label>
          </header>
          <div className="trends-panel">
            <div className="trends-legend">
              <span className="legend-created">Created</span>
              <span className="legend-resolved">Resolved</span>
            </div>
            <div className="trends-chart">
              {performanceTrend.length > 0 ? (
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%">
                  <polyline
                    points={trendPoints.created}
                    fill="none"
                    stroke="#2f63ff"
                    strokeWidth="1.8"
                    vectorEffect="non-scaling-stroke"
                  />
                  <polyline
                    points={trendPoints.resolved}
                    fill="none"
                    stroke="#dca53d"
                    strokeWidth="1.8"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                  No trend data
                </div>
              )}
            </div>
            <div className="month-axis">
              {performanceTrend.map((item) => (
                <span key={item.date}>{item.date.slice(5)}</span>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="wireframe-bottom-grid">
        <section className="wireframe-panel">
          <header className="wireframe-panel-header">Tickets by Source</header>
          <div className="source-list">
            {sourceBreakdown.map((item, index) => (
              <div className="source-row" key={`${item.source}-${index}`}>
                <span className="source-name">{item.source}</span>
                <div className="source-bar">
                  <span className={`source-fill ${item.colorClass}`} style={{ width: `${item.percent}%` }} />
                </div>
                <span className="source-total">{item.total}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="wireframe-panel">
          <header className="wireframe-panel-header panel-actions-header">
            <span>Tickets</span>
            <div className="panel-actions">
              <button type="button" className="mini-btn" onClick={() => router.push("/ticketing/create")}>
                <AddIcon className="mini-btn-icon" /> Add New Ticket
              </button>
              <button type="button" className="text-btn" onClick={() => router.push("/ticketing/inbox")}>View All</button>
            </div>
          </header>
          <div className="tickets-table-wrap">
            <table className="tickets-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned to</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {ticketRows.length > 0 ? (
                  ticketRows.map((row, idx) => (
                    <tr key={`${row.id}-${idx}`}>
                      <td>{row.id}</td>
                      <td>{row.priority}</td>
                      <td>
                        <span className={`status-pill ${row.statusClass}`}>{row.status}</span>
                      </td>
                      <td>{row.assignedTo}</td>
                      <td>{row.dueDate}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>No tickets found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
