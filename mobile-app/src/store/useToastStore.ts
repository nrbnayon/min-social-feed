import { create } from "zustand";
type ToastState = { visible: boolean; message: string; type: "success" | "error" | "info"; show: (message: string, type?: ToastState["type"]) => void; hide: () => void };
export const useToastStore = create<ToastState>((set) => ({ visible: false, message: "", type: "info", show: (message, type = "info") => set({ visible: true, message, type }), hide: () => set({ visible: false, message: "" }) }));
