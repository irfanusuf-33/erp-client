'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, GripVertical, User, FileText, CheckCircle, Package, AlertCircle } from 'lucide-react';

const activities = [
  { user: 'John Doe', action: 'created invoice', detail: 'INV-2024-001', time: '5 min ago', icon: FileText, color: 'blue' },
  { user: 'Sarah Smith', action: 'updated customer record', detail: 'CRM-456', time: '12 min ago', icon: User, color: 'green' },
  { user: 'Mike Johnson', action: 'approved leave request', detail: 'HR-789', time: '1 hour ago', icon: CheckCircle, color: 'purple' },
  { user: 'Emma Wilson', action: 'added new product', detail: 'PRD-123', time: '2 hours ago', icon: Package, color: 'orange' },
  { user: 'David Brown', action: 'closed support ticket', detail: 'TKT-567', time: '3 hours ago', icon: AlertCircle, color: 'cyan' },
];

const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', icon: 'text-blue-600 dark:text-blue-400' },
  green: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400', icon: 'text-green-600 dark:text-green-400' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-400', icon: 'text-purple-600 dark:text-purple-400' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-400', icon: 'text-orange-600 dark:text-orange-400' },
  cyan: { bg: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-700 dark:text-cyan-400', icon: 'text-cyan-600 dark:text-cyan-400' },
};

export default function ActivityFeed() {
  return (
    <Card className="h-full shadow-sm hover:shadow-md transition-shadow flex flex-col border-slate-200 dark:border-zinc-800">
      <CardHeader className="pb-4 pt-5 px-5 flex flex-row items-center justify-between flex-shrink-0 border-b border-slate-100 dark:border-zinc-800">
        <CardTitle className="text-base font-semibold text-slate-900 dark:text-zinc-100">Recent Activity</CardTitle>
        <div className="drag-handle cursor-move p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded transition-colors">
          <GripVertical className="w-4 h-4 text-slate-400" />
        </div>
      </CardHeader>
      <CardContent className="pb-5 px-5 pt-4 flex-1 overflow-auto">
        <div className="space-y-3">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            const colors = colorMap[activity.color];
            return (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                <div className={`w-9 h-9 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${colors.icon}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-tight mb-1">
                    <span className="font-semibold text-slate-900 dark:text-zinc-100">{activity.user}</span>
                    <span className="text-slate-600 dark:text-zinc-400"> {activity.action}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${colors.text}`}>{activity.detail}</span>
                    <span className="text-slate-400">•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-500 dark:text-zinc-400">{activity.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
