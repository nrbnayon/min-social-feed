import { api } from "./api";
import type { Notification } from "@/types/notification";

export const notificationService = {
  list: () => api.get<{ data: Notification[] }>("/notifications").then((response) => response.data.data),
};
