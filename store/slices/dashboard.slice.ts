import { axiosInstance } from "@/lib/axiosInstance";
import { DashboardData } from "@/types/dashboard.types";
import { StateCreator } from "zustand";

export type DashboardSlice = {
  dashboardData: DashboardData | null;
  dashboardLoading: boolean;
  dashboardError: string | null;

  getDashboardStats: () => Promise<DashboardData>;
  getModuleStats: (moduleId: string) => Promise<any>;
};

// Mock data for development
function getMockDashboardData(): DashboardData {
  return {
    userName: "", // Not used anymore, fetched from auth store
    modules: [
      {
        id: "hrm",
        title: "HR & Payroll",
        color: "#3b82f6",
        stats: {
          employees: 45,
          payrollDue: "₹520,000",
          leaveRequests: 8,
        },
      },
      {
        id: "iam",
        title: "IAM",
        color: "#8b5cf6",
        stats: {
          totalUsers: 120,
          activeUsers: 98,
          pendingApprovals: 5,
        },
      },
      {
        id: "inventory",
        title: "Inventory Status",
        color: "#10b981",
        stats: {
          inStock: 1250,
          lowStock: 85,
          totalValue: "₹2.5M",
        },
      },
      {
        id: "crm",
        title: "CRM Insights",
        color: "#f59e0b",
        stats: {
          newLeads: 45,
          openDeals: 32,
          followUps: 67,
        },
      },
      {
        id: "accounts",
        title: "Finance Summary",
        color: "#06b6d4",
        stats: {
          expenses: "₹180K",
          profit: "₹95K",
          outstanding: "₹70K",
        },
      },
      {
        id: "calendar",
        title: "Calendar & Events",
        color: "#ec4899",
        stats: {
          upcomingEvents: 12,
          todayMeetings: 4,
          pendingRSVP: 3,
        },
      },
    ],
  };
}

export const createDashboardSlice: StateCreator<DashboardSlice> = (set) => ({
  dashboardData: null,
  dashboardLoading: false,
  dashboardError: null,

  getDashboardStats: async (): Promise<DashboardData> => {
    try {
      set({ dashboardLoading: true, dashboardError: null });
      const response = await axiosInstance.get("/api/dashboard/stats");
      const data = response.data;
      set({ dashboardData: data, dashboardLoading: false });
      return data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Return mock data as fallback
      const mockData = getMockDashboardData();
      set({ dashboardData: mockData, dashboardLoading: false });
      return mockData;
    }
  },

  getModuleStats: async (moduleId: string) => {
    try {
      set({ dashboardLoading: true, dashboardError: null });
      const response = await axiosInstance.get(`/api/dashboard/module/${moduleId}`);
      set({ dashboardLoading: false });
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${moduleId} stats:`, error);
      set({ dashboardLoading: false, dashboardError: `Failed to fetch ${moduleId} stats` });
      throw error;
    }
  },
});
