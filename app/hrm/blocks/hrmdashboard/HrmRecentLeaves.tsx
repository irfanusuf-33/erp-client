"use client";

// app/hrm/blocks/hrmdashboard/HrmRecentLeaves.tsx

import DashboardCard from "../../components/DashboardCard";
import SectionHeader from "../../components/SectionHeader";
import StatusBadge from "../../components/StatusBadge";
import { Leave } from "@/types/hrm.types";

const leaves: Leave[] = [];

const TABLE_HEADERS = ["Name", "Leave type", "Start Date", "End Date", "Status"];

export default function HrmRecentLeaves() {
  return (
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
                {TABLE_HEADERS.map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-medium text-slate-400 pb-2.5 pr-4 last:pr-0"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaves.map((leave) => (
                <tr key={leave._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 pr-4 text-slate-700 font-medium">
                    {leave.employeeName}
                  </td>
                  <td className="py-3 pr-4 text-slate-500">{leave.leaveType}</td>
                  <td className="py-3 pr-4 text-slate-500">{leave.startDate}</td>
                  <td className="py-3 pr-4 text-slate-500">{leave.endDate}</td>
                  <td className="py-3">
                    <StatusBadge status={leave.status} />
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