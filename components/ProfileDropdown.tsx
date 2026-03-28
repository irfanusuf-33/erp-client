"use client";
import { useState } from "react";
import { useGlobalStore } from "@/store";
import SettingsPanel from "@/components/SettingsPanel";
import NotificationsPanel from "@/components/NotificationsPanel";
import ProfilePanel from "@/components/ProfilePanel";

export default function ProfileDropdown() {
  const user = useGlobalStore((s) => s.user);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const initials = user
    ? (`${user.fName?.[0] ?? ""}${user.lName?.[0] ?? ""}`).toUpperCase() || user.username?.[0]?.toUpperCase() || "U"
    : "G";

  return (
    <>
      <button
        type="button"
        onClick={() => setProfileOpen(true)}
        className="flex items-center gap-1 focus:outline-none hover:opacity-80 transition-opacity"
        aria-label="Open profile"
      >
        <div className="w-9 h-9 rounded-full bg-primary dark:bg-blue-600 flex items-center justify-center text-white text-sm font-bold select-none">
          {initials}
        </div>
        <svg
          className="w-4 h-4 text-gray-700 dark:text-slate-300"
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <ProfilePanel 
        open={profileOpen} 
        onClose={() => setProfileOpen(false)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenNotifications={() => setNotificationsOpen(true)}
      />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <NotificationsPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </>
  );
}
