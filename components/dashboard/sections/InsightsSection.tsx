'use client';

import UpcomingEvents from '@/components/dashboard/UpcomingEvents';
import QuickActions from '@/components/dashboard/QuickActions';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const aiInsights = [
  {
    id: '1',
    title: 'Revenue Forecast',
    description: 'Based on current trends, you are projected to exceed Q1 targets by 15%',
    type: 'positive',
    confidence: 92
  },
  {
    id: '2',
    title: 'Inventory Alert',
    description: '5 products are predicted to run out of stock within the next 7 days',
    type: 'warning',
    confidence: 87
  },
  {
    id: '3',
    title: 'Sales Opportunity',
    description: '12 leads are showing high engagement and ready for follow-up',
    type: 'info',
    confidence: 78
  },
  {
    id: '4',
    title: 'Cost Optimization',
    description: 'Potential savings of ₹45K identified in operational expenses',
    type: 'positive',
    confidence: 85
  }
];

export default function InsightsSection() {
  return (
    <div className="space-y-6">
      {/* AI Insights Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100">AI-Powered Insights</h2>
          <p className="text-sm text-slate-600 dark:text-zinc-400">Smart recommendations for your business</p>
        </div>
      </div>

      {/* AI Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {aiInsights.map((insight) => (
          <div
            key={insight.id}
            className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                insight.type === 'positive' 
                  ? 'bg-green-100 dark:bg-green-900/30' 
                  : insight.type === 'warning'
                  ? 'bg-yellow-100 dark:bg-yellow-900/30'
                  : 'bg-blue-100 dark:bg-blue-900/30'
              }`}>
                {insight.type === 'positive' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : insight.type === 'warning' ? (
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                ) : (
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                    {insight.title}
                  </h3>
                  <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                    {insight.confidence}% confidence
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                  {insight.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Calendar and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-1">
          <UpcomingEvents />
        </div>
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
