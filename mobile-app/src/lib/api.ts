import { api } from "@/services/api";
export const getHomeDashboard = async () => (await api.get("/posts")).data.data;
export const userUpdatePushToken = async (_token: string) => undefined;
