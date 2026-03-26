import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "/api",          // relative to your Next.js origin
  withCredentials: true,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});