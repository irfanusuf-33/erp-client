"use client";
import { AlertTriangle, CheckCircle, AlertCircle, GripVertical } from "lucide-react";
import type { IamInsightsAlertsProps, InsightsAlertsItem } from "@/types/iam.types";

export default function IamInsightsAlerts({ alerts = [], insights = [] }: IamInsightsAlertsProps) {
  const getIcon = (type: string, isAlert: boolean) => {
    if (isAlert)
      return type === "warning"
        ? <AlertTriangle size={22} className="text-orange-400 flex-shrink-0" />
        : <AlertCircle size={22} className="text-red-500 flex-shrink-0" />;
    return type === "success"
      ? <CheckCircle size={22} className="text-green-500 flex-shrink-0" />
      : <AlertTriangle size={22} className="text-orange-400 flex-shrink-0" />;
  };

  const renderItem = (item: InsightsAlertsItem, index: number, isAlert: boolean) => (
    <div key={`${isAlert ? "alert" : "insight"}-${index}`} className="flex items-start gap-3 py-4 border-b border-gray-200 last:border-0">
      {getIcon(item.type, isAlert)}
      <div>
        <div className="text-sm font-medium text-gray-800">{item.title}</div>
        <div className="text-sm text-gray-500 mt-1">{item.description}</div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl p-6 h-full flex flex-col overflow-auto">
      <div className="flex items-center gap-2 mb-4 font-semibold text-[17px] flex-shrink-0">
        <GripVertical size={20} className="drag-handle cursor-move text-gray-400" />
        <span>Insights &amp; Alerts</span>
      </div>
      <div className="border-t border-gray-200 flex-1 overflow-y-auto">
        {alerts.map((item, i) => renderItem(item, i, true))}
        {insights.map((item, i) => renderItem(item, i, false))}
      </div>
    </div>
  );
}
