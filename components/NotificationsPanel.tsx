"use client";
import { X, Bell } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NotificationsPanel({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end" onClick={onClose}>
      <div
        className="relative w-80 h-full bg-white dark:bg-zinc-900 shadow-2xl border-l border-gray-200 dark:border-zinc-800 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-gray-700 dark:text-zinc-300" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-100">Notifications</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-400 dark:text-zinc-400">No new notifications</p>
        </div>
      </div>
    </div>
  );
}
