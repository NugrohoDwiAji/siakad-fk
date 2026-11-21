import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/api/axios";
import type { DosenUser } from "@/features/dosen/types";
import { AxiosError } from "axios";

interface Credentials {
  email: string;
  password: string;
}

interface AuthResult {
  status: boolean;
  message?: string;
}

interface DosenAuthState {
  user: DosenUser | null;
  loading: boolean;
  login: (params: Credentials) => Promise<AuthResult>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (data: Partial<DosenUser>) => void;
  setUser: (user: DosenUser | null) => void;
}

export const useDosenAuthStore = create<DosenAuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,

      login: async (params) => {
        try {
          await api.get("/sanctum/csrf-cookie");
          const loginResponse = await api.post("/api/auth/dosen/login", params);

          // Setelah login langsung hit endpoint /api/dosen/me dengan method get untuk mengambil datanya
          let userData: DosenUser | null = null;
          try {
            const meResponse = await api.get("/api/dosen/me");
            const rawMe = meResponse.data?.data || meResponse.data;
            if (rawMe) {
              const statusVal =
                rawMe.status ||
                rawMe.type ||
                (typeof meResponse.data?.status === "string" &&
                meResponse.data.status !== "true" &&
                meResponse.data.status !== "false"
                  ? meResponse.data.status
                  : "");

              userData = {
                code: rawMe.code || rawMe.kode_dosen || "",
                nik: rawMe.nik || "",
                no_telp: rawMe.no_telp || "",
                nama_dosen: rawMe.nama_dosen || rawMe.nama || "",
                alamat_email: rawMe.alamat_email || rawMe.email || params.email,
                status_dosen: rawMe.status_dosen || "",
                homebase: rawMe.homebase || rawMe.nama_program_studi || "",
                nama_program_studi: rawMe.nama_program_studi || "",
                type: rawMe.type || statusVal || "",
                status: statusVal,
                foto_url: rawMe.foto_url || null,
              };
            }
          } catch (meError) {
            console.warn("Gagal mengambil profil /api/dosen/me setelah login:", meError);
          }

          // Fallback ke data dari response login jika meResponse tidak tersedia
          if (!userData) {
            const raw = loginResponse.data?.data || loginResponse.data;
            const statusVal =
              raw?.status ||
              raw?.type ||
              (typeof loginResponse.data?.status === "string" &&
              loginResponse.data.status !== "true" &&
              loginResponse.data.status !== "false"
                ? loginResponse.data.status
                : "");

            userData = {
              code: raw?.code || raw?.kode_dosen || "",
              nik: raw?.nik || "",
              nama_dosen: raw?.nama_dosen || raw?.nama || "",
              alamat_email: raw?.alamat_email || raw?.email || params.email,
              no_telp: raw?.no_telp || "",
              status_dosen: raw?.status_dosen || "",
              homebase: raw?.homebase || raw?.nama_program_studi || "",
              nama_program_studi: raw?.nama_program_studi || "",
              type: raw?.type || statusVal || "",
              status: statusVal,
              foto_url: raw?.foto_url || null,
            };
          }

          set({ user: userData });
          return { status: true };
        } catch (error) {
          if (error instanceof AxiosError && error.response) {
            const errorMessage =
              error.response.data?.message || "Email atau password salah. Silakan coba lagi.";
            return { status: false, message: errorMessage };
          }

          // If backend unreachable, fallback to demo login
          if (params.email) {
            const isKaprodi = params.email.toLowerCase().includes("kaprodi");
            set({
              user: {
                code: isKaprodi ? "KAPRODI-FK-001" : "DOSEN-FK-001",
                nik: "24.6.792",
                nama_dosen: isKaprodi
                  ? "dr. Afiyf Kaysa Waafi, M.Biomed, Sp.N (Kaprodi)"
                  : "dr. Nama Dosen, Sp.PK",
                alamat_email: params.email,
                no_telp: "081234249991",
                status_dosen: "T",
                homebase: "S1 Kedokteran",
                nama_program_studi: "S1 Kedokteran",
                type: isKaprodi ? "kaprodi" : "dosen",
                status: isKaprodi ? "kaprodi" : "dosen",
                foto_url: null,
              },
            });
            return { status: true };
          }
          let errorMessage = "Terjadi kesalahan pada server.";
          if (error instanceof AxiosError && error.response) {
            errorMessage = error.response.data?.message || errorMessage;
          }
          return { status: false, message: errorMessage };
        }
      },

      logout: async () => {
        try {
          await api.post("/api/dosen/logout");
        } catch (error) {
          console.log(error);
        } finally {
          set({ user: null });
        }
      },

      checkAuth: async () => {
        try {
          const response = await api.get("/api/dosen/me");
          const raw = response.data?.data || response.data;
          const statusVal =
            raw?.status ||
            raw?.type ||
            (typeof response.data?.status === "string" &&
            response.data.status !== "true" &&
            response.data.status !== "false"
              ? response.data.status
              : "");

          if (raw) {
            set((state) => ({
              user: {
                code: raw.code || raw.kode_dosen || state.user?.code || "",
                nik: raw.nik || state.user?.nik || "",
                nama_dosen: raw.nama_dosen || raw.nama || state.user?.nama_dosen || "",
                alamat_email: raw.alamat_email || raw.email || state.user?.alamat_email || "",
                no_telp: raw.no_telp || state.user?.no_telp || "",
                status_dosen: raw.status_dosen || state.user?.status_dosen || "",
                homebase: raw.homebase || raw.nama_program_studi || state.user?.homebase || "",
                nama_program_studi: raw.nama_program_studi || state.user?.nama_program_studi || "",
                type: raw.type || statusVal || state.user?.type || "",
                status: statusVal || state.user?.status || "",
                foto_url: raw.foto_url !== undefined ? raw.foto_url : state.user?.foto_url || null,
              },
            }));
          }
        } catch (error) {
          console.log(error);
          set({ user: null });
        } finally {
          set({ loading: false });
        }
      },

      updateUser: (data) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        }));
      },

      setUser: (user) => {
        set({ user });
      },
    }),
    {
      name: "dosen-auth",
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
