'use client';

import { Users, Briefcase, Calendar, Clock } from 'lucide-react';

export default function WorkforceSection() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">156</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Total Employees</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">24</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Active Projects</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">8</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Leave Requests</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">142</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Present Today</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Project Status</h3>
          <div className="space-y-3">
            {[
              { name: 'Website Redesign', progress: 75, status: 'On Track' },
              { name: 'Mobile App', progress: 45, status: 'In Progress' },
              { name: 'CRM Integration', progress: 90, status: 'Almost Done' },
              { name: 'Marketing Campaign', progress: 30, status: 'Started' }
            ].map((project) => (
              <div key={project.name} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{project.name}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{project.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Department Overview</h3>
          <div className="space-y-3">
            {[
              { dept: 'Engineering', count: 45 },
              { dept: 'Sales', count: 32 },
              { dept: 'Marketing', count: 28 },
              { dept: 'HR', count: 12 },
              { dept: 'Finance', count: 18 },
              { dept: 'Operations', count: 21 }
            ].map((item) => (
              <div key={item.dept} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.dept}</span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.count} employees</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
