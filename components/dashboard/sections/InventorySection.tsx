'use client';

import { Package, TrendingDown, AlertTriangle, DollarSign } from 'lucide-react';

export default function InventorySection() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">1,248</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Total Items</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">23</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Low Stock Items</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">₹8.5M</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Inventory Value</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">12</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Pending Invoices</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Low Stock Alerts</h3>
          <div className="space-y-3">
            {['Product A', 'Product B', 'Product C', 'Product D'].map((product) => (
              <div key={product} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{product}</span>
                <span className="text-sm font-bold text-red-600 dark:text-red-400">5 units left</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {['Invoice #1234', 'Invoice #1235', 'Invoice #1236', 'Invoice #1237'].map((invoice) => (
              <div key={invoice} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{invoice}</span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">₹45,000</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
