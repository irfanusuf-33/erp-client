"use client";
import { useEffect, useRef, useState } from "react";
import {
  Sun, Moon, Monitor, Clock, Hash, DollarSign, Bell,
  Mail, Shield, History, User, ChevronRight, X, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettingsStore, DateFormat, TimeFormat, NumberFormat, Currency, Theme } from "@/store/slices/settings.slice";
import { useGlobalStore } from "@/store";

type Section =
  | "datetime"
  | "number"
  | "theme"
  | "history"
  | "currency"
  | "reminders"
  | "email"
  | "account";

const NAV: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "theme",     label: "Appearance",          icon: <Sun className="w-4 h-4" /> },
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
          ? "border-primary bg-primary/10 text-primary font-medium"
          : "border-border bg-background hover:bg-muted text-foreground"
      }`}
    >
      <span>
        <span className="block">{label}</span>
        {sublabel && <span className="text-xs text-muted-foreground">{sublabel}</span>}
      </span>
      {active && <Check className="w-4 h-4 shrink-0" />}
    </button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-foreground mb-3">{children}</h3>;
}

function Divider() {
  return <div className="border-t border-border my-5" />;
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
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background hover:bg-muted text-muted-foreground"
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
                ? "border-primary bg-primary/10 text-primary font-medium"
                : "border-border bg-background hover:bg-muted text-foreground"
            }`}
          >
            <span className="flex items-center gap-3">
              <span className="w-8 text-center font-mono text-base">{o.symbol}</span>
              <span>{o.label}</span>
            </span>
            <span className="text-xs text-muted-foreground font-mono">{o.value}</span>
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
          <div key={item.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
            <div>
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
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
      <div className="flex items-center justify-between py-3 border-b border-border">
        <div>
          <p className="text-sm font-medium text-foreground">Enable Reminders</p>
          <p className="text-xs text-muted-foreground">Get notified before deadlines</p>
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
          <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-background">
            <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${entry.status === "success" ? "bg-green-500" : "bg-destructive"}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{entry.device}</p>
              <p className="text-xs text-muted-foreground">{entry.location} · {entry.ip}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground">{fmt(entry.timestamp)}</p>
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
      <div className="relative ml-auto h-full w-full max-w-2xl bg-background shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-base font-semibold text-foreground">Settings</h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar nav */}
          <nav className="w-52 shrink-0 border-r border-border py-3 overflow-y-auto">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(item.id)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors text-left ${
                  active === item.id
                    ? "bg-primary/10 text-primary font-medium border-r-2 border-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {active === item.id && <ChevronRight className="w-3 h-3 shrink-0" />}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {sectionMap[active]}
          </div>
        </div>
      </div>
    </div>
  );
}
