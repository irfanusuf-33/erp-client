'use client';

import ActivityFeed from '@/components/dashboard/ActivityFeed';
import { TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart } from 'lucide-react';

const recentTransactions = [
  { id: '1', type: 'sale', description: 'Invoice #INV-2024-001', amount: 45000, status: 'completed', time: '2 hours ago' },
  { id: '2', type: 'purchase', description: 'Purchase Order #PO-2024-045', amount: -12500, status: 'pending', time: '3 hours ago' },
  { id: '3', type: 'sale', description: 'Invoice #INV-2024-002', amount: 28000, status: 'completed', time: '5 hours ago' },
  { id: '4', type: 'expense', description: 'Office Supplies', amount: -3200, status: 'completed', time: '1 day ago' },
  { id: '5', type: 'sale', description: 'Invoice #INV-2024-003', amount: 67500, status: 'completed', time: '1 day ago' },
  { id: '6', type: 'purchase', description: 'Purchase Order #PO-2024-046', amount: -8900, status: 'completed', time: '2 days ago' },
];

export default function ActivitySection() {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mb-1">₹1.4M</h3>
          <p className="text-sm text-slate-600 dark:text-zinc-400">Total Income</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mb-1">₹245K</h3>
          <p className="text-sm text-slate-600 dark:text-zinc-400">Total Expenses</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mb-1">156</h3>
          <p className="text-sm text-slate-600 dark:text-zinc-400">Total Orders</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mb-1">89</h3>
          <p className="text-sm text-slate-600 dark:text-zinc-400">Pending Items</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">Recent Transactions</h3>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    transaction.amount > 0 
                      ? 'bg-green-100 dark:bg-green-900/30' 
                      : 'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    <DollarSign className={`w-5 h-5 ${
                      transaction.amount > 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-zinc-100 truncate">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">{transaction.time}</p>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className={`text-sm font-bold ${
                    transaction.amount > 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString()}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    transaction.status === 'completed'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                  }`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
