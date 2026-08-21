export type User = { id: string; username: string; email: string; avatarUrl?: string };
export type AuthResponse = { user: User; token: string };
export type RegisterInput = { username: string; email: string; password: string };
