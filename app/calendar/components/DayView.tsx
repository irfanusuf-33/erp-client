"use client";
import React, { useState, useEffect, useCallback } from "react";
import moment from "moment";
import { Timer } from "lucide-react";
import type { CalendarEvent } from "@/types/calendar.types";
import EventOverflowPopup from "./EventOverflowPopup";

interface Props {
  date: Date; events: CalendarEvent[]; is24Hour: boolean; timeScale: string;
  onEventClick: (event: CalendarEvent) => void;
  onCreateEvent: (eventData: { start: string; end: string }) => void;
}

const ROW_H = 128;
const timeSlots = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

export default function DayView({ date, events, is24Hour, timeScale, onEventClick, onCreateEvent }: Props) {
  const [overflowPopup, setOverflowPopup] = useState<{ isOpen: boolean; events: CalendarEvent[]; position: { x: number; y: number }; }>({ isOpen: false, events: [], position: { x: 0, y: 0 } });

  const timeScaleMinutes = parseInt(timeScale.split(" ")[0]);
  const slotsPerHour = 60 / timeScaleMinutes;

  const displayTime = useCallback((time: string) => {
    if (is24Hour) return <span className="text-xs font-semibold text-gray-800 dark:text-zinc-100">{time}</span>;
    const [hour] = time.split(":");
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return <span className="text-xs font-semibold text-gray-800 dark:text-zinc-100">{h12}:00<span className="text-[9px] text-gray-500 ml-0.5">{ampm}</span></span>;
  }, [is24Hour]);

  const dayMoment = moment(date);
  const dayEvents = events.filter((e) => moment(e.start).isSame(dayMoment, "day"));

  const getOverlappingGroups = (evts: CalendarEvent[]) => {
    const groups: CalendarEvent[][] = [];
    const sorted = [...evts].sort((a, b) => moment(a.start).valueOf() - moment(b.start).valueOf());
    sorted.forEach((event) => {
      const es = moment(event.start), ee = moment(event.end);
      let added = false;
      for (const group of groups) {
        if (group.some((g) => es.isBefore(moment(g.end)) && ee.isAfter(moment(g.start)))) { group.push(event); added = true; break; }
      }
      if (!added) groups.push([event]);
    });
    return groups;
  };

  const handleOverflowClick = (evts: CalendarEvent[], e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setOverflowPopup({ isOpen: true, events: evts, position: { x: rect.left, y: rect.bottom + 5 } });
  };

  useEffect(() => {
    document.body.style.overflow = overflowPopup.isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [overflowPopup.isOpen]);

  return (
    <>
      <div className="flex flex-col flex-1 overflow-hidden border border-gray-200 dark:border-zinc-800 rounded-lg m-2">
        {/* Header */}
        <div className="grid border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 flex-shrink-0" style={{ gridTemplateColumns: "80px 1fr" }}>
          <div className="flex items-center justify-center p-4 border-r border-gray-200 dark:border-zinc-800"><Timer size={20} className="text-gray-400" /></div>
          <div className="flex flex-col items-center justify-center py-4 relative before:absolute before:top-0 before:left-0 before:right-0 before:h-1.5 before:bg-blue-600">
            <div className="text-2xl font-bold text-blue-600 mb-1">{dayMoment.format("D")}</div>
            <div className="text-xs font-semibold text-blue-600">{dayMoment.format("ddd").toUpperCase()}</div>
          </div>
        </div>

        {/* Time grid */}
        <div className="flex-1 overflow-y-auto relative" style={{ scrollbarWidth: "thin" }}>
          {timeSlots.map((time, rowIndex) => (
            <div key={rowIndex} className="grid border-t border-gray-200 dark:border-zinc-800" style={{ gridTemplateColumns: "80px 1fr", minHeight: ROW_H }}>
              <div className="flex items-start justify-center pt-1 border-r border-gray-200 dark:border-zinc-800">{displayTime(time)}</div>
              <div className="relative flex flex-col">
                {Array.from({ length: slotsPerHour }, (_, slotIndex) => {
                  const minutes = slotIndex * timeScaleMinutes;
                  return (
                    <div
                      key={slotIndex}
                      className="w-full hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors cursor-pointer"
                      style={{ height: `${ROW_H / slotsPerHour}px`, borderBottom: timeScaleMinutes === 15 && slotIndex % 2 === 1 ? "1px solid #e5e7eb" : timeScaleMinutes === 30 && slotIndex === 0 ? "1px dashed #d1d1d1" : timeScaleMinutes === 60 ? "none" : "1px solid #e0e4e7" }}
                      onClick={() => { const dt = dayMoment.clone().hour(rowIndex).minute(minutes); onCreateEvent({ start: dt.format("YYYY-MM-DDTHH:mm"), end: dt.clone().add(timeScaleMinutes, "minutes").format("YYYY-MM-DDTHH:mm") }); }}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          {/* Events */}
          {getOverlappingGroups(dayEvents).map((group, groupIndex) => {
            const maxVisible = 2;
            const visible = group.slice(0, maxVisible);
            const hidden = group.slice(maxVisible);
            const totalW = 91;
            const evtW = totalW / visible.length - 1;
            return (
              <div key={groupIndex}>
                {visible.map((event, eventIndex) => {
                  const es = moment(event.start), ee = moment(event.end);
                  const dayStart = dayMoment.clone().startOf("day");
                  const dayEnd = dayMoment.clone().endOf("day");
                  const cs = moment.max(es, dayStart), ce = moment.min(ee, dayEnd);
                  const startMins = cs.hour() * 60 + cs.minute();
                  const durMins = Math.max(ce.diff(cs, "minutes"), 15);
                  const topPct = (startMins / 1440) * 99.9;
                  const heightPct = (durMins / 1440) * 100;
                  const left = 8 + eventIndex * (evtW + 1);
                  return (
                    <div key={event.id} className="absolute bg-blue-500 text-white rounded px-1.5 py-0.5 text-[11px] font-semibold cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap border border-blue-600 hover:bg-blue-600 transition-colors" style={{ top: `${topPct}%`, height: `${Math.max(heightPct, 2)}%`, width: `${evtW}%`, left: `${left}%`, zIndex: 10 + eventIndex }} onClick={(e) => { e.stopPropagation(); onEventClick(event); }}>{event.title}</div>
                  );
                })}
                {hidden.length > 0 && (
                  <div className="absolute bg-gray-500 text-white rounded px-1.5 py-0.5 text-[11px] font-semibold cursor-pointer flex items-center justify-center border border-gray-600 hover:bg-gray-600 transition-colors" style={{ top: `${(moment(group[1].start).hour() * 60 + moment(group[1].start).minute()) / 1440 * 99.9}%`, height: `${Math.max((moment(group[1].end).diff(moment(group[1].start), "minutes") / 1440) * 100 * 0.35, 2)}%`, width: `${evtW}%`, left: `${8 + (maxVisible - 1) * (evtW + 1)}%`, zIndex: 20 }} onClick={(e) => handleOverflowClick(hidden, e)}>+{hidden.length}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <EventOverflowPopup isOpen={overflowPopup.isOpen} events={overflowPopup.events} position={overflowPopup.position} onClose={() => setOverflowPopup({ isOpen: false, events: [], position: { x: 0, y: 0 } })} onEventClick={onEventClick} />
    </>
  );
}
