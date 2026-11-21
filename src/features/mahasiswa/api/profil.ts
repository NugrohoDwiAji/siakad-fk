import axios from "axios";
import api from "@/lib/api/axios";
import type { EditProfileValues } from "@/features/mahasiswa/types";

export async function editProfile(values: EditProfileValues) {
  try {
    const response = await api.put("/api/mhs/profile", values);
    return { status: true, data: response.data.data };
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return { status: false, message: errorMessage };
  }
}

// ─── smester ────────────────────────────────────────────────────────────────

