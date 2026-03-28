'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, GripVertical, MapPin, Users } from 'lucide-react';

const events = [
  {
    title: 'Team Standup Meeting',
    date: 'Today',
    time: '2:00 PM',
    location: 'Conference Room A',
    attendees: 8,
    color: 'blue'
  },
  {
    title: 'Client Presentation',
    date: 'Tomorrow',
    time: '10:30 AM',
    location: 'Virtual Meeting',
    attendees: 5,
    color: 'green'
  },
  {
    title: 'Project Review Session',
    date: 'Mar 30',
    time: '5:00 PM',
    location: 'Board Room',
    attendees: 12,
    color: 'orange'
  },
  {
    title: 'HR Performance Review',
    date: 'Apr 2',
    time: '3:00 PM',
    location: 'HR Office',
    attendees: 3,
    color: 'purple'
  }
];

const colorMap: Record<string, { bg: string; border: string; text: string }> = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-l-blue-500', text: 'text-blue-600 dark:text-blue-400' },
  green: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-l-green-500', text: 'text-green-600 dark:text-green-400' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-l-orange-500', text: 'text-orange-600 dark:text-orange-400' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-l-purple-500', text: 'text-purple-600 dark:text-purple-400' },
};

export default function UpcomingEvents() {
  return (
    <Card className="h-full shadow-sm hover:shadow-md transition-shadow flex flex-col border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-4 pt-5 px-5 flex flex-row items-center justify-between flex-shrink-0 border-b border-slate-100 dark:border-slate-800">
        <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">Upcoming Events</CardTitle>
        <div className="drag-handle cursor-move p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">
          <GripVertical className="w-4 h-4 text-slate-400" />
        </div>
      </CardHeader>
      <CardContent className="pb-5 px-5 pt-4 flex-1 overflow-auto">
        <div className="space-y-3">
          {events.map((event, index) => {
            const colors = colorMap[event.color];
            return (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 ${colors.border} ${colors.bg} hover:shadow-sm transition-all`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                    {event.title}
                  </h4>
                  <Calendar className={`w-4 h-4 ${colors.text} flex-shrink-0`} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-medium">{event.date}</span>
                    <span>•</span>
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>{event.attendees} attendees</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
