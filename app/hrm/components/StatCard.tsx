// app/hrm/components/StatCard.tsx
 
import { type LucideIcon } from "lucide-react";
 
interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  subColor: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}
 
export default function StatCard({
  label,
  value,
  sub,
  subColor,
  icon: Icon,
  iconBg,
  iconColor,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 flex items-start justify-between shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          {label}
        </span>
        <span className="text-3xl font-bold text-slate-800 mt-1">{value}</span>
        <span className={`text-xs font-medium ${subColor}`}>{sub}</span>
      </div>
      <div className={`p-2.5 rounded-lg ${iconBg}`}>
        <Icon size={20} className={iconColor} />
      </div>
    </div>
  );
}
 