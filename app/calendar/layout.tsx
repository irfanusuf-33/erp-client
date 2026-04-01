export default function CalendarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-[calc(100vh-56px)] overflow-hidden bg-white dark:bg-zinc-900">
      {children}
    </div>
  );
}
