"use client";

// app/hrm/blocks/hrmdashboard/HrmUpcomingEvents.tsx

import DashboardCard from "../../components/DashboardCard";
import SectionHeader from "../../components/SectionHeader";
import { HrmEvent } from "@/types/hrm.types";

const events: HrmEvent[] = [];

export default function HrmUpcomingEvents() {
  return (
    <DashboardCard className="h-full">
      <SectionHeader title="Upcoming Events" />

      {events.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-8">
          <p className="text-sm text-slate-400">No upcoming events found</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-slate-100">
          {events.map((event) => (
            <div key={event._id} className="flex items-center gap-4 py-3">
              <div className="flex flex-col items-center min-w-[28px]">
                <span className="text-base font-bold text-slate-700 leading-none">
                  {new Date(event.date).getDate()}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {new Date(event.date).toLocaleString("default", { month: "short" })}
                </span>
              </div>
              <div className="h-8 w-0.5 bg-blue-500 rounded-full shrink-0" />
              <p className="flex-1 text-sm text-slate-600 font-medium truncate">
                {event.title}
              </p>
              <span className="text-xs text-slate-400 whitespace-nowrap">
                {event.time}
              </span>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}