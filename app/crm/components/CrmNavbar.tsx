"use client"

import React from 'react'
import Link from 'next/link'
import { useRef } from 'react';
import { usePathname } from 'next/navigation';

const navItems = [
  {
    label: "Client",
    links: [
      { title: "Add Client", href: "/crm/add-client" },
      { title: "Manage Client", href: "/crm/manage-clients" },
    ],
  },
  {
    label: "Groups",
    links: [
      { title: "Add Group", href: "/crm/add-group" },
      { title: "Manage Groups", href: "/crm/manage-groups" },
    ],
  },
  {
    label: "Templates",
    links: [
      { title: "View Template", href: "/crm/view-template" },
      { title: "Add Template", href: "/crm/add-template" },
    ],
  },
];

export default function CrmNavbar() {
    return (
        <div className="h-12 bg-white border-b border-gray-200 flex items-center px-5 shrink-0">
            <div className="flex items-center gap-3 mr-6">
                <Link
                    href="/crm"
                    className="flex items-center gap-1 text-white text-sm font-bold"
                    style={{ background: "#2B7FFF", borderRadius: "0.75rem", padding: "4px 2.25rem" }}
                >
                    CRM
                </Link>
                <span className="text-xs font-semibold" style={{ color: "#2B7FFF" }}>
                    Client Relationship Management
                </span>

                <div className="relative group flex items-center">
                    <span
                        className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[11px] font-bold leading-none flex-shrink-0 cursor-pointer"
                        style={{ border: "1.5px solid #2B7FFF", color: "#2B7FFF" }}
                    >
                        i
                    </span>
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden group-hover:flex z-50 items-center">
                        <div className="w-2 h-2 bg-gray-800 rotate-45 -mr-1 flex-shrink-0" />
                        <div className="bg-gray-800 text-white text-sm rounded-lg px-4 py-3 text-center leading-snug w-100">
                            Centralize customer information, monitor sales progress, and improve relationship management
                        </div>
                    </div>
                </div>
            </div>
            <nav className="flex items-center h-full">
                {navItems.map((item) => (
                    <DropdownItem key={item.label} item={item} />
                ))}
            </nav> 
        </div>
    )
}

function DropdownItem({ item }: { item: (typeof navItems)[0] }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isActive = item.links.some((l) => pathname.startsWith(l.href));

  return (
    <div ref={ref} className="relative h-full flex items-center group">
      <button
        type="button"
        className={`flex items-center gap-1 text-xs px-6 h-full font-semibold transition-colors border-t-4
          ${isActive
            ? "text-blue-600 border-blue-600 bg-blue-50"
            : "text-gray-700 border-transparent hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50"
          }`}
      >
        {item.label}
        <span className={`text-[14px] ${isActive ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"}`}>▾</span>
      </button>

      <div className="absolute top-full left-0 z-50 hidden group-hover:block pt-0.5">
        <div className="bg-white rounded-lg min-w-[180px] py-2 mt-0" style={{ boxShadow: "0 4px 20px rgba(43, 127, 255, 0.35)" }}>
          {item.links.map((link) => (
            <div key={link.href} className="relative group/item">
              <span className="absolute left-2 top-3 bottom-3 w-0.5 bg-transparent group-hover/item:bg-blue-600" />
              <Link
                href={link.href}
                className="flex items-center px-4 py-2.5 text-sm text-gray-700 font-medium hover:text-blue-600"
              >
                {link.title}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}