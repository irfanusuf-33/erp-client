"use client";
import { useRouter } from "next/navigation";
import { useGlobalStore } from "@/store";
import { 
  X, User, Activity, CheckSquare, Settings, Shield, Bell, 
  Palette, Building2, Puzzle, HelpCircle, BookOpen, LogOut 
} from "lucide-react";

interface ProfilePanelProps {
  open: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onOpenNotifications: () => void;
}

export default function ProfilePanel({ open, onClose, onOpenSettings, onOpenNotifications }: ProfilePanelProps) {
  const router = useRouter();
  const user = useGlobalStore((s) => s.user);
  const logout = useGlobalStore((s) => s.logout);

  const fullName = user
    ? `${user.fName || ""} ${user.lName || ""}`.trim() || user.username || "User"
    : "Guest User";

  const initials = user
    ? `${user.fName?.[0] ?? ""}${user.lName?.[0] ?? ""}`.toUpperCase() || user.username?.[0]?.toUpperCase() || "U"
    : "G";

  const email = user?.email ?? "user@company.com";

  const handleLogout = async () => {
    onClose();
    try { await logout(); } catch {}
    localStorage.removeItem("erp-auth-storage");
    router.push("/auth/login");
  };

  const handleNavigation = (path: string) => {
    onClose();
    router.push(path);
  };

  const handleOpenSettings = () => {
    onClose();
    onOpenSettings();
  };

  const handleOpenNotifications = () => {
    onClose();
    onOpenNotifications();
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop with blur */}
      <div 
        className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm z-[9997] transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white dark:bg-zinc-900 shadow-2xl z-[9998] flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            aria-label="Close profile"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-zinc-400" />
          </button>
        </div>

        {/* User Info Header */}
        <div className="px-6 py-6 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary dark:bg-blue-600 flex items-center justify-center text-2xl font-bold text-white select-none">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 truncate">
                {fullName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-zinc-400 truncate">
                {email}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto">
          {/* Profile Section */}
          <div className="py-2">
            <button
              onClick={() => handleNavigation("/profile")}
              className="w-full flex items-center gap-3 px-6 py-3 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <User className="w-5 h-5 text-gray-500 dark:text-zinc-400" />
              <span className="text-sm font-medium">View Profile</span>
            </button>
            <button
              onClick={() => handleNavigation("/my-activity")}
              className="w-full flex items-center gap-3 px-6 py-3 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Activity className="w-5 h-5 text-gray-500 dark:text-zinc-400" />
              <span className="text-sm font-medium">My Activity</span>
            </button>
            <button
              onClick={() => handleNavigation("/my-tasks")}
              className="w-full flex items-center gap-3 px-6 py-3 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <CheckSquare className="w-5 h-5 text-gray-500 dark:text-zinc-400" />
              <span className="text-sm font-medium">My Tasks</span>
            </button>
          </div>

          <div className="border-t border-gray-200 dark:border-zinc-800" />

          {/* Settings Section */}
          <div className="py-2">
            <button
              onClick={handleOpenSettings}
              className="w-full flex items-center gap-3 px-6 py-3 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-500 dark:text-zinc-400" />
              <span className="text-sm font-medium">Settings</span>
            </button>
            <button
              onClick={() => handleNavigation("/security")}
              className="w-full flex items-center gap-3 px-6 py-3 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Shield className="w-5 h-5 text-gray-500 dark:text-zinc-400" />
              <span className="text-sm font-medium">Security</span>
            </button>
            <button
              onClick={handleOpenNotifications}
              className="w-full flex items-center gap-3 px-6 py-3 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-500 dark:text-zinc-400" />
              <span className="text-sm font-medium">Notifications</span>
            </button>
            <button
              onClick={() => handleNavigation("/appearance")}
              className="w-full flex items-center gap-3 px-6 py-3 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Palette className="w-5 h-5 text-gray-500 dark:text-zinc-400" />
              <span className="text-sm font-medium">Appearance</span>
            </button>
          </div>

          <div className="border-t border-gray-200 dark:border-zinc-800" />

          {/* Organization Section */}
          <div className="py-2">
            <button
              onClick={() => handleNavigation("/switch-organization")}
              className="w-full flex items-center gap-3 px-6 py-3 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Building2 className="w-5 h-5 text-gray-500 dark:text-zinc-400" />
              <span className="text-sm font-medium">Switch Organization</span>
            </button>
            <button
              onClick={() => handleNavigation("/integrations")}
              className="w-full flex items-center gap-3 px-6 py-3 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Puzzle className="w-5 h-5 text-gray-500 dark:text-zinc-400" />
              <span className="text-sm font-medium">Integrations</span>
            </button>
          </div>

          <div className="border-t border-gray-200 dark:border-zinc-800" />

          {/* Help Section */}
          <div className="py-2">
            <button
              onClick={() => handleNavigation("/help-support")}
              className="w-full flex items-center gap-3 px-6 py-3 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <HelpCircle className="w-5 h-5 text-gray-500 dark:text-zinc-400" />
              <span className="text-sm font-medium">Help & Support</span>
            </button>
            <button
              onClick={() => handleNavigation("/documentation")}
              className="w-full flex items-center gap-3 px-6 py-3 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <BookOpen className="w-5 h-5 text-gray-500 dark:text-zinc-400" />
              <span className="text-sm font-medium">Documentation</span>
            </button>
          </div>

          <div className="border-t border-gray-200 dark:border-zinc-800" />

          {/* Sign Out */}
          <div className="py-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-6 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
