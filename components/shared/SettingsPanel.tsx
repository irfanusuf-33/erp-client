"use client";
import { useEffect, useRef, useState } from "react";
import {
  Sun, Moon, Monitor, Clock, Hash, DollarSign, Bell,
  Mail, Shield, History, User, ChevronRight, X, Check,
  Layout, GripVertical, Eye, EyeOff, Pin, Search, Palette,
  Zap, Settings2, RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useSettingsStore, DateFormat, TimeFormat, NumberFormat, Currency, Theme,
  NavbarSettings, NavbarModule, DEFAULT_NAVBAR_SETTINGS,
} from "@/store/slices/settings.slice";
import { useGlobalStore } from "@/store";

type Section =
  | "datetime"
  | "number"
  | "theme"
  | "history"
  | "currency"
  | "reminders"
  | "email"
  | "account"
  | "navbar";

const NAV: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "theme",     label: "Appearance",          icon: <Sun className="w-4 h-4" /> },
  { id: "navbar",    label: "Navbar Settings",      icon: <Layout className="w-4 h-4" /> },
  { id: "datetime",  label: "Date & Time Format",   icon: <Clock className="w-4 h-4" /> },
  { id: "number",    label: "Number Formatting",    icon: <Hash className="w-4 h-4" /> },
  { id: "currency",  label: "Currency",             icon: <DollarSign className="w-4 h-4" /> },
  { id: "email",     label: "Email Notifications",  icon: <Mail className="w-4 h-4" /> },
  { id: "reminders", label: "Reminder Settings",    icon: <Bell className="w-4 h-4" /> },
  { id: "history",   label: "Login History",        icon: <History className="w-4 h-4" /> },
  { id: "account",   label: "Account Settings",     icon: <User className="w-4 h-4" /> },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${checked ? "bg-primary" : "bg-muted"}`}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`} />
    </button>
  );
}

function OptionCard<T extends string>({
  value, current, label, sublabel, onClick,
}: { value: T; current: T; label: string; sublabel?: string; onClick: () => void }) {
  const active = value === current;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all flex items-center justify-between gap-2 ${
        active
          ? "border-blue-600 bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400 font-medium"
          : "border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-100"
      }`}
    >
      <span>
        <span className="block">{label}</span>
        {sublabel && <span className="text-xs text-gray-500 dark:text-zinc-400">{sublabel}</span>}
      </span>
      {active && <Check className="w-4 h-4 shrink-0" />}
    </button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-3">{children}</h3>;
}

function Divider() {
  return <div className="border-t border-gray-200 dark:border-zinc-800 my-5" />;
}

// ─── Individual Sections ──────────────────────────────────────────────────────

function ThemeSection() {
  const { theme, setTheme } = useSettingsStore();
  const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: "light",  label: "Light",  icon: <Sun className="w-5 h-5" /> },
    { value: "dark",   label: "Dark",   icon: <Moon className="w-5 h-5" /> },
    { value: "system", label: "System", icon: <Monitor className="w-5 h-5" /> },
  ];
  return (
    <div>
      <SectionTitle>Appearance</SectionTitle>
      <div className="grid grid-cols-3 gap-2">
        {themes.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTheme(t.value)}
            className={`flex flex-col items-center gap-2 py-4 rounded-xl border text-sm font-medium transition-all ${
              theme === t.value
                ? "border-blue-600 bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400"
                : "border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-500 dark:text-zinc-400"
            }`}
          >
            {t.icon}
            {t.label}
            {theme === t.value && <Check className="w-3 h-3" />}
          </button>
        ))}
      </div>
    </div>
  );
}

function DateTimeSection() {
  const { dateFormat, setDateFormat, timeFormat, setTimeFormat } = useSettingsStore();
  const dateOptions: { value: DateFormat; label: string; sublabel: string }[] = [
    { value: "MM/DD/YYYY", label: "MM/DD/YYYY", sublabel: "e.g. 07/25/2025" },
    { value: "DD/MM/YYYY", label: "DD/MM/YYYY", sublabel: "e.g. 25/07/2025" },
    { value: "YYYY-MM-DD", label: "YYYY-MM-DD", sublabel: "e.g. 2025-07-25" },
  ];
  return (
    <div>
      <SectionTitle>Date Format</SectionTitle>
      <div className="space-y-2">
        {dateOptions.map((o) => (
          <OptionCard key={o.value} value={o.value} current={dateFormat} label={o.label} sublabel={o.sublabel} onClick={() => setDateFormat(o.value)} />
        ))}
      </div>
      <Divider />
      <SectionTitle>Time Format</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        <OptionCard value="12h" current={timeFormat} label="12-hour" sublabel="e.g. 2:30 PM" onClick={() => setTimeFormat("12h")} />
        <OptionCard value="24h" current={timeFormat} label="24-hour" sublabel="e.g. 14:30" onClick={() => setTimeFormat("24h")} />
      </div>
    </div>
  );
}

function NumberSection() {
  const { numberFormat, setNumberFormat } = useSettingsStore();
  const options: { value: NumberFormat; label: string; sublabel: string }[] = [
    { value: "1,234.56", label: "1,234.56", sublabel: "Comma thousands, dot decimal" },
    { value: "1.234,56", label: "1.234,56", sublabel: "Dot thousands, comma decimal" },
    { value: "1 234.56", label: "1 234.56", sublabel: "Space thousands, dot decimal" },
  ];
  return (
    <div>
      <SectionTitle>Number Format</SectionTitle>
      <div className="space-y-2">
        {options.map((o) => (
          <OptionCard key={o.value} value={o.value} current={numberFormat} label={o.label} sublabel={o.sublabel} onClick={() => setNumberFormat(o.value)} />
        ))}
      </div>
    </div>
  );
}

function CurrencySection() {
  const { currency, setCurrency } = useSettingsStore();
  const options: { value: Currency; label: string; symbol: string }[] = [
    { value: "USD", label: "US Dollar",        symbol: "$" },
    { value: "EUR", label: "Euro",             symbol: "€" },
    { value: "GBP", label: "British Pound",    symbol: "£" },
    { value: "SAR", label: "Saudi Riyal",      symbol: "﷼" },
    { value: "INR", label: "Indian Rupee",     symbol: "₹" },
    { value: "CAD", label: "Canadian Dollar",  symbol: "CA$" },
    { value: "AED", label: "UAE Dirham",       symbol: "د.إ" },
  ];
  return (
    <div>
      <SectionTitle>Default Currency</SectionTitle>
      <div className="space-y-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => setCurrency(o.value)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-all ${
              currency === o.value
                ? "border-blue-600 bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400 font-medium"
                : "border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-100"
            }`}
          >
            <span className="flex items-center gap-3">
              <span className="w-8 text-center font-mono text-base">{o.symbol}</span>
              <span>{o.label}</span>
            </span>
            <span className="text-xs text-gray-500 dark:text-zinc-400 font-mono">{o.value}</span>
            {currency === o.value && <Check className="w-4 h-4 shrink-0 ml-2" />}
          </button>
        ))}
      </div>
    </div>
  );
}

function EmailSection() {
  const { emailNotifications, setEmailNotification } = useSettingsStore();
  const items: { key: keyof typeof emailNotifications; label: string; desc: string }[] = [
    { key: "security", label: "Security Alerts",    desc: "Login attempts, password changes" },
    { key: "updates",  label: "Product Updates",    desc: "New features and improvements" },
    { key: "reports",  label: "Weekly Reports",     desc: "Summary of your activity" },
    { key: "marketing",label: "Marketing Emails",   desc: "Tips, offers and announcements" },
  ];
  return (
    <div>
      <SectionTitle>Email Notifications</SectionTitle>
      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-zinc-800 last:border-0">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">{item.label}</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400">{item.desc}</p>
            </div>
            <Toggle checked={emailNotifications[item.key]} onChange={(v) => setEmailNotification(item.key, v)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function RemindersSection() {
  const { reminderSettings, setReminderSettings } = useSettingsStore();
  return (
    <div>
      <SectionTitle>Reminder Settings</SectionTitle>
      <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-zinc-800">
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">Enable Reminders</p>
          <p className="text-xs text-gray-500 dark:text-zinc-400">Get notified before deadlines</p>
        </div>
        <Toggle checked={reminderSettings.enabled} onChange={(v) => setReminderSettings({ enabled: v })} />
      </div>
      <div className={`space-y-4 mt-4 transition-opacity ${reminderSettings.enabled ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Reminder Time</label>
          <Input
            type="time"
            value={reminderSettings.reminderTime}
            onChange={(e) => setReminderSettings({ reminderTime: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">
            Days Before Deadline: <span className="text-foreground font-semibold">{reminderSettings.daysBeforeDeadline}</span>
          </label>
          <input
            type="range"
            min={1}
            max={14}
            value={reminderSettings.daysBeforeDeadline}
            onChange={(e) => setReminderSettings({ daysBeforeDeadline: Number(e.target.value) })}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>1 day</span><span>14 days</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function HistorySection() {
  const { loginHistory } = useSettingsStore();
  const fmt = (iso: string) => {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };
  return (
    <div>
      <SectionTitle>Login History</SectionTitle>
      <div className="space-y-2">
        {loginHistory.map((entry) => (
          <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800">
            <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${entry.status === "success" ? "bg-green-500" : "bg-destructive"}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-zinc-100 truncate">{entry.device}</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400">{entry.location} · {entry.ip}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-gray-500 dark:text-zinc-400">{fmt(entry.timestamp)}</p>
              <span className={`text-xs font-medium ${entry.status === "success" ? "text-green-600" : "text-destructive"}`}>
                {entry.status === "success" ? "Success" : "Failed"}
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-3 text-center">Showing last {loginHistory.length} sessions</p>
    </div>
  );
}

function AccountSection() {
  const user = useGlobalStore((s) => s.user);
  const [form, setForm] = useState({
    displayName: user ? `${user.fName ?? ""} ${user.lName ?? ""}`.trim() : "",
    email: user?.email ?? "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In a real app: call API to update profile
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <SectionTitle>Profile</SectionTitle>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Display Name</label>
          <Input value={form.displayName} onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))} placeholder="Your name" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Email Address</label>
          <Input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="you@example.com" type="email" />
        </div>
      </div>
      <Divider />
      <SectionTitle>Change Password</SectionTitle>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Current Password</label>
          <Input type="password" value={form.currentPassword} onChange={(e) => setForm((p) => ({ ...p, currentPassword: e.target.value }))} placeholder="••••••••" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">New Password</label>
          <Input type="password" value={form.newPassword} onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))} placeholder="••••••••" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Confirm New Password</label>
          <Input type="password" value={form.confirmPassword} onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))} placeholder="••••••••" />
        </div>
      </div>
      <div className="mt-5">
        <Button size="sm" onClick={handleSave} className="w-full">
          {saved ? <><Check className="w-4 h-4 mr-1" /> Saved</> : "Save Changes"}
        </Button>
      </div>
      <Divider />
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-destructive" />
          <p className="text-sm font-semibold text-destructive">Danger Zone</p>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Permanently delete your account and all associated data.</p>
        <Button variant="destructive" size="sm" className="w-full">Delete Account</Button>
      </div>
    </div>
  );
}

// ─── Navbar Settings Section ─────────────────────────────────────────────────

type NavbarRadioGroupProps<T extends string> = {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
};
function NavbarRadioGroup<T extends string>({ label, options, value, onChange }: NavbarRadioGroupProps<T>) {
  return (
    <div className="mb-4">
      <label className="text-xs font-medium text-muted-foreground block mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              value === o.value
                ? "border-blue-600 bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400"
                : "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-700"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Navbar Live Preview ──────────────────────────────────────────────────────
const PREVIEW_MODULES = ["Dashboard", "CRM", "HRM", "Inventory", "Calendar"];

function NavbarPreview({ ns }: { ns: import("@/store/slices/settings.slice").NavbarSettings }) {
  const isVertical = ns.orientation === "vertical";
  const isHybrid = ns.orientation === "hybrid";
  const isCollapsed = ns.sidebarBehavior === "collapsed";

  const bgStyle = ns.background === "glass"
    ? { background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)" }
    : { background: ns.navTheme === "dark" ? "#18181b" : "#ffffff" };

  const textColor = ns.navTheme === "dark" ? "#a1a1aa" : "#374151";
  const borderColor = ns.showBorder ? (ns.navTheme === "dark" ? "#3f3f46" : "#e5e7eb") : "transparent";
  const shadowStyle = ns.shadow === "none" ? {} : ns.shadow === "soft" ? { boxShadow: "0 1px 3px rgba(0,0,0,0.1)" } : { boxShadow: "0 4px 12px rgba(0,0,0,0.15)" };

  const visibleMods = PREVIEW_MODULES.slice(0, isCollapsed ? 5 : 4);

  const ModItem = ({ label, isFirst }: { label: string; isFirst?: boolean }) => {
    const active = isFirst;
    const activeStyle =
      ns.activeStyle === "background"
        ? { background: ns.accentColor + "22", color: ns.accentColor, borderRadius: 6 }
        : ns.activeStyle === "border"
        ? isVertical || isHybrid
          ? { borderLeft: `2px solid ${ns.accentColor}`, color: ns.accentColor }
          : { borderBottom: `2px solid ${ns.accentColor}`, color: ns.accentColor }
        : { color: ns.accentColor, textDecoration: "underline" };

    const dot = (
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: ns.accentColor, flexShrink: 0 }} />
    );

    if (isVertical || isHybrid) {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", ...(active ? activeStyle : { color: textColor }) }}>
          {dot}
          {!isCollapsed && ns.showLabels && <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{label}</span>}
        </div>
      );
    }
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 7px", borderRadius: 5, ...(active ? activeStyle : { color: textColor }) }}>
        {dot}
        {ns.showLabels && <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{label}</span>}
      </div>
    );
  };

  const SearchEl = ns.searchEnabled ? (
    <div style={{ display: "flex", alignItems: "center", gap: 4, background: ns.navTheme === "dark" ? "#27272a" : "#f3f4f6", borderRadius: 6, padding: "3px 8px", fontSize: 9, color: textColor, opacity: 0.7 }}>
      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <span>{ns.searchPlaceholder.slice(0, 10)}</span>
    </div>
  ) : null;

  const ProfileEl = (
    <div style={{ width: 20, height: 20, borderRadius: "50%", background: ns.accentColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontSize: 8, color: "#fff", fontWeight: 700 }}>U</span>
    </div>
  );

  if (isVertical) {
    const sideW = isCollapsed ? 36 : ns.width === "narrow" ? 80 : ns.width === "wide" ? 110 : 96;
    return (
      <div style={{ display: "flex", height: 120, borderRadius: 8, overflow: "hidden", border: "1px solid #e5e7eb", background: "#f9fafb" }}>
        {/* Sidebar */}
        <div style={{ width: sideW, ...bgStyle, borderRight: `1px solid ${borderColor}`, ...shadowStyle, display: "flex", flexDirection: "column", padding: "8px 0", gap: 2, flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
            <div style={{ width: isCollapsed ? 16 : 40, height: 8, borderRadius: 3, background: ns.accentColor, opacity: 0.8 }} />
          </div>
          {visibleMods.map((m, i) => <ModItem key={m} label={m} isFirst={i === 0} />)}
        </div>
        {/* Content area */}
        <div style={{ flex: 1, background: "#f3f4f6", display: "flex", flexDirection: "column", gap: 4, padding: 8 }}>
          <div style={{ height: 8, width: "60%", background: "#d1d5db", borderRadius: 3 }} />
          <div style={{ height: 6, width: "80%", background: "#e5e7eb", borderRadius: 3 }} />
          <div style={{ height: 6, width: "50%", background: "#e5e7eb", borderRadius: 3 }} />
        </div>
      </div>
    );
  }

  if (isHybrid) {
    const sideW = isCollapsed ? 36 : ns.width === "narrow" ? 70 : ns.width === "wide" ? 100 : 84;
    return (
      <div style={{ display: "flex", flexDirection: "column", height: 120, borderRadius: 8, overflow: "hidden", border: "1px solid #e5e7eb" }}>
        {/* Top bar */}
        <div style={{ height: 28, ...bgStyle, borderBottom: `1px solid ${borderColor}`, ...shadowStyle, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px", gap: 6 }}>
          <div style={{ width: 36, height: 8, borderRadius: 3, background: ns.accentColor, opacity: 0.8 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {ns.searchEnabled && ns.searchPosition !== "right" && SearchEl}
            {ns.showAiButton && <div style={{ fontSize: 8, color: textColor, opacity: 0.6 }}>AI</div>}
            {ns.searchEnabled && ns.searchPosition === "right" && SearchEl}
            {ProfileEl}
          </div>
        </div>
        {/* Body */}
        <div style={{ flex: 1, display: "flex" }}>
          <div style={{ width: sideW, ...bgStyle, borderRight: `1px solid ${borderColor}`, display: "flex", flexDirection: "column", padding: "4px 0", gap: 1 }}>
            {visibleMods.map((m, i) => <ModItem key={m} label={m} isFirst={i === 0} />)}
          </div>
          <div style={{ flex: 1, background: "#f3f4f6", padding: 6, display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ height: 7, width: "55%", background: "#d1d5db", borderRadius: 3 }} />
            <div style={{ height: 5, width: "75%", background: "#e5e7eb", borderRadius: 3 }} />
          </div>
        </div>
      </div>
    );
  }

  // Horizontal
  return (
    <div style={{ display: "flex", flexDirection: "column", height: 120, borderRadius: 8, overflow: "hidden", border: "1px solid #e5e7eb" }}>
      <div style={{ height: 36, ...bgStyle, borderBottom: `1px solid ${borderColor}`, ...shadowStyle, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 40, height: 10, borderRadius: 3, background: ns.accentColor, opacity: 0.8 }} />
          {ns.searchEnabled && ns.searchPosition === "left" && SearchEl}
          {visibleMods.map((m, i) => <ModItem key={m} label={m} isFirst={i === 0} />)}
        </div>
        {ns.searchEnabled && ns.searchPosition === "center" && SearchEl}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {ns.searchEnabled && ns.searchPosition === "right" && SearchEl}
          {ns.showAiButton && <div style={{ fontSize: 8, color: textColor, opacity: 0.6 }}>AI</div>}
          {ProfileEl}
        </div>
      </div>
      <div style={{ flex: 1, background: "#f3f4f6", padding: 10, display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ height: 8, width: "50%", background: "#d1d5db", borderRadius: 3 }} />
        <div style={{ height: 6, width: "70%", background: "#e5e7eb", borderRadius: 3 }} />
        <div style={{ height: 6, width: "40%", background: "#e5e7eb", borderRadius: 3 }} />
      </div>
    </div>
  );
}

function NavbarSettingsSection() {
  const { navbarSettings, setNavbarSettings, resetNavbarSettings } = useSettingsStore();
  const ns = navbarSettings;

  const [modules, setModules] = useState<NavbarModule[]>(
    [...ns.modules].sort((a, b) => a.order - b.order)
  );
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  // Sync local module state when store changes
  useEffect(() => {
    setModules([...ns.modules].sort((a, b) => a.order - b.order));
  }, [ns.modules]);

  // Apply module changes instantly to store
  const applyModules = (updated: NavbarModule[]) => {
    setModules(updated);
    setNavbarSettings({ modules: updated });
  };

  const handleReset = () => {
    resetNavbarSettings();
    setModules([...DEFAULT_NAVBAR_SETTINGS.modules]);
  };

  const toggleModule = (id: string) => {
    const updated = modules.map((m) => (m.id === id ? { ...m, visible: !m.visible } : m));
    applyModules(updated);
  };

  const togglePin = (id: string) => {
    const updated = modules.map((m) => (m.id === id ? { ...m, pinned: !m.pinned } : m));
    applyModules(updated);
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const reordered = [...modules];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(idx, 0, moved);
    const updated = reordered.map((m, i) => ({ ...m, order: i }));
    setModules(updated);
    setDragIdx(idx);
  };
  const handleDragEnd = () => {
    setDragIdx(null);
    setNavbarSettings({ modules });
  };

  return (
    <div className="space-y-1">
      {/* ── Live Preview ── */}
      <div className="rounded-lg border border-gray-200 dark:border-zinc-800 p-4 bg-gray-50 dark:bg-zinc-800/40 mb-3">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Live Preview</span>
          <span className="ml-auto text-xs text-muted-foreground">Updates in real-time</span>
        </div>
        <NavbarPreview ns={ns} />
      </div>
      <div className="rounded-lg border border-gray-200 dark:border-zinc-800 p-4 bg-gray-50 dark:bg-zinc-800/40">
        <div className="flex items-center gap-2 mb-3">
          <Layout className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Layout & Orientation</span>
        </div>
        <NavbarRadioGroup
          label="Orientation"
          value={ns.orientation}
          onChange={(v) => setNavbarSettings({ orientation: v })}
          options={[
            { value: "horizontal", label: "Horizontal Top" },
            { value: "vertical",   label: "Vertical Sidebar" },
            { value: "hybrid",     label: "Hybrid" },
          ]}
        />
        <NavbarRadioGroup
          label="Sidebar Behavior"
          value={ns.sidebarBehavior}
          onChange={(v) => setNavbarSettings({ sidebarBehavior: v })}
          options={[
            { value: "expanded",  label: "Expanded" },
            { value: "collapsed", label: "Collapsed (icons only)" },
          ]}
        />
        <NavbarRadioGroup
          label="Position"
          value={ns.position}
          onChange={(v) => setNavbarSettings({ position: v })}
          options={[
            { value: "left",  label: "Left" },
            { value: "right", label: "Right" },
          ]}
        />
        <NavbarRadioGroup
          label="Width"
          value={ns.width}
          onChange={(v) => setNavbarSettings({ width: v })}
          options={[
            { value: "narrow",   label: "Narrow" },
            { value: "standard", label: "Standard" },
            { value: "wide",     label: "Wide" },
          ]}
        />
        <NavbarRadioGroup
          label="Sticky Behavior"
          value={ns.sticky}
          onChange={(v) => setNavbarSettings({ sticky: v })}
          options={[
            { value: "fixed",      label: "Fixed" },
            { value: "scrollable", label: "Scrollable" },
          ]}
        />
      </div>

      {/* ── Modules & Visibility ── */}
      <div className="rounded-lg border border-gray-200 dark:border-zinc-800 p-4 bg-gray-50 dark:bg-zinc-800/40 mt-3">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Modules & Visibility</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Drag to reorder. Toggle visibility and pin favorites.</p>
        <div className="space-y-1.5">
          {modules.map((mod, idx) => (
            <div
              key={mod.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-grab active:cursor-grabbing ${
                dragIdx === idx
                  ? "border-blue-400 bg-blue-50 dark:bg-blue-600/10"
                  : "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              }`}
            >
              <GripVertical className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="flex-1 text-sm text-gray-800 dark:text-zinc-200">{mod.label}</span>
              <button
                type="button"
                onClick={() => togglePin(mod.id)}
                title={mod.pinned ? "Unpin" : "Pin"}
                className={`p-1 rounded transition-colors ${mod.pinned ? "text-yellow-500" : "text-gray-400 hover:text-yellow-500"}`}
              >
                <Pin className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => toggleModule(mod.id)}
                title={mod.visible ? "Hide" : "Show"}
                className={`p-1 rounded transition-colors ${mod.visible ? "text-blue-500" : "text-gray-400 hover:text-blue-500"}`}
              >
                {mod.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between py-2 border-t border-gray-200 dark:border-zinc-700">
            <span className="text-xs text-gray-700 dark:text-zinc-300">Show pinned modules at top</span>
            <Toggle checked={ns.showPinnedAtTop} onChange={(v) => setNavbarSettings({ showPinnedAtTop: v })} />
          </div>
          <div className="flex items-center justify-between py-2 border-t border-gray-200 dark:border-zinc-700">
            <span className="text-xs text-gray-700 dark:text-zinc-300">Show recently used modules</span>
            <Toggle checked={ns.showRecentModules} onChange={(v) => setNavbarSettings({ showRecentModules: v })} />
          </div>
        </div>
      </div>

      {/* ── Search & Actions ── */}
      <div className="rounded-lg border border-gray-200 dark:border-zinc-800 p-4 bg-gray-50 dark:bg-zinc-800/40 mt-3">
        <div className="flex items-center gap-2 mb-3">
          <Search className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Search & Actions</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-zinc-700 mb-3">
          <span className="text-xs text-gray-700 dark:text-zinc-300">Enable global search</span>
          <Toggle checked={ns.searchEnabled} onChange={(v) => setNavbarSettings({ searchEnabled: v })} />
        </div>
        <div className={`space-y-3 transition-opacity ${ns.searchEnabled ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
          <NavbarRadioGroup
            label="Search Position"
            value={ns.searchPosition}
            onChange={(v) => setNavbarSettings({ searchPosition: v })}
            options={[
              { value: "left",   label: "Left" },
              { value: "center", label: "Center" },
              { value: "right",  label: "Right" },
            ]}
          />
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Placeholder Text</label>
            <Input
              value={ns.searchPlaceholder}
              onChange={(e) => setNavbarSettings({ searchPlaceholder: e.target.value })}
              placeholder="Search..."
              className="text-sm"
            />
          </div>
        </div>
        <div className="mt-3 space-y-2 border-t border-gray-200 dark:border-zinc-700 pt-3">
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-gray-700 dark:text-zinc-300">App launcher (grid menu)</span>
            <Toggle checked={ns.showAppLauncher} onChange={(v) => setNavbarSettings({ showAppLauncher: v })} />
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-gray-700 dark:text-zinc-300">Notification center</span>
            <Toggle checked={ns.showNotificationCenter} onChange={(v) => setNavbarSettings({ showNotificationCenter: v })} />
          </div>
        </div>
      </div>

      {/* ── Appearance ── */}
      <div className="rounded-lg border border-gray-200 dark:border-zinc-800 p-4 bg-gray-50 dark:bg-zinc-800/40 mt-3">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Appearance</span>
        </div>
        <NavbarRadioGroup
          label="Shadow"
          value={ns.shadow}
          onChange={(v) => setNavbarSettings({ shadow: v })}
          options={[
            { value: "none",   label: "None" },
            { value: "soft",   label: "Soft" },
            { value: "medium", label: "Medium" },
          ]}
        />
        <NavbarRadioGroup
          label="Icon Style"
          value={ns.iconStyle}
          onChange={(v) => setNavbarSettings({ iconStyle: v })}
          options={[
            { value: "outline", label: "Outline" },
            { value: "filled",  label: "Filled" },
          ]}
        />
        <div className="mb-4">
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Accent Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={ns.accentColor}
              onChange={(e) => setNavbarSettings({ accentColor: e.target.value })}
              className="w-10 h-8 rounded border border-gray-200 dark:border-zinc-700 cursor-pointer bg-transparent"
            />
            <span className="text-xs font-mono text-gray-600 dark:text-zinc-400">{ns.accentColor}</span>
          </div>
        </div>
        <div className="space-y-2 border-t border-gray-200 dark:border-zinc-700 pt-3">
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-gray-700 dark:text-zinc-300">Show border</span>
            <Toggle checked={ns.showBorder} onChange={(v) => setNavbarSettings({ showBorder: v })} />
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-gray-700 dark:text-zinc-300">Show text labels</span>
            <Toggle checked={ns.showLabels} onChange={(v) => setNavbarSettings({ showLabels: v })} />
          </div>
        </div>
      </div>

      {/* ── Behavior & Interaction ── */}
      <div className="rounded-lg border border-gray-200 dark:border-zinc-800 p-4 bg-gray-50 dark:bg-zinc-800/40 mt-3">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Behavior & Interaction</span>
        </div>
        <NavbarRadioGroup
          label="Animation Speed"
          value={ns.animation}
          onChange={(v) => setNavbarSettings({ animation: v })}
          options={[
            { value: "fast",   label: "Fast" },
            { value: "normal", label: "Normal" },
            { value: "slow",   label: "Slow" },
          ]}
        />
        <NavbarRadioGroup
          label="Active Item Style"
          value={ns.activeStyle}
          onChange={(v) => setNavbarSettings({ activeStyle: v })}
          options={[
            { value: "background", label: "Background" },
            { value: "border",     label: "Border" },
            { value: "underline",  label: "Underline" },
          ]}
        />
        <div className="space-y-2 border-t border-gray-200 dark:border-zinc-700 pt-3">
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-gray-700 dark:text-zinc-300">Expand on hover</span>
            <Toggle checked={ns.expandOnHover} onChange={(v) => setNavbarSettings({ expandOnHover: v })} />
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-gray-700 dark:text-zinc-300">Auto-collapse sidebar</span>
            <Toggle checked={ns.autoCollapse} onChange={(v) => setNavbarSettings({ autoCollapse: v })} />
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-gray-700 dark:text-zinc-300">Show tooltips (collapsed mode)</span>
            <Toggle checked={ns.showTooltips} onChange={(v) => setNavbarSettings({ showTooltips: v })} />
          </div>
        </div>
      </div>

      {/* ── Advanced ── */}
      <div className="rounded-lg border border-gray-200 dark:border-zinc-800 p-4 bg-gray-50 dark:bg-zinc-800/40 mt-3">
        <div className="flex items-center gap-2 mb-3">
          <Settings2 className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Advanced</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-gray-700 dark:text-zinc-300">Show breadcrumbs</span>
            <Toggle checked={ns.showBreadcrumbs} onChange={(v) => setNavbarSettings({ showBreadcrumbs: v })} />
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-gray-700 dark:text-zinc-300">AI assistant button</span>
            <Toggle checked={ns.showAiButton} onChange={(v) => setNavbarSettings({ showAiButton: v })} />
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-gray-700 dark:text-zinc-300">Organization / branch switcher</span>
            <Toggle checked={ns.showOrgSwitcher} onChange={(v) => setNavbarSettings({ showOrgSwitcher: v })} />
          </div>
        </div>
      </div>

      {/* ── Reset ── */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800">
        <div className="flex-1 flex items-center gap-2 text-xs text-muted-foreground">
          <Check className="w-3.5 h-3.5 text-green-500" />
          All changes apply instantly
        </div>
        <Button size="sm" variant="outline" onClick={handleReset} className="flex items-center gap-1.5">
          <RotateCcw className="w-3.5 h-3.5" />
          Reset to Default
        </Button>
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function SettingsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [active, setActive] = useState<Section>("theme");
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const sectionMap: Record<Section, React.ReactNode> = {
    theme:     <ThemeSection />,
    navbar:    <NavbarSettingsSection />,
    datetime:  <DateTimeSection />,
    number:    <NumberSection />,
    currency:  <CurrencySection />,
    email:     <EmailSection />,
    reminders: <RemindersSection />,
    history:   <HistorySection />,
    account:   <AccountSection />,
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex">
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative ml-auto h-full w-full max-w-2xl bg-white dark:bg-zinc-900 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800 shrink-0">
          <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-100">Settings</h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar nav */}
          <nav className="w-52 shrink-0 border-r border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50 py-3 overflow-y-auto">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(item.id)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors text-left ${
                  active === item.id
                    ? "bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400 font-medium border-r-2 border-blue-600"
                    : "text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-zinc-100"
                }`}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {active === item.id && <ChevronRight className="w-3 h-3 shrink-0" />}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 bg-white dark:bg-zinc-900">
            {sectionMap[active]}
          </div>
        </div>
      </div>
    </div>
  );
}
