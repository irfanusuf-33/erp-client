"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import HexagonOutlinedIcon from "@mui/icons-material/HexagonOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import type { OverviewStatsType, RecentTicketType } from "../../../types/ticketing.types";
import { useGlobalStore } from "@/store";
import { toast } from "sonner";

const EMPTY_OVERVIEW: OverviewStatsType = {
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

type SummaryItem = {
  count: number;
  info: string;
};

type DashboardResponseData = {
  summary: {
    totalTickets: SummaryItem;
    overdueTickets: SummaryItem;
    dueTodayTickets: SummaryItem;
    openTickets: SummaryItem;
    onHoldTickets: SummaryItem;
    unassignedTickets: SummaryItem;
  };
  departmentPerformance: Array<{
    departmentName: string;
    assignedTickets: number;
    resolvedOnTime: number;
    resolvedLate: number;
    resolutionRate: number;
  }>;
  lastFiveTickets: RecentTicketType[];
  performanceTrend: Array<{ date: string; totalCreated: number; totalResolved: number }>;
  sourceBreakdown: { instagram: number; whatsapp: number; facebook: number };
  closedTickets?: number;
  totalHighPriorityTickets?: number;
  totalMediumPriorityTickets?: number;
  totalLowPriorityTickets?: number;
};

const TicketingOverview = () => {
  const router = useRouter();

  const {
    user,
    fetchTicketingDepartments,
    fetchTicketingAdminDashboard,
  } = useGlobalStore();

  const [loading, setLoading] = useState(true);
  const [overviewStats, setOverviewStats] = useState<OverviewStatsType>(EMPTY_OVERVIEW);
  const [recentTickets, setRecentTickets] = useState<RecentTicketType[]>([]);
  const [isDepartmentMenuOpen, setIsDepartmentMenuOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
  const [departmentSearch, setDepartmentSearch] = useState("");

  const [summaryInfo, setSummaryInfo] = useState({
    totalTickets: "",
    overdueTickets: "",
    dueTodayTickets: "",
    openTickets: "",
    onHoldTickets: "",
    unassignedTickets: "",
  });

  const [dueTodayCount, setDueTodayCount] = useState(0);
  const [departmentPerformanceRows, setDepartmentPerformanceRows] = useState<any[]>([]);
  const [performanceTrend, setPerformanceTrend] = useState<any[]>([]);
  const [sourceBreakdownData, setSourceBreakdownData] = useState({
    instagram: 0,
    whatsapp: 0,
    facebook: 0,
  });

  /** ------------------ AUTH CHECK ------------------ */
  const policyList = Array.isArray(user?.policies) ? user.policies : [];
  const isSuperAdmin = ["ticketingFullAccess", "ticketingRootAccess", "rootAccess"].some((p) =>
    policyList.includes(p)
  );

  const filteredDepartmentOptions = departmentOptions.filter((department) =>
    department.toLowerCase().includes(departmentSearch.trim().toLowerCase()),
  );
  const hasDepartmentSelected = Boolean(selectedDepartment);
  const filteredDepartmentRows = hasDepartmentSelected
    ? departmentPerformanceRows.filter(
      (department) => department.name.toLowerCase() === String(selectedDepartment).toLowerCase(),
    )
    : departmentPerformanceRows;

  useEffect(() => {
    if (!isSuperAdmin) {
      router.replace("/ticketing/department");
    }
  }, [isSuperAdmin, router]);

  /** ------------------ LOAD DEPARTMENTS ------------------ */
  useEffect(() => {
    const loadDepartments = async () => {
      const res = await fetchTicketingDepartments();
      if (res?.success) {
        setDepartmentOptions(res.data ?? []);
      }
    };
    loadDepartments();
  }, [fetchTicketingDepartments]);

  /** ------------------ LOAD DASHBOARD ------------------ */
  useEffect(() => {
    const loadOverview = async () => {
      setLoading(true);
      try {
        const res: any = await fetchTicketingAdminDashboard(selectedYear);

        if (res?.success) {
          const data = res.data as DashboardResponseData;

          setOverviewStats({
            totalTickets: data.summary.totalTickets.count,
            overDueTickets: data.summary.overdueTickets.count,
            openTickets: data.summary.openTickets.count,
            onHoldTickets: data.summary.onHoldTickets.count,
            closedTickets: data.closedTickets ?? 0,
            unassignedTickets: data.summary.unassignedTickets.count,
            totalHighPriorityTickets: data.totalHighPriorityTickets ?? 0,
            totalMediumPriorityTickets: data.totalMediumPriorityTickets ?? 0,
            totalLowPriorityTickets: data.totalLowPriorityTickets ?? 0,
          });

          setSummaryInfo({
            totalTickets: data.summary.totalTickets.info,
            overdueTickets: data.summary.overdueTickets.info,
            dueTodayTickets: data.summary.dueTodayTickets.info,
            openTickets: data.summary.openTickets.info,
            onHoldTickets: data.summary.onHoldTickets.info,
            unassignedTickets: data.summary.unassignedTickets.info,
          });

          setDueTodayCount(data.summary.dueTodayTickets.count);
          setRecentTickets(data.lastFiveTickets ?? []);
          setDepartmentPerformanceRows(data.departmentPerformance ?? []);
          setPerformanceTrend(data.performanceTrend ?? []);
          setSourceBreakdownData(data.sourceBreakdown ?? { instagram: 0, whatsapp: 0, facebook: 0 });
        } else {
          toast.error("Failed to load ticket overview");
        }
      } catch {
        toast.error("Unable to load ticket overview");
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, [selectedYear, fetchTicketingAdminDashboard]);

const summaryTiles = [
  {
    label: "All Tickets",
    value: overviewStats.totalTickets,
    hint: summaryInfo.totalTickets,
    icon: <ConfirmationNumberOutlinedIcon />,
    colorClass: "summary-blue",
  },
  {
    label: "Overdue Tickets",
    value: overviewStats.overDueTickets,
    hint: summaryInfo.overdueTickets,
    icon: <WarningAmberOutlinedIcon />,
    colorClass: "summary-red",
  },
  {
    label: "Tickets Due Today",
    value: dueTodayCount,
    hint: summaryInfo.dueTodayTickets,
    icon: <CheckCircleOutlineOutlinedIcon />,
    colorClass: "summary-green",
  },
  {
    label: "Open Tickets",
    value: overviewStats.openTickets,
    hint: summaryInfo.openTickets,
    icon: <MarkEmailUnreadOutlinedIcon />,
    colorClass: "summary-blue",
  },
  {
    label: "Tickets on Hold",
    value: overviewStats.onHoldTickets,
    hint: summaryInfo.onHoldTickets,
    icon: <PendingActionsOutlinedIcon />,
    colorClass: "summary-amber",
  },
  {
    label: "Unassigned Tickets",
    value: overviewStats.unassignedTickets,
    hint: summaryInfo.unassignedTickets,
    icon: <PersonOffOutlinedIcon />,
    colorClass: "summary-yellow",
  },
];

  const ticketRows = recentTickets.map((t) => ({
    id: t.ticketId ? `#${t.ticketId}` : "#-",
    priority: t.priority ?? "Low",
    status: t.status ?? "Open",
    assignedTo: t.lastAgentDetail?.email ?? "Unassigned",
    dueDate: t.dueDate ?? "-",
  }));

  const priorityCounts = recentTickets.reduce(
    (acc, ticket) => {
      const priority = String(ticket.priority ?? "").toLowerCase();
      if (priority === "high") {
        acc.high += 1;
      } else if (priority === "medium") {
        acc.medium += 1;
      } else if (priority === "low") {
        acc.low += 1;
      }
      return acc;
    },
    { high: 0, medium: 0, low: 0 },
  );
  const priorityTotal = priorityCounts.high + priorityCounts.medium + priorityCounts.low;
  const priorityTotalTickets = priorityTotal;
  const highPriorityPercent = priorityTotal > 0 ? Math.round((priorityCounts.high / priorityTotal) * 100) : 0;
  const mediumPriorityPercent = priorityTotal > 0 ? Math.round((priorityCounts.medium / priorityTotal) * 100) : 0;
  const lowPriorityPercent = priorityTotal > 0 ? Math.max(0, 100 - highPriorityPercent - mediumPriorityPercent) : 0;
  const highSliceEnd = highPriorityPercent;
  const mediumSliceEnd = highPriorityPercent + mediumPriorityPercent;
  const priorityDonutStyle = {
    background: `conic-gradient(#f44747 0 ${highSliceEnd}%, #dca53d ${highSliceEnd}% ${mediumSliceEnd}%, #3fa652 ${mediumSliceEnd}% 100%)`,
  };

  const prioritySplit = [
    {
      label: "High",
      count: priorityCounts.high,
      value: highPriorityPercent,
      className: "legend-high",
    },
    {
      label: "Low",
      count: priorityCounts.low,
      value: lowPriorityPercent,
      className: "legend-low",
    },
    {
      label: "Medium",
      count: priorityCounts.medium,
      value: mediumPriorityPercent,
      className: "legend-medium",
    },
  ];

  /** ------------------ UI ------------------ */
  return (
    <div className="p-6 space-y-6">

      {/* FILTER */}
      <div className="relative w-[260px]">
        <button
          onClick={() => setIsDepartmentMenuOpen((p) => !p)}
          className="w-full flex items-center justify-between gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm"
        >
          <div className="flex items-center gap-2">
            <HexagonOutlinedIcon className="text-gray-400" />
            <span>{selectedDepartment ?? "Select Department"}</span>
          </div>
          <KeyboardArrowDownIcon />
        </button>

        {isDepartmentMenuOpen && (
          <div className="absolute mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
            <div className="p-2">
              <input
                type="text"
                placeholder="Search..."
                value={departmentSearch}
                onChange={(e) => setDepartmentSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
              />
            </div>

            <div className="max-h-48 overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedDepartment(null);
                  setIsDepartmentMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
              >
                All Departments
              </button>

              {departmentOptions.map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setSelectedDepartment(d);
                    setIsDepartmentMenuOpen(false);
                    router.push(`/ticketing/department?department=${encodeURIComponent(d)}`);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                >
                  {d}
                </button>
              ))}

              {departmentOptions.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-400">
                  No departments found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SUMMARY */}
<div className="grid gap-[0.5rem] grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-[0.5rem]">
  {summaryTiles.map((tile) => {
    const borderColor =
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
        : "border-l-[#5bc7ca]";

    const iconStyle =
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
        : "bg-[rgba(91,199,202,0.15)] text-[#5bc7ca]";

    return (
      <div
        key={tile.label}
        className={`border border-[#d1d5db] border-l-[0.25rem] rounded-[0.5rem] px-[0.75rem] py-[0.625rem] min-h-[6.875rem] bg-white ${borderColor}`}
      >
        <div className="flex items-center justify-between text-[#929292] text-[0.875rem]">
          <span>{tile.label}</span>

          <span
            className={`w-[1.375rem] h-[1.375rem] rounded-full flex items-center justify-center ${iconStyle}`}
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
    );
  })}
</div>

      {/* MAIN GRID */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* PRIORITY */}
        <section className="border border-[#d1d5db] rounded-[0.5rem] bg-white overflow-hidden">
          <header className="h-[2.75rem] border-b border-[#d1d5db] px-[0.875rem] flex items-center text-[1.25rem] font-medium text-[#0F141A]">
            Priority Metrics Overview
          </header>

          <div className="p-[0.875rem] flex items-center justify-center gap-[1.375rem] min-h-[17.5rem]">

            {/* DONUT */}
            <div className="relative w-[11.625rem] h-[11.625rem]">
              <div
                className="w-full h-full rounded-full relative"
                style={priorityDonutStyle}
              >
                {/* inner white circle */}
                <div className="absolute w-[6.875rem] h-[6.875rem] rounded-full bg-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

                {/* center text */}
                <div className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="text-[1.875rem] font-medium text-[#0F141A] leading-none">
                    {prioritySplit.reduce((a, b) => a + b.count, 0)}
                  </div>
                  <div className="text-[0.8125rem] text-[#424650] mt-[0.25rem]">
                    Total Tickets
                  </div>
                </div>

                {/* percentage badges */}
                {prioritySplit[0] && (
                  <span className="absolute w-[2.25rem] h-[2.25rem] rounded-full border border-[#d1d5db] bg-white text-[#424650] text-[0.625rem] flex items-center justify-center top-[-0.5rem] left-1/2 -translate-x-1/2">
                    {prioritySplit[0].value}%
                  </span>
                )}

                {prioritySplit[1] && (
                  <span className="absolute w-[2.25rem] h-[2.25rem] rounded-full border border-[#d1d5db] bg-white text-[#424650] text-[0.625rem] flex items-center justify-center right-[-0.75rem] top-[6.125rem]">
                    {prioritySplit[1].value}%
                  </span>
                )}

                {prioritySplit[2] && (
                  <span className="absolute w-[2.25rem] h-[2.25rem] rounded-full border border-[#d1d5db] bg-white text-[#424650] text-[0.625rem] flex items-center justify-center left-[-0.75rem] top-[6.125rem]">
                    {prioritySplit[2].value}%
                  </span>
                )}
              </div>
            </div>

            {/* LEGEND */}
            <div className="flex flex-col gap-[0.875rem] w-full max-w-[12rem]">
              {prioritySplit.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-[0.5rem] text-[0.875rem] text-[#0F141A]"
                >
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

        {/* DEPARTMENT */}
        <div className="border border-gray-300 rounded-lg bg-white">
          <div className="border-b px-4 py-2 font-semibold">
            Department Performance
          </div>

          <div className="p-4 space-y-3">
            {filteredDepartmentRows.length > 0 ? (
              filteredDepartmentRows.map((d) => (
                <div key={d.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{d.name}</span>
                    <span>{d.assignedTickets}</span>
                  </div>

                  <div className="w-full h-2 bg-gray-200 rounded">
                    <div
                      className="h-full bg-blue-500 rounded"
                      style={{ width: `${d.resolutionRate}%` }}
                    />
                  </div>

                  <button
                    onClick={() =>
                      router.push(`/ticketing/department?department=${encodeURIComponent(d.name)}`)
                    }
                    className="text-xs text-blue-500 flex items-center gap-1"
                  >
                    View Details <OpenInNewOutlinedIcon fontSize="small" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-400">
                No departments found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TICKETS */}
      <div className="border border-gray-300 rounded-lg bg-white">
        <div className="flex justify-between items-center border-b px-4 py-2">
          <span className="font-semibold">Tickets</span>

          <div className="flex gap-2">
            <button
              onClick={() => router.push("/ticketing/create")}
              className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
            >
              <AddIcon fontSize="small" /> Add
            </button>

            <button
              onClick={() => router.push("/ticketing/inbox")}
              className="text-sm text-blue-500"
            >
              View All
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Ticket ID</th>
                <th className="p-2">Priority</th>
                <th className="p-2">Status</th>
                <th className="p-2">Assigned</th>
                <th className="p-2">Due</th>
              </tr>
            </thead>

            <tbody>
              {ticketRows.length > 0 ? (
                ticketRows.map((row, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">{row.id}</td>
                    <td className="p-2">{row.priority}</td>
                    <td className="p-2">{row.status}</td>
                    <td className="p-2">{row.assignedTo}</td>
                    <td className="p-2">{row.dueDate}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-3 text-center text-gray-400">
                    No tickets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TicketingOverview;