"use client";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CircleIcon from "@mui/icons-material/Circle";
import { useEffect, useMemo, useState } from "react";
import { useGlobalStore } from "@/store";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function AgentPerformanceDetails() {
  const searchParams = useSearchParams();
  const { user, fetchTicketingAgentDashboard } = useGlobalStore();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const rawUser = (user || {}) as Record<string, any>;
  const policyList = Array.isArray(rawUser.policies) ? rawUser.policies : [];

  const hasPolicy = (policyKey: string) =>
    policyList.some((policy: any) => {
      if (typeof policy === "string") return policy.trim() === policyKey;
      if (policy && typeof policy === "object") {
        const policyName = String(policy.name || policy.label || policy.policy || "").trim();
        return policyName === policyKey;
      }
      return false;
    });

  const isAgent = hasPolicy("ticketingReadWrite");

  const agentId =
    (searchParams.get("agentId") || "").trim() ||
    (isAgent ? rawUser.agentId || rawUser.id : "");

  const department =
    (searchParams.get("department") || "").trim() ||
    (isAgent ? rawUser.department || rawUser.departmentName : "");

  // ✅ FIXED: replaced location.state with query params
  const agentState = {
    agentId: searchParams.get("agentId") || "",
    department: searchParams.get("department") || "",
    name: searchParams.get("name") || "",
    assignedTickets: Number(searchParams.get("assignedTickets") || 0),
    resolutionRate: Number(searchParams.get("resolutionRate") || 0),
    designation: searchParams.get("designation") || "Support Executive",
  };

  useEffect(() => {
    const loadAgentDashboard = async () => {
      if (!agentId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const res = await fetchTicketingAgentDashboard(agentId);

      if (res.success) {
        setDashboardData(res.data || {});
      } else {
        toast.error(res.msg || "Failed to fetch agent dashboard");
      }

      setLoading(false);
    };

    loadAgentDashboard();
  }, [agentId]);

  const summary = dashboardData?.summary || {};
  const recentTickets = Array.isArray(dashboardData?.lastFiveTickets)
    ? dashboardData.lastFiveTickets
    : [];
  const performanceTrend = Array.isArray(dashboardData?.performanceTrend)
    ? dashboardData.performanceTrend
    : [];

  const apiAgentProfile =
    dashboardData?.agent || dashboardData?.agentDetails || null;

  const displayName =
    agentState?.name ||
    apiAgentProfile?.name ||
    dashboardData?.agentName ||
    user?.username;

  const displayDesignation =
    agentState?.designation ||
    apiAgentProfile?.designation ||
    "Support Executive";

  const displayEmployeeId =
    agentState?.agentId ||
    apiAgentProfile?.agentId ||
    dashboardData?.agentId ||
    agentId ||
    "-";

  const kpiCards = [
    {
      title: "Tickets Assigned",
      value: String(
        dashboardData?.assignedTotalTickets ??
          agentState?.assignedTickets ??
          summary?.totalTickets?.count ??
          0
      ),
      sub: summary?.totalTickets?.info || "",
      subClass: "apd-kpi-positive",
    },
    {
      title: "Tickets Overdue",
      value: String(
        dashboardData?.overdueTickets ??
          summary?.overdueTickets?.count ??
          0
      ),
      sub: "SLA Risk",
      subClass: "apd-kpi-warning",
    },
    {
      title: "Tickets Resolved",
      value: String(dashboardData?.resolvedTickets ?? 0),
      sub: `${
        Number(
          dashboardData?.resolutionRate ??
            agentState?.resolutionRate ??
            0
        )
      }% Resolution Rate`,
      subClass: "apd-kpi-info",
    },
    {
      title: "Open Tickets",
      value: String(summary?.openTickets?.count ?? 0),
      sub: "Active Tickets",
      subClass: "apd-kpi-info",
    },
    {
      title: "Avg SLA",
      value: `${Number(dashboardData?.avgSlaHours ?? 0)}h`,
      sub: "Average SLA Hours",
      subClass: "apd-kpi-muted",
    },
    {
      title: "SLA Compliance",
      value: `${Number(dashboardData?.slaCompliance ?? 0)}%`,
      sub: "Current Period",
      subClass: "apd-kpi-muted",
    },
  ];

  const trendPoints = useMemo(() => {
    if (performanceTrend.length === 0) {
      return { created: "", resolved: "" };
    }

    const maxValue = Math.max(
      ...performanceTrend.map((item: any) =>
        Math.max(
          Number(item.totalCreated || 0),
          Number(item.totalResolved || 0)
        )
      ),
      1
    );

    const buildPoints = (key: "totalCreated" | "totalResolved") =>
      performanceTrend
        .map((item: any, idx: number) => {
          const x =
            performanceTrend.length === 1
              ? 50
              : (idx / (performanceTrend.length - 1)) * 100;
          const y =
            100 -
            (Number(item[key] || 0) / maxValue) * 100;
          return `${x},${y}`;
        })
        .join(" ");

    return {
      created: buildPoints("totalCreated"),
      resolved: buildPoints("totalResolved"),
    };
  }, [performanceTrend]);

  const priorityCounts = recentTickets.reduce(
    (acc: any, ticket: any) => {
      const priority = String(ticket?.priority || "").toLowerCase();
      if (priority === "high") acc.high += 1;
      if (priority === "medium") acc.medium += 1;
      if (priority === "low") acc.low += 1;
      return acc;
    },
    { high: 0, medium: 0, low: 0 }
  );

  const priorityTotal =
    priorityCounts.high + priorityCounts.medium + priorityCounts.low || 1;

  const highPct = Math.round((priorityCounts.high / priorityTotal) * 100);
  const mediumPct = Math.round(
    (priorityCounts.medium / priorityTotal) * 100
  );
  const lowPct = Math.max(0, 100 - highPct - mediumPct);

  const statusCounts = recentTickets.reduce(
    (acc: any, ticket: any) => {
      const status = String(ticket?.status || "").toLowerCase();
      if (status.includes("open")) acc.open += 1;
      else if (status.includes("closed")) acc.closed += 1;
      else acc.pending += 1;
      return acc;
    },
    { open: 0, pending: 0, closed: 0 }
  );

  if (!agentId) {
    return (
      <div className="agent-performance-page">
        Agent ID missing in route.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="agent-performance-page">
        <div className="w-full py-10 flex justify-center">
          <span className="loading loading-spinner loading-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="agent-performance-page">
      <div className="apd-top-row">
        <button type="button" className="apd-dept-btn" disabled>
          {department ||
            agentState?.department ||
            dashboardData?.department ||
            "Department"}
        </button>
      </div>

      <section className="apd-profile-card">
        <div className="apd-avatar" />
        <div>
          <h3>{displayName}</h3>
          <p>{displayDesignation}</p>
          <p>Employee ID: {displayEmployeeId}</p>
        </div>
        <span className="apd-availability">
          <CircleIcon className="apd-availability-dot" />
          {apiAgentProfile?.status ||
            (agentState as any)?.status ||
            "Available"}
        </span>
      </section>

      <section className="apd-kpi-grid">
        {kpiCards.map((card) => (
          <div key={card.title} className="apd-kpi-card">
            <p className="apd-kpi-title">{card.title}</p>
            <p className="apd-kpi-value">{card.value}</p>
            <p className={`apd-kpi-sub ${card.subClass}`}>
              {card.sub}
            </p>
          </div>
        ))}
      </section>

      {/* Rest unchanged */}
    </div>
  );
}