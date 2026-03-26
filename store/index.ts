import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AuthSlice, createAuthSlice } from "./slices/auth.slice";
import { createIamSlice, IamSlice } from "./slices/iam.slice";
import { createInventorySlice, InventorySlice } from "./slices/inventory.slice";

export type AppStoreSlices = AuthSlice & IamSlice & InventorySlice & {
    hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
};

export const useGlobalStore = create<AppStoreSlices>()(
    persist(
        (...a) => ({
            ...createAuthSlice(...a),
            ...createIamSlice(...a),
            ...createInventorySlice(...a),

            hasHydrated: false,
            setHasHydrated: (state: boolean) => a[0]({ hasHydrated: state }),
        }),
        {
            name: "erp-auth-storage",
            storage: createJSONStorage(() => localStorage),
            // only persist auth fields — not loading states or large data
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
