'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { GripVertical } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

interface ModuleCardProps {
  module: {
    id: string;
    title: string;
    icon: LucideIcon;
    color: string;
    stats: Record<string, string | number>;
    description?: string;
  };
}

export default function ModuleCard({ module }: ModuleCardProps) {
  const Icon = module.icon;

  // Module descriptions
  const descriptions: Record<string, string> = {
    hrm: 'Manage employees, payroll & attendance',
    iam: 'Control access & security policies',
    inventory: 'Track stock & manage warehouses',
    crm: 'Manage leads & sales pipeline',
    accounts: 'Monitor finances & invoices',
    calendar: 'Schedule events & meetings'
  };

  // Generate chart data based on module
  const getChartData = () => {
    switch (module.id) {
      case 'hrm':
        return {
          type: 'pie',
          data: [
            { name: 'Active', value: 45 },
            { name: 'Leave', value: 8 },
            { name: 'Remote', value: 12 }
          ]
        };
      case 'iam':
        return {
          type: 'bar',
          data: [
            { name: 'Mon', users: 95 },
            { name: 'Tue', users: 98 },
            { name: 'Wed', users: 92 },
            { name: 'Thu', users: 98 },
            { name: 'Fri', users: 88 }
          ]
        };
      case 'inventory':
        return {
          type: 'bar',
          data: [
            { name: 'May', stock: 1100 },
            { name: 'Jun', stock: 1250 },
            { name: 'Jul', stock: 1180 },
            { name: 'Aug', stock: 1350 }
          ]
        };
      case 'crm':
        return {
          type: 'pie',
          data: [
            { name: 'Leads', value: 45 },
            { name: 'Deals', value: 32 },
            { name: 'Follow-ups', value: 67 }
          ]
        };
      case 'accounts':
        return {
          type: 'line',
          data: [
            { name: 'Apr', profit: 75, expenses: 150 },
            { name: 'May', profit: 85, expenses: 170 },
            { name: 'Jun', profit: 90, expenses: 175 },
            { name: 'Jul', profit: 95, expenses: 180 }
          ]
        };
      case 'calendar':
        return {
          type: 'bar',
          data: [
            { name: 'Mon', events: 3 },
            { name: 'Tue', events: 5 },
            { name: 'Wed', events: 2 },
            { name: 'Thu', events: 4 },
            { name: 'Fri', events: 6 }
          ]
        };
      default:
        return { type: 'line', data: [] };
    }
  };

  const chartData = getChartData();
  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

  const renderChart = () => {
    if (chartData.type === 'pie') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData.data as any}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={50}
              paddingAngle={2}
              dataKey="value"
            >
              {(chartData.data as any[]).map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend 
              iconSize={6}
              wrapperStyle={{ fontSize: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      );
    } else if (chartData.type === 'bar') {
      const firstItem = chartData.data[0] as any;
      const dataKey = Object.keys(firstItem)[1];
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData.data as any} margin={{ top: 5, right: 5, left: -25, bottom: 5 }} barSize={20}>
            <XAxis dataKey="name" stroke="#888" fontSize={10} />
            <YAxis stroke="#888" fontSize={10} />
            <Tooltip />
            <Bar dataKey={dataKey} fill={module.color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData.data as any} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
            <XAxis dataKey="name" stroke="#888" fontSize={10} />
            <YAxis stroke="#888" fontSize={10} />
            <Tooltip />
            <Legend 
              iconSize={6}
              wrapperStyle={{ fontSize: '10px' }}
            />
            <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={1.5} name="Profit" />
            <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={1.5} name="Expenses" />
          </LineChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <Card className="h-full shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 flex flex-col overflow-hidden" style={{ borderLeftColor: module.color }}>
      <CardHeader className="flex flex-row items-start justify-between pb-2 pt-3 px-4 space-y-0">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div className="p-1.5 rounded-md flex-shrink-0" style={{ backgroundColor: `${module.color}20` }}>
            <Icon className="w-4 h-4" style={{ color: module.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold leading-tight">{module.title}</CardTitle>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
              {descriptions[module.id] || module.description}
            </p>
          </div>
        </div>
        <div className="drag-handle cursor-move p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded flex-shrink-0">
          <GripVertical className="w-4 h-4 text-slate-400" />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col px-4 pb-3 pt-1 space-y-2">
        {/* Chart Section */}
        <div className="flex-1 min-h-0">
          {renderChart()}
        </div>
        
        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-1.5 pt-2 border-t">
          {Object.entries(module.stats).map(([key, value]) => (
            <div key={key} className="text-center px-1">
              <p className="text-[9px] text-slate-500 dark:text-slate-400 capitalize leading-tight">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </p>
              <p className="text-xs font-semibold mt-0.5 truncate" style={{ color: module.color }}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
