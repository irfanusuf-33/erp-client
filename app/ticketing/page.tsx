'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobalStore } from "@/store";

export default function TicketingDashboardEntry() {
  const router = useRouter();

  const { user, fetchTicketingDepartments } = useGlobalStore();

  const rawUser = (user || {}) as Record<string, any>;
  const policyList = Array.isArray(rawUser.policies) ? rawUser.policies : [];

  const hasPolicy = (policyKey: string) =>
    policyList.some((policy: any) => {
      if (typeof policy === "string") {
        return policy.trim() === policyKey;
      }
      if (policy && typeof policy === "object") {
        const policyName = String(
          policy.name || policy.label || policy.policy || ""
        ).trim();
        return policyName === policyKey;
      }
      return false;
    });

  const isSuperAdmin = hasPolicy("ticketingFullAccess");
  const isAdmin = hasPolicy("ticketingDeptAccess");
  const isAgent =
    hasPolicy("ticketingReadWrite") || hasPolicy("ticketingReadWriteAccess");
  const isRootAccess = hasPolicy("rootAccess");

  const [checkingAccess, setCheckingAccess] = useState(true);
  const [isPrimaryDeptAdmin, setIsPrimaryDeptAdmin] = useState(false);

  const userDepartment = (
    rawUser.department ||
    rawUser.departmentName ||
    rawUser.dept ||
    rawUser?.organizationalDetails?.departmentName ||
    ""
  )
    .toString()
    .trim();

  useEffect(() => {
    const normalize = (value: any) =>
      String(value || "").trim().toLowerCase();

    const resolveFirstAdminIdentifier = (entry: any) => {
      if (typeof entry === "string") return entry;
      if (entry && typeof entry === "object") {
        return (
          entry._id ||
          entry.id ||
          entry.userId ||
          entry.email ||
          entry.username ||
          ""
        );
      }
      return "";
    };

    const checkPrimaryDeptAdmin = async () => {
      if (isSuperAdmin || isRootAccess) {
        setIsPrimaryDeptAdmin(true);
        setCheckingAccess(false);
        return;
      }

      if (!isAdmin || !userDepartment) {
        setIsPrimaryDeptAdmin(false);
        setCheckingAccess(false);
        return;
      }

      const userIdentifiers = new Set(
        [
          rawUser?._id,
          rawUser?.id,
          rawUser?.userId,
          rawUser?.email,
          rawUser?.username,
        ]
          .map((v) => normalize(v))
          .filter(Boolean)
      );

      if (userIdentifiers.size === 0) {
        setIsPrimaryDeptAdmin(false);
        setCheckingAccess(false);
        return;
      }

      const res = await fetchTicketingDepartments();

      if (!res?.success || !Array.isArray(res.data)) {
        setIsPrimaryDeptAdmin(false);
        setCheckingAccess(false);
        return;
      }

      const matchingDepartment: any = res.data.find((group: any) => {
        const groupDepartment = normalize(
          group?.departmentName ||
            group?.name ||
            group?.department ||
            group?.groupName
        );
        return groupDepartment === normalize(userDepartment);
      });

      const adminList = Array.isArray(matchingDepartment?.admin)
        ? matchingDepartment.admin
        : Array.isArray(matchingDepartment?.admins)
        ? matchingDepartment.admins
        : [];

      const firstAdminIdentifier = normalize(
        resolveFirstAdminIdentifier(adminList[0])
      );

      setIsPrimaryDeptAdmin(
        Boolean(firstAdminIdentifier) &&
          userIdentifiers.has(firstAdminIdentifier)
      );

      setCheckingAccess(false);
    };

    checkPrimaryDeptAdmin();
  }, [isSuperAdmin, isRootAccess, isAdmin, userDepartment, rawUser, fetchTicketingDepartments]);

  /** ✅ HANDLE REDIRECTION SAFELY */
  useEffect(() => {
    if (checkingAccess) return;

    if (isSuperAdmin || isRootAccess) {
      router.replace("/ticketing/super-admin");
      return;
    }

    if (isAdmin && isPrimaryDeptAdmin) {
      router.replace("/ticketing/department");
      return;
    }

    if (isAgent) {
      router.replace("/ticketing/agent-dashboard");
      return;
    }

    router.replace("/ticketing/inbox");
  }, [
    checkingAccess,
    isSuperAdmin,
    isRootAccess,
    isAdmin,
    isPrimaryDeptAdmin,
    isAgent,
    router,
  ]);

  /** LOADER UI */
  if (checkingAccess) {
    return (
      <div className="ticketing-wireframe">
        <div className="w-full py-10 flex justify-center">
          <span className="loading loading-spinner loading-lg" />
        </div>
      </div>
    );
  }

  return null;
}