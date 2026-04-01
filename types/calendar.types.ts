export interface CalendarDropdownProps {
  selectedYear: number;
  selectedMonth: number;
  setDate: (date: Date) => void;
  setSelectedDate: (date: Date | null) => void;
  setSelectedDay: (day: number | null) => void;
  setSelectedYear: (year: number) => void;
  setSelectedMonth: (month: number) => void;
  setIsCalendarModalOpen: (open: boolean) => void;
  date: Date;
  selectedDate: Date | null;
  showMonthGrid: boolean;
  showWeekNumbers?: boolean;
}

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  allDay?: boolean;
  resource?: any;
  inviteRequiredAttendees: string[];
  meetingLink?: string;
  selectedPlatform?: "google" | "zoom" | "teams";
  location: string;
  type?: string;
  color?: string;
  isItalic?: boolean;
  organizerId?: string;
};

export interface NewEventForm {
  title: string;
  start: string;
  end: string;
  description: string;
  color: string;
  type: string;
  inviteRequiredAttendees: string[];
  meetingLink: string;
  allDay: boolean;
  selectedPlatform: string;
  location: string;
  isItalic?: boolean;
  attachments?: File[];
}

export type Filters = {
  meetings: boolean;
  appointments: boolean;
  interviews: boolean;
  inPerson: boolean;
};
