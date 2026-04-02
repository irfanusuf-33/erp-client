"use client";
import { useSettingsStore } from "@/store/slices/settings.slice";
import GlobalNavbar from "@/components/shared/GlobalNavbar";
import { usePathname } from "next/navigation";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { navbarSettings: ns } = useSettingsStore();

  if (pathname === "/auth/login") {
    return <>{children}</>;
  }

  const isVertical = ns.orientation === "vertical";
  const isHybrid = ns.orientation === "hybrid";
  const isCollapsed = ns.sidebarBehavior === "collapsed" || ns.autoCollapse;
  const sidebarWidth = isCollapsed ? "64px" : ns.width === "narrow" ? "192px" : ns.width === "wide" ? "288px" : "240px";

  if (isVertical && ns.sticky === "fixed") {
    // Fixed sidebar: content needs left/right margin to not go under sidebar
    const marginProp = ns.position === "right" ? { marginRight: sidebarWidth } : { marginLeft: sidebarWidth };
    return (
      <div className="flex min-h-screen">
        <GlobalNavbar />
        <main className="flex-1 min-w-0 transition-all duration-200" style={marginProp}>
          {children}
        </main>
      </div>
    );
  }

  if (isVertical && ns.sticky !== "fixed") {
    return (
      <div className="flex min-h-screen">
        <GlobalNavbar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    );
  }

  if (isHybrid && ns.sticky === "fixed") {
    const marginProp = ns.position === "right" ? { marginRight: sidebarWidth } : { marginLeft: sidebarWidth };
    return (
      <>
        <GlobalNavbar />
        <div className="flex flex-1">
          {/* sidebar is rendered inside GlobalNavbar as fixed */}
          <main className="flex-1 min-w-0 transition-all duration-200" style={marginProp}>
            {children}
          </main>
        </div>
      </>
    );
  }

  if (isHybrid && ns.sticky !== "fixed") {
    return (
      <>
        <GlobalNavbar />
        <div className="flex flex-1">
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </>
    );
  }

  // Horizontal (default)
  return (
    <>
      <GlobalNavbar />
      {children}
    </>
  );
}