import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";

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

  /** ------------------ HELPERS ------------------ */
  const yearOptions = useMemo(() => {
    const y = new Date().getFullYear();
    return [y, y - 1, y - 2, y - 3];
  }, []);

  const summaryTiles = [
    { label: "All Tickets", value: overviewStats.totalTickets, hint: summaryInfo.totalTickets, icon: <ConfirmationNumberOutlinedIcon /> },
    { label: "Overdue Tickets", value: overviewStats.overDueTickets, hint: summaryInfo.overdueTickets, icon: <WarningAmberOutlinedIcon /> },
    { label: "Tickets Due Today", value: dueTodayCount, hint: summaryInfo.dueTodayTickets, icon: <CheckCircleOutlineOutlinedIcon /> },
    { label: "Open Tickets", value: overviewStats.openTickets, hint: summaryInfo.openTickets, icon: <MarkEmailUnreadOutlinedIcon /> },
    { label: "Tickets on Hold", value: overviewStats.onHoldTickets, hint: summaryInfo.onHoldTickets, icon: <PendingActionsOutlinedIcon /> },
    { label: "Unassigned Tickets", value: overviewStats.unassignedTickets, hint: summaryInfo.unassignedTickets, icon: <PersonOffOutlinedIcon /> },
  ];

  const ticketRows = recentTickets.map((t) => ({
    id: t.ticketId ? `#${t.ticketId}` : "#-",
    priority: t.priority ?? "Low",
    status: t.status ?? "Open",
    assignedTo: t.lastAgentDetail?.email ?? "Unassigned",
    dueDate: t.dueDate ?? "-",
  }));

  /** ------------------ UI ------------------ */
  return (
    <div className="ticketing-wireframe">
      
      {/* FILTER */}
      <div>
        <button onClick={() => setIsDepartmentMenuOpen((p) => !p)}>
          {selectedDepartment ?? "Select Department"}
        </button>

        {isDepartmentMenuOpen &&
          departmentOptions.map((d) => (
            <div
              key={d}
              onClick={() => {
                setSelectedDepartment(d);
                router.push(`/ticketing/department?department=${encodeURIComponent(d)}`);
              }}
            >
              {d}
            </div>
          ))}
      </div>

      {/* SUMMARY */}
      <div>
        {summaryTiles.map((tile) => (
          <div key={tile.label}>
            <div>{tile.label}</div>
            <div>{tile.value}</div>
            <div>{tile.hint}</div>
          </div>
        ))}
      </div>

      {/* TICKETS */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Assigned</th>
            <th>Due</th>
          </tr>
        </thead>
        <tbody>
          {ticketRows.map((row, i) => (
            <tr key={i}>
              <td>{row.id}</td>
              <td>{row.priority}</td>
              <td>{row.status}</td>
              <td>{row.assignedTo}</td>
              <td>{row.dueDate}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ACTIONS */}
      <button onClick={() => router.push("/ticketing/create")}>
        <AddIcon /> Create Ticket
      </button>

      <button onClick={() => router.push("/ticketing/inbox")}>
        View All
      </button>
    </div>
  );
};

export default TicketingOverview;