// app/hrm/components/StatCard.tsx

import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  heading: string;
  number: string | number;
  label: string;
  color: string;
  icon: LucideIcon;
  // Optional leave balance props
  used?: number | null;
  total?: number | null;
}

export default function StatCard({
  heading,
  number,
  label,
  color,
  icon: Icon,
  used,
  total,
}: StatCardProps) {
  const showBalance = used !== undefined && used !== null && total !== undefined && total !== null;
  const remaining   = showBalance ? (total! - used!) : null;
  const progress    = showBalance ? Math.min((used! / total!) * 100, 100) : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-start gap-3 hover:shadow-md transition-shadow h-full">
      <div
        className="w-[3px] self-stretch rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500 truncate">{heading}</h3>
          <Icon size={18} className="text-slate-400 shrink-0 ml-2" />
        </div>

        <p className="text-2xl font-bold text-slate-800">{number}</p>
        <p className="text-xs mt-0.5" style={{ color }}>{label}</p>

        {/* Used / Remaining row */}
        {showBalance && (
          <div className="mt-3">
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: color }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                Used: <span className="font-semibold text-slate-600">{used}</span>
              </span>
              <span className="text-[10px] text-slate-400">
                Remaining: <span className="font-semibold" style={{ color }}>{remaining}</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}