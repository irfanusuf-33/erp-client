import { GripVertical } from "lucide-react";
import type { IamUserAccessOverviewProps } from "@/types/iam.types";

export default function IamUserAccessOverview({ details }: IamUserAccessOverviewProps) {
  const activeUsers = details?.activeUsersCount || 0;
  const totalUsers = details?.totalUsers || 0;
  const inactiveUsers = totalUsers - activeUsers;
  const activePercentage = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;
  const inactivePercentage = totalUsers > 0 ? (inactiveUsers / totalUsers) * 100 : 0;
  const circumference = 2 * Math.PI * 40;
  const activeDash = (activePercentage / 100) * circumference;
  const inactiveDash = circumference - activeDash;

  return (
    <div className="bg-white rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 font-semibold text-[17px] flex-shrink-0">
        <GripVertical size={20} className="drag-handle cursor-move text-gray-400" />
        <span>User Access Overview</span>
      </div>
      <div className="border-t border-gray-200 flex flex-col items-center justify-center gap-6 flex-1 overflow-y-auto pt-4">
        <div className="w-[200px] h-[200px] max-w-full max-h-full">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#e0e7ff" strokeWidth="20" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="20"
              strokeDasharray={`${activeDash} ${inactiveDash}`} transform="rotate(-90 50 50)" />
          </svg>
        </div>
        <div className="flex gap-6 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0" />
            <span>Active ({activeUsers}) - {activePercentage.toFixed(1)}%</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full bg-blue-100 flex-shrink-0" />
            <span>Inactive ({inactiveUsers}) - {inactivePercentage.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
