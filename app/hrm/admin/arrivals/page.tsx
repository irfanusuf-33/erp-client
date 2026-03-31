"use client";

// app/hrm/admin/arrivals/page.tsx

import { useState, useRef, useEffect, useMemo } from "react";
import { Search, Clock, ChevronLeft, ChevronRight, Info, CheckCircle, CalendarX, LogOut } from "lucide-react";
import { useGlobalStore } from "@/store";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Attendance {
  _id: string;
  name: string;
  session: string;
  tasks: string[];
  totalHours: string;
  breaks: string[];
  status: "In a meeting" | "On call" | "Working" | "On Break";
  arrival: "On Time" | "Late" | "Early Out" | "NA";
}
interface ApiEmployee {
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workHours: string;
  breaks: { start?: string; end?: string; label?: string }[];
  tasks: string[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(isoString: string | null): string {
  if (!isoString) return "-";
  const date = new Date(isoString);
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const displayHours = date.getHours() % 12 || 12;
  const ampm = date.getHours() >= 12 ? "PM" : "AM";
  return `${displayHours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
}

function getArrivalStatus(checkIn: string | null, checkOut: string | null): Attendance["arrival"] {
  if (!checkIn) return "NA";
  const checkInTime = new Date(checkIn);
  const checkInHour = checkInTime.getHours();
  if (checkInHour > 9 || (checkInHour === 9 && checkInTime.getMinutes() > 30)) return "Late";
  if (checkOut && new Date(checkOut).getHours() < 17) return "Early Out";
  return "On Time";
}

function transformApiData(employees: ApiEmployee[]): Attendance[] {
  return employees.map((emp) => ({
    _id:        emp.employeeId ?? "-",
    name:       emp.employeeName ?? "-",
    session:    formatTime(emp.checkIn),
    tasks:      emp.tasks ?? [],
    totalHours: emp.workHours ? `${emp.workHours} hrs` : "0:00 hrs",
    breaks:     emp.breaks?.map((b, i) =>
                  b.start && b.end ? `${b.start} - ${b.end}` : b.label ?? `Break ${i + 1}`
                ) ?? [],
    status:     "Working" as Attendance["status"],
    arrival:    getArrivalStatus(emp.checkIn, emp.checkOut),
  }));
}
// ─── Style maps ────────────────────────────────────────────────────────────────

const statusStyles: Record<string, string> = {
  "In a meeting": "bg-rose-50 text-rose-500 border border-rose-200",
  "On call":      "bg-blue-50 text-blue-500 border border-blue-200",
  "Working":      "bg-emerald-50 text-emerald-600 border border-emerald-200",
  "On Break":     "bg-amber-50 text-amber-500 border border-amber-200",
};

const arrivalStyles: Record<string, string> = {
  "On Time":   "text-emerald-600",
  "Late":      "text-rose-500",
  "Early Out": "text-amber-500",
  "NA":        "text-slate-400",
};

// ─── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;
const TABLE_HEADERS = ["ID", "Name", "Session", "Tasks", "Total Hours", "Breaks", "Status", "Arrival"];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function DailyArrivalsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const breakRef = useRef<HTMLDivElement>(null);
  const [openBreakId, setOpenBreakId] = useState<string | null>(null);

  const rawArrivals = useGlobalStore((state) => state.dailyArrivals);
  const fetchDailyArrivals = useGlobalStore((state) => state.fetchDailyArrivals);
  const hrmLoading = useGlobalStore((state) => state.hrmLoading);

  useEffect(() => {
    fetchDailyArrivals();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Close break tooltip on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (breakRef.current && !breakRef.current.contains(e.target as Node)) {
        setOpenBreakId(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const arrivals: Attendance[] = useMemo(() => transformApiData(rawArrivals), [rawArrivals]);

  // ── Stats computed from real data ──
  const stats = useMemo(() => ({
    total:    arrivals.length,
    onTime:   arrivals.filter((r) => r.arrival === "On Time").length,
    late:     arrivals.filter((r) => r.arrival === "Late").length,
    earlyOut: arrivals.filter((r) => r.arrival === "Early Out").length,
  }), [arrivals]);

  const filtered = useMemo(() =>
    arrivals.filter((row) => {
      const term = search.toLowerCase();
      return (
        row._id.toLowerCase().includes(term) ||
        row.name.toLowerCase().includes(term) ||
        row.status.toLowerCase().includes(term)
      );
    }),
    [arrivals, search]
  );

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  return (
    <div className="flex flex-col gap-5 p-6 bg-slate-50 min-h-screen">

      {/* ── Heading ── */}
      <h1 className="text-xl font-semibold text-slate-800">Daily Arrival Report</h1>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "On Time",       value: stats.onTime,   color: "text-emerald-600", border: "border-l-emerald-500", iconBg: "bg-emerald-50", iconColor: "text-emerald-500", icon: CheckCircle },
          { label: "Late Arrivals", value: stats.late,     color: "text-rose-500",    border: "border-l-rose-500",    iconBg: "bg-rose-50",    iconColor: "text-rose-500",    icon: CalendarX   },
          { label: "Early Out",     value: stats.earlyOut, color: "text-amber-500",   border: "border-l-amber-500",   iconBg: "bg-amber-50",   iconColor: "text-amber-500",   icon: LogOut      },
        ].map(({ label, value, color, border, iconBg, iconColor, icon: Icon }) => (
          <div key={label} className={`bg-white rounded-xl border border-slate-100 border-l-4 ${border} shadow-sm p-5 flex items-center justify-between`}>
            <div className="flex flex-col gap-1">
              <span className={`text-sm font-medium ${color}`}>{label}</span>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold ${color}`}>{String(value).padStart(2, "0")}</span>
                <span className="text-sm text-slate-400">/ {stats.total}</span>
              </div>
            </div>
            <div className={`p-2.5 rounded-lg ${iconBg}`}>
              <Icon size={20} className={iconColor} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">

        {/* Table Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 gap-4 flex-wrap">
          <h2 className="text-sm font-semibold text-slate-700">Employees Time Tracking</h2>
          <div className="flex items-center gap-3">
            <div className="border border-slate-200 rounded-lg px-3 py-2">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="outline-none bg-transparent text-sm text-slate-600 cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 w-56">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search by name or id..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="outline-none bg-transparent text-sm text-slate-600 placeholder:text-slate-400 w-full"
              />
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {TABLE_HEADERS.map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-slate-400 px-5 py-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">

              {/* Loading */}
              {hrmLoading && Array(5).fill(0).map((_, i) => (
                <tr key={i} className="border-b border-slate-100">
                  {Array(8).fill(0).map((__, j) => (
                    <td key={j} className="px-5 py-3">
                      <div className="h-3.5 bg-slate-100 rounded animate-pulse w-20" />
                    </td>
                  ))}
                </tr>
              ))}

              {/* Empty */}
              {!hrmLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={TABLE_HEADERS.length} className="text-center py-10 text-sm text-slate-400">
                    No records found
                  </td>
                </tr>
              )}

              {/* Rows */}
              {!hrmLoading && paginated.map((row) => (
                <tr key={row._id} className="hover:bg-slate-50 transition-colors">

                  <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{row._id.slice(-6)}</td>

                  <td className="px-5 py-3 text-slate-700 font-medium whitespace-nowrap">{row.name}</td>

                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      {row.session}
                      <Clock size={13} className="text-slate-400" />
                    </div>
                  </td>

                  {/* Tasks — opens modal */}
                  <td className="px-5 py-3">
                    <button
                      onClick={() => { setSelectedTasks(row.tasks); setTaskModalOpen(true); }}
                      className="text-blue-500 text-sm font-medium hover:text-blue-700 transition-colors"
                    >
                      Show
                    </button>
                  </td>

                  <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{row.totalHours}</td>

                  {/* Breaks — tooltip */}
                  <td className="px-5 py-3">
                    <div className="relative inline-block" ref={openBreakId === row._id ? breakRef : null}>
                      <button
                        onClick={() => setOpenBreakId(openBreakId === row._id ? null : row._id)}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <Info size={16} />
                      </button>
                      {openBreakId === row._id && (
                        <div className="absolute left-6 top-0 z-50 w-52 bg-white rounded-xl border border-slate-100 shadow-lg p-3">
                          <p className="text-xs font-semibold text-slate-500 mb-2">Break times</p>
                          {row.breaks.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No breaks taken</p>
                          ) : (
                            <div className="flex flex-col gap-1.5">
                              {row.breaks.map((b, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <span className="text-blue-500 text-xs">◆</span>
                                  <span className="text-xs text-slate-600">{b}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${statusStyles[row.status] ?? "bg-slate-100 text-slate-500"}`}>
                      {row.status}
                    </span>
                  </td>

                  <td className="px-5 py-3">
                    <span className={`text-sm font-medium ${arrivalStyles[row.arrival] ?? "text-slate-400"}`}>
                      {row.arrival}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!hrmLoading && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs text-slate-600 font-medium">{page + 1} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Tasks Modal ── */}
      {taskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Employee Tasks</h2>
            {selectedTasks.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No tasks assigned</p>
            ) : (
              <>
                <p className="text-xs text-slate-400 mb-3">Tasks ({selectedTasks.length})</p>
                <ul className="flex flex-col gap-2">
                  {selectedTasks.map((task, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="text-blue-500 text-xs">◆</span>
                      {task}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <button
              onClick={() => setTaskModalOpen(false)}
              className="mt-5 w-full py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}