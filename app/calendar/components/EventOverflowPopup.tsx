"use client";
import moment from "moment";
import type { CalendarEvent } from "@/types/calendar.types";

interface Props {
  isOpen: boolean;
  events: CalendarEvent[];
  position: { x: number; y: number };
  onClose: () => void;
  onEventClick: (event: CalendarEvent) => void;
}

export default function EventOverflowPopup({ isOpen, events, position, onClose, onEventClick }: Props) {
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 z-[999]" onClick={onClose} />
      <div
        className="fixed z-[1000] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-2xl min-w-[320px] max-w-[400px] py-2"
        style={{ left: position.x, top: position.y }}
        onClick={(e) => e.stopPropagation()}
      >
        {events.map((event, index) => (
          <div
            key={event.id}
            className="flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            style={{ borderBottom: index < events.length - 1 ? "1px solid rgb(191,191,191)" : "none" }}
            onClick={(e) => { e.stopPropagation(); onEventClick(event); onClose(); }}
          >
            <div className="min-w-[70px]">
              <div className="text-sm font-bold text-gray-900 dark:text-zinc-100">{moment(event.start).format("HH:mm")}</div>
              <div className="text-xs text-amber-500 font-normal mt-0.5">{moment(event.end).diff(moment(event.start), "minutes")} min</div>
            </div>
            <div className="text-sm font-medium text-gray-800 dark:text-zinc-100 leading-snug">{event.title}</div>
          </div>
        ))}
      </div>
    </>
  );
}
