import axios, { AxiosError } from "axios";

import { env } from "../config/env";
import type { ApiErrorResponse } from "../types/api";
import { getAccessToken } from "../utils/auth";

const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Đã xảy ra lỗi. Vui lòng thử lại.",
): string => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return (
      error.response?.data?.message || error.response?.data?.error || fallback
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export const isUnauthorizedError = (error: unknown): boolean => {
  return axios.isAxiosError(error) && error.response?.status === 401;
};

export type ApiAxiosError = AxiosError<ApiErrorResponse>;

export default apiClient;
