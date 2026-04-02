'use client';

import { useState } from 'react';
import { 
  Megaphone, BarChart3, ShoppingCart, Package, Users, 
  ShoppingBag, CheckSquare, TrendingUp, Activity, 
  Award, Bell, Sparkles, ChevronDown, Globe
} from 'lucide-react';

export type DashboardTab = 
  | 'announcements'
  | 'stats'
  | 'sales'
  | 'inventory'
  | 'workforce'
  | 'procurement'
  | 'approvals'
  | 'analytics'
  | 'activity'
  | 'team'
  | 'insights'
  | 'social'
  | 'network';

interface Tab {
  id: DashboardTab;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: 'announcements', label: 'Announcements', icon: <Megaphone className="w-4 h-4" /> },
  { id: 'stats', label: 'Statistics', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'sales', label: 'Sales', icon: <ShoppingCart className="w-4 h-4" /> },
  { id: 'inventory', label: 'Inventory', icon: <Package className="w-4 h-4" /> },
  { id: 'workforce', label: 'Workforce', icon: <Users className="w-4 h-4" /> },
  { id: 'procurement', label: 'Procurement', icon: <ShoppingBag className="w-4 h-4" /> },
  { id: 'approvals', label: 'Approvals', icon: <CheckSquare className="w-4 h-4" /> },
  { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> },
  { id: 'team', label: 'Team', icon: <Award className="w-4 h-4" /> },
  { id: 'insights', label: 'Insights', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'social', label: 'Social Feed', icon: <Bell className="w-4 h-4" /> },
  { id: 'network', label: 'Network', icon: <Globe className="w-4 h-4" /> },
];

interface DashboardTabsProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

export default function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const activeTabData = tabs.find(tab => tab.id === activeTab) || tabs[0];

  const handleTabSelect = (tabId: DashboardTab) => {
    onTabChange(tabId);
    setIsDropdownOpen(false);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-16 z-20">
      <div className="px-4 md:px-6">
        {/* Mobile Dropdown */}
        <div className="md:hidden py-3">
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-slate-50 dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                {activeTabData.icon}
                <span className="text-sm font-medium text-slate-900 dark:text-zinc-100">
                  {activeTabData.label}
                </span>
              </div>
              <ChevronDown 
                className={`w-5 h-5 text-slate-500 dark:text-zinc-400 transition-transform ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                />
                
                {/* Menu */}
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-lg z-20 max-h-[60vh] overflow-y-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabSelect(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {tab.icon}
                      <span className="text-sm font-medium">{tab.label}</span>
                      {activeTab === tab.id && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-blue-500" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
