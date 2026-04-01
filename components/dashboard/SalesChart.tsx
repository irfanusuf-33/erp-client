'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GripVertical } from 'lucide-react';

const data = [
  { month: 'Jan', sales: 4000 },
  { month: 'Feb', sales: 3000 },
  { month: 'Mar', sales: 2000 },
  { month: 'Apr', sales: 2780 },
  { month: 'May', sales: 1890 },
  { month: 'Jun', sales: 2390 },
  { month: 'Jul', sales: 3490 },
];

export default function SalesChart() {
  return (
    <Card className="h-full shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <CardHeader className="pb-1 pt-2.5 px-3 flex flex-row items-center justify-between flex-shrink-0">
        <CardTitle className="text-sm font-semibold">Sales Overview</CardTitle>
        <div className="drag-handle cursor-move p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded">
          <GripVertical className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </CardHeader>
      <CardContent className="pb-2 px-2 flex-1 flex items-center">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" fontSize={10} stroke="#888" />
            <YAxis fontSize={10} stroke="#888" />
            <Tooltip />
            <Area type="monotone" dataKey="sales" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSales)" strokeWidth={1.5} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
