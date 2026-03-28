"use client";

// app/hrm/admin/arrivals/_components/DailyArrivalsStats.tsx

import { CheckCircle, CalendarX, LogOut } from "lucide-react";

interface StatItem {
  label: string;
  value: number;
  total: number;
  sub?: string;
  color: string;
  borderColor: string;
  bgColor: string;
  iconBg: string;
  iconColor: string;
  icon: React.ElementType;
}

const stats: StatItem[] = [
  {
    label: "On Time",
    value: 45,
    total: 80,
    color: "text-emerald-600",
    borderColor: "border-l-emerald-500",
    bgColor: "bg-white",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    icon: CheckCircle,
  },
  {
    label: "Late Arrivals",
    value: 3,
    total: 80,
    sub: "99% online",
    color: "text-rose-500",
    borderColor: "border-l-rose-500",
    bgColor: "bg-white",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-500",
    icon: CalendarX,
  },
  {
    label: "Early Out",
    value: 8,
    total: 80,
    sub: "02 pending",
    color: "text-amber-500",
    borderColor: "border-l-amber-500",
    bgColor: "bg-white",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    icon: LogOut,
  },
];

export default function DailyArrivalsStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`${stat.bgColor} rounded-xl border border-slate-100 border-l-4 ${stat.borderColor} shadow-sm p-5 flex items-center justify-between`}
          >
            {/* Left */}
            <div className="flex flex-col gap-1">
              <span className={`text-sm font-medium ${stat.color}`}>
                {stat.label}
              </span>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </span>
                <span className="text-sm text-slate-400">/ {stat.total}</span>
              </div>
              {stat.sub && (
                <span className={`text-xs font-medium ${stat.color}`}>
                  {stat.sub}
                </span>
              )}
            </div>

            {/* Icon */}
            <div className={`p-2.5 rounded-lg ${stat.iconBg}`}>
              <Icon size={20} className={stat.iconColor} />
            </div>
          </div>
        );
      })}
    </div>
  );
}