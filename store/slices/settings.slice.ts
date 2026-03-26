import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type DateFormat = "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
export type TimeFormat = "12h" | "24h";
export type NumberFormat = "1,234.56" | "1.234,56" | "1 234.56";
export type Currency = "USD" | "EUR" | "GBP" | "SAR" | "INR" | "CAD" | "AED";
export type Theme = "light" | "dark" | "system";

export type LoginHistoryEntry = {
  id: string;
  device: string;
  location: string;
  ip: string;
  timestamp: string;
  status: "success" | "failed";
};

export type SettingsState = {
  // Display
  theme: Theme;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  numberFormat: NumberFormat;
  currency: Currency;

  // Notifications
  emailNotifications: {
    marketing: boolean;
    security: boolean;
    updates: boolean;
    reports: boolean;
  };
  reminderSettings: {
    enabled: boolean;
    reminderTime: string; // e.g. "09:00"
    daysBeforeDeadline: number;
  };

  // Login history (mock — in real app fetched from API)
  loginHistory: LoginHistoryEntry[];

  // Actions
  setTheme: (theme: Theme) => void;
  setDateFormat: (f: DateFormat) => void;
  setTimeFormat: (f: TimeFormat) => void;
  setNumberFormat: (f: NumberFormat) => void;
  setCurrency: (c: Currency) => void;
  setEmailNotification: (key: keyof SettingsState["emailNotifications"], val: boolean) => void;
  setReminderSettings: (s: Partial<SettingsState["reminderSettings"]>) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "light",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
      numberFormat: "1,234.56",
      currency: "USD",
      emailNotifications: {
        marketing: false,
        security: true,
        updates: true,
        reports: false,
      },
      reminderSettings: {
        enabled: true,
        reminderTime: "09:00",
        daysBeforeDeadline: 2,
      },
      loginHistory: [
        { id: "1", device: "Chrome on Windows", location: "New York, US", ip: "192.168.1.1", timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), status: "success" },
        { id: "2", device: "Safari on iPhone", location: "London, UK", ip: "10.0.0.42", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), status: "success" },
        { id: "3", device: "Firefox on macOS", location: "Unknown", ip: "203.0.113.5", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), status: "failed" },
        { id: "4", device: "Chrome on Android", location: "Dubai, AE", ip: "172.16.0.8", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), status: "success" },
      ],

      setTheme: (theme) => set({ theme }),
      setDateFormat: (dateFormat) => set({ dateFormat }),
      setTimeFormat: (timeFormat) => set({ timeFormat }),
      setNumberFormat: (numberFormat) => set({ numberFormat }),
      setCurrency: (currency) => set({ currency }),
      setEmailNotification: (key, val) =>
        set((s) => ({ emailNotifications: { ...s.emailNotifications, [key]: val } })),
      setReminderSettings: (s) =>
        set((prev) => ({ reminderSettings: { ...prev.reminderSettings, ...s } })),
    }),
    {
      name: "erp-settings-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        theme: s.theme,
        dateFormat: s.dateFormat,
        timeFormat: s.timeFormat,
        numberFormat: s.numberFormat,
        currency: s.currency,
        emailNotifications: s.emailNotifications,
        reminderSettings: s.reminderSettings,
      }),
    }
  )
);
