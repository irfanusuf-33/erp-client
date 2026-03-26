"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalStore } from "@/store";
import SettingsPanel from "@/components/SettingsPanel";
import { Settings, LogOut, User } from "lucide-react";

export default function ProfileDropdown() {
  const user = useGlobalStore((s) => s.user);
  const logout = useGlobalStore((s) => s.logout);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user
    ? (`${user.fName?.[0] ?? ""}${user.lName?.[0] ?? ""}`).toUpperCase() || user.username?.[0]?.toUpperCase() || "?"
    : "?";

  const displayName = user
    ? user.username || `${user.fName} ${user.lName}`.trim()
    : "Guest";

  const email = user?.email ?? "";

  const handleLogout = async () => {
    setOpen(false);
    try { await logout(); } catch {}
    localStorage.removeItem("erp-auth-storage");
    router.push("/auth/login");
  };

  return (
    <>
      <div ref={ref} className="relative flex items-center gap-1">
        <button
          type="button"
          onClick={() => setOpen((p) => !p)}
          className="flex items-center gap-1 focus:outline-none"
          aria-label="User menu"
        >
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-primary text-sm font-bold select-none">
            {initials}
          </div>
          <svg
            className={`w-4 h-4 text-white transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div
            className="absolute right-0 top-full mt-2 w-64 bg-popover rounded-xl shadow-xl z-[9999] overflow-hidden ring-1 ring-foreground/10"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}
          >
            {/* Profile header */}
            <div className="bg-muted px-5 py-5 flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-background border-2 border-border flex items-center justify-center text-xl font-bold text-primary">
                {initials}
              </div>
              <p className="text-sm font-semibold text-foreground">{displayName}</p>
              <p className="text-xs text-muted-foreground -mt-1">{email}</p>
            </div>

            {/* View Profile */}
            <div className="px-4 py-3">
              <button
                onClick={() => { setOpen(false); router.push("/profile"); }}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/80 text-primary-foreground text-sm font-semibold py-2 rounded-lg transition-colors"
              >
                <User className="w-4 h-4" />
                View Profile
              </button>
            </div>

            <div className="border-t border-border mx-4" />

            {/* Settings */}
            <button
              onClick={() => { setOpen(false); setSettingsOpen(true); }}
              className="w-full flex items-center gap-3 px-5 py-3 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
              Settings
            </button>

            <div className="border-t border-border mx-4" />

            {/* Sign out */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-5 py-3 text-sm text-destructive hover:bg-destructive/5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        )}
      </div>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
