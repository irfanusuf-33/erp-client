"use client";

// app/hrm/blocks/hrmdashboard/HrmRecentAnnouncements.tsx

import { Plus } from "lucide-react";
import DashboardCard from "../../components/DashboardCard";
import SectionHeader from "../../components/SectionHeader";
import { Announcement } from "@/types/hrm.types";

const announcements: Announcement[] = [];

export default function HrmRecentAnnouncements() {
  return (
    <DashboardCard>
      <SectionHeader
        title="Recent Announcements"
        action={
          <button className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
            <Plus size={13} />
            Announcement
          </button>
        }
      />

      {announcements.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-8">
          <p className="text-sm text-slate-400">No announcements found</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-slate-100">
          {announcements.map((a) => (
            <div key={a._id} className="flex items-start justify-between gap-4 py-3">
              <div className="flex items-start gap-2 min-w-0">
                <div className="w-0.5 min-h-[40px] rounded-full bg-blue-500 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600 leading-snug">{a.text}</p>
              </div>
              <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
                {a.createdAt}
              </span>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}