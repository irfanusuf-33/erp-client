'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Package, Calendar, GripVertical, Plus } from 'lucide-react';

const actions = [
  { label: 'New Invoice', icon: FileText, color: 'blue', description: 'Create invoice' },
  { label: 'Add Employee', icon: Users, color: 'green', description: 'Register employee' },
  { label: 'Add Product', icon: Package, color: 'orange', description: 'Add to inventory' },
  { label: 'Schedule Event', icon: Calendar, color: 'purple', description: 'Create event' },
];

const colorMap: Record<string, { bg: string; hover: string; icon: string }> = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/30', icon: 'text-blue-600 dark:text-blue-400' },
  green: { bg: 'bg-green-50 dark:bg-green-900/20', hover: 'hover:bg-green-100 dark:hover:bg-green-900/30', icon: 'text-green-600 dark:text-green-400' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', hover: 'hover:bg-orange-100 dark:hover:bg-orange-900/30', icon: 'text-orange-600 dark:text-orange-400' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/30', icon: 'text-purple-600 dark:text-purple-400' },
};

export default function QuickActions() {
  return (
    <Card className="h-full shadow-sm hover:shadow-md transition-shadow flex flex-col border-slate-200 dark:border-zinc-800">
      <CardHeader className="pb-4 pt-5 px-5 flex flex-row items-center justify-between flex-shrink-0 border-b border-slate-100 dark:border-zinc-800">
        <CardTitle className="text-base font-semibold text-slate-900 dark:text-zinc-100">Quick Actions</CardTitle>
        <div className="drag-handle cursor-move p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded transition-colors">
          <GripVertical className="w-4 h-4 text-slate-400" />
        </div>
      </CardHeader>
      <CardContent className="pb-5 px-5 pt-4 flex-1">
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            const colors = colorMap[action.color];
            return (
              <button
                key={action.label}
                className={`p-4 rounded-xl border border-slate-200 dark:border-zinc-800 ${colors.bg} ${colors.hover} transition-all hover:shadow-md group`}
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="relative">
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center shadow-sm">
                      <Plus className={`w-3 h-3 ${colors.icon}`} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mb-0.5">{action.label}</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">{action.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
