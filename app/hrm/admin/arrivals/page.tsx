// app/hrm/admin/arrivals/page.tsx

import DailyArrivalsStats from "./components/DailyArrivalsStats";
import DailyArrivalsTable from "./components/DailyArrivalsTable";

export const metadata = {
  title: "Daily Arrivals",
};

export default function DailyArrivalsPage() {
  return (
    <div className="flex flex-col gap-5 p-6 bg-slate-50 min-h-screen">

      {/* Heading */}
      <h1 className="text-xl font-semibold text-slate-800">
        Daily Arrival Report
      </h1>

      {/* 3 Stat Cards */}
      <DailyArrivalsStats />

      {/* Table */}
      <DailyArrivalsTable />

    </div>
  );
}