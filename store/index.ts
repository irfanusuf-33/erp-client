import { create } from "zustand";
import { AuthSlice, createAuthSlice } from "./slices/auth.slice";

export type AppStoreSlices = AuthSlice & {
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
};

export const useStore = create<AppStoreSlices>()((...a) => ({

    // individua module slices 
  ...createAuthSlice(...a),

 // this is global state 
  hasHydrated: false,
  setHasHydrated: (state: boolean) => a[0]({ hasHydrated: state }),
}));





// use it like this 




// const {login} = useStore()