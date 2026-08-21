export type AuthResponse = { user: { id: string; username: string; email: string; avatarUrl?: string }; token: string };
export type RegisterInput = { username: string; email: string; password: string };
