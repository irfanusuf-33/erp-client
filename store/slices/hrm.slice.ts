import { axiosInstance } from "@/lib/axiosInstance";
import { Attendance } from "@/types/hrm.types";
import { StateCreator } from "zustand";

export type HrmSlice = {
  dailyArrivals: Attendance[];
  hrmLoading: boolean;
  errorMessage: string;

  fetchDailyArrivals: () => Promise<{
    success: boolean;
    data?: Attendance[];
    msg?: string;
  }>;
};

export const createHrmSlice: StateCreator<HrmSlice> = (set) => ({
  dailyArrivals: [],
  hrmLoading: false,
  errorMessage: "",

  fetchDailyArrivals: async () => {
  try {
    set({ hrmLoading: true });

    const { data } = await axiosInstance.get("/hrm/sessions/daily-arrival");

    console.log("Full response:", JSON.stringify(data, null, 2));
    console.log("Employees count:", data?.data?.employees?.length);

    const employees = data?.data?.employees ?? [];
    set({ dailyArrivals: employees });
    return { success: true, data: employees };
  } catch (error: any) {
    console.log("Error:", error?.response?.status, error?.response?.data);
    return {
      success: false,
      msg: error?.response?.data?.msg || "Failed to fetch",
    };
  } finally {
    set({ hrmLoading: false });
  }
},

});