import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/api/axios";
import type { StafUser } from "@/features/auth/stafTypes";
import { AxiosError } from "axios";

interface Credentials {
  email: string;
  password: string;
}

interface AuthResult {
  status: boolean;
  message?: string;
}

interface StafAuthState {
  user: StafUser | null;
  loading: boolean;
  login: (params: Credentials) => Promise<AuthResult>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useStafAuthStore = create<StafAuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,

      login: async (params) => {
        try {
          await api.get("/sanctum/csrf-cookie");
          const response = await api.post("/api/auth/staff/login", params);
          set({ user: response.data.data });
          return { status: true };
        } catch (error) {
          let errorMessage = "Terjadi kesalahan pada server.";
          if (error instanceof AxiosError && error.response) {
            errorMessage = error.response.data?.message || errorMessage;
          }
          return { status: false, message: errorMessage };
        }
      },

      logout: async () => {
        try {
          await api.post("/api/auth/staff/logout");
        } catch (error) {
          console.log(error);
        } finally {
          set({ user: null });
        }
      },

      checkAuth: async () => {
        try {
          const response = await api.get("/api/auth/staff/me");
          set({ user: response.data.data });
        } catch (error) {
          console.log(error);
          set({ user: null });
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "staf-auth",
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
