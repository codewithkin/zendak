import axios, { type AxiosInstance } from "axios";
import { env } from "@zendak/env/web";

export type AuthToken = string | null;

class APIClient {
  private instance: AxiosInstance;
  private tokenKey = "zendak-auth-token";

  constructor() {
    this.instance = axios.create({
      baseURL: env.NEXT_PUBLIC_SERVER_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor: attach Bearer token
    this.instance.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor: handle 401
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearToken();
        }
        throw error;
      },
    );
  }

  getToken(): AuthToken {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.tokenKey, token);
  }

  clearToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  get http() {
    return this.instance;
  }
}

export const apiClient = new APIClient();
