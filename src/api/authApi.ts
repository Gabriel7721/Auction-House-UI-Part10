import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "../types/auth";
import apiClient from "./client";
import { endpoints } from "./endpoints";

export const authApi = {
  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      endpoints.auth.register,
      payload,
    );
    return response.data;
  },

  async login(payload: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      endpoints.auth.login,
      payload,
    );
    return response.data;
  },

  async me(): Promise<User> {
    const response = await apiClient.get<{ user: User }>(endpoints.auth.me);
    return response.data.user;
  },

  async logout(): Promise<void> {
    await apiClient.post(endpoints.auth.logout);
  },
};
