// app/hrm/components/DashboardCard.tsx

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function DashboardCard({ children, className = "" }: DashboardCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4 ${className}`}>
      {children}
    </div>
  );
}