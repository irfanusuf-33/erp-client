"use client";

import { usePathname } from "next/navigation";
import GlobalNavbar from "@/components/GlobalNavbar";

export default function NavbarWrapper() {
  const pathname = usePathname();
  if (pathname === "/auth/login") return null;
  return <GlobalNavbar />;
}
