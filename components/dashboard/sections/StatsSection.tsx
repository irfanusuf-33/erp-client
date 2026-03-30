'use client';

import { useState, useEffect } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import ModuleCard from '@/components/dashboard/ModuleCard';
import KPICard from '@/components/dashboard/KPICard';
import SalesChart from '@/components/dashboard/SalesChart';
import CRMFunnel from '@/components/dashboard/CRMFunnel';
import { Users, Shield, Package, Briefcase, DollarSign, Calendar, TrendingUp, UserCheck } from 'lucide-react';
import { useGlobalStore } from '@/store';

const iconMap: Record<string, any> = {
  hrm: Users,
  iam: Shield,
  inventory: Package,
  crm: Briefcase,
  accounts: DollarSign,
  calendar: Calendar
};

export default function StatsSection() {
  const { getDashboardStats, dashboardData, dashboardLoading } = useGlobalStore();
  const [modules, setModules] = useState<any[]>([]);
  const [width, setWidth] = useState(1200);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateWidth = () => {
      const newWidth = window.innerWidth - 48;
      setWidth(newWidth);
      setIsMobile(window.innerWidth < 768);
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await getDashboardStats();
        const modulesWithIcons = data.modules.map(module => ({
          ...module,
          icon: iconMap[module.id] || Users
        }));
        setModules(modulesWithIcons);
      } catch (error) {
        // Error loading dashboard data
      }
    };

    fetchDashboardData();
  }, []);

  const layout = [
    { i: 'kpi-revenue', x: 0, y: 0, w: 2.4, h: 1.5, minW: 2, minH: 1.5, maxH: 1.5 },
    { i: 'kpi-users', x: 2.4, y: 0, w: 2.4, h: 1.5, minW: 2, minH: 1.5, maxH: 1.5 },
    { i: 'kpi-leads', x: 4.8, y: 0, w: 2.4, h: 1.5, minW: 2, minH: 1.5, maxH: 1.5 },
    { i: 'kpi-employees', x: 7.2, y: 0, w: 2.4, h: 1.5, minW: 2, minH: 1.5, maxH: 1.5 },
    { i: 'kpi-projects', x: 9.6, y: 0, w: 2.4, h: 1.5, minW: 2, minH: 1.5, maxH: 1.5 },
    { i: 'sales-chart', x: 0, y: 1.5, w: 6, h: 2.5, minW: 4, minH: 2.5, maxH: 3 },
    { i: 'crm-funnel', x: 6, y: 1.5, w: 6, h: 2.5, minW: 3, minH: 2.5, maxH: 3 },
    { i: 'module-hrm', x: 0, y: 4, w: 3, h: 2.5, minW: 3, minH: 2.5, maxH: 3 },
    { i: 'module-iam', x: 3, y: 4, w: 3, h: 2.5, minW: 3, minH: 2.5, maxH: 3 },
    { i: 'module-inventory', x: 6, y: 4, w: 3, h: 2.5, minW: 3, minH: 2.5, maxH: 3 },
    { i: 'module-crm', x: 9, y: 4, w: 3, h: 2.5, minW: 3, minH: 2.5, maxH: 3 },
    { i: 'module-accounts', x: 0, y: 6.5, w: 4, h: 2.5, minW: 3, minH: 2.5, maxH: 3 },
    { i: 'module-calendar', x: 4, y: 6.5, w: 4, h: 2.5, minW: 3, minH: 2.5, maxH: 3 },
    { i: 'module-other', x: 8, y: 6.5, w: 4, h: 2.5, minW: 3, minH: 2.5, maxH: 3 },
  ];

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {isMobile ? (
        <div className="space-y-4">
          <KPICard title="Total Revenue" value="₹2.5M" change={12.5} icon={DollarSign} color="#10b981" />
          <KPICard title="Active Users" value="1,248" change={8.2} icon={UserCheck} color="#3b82f6" />
          <KPICard title="New Leads" value="342" change={-3.1} icon={TrendingUp} color="#f59e0b" />
          <KPICard title="Total Employees" value="156" change={5.4} icon={Users} color="#8b5cf6" />
          <KPICard title="Active Projects" value="24" change={15.8} icon={Briefcase} color="#06b6d4" />
          <SalesChart />
          <CRMFunnel />
          {modules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      ) : (
        <div className="layout">
          <GridLayout
            {...{
              layout,
              cols: 12,
              rowHeight: 80,
              width,
              isDraggable: true,
              isResizable: true,
              draggableHandle: '.drag-handle',
              compactType: 'vertical',
              margin: [12, 12]
            }}
          >
          <div key="kpi-revenue">
            <KPICard title="Total Revenue" value="₹2.5M" change={12.5} icon={DollarSign} color="#10b981" />
          </div>
          <div key="kpi-users">
            <KPICard title="Active Users" value="1,248" change={8.2} icon={UserCheck} color="#3b82f6" />
          </div>
          <div key="kpi-leads">
            <KPICard title="New Leads" value="342" change={-3.1} icon={TrendingUp} color="#f59e0b" />
          </div>
          <div key="kpi-employees">
            <KPICard title="Total Employees" value="156" change={5.4} icon={Users} color="#8b5cf6" />
          </div>
          <div key="kpi-projects">
            <KPICard title="Active Projects" value="24" change={15.8} icon={Briefcase} color="#06b6d4" />
          </div>
          <div key="sales-chart">
            <SalesChart />
          </div>
          <div key="crm-funnel">
            <CRMFunnel />
          </div>
          {modules.map((module) => (
            <div key={`module-${module.id}`}>
              <ModuleCard module={module} />
            </div>
          ))}
          </GridLayout>
        </div>
      )}
    </div>
  );
}
