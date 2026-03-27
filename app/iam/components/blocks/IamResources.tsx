"use client";
import Link from "next/link";
import { User, Users, FileText, Shield } from "lucide-react";
import type { IamResourcesProps } from "@/types/iam.types";

const cards = [
  { href: "/iam/users",    label: "Users",    key: "totalUsers", colorLine: "bg-orange-400",  Icon: User },
  { href: "/iam/groups",   label: "Groups",   key: "totalGroups", colorLine: "bg-green-700",  Icon: Users },
  { href: "/iam/policies", label: "Policies", key: "policy",      colorLine: "bg-blue-600",   Icon: FileText },
  { href: "/iam/roles",    label: "Roles",    key: "roles",       colorLine: "bg-red-500",    Icon: Shield },
] as const;

export default function IamResources({ details }: IamResourcesProps) {
  return (
    <div className="grid grid-cols-4 gap-5 mb-4">
      {cards.map(({ href, label, key, colorLine, Icon }) => (
        <Link
          key={key}
          href={href}
          className="bg-white rounded-lg p-5 flex flex-row gap-4 shadow-md h-[150px] no-underline hover:shadow-lg transition-shadow"
        >
          <div className={`w-1 h-[83px] rounded-md flex-shrink-0 ${colorLine}`} />
          <div className="flex justify-between flex-1">
            <div className="flex flex-col gap-2">
              <p className="text-lg text-gray-600 font-normal">{label}</p>
              <p className="text-[22px] font-semibold text-gray-800">
                {(details as any)?.[key] || 0}
              </p>
            </div>
            <div className="w-[35px] h-[35px] rounded bg-yellow-100/60 flex items-center justify-center flex-shrink-0">
              <Icon size={22} className="text-yellow-500" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
