import { api } from "./api";
import type { AuthResponse, RegisterInput } from "@/types/auth";

export const authService = {
  register: (input: RegisterInput) => api.post<{ data: AuthResponse }>("/auth/register", input).then((response) => response.data.data),
  login: (email: string, password: string) => api.post<{ data: AuthResponse }>("/auth/login", { email, password }).then((response) => response.data.data),
};
