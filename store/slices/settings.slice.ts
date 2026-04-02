import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type DateFormat = "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
export type TimeFormat = "12h" | "24h";
export type NumberFormat = "1,234.56" | "1.234,56" | "1 234.56";
export type Currency = "USD" | "EUR" | "GBP" | "SAR" | "INR" | "CAD" | "AED";
export type Theme = "light" | "dark" | "system";

// ─── Navbar Settings Types ────────────────────────────────────────────────────
export type NavbarOrientation = "horizontal" | "vertical" | "hybrid";
export type NavbarSidebarBehavior = "expanded" | "collapsed";
export type NavbarPosition = "left" | "right";
export type NavbarWidth = "narrow" | "standard" | "wide";
export type NavbarSticky = "fixed" | "scrollable";
export type NavbarTheme = "dark" | "light" | "system";
export type NavbarBackground = "solid" | "glass";
export type NavbarShadow = "none" | "soft" | "medium";
export type NavbarIconStyle = "outline" | "filled";
export type NavbarAnimation = "fast" | "normal" | "slow";
export type NavbarActiveStyle = "background" | "border" | "underline";
export type NavbarSearchPosition = "left" | "center" | "right";

export type NavbarModule = {
  id: string;
  label: string;
  visible: boolean;
  pinned: boolean;
  order: number;
};

export type NavbarSettings = {
  // Layout
  orientation: NavbarOrientation;
  sidebarBehavior: NavbarSidebarBehavior;
  position: NavbarPosition;
  width: NavbarWidth;
  sticky: NavbarSticky;
  // Appearance
  navTheme: NavbarTheme;
  background: NavbarBackground;
  showBorder: boolean;
  shadow: NavbarShadow;
  accentColor: string;
  iconStyle: NavbarIconStyle;
  showLabels: boolean;
  // Behavior
  expandOnHover: boolean;
  autoCollapse: boolean;
  animation: NavbarAnimation;
  showTooltips: boolean;
  activeStyle: NavbarActiveStyle;
  // Search
  searchEnabled: boolean;
  searchPosition: NavbarSearchPosition;
  searchPlaceholder: string;
  // Modules
  modules: NavbarModule[];
  showPinnedAtTop: boolean;
  showRecentModules: boolean;
  // Advanced
  showBreadcrumbs: boolean;
  showAiButton: boolean;
  showAppLauncher: boolean;
  showNotificationCenter: boolean;
  showOrgSwitcher: boolean;
};

export type LoginHistoryEntry = {
  id: string;
  device: string;
  location: string;
  ip: string;
  timestamp: string;
  status: "success" | "failed";
};

const DEFAULT_MODULES: NavbarModule[] = [
  { id: "crm",        label: "CRM",        visible: true,  pinned: false, order: 0 },
  { id: "hrm",        label: "HRM",        visible: true,  pinned: false, order: 1 },
  { id: "inventory",  label: "Inventory",  visible: true,  pinned: false, order: 2 },
  { id: "ticketing",  label: "Ticketing",  visible: true,  pinned: false, order: 3 },
  { id: "calendar",   label: "Calendar",   visible: true,  pinned: false, order: 4 },
  { id: "iam",        label: "IAM",        visible: true,  pinned: false, order: 5 },
  { id: "dashboard",  label: "Dashboard",  visible: true,  pinned: false, order: 6 },
];

export const DEFAULT_NAVBAR_SETTINGS: NavbarSettings = {
  orientation: "horizontal",
  sidebarBehavior: "expanded",
  position: "left",
  width: "standard",
  sticky: "fixed",
  navTheme: "system",
  background: "solid",
  showBorder: true,
  shadow: "soft",
  accentColor: "#2563eb",
  iconStyle: "outline",
  showLabels: true,
  expandOnHover: false,
  autoCollapse: false,
  animation: "normal",
  showTooltips: true,
  activeStyle: "background",
  searchEnabled: true,
  searchPosition: "right",
  searchPlaceholder: "Search...",
  modules: DEFAULT_MODULES,
  showPinnedAtTop: true,
  showRecentModules: false,
  showBreadcrumbs: false,
  showAiButton: false,
  showAppLauncher: true,
  showNotificationCenter: true,
  showOrgSwitcher: false,
};

export type SettingsState = {
  // Display
  theme: Theme;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  numberFormat: NumberFormat;
  currency: Currency;

  // Navbar
  navbarSettings: NavbarSettings;

  // Notifications
  emailNotifications: {
    marketing: boolean;
    security: boolean;
    updates: boolean;
    reports: boolean;
  };
  reminderSettings: {
    enabled: boolean;
    reminderTime: string;
    daysBeforeDeadline: number;
  };

  // Login history
  loginHistory: LoginHistoryEntry[];

  // Actions
  setTheme: (theme: Theme) => void;
  setDateFormat: (f: DateFormat) => void;
  setTimeFormat: (f: TimeFormat) => void;
  setNumberFormat: (f: NumberFormat) => void;
  setCurrency: (c: Currency) => void;
  setEmailNotification: (key: keyof SettingsState["emailNotifications"], val: boolean) => void;
  setReminderSettings: (s: Partial<SettingsState["reminderSettings"]>) => void;
  setNavbarSettings: (s: Partial<NavbarSettings>) => void;
  resetNavbarSettings: () => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "light",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
      numberFormat: "1,234.56",
      currency: "USD",
      navbarSettings: DEFAULT_NAVBAR_SETTINGS,
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
      setNavbarSettings: (s) =>
        set((prev) => ({ navbarSettings: { ...prev.navbarSettings, ...s } })),
      resetNavbarSettings: () =>
        set({ navbarSettings: DEFAULT_NAVBAR_SETTINGS }),
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
        navbarSettings: s.navbarSettings,
        emailNotifications: s.emailNotifications,
        reminderSettings: s.reminderSettings,
      }),
    }
  )
);
