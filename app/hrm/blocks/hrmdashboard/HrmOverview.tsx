"use client";

import { Users, Monitor, CalendarX, LogOut } from "lucide-react";

const stats = [
  {
    heading: "Total Employees",
    number: "100",
    label: "+12 this month",
    color: "#10B981",
    icon: Users,
  },
  {
    heading: "Active Sessions",
    number: "98",
    label: "99% online",
    color: "#3B82F6",
    icon: Monitor,
  },
  {
    heading: "Leaves Raised",
    number: "08",
    label: "02 pending",
    color: "#F59E0B",
    icon: CalendarX,
  },
  {
    heading: "Checkouts",
    number: "05",
    label: "Today",
    color: "#EF4444",
    icon: LogOut,
  },
];

export default function HrmOverview() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;

          return (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-start gap-3"
            >
              {/* left color strip */}
              <div
                className="w-[3px] self-stretch rounded-full"
                style={{ backgroundColor: stat.color }}
              />

              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-sm font-medium text-gray-600">
                    {stat.heading}
                  </h1>

                  <Icon size={18} className="text-slate-400" />
                </div>

                <h1 className="text-2xl font-bold">{stat.number}</h1>

                <p
                  className="text-xs mt-1"
                  style={{ color: stat.color }}
                >
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}