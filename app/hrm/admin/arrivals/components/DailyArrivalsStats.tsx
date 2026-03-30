"use client";

import { CheckCircle, CalendarX, LogOut } from "lucide-react";

interface StatItem {
  heading: string;
  value: number;
  total: number;
  label?: string;
  color: string;
  icon: React.ElementType;
}

const stats: StatItem[] = [
  {
    heading: "On Time",
    value: 45,
    total: 80,
    label: "Arrived on schedule",
    color: "#10B981",
    icon: CheckCircle,
  },
  {
    heading: "Late Arrivals",
    value: 3,
    total: 80,
    label: "Employees arrived late",
    color: "#EF4444",
    icon: CalendarX,
  },
  {
    heading: "Early Out",
    value: 8,
    total: 80,
    label: "Left before time",
    color: "#F59E0B",
    icon: LogOut,
  },
];

export default function DailyArrivalsStats() {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;

        return (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-4 flex items-start gap-3"
          >
            {/* left colored strip */}
            <div
              className="w-1 self-stretch rounded-full"
              style={{ backgroundColor: stat.color }}
            />

            {/* content */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-sm font-medium text-gray-600">
                  {stat.heading}
                </h1>
                <div className="text-gray-400">
                  <Icon className="w-6 h-6" />
                </div>
              </div>

              <h1 className="text-2xl font-bold">
                {stat.value}
                <span className="text-sm text-gray-400 ml-1">
                  /{stat.total}
                </span>
              </h1>

              {stat.label && (
                <label
                  className="text-xs"
                  style={{ color: stat.color }}
                >
                  {stat.label}
                </label>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}