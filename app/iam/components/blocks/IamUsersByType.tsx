"use client";
import { GripVertical } from "lucide-react";
import type { IamUsersByTypeProps } from "@/types/iam.types";

const barColors = ["#4f77e4", "#5a80e8", "#6b8eea", "#0f2d7d"];

export default function IamUsersByType({ userRolesCount }: IamUsersByTypeProps) {
  const totalUsers = userRolesCount
    ? Object.values(userRolesCount).reduce((s, c) => s + c, 0)
    : 0;

  const userTypes = userRolesCount
    ? Object.entries(userRolesCount).map(([role, count]) => ({
        label: role.charAt(0).toUpperCase() + role.slice(1),
        value: count,
        percentage: totalUsers > 0 ? (count / totalUsers) * 100 : 0,
      }))
    : [];

  return (
    <div className="bg-white rounded-xl p-6 h-full flex flex-col overflow-auto">
      <div className="flex items-center gap-2 mb-4 font-semibold text-[17px] flex-shrink-0">
        <GripVertical size={20} className="drag-handle cursor-move text-gray-400" />
        <span>Users by type</span>
      </div>
      <div className="border-t border-gray-200 flex flex-col gap-3.5 flex-1 overflow-y-auto pt-4">
        {userTypes.map((type, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="flex justify-between items-center gap-3">
              <span className="text-base font-medium text-black">{type.label}</span>
              <span className="text-base font-medium text-black">{type.value}</span>
            </div>
            <div className="w-full h-3 bg-[#c3cedd] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${type.percentage}%`, backgroundColor: barColors[i % barColors.length] }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
