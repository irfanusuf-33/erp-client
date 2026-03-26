import { create } from "zustand";
import { AuthSlice, createAuthSlice } from "./slices/auth.slice";
import { createIamSlice, IamSlice } from "./slices/iam.slice";
import { createInventorySlice, InventorySlice } from "./slices/inventory.slice";

export type AppStoreSlices = AuthSlice & IamSlice & InventorySlice & {
    hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
};

export const useGlobalStore = create<AppStoreSlices>()((...a) => ({
    ...createAuthSlice(...a),
    ...createIamSlice(...a),
    ...createInventorySlice(...a),

    hasHydrated: false,
    setHasHydrated: (state: boolean) => a[0]({ hasHydrated: state }),
}));



// use it like this 

// const {login} = useGlobalStore()