"use client";

// app/hrm/blocks/hrmdashboard/HrmOverview.tsx

import { Users, Monitor, CalendarX, LogOut } from "lucide-react";
import StatCard from "../../components/StatCard";

const stats = [
  {
    label: "Total Employees",
    value: "100",
    sub: "+ 12 this month",
    subColor: "text-emerald-500",
    icon: Users,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
  },
  {
    label: "Active Sessions",
    value: "98",
    sub: "99% online",
    subColor: "text-emerald-500",
    icon: Monitor,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
  },
  {
    label: "Leaves Raised",
    value: "08",
    sub: "02 pending",
    subColor: "text-orange-400",
    icon: CalendarX,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
  },
  {
    label: "Checkouts",
    value: "05",
    sub: "Today",
    subColor: "text-slate-400",
    icon: LogOut,
    iconBg: "bg-rose-50",
    iconColor: "text-rose-500",
  },
];

export default function HrmOverview() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}