'use client';

import { useState } from 'react';
import { useGlobalStore } from '@/store';
import DashboardTabs, { DashboardTab } from '@/components/dashboard/DashboardTabs';
import AnnouncementsSection from '@/components/dashboard/sections/AnnouncementsSection';
import StatsSection from '@/components/dashboard/sections/StatsSection';
import SalesSection from '@/components/dashboard/sections/SalesSection';
import InventorySection from '@/components/dashboard/sections/InventorySection';
import WorkforceSection from '@/components/dashboard/sections/WorkforceSection';
import ActivitySection from '@/components/dashboard/sections/ActivitySection';
import InsightsSection from '@/components/dashboard/sections/InsightsSection';
import SocialFeedSection from '@/components/dashboard/sections/SocialFeedSection';
import NetworkSection from '@/components/dashboard/sections/NetworkSection';
import PlaceholderSection from '@/components/dashboard/sections/PlaceholderSection';
import { ShoppingBag, CheckSquare, TrendingUp, Award } from 'lucide-react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('announcements');
  const user = useGlobalStore((state: any) => state.user);

  const capitalizeWords = (str: string) =>
    str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

  const userName = user ? capitalizeWords(`${user.fName} ${user.lName}`) : 'User';

  const renderSection = () => {
    switch (activeTab) {
      case 'announcements': return <AnnouncementsSection />;
      case 'stats': return <StatsSection />;
      case 'sales': return <SalesSection />;
      case 'inventory': return <InventorySection />;
      case 'workforce': return <WorkforceSection />;
      case 'procurement': return <PlaceholderSection title="Procurement Management" description="Manage purchase orders, vendor relationships, and procurement workflows" icon={<ShoppingBag className="w-10 h-10 text-blue-600 dark:text-blue-400" />} />;
      case 'approvals': return <PlaceholderSection title="Approvals & Tasks" description="Review pending approvals and manage your task assignments" icon={<CheckSquare className="w-10 h-10 text-blue-600 dark:text-blue-400" />} />;
      case 'analytics': return <PlaceholderSection title="Business Analytics" description="Comprehensive analytics and business intelligence insights" icon={<TrendingUp className="w-10 h-10 text-blue-600 dark:text-blue-400" />} />;
      case 'activity': return <ActivitySection />;
      case 'team': return <PlaceholderSection title="Team Performance" description="Monitor team performance metrics and collaboration" icon={<Award className="w-10 h-10 text-blue-600 dark:text-blue-400" />} />;
      case 'insights': return <InsightsSection />;
      case 'social': return <SocialFeedSection />;
      case 'network': return <NetworkSection />;
      default: return <AnnouncementsSection />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-900">
      {/* Header — not sticky, scrolls away */}
      <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-4 md:px-6 py-4">
        <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-zinc-100">
          Hi, {userName}!
        </h1>
        <p className="text-xs md:text-sm text-slate-600 dark:text-zinc-400 mt-0.5">
          Here&apos;s what&apos;s happening with your business today
        </p>
      </div>

      {/* Dashboard Tabs — sticky just below navbar */}
      <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content */}
      <div className="p-4 md:p-6">
        {renderSection()}
      </div>
    </div>
  );
}