'use client';

import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, GripVertical } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change: number;
  icon: LucideIcon;
  color: string;
}

export default function KPICard({ title, value, change, icon: Icon, color }: KPICardProps) {
  const isPositive = change >= 0;

  return (
    <Card className="h-full hover:shadow-md transition-shadow flex flex-col">
      <CardContent className="p-2.5 flex-1 flex flex-col justify-between">
        <div className="flex items-start justify-between mb-1">
          <p className="text-[9px] text-slate-500 dark:text-zinc-400 font-medium uppercase tracking-wide leading-tight">{title}</p>
          <div className="drag-handle cursor-move p-0.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded">
            <GripVertical className="w-2.5 h-2.5 text-slate-400" />
          </div>
        </div>
        <div className="flex items-end justify-between mt-auto">
          <div className="flex-1">
            <p className="text-lg font-bold leading-none">{value}</p>
            <div className="flex items-center gap-0.5 mt-1">
              {isPositive ? (
                <TrendingUp className="w-2 h-2 text-green-600" />
              ) : (
                <TrendingDown className="w-2 h-2 text-red-600" />
              )}
              <span className={`text-[9px] font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{change}%
              </span>
            </div>
          </div>
          <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${color}15` }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
