import { StateCreator } from "zustand";
import { axiosInstance } from "@/lib/axiosInstance";
import { EmployeeListItem, ApiEmployee } from "@/types/hrm.types";
import { isAxiosError } from "axios";

/* ───────────────── Types ───────────────── */

type FetchEmployeesParams = {
  page?: number;
  limit?: number;
  search?: string;
};

type AttendanceQueryParams = Record<string, string>;

type HrmSettings = {
  workingDays: string[];
  workingDaysCount: number;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  msg?: string;
};

/* ───────────────── Helpers ───────────────── */

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error)) {
    const apiData = error.response?.data as
      | { msg?: string; message?: string }
      | undefined;

    if (apiData?.msg) return apiData.msg;
    if (apiData?.message) return apiData.message;
  }

  if (error instanceof Error) return error.message;

  return fallback;
};

/* ───────────────── Slice Type ───────────────── */

export type HrmSlice = {
  employees: EmployeeListItem[];
  employeesTotal: number;

  dailyArrivals: ApiEmployee[];

  hrmLoading: boolean;
  hrmErrorMsg: string;

  fetchEmployees: (
    params?: FetchEmployeesParams
  ) => Promise<ApiResponse<EmployeeListItem[]>>;

  fetchDailyArrivals: () => Promise<ApiResponse<ApiEmployee[]>>;

  createEmployee: (
    employeeData: unknown
  ) => Promise<ApiResponse<unknown>>;

  searchEmployees: (
    searchTerm: string
  ) => Promise<ApiResponse<ApiEmployee[]>>;

  getAttendance: (
    queryParams: AttendanceQueryParams,
    page?: number,
    limit?: number
  ) => Promise<ApiResponse<unknown>>;

  getLeaves: (
    page?: number,
    limit?: number
  ) => Promise<ApiResponse<unknown>>;

  updateLeaveStatus: (
    leaveId: string,
    status: string
  ) => Promise<ApiResponse<unknown>>;

  saveSettings: (
    settings: HrmSettings
  ) => Promise<ApiResponse<unknown>>;

  getSettings: () => Promise<ApiResponse<HrmSettings>>;

  /* Employee details page */

  fetchEmployeeById: (
    employeeId: string
  ) => Promise<ApiResponse<unknown>>;

  updateEmployee: (
    employeeId: string,
    employeeData: unknown
  ) => Promise<ApiResponse<unknown>>;
};

/* ───────────────── Slice Implementation ───────────────── */

export const createHrmSlice: StateCreator<HrmSlice> = (set) => ({
  employees: [],
  employeesTotal: 0,

  dailyArrivals: [],

  hrmLoading: false,
  hrmErrorMsg: "",

  /* ───────── Employees ───────── */

  fetchEmployees: async ({ page = 1, limit = 10, search = "" } = {}) => {
    try {
      set({ hrmLoading: true, hrmErrorMsg: "" });

      const { data } = await axiosInstance.get("/hrm/employee/all", {
        params: { page, limit, search },
      });

      const employees = (data?.employees ??
        data?.data?.employees ??
        []) as EmployeeListItem[];

      const total =
        Number(
          data?.total ??
            data?.data?.total ??
            data?.count ??
            data?.data?.count ??
            employees.length
        ) || employees.length;

      set({
        employees,
        employeesTotal: total,
      });

      return { success: true, data: employees };
    } catch (error) {
      const msg = getErrorMessage(error, "Failed to fetch employees");
      set({ hrmErrorMsg: msg });

      return { success: false, msg };
    } finally {
      set({ hrmLoading: false });
    }
  },

  createEmployee: async (employeeData) => {
    try {
      set({ hrmLoading: true });

      const { data } = await axiosInstance.post(
        "/hrm/employee/create",
        employeeData
      );

      return {
        success: true,
        data,
        msg: data?.msg ?? "Employee created successfully",
      };
    } catch (error) {
      const msg = getErrorMessage(error, "Failed to create employee");
      return { success: false, msg };
    } finally {
      set({ hrmLoading: false });
    }
  },

  searchEmployees: async (searchTerm) => {
    try {
      const { data } = await axiosInstance.get("/hrm/employee/search", {
        params: { searchTerm },
      });

      const employees = (data?.employees ?? []) as ApiEmployee[];

      return { success: true, data: employees };
    } catch (error) {
      const msg = getErrorMessage(error, "Failed to search employees");
      return { success: false, msg };
    }
  },

  /* ───────── Attendance ───────── */

  fetchDailyArrivals: async () => {
    try {
      set({ hrmLoading: true });

      const { data } = await axiosInstance.get(
        "/hrm/sessions/daily-arrival"
      );

      const employees = (data?.data?.employees ??
        []) as ApiEmployee[];

      set({ dailyArrivals: employees });

      return { success: true, data: employees };
    } catch (error) {
      const msg = getErrorMessage(
        error,
        "Failed to fetch daily arrivals"
      );

      return { success: false, msg };
    } finally {
      set({ hrmLoading: false });
    }
  },

  getAttendance: async (queryParams, page = 1, limit = 10) => {
    try {
      set({ hrmLoading: true });

      const params = new URLSearchParams(queryParams);
      params.append("page", String(page));
      params.append("limit", String(limit));

      const { data } = await axiosInstance.get(
        `/hrm/sessions/attendance?${params.toString()}`
      );

      return {
        success: true,
        data,
        msg: data?.msg,
      };
    } catch (error) {
      const msg = getErrorMessage(error, "Failed to fetch attendance");
      return { success: false, msg };
    } finally {
      set({ hrmLoading: false });
    }
  },

  /* ───────── Leaves ───────── */

  getLeaves: async (page = 1, limit = 10) => {
    try {
      set({ hrmLoading: true });

      const { data } = await axiosInstance.get(
        `/hrm/leaves/all?page=${page}&limit=${limit}`
      );

      return {
        success: true,
        data,
        msg: data?.msg,
      };
    } catch (error) {
      const msg = getErrorMessage(error, "Failed to fetch leaves");
      return { success: false, msg };
    } finally {
      set({ hrmLoading: false });
    }
  },

  updateLeaveStatus: async (leaveId, status) => {
    try {
      set({ hrmLoading: true });

      const { data } = await axiosInstance.put(
        "/hrm/leave/status",
        { leaveId, status }
      );

      return {
        success: true,
        data,
        msg: data?.msg,
      };
    } catch (error) {
      const msg = getErrorMessage(error, "Failed to update leave status");
      return { success: false, msg };
    } finally {
      set({ hrmLoading: false });
    }
  },

  /* ───────── Settings ───────── */

  saveSettings: async (settings) => {
    try {
      set({ hrmLoading: true });

      const { data } = await axiosInstance.post(
        "/hrm/settings",
        settings
      );

      return {
        success: true,
        data,
        msg: data?.msg ?? "Settings saved successfully",
      };
    } catch (error) {
      const msg = getErrorMessage(error, "Failed to save settings");
      return { success: false, msg };
    } finally {
      set({ hrmLoading: false });
    }
  },

  getSettings: async () => {
    try {
      set({ hrmLoading: true });

      const { data } = await axiosInstance.get("/hrm/settings");

      return {
        success: true,
        data: data?.data,
      };
    } catch (error) {
      const msg = getErrorMessage(error, "Failed to fetch settings");
      return { success: false, msg };
    } finally {
      set({ hrmLoading: false });
    }
  },

  /* ───────── Employee Details Page ───────── */

  fetchEmployeeById: async (employeeId: string) => {
    try {
      set({ hrmLoading: true });

      const { data } = await axiosInstance.get(`/hrm/employee/${employeeId}`);

      return {
        success: true,
        data: data?.employee ?? data?.data ?? data,
        msg: data?.msg,
      };
    } catch (error) {
      const msg = getErrorMessage(error, "Failed to fetch employee");
      return { success: false, msg };
    } finally {
      set({ hrmLoading: false });
    }
  },

  updateEmployee: async (employeeId: string, employeeData: unknown) => {
    try {
      set({ hrmLoading: true });

      const { data } = await axiosInstance.put(
        `/hrm/employee/update/${employeeId}`,
        employeeData
      );

      return {
        success: true,
        data,
        msg: data?.msg ?? "Employee updated successfully",
      };
    } catch (error) {
      const msg = getErrorMessage(error, "Failed to update employee");
      return { success: false, msg };
    } finally {
      set({ hrmLoading: false });
    }
  },
});