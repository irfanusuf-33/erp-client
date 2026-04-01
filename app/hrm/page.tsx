"use client";

import {
  Users,
  Monitor,
  CalendarX,
  LogOut,
  CalendarDays,
  AlertCircle,
  Plus,
} from "lucide-react";

import DashboardCard from "./components/DashboardCard";
import SectionHeader from "./components/SectionHeader";
import StatusBadge from "./components/StatusBadge";

import {
  Alert,
  Holiday,
  HrmEvent,
  Announcement,
  JobApplication,
  Leave,
} from "@/types/hrm.types";

const stats = [
  { heading: "Total Employees", number: "0", label: "+0 this month", color: "#10B981", icon: Users },
  { heading: "Active Sessions",  number: "0", label: "0% online",     color: "#3B82F6", icon: Monitor },
  { heading: "Leaves Raised",    number: "0", label: "0 pending",     color: "#F59E0B", icon: CalendarX },
  { heading: "Checkouts",        number: "0", label: "Today",         color: "#EF4444", icon: LogOut },
];

const holidays: Holiday[]          = [];
const events: HrmEvent[]           = [];
const alerts: Alert[]              = [];
const announcements: Announcement[] = [];
const applications: JobApplication[] = [];
const leaves: Leave[]              = [];

const JOB_APPLICATION_HEADERS = ["Name", "Position", "Applied Date", "Status"];
const LEAVE_HEADERS = ["Name", "Leave type", "Start Date", "End Date", "Status"];

export default function HrmDashboard() {
  return (
    <div className="flex flex-col gap-5 p-6 bg-slate-50 min-h-screen">

      {/* ── Overview ── */}
      <div>
        <h1 className="text-xl font-semibold mb-4">Overview</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-start gap-3">
                <div className="w-[3px] self-stretch rounded-full" style={{ backgroundColor: stat.color }} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h1 className="text-sm font-medium text-gray-600">{stat.heading}</h1>
                    <Icon size={18} className="text-slate-400" />
                  </div>
                  <h1 className="text-2xl font-bold">{stat.number}</h1>
                  <p className="text-xs mt-1" style={{ color: stat.color }}>{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Holidays | Events | Alerts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Upcoming Holidays */}
        <DashboardCard className="h-full">
          <SectionHeader title="Upcoming Holidays" />
          {holidays.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-8">
              <p className="text-sm text-slate-400">No upcoming holidays found</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {holidays.map((h, i) => (
                <div key={h._id} className={`flex items-center gap-3 p-3 rounded-lg border ${i === 1 ? "border-blue-500 bg-blue-50" : "border-slate-100 bg-slate-50"}`}>
                  <div className={`p-2 rounded-lg ${i === 1 ? "bg-blue-100" : "bg-white border border-slate-200"}`}>
                    <CalendarDays size={16} className={i === 1 ? "text-blue-500" : "text-slate-400"} />
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

        {/* Upcoming Events */}
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
                    <span className="text-base font-bold text-slate-700">{new Date(event.date).getDate()}</span>
                    <span className="text-[10px] text-slate-400">{new Date(event.date).toLocaleString("default", { month: "short" })}</span>
                  </div>
                  <div className="h-8 w-0.5 bg-blue-500 rounded-full" />
                  <p className="flex-1 text-sm text-slate-600 font-medium truncate">{event.title}</p>
                  <span className="text-xs text-slate-400">{event.time}</span>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>

        {/* Alerts and Actions */}
        <DashboardCard className="h-full">
          <SectionHeader title="Alerts and Actions" />
          {alerts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-8">
              <p className="text-sm text-slate-400">No Alerts and Actions found</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-slate-100">
              {alerts.map((alert, i) => (
                <div key={i} className="flex items-start gap-3 py-3">
                  <AlertCircle size={15} className="text-orange-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 font-medium">{alert.message}</p>
                    <p className="text-xs text-slate-400">{alert.time}</p>
                  </div>
                  <button className="text-xs text-blue-500 font-medium">View</button>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>

      </div>

      {/* ── Announcements | Job Applications ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent Announcements */}
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
                  <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">{a.createdAt}</span>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>

        {/* Recent Job Applications */}
        <DashboardCard>
          <SectionHeader
            title="Recent Job Applications"
            action={
              <button className="text-xs text-blue-500 font-medium hover:text-blue-700 transition-colors">
                View All
              </button>
            }
          />
          {applications.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-8">
              <p className="text-sm text-slate-400">No job applications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {JOB_APPLICATION_HEADERS.map((h) => (
                      <th key={h} className="text-left text-xs font-medium text-slate-400 pb-2.5 pr-4 last:pr-0 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                      <td className="py-3 pr-4 text-slate-700 font-medium whitespace-nowrap">{app.applicantName}</td>
                      <td className="py-3 pr-4 text-slate-500 whitespace-nowrap">{app.jobTitle}</td>
                      <td className="py-3 pr-4 text-slate-500 whitespace-nowrap">{app.appliedDate}</td>
                      <td className="py-3"><StatusBadge status={app.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DashboardCard>

      </div>

      {/* ── Recent Leaves (full width) ── */}
      <DashboardCard>
        <SectionHeader
          title="Recent Employee Leaves"
          action={
            <button className="text-xs text-blue-500 font-medium hover:text-blue-700 transition-colors">
              View All
            </button>
          }
        />
        {leaves.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-8">
            <p className="text-sm text-slate-400">No recent leaves found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {LEAVE_HEADERS.map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-slate-400 pb-2.5 pr-4 last:pr-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4 text-slate-700 font-medium">{leave.employeeName}</td>
                    <td className="py-3 pr-4 text-slate-500">{leave.leaveType}</td>
                    <td className="py-3 pr-4 text-slate-500">{leave.startDate}</td>
                    <td className="py-3 pr-4 text-slate-500">{leave.endDate}</td>
                    <td className="py-3"><StatusBadge status={leave.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>

    </div>
  );
}