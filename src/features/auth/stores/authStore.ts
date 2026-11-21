import { create } from "zustand";
import api from "@/lib/api/axios";
import type { User } from "@/features/auth/types";
import { AxiosError } from "axios";

interface Credentials {
  nim: string;
  password: string;
}

interface AuthResult {
  status: boolean;
  message?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (params: Credentials) => Promise<AuthResult>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  login: async (params) => {
    try {
      // 1. Ambil CSRF Cookie dari Laravel Sanctum
      await api.get("/sanctum/csrf-cookie");

      // 2. Hit endpoint login
   await api.post("/api/auth/mhs/login", params);

   
      return { status: true };
    } catch (error) {
      let errorMessage = "Terjadi kesalahan pada server.";
      if (error instanceof AxiosError && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }

      // Kembalikan error agar bisa ditampilkan di UI/Form
      return { status: false, message: errorMessage };
    }
  },

  logout: async () => {
    try {
      await api.post("/api/mhs/logout");
      set({ user: null });
    } catch (error) {
      console.log(error);
    }
  },

  checkAuth: async () => {
    try {
      const response = await api.get("/api/mhs/me");
      set({ user: response.data.data });
    } catch (error) {
      console.log(error);
      set({ user: null });
    } finally {
      set({ loading: false });
    }
  },
}));
