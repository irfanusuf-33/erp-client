"use client";

// app/hrm/blocks/hrmdashboard/HrmAlertsActions.tsx

import { AlertCircle } from "lucide-react";
import DashboardCard from "../../components/DashboardCard";
import SectionHeader from "../../components/SectionHeader";
import { Alert } from "@/types/hrm.types";



const alerts: Alert[] = [];

export default function HrmAlertsActions() {
  return (
    <DashboardCard className="h-full">
      <SectionHeader title="Alerts and Actions" />

      {alerts.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-8">
          <p className="text-sm text-slate-400">No Alerts and Actions found</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-slate-100">
          {alerts.map((alert, i) => (
            <div key={i} className="flex items-start gap-3 py-3">
              <AlertCircle size={15} className="text-orange-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 font-medium leading-snug">
                  {alert.message}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{alert.time}</p>
              </div>
              <button className="text-xs text-blue-500 font-medium hover:text-blue-700 whitespace-nowrap transition-colors shrink-0">
                View
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}