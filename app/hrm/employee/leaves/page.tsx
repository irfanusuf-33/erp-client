"use client";

// app/hrm/employee/leaves/page.tsx

import { useState, useMemo, useEffect, useRef } from "react";
import {
  CalendarDays, CreditCard, Stethoscope, Briefcase,
  ChevronLeft, ChevronRight, ChevronDown, X,
} from "lucide-react";
import StatCard from "../../components/StatCard";

// ─── Types ───────────────────────────────────────────────────────────────────

type LeaveStatus = "Approved" | "Pending" | "Rejected";

interface LeaveHistory {
  _id: string;
  leaveType: string;
  from: string;
  to: string;
  days: number;
  status: LeaveStatus;
}

interface LeaveBalance {
  earned:  { used: number; total: number };
  sick:    { used: number; total: number };
  casual:  { used: number; total: number };
  unpaid:  { used: number | null; total: number | null };
}

interface LeaveApplication {
  from: string;
  to: string;
  leaveType: string;
  reason: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<LeaveStatus, string> = {
  Approved: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  Pending:  "bg-amber-50 text-amber-500 border border-amber-200",
  Rejected: "bg-rose-50 text-rose-500 border border-rose-200",
};

const TABLE_HEADERS = ["Leave type", "From", "To", "Days", "Status"];

const WEEK_DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const LEAVE_TYPES = [
  { label: "Earned Leave",  bg: "bg-emerald-500", border: "border-emerald-500", icon: "🗓" },
  { label: "Sick Leave",    bg: "bg-rose-500",    border: "border-rose-500",    icon: "🏥" },
  { label: "Unpaid Leave",  bg: "bg-amber-500",   border: "border-amber-500",   icon: "📋" },
  { label: "Casual Leave",  bg: "bg-blue-500",    border: "border-blue-500",    icon: "🏖" },
];

// ─── Shared Calendar helpers ──────────────────────────────────────────────────

function useMiniCalendar() {
  const today = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth    = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const cells = useMemo(() => [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ], [daysInMonth, firstDayOfWeek]);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  }

  function toDateKey(day: number) {
    return `${viewYear}-${String(viewMonth + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
  }

  function isToday(day: number) {
    return day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  }

  return { viewYear, viewMonth, cells, prevMonth, nextMonth, toDateKey, isToday };
}

// ─── Dashboard Calendar ───────────────────────────────────────────────────────

function DashboardCalendar({ appliedDates }: { appliedDates: Set<string> }) {
  const { viewMonth, cells, prevMonth, nextMonth, toDateKey, isToday } = useMiniCalendar();

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-700">
          {MONTH_NAMES[viewMonth]}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <ChevronLeft size={14} />
          </button>
          <button onClick={nextMonth} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-slate-400 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`b-${i}`} />;
          const t = isToday(day);
          const a = appliedDates.has(toDateKey(day));
          return (
            <div key={day} className={`flex items-center justify-center h-8 w-8 mx-auto rounded-full text-xs font-medium transition-colors
              ${t           ? "bg-blue-500 text-white"           : ""}
              ${a && !t    ? "bg-emerald-100 text-emerald-700"   : ""}
              ${!t && !a   ? "text-slate-600 hover:bg-slate-100" : ""}
            `}>{day}</div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-500">Applied Leaves :</span>
        <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
      </div>
    </div>
  );
}

// ─── Modal Calendar ───────────────────────────────────────────────────────────

function ModalCalendar({
  selectedDate,
  onSelect,
}: {
  selectedDate: string;
  onSelect: (date: string) => void;
}) {
  const { viewMonth, viewYear, cells, prevMonth, nextMonth, toDateKey, isToday } = useMiniCalendar();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold text-slate-700">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <ChevronRight size={14} className="text-slate-400" />
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <ChevronLeft size={14} />
          </button>
          <button onClick={nextMonth} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <ChevronRight size={14} />
          </button>
          <CalendarDays size={14} className="text-slate-400 ml-1" />
        </div>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-slate-400 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`b-${i}`} />;
          const key      = toDateKey(day);
          const selected = key === selectedDate;
          const t        = isToday(day);
          return (
            <button
              key={day}
              onClick={() => onSelect(key)}
              className={`flex items-center justify-center h-8 w-8 mx-auto rounded-full text-xs font-medium transition-colors
                ${selected        ? "bg-blue-500 text-white"                          : ""}
                ${t && !selected  ? "bg-blue-100 text-blue-600 font-bold"             : ""}
                ${!selected && !t ? "text-slate-600 hover:bg-slate-100"               : ""}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Apply Leave Modal ────────────────────────────────────────────────────────

function ApplyLeaveModal({
  isOpen,
  onClose,
  onApply,
}: {
  isOpen: boolean;
  onClose: () => void;
  onApply?: (data: LeaveApplication) => void;
}) {
  const [selectedType, setSelectedType] = useState("Earned Leave");
  const [fromDate, setFromDate]         = useState("");
  const [toDate, setToDate]             = useState("");
  const [reason, setReason]             = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef                     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  function reset() {
    setSelectedType("Earned Leave");
    setFromDate("");
    setToDate("");
    setReason("");
    setDropdownOpen(false);
  }

  function handleClose() { reset(); onClose(); }

  function handleApply() {
    if (!fromDate || !toDate || !selectedType) return;
    onApply?.({ from: fromDate, to: toDate, leaveType: selectedType, reason });
    handleClose();
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: "blur(4px)", backgroundColor: "rgba(15,23,42,0.35)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="relative flex flex-col items-center pt-8 pb-4 px-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
            <CalendarDays size={22} className="text-blue-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Apply for Leave</h2>
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-6">

          {/* Leave type chips */}
          <div className="flex flex-wrap gap-2">
            {LEAVE_TYPES.map((lt) => (
              <button
                key={lt.label}
                onClick={() => setSelectedType(lt.label)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                  ${selectedType === lt.label
                    ? `${lt.bg} text-white ${lt.border}`
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  }`}
              >
                <span>{lt.icon}</span>
                {lt.label}
              </button>
            ))}
          </div>

          {/* From + Calendar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Left: From, Leave Type, Reason */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">From</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Leave Type</label>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((v) => !v)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-left flex items-center justify-between outline-none focus:border-blue-400 transition-all bg-white"
                  >
                    <span className={selectedType ? "text-slate-700" : "text-slate-400"}>
                      {selectedType || "Search leave type..."}
                    </span>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 overflow-hidden">
                      {LEAVE_TYPES.map((lt) => (
                        <button
                          key={lt.label}
                          onClick={() => { setSelectedType(lt.label); setDropdownOpen(false); }}
                          className={`w-full text-left px-3 py-2.5 text-sm transition-colors hover:bg-slate-50
                            ${selectedType === lt.label ? "text-blue-500 font-medium bg-blue-50" : "text-slate-600"}`}
                        >
                          {selectedType === lt.label && <span className="mr-1.5">|</span>}
                          {lt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                  Reason <span className="text-slate-300">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for leave..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-600 placeholder:text-slate-300 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all resize-none"
                />
              </div>
            </div>

            {/* Right: To Calendar */}
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">To</label>
              <ModalCalendar selectedDate={toDate} onSelect={setToDate} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button
            onClick={handleClose}
            className="px-5 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!fromDate || !toDate || !selectedType}
            className="px-5 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MyLeaveDashboard() {
  const [modalOpen, setModalOpen] = useState(false);

  // Replace with real data from your store/API
  const balance: LeaveBalance = {
    earned:  { used: 3, total: 12 },
    sick:    { used: 2, total: 12 },
    casual:  { used: 5, total: 12 },
    unpaid:  { used: null, total: null },
  };

  const leaveHistory: LeaveHistory[] = [];

  const appliedDates = useMemo(() => {
    const set = new Set<string>();
    leaveHistory.forEach((leave) => {
      const start = new Date(leave.from);
      const end   = new Date(leave.to);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        set.add(d.toISOString().split("T")[0]);
      }
    });
    return set;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const statCards = [
    {
      heading: "Earned Leaves",
      number:  `${balance.earned.used}/${balance.earned.total}`,
      label:   "Days Used",
      color:   "#10B981",
      icon:    Briefcase,
      used:    balance.earned.used,
      total:   balance.earned.total,
    },
    {
      heading: "Sick Leaves",
      number:  `${balance.sick.used}/${balance.sick.total}`,
      label:   "Days Used",
      color:   "#EF4444",
      icon:    Stethoscope,
      used:    balance.sick.used,
      total:   balance.sick.total,
    },
    {
      heading: "Casual Leaves",
      number:  `${balance.casual.used}/${balance.casual.total}`,
      label:   "Days Used",
      color:   "#F59E0B",
      icon:    CalendarDays,
      used:    balance.casual.used,
      total:   balance.casual.total,
    },
    {
      heading: "Unpaid Leaves",
      number:  "--:--",
      label:   "Unlimited",
      color:   "#3B82F6",
      icon:    CreditCard,
      used:    null,
      total:   null,
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-50 min-h-screen">

      <h1 className="text-xl font-semibold text-slate-800">My Leave Dashboard</h1>

      {/* ── Stat Cards + Apply CTA ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="lg:col-span-1">
            <StatCard {...stat} />
          </div>
        ))}

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col items-center justify-center gap-3 lg:col-span-1">
          <p className="text-xs font-medium text-blue-500 text-center">Apply for leave here</p>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            Apply Leave
          </button>
        </div>
      </div>

      {/* ── Leave History + Calendar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700">Leave History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {TABLE_HEADERS.map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-slate-400 px-5 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaveHistory.length === 0 ? (
                  <tr>
                    <td colSpan={TABLE_HEADERS.length} className="text-center py-12 text-sm text-slate-400">
                      No leave history found
                    </td>
                  </tr>
                ) : (
                  leaveHistory.map((row) => (
                    <tr key={row._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 text-slate-700 font-medium whitespace-nowrap">{row.leaveType}</td>
                      <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{row.from}</td>
                      <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{row.to}</td>
                      <td className="px-5 py-3 text-slate-500">{row.days}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${STATUS_STYLES[row.status]}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Upcoming Leaves/Holidays</h2>
          <DashboardCalendar appliedDates={appliedDates} />
        </div>

      </div>

      {/* ── Modal ── */}
      <ApplyLeaveModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onApply={(data) => {
          console.log("Leave applied:", data);
          // call your store action here e.g. applyLeave(data)
        }}
      />

    </div>
  );
}