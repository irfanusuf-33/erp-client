"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobalStore } from "@/store";
import TicketingMessagesTable from "../components/TicketingMessagesTable";

function TicketingMessages() {
  const router = useRouter();

  const { user, fetchTicketingDepartments } = useGlobalStore();

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

  const isSuperAdmin = hasPolicy("ticketingFullAccess");
  const isAdmin = hasPolicy("ticketingDeptAccess");
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
    const normalize = (v: any) => String(v || "").trim().toLowerCase();

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

    const checkAccess = async () => {
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
          .map(normalize)
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

      const matchingDepartment : any = res.data.find((group: any) => {
        const dept = normalize(
          group?.departmentName ||
            group?.name ||
            group?.department ||
            group?.groupName
        );
        return dept === normalize(userDepartment);
      });

      const adminList = Array.isArray(matchingDepartment?.admin)
        ? matchingDepartment.admin
        : Array.isArray(matchingDepartment?.admins)
        ? matchingDepartment.admins
        : [];

      const firstAdminIdentifier = normalize(
        resolveFirstAdminIdentifier(adminList[0])
      );

      const isPrimary =
        Boolean(firstAdminIdentifier) &&
        userIdentifiers.has(firstAdminIdentifier);

      setIsPrimaryDeptAdmin(isPrimary);
      setCheckingAccess(false);
    };

    checkAccess();
  }, [
    isSuperAdmin,
    isRootAccess,
    isAdmin,
    userDepartment,
    rawUser,
    fetchTicketingDepartments,
  ]);

  const canAccessMessagePool =
    isSuperAdmin || isRootAccess || (isAdmin && isPrimaryDeptAdmin);

  /** ✅ NEXT.JS REDIRECT FIX */
  useEffect(() => {
    if (checkingAccess) return;

    if (!canAccessMessagePool) {
      router.replace("/ticketing/inbox");
    }
  }, [checkingAccess, canAccessMessagePool, router]);

  if (checkingAccess) {
    return (
      <div className="ticketing-messages-container">
        <div className="w-full py-10 flex justify-center">
          <span className="loading loading-spinner loading-lg" />
        </div>
      </div>
    );
  }

  if (!canAccessMessagePool) return null;

  return (
    <div className="ticketing-messages-container">
        <div className="ticketing-messages-header">
            <div className="header">
                <div className="header-text-container">
                    <h2 className="header-title">Ticket pool</h2>
                    <p className="header-description">The Ticket Pool provides a centralized view of all incoming support tickets from various channels such as email, web forms, chat, and system integrations. It allows support teams to efficiently review tickets, assign them to agents, or manage them to ensure timely and organized issue resolution.</p>
                </div>
            </div>
        </div>
      <TicketingMessagesTable />
    </div>
  );
}

export default TicketingMessages;