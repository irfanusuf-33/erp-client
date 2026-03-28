'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, GripVertical } from 'lucide-react';

const activities = [
  { user: 'John Doe', action: 'created invoice', time: '5 min ago', color: '#3b82f6' },
  { user: 'Sarah Smith', action: 'updated record', time: '12 min ago', color: '#10b981' },
  { user: 'Mike Johnson', action: 'approved leave', time: '1 hour ago', color: '#f59e0b' },
  { user: 'Emma Wilson', action: 'added product', time: '2 hours ago', color: '#8b5cf6' },
  { user: 'David Brown', action: 'closed ticket', time: '3 hours ago', color: '#06b6d4' },
];

export default function ActivityFeed() {
  return (
    <Card className="h-full shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <CardHeader className="pb-1 pt-2.5 px-3 flex flex-row items-center justify-between flex-shrink-0">
        <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
        <div className="drag-handle cursor-move p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
          <GripVertical className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </CardHeader>
      <CardContent className="pb-2 px-3 flex-1 flex flex-col justify-center">
        <div className="space-y-1.5">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start gap-1.5">
              <div className="w-1 h-1 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: activity.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] leading-tight">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{activity.user}</span>
                  <span className="text-slate-500 dark:text-slate-400"> {activity.action}</span>
                </p>
                <div className="flex items-center gap-0.5 mt-0.5">
                  <Clock className="w-2 h-2 text-slate-400" />
                  <span className="text-[9px] text-slate-400">{activity.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
