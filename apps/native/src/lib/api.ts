import axios, { type AxiosInstance } from "axios";
import * as SecureStore from "expo-secure-store";
import { env } from "@zendak/env/native";

export type AuthToken = string | null;

class APIClient {
  private instance: AxiosInstance;
  private tokenKey = "zendak-auth-token";
  private tokenPromise: Promise<string | null> | null = null;

  constructor() {
    this.instance = axios.create({
      baseURL: env.EXPO_PUBLIC_SERVER_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor: attach Bearer token
    this.instance.interceptors.request.use(async (config) => {
      const token = await this.getToken();
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

  async getToken(): Promise<AuthToken> {
    if (this.tokenPromise) {
      return this.tokenPromise;
    }

    this.tokenPromise = SecureStore.getItemAsync(this.tokenKey).catch(() => null);
    const token = await this.tokenPromise;
    this.tokenPromise = null;
    return token;
  }

  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(this.tokenKey, token);
  }

  async clearToken(): Promise<void> {
    await SecureStore.deleteItemAsync(this.tokenKey);
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  get http() {
    return this.instance;
  }
}

export const apiClient = new APIClient();
