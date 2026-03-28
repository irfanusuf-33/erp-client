'use client';

import { Megaphone, Pin, TrendingUp, AlertCircle, Info, CheckCircle } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'urgent';
  date: string;
  author: string;
  pinned?: boolean;
}

const announcements: Announcement[] = [
  {
    id: '1',
    title: 'Q1 2026 Results Announced',
    message: 'We are pleased to announce record-breaking revenue of $2.5M this quarter, exceeding our targets by 15%. Great work team!',
    type: 'success',
    date: '2 hours ago',
    author: 'CEO Office',
    pinned: true
  },
  {
    id: '2',
    title: 'System Maintenance Scheduled',
    message: 'Planned maintenance window on Saturday, March 29th from 2:00 AM to 6:00 AM. All services will be temporarily unavailable.',
    type: 'warning',
    date: '5 hours ago',
    author: 'IT Department'
  },
  {
    id: '3',
    title: 'New Employee Onboarding',
    message: 'Please welcome our 5 new team members joining us next week. HR will be conducting orientation sessions on Monday.',
    type: 'info',
    date: '1 day ago',
    author: 'Human Resources'
  },
  {
    id: '4',
    title: 'Urgent: Invoice Approval Required',
    message: 'Multiple invoices pending approval in the accounting module. Please review and approve by end of day to avoid payment delays.',
    type: 'urgent',
    date: '1 day ago',
    author: 'Finance Team'
  },
  {
    id: '5',
    title: 'Product Launch Success',
    message: 'Our new product line has received overwhelming response with 500+ pre-orders in the first week. Marketing campaign performing exceptionally well.',
    type: 'success',
    date: '2 days ago',
    author: 'Product Team'
  },
  {
    id: '6',
    title: 'Team Building Event',
    message: 'Annual team building event scheduled for April 15th. Please RSVP by April 1st. Location and agenda details will be shared soon.',
    type: 'info',
    date: '3 days ago',
    author: 'HR Department'
  }
];

const getTypeStyles = (type: string) => {
  switch (type) {
    case 'success':
      return {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        icon: <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />,
        badge: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
      };
    case 'warning':
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-200 dark:border-yellow-800',
        icon: <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />,
        badge: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
      };
    case 'urgent':
      return {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        icon: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />,
        badge: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
      };
    default:
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        icon: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
        badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
      };
  }
};

export default function AnnouncementsSection() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Company Announcements</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Stay updated with the latest news</p>
          </div>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
          View All
        </button>
      </div>

      {/* Announcements Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {announcements.map((announcement) => {
          const styles = getTypeStyles(announcement.type);
          return (
            <div
              key={announcement.id}
              className={`relative p-5 rounded-xl border-2 ${styles.border} ${styles.bg} transition-all hover:shadow-lg`}
            >
              {announcement.pinned && (
                <div className="absolute top-3 right-3">
                  <Pin className="w-4 h-4 text-slate-500 dark:text-slate-400 fill-current" />
                </div>
              )}
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {styles.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {announcement.title}
                    </h3>
                  </div>
                  
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-3 leading-relaxed">
                    {announcement.message}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${styles.badge}`}>
                        {announcement.type.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {announcement.author}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {announcement.date}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
