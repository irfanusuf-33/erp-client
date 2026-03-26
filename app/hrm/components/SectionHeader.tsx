// app/hrm/components/SectionHeader.tsx
 
interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
}
 
export default function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
      {action && <div>{action}</div>}
    </div>
  );
}