"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import moment from "moment";
import { CalendarDays, ChevronLeft, ChevronRight, ChevronDown, Settings, Timer } from "lucide-react";
import { useGlobalStore } from "@/store";
import type { CalendarEvent, NewEventForm } from "@/types/calendar.types";
import { showSuccess, showError, showInfo } from "@/lib/toast";
import CalendarDropdown from "./CalendarDropdown";
import EventModal from "./EventModal";
import EventDetailsModal from "./EventDetailsModal";
import MonthView from "./MonthView";
import DayView from "./DayView";
import EventOverflowPopup from "./EventOverflowPopup";
import CalendarSettingsModal from "./CalendarSettingsModal";

const ROW_H = 128; // px per hour row
const TIME_COL_W = 80; // px for time column

const timeSlots = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

const EMPTY_EVENT: NewEventForm = {
  title: "", start: "", end: "", description: "", color: "",
  type: "", inviteRequiredAttendees: [], meetingLink: "",
  allDay: false, selectedPlatform: "google", location: "", attachments: [],
};

export default function Calendar() {
  const { user, getAllEvents, createEvent, updateEvent, deleteEvent, getEventById, respondToEvent, generateMeetingLink } = useGlobalStore();

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [is24Hour, setIs24Hour] = useState(true);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isEventDetailsModalOpen, setIsEventDetailsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [firstDayOfWeek, setFirstDayOfWeek] = useState("Sunday");
  const [timeScale, setTimeScale] = useState("30 minutes");
  const [showWeekNumbers, setShowWeekNumbers] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [date, setDate] = useState(new Date());
  const [newEvent, setNewEvent] = useState<NewEventForm>(EMPTY_EVENT);
  const [, setSelectedDay] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedYear, setSelectedYear] = useState(moment().year());
  const [showMonthGrid] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(moment().month());
  const [selectedView, setSelectedView] = useState("Week");
  const [selectedPlatform, setSelectedPlatform] = useState("google");
  const [meetingLink, setMeetingLink] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [respondingStatus, setRespondingStatus] = useState<"accepted" | "rejected" | null>(null);
  const [overflowPopup, setOverflowPopup] = useState<{
    isOpen: boolean; events: CalendarEvent[]; position: { x: number; y: number };
  }>({ isOpen: false, events: [], position: { x: 0, y: 0 } });

  const timeScaleMinutes = useMemo(() => parseInt(timeScale.split(" ")[0]), [timeScale]);
  const slotsPerHour = useMemo(() => 60 / timeScaleMinutes, [timeScaleMinutes]);

  const weekDays = useMemo(() => {
    const dayMap: Record<string, number> = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
    const startDay = dayMap[firstDayOfWeek];
    const startOfWeek = moment(date).startOf("week").add(startDay, "days");
    return Array.from({ length: 7 }, (_, i) => {
      const day = startOfWeek.clone().add(i, "days");
      return {
        day: day.format("ddd").toUpperCase(),
        date: day.format("D"),
        dateMoment: day,
        isToday: !!(selectedDate && day.isSame(selectedDate, "day")),
      };
    });
  }, [date, selectedDate, firstDayOfWeek]);

  const displayTime = useCallback((time: string) => {
    if (is24Hour) return <span className="text-xs font-semibold text-gray-800 dark:text-zinc-100">{time}</span>;
    const [hour] = time.split(":");
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return <span className="text-xs font-semibold text-gray-800 dark:text-zinc-100">{h12}:00<span className="text-[9px] text-gray-500 ml-0.5">{ampm}</span></span>;
  }, [is24Hour]);

  const refreshEvents = useCallback(async () => {
    const res = await getAllEvents();
    if (res.success) { setEvents(res.data); return true; }
    return false;
  }, [getAllEvents]);

  useEffect(() => {
    const uid = (user as any)?._id || (user as any)?.id;
    if (!uid) return;
    (async () => {
      const res = await getAllEvents();
      if (res.success) {
        const normalized = res.data.map((e: any) => {
          let start, end;
          if (e.allDay) {
            const ss = (typeof e.start === "string" ? e.start : new Date(e.start).toISOString()).split("T")[0].split("-");
            const es = (typeof e.end === "string" ? e.end : new Date(e.end).toISOString()).split("T")[0].split("-");
            start = new Date(+ss[0], +ss[1] - 1, +ss[2], 0, 0, 0);
            end = new Date(+es[0], +es[1] - 1, +es[2], 23, 59, 59);
          } else {
            start = new Date(e.start);
            end = new Date(e.end);
          }
          return { ...e, start, end, inviteRequiredAttendees: e.inviteRequiredAttendees || e.attendies || [], organizerId: e.organizerId || uid };
        });
        setEvents(normalized);
      }
    })();
  }, [(user as any)?._id, (user as any)?.id]);

  useEffect(() => {
    document.body.style.overflow = overflowPopup.isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [overflowPopup.isOpen]);

  const handleSaveEvent = async () => {
    if (!newEvent.title.trim()) return;
    const attendies = newEvent.inviteRequiredAttendees
      .map((a: any) => typeof a === "string" ? a : a?.userEmail || a?.email || a?.userId)
      .filter(Boolean);
    let result: any;
    if (selectedEvent) {
      result = await updateEvent(selectedEvent.id, { title: newEvent.title, start: new Date(newEvent.start), end: new Date(newEvent.end), description: newEvent.description, type: newEvent.type, attendies, meetingLink: newEvent.meetingLink, allDay: newEvent.allDay, location: newEvent.location });
    } else {
      result = await createEvent({ title: newEvent.title, start: new Date(newEvent.start), end: new Date(newEvent.end), description: newEvent.description, type: newEvent.type, attendies, meetingLink: newEvent.meetingLink, allDay: newEvent.allDay, location: newEvent.location, attachments: newEvent.attachments });
    }
    if (result.success) {
      await refreshEvents();
      setIsEventModalOpen(false);
      setSelectedEvent(null);
      setNewEvent(EMPTY_EVENT);
      showSuccess(selectedEvent ? "Event Updated" : "Event Created", selectedEvent ? "Update emails have been queued." : "Invitation emails have been queued.");
    } else {
      showError(selectedEvent ? "Update Failed" : "Create Failed", result.msg || "Failed to save event");
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    const eventId = (selectedEvent as any)?._id || selectedEvent.id;
    if (!eventId) return;
    const result = await deleteEvent(eventId);
    if (result.success) {
      await refreshEvents();
      setIsEventModalOpen(false);
      setIsEventDetailsModalOpen(false);
      setSelectedEvent(null);
      showSuccess("Event Deleted", "Cancellation emails have been queued.");
    } else {
      showError("Delete Failed", result.msg || "Failed to delete event");
    }
  };

  const handleEventClick = async (event: CalendarEvent) => {
    const result = await getEventById(event.id);
    if (result.success) {
      const d = result.data;
      const attendeesList = (d.attendies || []).map((a: any) => a.userEmail || a.userId || a);
      setSelectedEvent(d);
      setNewEvent({ title: d.name || event.title, start: moment(d.startDate || event.start).format("YYYY-MM-DDTHH:mm"), end: moment(d.endDate || event.end).format("YYYY-MM-DDTHH:mm"), description: d.description || "", color: "#3b82f6", type: d.type || "", inviteRequiredAttendees: attendeesList, allDay: d.allDay || false, selectedPlatform: d.selectedPlatform || "google", location: d.location || "", meetingLink: d.meetingLink || "", attachments: [] });
      setIsEventDetailsModalOpen(true);
    }
  };

  const handleRespondFromDetails = async (status: "accepted" | "rejected") => {
    if (!selectedEvent) return;
    const eventId = (selectedEvent as any)?._id || selectedEvent.id;
    if (!eventId) return;
    setRespondingStatus(status);
    const result = await respondToEvent(eventId, status);
    if (result.success || result.already) {
      if (result.already) showInfo("Already Responded", result.msg || "You have already responded to this invite.");
      else showSuccess("Response Updated", `You have ${status} this invitation.`);
      const latest = await getEventById(eventId);
      if (latest.success) setSelectedEvent(latest.data);
      await refreshEvents();
    } else {
      showError("Response Failed", result.msg || "Unable to update your response.");
    }
    setRespondingStatus(null);
  };

  const handleGenerateLink = async (event: NewEventForm): Promise<string> => {
    const res = await generateMeetingLink(event.title, selectedPlatform.toLowerCase().trim(), new Date(event.start), new Date(event.end));
    if (typeof res?.data === "string" && res.data) {
      showSuccess("Meeting Link Ready", "Link generated successfully.");
      return res.data;
    }
    showError("Link Generation Failed", res?.msg || "Unable to generate meeting link. A fallback link will be used.");
    return "";
  };

  const handleTodayClick = () => {
    const today = new Date();
    setDate(today); setSelectedDate(today); setSelectedDay(null);
  };

  const getOverlappingEvents = (dayEvts: CalendarEvent[]) => {
    const groups: CalendarEvent[][] = [];
    dayEvts.forEach((event) => {
      const es = moment(event.start), ee = moment(event.end);
      let added = false;
      for (const group of groups) {
        if (group.some((g) => es.isBefore(moment(g.end)) && ee.isAfter(moment(g.start)))) {
          group.push(event); added = true; break;
        }
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

  const openNewEvent = (start: string, end: string) => {
    setNewEvent({ ...EMPTY_EVENT, start, end, color: "#3B8AEC52" });
    setSelectedEvent(null);
    setIsEventModalOpen(true);
  };

  const closeAllDropdowns = () => {
    setIsCalendarModalOpen(false);
    setIsFilterModalOpen(false);
    setIsSettingsModalOpen(false);
    setOverflowPopup({ isOpen: false, events: [], position: { x: 0, y: 0 } });
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-zinc-900 overflow-auto" onClick={closeAllDropdowns}>
      <div className="m-3 flex flex-col flex-1 bg-white dark:bg-zinc-900 rounded-xl shadow-xl overflow-hidden">

        {/* ── Header ── */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex-wrap gap-3">
          <div className="flex items-center gap-6 flex-wrap">
            {/* Month selector */}
            <div className="relative">
              <button
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-zinc-800 rounded-lg text-sm font-semibold text-gray-800 dark:text-zinc-100 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                onClick={(e) => { e.stopPropagation(); setIsCalendarModalOpen(!isCalendarModalOpen); }}
              >
                <span>
                  {moment(date).format("MMMM YYYY")}
                  {showWeekNumbers && selectedView !== "Month" && <span className="text-xs text-gray-500 font-normal ml-1">(Week {moment(date).week()})</span>}
                </span>
                <ChevronDown size={14} className="text-gray-500" />
              </button>
              {isCalendarModalOpen && (
                <CalendarDropdown
                  date={date} selectedDate={selectedDate} selectedYear={selectedYear}
                  showMonthGrid={showMonthGrid} selectedMonth={selectedMonth}
                  setDate={setDate} setSelectedDate={setSelectedDate}
                  setSelectedDay={(dayIndex: number | null) => {
                    setSelectedDay(dayIndex);
                    const dayMap: Record<string, number> = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
                    const startDay = dayMap[firstDayOfWeek];
                    const startOfWeek = moment(date).startOf("week").add(startDay, "days");
                    setSelectedDate(startOfWeek.clone().add(dayIndex, "days").toDate());
                  }}
                  setSelectedYear={setSelectedYear} setSelectedMonth={setSelectedMonth}
                  setIsCalendarModalOpen={setIsCalendarModalOpen} showWeekNumbers={showWeekNumbers}
                />
              )}
            </div>

            {/* 24h/12h */}
            {selectedView !== "Month" && (
              <div className="flex border-2 border-gray-300 dark:border-zinc-800 rounded-xl overflow-hidden">
                <button className={`px-2.5 py-1.5 text-xs font-semibold transition-all ${is24Hour ? "bg-blue-600 text-white" : "bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300"}`} onClick={() => setIs24Hour(true)}>24 H</button>
                <button className={`px-2.5 py-1.5 text-xs font-semibold transition-all ${!is24Hour ? "bg-blue-600 text-white" : "bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300"}`} onClick={() => setIs24Hour(false)}>12 H</button>
              </div>
            )}

            {/* Today */}
            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors" onClick={handleTodayClick}>Today</button>

            {/* Arrows */}
            <div className="flex gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300 transition-colors" onClick={() => setDate(selectedView === "Month" ? moment(date).subtract(1, "month").toDate() : selectedView === "Day" ? moment(date).subtract(1, "day").toDate() : moment(date).subtract(1, "week").toDate())}>
                <ChevronLeft size={18} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300 transition-colors" onClick={() => setDate(selectedView === "Month" ? moment(date).add(1, "month").toDate() : selectedView === "Day" ? moment(date).add(1, "day").toDate() : moment(date).add(1, "week").toDate())}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View selector */}
            <div className="relative">
              <button
                className="flex items-center gap-2 px-5 py-2 border border-gray-300 dark:border-zinc-800 rounded-lg text-sm font-semibold text-gray-700 dark:text-zinc-100 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                onClick={(e) => { e.stopPropagation(); setIsFilterModalOpen(!isFilterModalOpen); }}
              >
                {selectedView}
                <ChevronDown size={14} className="text-gray-500" />
              </button>
              {isFilterModalOpen && (
                <div className="absolute top-full right-0 mt-2 z-50">
                  <div className="bg-white dark:bg-zinc-900 border border-gray-900 dark:border-zinc-800 rounded-2xl shadow-lg py-2 w-44" onClick={(e) => e.stopPropagation()}>
                    {["Day", "Week", "Month"].map((v) => (
                      <label key={v} className={`flex items-center px-5 py-2.5 cursor-pointer text-sm font-medium text-gray-800 dark:text-zinc-100 transition-colors hover:bg-gray-100 dark:hover:bg-zinc-800 ${selectedView === v ? "bg-gray-200 dark:bg-zinc-800" : ""}`}>
                        <input type="radio" name="view" className="hidden" checked={selectedView === v} onChange={() => { setSelectedView(v); setIsFilterModalOpen(false); }} />
                        {v}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300 transition-colors" onClick={(e) => { e.stopPropagation(); setIsSettingsModalOpen(!isSettingsModalOpen); }}>
              <Settings size={18} />
            </button>

            <button
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
              onClick={() => openNewEvent(moment().format("YYYY-MM-DDTHH:mm"), moment().add(30, "minutes").format("YYYY-MM-DDTHH:mm"))}
            >
              <CalendarDays size={16} />
              New Event
            </button>
          </div>
        </div>

        {/* ── Views ── */}
        {selectedView === "Month" ? (
          <MonthView date={date} events={events} selectedDate={selectedDate} showWeekNumbers={showWeekNumbers}
            onDayClick={(d) => { setSelectedDate(d); setDate(d); }}
            onDayDoubleClick={(d) => setSelectedDate(d)}
            onEventClick={handleEventClick}
            onCreateEvent={({ start, end }) => openNewEvent(start, end)}
          />
        ) : selectedView === "Day" ? (
          <DayView date={date} events={events} is24Hour={is24Hour} timeScale={timeScale}
            onEventClick={handleEventClick}
            onCreateEvent={({ start, end }) => openNewEvent(start, end)}
          />
        ) : (
          /* ── Week view ── */
          <div className="flex flex-col flex-1 overflow-hidden border border-gray-200 dark:border-zinc-800 rounded-lg m-2">
            {/* Week header */}
            <div className={`flex border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 flex-shrink-0 ${showWeekNumbers ? "relative" : ""}`}>
              {showWeekNumbers && (
                <div className="absolute left-0 top-0 bottom-0 w-[50px] border-r border-gray-200 dark:border-zinc-800 flex items-center justify-center text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/20 z-10">
                  Week
                </div>
              )}
              <div className={`flex-shrink-0 flex items-center justify-center p-4 border-r border-gray-200 dark:border-zinc-800 ${showWeekNumbers ? "ml-[50px]" : ""}`} style={{ width: TIME_COL_W }}>
                <Timer size={20} className="text-gray-400" />
              </div>
              {weekDays.map((day, index) => (
                <div
                  key={index}
                  className={`flex-1 flex flex-col items-center py-3 border-r last:border-r-0 border-gray-200 dark:border-zinc-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors relative ${day.isToday ? "before:absolute before:top-0 before:left-0 before:right-0 before:h-1.5 before:bg-blue-600" : ""}`}
                  onClick={() => { setSelectedDate(day.dateMoment.toDate()); setSelectedDay(null); }}
                >
                  <div className={`text-2xl font-semibold mb-1 ${day.isToday ? "text-blue-600" : "text-gray-800 dark:text-zinc-100"}`}>{day.date}</div>
                  <div className={`text-xs font-semibold ${day.isToday ? "text-blue-600" : "text-gray-500"}`}>{day.day}</div>
                </div>
              ))}
            </div>

            {/* Time grid */}
            <div className="flex-1 overflow-y-auto relative" style={{ scrollbarWidth: "thin" }}>
              {showWeekNumbers && (
                <div className="absolute left-0 top-0 bottom-0 w-[50px] border-r border-gray-200 dark:border-zinc-800 flex items-center justify-center font-bold text-base text-blue-600 bg-blue-50/50 dark:bg-blue-900/10 z-10">
                  {moment(date).week()}
                </div>
              )}

              {timeSlots.map((time, rowIndex) => (
                <div key={rowIndex} className={`flex border-t border-gray-200 dark:border-zinc-800 ${showWeekNumbers ? "ml-[50px]" : ""}`} style={{ minHeight: ROW_H }}>
                  <div className="flex-shrink-0 flex items-start justify-center pt-1 border-r border-gray-200 dark:border-zinc-800" style={{ width: TIME_COL_W }}>
                    {displayTime(time)}
                  </div>
                  {weekDays.map((day, dayIndex) => (
                    <div key={dayIndex} className="flex-1 border-r last:border-r-0 border-gray-200 dark:border-zinc-800 relative flex flex-col">
                      {Array.from({ length: slotsPerHour }, (_, slotIndex) => {
                        const minutes = slotIndex * timeScaleMinutes;
                        return (
                          <div
                            key={slotIndex}
                            className="w-full hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors cursor-pointer"
                            style={{
                              height: `${ROW_H / slotsPerHour}px`,
                              borderBottom: timeScaleMinutes === 15 && slotIndex % 2 === 1 ? "1px solid #e5e7eb" :
                                timeScaleMinutes === 30 && slotIndex === 0 ? "1px solid #e5e7eb" :
                                timeScaleMinutes === 60 ? "none" : "1px solid #e0e4e7",
                            }}
                            onClick={() => {
                              const dt = day.dateMoment.clone().hour(rowIndex).minute(minutes);
                              openNewEvent(dt.format("YYYY-MM-DDTHH:mm"), dt.clone().add(timeScaleMinutes, "minutes").format("YYYY-MM-DDTHH:mm"));
                            }}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              ))}

              {/* Event blocks — rendered absolutely over the grid */}
              {weekDays.flatMap((day, dayIndex) => {
                const dayEvts = events.filter((e) => moment(e.start).isSame(day.dateMoment, "day"));
                return getOverlappingEvents(dayEvts).map((group, groupIndex) => {
                  const visible = group.slice(0, 3);
                  const hidden = group.slice(3);
                  const totalCols = Math.min(group.length, 3);
                  const wkOffset = showWeekNumbers ? 50 : 0;
                  const baseOffset = TIME_COL_W;

                  return (
                    <div key={`${dayIndex}-${groupIndex}`}>
                      {visible.map((event, eventIndex) => {
                        const es = moment(event.start), ee = moment(event.end);
                        // Clamp to same day to prevent overflow
                        const dayStart = day.dateMoment.clone().startOf("day");
                        const dayEnd = day.dateMoment.clone().endOf("day");
                        const clampedStart = moment.max(es, dayStart);
                        const clampedEnd = moment.min(ee, dayEnd);
                        const startHour = clampedStart.hour() + clampedStart.minute() / 60;
                        const durationHours = Math.max(clampedEnd.diff(clampedStart, "minutes") / 60, 0.25);
                        const top = startHour * (ROW_H + 1); // +1 for border
                        const height = Math.min(durationHours * (ROW_H + 1), 24 * (ROW_H + 1) - top - 2);
                        const colW = `calc((100% - ${baseOffset}px - ${wkOffset}px) / 7 / ${totalCols})`;
                        const left = `calc(${wkOffset}px + ${baseOffset}px + ${dayIndex} * (100% - ${baseOffset}px - ${wkOffset}px) / 7 + ${eventIndex} * (100% - ${baseOffset}px - ${wkOffset}px) / 7 / ${totalCols} + 2px)`;
                        return (
                          <div
                            key={event.id}
                            style={{ position: "absolute", top: `${top}px`, left, width: `calc(${colW} - 4px)`, height: `${Math.max(height, 20)}px`, backgroundColor: "#3b82f6", color: "white", padding: "4px 6px", borderRadius: 4, fontSize: 11, cursor: "pointer", zIndex: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", border: "1px solid #2563eb", boxSizing: "border-box", fontWeight: 600 }}
                            onClick={(e) => { e.stopPropagation(); handleEventClick(event); }}
                          >
                            {event.title}
                          </div>
                        );
                      })}
                      {hidden.length > 0 && (() => {
                        const refEvent = group[2];
                        const es = moment(refEvent.start);
                        const startHour = es.hour() + es.minute() / 60;
                        const top = startHour * (ROW_H + 1);
                        const wkOffset = showWeekNumbers ? 50 : 0;
                        return (
                          <div
                            style={{ position: "absolute", top: `${top}px`, left: `calc(${wkOffset}px + ${baseOffset}px + ${dayIndex} * (100% - ${baseOffset}px - ${wkOffset}px) / 7 + 2 * (100% - ${baseOffset}px - ${wkOffset}px) / 7 / 3 + 2px)`, width: `calc((100% - ${baseOffset}px - ${wkOffset}px) / 7 / 3 - 4px)`, height: 24, backgroundColor: "#6b7280", color: "white", padding: "2px 6px", borderRadius: 4, fontSize: 10, cursor: "pointer", zIndex: 15, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #4b5563", boxSizing: "border-box" }}
                            onClick={(e) => handleOverflowClick(hidden, e)}
                          >
                            +{hidden.length} more
                          </div>
                        );
                      })()}
                    </div>
                  );
                });
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <EventDetailsModal
        isOpen={isEventDetailsModalOpen}
        event={selectedEvent ? { ...selectedEvent, name: (selectedEvent as any).name || selectedEvent.title, startDate: new Date((selectedEvent as any).startDate || selectedEvent.start), endDate: new Date((selectedEvent as any).endDate || selectedEvent.end), attendies: (selectedEvent as any).attendies || selectedEvent.inviteRequiredAttendees || [], organizer: (selectedEvent as any).organizer || selectedEvent.organizerId, organizerName: (selectedEvent as any).organizerName, meetingLink: selectedEvent.meetingLink || "", description: selectedEvent.description || "" } : null}
        onClose={() => { setIsEventDetailsModalOpen(false); setSelectedEvent(null); }}
        onEdit={() => { setIsEventDetailsModalOpen(false); setIsEventModalOpen(true); }}
        onDelete={async () => { setIsEventDetailsModalOpen(false); await handleDeleteEvent(); }}
        onRespond={handleRespondFromDetails}
        respondingStatus={respondingStatus}
      />

      <EventModal
        isOpen={isEventModalOpen} selectedEvent={selectedEvent} newEvent={newEvent}
        onClose={() => { setIsEventModalOpen(false); setSelectedEvent(null); }}
        onSave={handleSaveEvent} onDelete={handleDeleteEvent} onEventChange={setNewEvent}
        allEvents={events} selectedPlatform={selectedPlatform} setSelectedPlatform={setSelectedPlatform}
        meetingLink={meetingLink} setMeetingLink={setMeetingLink}
        handleGenerateLink={handleGenerateLink} allDay={allDay} setAllDay={setAllDay}
      />

      <EventOverflowPopup
        isOpen={overflowPopup.isOpen} events={overflowPopup.events} position={overflowPopup.position}
        onClose={() => setOverflowPopup({ isOpen: false, events: [], position: { x: 0, y: 0 } })}
        onEventClick={(event) => { handleEventClick(event); setOverflowPopup({ isOpen: false, events: [], position: { x: 0, y: 0 } }); }}
      />

      <CalendarSettingsModal
        isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)}
        firstDayOfWeek={firstDayOfWeek} timeScale={timeScale} showWeekNumbers={showWeekNumbers}
        onFirstDayOfWeekChange={setFirstDayOfWeek} onTimeScaleChange={setTimeScale}
        onShowWeekNumbersChange={setShowWeekNumbers}
      />
    </div>
  );
}
