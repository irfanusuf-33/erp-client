import { StateCreator } from "zustand";
import { axiosInstance } from "@/lib/axiosInstance";

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  allDay?: boolean;
  inviteRequiredAttendees: string[];
  meetingLink?: string;
  selectedPlatform?: "google" | "zoom" | "teams";
  location: string;
  type?: string;
  color?: string;
  organizerId?: string;
};

export type CalendarSlice = {
  events: CalendarEvent[];
  calendarLoading: boolean;
  calendarErrorMsg: string;

  // Event CRUD
  createEvent: (eventData: any) => Promise<any>;
  updateEvent: (eventId: string, eventData: any) => Promise<any>;
  deleteEvent: (eventIds: string | string[]) => Promise<any>;
  getAllEvents: () => Promise<any>;
  getEventById: (eventId: string) => Promise<any>;
  
  // Attendees
  getAttendeesExceptMe: () => Promise<any>;
  getUserDetails: (email: string) => Promise<any>;
  
  // Meeting Links
  generateMeetingLink: (name: string, platform: string, start: Date, end: Date) => Promise<any>;
  
  // Event Response
  respondToEvent: (eventId: string, status: "accepted" | "rejected") => Promise<any>;
};

export const createCalendarSlice: StateCreator<CalendarSlice> = (set, get) => ({
  events: [],
  calendarLoading: false,
  calendarErrorMsg: "",

  createEvent: async (eventData) => {
    try {
      set({ calendarLoading: true });
      const formData = new FormData();
      
      formData.append('event', JSON.stringify({
        name: eventData.title,
        startDate: eventData.start,
        endDate: eventData.end,
        description: eventData.description,
        notes: '',
        type: eventData.type || 'meeting',
        attendies: eventData.attendies || [],
        meetingLink: eventData.meetingLink || '',
        allDay: eventData.allDay || false,
        location: eventData.location || ''
      }));

      if (eventData.attachments && eventData.attachments.length > 0) {
        eventData.attachments.forEach((file: File) => {
          formData.append('attachments', file);
        });
      }

      const res = await axiosInstance.post('/calendar/event', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      return res.data;
    } catch (error: any) {
      set({ calendarErrorMsg: error?.response?.data?.msg || "Failed to create event" });
      return {
        success: false,
        msg: error?.response?.data?.msg || "Failed to create event",
      };
    } finally {
      set({ calendarLoading: false });
    }
  },

  updateEvent: async (eventId, eventData) => {
    try {
      set({ calendarLoading: true });
      const payload: any = {};
      
      if (eventData.title !== undefined) payload.name = eventData.title;
      if (eventData.start !== undefined) payload.startDate = eventData.start;
      if (eventData.end !== undefined) payload.endDate = eventData.end;
      if (eventData.description !== undefined) payload.description = eventData.description;
      if (eventData.type !== undefined && eventData.type) payload.type = eventData.type;
      if (eventData.attendies !== undefined) payload.attendies = eventData.attendies;
      if (eventData.meetingLink !== undefined) payload.meetingLink = eventData.meetingLink;
      if (eventData.allDay !== undefined) payload.allDay = eventData.allDay;
      if (eventData.location !== undefined) payload.location = eventData.location;
      if (eventData.notes !== undefined) payload.notes = eventData.notes;
      
      const res = await axiosInstance.put(`/calendar/event/${eventId}`, {
        event: payload
      });
      
      return res.data;
    } catch (error: any) {
      set({ calendarErrorMsg: error?.response?.data?.msg || "Failed to update event" });
      return {
        success: false,
        msg: error?.response?.data?.msg || "Failed to update event",
      };
    } finally {
      set({ calendarLoading: false });
    }
  },

  deleteEvent: async (eventIds) => {
    try {
      set({ calendarLoading: true });
      const res = await axiosInstance.delete('/calendar/event', {
        data: { eventIds }
      });
      
      return res.data;
    } catch (error: any) {
      set({ calendarErrorMsg: error?.response?.data?.msg || "Failed to delete event" });
      return {
        success: false,
        msg: error?.response?.data?.msg || "Failed to delete event",
      };
    } finally {
      set({ calendarLoading: false });
    }
  },

  getAllEvents: async () => {
    try {
      set({ calendarLoading: true });
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      const res = await axiosInstance.get(`/calendar/events?timezone=${timezone}`);
      
      if (res.data.success) {
        const events: CalendarEvent[] = res.data.data.map((event: any) => ({
          id: event._id.toString(),
          title: event.name,
          start: new Date(event.startDate),
          end: new Date(event.endDate),
          description: event.description,
          type: event.type,
          inviteRequiredAttendees: event.attendies || [],
          organizerId: event.organizer,
          meetingLink: event.meetingLink,
          location: event.location,
          allDay: event.allDay
        }));
        
        set({ events });
        return { success: true, data: events };
      }
      
      return res.data;
    } catch (error: any) {
      set({ calendarErrorMsg: error?.response?.data?.msg || "Failed to fetch events" });
      return {
        success: false,
        msg: error?.response?.data?.msg || "Failed to fetch events",
      };
    } finally {
      set({ calendarLoading: false });
    }
  },

  getEventById: async (eventId) => {
    try {
      set({ calendarLoading: true });
      const res = await axiosInstance.get(`/calendar/event/details/${eventId}`);
      
      if (res.data.success && res.data.data) {
        res.data.data.id = res.data.data._id || res.data.data.id;
      }
      
      return res.data;
    } catch (error: any) {
      set({ calendarErrorMsg: error?.response?.data?.msg || "Failed to fetch event" });
      return {
        success: false,
        msg: error?.response?.data?.msg || "Failed to fetch event",
      };
    } finally {
      set({ calendarLoading: false });
    }
  },

  getAttendeesExceptMe: async () => {
    try {
      const res = await axiosInstance.get('/calendar/attendees');
      return {
        success: Boolean(res.data?.success),
        data: res.data?.data || [],
        msg: res.data?.msg || '',
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        msg: error?.response?.data?.msg || "Failed to fetch attendees",
      };
    }
  },

  getUserDetails: async (email: string) => {
    try {
      // Try IAM user details endpoint — returns full profile with timezone, status, etc.
      const res = await axiosInstance.get(`/iam/users/${encodeURIComponent(email)}`);
      const data = res.data?.user || res.data?.data || res.data;
      return { success: true, data };
    } catch {
      return { success: false, data: null };
    }
  },

  generateMeetingLink: async (name, platform, start, end) => {
    try {
      set({ calendarLoading: true });
      const res = await axiosInstance.post('/calendar/generateMeetingLink', {
        name,
        provider: platform,
        startDate: start,
        endDate: end,
      });
      
      const payload = res.data?.result ?? res.data;
      const link = typeof payload?.data === 'string' ? payload.data : '';

      if (payload?.success && link) {
        return {
          success: true,
          data: link,
          msg: payload?.msg || '',
        };
      }

      return {
        success: false,
        data: '',
        msg: payload?.msg || res.data?.msg || "Failed to generate meeting link",
      };
    } catch (error: any) {
      set({ calendarErrorMsg: error?.response?.data?.msg || "Failed to generate meeting link" });
      return {
        success: false,
        data: '',
        msg: error?.response?.data?.msg || "Failed to generate meeting link",
      };
    } finally {
      set({ calendarLoading: false });
    }
  },

  respondToEvent: async (eventId, status) => {
    try {
      set({ calendarLoading: true });
      const res = await axiosInstance.post(`/calendar/event/${eventId}/respond`, { status });
      return res.data;
    } catch (error: any) {
      set({ calendarErrorMsg: error?.response?.data?.msg || "Failed to update your response" });
      return {
        success: false,
        msg: error?.response?.data?.msg || "Failed to update your response",
        already: error?.response?.data?.already || false,
      };
    } finally {
      set({ calendarLoading: false });
    }
  },
});
