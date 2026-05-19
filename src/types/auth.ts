export type UserRole = "user" | "admin";

export type User = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role?: UserRole;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type AuthResponse = {
  message?: string;
  token?: string;
  access_token?: string;
  refresh_token?: string;
  user: User;
};

