'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, GripVertical } from 'lucide-react';

const events = [
  {
    title: 'Team Meeting',
    date: 'Today',
    time: '2:00 PM',
    color: '#3b82f6'
  },
  {
    title: 'Client Call',
    date: 'Tomorrow',
    time: '10:30 AM',
    color: '#10b981'
  },
  {
    title: 'Project Review',
    date: 'Mar 30',
    time: '5:00 PM',
    color: '#f59e0b'
  },
  {
    title: 'HR Review',
    date: 'Apr 2',
    time: '3:00 PM',
    color: '#8b5cf6'
  }
];

export default function UpcomingEvents() {
  return (
    <Card className="h-full shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <CardHeader className="pb-1 pt-2.5 px-3 flex flex-row items-center justify-between flex-shrink-0">
        <CardTitle className="text-sm font-semibold">Upcoming Events</CardTitle>
        <div className="drag-handle cursor-move p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
          <GripVertical className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </CardHeader>
      <CardContent className="pb-2 px-3 flex-1 flex flex-col justify-center">
        <div className="space-y-1.5">
          {events.map((event, index) => (
            <div key={index} className="flex gap-2 p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <div className="flex-shrink-0">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${event.color}15` }}>
                  <Calendar className="w-3.5 h-3.5" style={{ color: event.color }} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 truncate leading-tight">
                  {event.title}
                </h4>
                <div className="flex items-center gap-0.5 mt-0.5">
                  <Clock className="w-2 h-2 text-slate-400" />
                  <span className="text-[9px] text-slate-500">{event.date}, {event.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
