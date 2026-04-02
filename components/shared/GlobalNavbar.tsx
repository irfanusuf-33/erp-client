"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";
import { usePathname } from "next/navigation";
import ProfileDropdown from "@/components/shared/ProfileDropdown";
import ModuleOverlay from "@/components/shared/ModuleOverlay";
import { useSettingsStore } from "@/store/slices/settings.slice";

// Dashboard excluded — logo navigates there. These are sidebar/overlay modules only.
const MODULE_DEFS = [
  {
    id: "crm", label: "CRM", link: "/crm",
    icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>),
  },
  {
    id: "hrm", label: "HRM", link: "/hrm",
    icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>),
  },
  {
    id: "inventory", label: "Inventory", link: "/inventory",
    icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>),
  },
  {
    id: "ticketing", label: "Ticketing", link: "/ticketing",
    icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>),
  },
  {
    id: "calendar", label: "Calendar", link: "/calendar",
    icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>),
  },
  {
    id: "iam", label: "IAM", link: "/iam",
    icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>),
  },
];

function ModuleNavItem({ mod, isActive, isCollapsed, showTooltips, activeStyle, accentColor, showLabels, orientation }: {
  mod: typeof MODULE_DEFS[0]; isActive: boolean; isCollapsed: boolean;
  showTooltips: boolean; activeStyle: string; accentColor: string; showLabels: boolean; orientation: string;
}) {
  const [hovered, setHovered] = useState(false);
  const isVertical = orientation === "vertical" || orientation === "hybrid";

  const activeClasses =
    activeStyle === "background" ? "bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400" :
    activeStyle === "border" ? (isVertical ? "border-l-2 text-blue-600 dark:text-blue-400" : "border-b-2 text-blue-600 dark:text-blue-400") :
    "text-blue-600 dark:text-blue-400 underline underline-offset-4";

  const inactiveClasses = "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-800";

  return (
    <div className="relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <Link
        href={mod.link}
        style={isActive && activeStyle === "border" ? (isVertical ? { borderLeftColor: accentColor } : { borderBottomColor: accentColor }) : {}}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mx-2 transition-all duration-150 ${isActive ? activeClasses : inactiveClasses}`}
      >
        <span className="shrink-0">{mod.icon}</span>
        {!isCollapsed && showLabels && <span className="text-sm font-medium truncate">{mod.label}</span>}
      </Link>
      {(isCollapsed || !showLabels) && showTooltips && hovered && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-[9999] px-2 py-1 rounded bg-gray-900 text-white text-xs whitespace-nowrap shadow-lg pointer-events-none">
          {mod.label}
        </div>
      )}
    </div>
  );
}

// Grid icon for the module launcher button
function GridIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 30 30" fill="currentColor">
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
  );
}

export default function GlobalNavbar() {
  const { navbarSettings: ns } = useSettingsStore();
  const pathname = usePathname();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [showModules, setShowModules] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isVertical = ns.orientation === "vertical";
  const isHybrid = ns.orientation === "hybrid";

  const visibleModules = [...ns.modules]
    .filter((m) => m.visible && m.id !== "dashboard")
    .sort((a, b) => {
      if (ns.showPinnedAtTop) {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
      }
      return a.order - b.order;
    })
    .map((m) => MODULE_DEFS.find((d) => d.id === m.id))
    .filter(Boolean) as typeof MODULE_DEFS;

  const isCollapsed = ns.sidebarBehavior === "collapsed" || (ns.autoCollapse && !sidebarExpanded);
  const sidebarWidth = isCollapsed ? "w-16" : ns.width === "narrow" ? "w-48" : ns.width === "wide" ? "w-72" : "w-60";
  const shadowClass = ns.shadow === "none" ? "" : ns.shadow === "soft" ? "shadow-sm" : "shadow-md";
  const borderClass = ns.showBorder ? "border-gray-200 dark:border-zinc-800" : "border-transparent";
  const bgClass = "bg-white dark:bg-zinc-900";
  const animDuration = ns.animation === "fast" ? "duration-100" : ns.animation === "slow" ? "duration-500" : "duration-200";
  const stickyTopClass = ns.sticky === "fixed" ? "fixed top-0 left-0 right-0 z-40" : "relative z-40";
  const stickyLeftClass = ns.sticky === "fixed"
    ? (ns.position === "right" ? "fixed top-0 right-0 bottom-0 z-40" : "fixed top-0 left-0 bottom-0 z-40")
    : "relative";
  const widthPadding = ns.width === "narrow" ? "px-4" : ns.width === "wide" ? "px-16" : "px-6";

  const handleSidebarHover = (entering: boolean) => {
    if (!ns.expandOnHover) return;
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (entering) setSidebarExpanded(true);
    else hoverTimerRef.current = setTimeout(() => setSidebarExpanded(false), 300);
  };

  const SearchBar = (
    <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 rounded-lg px-3 py-2 w-56">
      <svg className="w-4 h-4 text-gray-500 dark:text-zinc-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
      </svg>
      <input type="text" placeholder={ns.searchPlaceholder} className="text-gray-700 dark:text-zinc-300 text-sm bg-transparent outline-none w-full placeholder:text-gray-500 dark:placeholder:text-slate-500" />
    </div>
  );

  const AiButton = ns.showAiButton ? (
    <button type="button" aria-label="Ask AI" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 text-xs text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
      {ns.showLabels && <span>Ask AI</span>}
    </button>
  ) : null;

  const OrgButton = ns.showOrgSwitcher ? (
    <button type="button" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 text-xs text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
      <span>Organization</span>
    </button>
  ) : null;

  // ── VERTICAL SIDEBAR ──────────────────────────────────────────────────────
  if (isVertical) {
    return (
      <aside
        onMouseEnter={() => handleSidebarHover(true)}
        onMouseLeave={() => handleSidebarHover(false)}
        className={`${stickyLeftClass} ${sidebarWidth} h-screen flex flex-col ${bgClass} border-r ${borderClass} ${shadowClass} transition-all ${animDuration} overflow-visible shrink-0`}
      >
        <div className="flex items-center justify-center h-16 px-3 border-b border-gray-200 dark:border-zinc-800 shrink-0">
          <Link href="/dashboard">
            <Image src="/Logo.png" alt="Voctrum" width={isCollapsed ? 32 : 60} height={40} className="object-contain transition-all" />
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 space-y-0.5">
          {visibleModules.map((mod) => (
            <ModuleNavItem key={mod.id} mod={mod}
              isActive={pathname === mod.link || pathname.startsWith(mod.link + "/")}
              isCollapsed={isCollapsed} showTooltips={ns.showTooltips}
              activeStyle={ns.activeStyle} accentColor={ns.accentColor}
              showLabels={ns.showLabels} orientation={ns.orientation} />
          ))}
        </nav>
        <div className="shrink-0 border-t border-gray-200 dark:border-zinc-800 p-3 space-y-2">
          {ns.searchEnabled && !isCollapsed && SearchBar}
          {AiButton}
          <div className={`flex ${isCollapsed ? "justify-center" : "justify-start"}`}>
            <ProfileDropdown />
          </div>
        </div>
      </aside>
    );
  }

  // ── HYBRID ────────────────────────────────────────────────────────────────
  if (isHybrid) {
    return (
      <>
        <div className={`${stickyTopClass} w-full h-14 ${bgClass} border-b ${borderClass} ${shadowClass} transition-all ${animDuration}`}>
          <div className={`h-full flex items-center justify-between ${widthPadding} relative`}>
            <div className="flex items-center gap-3">
              <Link href="/dashboard"><Image src="/Logo.png" alt="Voctrum" width={60} height={38} className="object-contain" /></Link>
              {OrgButton}
              {ns.searchEnabled && ns.searchPosition === "left" && SearchBar}
            </div>
            {ns.searchEnabled && ns.searchPosition === "center" && (
              <div className="absolute left-1/2 -translate-x-1/2">{SearchBar}</div>
            )}
            <div className="flex items-center gap-2">
              {ns.searchEnabled && ns.searchPosition === "right" && SearchBar}
              {AiButton}
              <ProfileDropdown />
            </div>
          </div>
        </div>
        {ns.sticky === "fixed" && <div className="h-14" />}
        <aside
          onMouseEnter={() => handleSidebarHover(true)}
          onMouseLeave={() => handleSidebarHover(false)}
          className={`${ns.sticky === "fixed" ? (ns.position === "right" ? "fixed top-14 right-0 bottom-0" : "fixed top-14 left-0 bottom-0") : "relative"} ${sidebarWidth} ${bgClass} border-r ${borderClass} ${shadowClass} transition-all ${animDuration} overflow-visible z-40`}
        >
          <nav className="overflow-y-auto py-3 space-y-0.5 h-full">
            {visibleModules.map((mod) => (
              <ModuleNavItem key={mod.id} mod={mod}
                isActive={pathname === mod.link || pathname.startsWith(mod.link + "/")}
                isCollapsed={isCollapsed} showTooltips={ns.showTooltips}
                activeStyle={ns.activeStyle} accentColor={ns.accentColor}
                showLabels={ns.showLabels} orientation={ns.orientation} />
            ))}
          </nav>
        </aside>
      </>
    );
  }

  // ── HORIZONTAL — modules shown via overlay on grid-icon click ─────────────
  return (
    <>
      <div className={`${stickyTopClass} w-full h-16 ${bgClass} border-b ${borderClass} ${shadowClass} transition-all ${animDuration}`}>
        <div className={`h-full mx-auto flex items-center justify-between ${widthPadding} relative`}>
          {/* Left: logo + grid launcher */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center shrink-0">
              <Image src="/Logo.png" alt="Voctrum" width={70} height={45} className="object-contain" />
            </Link>

            {/* Module launcher grid button */}
            <button
              type="button"
              aria-label="Open modules"
              onClick={() => setShowModules((prev) => !prev)}
              className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                showModules
                  ? "bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400"
                  : "text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
              }`}
            >
              <GridIcon />
            </button>

            {OrgButton}
            {ns.searchEnabled && ns.searchPosition === "left" && SearchBar}
          </div>

          {/* Center search */}
          {ns.searchEnabled && ns.searchPosition === "center" && (
            <div className="absolute left-1/2 -translate-x-1/2">{SearchBar}</div>
          )}

          {/* Right */}
          <div className="flex items-center gap-2">
            {ns.searchEnabled && ns.searchPosition === "right" && SearchBar}
            {AiButton}
            <ProfileDropdown />
          </div>
        </div>
      </div>

      {ns.sticky === "fixed" && <div className="h-16" />}

      {/* Module overlay — only for horizontal mode */}
      {showModules && <ModuleOverlay onClose={() => setShowModules(false)} />}
    </>
  );
}