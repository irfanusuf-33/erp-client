import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: "https://erpapi.voctrum.com/api/v1",
    withCredentials: true,
});
