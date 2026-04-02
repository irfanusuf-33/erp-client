"use client";

// app/hrm/_components/HrmNavbar.tsx

import Link from "next/link";
import { useRef } from "react";
import { usePathname } from "next/navigation";

// ─── Nav config ────────────────────────────────────────────────────────────────

const navGroups = [
  {
    label: "Admin",
    children: [
      { label: "Employee List",  href: "/hrm/admin/list" },
      { label: "Create Employee", href: "/hrm/admin/create" },
      { label: "Attendance",     href: "/hrm/admin/attendance" },
      { label: "Leaves List",    href: "/hrm/admin/leaveslist" },
      { label: "Daily Arrivals", href: "/hrm/admin/arrivals" },
    ],
  },
  {
    label: "Employee",
    children: [
      { label: "Leaves",         href: "/hrm/employee/leaves" },
      { label: "Check In",       href: "/hrm/employee/checkin" },
      { label: "Daily Arrivals", href: "/hrm/employee/arrivals" },
    ],
  },
  {
    label: "Jobs",
    children: [
      { label: "Job Listings",   href: "/hrm/jobs" },
      { label: "Create Job",     href: "/hrm/jobs/create" },
      { label: "Job Templates",  href: "/hrm/jobs/templates" },
      { label: "Applications",   href: "/hrm/jobs/applications" },
    ],
  },
  {
    label: "Settings",
    children: [
      { label: "General",        href: "/hrm/admin/settings/general" },
    ],
  },
];

// ─── Dropdown Item ─────────────────────────────────────────────────────────────

function DropdownItem({ item }: { item: (typeof navGroups)[0] }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isActive = item.children.some((l) => pathname.startsWith(l.href));

  return (
    <div ref={ref} className="relative h-full flex items-center group">
      <button
        type="button"
        className={`flex items-center gap-1 text-xs px-6 h-full font-semibold transition-colors border-t-4
          ${isActive
            ? "text-blue-500 border-blue-500 bg-blue-50"
            : "text-gray-700 border-transparent hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50"
          }`}
      >
        {item.label}
        <span className={`text-[14px] ${isActive ? "text-blue-500" : "text-gray-500 group-hover:text-blue-500"}`}>
          ▾
        </span>
      </button>

      {/* Dropdown — opens on hover via group-hover */}
      <div className="absolute top-full left-0 z-50 hidden group-hover:block pt-0.5">
        <div
          className="bg-white rounded-lg min-w-[180px] py-2"
          style={{ boxShadow: "0 4px 20px rgba(128, 143, 235, 0.25)" }}
        >
          {item.children.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href);
            return (
              <div key={link.href} className="relative group/item">
                {/* Left accent line on hover */}
                <span className="absolute left-2 top-3 bottom-3 w-0.5 bg-transparent group-hover/item:bg-blue-500" />
                <Link
                  href={link.href}
                  className={`flex items-center px-4 py-2.5 text-sm font-medium transition-colors
                    ${active
                      ? "text-blue-500 bg-blue-50"
                      : "text-gray-700 hover:text-blue-500"
                    }`}
                >
                  {link.label}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Navbar ───────────────────────────────────────────────────────────────

export default function HrmNavbar() {
  return (
    <nav className="h-12 bg-white border-b border-gray-200 flex items-center px-5 shrink-0">

      {/* ── Left: Brand ── */}
      <div className="flex items-center gap-3 mr-6">
        {/* HRM pill */}
        <Link
          href="/hrm"
          className="flex items-center gap-1 text-white text-sm font-bold"
          style={{ background: "#2B7FFF", borderRadius: "0.75rem", padding: "4px 2.25rem" }}
        >
          HRM
        </Link>

        {/* Title */}
        <span className="text-xs font-semibold text-blue-500">
          Human Resource Management
        </span>

        {/* Info tooltip */}
        <div className="relative group flex items-center">
          <span
            className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[11px] font-bold leading-none flex-shrink-0 cursor-pointer"
            style={{ border: "1.5px solid #2B7FFF", color: "#2B7FFF" }}
          >
            i
          </span>
          <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden group-hover:flex z-50 items-center">
            <div className="w-2 h-2 bg-gray-800 rotate-45 -mr-1 flex-shrink-0" />
            <div className="bg-gray-800 text-white text-sm rounded-lg px-4 py-3 text-center leading-snug w-80">
              Manage employees, leaves, jobs, and attendance across your organization
            </div>
          </div>
        </div>
      </div>

      {/* ── Nav Groups ── */}
      <nav className="flex items-center h-full">
        {navGroups.map((group) => (
          <DropdownItem key={group.label} item={group} />
        ))}
      </nav>

    </nav>
  );
}