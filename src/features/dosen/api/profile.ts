import axios from "axios";
import api from "@/lib/api/axios";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import type { ApiResponse } from "@/lib/apiResponse";
import type { DosenProfileUpdatePayload, DosenUser, DosenMeResponse } from "@/features/dosen/types";

/**
 * Mengambil profil dosen dari endpoint GET /api/dosen/me
 */
export async function getDosenMe(): Promise<ApiResponse<DosenUser | null>> {
  try {
    const response = await api.get<DosenMeResponse>("/api/dosen/me");
    const raw = (response.data?.data || response.data) as unknown as DosenUser;

    return successResponse<DosenUser | null>(
      response.status,
      raw ?? null,
      response.data?.message || "Profil dosen berhasil diambil."
    );
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    let statusCode = 500;

    if (axios.isAxiosError(error) && error.response) {
      statusCode = error.response.status;
      errorMessage = error.response.data?.message || errorMessage;
    }

    return errorResponse(statusCode, errorMessage);
  }
}

export async function updateDosenProfile(
  payload: DosenProfileUpdatePayload
): Promise<ApiResponse<DosenUser | null>> {
  try {
    const response = await api.put("/api/dosen/profile/update", payload);

    return successResponse<DosenUser | null>(
      response.status,
      response.data?.data ?? null,
      response.data?.message || "Profil berhasil diperbarui"
    );
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    let validationErrors: Record<string, string[]> | null = null;
    let statusCode = 500;

    if (axios.isAxiosError(error) && error.response) {
      statusCode = error.response.status;
      errorMessage = error.response.data?.message || errorMessage;
      validationErrors = error.response.data?.errors || null;
    }

    return errorResponse(statusCode, errorMessage, validationErrors);
  }
}
