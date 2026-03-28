// app/hrm/layout.tsx

import HrmNavbar from "./components/HrmNavbar";

export default function HrmLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <HrmNavbar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}