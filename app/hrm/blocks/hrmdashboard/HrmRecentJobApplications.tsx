"use client";

// app/hrm/blocks/hrmdashboard/HrmRecentJobApplications.tsx

import DashboardCard from "../../components/DashboardCard";
import SectionHeader from "../../components/SectionHeader";
import StatusBadge from "../../components/StatusBadge";
import { JobApplication } from "@/types/hrm.types";

const applications: JobApplication[] = [];

const TABLE_HEADERS = ["Name", "Position", "Applied Date", "Status"];

export default function HrmRecentJobApplications() {
  return (
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
                {TABLE_HEADERS.map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-medium text-slate-400 pb-2.5 pr-4 last:pr-0 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((app) => (
                <tr
                  key={app._id}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="py-3 pr-4 text-slate-700 font-medium whitespace-nowrap">
                    {app.applicantName}
                  </td>
                  <td className="py-3 pr-4 text-slate-500 whitespace-nowrap">
                    {app.jobTitle}
                  </td>
                  <td className="py-3 pr-4 text-slate-500 whitespace-nowrap">
                    {app.appliedDate}
                  </td>
                  <td className="py-3">
                    <StatusBadge status={app.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardCard>
  );
}