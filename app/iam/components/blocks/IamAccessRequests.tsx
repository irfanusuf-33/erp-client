"use client";
import { GripVertical } from "lucide-react";

export default function IamAccessRequests() {
  return (
    <div className="bg-white rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 font-semibold text-[17px] flex-shrink-0">
        <GripVertical size={20} className="drag-handle cursor-move text-gray-400" />
        <span>Access Requests</span>
      </div>
      <div className="border-t border-gray-200 flex flex-col items-center justify-center gap-6 flex-1 overflow-y-auto pt-4">
        {/* Donut chart */}
        <div className="w-[150px] h-[150px] max-w-full max-h-full relative">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="20" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="20"
              strokeDasharray="157 94" transform="rotate(-90 50 50)" />
          </svg>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm text-center leading-tight">
            Approval Rate
          </div>
        </div>
        {/* Progress bar */}
        <div className="w-full h-2 flex rounded-full overflow-hidden flex-shrink-0">
          <div className="h-full bg-yellow-400" style={{ width: "30%" }} />
          <div className="h-full bg-green-500" style={{ width: "50%" }} />
          <div className="h-full bg-red-500" style={{ width: "20%" }} />
        </div>
        {/* Legend */}
        <div className="flex gap-6 justify-center flex-shrink-0">
          {[
            { label: "Pending",  color: "bg-yellow-400" },
            { label: "Approved", color: "bg-green-500" },
            { label: "Rejected", color: "bg-red-500" },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2 text-sm">
              <span className={`w-3 h-3 rounded-full flex-shrink-0 ${color}`} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
