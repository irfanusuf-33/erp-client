"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    label: "View Tickets",
    link: "/ticketing/inbox"
  },
  {
    label: "Ticket Pool",
    link: "/ticketing/messages"
  }
];

export default function TicketingNavbar() {
  const pathname = usePathname();

  return (
    <div className="h-12 bg-white border-b border-gray-200 flex items-center px-5 shrink-0">
      
      {/* IAM Badge + title */}
      <div className="flex items-center gap-3 mr-6">
        <Link
          href="/ticketing"
          className="flex items-center gap-1 text-white text-sm font-bold"
          style={{ background: "#2B7FFF", borderRadius: "0.75rem", padding: "4px 2.25rem" }}
        >
          Ticketing
        </Link>

        <span className="text-xs font-semibold" style={{ color: "#2B7FFF" }}>
          Ticketing and Message Management
        </span>

        {/* Info tooltip */}
        <div className="relative group flex items-center">
          <span
            className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[11px] font-bold cursor-pointer"
            style={{ border: "1.5px solid #2B7FFF", color: "#2B7FFF" }}
          >
            i
          </span>

          <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden group-hover:flex z-50 items-center">
            <div className="w-2 h-2 bg-gray-800 rotate-45 -mr-1" />
            <div className="bg-gray-800 text-white text-sm rounded-lg px-4 py-3 text-center w-72">
              Centralize all internal and external requests in one place. This module allows you to create, assign, and track support tickets, ensuring timely resolutions with automated SLAs, agent performance tracking, and a full communication history for every issue.
            </div>
          </div>
        </div>
      </div>

      {/* Direct Nav Links */}
      <nav className="flex items-center h-full">
        {navItems.map((item) => {
          const isActive = pathname === item.link;

          return (
            <Link
              key={item.label}
              href={item.link}
              className={`flex items-center text-xs px-6 h-full font-semibold border-t-4 transition-colors
                ${isActive 
                  ? "text-blue-600 border-blue-600 bg-blue-50" 
                  : "text-gray-700 border-transparent hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50"
                }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}