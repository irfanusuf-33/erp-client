"use client";

import { useState, useRef, useEffect } from "react";
import { Download, ChevronDown, Calendar, X } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type AttendanceStatus = "P" | "A" | "L" | "H" | "WO";
type ViewMode = "monthly" | "quarterly" | "biannual" | "annual";
type FilterOption = "this-month" | "last-3" | "last-6" | "last-12" | "custom";

interface DayRecord { date: string; status: AttendanceStatus; }
interface Employee {
  id: string;
  name: string;
  initials: string;
  color: string;
  records: DayRecord[];
}

// ── Constants ─────────────────────────────────────────────────────────────────
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_FULL  = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const STATUS_META: Record<AttendanceStatus, { label: string; short: string; bg: string; text: string; border: string; dot: string }> = {
  P:  { label:"Present",  short:"P",  bg:"bg-green-50",  text:"text-green-600",  border:"border-green-200",  dot:"bg-green-500"  },
  A:  { label:"Absent",   short:"A",  bg:"bg-red-50",    text:"text-red-500",    border:"border-red-200",    dot:"bg-red-500"    },
  L:  { label:"On Leave", short:"L",  bg:"bg-orange-50", text:"text-orange-500", border:"border-orange-200", dot:"bg-orange-400" },
  H:  { label:"Holiday",  short:"H",  bg:"bg-slate-100", text:"text-slate-400",  border:"border-slate-200",  dot:"bg-slate-400"  },
  WO: { label:"Week Off", short:"WO", bg:"bg-purple-50", text:"text-purple-400", border:"border-purple-200", dot:"bg-purple-400" },
};

const AVATAR_COLORS = [
  "bg-blue-500","bg-violet-500","bg-emerald-500","bg-rose-500",
  "bg-amber-500","bg-cyan-500","bg-indigo-500","bg-pink-500","bg-teal-500","bg-fuchsia-500",
];

const FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value:"this-month", label:"Last Month"     },
  { value:"last-3",     label:"Last 3 Months" },
  { value:"last-6",     label:"Last 6 Months" },
  { value:"last-12",    label:"Last Year"     },
  { value:"custom",     label:"Custom Range"  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function addDays(date: Date, n: number): Date {
  const d = new Date(date); d.setDate(d.getDate() + n); return d;
}
function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}
function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}
function formatDate(d: Date): string {
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

const today = new Date();

const EMPLOYEES: Employee[] = [];

// ── Tooltip ───────────────────────────────────────────────────────────────────
function Tooltip({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="relative group/tip inline-flex">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-slate-800 text-white text-[10px] font-medium rounded whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
        {label}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
      </div>
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: AttendanceStatus }) {
  const m = STATUS_META[status];
  return (
    <Tooltip label={m.label}>
      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-[11px] font-semibold border cursor-default ${m.bg} ${m.text} ${m.border}`}>
        {m.short}
      </span>
    </Tooltip>
  );
}

// ── Select ────────────────────────────────────────────────────────────────────
function Select({ value, options, onChange }: {
  value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
}

// ── Filter Pill ───────────────────────────────────────────────────────────────
function FilterPill({ option, active, onClick }: {
  option: { value: FilterOption; label: string }; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600"
      }`}
    >
      {option.label}
    </button>
  );
}

// ── Stats chip ────────────────────────────────────────────────────────────────
function StatsChip({ records }: { records: DayRecord[] }) {
  const present = records.filter(r => r.status === "P").length;
  const total   = records.filter(r => !["H","WO"].includes(r.status)).length || 1;
  const pct     = Math.round((present / total) * 100);
  return (
    <div className="flex flex-col items-center justify-center">
      <span className="text-xs font-bold text-blue-600">{pct}%</span>
      <span className="text-[10px] text-slate-400">{present}/{total}</span>
    </div>
  );
}

// ── Monthly View ──────────────────────────────────────────────────────────────
function MonthlyView({ employees, from, to }: { employees: Employee[]; from: Date; to: Date }) {
  const days: Date[] = [];
  let cur = new Date(from);
  while (cur <= to) { days.push(new Date(cur)); cur = addDays(cur, 1); }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-max w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            <th className="sticky left-0 z-10 bg-slate-50 px-5 py-3 text-left text-xs font-semibold text-slate-500 min-w-[160px] border-r border-slate-100">Employee</th>
            <th className="sticky left-[160px] z-10 bg-slate-50 px-3 py-3 text-center text-xs font-semibold text-slate-500 w-[70px] border-r border-slate-100">Stats</th>
            {days.map(d => (
              <th key={dateKey(d)} className="px-1 py-3 text-center text-xs font-semibold text-slate-400 w-9 min-w-[36px]">
                <div>{d.getDate()}</div>
                <div className="text-[9px] text-slate-300 font-normal">{MONTHS_SHORT[d.getMonth()]}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {employees.length === 0 ? (
            <tr>
              <td colSpan={days.length + 2} className="px-5 py-12 text-center text-sm text-slate-400">
                No employees found
              </td>
            </tr>
          ) : employees.map((emp, idx) => {
            const filtered = emp.records.filter(r => r.date >= dateKey(from) && r.date <= dateKey(to));
            const byDate = Object.fromEntries(filtered.map(r => [r.date, r.status]));
            return (
              <tr key={emp.id} className={`hover:bg-blue-50/20 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}>
                <td className="sticky left-0 z-10 px-5 py-3 border-r border-slate-100 bg-inherit">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full ${emp.color} flex items-center justify-center text-white text-[11px] font-bold shrink-0`}>{emp.initials}</div>
                    <span className="text-xs text-slate-600 truncate max-w-[90px]">{emp.name}</span>
                  </div>
                </td>
                <td className="sticky left-[160px] z-10 px-3 py-3 border-r border-slate-100 bg-inherit">
                  <div className="flex justify-center">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg px-2 py-1 min-w-[52px]">
                      <StatsChip records={filtered} />
                    </div>
                  </div>
                </td>
                {days.map(d => {
                  const k = dateKey(d);
                  const status = byDate[k] as AttendanceStatus | undefined;
                  return (
                    <td key={k} className="px-1 py-3 text-center w-9">
                      {status ? <div className="flex justify-center"><StatusBadge status={status} /></div>
                               : <span className="text-slate-200 text-xs">—</span>}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Quarterly View (weekly summary bars) ──────────────────────────────────────
function getWeeks(from: Date, to: Date): { label: string; start: Date; end: Date }[] {
  const weeks = [];
  let cur = new Date(from);
  while (cur <= to) {
    const wEnd = addDays(cur, 6);
    const end  = wEnd > to ? new Date(to) : wEnd;
    weeks.push({
      label: `${MONTHS_SHORT[cur.getMonth()]} ${cur.getDate()}`,
      start: new Date(cur),
      end,
    });
    cur = addDays(wEnd, 1);
  }
  return weeks;
}

function WeekBar({ records }: { records: DayRecord[] }) {
  const counts: Record<AttendanceStatus, number> = { P:0, A:0, L:0, H:0, WO:0 };
  records.forEach(r => counts[r.status]++);
  const total = records.length || 1;
  const statuses: AttendanceStatus[] = ["P","A","L","H","WO"];
  return (
    <Tooltip label={`P:${counts.P} A:${counts.A} L:${counts.L} H:${counts.H} WO:${counts.WO}`}>
      <div className="flex h-5 w-full rounded overflow-hidden gap-px cursor-default min-w-[48px]">
        {statuses.map(s => counts[s] > 0 && (
          <div
            key={s}
            style={{ width: `${(counts[s] / total) * 100}%` }}
            className={`${STATUS_META[s].dot} opacity-80 transition-all`}
          />
        ))}
      </div>
    </Tooltip>
  );
}

function QuarterlyView({ employees, from, to }: { employees: Employee[]; from: Date; to: Date }) {
  const weeks = getWeeks(from, to);
  return (
    <div className="overflow-x-auto">
      <table className="min-w-max w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            <th className="sticky left-0 z-10 bg-slate-50 px-5 py-3 text-left text-xs font-semibold text-slate-500 min-w-[160px] border-r border-slate-100">Employee</th>
            <th className="sticky left-[160px] z-10 bg-slate-50 px-3 py-3 text-center text-xs font-semibold text-slate-500 w-[70px] border-r border-slate-100">Stats</th>
            {weeks.map(w => (
              <th key={w.label} className="px-2 py-3 text-center text-xs font-semibold text-slate-400 min-w-[68px]">
                <div>{w.label}</div>
                <div className="text-[9px] text-slate-300 font-normal">week</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {employees.length === 0 ? (
            <tr>
              <td colSpan={weeks.length + 2} className="px-5 py-12 text-center text-sm text-slate-400">
                No employees found
              </td>
            </tr>
          ) : employees.map((emp, idx) => {
            const filtered = emp.records.filter(r => r.date >= dateKey(from) && r.date <= dateKey(to));
            return (
              <tr key={emp.id} className={`hover:bg-blue-50/20 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}>
                <td className="sticky left-0 z-10 px-5 py-3 border-r border-slate-100 bg-inherit">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full ${emp.color} flex items-center justify-center text-white text-[11px] font-bold shrink-0`}>{emp.initials}</div>
                    <span className="text-xs text-slate-600 truncate max-w-[90px]">{emp.name}</span>
                  </div>
                </td>
                <td className="sticky left-[160px] z-10 px-3 py-3 border-r border-slate-100 bg-inherit">
                  <div className="flex justify-center">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg px-2 py-1 min-w-[52px]">
                      <StatsChip records={filtered} />
                    </div>
                  </div>
                </td>
                {weeks.map(w => {
                  const wRecords = filtered.filter(r => r.date >= dateKey(w.start) && r.date <= dateKey(w.end));
                  return (
                    <td key={w.label} className="px-2 py-3 min-w-[68px]">
                      <div className="flex justify-center">
                        <div className="w-full max-w-[80px]">
                          <WeekBar records={wRecords} />
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Biannual View (monthly summary cards per employee) ────────────────────────
function getMonths(from: Date, to: Date): { label: string; year: number; month: number }[] {
  const months = [];
  let cur = new Date(from.getFullYear(), from.getMonth(), 1);
  const end = new Date(to.getFullYear(), to.getMonth(), 1);
  while (cur <= end) {
    months.push({ label: MONTHS_SHORT[cur.getMonth()], year: cur.getFullYear(), month: cur.getMonth() });
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }
  return months;
}

function MonthCard({ records }: { records: DayRecord[] }) {
  const present = records.filter(r => r.status === "P").length;
  const absent  = records.filter(r => r.status === "A").length;
  const leave   = records.filter(r => r.status === "L").length;
  const total   = records.filter(r => !["H","WO"].includes(r.status)).length || 1;
  const pct     = Math.round((present / total) * 100);
  const color   = pct >= 80 ? "text-green-600" : pct >= 60 ? "text-orange-500" : "text-red-500";
  const bar     = pct >= 80 ? "bg-green-400"   : pct >= 60 ? "bg-orange-400"   : "bg-red-400";
  return (
    <Tooltip label={`P:${present} A:${absent} L:${leave} / ${total} days`}>
      <div className="flex flex-col gap-1 min-w-[64px] cursor-default">
        <div className={`text-xs font-bold text-center ${color}`}>{pct}%</div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full ${bar} rounded-full transition-all`} style={{ width: `${pct}%` }} />
        </div>
        <div className="text-[9px] text-slate-400 text-center">{present}/{total}</div>
      </div>
    </Tooltip>
  );
}

function BiannualView({ employees, from, to }: { employees: Employee[]; from: Date; to: Date }) {
  const months = getMonths(from, to);
  return (
    <div className="overflow-x-auto">
      <table className="min-w-max w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            <th className="sticky left-0 z-10 bg-slate-50 px-5 py-3 text-left text-xs font-semibold text-slate-500 min-w-[160px] border-r border-slate-100">Employee</th>
            <th className="sticky left-[160px] z-10 bg-slate-50 px-3 py-3 text-center text-xs font-semibold text-slate-500 w-[70px] border-r border-slate-100">Overall</th>
            {months.map(m => (
              <th key={`${m.year}-${m.month}`} className="px-3 py-3 text-center text-xs font-semibold text-slate-400 min-w-[80px]">
                <div>{m.label}</div>
                <div className="text-[9px] text-slate-300 font-normal">{m.year}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {employees.length === 0 ? (
            <tr>
              <td colSpan={months.length + 2} className="px-5 py-12 text-center text-sm text-slate-400">
                No employees found
              </td>
            </tr>
          ) : employees.map((emp, idx) => {
            const filtered = emp.records.filter(r => r.date >= dateKey(from) && r.date <= dateKey(to));
            return (
              <tr key={emp.id} className={`hover:bg-blue-50/20 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}>
                <td className="sticky left-0 z-10 px-5 py-3 border-r border-slate-100 bg-inherit">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full ${emp.color} flex items-center justify-center text-white text-[11px] font-bold shrink-0`}>{emp.initials}</div>
                    <span className="text-xs text-slate-600 truncate max-w-[90px]">{emp.name}</span>
                  </div>
                </td>
                <td className="sticky left-[160px] z-10 px-3 py-3 border-r border-slate-100 bg-inherit">
                  <div className="flex justify-center">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg px-2 py-1 min-w-[52px]">
                      <StatsChip records={filtered} />
                    </div>
                  </div>
                </td>
                {months.map(m => {
                  const mStart = dateKey(new Date(m.year, m.month, 1));
                  const mEnd   = dateKey(new Date(m.year, m.month + 1, 0));
                  const mRecs  = filtered.filter(r => r.date >= mStart && r.date <= mEnd);
                  return (
                    <td key={`${m.year}-${m.month}`} className="px-3 py-3 min-w-[80px]">
                      <div className="flex justify-center">
                        <div className="w-full max-w-[80px]">
                          <MonthCard records={mRecs} />
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Annual View (heatmap) ─────────────────────────────────────────────────────
function HeatCell({ records, monthLabel }: { records: DayRecord[]; monthLabel: string }) {
  const present = records.filter(r => r.status === "P").length;
  const total   = records.filter(r => !["H","WO"].includes(r.status)).length || 1;
  const pct     = Math.round((present / total) * 100);
  const bg =
    pct >= 90 ? "bg-green-500 text-white" :
    pct >= 75 ? "bg-green-300 text-green-900" :
    pct >= 60 ? "bg-yellow-300 text-yellow-900" :
    pct >= 40 ? "bg-orange-300 text-orange-900" :
    records.length === 0 ? "bg-slate-100 text-slate-300" :
    "bg-red-300 text-red-900";
  return (
    <Tooltip label={`${monthLabel}: ${pct}% (${present}/${total} days)`}>
      <div className={`flex flex-col items-center justify-center h-12 w-full rounded-lg cursor-default transition-transform hover:scale-105 ${bg}`}>
        <span className="text-xs font-bold">{records.length === 0 ? "—" : `${pct}%`}</span>
      </div>
    </Tooltip>
  );
}

function AnnualView({ employees, from, to }: { employees: Employee[]; from: Date; to: Date }) {
  const months = getMonths(from, to);
  return (
    <div className="overflow-x-auto">
      {/* Heatmap legend */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100">
        <span className="text-xs text-slate-400">Attendance %</span>
        {[
          { label:"<40%", cls:"bg-red-300"    },
          { label:"40–60%", cls:"bg-orange-300" },
          { label:"60–75%", cls:"bg-yellow-300" },
          { label:"75–90%", cls:"bg-green-300"  },
          { label:"≥90%",  cls:"bg-green-500"  },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-sm ${l.cls}`} />
            <span className="text-[10px] text-slate-400">{l.label}</span>
          </div>
        ))}
      </div>
      <table className="min-w-max w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            <th className="sticky left-0 z-10 bg-slate-50 px-5 py-3 text-left text-xs font-semibold text-slate-500 min-w-[160px] border-r border-slate-100">Employee</th>
            <th className="sticky left-[160px] z-10 bg-slate-50 px-3 py-3 text-center text-xs font-semibold text-slate-500 w-[70px] border-r border-slate-100">Overall</th>
            {months.map(m => (
              <th key={`${m.year}-${m.month}`} className="px-2 py-3 text-center text-xs font-semibold text-slate-400 min-w-[64px]">
                <div>{m.label}</div>
                <div className="text-[9px] text-slate-300 font-normal">{m.year}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {employees.length === 0 ? (
            <tr>
              <td colSpan={months.length + 2} className="px-5 py-12 text-center text-sm text-slate-400">
                No employees found
              </td>
            </tr>
          ) : employees.map((emp, idx) => {
            const filtered = emp.records.filter(r => r.date >= dateKey(from) && r.date <= dateKey(to));
            return (
              <tr key={emp.id} className={`hover:bg-blue-50/20 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}>
                <td className="sticky left-0 z-10 px-5 py-3 border-r border-slate-100 bg-inherit">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full ${emp.color} flex items-center justify-center text-white text-[11px] font-bold shrink-0`}>{emp.initials}</div>
                    <span className="text-xs text-slate-600 truncate max-w-[90px]">{emp.name}</span>
                  </div>
                </td>
                <td className="sticky left-[160px] z-10 px-3 py-3 border-r border-slate-100 bg-inherit">
                  <div className="flex justify-center">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg px-2 py-1 min-w-[52px]">
                      <StatsChip records={filtered} />
                    </div>
                  </div>
                </td>
                {months.map(m => {
                  const mStart = dateKey(new Date(m.year, m.month, 1));
                  const mEnd   = dateKey(new Date(m.year, m.month + 1, 0));
                  const mRecs  = filtered.filter(r => r.date >= mStart && r.date <= mEnd);
                  return (
                    <td key={`${m.year}-${m.month}`} className="px-2 py-3 min-w-[64px]">
                      <div className="flex justify-center">
                        <div className="w-full max-w-[72px]">
                          <HeatCell records={mRecs} monthLabel={`${MONTHS_FULL[m.month]} ${m.year}`} />
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Custom Date Picker ────────────────────────────────────────────────────────
function CustomDatePicker({ from, to, onChange, onClose }: {
  from: string; to: string;
  onChange: (from: string, to: string) => void;
  onClose: () => void;
}) {
  const [localFrom, setLocalFrom] = useState(from);
  const [localTo,   setLocalTo]   = useState(to);

  const apply = () => {
    if (localFrom && localTo && localFrom <= localTo) {
      onChange(localFrom, localTo);
      onClose();
    }
  };

  return (
    <div className="flex items-center gap-2 bg-white border border-blue-200 rounded-xl px-4 py-2.5 shadow-md">
      <Calendar size={14} className="text-blue-400 shrink-0" />
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={localFrom}
          max={localTo || dateKey(today)}
          onChange={e => setLocalFrom(e.target.value)}
          className="text-xs text-slate-700 border-0 outline-none bg-transparent cursor-pointer"
        />
        <span className="text-slate-300 text-xs">→</span>
        <input
          type="date"
          value={localTo}
          min={localFrom}
          max={dateKey(today)}
          onChange={e => setLocalTo(e.target.value)}
          className="text-xs text-slate-700 border-0 outline-none bg-transparent cursor-pointer"
        />
      </div>
      <button
        onClick={apply}
        className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        Apply
      </button>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
        <X size={14} />
      </button>
    </div>
  );
}

// ── View Mode Badge ───────────────────────────────────────────────────────────
const VIEW_LABELS: Record<ViewMode, string> = {
  monthly:   "Daily view",
  quarterly: "Weekly summary",
  biannual:  "Monthly summary",
  annual:    "Heatmap view",
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function AttendanceOverview() {
  const [filter,     setFilter]     = useState<FilterOption>("this-month");
  const [customFrom, setCustomFrom] = useState(dateKey(startOfMonth(today)));
  const [customTo,   setCustomTo]   = useState(dateKey(today));
  const [showCustom, setShowCustom] = useState(false);

  // Compute date range
  const { from, to } = (() => {
    if (filter === "this-month") return { from: startOfMonth(new Date(today.getFullYear(), today.getMonth() - 1, 1)), to: endOfMonth(new Date(today.getFullYear(), today.getMonth() - 1, 1)) };
    if (filter === "last-3")     return { from: new Date(today.getFullYear(), today.getMonth() - 2, 1), to: endOfMonth(today) };
    if (filter === "last-6")     return { from: new Date(today.getFullYear(), today.getMonth() - 5, 1), to: endOfMonth(today) };
    if (filter === "last-12")    return { from: new Date(today.getFullYear() - 1, today.getMonth(), 1), to: today };
    // custom
    return { from: new Date(customFrom), to: new Date(customTo) };
  })();

  // Determine view mode from range
  const rangeDays = daysBetween(from, to);
  const viewMode: ViewMode =
    rangeDays <= 35  ? "monthly"   :
    rangeDays <= 100 ? "quarterly" :
    rangeDays <= 200 ? "biannual"  : "annual";

  const handleFilterClick = (f: FilterOption) => {
    setFilter(f);
    setShowCustom(f === "custom");
  };

  const LEGEND_ITEMS: AttendanceStatus[] = ["P","A","L","H","WO"];

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* ── Header ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h1 className="text-lg font-semibold text-slate-800">Attendance Overview</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {formatDate(from)} — {formatDate(to)}
              <span className="ml-2 px-1.5 py-0.5 bg-blue-50 text-blue-500 rounded text-[10px] font-medium">
                {VIEW_LABELS[viewMode]}
              </span>
            </p>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium rounded-lg shadow-sm transition-colors self-start">
            <Download size={14} />
            Download Report
          </button>
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-col gap-3 px-6 py-3 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2 flex-wrap">
            {FILTER_OPTIONS.map(opt => (
              <FilterPill
                key={opt.value}
                option={opt}
                active={filter === opt.value}
                onClick={() => handleFilterClick(opt.value)}
              />
            ))}
          </div>
          {showCustom && (
            <CustomDatePicker
              from={customFrom}
              to={customTo}
              onChange={(f, t) => { setCustomFrom(f); setCustomTo(t); }}
              onClose={() => { setShowCustom(false); setFilter("this-month"); }}
            />
          )}
        </div>

        {/* ── Legend ── */}
        <div className="flex items-center gap-4 px-6 py-2.5 border-b border-slate-100 flex-wrap">
          {LEGEND_ITEMS.map(s => {
            const m = STATUS_META[s];
            return (
              <div key={s} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${m.dot}`} />
                <span className="text-xs text-slate-500">{m.short} — {m.label}</span>
              </div>
            );
          })}
        </div>

        {/* ── Table (view-dependent) ── */}
        {viewMode === "monthly"   && <MonthlyView   employees={EMPLOYEES} from={from} to={to} />}
        {viewMode === "quarterly" && <BiannualView  employees={EMPLOYEES} from={from} to={to} />}
        {viewMode === "biannual"  && <QuarterlyView employees={EMPLOYEES} from={from} to={to} />}
        {viewMode === "annual"    && <AnnualView    employees={EMPLOYEES} from={from} to={to} />}

      </div>
    </div>
  );
}
