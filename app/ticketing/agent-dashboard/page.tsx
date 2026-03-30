"use client";

import { redirect } from "next/navigation";
import { useGlobalStore } from "@/store";
import AgentPerformanceDetails from "../agent-performance/page";

export default function AgentDashboardWrapper() {
  const { user } = useGlobalStore();

  const rawUser = (user || {}) as Record<string, any>;
  const policyList = Array.isArray(rawUser.policies) ? rawUser.policies : [];

  const hasPolicy = (policyKey: string) =>
    policyList.some((policy: any) => {
      if (typeof policy === "string") return policy.trim() === policyKey;

      if (policy && typeof policy === "object") {
        const name = String(
          policy.name || policy.label || policy.policy || ""
        ).trim();
        return name === policyKey;
      }

      return false;
    });

  const isSuperAdmin =
    hasPolicy("ticketingFullAccess") ||
    hasPolicy("ticketingRootAccess") ||
    hasPolicy("rootAccess");

  const isAdmin = hasPolicy("ticketingDeptAccess");

  const isAgent =
    hasPolicy("ticketingReadWrite") ||
    hasPolicy("ticketingReadWriteAccess");

  if (!isAgent && !isAdmin && !isSuperAdmin) {
    redirect("/ticketing/inbox");
  }

  return <AgentPerformanceDetails />;
}