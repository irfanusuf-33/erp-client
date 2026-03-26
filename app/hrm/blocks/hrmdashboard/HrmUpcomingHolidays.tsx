"use client";

// app/hrm/blocks/hrmdashboard/HrmUpcomingHolidays.tsx

import { CalendarDays } from "lucide-react";
import DashboardCard from "../../components/DashboardCard";
import SectionHeader from "../../components/SectionHeader";
import { Holiday } from "@/types/hrm.types";

const holidays: Holiday[] = [];

export default function HrmUpcomingHolidays() {
  return (
    <DashboardCard className="h-full">
      <SectionHeader title="Upcoming Holidays" />

      {holidays.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-8">
          <p className="text-sm text-slate-400">No upcoming holidays found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {holidays.map((h, i) => (
            <div
              key={h._id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                i === 1
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-100 bg-slate-50"
              }`}
            >
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  i === 1 ? "bg-blue-100" : "bg-white border border-slate-200"
                }`}
              >
                <CalendarDays
                  size={16}
                  className={i === 1 ? "text-blue-500" : "text-slate-400"}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">{h.name}</p>
                <p className="text-xs text-slate-400">{h.date}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}