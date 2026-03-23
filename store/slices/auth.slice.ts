import { axiosInstance } from "@/lib/axiosInstance";
import { AuthUser, LoginRequest, LoginResponse } from "@/types/auth.types";
import { StateCreator } from "zustand";




export type AuthSlice = {
    user: AuthUser | null;
    token: string | null;
    authLoading: boolean;
    isAuthenticated: boolean;
    errorMessage : string,

    login: (params: LoginRequest) => Promise<LoginResponse>;
    getRememberedCredentials: () => Promise<{ tenantId?: string; email?: string } | null>;
    logout: () => Promise<boolean>;
    setUser: (user: AuthUser) => void;
};

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
    user: null,
    token: null,
    authLoading: false,
    isAuthenticated: false,
    errorMessage : "",


    login: async (params: LoginRequest): Promise<LoginResponse> => {
        try {
            set({ authLoading: true });

            // remember credentials
            if (params.rememberMe) {
                localStorage.setItem(
                    "rememberedCredentials",
                    JSON.stringify({
                        tenantId: params.tenantId,
                        email: params.email,
                    })
                );
            } else {
                localStorage.removeItem("rememberedCredentials");
            }

            const { data: loginResponse } = await axiosInstance.post<LoginResponse>(
                "/auth/login",
                params
            );

            if (!loginResponse?.success) {
                set({ authLoading: false });

                return {
                    success: false,
                    msg: loginResponse?.msg ||  "Login failed",
                };
            }
            // just iterate zustand store after succesful login and return login response  
            set({
                user: loginResponse.user ?? null,
                token: loginResponse.token ?? null,
                authLoading: false,
                isAuthenticated: true
            });

            return loginResponse;

            // below  code is not necesary

            // // MFA flow
            // if (loginResponse.status === "MFA_REQUIRED") {
            //     return {
            //         success: true,
            //         status: 'MFA_REQUIRED',
            //         mfaSession: loginResponse.mfaSession,
            //         msg: loginResponse.msg,
            //         redirectUrl: loginResponse.redirectUrl,
            //     };
            // }

            // //Short way to do it

            // if (loginResponse.status === "MFA_REQUIRED") {
            //     return loginResponse
            // }


        } catch (error: any) {
            set({ authLoading: false });

            return {
                success: false,
                msg:
                    error?.response?.data?.msg ||
                    error?.response?.data?.message ||
                    "Login failed",
            };
        }
    },

    getRememberedCredentials: async () => {

        const stored = localStorage.getItem("rememberedCredentials");
        return stored ? JSON.parse(stored) : null;

    },


    logout: async () => {


        set({ authLoading: true })
        const res = await axiosInstance.post('/auth/logout');
        if (res.data.success) {
            // await AsyncStorage.removeItem("rememberedCredentials");
            set({
                user: null,
                token: null,
                isAuthenticated: false,
                authLoading: false
            });

            return true
        } else {
            return false
        }

    },

    setUser: (user) => set({ user }),
});