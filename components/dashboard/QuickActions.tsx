'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, Package, Calendar, GripVertical } from 'lucide-react';

const actions = [
  { label: 'Invoice', icon: FileText, color: '#3b82f6' },
  { label: 'Employee', icon: Users, color: '#10b981' },
  { label: 'Product', icon: Package, color: '#f59e0b' },
  { label: 'Event', icon: Calendar, color: '#8b5cf6' },
];

export default function QuickActions() {
  return (
    <Card className="h-full shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <CardHeader className="pb-1 pt-2.5 px-3 flex flex-row items-center justify-between flex-shrink-0">
        <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
        <div className="drag-handle cursor-move p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
          <GripVertical className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </CardHeader>
      <CardContent className="pb-2 px-3 flex-1 flex items-center">
        <div className="grid grid-cols-2 gap-1.5 w-full">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto py-2 flex flex-col items-center gap-1 hover:border-slate-300"
              >
                <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${action.color}15` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: action.color }} />
                </div>
                <span className="text-[10px] font-medium">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
