'use client';

import { useEffect } from 'react';
import ModuleCard from '@/components/dashboard/ModuleCard';
import KPICard from '@/components/dashboard/KPICard';
import SalesChart from '@/components/dashboard/SalesChart';
import CRMFunnel from '@/components/dashboard/CRMFunnel';
import { Users, Shield, Package, Briefcase, DollarSign, Calendar, TrendingUp, UserCheck } from 'lucide-react';
import { useGlobalStore } from '@/store';
import GlobalLoader from '@/components/shared/GlobalLoader';

const iconMap: Record<string, any> = {
  hrm: Users,
  iam: Shield,
  inventory: Package,
  crm: Briefcase,
  accounts: DollarSign,
  calendar: Calendar,
};

const KPI_CARDS = [
  { title: 'Total Revenue',    value: '₹2.5M', change: 12.5,  icon: DollarSign, color: '#10b981' },
  { title: 'Active Users',     value: '1,248', change: 8.2,   icon: UserCheck,  color: '#3b82f6' },
  { title: 'New Leads',        value: '342',   change: -3.1,  icon: TrendingUp, color: '#f59e0b' },
  { title: 'Total Employees',  value: '156',   change: 5.4,   icon: Users,      color: '#8b5cf6' },
  { title: 'Active Projects',  value: '24',    change: 15.8,  icon: Briefcase,  color: '#06b6d4' },
];

export default function StatsSection() {
  const { getDashboardStats, dashboardData, dashboardLoading } = useGlobalStore();

  useEffect(() => {
    getDashboardStats().catch(() => {});
  }, []);

  const modules = (dashboardData?.modules ?? []).map((m: any) => ({
    ...m,
    icon: iconMap[m.id] || Users,
  }));

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-slate-500 dark:text-zinc-400 text-sm">Loading statistics...</p>
        </div>
      </div>
    );
  }else{

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {KPI_CARDS.map((kpi) => (
          <div key={kpi.title} className="h-24">
            <KPICard {...kpi} />
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 p-4 h-64">
          <SalesChart />
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 p-4 h-64">
          <CRMFunnel />
        </div>
      </div>

      {/* Module cards */}
      {modules.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((module: any) => (
            <div key={module.id} className="h-64">
              <ModuleCard module={module} />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  }

 
}
