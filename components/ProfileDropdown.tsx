"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalStore } from "@/store";
import SettingsPanel from "@/components/SettingsPanel";
import NotificationsPanel from "@/components/NotificationsPanel";
import { Settings, LogOut, User, Bell } from "lucide-react";

export default function ProfileDropdown() {
  const user = useGlobalStore((s) => s.user);
  const logout = useGlobalStore((s) => s.logout);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
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
          <div className="w-9 h-9 rounded-full bg-primary dark:bg-blue-600 flex items-center justify-center text-white text-sm font-bold select-none">
            {initials}
          </div>
          <svg
            className={`w-4 h-4 text-gray-700 dark:text-slate-300 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div
            className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl z-[9999] overflow-hidden ring-1 ring-gray-200 dark:ring-slate-700"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}
          >
            {/* Profile header */}
            <div className="bg-gray-50 dark:bg-slate-900 px-5 py-5 flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 flex items-center justify-center text-xl font-bold text-primary dark:text-blue-500">
                {initials}
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{displayName}</p>
              <p className="text-xs text-gray-600 dark:text-slate-400 -mt-1">{email}</p>
            </div>

            {/* View Profile */}
            <div className="px-4 py-3">
              <button
                onClick={() => { setOpen(false); router.push("/profile"); }}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/80 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
              >
                <User className="w-4 h-4" />
                View Profile
              </button>
            </div>

            <div className="border-t border-gray-200 dark:border-slate-700 mx-4" />

            {/* Notifications */}
            <button
              onClick={() => { setOpen(false); setNotificationsOpen(true); }}
              className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors"
            >
              <Bell className="w-4 h-4 text-gray-500 dark:text-slate-400" />
              Notifications
              <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-blue-500 text-white rounded-full">
                3
              </span>
            </button>

            {/* Settings */}
            <button
              onClick={() => { setOpen(false); setSettingsOpen(true); }}
              className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-500 dark:text-slate-400" />
              Settings
            </button>

            <div className="border-t border-gray-200 dark:border-slate-700 mx-4" />

            {/* Sign out */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        )}
      </div>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <NotificationsPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </>
  );
}
