'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GripVertical } from 'lucide-react';

const funnelData = [
  { stage: 'Leads', count: 1250, percentage: 100, color: '#3b82f6' },
  { stage: 'Qualified', count: 850, percentage: 68, color: '#8b5cf6' },
  { stage: 'Proposal', count: 420, percentage: 34, color: '#f59e0b' },
  { stage: 'Negotiation', count: 180, percentage: 14, color: '#10b981' },
  { stage: 'Closed', count: 95, percentage: 8, color: '#06b6d4' },
];

export default function CRMFunnel() {
  return (
    <Card className="h-full shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <CardHeader className="pb-1 pt-2.5 px-3 flex flex-row items-center justify-between flex-shrink-0">
        <CardTitle className="text-sm font-semibold">Sales Funnel</CardTitle>
        <div className="drag-handle cursor-move p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded">
          <GripVertical className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </CardHeader>
      <CardContent className="pb-2 px-3 flex-1 flex flex-col justify-center">
        <div className="space-y-2">
          {funnelData.map((item) => (
            <div key={item.stage}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] font-medium text-slate-700 dark:text-zinc-300">{item.stage}</span>
                <span className="text-[10px] font-semibold" style={{ color: item.color }}>{item.count}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-zinc-900 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
