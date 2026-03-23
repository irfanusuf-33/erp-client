import { create } from "zustand";
import { AuthSlice, createAuthSlice } from "./slices/auth.slice";
import { createIamSlice, IamSlice } from "./slices/iam.slice";

export type AppStoreSlices = AuthSlice & IamSlice & {
    hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
};

export const useGlobalStore = create<AppStoreSlices>()((...a) => ({

    // individua module slices 
    // create Other Slices in the  same file systme /store/slices/slicename.slice.ts
    // add here 
    ...createAuthSlice(...a),
    ...createIamSlice(...a),

    // this is global state 
    hasHydrated: false,
    setHasHydrated: (state: boolean) => a[0]({ hasHydrated: state }),
}));



// use it like this 

// const {login} = useGlobalStore()