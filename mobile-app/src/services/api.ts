import axios from "axios";
import { API_URL } from "@/constants/config";
import { storage } from "@/lib/storage";

export const api = axios.create({ baseURL: API_URL, timeout: 10000 });
api.interceptors.request.use(async (config) => {
  const token = await storage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
