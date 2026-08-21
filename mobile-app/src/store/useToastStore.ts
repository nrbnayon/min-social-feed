import { create } from "zustand";

export interface ToastData {
  message: string;
  icon?: string;
  type?: "success" | "error" | "info";
  duration?: number;
}

interface ToastState {
  toast: ToastData | null;
  showToast: (message: string, icon?: string, type?: "success" | "error" | "info") => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toast: null,
  showToast: (message, icon = "✓", type = "success") => {
    set({ toast: { message, icon, type } });
    setTimeout(() => {
      set({ toast: null });
    }, 2800);
  },
  hideToast: () => set({ toast: null }),
}));
