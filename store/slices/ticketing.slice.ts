import { StateCreator } from "zustand";
import { axiosInstance } from "@/lib/axiosInstance";
import { TicketFormData } from "@/types/ticketing.types";

export type TicketingSlice = {
    ticketingDashboardData: any;

    ticketingLoading: boolean;
    ticketingErrorMsg: string;

    // setters
    setTicketingDashboardData: (data: any) => void;

    // existing APIs
    fetchTicketingAdminDashboard: (year: number) => void;
    fetchTicketingDepartments: () => Promise<{ success: boolean; data?: string[]; msg?: string }>;

    // NEW APIs

    createTicket: (form: TicketFormData) => Promise<{ success: boolean; msg?: string }>;

    fetchInboxTickets: (department?: string) => Promise<{ success: boolean; data?: any; msg?: string }>;

    fetchTicketChat: (
        ticketId: string,
        skip?: number,
        limit?: string | number
    ) => Promise<{ success: boolean; data?: any; msg?: string }>;

    sendTicketMessage: (
        ticketId: string,
        to: string,
        msg: string,
        agent?: string,
        source?: string,
        senderId?: string
    ) => Promise<{ success: boolean; data?: any; msg?: string }>;

    addTicketNote: (
        ticketId: string,
        note: string
    ) => Promise<{ success: boolean; data?: any; msg?: string }>;

    fetchTicketOverview: (
        limit?: number,
        skip?: number
    ) => Promise<{
        success: boolean;
        data?: {
            [key: string]: any;
            departments?: string[];
        };
        msg?: string;
    }>;

    fetchTicketingDepartmentDashboard: (
        department?: string,
        year?: number
    ) => Promise<{ success: boolean; data?: any; msg?: string }>;

    fetchTicketingAgentDashboard: (
        agentId: string
    ) => Promise<{ success: boolean; data?: any; msg?: string }>;

    fetchTicketById: (
        ticketId: string
    ) => Promise<{ success: boolean; data?: any; msg?: string }>;

    updateTicketStatus: (
        payload: { form: { ticketId: string; status: string; note?: string } }
    ) => Promise<{ success: boolean; data?: any; msg?: string }>;

    updateTicketPriority: (
        payload: { form: { ticketId: string; priority: string } }
    ) => Promise<{ success: boolean; data?: any; msg?: string }>;

    assignTicketToAgent: (
        ticketId: string,
        agentId: string
    ) => Promise<{ success: boolean; msg?: string }>;

    assignTicketToDepartment: (
        ticketId: string,
        departmentName: string
    ) => Promise<{ success: boolean; msg?: string }>;

    fetchGlobalMessagePool: (
        limit?: number,
        page?: number,
        department?: string
    ) => Promise<{ success: boolean; data?: any[]; msg?: string }>;
};





export const createTicketingSlice: StateCreator<TicketingSlice> = ((set, get) => ({

    ticketingDashboardData: null,
    ticketingLoading: false,      
    ticketingErrorMsg: "",

    setTicketingDashboardData: (data) => set({ ticketingDashboardData: data }),

    fetchTicketingAdminDashboard : async (year?: number) => {
        try {
            const res = await axiosInstance.get("/ticketing/dashboard/admin", {
            params: year ? { year } : undefined,
            });
            return { success: true, data: res.data || {} };
        } catch (e: any) {
            return {
            success: false,
            msg: e?.response?.data?.msg || "Failed to fetch dashboard details",
            };
        }
    },

    fetchTicketingDepartments: async () => {
        try {
            set({ ticketingLoading: true, ticketingErrorMsg: "" });

            const res = await axiosInstance.get("/iam/groups/deparments/ticketing");

            const payload = res.data;

            const rows = Array.isArray(payload)
                ? payload
                : Array.isArray(payload?.departments)
                ? payload.departments
                : Array.isArray(payload?.data)
                ? payload.data
                : Array.isArray(payload?.groups)
                ? payload.groups
                : [];

            const departments = rows
                .map((item: any) =>
                    typeof item === "string"
                        ? item
                        : item?.departmentName ||
                          item?.name ||
                          item?.department ||
                          item?.groupName ||
                          ""
                )
                .map((item: string) => String(item).trim())
                .filter((item: string) => item.length > 0);

            set({ ticketingDashboardData: departments });

            return { success: true, data: departments };

        } catch (e: any) {
            const msg = e?.response?.data?.msg || "Failed to fetch ticketing departments";

            set({ ticketingErrorMsg: msg });

            return { success: false, msg };
        } finally {
            set({ ticketingLoading: false });
        }
    },

    createTicket: async (form: TicketFormData) => {
        try {
            set({ ticketingLoading: true, ticketingErrorMsg: "" });
            await axiosInstance.post("/ticketing/ticket/create", { form });
            return { success: true, msg: "Ticket created successfully" };
        } catch (e: any) {
            return {
            success: false,
            msg: e?.response?.data?.msg || "Failed to create ticket",
            };
        } finally {
            set({ ticketingLoading: true, ticketingErrorMsg: "" });
        }
    },

    fetchInboxTickets: async (department?: string) => {
        try {
            const res = await axiosInstance.get("/ticketing/ticket/inbox");
            const data = res.data?.tickets || res.data?.data || res.data?.inbox || [];
            return { success: true, data };
        } catch (e: any) {
            return {
            success: false,
            msg: e?.response?.data?.msg || "Failed to fetch tickets",
            };
        }
    },

    fetchTicketChat : async (ticketId: string, skip: number = 0, limit: string | number = 10) => {
        try {
            const res = await axiosInstance.get("/ticketing/ticket/chat", {
            params: { ticketId, skip: String(skip), limit: String(limit) },
            });
            return { success: true, data: res.data.ticket };
        } catch (e: any) {
            return {
            success: false,
            msg: e?.response?.data?.msg || "Failed to fetch chat messages",
            };
        }
    },

    sendTicketMessage : async (
        ticketId: string,
        to: string,
        msg: string,
        agent?: string,
        source?: string,
        senderId?: string
        ) => {
        try {
            const form: any = {
            ticketId,
            msg,
            };

            if (source === "page" || source === "facebook") {
            form.psid = senderId || to;
            } else {
            form.to = to;
            }

            if (agent?.trim()) {
            form.agent = agent.trim();
            }

            const res = await axiosInstance.post("/waba/message/send", {
            form,
            scope: source === "page" || source === "facebook" ? "facebook" : "whatsapp",
            });
            return { success: true, data: res.data };
        } catch (e: any) {
            return {
            success: false,
            msg: e?.response?.data?.msg || "Failed to send message",
            };
        }
    },

    addTicketNote : async (ticketId: string, note: string) => {
        const endpointVariants = ["/ticketing/ticket/add-note", "/ticket/add-note"];
        let lastError: any = null;

        for (const endpoint of endpointVariants) {
            try {
            const res = await   axiosInstance.post(endpoint, JSON.stringify(note), {
                params: { ticketId },
                headers: { "Content-Type": "application/json" },
            });
            return { success: true, data: res.data };
            } catch (e: any) {
            lastError = e;
            }
        }

        return { success: false, msg: lastError?.response?.data?.msg || "Failed to add note. Try again later." };
    },

    fetchTicketOverview : async (limit: number = 10, skip: number = 0) => {
        try {
            const res = await axiosInstance.get("/ticketing/overview", {
            params: { limit: String(limit), skip: String(skip) },
            });
            const overview = res.data?.overview || res.data || {};
            const departments = Array.isArray(res.data?.departments) ? res.data.departments : [];
            return {
            success: true,
            data: {
                ...overview,
                departments,
            },
            };
        } catch (e: any) {
            return {
            success: false,
            msg: e?.response?.data?.msg || "Failed to fetch details",
            };
        }
    },

    fetchTicketingDepartmentDashboard : async (department?: string, year?: number) => {
        try {
            const res = await axiosInstance.get("/ticketing/dashboard/department", {
            params: {
                department,
                ...(year ? { year } : {}),
            },
            });
            return { success: true, data: res.data || {} };
        } catch (e: any) {
            return {
            success: false,
            msg: e?.response?.data?.msg || "Failed to fetch department dashboard details",
            };
        }
    },

    fetchTicketingAgentDashboard : async (agentId: string) => {
        try {
            const res = await axiosInstance.get(`/ticketing/dashboard/${agentId}`);
            return { success: true, data: res.data || {} };
        } catch (e: any) {
            return {
            success: false,
            msg: e?.response?.data?.msg || "Failed to fetch agent dashboard details",
            };
        }
    },

    fetchTicketById : async (ticketId: string) => {
        try {
            const res = await axiosInstance.get("/ticketing/ticket/show", {
            params: { ticketId },
            });
            return { success: true, data: res.data.ticket };
        } catch (e: any) {
            return { success: false, msg: e?.response?.data?.msg || "Failed to fetch ticket details" };
        }
    },

    updateTicketStatus : async (payload: { form: { ticketId: string; status: string; note?: string } }) => {
        try {
            const res = await axiosInstance.post("/ticketing/ticket/status", payload);
            return { success: true, data: res.data };
        } catch (e: any) {
            return { success: false, msg: e?.response?.data?.msg || "Failed to update status" };
        }
    },

    updateTicketPriority : async (payload: { form: { ticketId: string; priority: string } }) => {
        try {
            const res = await axiosInstance.post("/ticketing/ticket/priority", payload);
            return { success: true, data: res.data };
        } catch (e: any) {
            return { success: false, msg: e?.response?.data?.msg || "Failed to update priority" };
        }
    },

    assignTicketToAgent : async (ticketId: string, agentId: string) => {
        try {
            const res = await axiosInstance.post("/ticketing/ticket/assign-agent", { ticketId, agentId });
            return { success: true, msg: res.data?.msg || "Ticket assigned successfully" };
        } catch (e: any) {
            return {
            success: false,
            msg: e?.response?.data?.msg || "Failed to assign ticket",
            };
        }
    },

    assignTicketToDepartment : async (ticketId: string, departmentName: string) => {
        try {
            const res = await axiosInstance.post("/ticketing/ticket/assign-department", { ticketId, departmentName });
            return { success: true, msg: res.data?.msg || "Department assigned successfully" };
        } catch (e: any) {
            return {
            success: false,
            msg: e?.response?.data?.msg || "Failed to assign department",
            };
        }
    },

    fetchGlobalMessagePool : async (limit: number = 10, page: number = 0, department?: string) => {
        try {
            const res = await axiosInstance.get("/ticketing/global/message-pool", {
            params: { limit: String(limit), page: String(page) },
            });

            const messages = res.data?.messages || res.data?.data || res.data?.tickets || [];
            return { success: true, data: Array.isArray(messages) ? messages : [] };
        } catch (e: any) {
            const errorData = e?.response?.data;
            const fallbackMessages = errorData?.messages || errorData?.data || errorData?.tickets;
            if (Array.isArray(fallbackMessages)) {
            return { success: true, data: fallbackMessages };
            }
            return { success: false, msg: e?.response?.data?.msg || "Failed to fetch global message pool" };
        }
    },
}));