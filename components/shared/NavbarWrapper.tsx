"use client";
import { usePathname } from "next/navigation";
import { useSettingsStore } from "@/store/slices/settings.slice";
import GlobalNavbar from "@/components/shared/GlobalNavbar";

export default function NavbarWrapper() {
  const pathname = usePathname();
  const { navbarSettings: ns } = useSettingsStore();

  if (pathname === "/auth/login") return null;

  const isVertical = ns.orientation === "vertical";
  const isHybrid = ns.orientation === "hybrid";
  const isCollapsed = ns.sidebarBehavior === "collapsed";
  const sidebarWidth = isCollapsed ? "64px" : ns.width === "narrow" ? "192px" : ns.width === "wide" ? "288px" : "240px";

  // For vertical sidebar: render as a flex row wrapper so sidebar + content sit side by side
  if (isVertical && ns.sticky !== "fixed") {
    return <GlobalNavbar />;
  }

  return <GlobalNavbar />;
}