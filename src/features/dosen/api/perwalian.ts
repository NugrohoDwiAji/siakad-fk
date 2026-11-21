import axios from "axios";
import api from "@/lib/api/axios";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import type { ApiResponse } from "@/lib/apiResponse";
import type {
  DosenPerwalianData,
  DosenPerwalianKrsData,
  DosenValidasiKrsPayload,
  DosenValidasiKrsData,
} from "@/features/dosen/types";

export async function getPerwalianDosen(
  semester: number = 1
): Promise<ApiResponse<DosenPerwalianData>> {
  try {
    const response = await api.get("/api/dosen/perwalian/jumlah", {
      params: { semester },
    });

    const result: DosenPerwalianData = {
      code_dosen: response.data.data.code_dosen,
      semester: response.data.data.semester,
      jumlah: response.data.data.jumlah,
      perwalian: response.data.data.perwalian,
    };

    return successResponse<DosenPerwalianData>(200, result);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

/**
 * Mengambil detail KRS mahasiswa perwalian
 * GET /api/dosen/perwalian/krs
 * Request: { code: string }
 */
export async function getDetailKrsPerwalian(
  code: string
): Promise<ApiResponse<DosenPerwalianKrsData>> {
  try {
    const response = await api.get("/api/dosen/perwalian/krs", {
      params: { code },
      data: { code },
    });

    return successResponse<DosenPerwalianKrsData>(
      200,
      response.data.data,
      response.data?.message
    );
  } catch (error) {
    let errorMessage = "Gagal mengambil detail KRS mahasiswa.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

/**
 * Melakukan validasi KRS mahasiswa perwalian
 * POST /api/dosen/perwalian/validasi
 * Headers: Cookie: laravel-session, Content-Type: application/json
 * Body: { code_mahasiswa: string, status_krs: "A" | "N", catatan?: string | null }
 */
export async function validasiKrsMahasiswa(
  payload: DosenValidasiKrsPayload
): Promise<ApiResponse<DosenValidasiKrsData>> {
  try {
    const response = await api.post("/api/dosen/perwalian/validasi", payload);

    return successResponse<DosenValidasiKrsData>(
      200,
      response.data.data,
      response.data?.message || "Validasi KRS berhasil disimpan."
    );
  } catch (error) {
    let errorMessage = "Gagal memvalidasi KRS mahasiswa.";
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


