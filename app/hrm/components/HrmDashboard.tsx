

import HrmOverview from "../blocks/hrmdashboard/HrmOverview";
import HrmUpcomingHolidays from "../blocks/hrmdashboard/HrmUpcomingHolidays";
import HrmUpcomingEvents from "../blocks/hrmdashboard/HrmUpcomingEvents";
import HrmAlertsActions from "../blocks/hrmdashboard/HrmAlertsActions";
import HrmRecentAnnouncements from "../blocks/hrmdashboard/HrmRecentAnnouncements";
import HrmRecentJobApplications from "../blocks/hrmdashboard/HrmRecentJobApplications";
import HrmRecentLeaves from "../blocks/hrmdashboard/HrmRecentLeaves";

export default function HrmDashboard() {
  return (
    <div className="flex flex-col gap-5 p-6 bg-slate-50 min-h-screen">

      {/* ── Row 1: Stat Cards ── */}
      <HrmOverview />

      {/* ── Row 2: Holidays | Events | Alerts (equal thirds) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <HrmUpcomingHolidays />
        <HrmUpcomingEvents />
        <HrmAlertsActions />
      </div>

      {/* ── Row 3: Announcements | Job Applications (50/50) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <HrmRecentAnnouncements />
        <HrmRecentJobApplications />
      </div>

      {/* ── Row 4: Recent Leaves (full width) ── */}
      <HrmRecentLeaves />

    </div>
  );
}