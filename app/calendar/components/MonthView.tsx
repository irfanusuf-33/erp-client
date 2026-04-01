"use client";
import React, { useState, useEffect, useMemo } from "react";
import moment from "moment";
import type { CalendarEvent } from "@/types/calendar.types";
import EventOverflowPopup from "./EventOverflowPopup";

interface Props {
  date: Date; events: CalendarEvent[]; selectedDate: Date | null;
  onDayClick: (date: Date) => void; onDayDoubleClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onCreateEvent: (eventData: { start: string; end: string }) => void;
  showWeekNumbers?: boolean;
}

export default function MonthView({ date, events, selectedDate, onDayClick, onEventClick, onCreateEvent, showWeekNumbers = false }: Props) {
  const selectedDayOfWeek = selectedDate ? moment(selectedDate).day() : null;
  const [overflowPopup, setOverflowPopup] = useState<{ isOpen: boolean; events: CalendarEvent[]; position: { x: number; y: number }; }>({ isOpen: false, events: [], position: { x: 0, y: 0 } });

  const handleOverflowClick = (evts: CalendarEvent[], e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setOverflowPopup({ isOpen: true, events: evts, position: { x: rect.left, y: rect.bottom + 5 } });
  };

  useEffect(() => {
    document.body.style.overflow = overflowPopup.isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [overflowPopup.isOpen]);

  const monthDays = useMemo(() => {
    const startOfMonth = moment(date).startOf("month");
    const endOfMonth = moment(date).endOf("month");
    const startOfWeek = startOfMonth.clone().startOf("week");
    const endOfWeek = endOfMonth.clone().endOf("week");
    const days = [];
    let current = startOfWeek.clone();
    while (current.isSameOrBefore(endOfWeek)) {
      days.push({ date: current.format("D"), dateMoment: current.clone(), isCurrentMonth: current.isSame(date, "month"), isToday: current.isSame(moment(), "day") });
      current.add(1, "day");
    }
    return days;
  }, [date]);

  return (
    <>
      <div className="flex flex-col flex-1 overflow-hidden border border-gray-200 dark:border-zinc-800 rounded-lg m-2">
        {/* Header row */}
        <div className={`grid bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex-shrink-0 ${showWeekNumbers ? "grid-cols-[70px_repeat(7,1fr)]" : "grid-cols-7"}`}>
          {showWeekNumbers && <div className="px-4 py-4 text-center text-sm font-semibold text-gray-800 dark:text-zinc-100 border-r border-gray-200 dark:border-zinc-800">Week</div>}
          {["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((day, index) => (
            <div
              key={day}
              className={`px-4 py-4 text-center text-sm font-semibold border-r last:border-r-0 border-gray-200 dark:border-zinc-800 cursor-pointer relative ${selectedDayOfWeek === index ? "text-blue-600 before:absolute before:top-0 before:left-0 before:right-0 before:h-1.5 before:bg-blue-600" : "text-gray-800 dark:text-zinc-100"}`}
              onClick={() => { const target = moment(date).startOf("week").add(index, "days"); onDayClick(target.toDate()); }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {Array.from({ length: Math.ceil(monthDays.length / 7) }, (_, weekIndex) => (
            <div key={weekIndex} className={`grid border-b border-gray-200 dark:border-zinc-800 ${showWeekNumbers ? "grid-cols-[70px_repeat(7,1fr)]" : "grid-cols-7"}`} style={{ minHeight: 120 }}>
              {showWeekNumbers && (
                <div className="flex items-center justify-center border-r border-t border-gray-200 dark:border-zinc-800 text-base font-semibold text-blue-600 bg-blue-50/30 dark:bg-blue-900/10">
                  {monthDays[weekIndex * 7].dateMoment.week()}
                </div>
              )}
              {monthDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => {
                const dayEvts = events.filter((e) => moment(e.start).isSame(day.dateMoment, "day"));
                const visible = dayEvts.slice(0, 2);
                const hiddenCount = dayEvts.length - 2;
                const isSelected = selectedDate && day.dateMoment.isSame(moment(selectedDate), "day");
                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`border-r last:border-r-0 border-t border-gray-200 dark:border-zinc-800 p-2 cursor-pointer transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/10 ${!day.isCurrentMonth ? "bg-gray-50 dark:bg-zinc-900" : "bg-white dark:bg-zinc-900"} ${isSelected ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}
                    onClick={(e) => { e.stopPropagation(); onDayClick(day.dateMoment.toDate()); onCreateEvent({ start: day.dateMoment.clone().hour(9).format("YYYY-MM-DDTHH:mm"), end: day.dateMoment.clone().hour(10).format("YYYY-MM-DDTHH:mm") }); }}
                  >
                    <div className={`text-sm font-semibold mb-1 ${!day.isCurrentMonth ? "text-gray-300 dark:text-gray-600" : day.isToday ? "text-blue-600 font-bold" : "text-gray-800 dark:text-zinc-100"}`}>{day.date}</div>
                    <div className="flex flex-col gap-1">
                      {visible.map((event) => (
                        <div key={event.id} className="bg-blue-500 text-white px-1.5 py-0.5 rounded text-[11px] font-medium truncate cursor-pointer hover:bg-blue-600 transition-colors" onClick={(e) => { e.stopPropagation(); onEventClick(event); }}>{event.title}</div>
                      ))}
                      {hiddenCount > 0 && (
                        <div className="bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-100 px-2 py-1 rounded-md text-[11px] font-medium cursor-pointer flex items-center justify-center h-[22px] hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors" onClick={(e) => handleOverflowClick(dayEvts.slice(2), e)}>+{hiddenCount}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <EventOverflowPopup isOpen={overflowPopup.isOpen} events={overflowPopup.events} position={overflowPopup.position} onClose={() => setOverflowPopup({ isOpen: false, events: [], position: { x: 0, y: 0 } })} onEventClick={onEventClick} />
    </>
  );
}
