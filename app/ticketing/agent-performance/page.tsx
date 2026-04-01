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
      <div className="p-[1.125rem] bg-[#f3f5f8] min-h-full">
        Agent ID missing in route.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-[1.125rem] bg-[#f3f5f8] min-h-full">
        <div className="w-full py-10 flex justify-center">
          <span className="loading loading-spinner loading-lg" />
        </div>
      </div>
    );
  }

  return (
<div className="p-[1.125rem] bg-[#f3f5f8] min-h-full">
  <div className="mb-[0.75rem]">
    <button
      type="button"
      disabled
      className="h-[2.125rem] border border-[#d8dce6] rounded-[0.5rem] bg-white text-[#2a2f39] text-[0.8125rem] px-[0.625rem] inline-flex items-center gap-[0.375rem]"
    >
      {department ||
        agentState?.department ||
        dashboardData?.department ||
        "Department"}
    </button>
  </div>

  <section className="bg-white border border-[#e5e8ef] rounded-[0.625rem] px-[0.875rem] py-[0.75rem] flex items-center gap-[0.75rem] mb-[0.75rem]">
    <div className="w-[2.125rem] h-[2.125rem] rounded-full bg-[linear-gradient(135deg,#8f9ab8,#c8d0e3)]" />

    <div>
      <h3 className="m-0 text-[0.875rem] font-semibold text-[#202430]">
        {displayName}
      </h3>
      <p className="m-0 text-[0.6875rem] text-[#7a8191]">
        {displayDesignation}
      </p>
      <p className="m-0 text-[0.6875rem] text-[#7a8191]">
        Employee ID: {displayEmployeeId}
      </p>
    </div>

    <span className="ml-auto rounded-[6.25rem] bg-[#e9f7ec] text-[#2e9b4f] px-[0.75rem] py-[0.375rem] text-[0.75rem] inline-flex items-center gap-[0.375rem]">
      <CircleIcon className="text-[#2e9b4f]" />
      {apiAgentProfile?.status ||
        (agentState as any)?.status ||
        "Available"}
    </span>
  </section>

  <section className="grid gap-[0.625rem] grid-cols-1 md:grid-cols-3 xl:grid-cols-6 mb-[0.75rem]">
    {kpiCards.map((card) => (
      <div
        key={card.title}
        className="bg-white border border-[#e5e8ef] rounded-[0.625rem] p-[0.625rem] min-h-[5.5rem]"
      >
        <p className="m-0 text-[0.75rem] text-[#697287]">
          {card.title}
        </p>

        <p className="mt-[0.25rem] mb-[0.25rem] text-[1.1875rem] font-semibold text-[#1f2430]">
          {card.value}
        </p>

        <p
          className={`m-0 text-[0.6875rem] ${
            card.subClass === "apd-kpi-positive"
              ? "text-[#3b7ef6]"
              : card.subClass === "apd-kpi-warning"
              ? "text-[#eb5757]"
              : card.subClass === "apd-kpi-info"
              ? "text-[#2f80ed]"
              : "text-[#788296]"
          }`}
        >
          {card.sub}
        </p>
      </div>
    ))}

   </section>
   <section className="grid gap-[0.75rem] grid-cols-1 mb-[0.75rem]">
  <div className="bg-white border border-[#e5e8ef] rounded-[0.625rem] p-[0.75rem]">
    <div className="flex items-center justify-between mb-[0.5rem]">
      <h4 className="m-0 mb-[0.625rem] text-[1rem] text-[#202430] font-semibold">
        Performance Trends
      </h4>

      <button
        type="button"
        disabled
        className="h-[2.125rem] border border-[#d8dce6] rounded-[0.5rem] bg-white text-[#2a2f39] text-[0.8125rem] px-[0.625rem] inline-flex items-center gap-[0.375rem]"
      >
        Current Data
        <KeyboardArrowDownIcon fontSize="small" />
      </button>
    </div>

    <div className="flex items-center gap-[0.75rem] text-[0.75rem] text-[#2a2f39]">
      <span className="flex items-center gap-[0.375rem]">
        <CircleIcon className="text-[#2f63ff]" /> Created
      </span>
      <span className="flex items-center gap-[0.375rem]">
        <CircleIcon className="text-[#dca53d]" /> Resolved
      </span>
    </div>

    <div className="mt-[0.625rem] h-[11.25rem] rounded-[0.5rem] border border-[#e8ebf2] relative overflow-hidden bg-[linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:2.5rem_1.875rem] bg-white">
      {performanceTrend.length > 0 && (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%">
          <polyline points={trendPoints.created} fill="none" stroke="#2f63ff" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
          <polyline points={trendPoints.resolved} fill="none" stroke="#dca53d" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
        </svg>
      )}
    </div>
  </div>
</section>

<section className="grid gap-[0.75rem] grid-cols-1 lg:grid-cols-2 mb-[0.75rem]">
  <div className="bg-white border border-[#e5e8ef] rounded-[0.625rem] p-[0.75rem]">
    <h4 className="m-0 mb-[0.625rem] text-[1rem] text-[#202430] font-semibold">
      Priority Metrics Overview
    </h4>

    <div className="flex items-center justify-between gap-[1.125rem]">
      <div className="w-[9.375rem] h-[9.375rem] rounded-full grid place-items-center bg-[conic-gradient(#ef4b4b_0_30%,#3ea45c_30%_50%,#e1a13a_50%_100%)]">
        <div className="w-[6.25rem] h-[6.25rem] rounded-full bg-white grid place-items-center text-center">
          <div>
            <strong className="text-[1.5rem] text-[#202430] leading-none">
              {recentTickets.length}
            </strong>
            <p className="text-[0.75rem] m-0">Total Tickets</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-[0.375rem] text-[0.75rem]">
        <span className="flex items-center gap-[0.375rem]">
          <CircleIcon className="text-[#ef4b4b]" /> High ({highPct}%)
        </span>
        <span className="flex items-center gap-[0.375rem]">
          <CircleIcon className="text-[#3ea45c]" /> Low ({lowPct}%)
        </span>
        <span className="flex items-center gap-[0.375rem]">
          <CircleIcon className="text-[#e1a13a]" /> Medium ({mediumPct}%)
        </span>
      </div>
    </div>
  </div>

  <div className="bg-white border border-[#e5e8ef] rounded-[0.625rem] p-[0.75rem]">
    <h4 className="m-0 mb-[0.625rem] text-[1rem] text-[#202430] font-semibold">
      Ticket Status Breakdown
    </h4>

    <div className="flex justify-between text-[0.75rem] mb-[0.25rem]">
      <span>Open</span>
      <span>{statusCounts.open}</span>
    </div>
    <div className="h-[0.5rem] bg-[#e8ebf2] rounded-[0.5rem] overflow-hidden mb-[0.5rem]">
      <span
        className="block h-full bg-[#42a95f]"
        style={{ width: `${(statusCounts.open / (recentTickets.length || 1)) * 100}%` }}
      />
    </div>

    <div className="flex justify-between text-[0.75rem] mb-[0.25rem]">
      <span>Pending</span>
      <span>{statusCounts.pending}</span>
    </div>
    <div className="h-[0.5rem] bg-[#e8ebf2] rounded-[0.5rem] overflow-hidden mb-[0.5rem]">
      <span
        className="block h-full bg-[#e1a13a]"
        style={{ width: `${(statusCounts.pending / (recentTickets.length || 1)) * 100}%` }}
      />
    </div>

    <div className="flex justify-between text-[0.75rem] mb-[0.25rem]">
      <span>Closed</span>
      <span>{statusCounts.closed}</span>
    </div>
    <div className="h-[0.5rem] bg-[#e8ebf2] rounded-[0.5rem] overflow-hidden mb-[0.5rem]">
      <span
        className="block h-full bg-[#ef4b4b]"
        style={{ width: `${(statusCounts.closed / (recentTickets.length || 1)) * 100}%` }}
      />
    </div>
  </div>
</section>

<section className="bg-white border border-[#e5e8ef] rounded-[0.625rem] p-[0.75rem]">
  <h4 className="m-0 mb-[0.625rem] text-[1rem] text-[#202430] font-semibold">
    Recent Tickets
  </h4>

  <table className="w-full border-collapse">
    <thead>
      <tr>
        {["Ticket ID", "Priority", "Status", "Due Date"].map((h) => (
          <th
            key={h}
            className="text-left text-[0.75rem] text-[#2a2f39] border-b border-[#edf0f5] px-[0.5rem] py-[0.625rem]"
          >
            {h}
          </th>
        ))}
      </tr>
    </thead>

    <tbody>
      {recentTickets.length > 0 ? (
        recentTickets.map((ticket: any, idx: number) => {
          const normalizedStatus =
            ticket?.status === "onHold"
              ? "Pending"
              : ticket?.status || "Pending";

          const statusClass =
            normalizedStatus === "Open"
              ? "bg-[#e9f7ec] text-[#42a95f]"
              : normalizedStatus === "Closed"
              ? "bg-[#fdecec] text-[#ef4b4b]"
              : "bg-[#fff4e5] text-[#e1a13a]";

          return (
            <tr key={`${ticket?.ticketId || idx}-${idx}`}>
              <td className="text-[0.75rem] text-[#2a2f39] border-b border-[#edf0f5] px-[0.5rem] py-[0.625rem]">
                {ticket?.ticketId ? `#${ticket.ticketId}` : "#-"}
              </td>

              <td className="text-[0.75rem] text-[#2a2f39] border-b border-[#edf0f5] px-[0.5rem] py-[0.625rem]">
                {ticket?.priority || "-"}
              </td>

              <td className="border-b border-[#edf0f5] px-[0.5rem] py-[0.625rem]">
                <span className={`px-[0.5rem] py-[0.25rem] rounded-full text-[0.6875rem] ${statusClass}`}>
                  {normalizedStatus}
                </span>
              </td>

              <td className="text-[0.75rem] text-[#2a2f39] border-b border-[#edf0f5] px-[0.5rem] py-[0.625rem]">
                {ticket?.dueDate
                  ? new Date(ticket.dueDate)
                      .toLocaleDateString("en-GB")
                      .replace(/\//g, "-")
                  : "-"}
              </td>
            </tr>
          );
        })
      ) : (
        <tr>
          <td
            colSpan={4}
            className="text-center text-[0.75rem] text-[#2a2f39] py-[0.625rem]"
          >
            No recent tickets found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</section>
</div>
  );
}