'use client';

import { useState, useEffect } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import ModuleCard from '@/components/dashboard/ModuleCard';
import KPICard from '@/components/dashboard/KPICard';
import SalesChart from '@/components/dashboard/SalesChart';
import CRMFunnel from '@/components/dashboard/CRMFunnel';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import QuickActions from '@/components/dashboard/QuickActions';
import UpcomingEvents from '@/components/dashboard/UpcomingEvents';
import { Users, Shield, Package, Briefcase, DollarSign, Calendar, TrendingUp, UserCheck } from 'lucide-react';
import { useGlobalStore } from '@/store';
import { dashboardApi } from '@/lib/api/dashboard.api';

const iconMap: Record<string, any> = {
  hrm: Users,
  iam: Shield,
  inventory: Package,
  crm: Briefcase,
  accounts: DollarSign,
  calendar: Calendar
};

export default function DashboardPage() {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [width, setWidth] = useState(1200);
  const [isMobile, setIsMobile] = useState(false);
  
  // Get user from auth store
  const user = useGlobalStore((state: any) => state.user);
  
  // Capitalize first letter of each word
  const capitalizeWords = (str: string) => {
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  const userName = user 
    ? capitalizeWords(`${user.fName} ${user.lName}`)
    : 'User';

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
    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        const data = await dashboardApi.getDashboardStats();
        
        // Map icons to modules
        const modulesWithIcons = data.modules.map(module => ({
          ...module,
          icon: iconMap[module.id] || Users
        }));
        
        setModules(modulesWithIcons);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Define layout for all cards - optimized with no empty spaces
  const layout = [
    // KPI Cards - Row 1 (5 cards, smaller)
    { i: 'kpi-revenue', x: 0, y: 0, w: 2.4, h: 1.5, minW: 2, minH: 1.5, maxH: 1.5 },
    { i: 'kpi-users', x: 2.4, y: 0, w: 2.4, h: 1.5, minW: 2, minH: 1.5, maxH: 1.5 },
    { i: 'kpi-leads', x: 4.8, y: 0, w: 2.4, h: 1.5, minW: 2, minH: 1.5, maxH: 1.5 },
    { i: 'kpi-employees', x: 7.2, y: 0, w: 2.4, h: 1.5, minW: 2, minH: 1.5, maxH: 1.5 },
    { i: 'kpi-projects', x: 9.6, y: 0, w: 2.4, h: 1.5, minW: 2, minH: 1.5, maxH: 1.5 },
    
    // Charts Row - Row 2 (3 cards)
    { i: 'sales-chart', x: 0, y: 1.5, w: 5, h: 2.5, minW: 4, minH: 2.5, maxH: 3 },
    { i: 'crm-funnel', x: 5, y: 1.5, w: 3.5, h: 2.5, minW: 3, minH: 2.5, maxH: 3 },
    { i: 'upcoming-events', x: 8.5, y: 1.5, w: 3.5, h: 2.5, minW: 3, minH: 2.5, maxH: 3 },
    
    // Module Cards - Row 3 (4 cards)
    { i: 'module-hrm', x: 0, y: 4, w: 3, h: 2.5, minW: 3, minH: 2.5, maxH: 3 },
    { i: 'module-iam', x: 3, y: 4, w: 3, h: 2.5, minW: 3, minH: 2.5, maxH: 3 },
    { i: 'module-inventory', x: 6, y: 4, w: 3, h: 2.5, minW: 3, minH: 2.5, maxH: 3 },
    { i: 'module-crm', x: 9, y: 4, w: 3, h: 2.5, minW: 3, minH: 2.5, maxH: 3 },
    
    // Module Cards - Row 4 (4 cards)
    { i: 'module-accounts', x: 0, y: 6.5, w: 3, h: 2.5, minW: 3, minH: 2.5, maxH: 3 },
    { i: 'module-calendar', x: 3, y: 6.5, w: 3, h: 2.5, minW: 3, minH: 2.5, maxH: 3 },
    { i: 'activity-feed', x: 6, y: 6.5, w: 3, h: 2.5, minW: 3, minH: 2.5, maxH: 3 },
    { i: 'quick-actions', x: 9, y: 6.5, w: 3, h: 2.5, minW: 3, minH: 2.5, maxH: 3 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 md:px-6 py-4 sticky top-0 z-10">
        <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">
          Hi, {userName}!
        </h1>
        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
          Here's what's happening with your business today
        </p>
      </div>

      {/* Dashboard Grid */}
      <div className="p-4 md:p-6">
        {isMobile ? (
          // Mobile: Single column layout
          <div className="space-y-4">
            <KPICard title="Total Revenue" value="₹2.5M" change={12.5} icon={DollarSign} color="#10b981" />
            <KPICard title="Active Users" value="1,248" change={8.2} icon={UserCheck} color="#3b82f6" />
            <KPICard title="New Leads" value="342" change={-3.1} icon={TrendingUp} color="#f59e0b" />
            <KPICard title="Total Employees" value="156" change={5.4} icon={Users} color="#8b5cf6" />
            <KPICard title="Active Projects" value="24" change={15.8} icon={Briefcase} color="#06b6d4" />
            
            <SalesChart />
            <CRMFunnel />
            <UpcomingEvents />
            
            {modules.map((module) => (
              <ModuleCard key={module.id} module={module} />
            ))}
            
            <ActivityFeed />
            <QuickActions />
          </div>
        ) : (
          // Desktop: Grid layout
          <GridLayout
            {...{
              className: 'layout',
              layout: layout,
              cols: 12,
              rowHeight: 80,
              width: width,
              isDraggable: true,
              isResizable: true,
              draggableHandle: '.drag-handle',
              compactType: 'vertical',
              margin: [12, 12]
            }}
          >
          {/* KPI Cards */}
          <div key="kpi-revenue">
            <KPICard
              title="Total Revenue"
              value="₹2.5M"
              change={12.5}
              icon={DollarSign}
              color="#10b981"
            />
          </div>
          <div key="kpi-users">
            <KPICard
              title="Active Users"
              value="1,248"
              change={8.2}
              icon={UserCheck}
              color="#3b82f6"
            />
          </div>
          <div key="kpi-leads">
            <KPICard
              title="New Leads"
              value="342"
              change={-3.1}
              icon={TrendingUp}
              color="#f59e0b"
            />
          </div>
          <div key="kpi-employees">
            <KPICard
              title="Total Employees"
              value="156"
              change={5.4}
              icon={Users}
              color="#8b5cf6"
            />
          </div>
          <div key="kpi-projects">
            <KPICard
              title="Active Projects"
              value="24"
              change={15.8}
              icon={Briefcase}
              color="#06b6d4"
            />
          </div>

          {/* Charts */}
          <div key="sales-chart">
            <SalesChart />
          </div>
          <div key="crm-funnel">
            <CRMFunnel />
          </div>

          {/* Module Cards */}
          {modules.map((module) => (
            <div key={`module-${module.id}`}>
              <ModuleCard module={module} />
            </div>
          ))}

          {/* Activity & Actions */}
          <div key="activity-feed">
            <ActivityFeed />
          </div>
          <div key="upcoming-events">
            <UpcomingEvents />
          </div>
          <div key="quick-actions">
            <QuickActions />
          </div>
        </GridLayout>
        )}
      </div>
    </div>
  );
}
