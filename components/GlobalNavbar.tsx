"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ModuleOverlay from "@/components/ModuleOverlay";
import ProfileDropdown from "@/components/ProfileDropdown";

export default function GlobalNavbar() {
  const [showModules, setShowModules] = useState(false);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 w-full h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        
        {/* Container for alignment */}
        <div className="h-full mx-auto flex items-center justify-between px-10 py-3">
          {/* Left - Logo and Grid Button */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center justify-center">
              <Image src="/Logo.png" alt="Voctrum" width={70} height={45} className="object-contain" />
            </Link>

            {/* Grid / modules toggle button */}
            <button
              type="button"
              aria-label="Open modules"
              onClick={() => setShowModules((prev) => !prev)}
              className="text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 transition-colors w-10 h-10 flex items-center justify-center rounded-md focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500"
            >
              <svg width="24" height="24" viewBox="0 0 30 30" fill="currentColor">
                <rect x="1" y="1" width="8" height="8" rx="2" />
                <rect x="11" y="1" width="8" height="8" rx="2" />
                <rect x="21" y="1" width="8" height="8" rx="2" />
                <rect x="1" y="11" width="8" height="8" rx="2" />
                <rect x="11" y="11" width="8" height="8" rx="2" />
                <rect x="21" y="11" width="8" height="8" rx="2" />
                <rect x="1" y="21" width="8" height="8" rx="2" />
                <rect x="11" y="21" width="8" height="8" rx="2" />
                <rect x="21" y="21" width="8" height="8" rx="2" />
              </svg>
            </button>
          </div>

          {/* Right - Search and Profile */}
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-700 rounded-lg px-3 py-2 w-64">
              <svg className="w-4 h-4 text-gray-500 dark:text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search..."
                className="text-gray-700 dark:text-slate-300 text-sm bg-transparent outline-none w-full placeholder:text-gray-500 dark:placeholder:text-slate-500"
              />
            </div>

            <ProfileDropdown />
          </div>
        </div>

      </div>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-16" />

      {/* Module overlay — rendered outside the navbar div so it covers the full page */}
      {showModules && (
        <ModuleOverlay onClose={() => setShowModules(false)} />
      )}
    </>
  );
}
