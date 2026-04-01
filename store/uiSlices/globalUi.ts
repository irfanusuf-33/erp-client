import { create } from "zustand";

interface GlobalUiState {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useGlobalUiStore = create<GlobalUiState>((set) => ({
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
}));
