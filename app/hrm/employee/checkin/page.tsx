"use client";

// app/hrm/employee/checkin/page.tsx

import { useState, useEffect, useRef } from "react";
import {
  Clock, LogIn, LogOut, Play, XCircle,
  CalendarDays, Plus, Trash2, CheckCircle2,
  ClipboardList, ChevronDown, User, CalendarOff,
  PartyPopper, Inbox,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type CheckInStatus = "checked-out" | "working" | "on-break";
type AvailabilityStatus = "Available" | "Not Available" | "In Meeting" | "On Call";

interface BreakEntry {
  id: string;
  label: string;
  start: Date;
  end: Date | null;
}

interface Task {
  id: string;
  text: string;
  done: boolean;
}

interface LeaveEntry {
  name: string;
  type: "Full Day" | "Half Day";
}

interface HolidayEntry {
  name: string;
  date: string;
}

interface EventEntry {
  title: string;
  datetime: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pad(n: number) { return String(n).padStart(2, "0"); }

function formatTime(date: Date) {
  const h  = date.getHours() % 12 || 12;
  const m  = pad(date.getMinutes());
  const s  = pad(date.getSeconds());
  const ap = date.getHours() >= 12 ? "PM" : "AM";
  return `${pad(h)}:${m}:${s} ${ap}`;
}

function formatShort(date: Date) {
  const h  = date.getHours() % 12 || 12;
  const m  = pad(date.getMinutes());
  const ap = date.getHours() >= 12 ? "PM" : "AM";
  return `${h}:${m} ${ap}`;
}

function formatDuration(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function formatDateLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "short", day: "2-digit",
  });
}

// ─── Constants ───────────────────────────────────────────────────────────────

const AVAILABILITY_OPTIONS: { label: AvailabilityStatus; color: string; dot: string }[] = [
  { label: "Available",     color: "text-emerald-600", dot: "bg-emerald-500" },
  { label: "Not Available", color: "text-slate-500",   dot: "bg-slate-400"   },
  { label: "In Meeting",    color: "text-rose-500",    dot: "bg-rose-500"    },
  { label: "On Call",       color: "text-orange-500",  dot: "bg-orange-500"  },
];

// ─── Empty state helper ───────────────────────────────────────────────────────

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-6 gap-2 text-slate-300">
      <Icon size={26} />
      <p className="text-xs text-slate-400">{message}</p>
    </div>
  );
}

// ─── Scrollable side list ─────────────────────────────────────────────────────

function SideList({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">{title}</h3>
      <div className="flex flex-col gap-2 overflow-y-auto pr-1 flex-1" style={{ maxHeight: 220 }}>
        {children}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CheckInDashboard() {
  // ── Clock ──
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // ── Check-in state ──
  const [status, setStatus]             = useState<CheckInStatus>("checked-out");
  const [checkInTime, setCheckInTime]   = useState<Date | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<Date | null>(null);

  // ── Breaks ──
  const [breaks, setBreaks]         = useState<BreakEntry[]>([]);
  const [breakStart, setBreakStart] = useState<Date | null>(null);

  const totalBreakMs = breaks.reduce((acc, b) => {
    if (b.end)       return acc + (b.end.getTime() - b.start.getTime());
    if (breakStart)  return acc + (now.getTime() - breakStart.getTime());
    return acc;
  }, 0);

  const totalLoginMs = checkInTime
    ? (checkOutTime ?? now).getTime() - checkInTime.getTime() - totalBreakMs
    : 0;

  // ── Availability ──
  const [availability, setAvailability]   = useState<AvailabilityStatus>("Available");
  const [availDropOpen, setAvailDropOpen] = useState(false);
  const availRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!availDropOpen) return;
    function h(e: MouseEvent) {
      if (availRef.current && !availRef.current.contains(e.target as Node)) setAvailDropOpen(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [availDropOpen]);

  // ── Tasks ──
  const [tasks, setTasks]       = useState<Task[]>([]);
  const [taskInput, setTaskInput] = useState("");

  function addTask() {
    if (!taskInput.trim()) return;
    setTasks((t) => [...t, { id: crypto.randomUUID(), text: taskInput.trim(), done: false }]);
    setTaskInput("");
  }

  // ── Data (replace with store selectors) ──
  const leaveToday: LeaveEntry[]       = [];
  const upcomingHolidays: HolidayEntry[] = [];
  const upcomingEvents: EventEntry[]   = [];

  // ── Handlers ──
  function handleCheckIn() {
    setCheckInTime(new Date());
    setCheckOutTime(null);
    setBreaks([]);
    setBreakStart(null);
    setStatus("working");
  }

  function handleCheckOut() {
    if (breakStart) {
      const end = new Date();
      setBreaks((b) => b.map((br) => br.end ? br : { ...br, end }));
      setBreakStart(null);
    }
    setCheckOutTime(new Date());
    setStatus("checked-out");
  }

  function handleStartBreak() {
    const start = new Date();
    setBreakStart(start);
    setBreaks((b) => [...b, { id: crypto.randomUUID(), label: `Break ${b.length + 1}`, start, end: null }]);
    setStatus("on-break");
  }

  function handleEndBreak() {
    const end = new Date();
    setBreaks((b) => b.map((br) => br.end ? br : { ...br, end }));
    setBreakStart(null);
    setStatus("working");
  }

  const statusConfig = {
    "checked-out": { label: "Checked Out", cls: "bg-slate-100 text-slate-500" },
    "working":     { label: "Working",     cls: "bg-emerald-100 text-emerald-600" },
    "on-break":    { label: "On Break",    cls: "bg-amber-100 text-amber-600" },
  }[status];

  const currentAvail = AVAILABILITY_OPTIONS.find((o) => o.label === availability)!;

  return (
    <div className="p-5 bg-slate-50 min-h-screen flex flex-col gap-5">

      {/* ── ROW 1: Clock | Break Details | On Leave ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-5">

        {/* Clock card */}
        <div className="bg-gradient-to-b from-slate-100 to-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center gap-3 relative">

          {/* Availability dot */}
          <div className="absolute top-4 right-4" ref={availRef}>
            <button
              onClick={() => setAvailDropOpen((v) => !v)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${currentAvail.dot}`} />
              <ChevronDown size={12} />
            </button>
            {availDropOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-lg shadow-lg py-1 w-40">
                {AVAILABILITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => { setAvailability(opt.label); setAvailDropOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50 transition-colors"
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${opt.dot}`} />
                    <span className={opt.color}>{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Clock size={36} className="text-blue-400" />
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-800 tabular-nums">{formatTime(now)}</p>
            <p className="text-xs text-slate-400 mt-1">{formatDateLabel(now)}</p>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.cls}`}>
            {statusConfig.label}
          </span>

          <div className="flex flex-col gap-2 w-full mt-1">
            {status === "checked-out" && (
              <button onClick={handleCheckIn} className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">
                <LogIn size={16} /> Check In
              </button>
            )}
            {status === "working" && (
              <>
                <button onClick={handleCheckOut} className="w-full flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">
                  <LogOut size={16} /> Check Out
                </button>
                <button onClick={handleStartBreak} className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">
                  <Play size={16} /> Start Break
                </button>
              </>
            )}
            {status === "on-break" && (
              <button onClick={handleEndBreak} className="w-full flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">
                <XCircle size={16} /> End Break
              </button>
            )}
          </div>
        </div>

        {/* Break Details */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-slate-700">Break Details</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-amber-50 rounded-lg p-3 text-center border border-amber-100">
              <p className="text-xs text-slate-500 mb-1">Total Breaks</p>
              <p className="text-2xl font-bold text-slate-800">{breaks.length}</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 text-center border border-amber-100">
              <p className="text-xs text-slate-500 mb-1">Total Break Time</p>
              <p className="text-2xl font-bold text-slate-800 tabular-nums">{formatDuration(totalBreakMs)}</p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-600 mb-2">Break History</h4>
            <div className="border border-slate-100 rounded-lg min-h-[90px]">
              {breaks.length === 0 ? (
                <EmptyState icon={ClipboardList} message="No Breaks Taken" />
              ) : (
                <div className="divide-y divide-slate-100">
                  {breaks.map((br) => {
                    const dur = br.end
                      ? Math.round((br.end.getTime() - br.start.getTime()) / 60000)
                      : null;
                    return (
                      <div key={br.id} className="flex items-center justify-between px-4 py-2.5 text-xs">
                        <span className="font-medium text-slate-600">{br.label}</span>
                        <div className="flex items-center gap-2 text-slate-500">
                          <span>{formatShort(br.start)}</span>
                          {dur !== null && (
                            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              {dur} mins
                            </span>
                          )}
                          <span className="text-slate-300">→</span>
                          <span className={br.end ? "text-slate-600" : "text-emerald-500 font-medium"}>
                            {br.end ? formatShort(br.end) : "Ongoing"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* On Leave Today */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <SideList title="On Leave Today">
            {leaveToday.length === 0 ? (
              <EmptyState icon={CalendarOff} message="No one on leave today" />
            ) : (
              leaveToday.map((e, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <User size={13} className="text-slate-400" />
                    </div>
                    <span className="text-xs text-slate-700 font-medium">{e.name}</span>
                  </div>
                  <span className={`text-[10px] font-semibold ${e.type === "Full Day" ? "text-rose-400" : "text-amber-500"}`}>
                    {e.type}
                  </span>
                </div>
              ))
            )}
          </SideList>
        </div>
      </div>

      {/* ── ROW 2: Today's Summary | Upcoming Holidays ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Today's Summary */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Today's Summary</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-emerald-200 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <LogIn size={14} className="text-emerald-500" />
                <p className="text-xs text-slate-500">Check-In Time</p>
              </div>
              <p className="text-lg font-bold text-slate-800 tabular-nums">
                {checkInTime ? formatShort(checkInTime) : "00:00:00"}
              </p>
            </div>
            <div className="border border-rose-200 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <LogOut size={14} className="text-rose-500" />
                <p className="text-xs text-slate-500">Check-Out Time</p>
              </div>
              <p className="text-lg font-bold text-slate-800 tabular-nums">
                {checkOutTime ? formatShort(checkOutTime) : "00:00:00"}
              </p>
            </div>
            <div className="border border-amber-200 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Clock size={14} className="text-amber-500" />
                <p className="text-xs text-slate-500">Total Break Time</p>
              </div>
              <p className="text-lg font-bold text-slate-800 tabular-nums">{formatDuration(totalBreakMs)}</p>
            </div>
            <div className="border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Clock size={14} className="text-blue-500" />
                <p className="text-xs text-slate-500">Total Login Hours</p>
              </div>
              <p className="text-lg font-bold text-slate-800 tabular-nums">{formatDuration(Math.max(0, totalLoginMs))}</p>
            </div>
          </div>
        </div>

        {/* Upcoming Holidays */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <SideList title="Upcoming Holidays">
            {upcomingHolidays.length === 0 ? (
              <EmptyState icon={PartyPopper} message="No upcoming holidays" />
            ) : (
              upcomingHolidays.map((h, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <CalendarDays size={13} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{h.name}</p>
                    <p className="text-[10px] text-slate-400">{h.date}</p>
                  </div>
                </div>
              ))
            )}
          </SideList>
        </div>
      </div>

      {/* ── ROW 3: Upcoming Events | Today's Tasks ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Upcoming Events</h3>
          {upcomingEvents.length === 0 ? (
            <EmptyState icon={Inbox} message="No upcoming events" />
          ) : (
            <div className="flex flex-col gap-2">
              {upcomingEvents.map((ev, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2.5">
                  <span className="text-xs font-medium text-slate-700">{ev.title}</span>
                  <span className="text-[10px] text-slate-400">{ev.datetime}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Tasks */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700">Today's Tasks</h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                placeholder="New task..."
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-400 w-36 placeholder:text-slate-300"
              />
              <button
                onClick={addTask}
                className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus size={13} /> Add Task
              </button>
            </div>
          </div>

          {tasks.length === 0 ? (
            <EmptyState icon={ClipboardList} message="No tasks yet" />
          ) : (
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-start gap-2 bg-slate-50 rounded-lg px-3 py-2.5">
                  <button
                    onClick={() => setTasks((t) => t.map((tk) => tk.id === task.id ? { ...tk, done: !tk.done } : tk))}
                    className="shrink-0 mt-0.5"
                  >
                    <CheckCircle2 size={15} className={task.done ? "text-emerald-500" : "text-slate-300"} />
                  </button>
                  <p className={`text-xs flex-1 leading-snug ${task.done ? "line-through text-slate-400" : "text-slate-700"}`}>
                    {task.text}
                  </p>
                  <button
                    onClick={() => setTasks((t) => t.filter((tk) => tk.id !== task.id))}
                    className="shrink-0 text-slate-300 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}