import Link from "next/link";
import { User, Users, FileText, Shield } from "lucide-react";
import type { IamResourcesProps } from "@/types/iam.types";

const cards = [
  { href: "/iam/users",    label: "Users",    key: "totalUsers",  color: "#f97316", Icon: User },
  { href: "/iam/groups",   label: "Groups",   key: "totalGroups", color: "#15803d", Icon: Users },
  { href: "/iam/policies", label: "Policies", key: "policy",      color: "#2563eb", Icon: FileText },
  { href: "/iam/roles",    label: "Roles",    key: "roles",       color: "#ef4444", Icon: Shield },
] as const;

export default function IamResources({ details }: IamResourcesProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      {cards.map(({ href, label, key, color, Icon }) => (
        <Link
          key={key}
          href={href}
          className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-4 flex items-start gap-3 no-underline hover:shadow-md transition-shadow"
        >
          <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-sm font-medium text-gray-600">{label}</h1>
              <div className="text-gray-400"><Icon size={22} /></div>
            </div>
            <h1 className="text-2xl font-bold">{(details as any)?.[key] || 0}</h1>
          </div>
        </Link>
      ))}
    </div>
  );
}
