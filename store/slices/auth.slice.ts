import { axiosInstance } from "@/lib/axiosInstance";
import {  LoginRequest, LoginResponse } from "@/types/auth.types";
import { User } from "@/types/iam.types";
import { StateCreator } from "zustand";




export type AuthSlice = {
    user: User | null;
    token: string | null;
    authLoading: boolean;
    isAuthenticated: boolean;
    errorMessage : string,

    setUser: (user: User) => void;

    login: (params: LoginRequest) => Promise<LoginResponse>;
    getRememberedCredentials: () => Promise<{ tenantId?: string; email?: string } | null>;
    logout: () => Promise<boolean>;

 
};

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
    user: null,
    token: null,
    authLoading: false,
    isAuthenticated: false,
    errorMessage : "",


    setUser: (user) => set({ user }),

    login: async (params: LoginRequest): Promise<LoginResponse> => {
        try {
            set({ authLoading: true, errorMessage: "" });

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
                const msg = loginResponse?.msg || "Login failed";
                set({ authLoading: false, errorMessage: msg });

                return { success: false, msg };
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
            const msg =
                error?.response?.data?.msg ||
                error?.response?.data?.message ||
                "Login failed";
            set({ authLoading: false, errorMessage: msg });

            return { success: false, msg };
        }
    },

    getRememberedCredentials: async () => {

        const stored = localStorage.getItem("rememberedCredentials");
        return stored ? JSON.parse(stored) : null;

    },


    logout: async () => {
        set({ authLoading: true });
        try {
            await axiosInstance.post('/auth/logout');
        } catch {}
        // clear persisted auth state regardless of API response
        set({
            user: null,
            token: null,
            isAuthenticated: false,
            authLoading: false
        });
        return true;
    },

    
});