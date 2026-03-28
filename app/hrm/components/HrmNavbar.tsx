"use client";

// app/hrm/_components/HrmNavbar.tsx

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Info, MoreVertical } from "lucide-react";

// ─── Nav config ────────────────────────────────────────────────────────────────

interface NavChild {
  label: string;
  href: string;
}

interface NavGroup {
  label: string;
  children: NavChild[];
}

const navGroups: NavGroup[] = [
  {
    label: "Admin",
    children: [
      { label: "Employee List", href: "/hrm/admin/list" },
      { label: "Create Employee", href: "/hrm/admin/create" },
      { label: "Attendance", href: "/hrm/admin/attendance" },
      { label: "Leaves List", href: "/hrm/admin/leaveslist" },
      { label: "Daily Arrivals", href: "/hrm/admin/arrivals" },
    ],
  },
  {
    label: "Employee",
    children: [
     
      { label: "Leaves", href: "/hrm/employee/leaves" },
      { label: "Check In", href: "/hrm/employee/checkin" },
      { label: "Daily Arrivals", href: "/hrm/employee/arrivals" },
    ],
  },
  {
    label: "Jobs",
    children: [
      { label: "Job Listings", href: "/hrm/jobs" },
      { label: "Create Job", href: "/hrm/jobs/create" },
      { label: "Job Templates", href: "/hrm/jobs/templates" },
      { label: "Applications", href: "/hrm/jobs/applications" },
    ],
  },
  {
    label: "Settings",
    children: [
      { label: "General", href: "/hrm/settings/general" },
    ],
  },
];

// ─── Dropdown ──────────────────────────────────────────────────────────────────

function NavDropdown({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isGroupActive = group.children.some((c) => pathname.startsWith(c.href));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          isGroupActive
            ? "text-orange-500"
            : "text-slate-600 hover:text-blue-900 hover:bg-blue-100"
        }`}
      >
        {group.label}
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-48 bg-white rounded-xl border border-slate-100 shadow-lg py-1.5 z-50">
          {group.children.map((child) => {
            const active = pathname === child.href || pathname.startsWith(child.href);
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={() => setOpen(false)}
                className={`flex items-center px-4 py-2 text-sm transition-colors ${
                  active
                    ? "text-orange-500 bg-orange-50 font-medium"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Navbar ───────────────────────────────────────────────────────────────

export default function HrmNavbar() {
  return (
    <nav className="h-12 bg-white border-b border-slate-100 flex items-center px-4 gap-4 shrink-0">

      {/* ── Left: Brand ── */}
      <div className="flex items-center gap-3 shrink-0">
        {/* HRM pill */}
        <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-md tracking-wide">
          HRM
        </span>

        {/* Title + info icon */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-orange-500 whitespace-nowrap">
            Human Resource Management
          </span>
          <button className="text-orange-400 hover:text-orange-600 transition-colors">
            <Info size={14} />
          </button>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="h-5 w-px bg-slate-200 shrink-0" />

      {/* ── Nav Groups ── */}
      <div className="flex items-center gap-1">
        {navGroups.map((group) => (
          <NavDropdown key={group.label} group={group} />
        ))}
      </div>

      {/* ── Right: Three dot menu ── */}
      <div className="ml-auto">
        <button className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <MoreVertical size={18} />
        </button>
      </div>

    </nav>
  );
}