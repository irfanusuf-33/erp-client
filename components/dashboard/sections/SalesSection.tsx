'use client';

import { ShoppingCart, TrendingUp, Users, DollarSign, Target, Phone } from 'lucide-react';

export default function SalesSection() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">+12.5%</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">₹1.2M</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Total Sales</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">+8.2%</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">342</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Active Leads</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">+15.3%</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">68%</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Conversion Rate</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Phone className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">+5.7%</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">156</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Follow-ups Today</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Sales Pipeline</h3>
          <div className="space-y-3">
            {['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won'].map((stage, idx) => (
              <div key={stage} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{stage}</span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{[45, 32, 18, 12, 8][idx]} deals</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Top Performers</h3>
          <div className="space-y-3">
            {['Sarah Johnson', 'Michael Chen', 'Emily Davis', 'James Wilson', 'Lisa Anderson'].map((name, idx) => (
              <div key={name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                    {name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{name}</span>
                </div>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">₹{[245, 198, 176, 154, 142][idx]}K</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
