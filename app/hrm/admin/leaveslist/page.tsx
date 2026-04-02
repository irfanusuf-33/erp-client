"use client";

// app/hrm/admin/leaves/page.tsx

import { useState } from "react";
import { Search, CalendarCheck,  Clock, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import StatCard from "../../components/StatCard";

// ─── Types ──────────────────────────────────────────────────────────────────

type LeaveStatus = "Pending" | "Approved" | "Rejected";

interface Leave {
  _id: string;
  employeeId: string;
  name: string;
  department: string;
  leaveType: string;
  from: string;
  to: string;
  days: number;
  status: LeaveStatus;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const TABLE_HEADERS = ["ID", "Name", "Department", "Leave Type", "From", "To", "Days", "Status"];

const statusStyles: Record<LeaveStatus, string> = {
  Pending:  "bg-amber-50 text-amber-600 border border-amber-200",
  Approved: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  Rejected: "bg-rose-50 text-rose-500 border border-rose-200",
};

const STATUS_OPTIONS: LeaveStatus[] = ["Pending", "Approved", "Rejected"];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LeavesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Replace with real data from your store/API
  const leaves: Leave[] = [];

  // ── Stats ──
  const stats = {
    raised:   leaves.length,
    approved: leaves.filter((l) => l.status === "Approved").length,
    pending:  leaves.filter((l) => l.status === "Pending").length,
    rejected: leaves.filter((l) => l.status === "Rejected").length,
  };

  const statCards = [
    { heading: "Leaves Raised",    number: String(stats.raised).padStart(2, "0"),   label: "All leave requests submitted", color: "#3B82F6", icon: CalendarCheck },
    { heading: "Leaves Approved",  number: String(stats.approved).padStart(2, "0"), label: "Leaves granted for employees",  color: "#10B981", icon: CalendarCheck },
    { heading: "Pending Requests", number: String(stats.pending).padStart(2, "0"),  label: "Requests awaiting approval",    color: "#F59E0B", icon: Clock         },
    { heading: "Leaves Rejected",  number: String(stats.rejected).padStart(2, "0"), label: "Requests not approved",         color: "#EF4444", icon: XCircle       },
  ];

  // ── Filter ──
  const filtered = leaves.filter((row) => {
    const term = search.toLowerCase();
    return (
      row.employeeId.toLowerCase().includes(term) ||
      row.name.toLowerCase().includes(term) ||
      row.department.toLowerCase().includes(term)
    );
  });

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  // ── Status change handler (wire up to your API) ──
  function handleStatusChange(leaveId: string, newStatus: LeaveStatus) {
    console.log("Change status:", leaveId, "→", newStatus);
    setOpenDropdownId(null);
  }

  return (
    <div className="flex flex-col gap-5 p-6 bg-slate-50 min-h-screen">

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">

        {/* Table Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 gap-4 flex-wrap">
          <h2 className="text-sm font-semibold text-slate-700">Employees Leave List</h2>
          <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 w-64">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by name or ID"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="outline-none bg-transparent text-sm text-slate-600 placeholder:text-slate-400 w-full"
            />
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

              {/* Empty State */}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={TABLE_HEADERS.length} className="text-center py-16 text-sm text-slate-400">
                    No employees found
                  </td>
                </tr>
              )}

              {/* Rows */}
              {paginated.map((row) => (
                <tr key={row._id} className="hover:bg-slate-50 transition-colors">

                  <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                    {row.employeeId.slice(-7)}
                  </td>

                  <td className="px-5 py-3 text-slate-700 font-medium whitespace-nowrap">
                    {row.name}
                  </td>

                  <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                    {row.department}
                  </td>

                  <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                    {row.leaveType}
                  </td>

                  <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                    {row.from}
                  </td>

                  <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                    {row.to}
                  </td>

                  <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                    {row.days}
                  </td>

                  {/* Status dropdown */}
                  <td className="px-5 py-3">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setOpenDropdownId(openDropdownId === row._id ? null : row._id)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 ${statusStyles[row.status]}`}
                      >
                        {row.status}
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>

                      {openDropdownId === row._id && (
                        <div className="absolute left-0 top-full mt-1 z-50 bg-white rounded-lg border border-slate-100 shadow-lg py-1 w-32">
                          {STATUS_OPTIONS.filter((s) => s !== row.status).map((option) => (
                            <button
                              key={option}
                              onClick={() => handleStatusChange(row._id, option)}
                              className="w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
          <span className="text-xs text-slate-400">
            {filtered.length === 0
              ? "Showing 0 results"
              : `Showing ${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, filtered.length)} of ${filtered.length} results`}
          </span>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                    page === i
                      ? "bg-blue-500 text-white"
                      : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}