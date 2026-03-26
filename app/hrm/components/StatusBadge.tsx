// app/hrm/components/StatusBadge.tsx

const statusStyles: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-600 border border-amber-200",
  Approved: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  Rejected: "bg-rose-50 text-rose-500 border border-rose-200",
  "Interview Scheduled": "bg-emerald-50 text-emerald-600 border border-emerald-200",
  "Under Review": "bg-orange-50 text-orange-500 border border-orange-200",
};

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`px-2.5 py-1 rounded-md text-xs font-medium ${
        statusStyles[status] ?? "bg-slate-100 text-slate-500"
      }`}
    >
      {status}
    </span>
  );
}