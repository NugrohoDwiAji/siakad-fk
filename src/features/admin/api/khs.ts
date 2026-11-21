import axios from "axios";
import api from "@/lib/api/axios";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import type {
  StaffKhsMahasiswaItem,
  StaffKhsDetailData,
} from "@/features/admin/types";

/**
 * Mengambil daftar KHS mahasiswa berdasarkan code_mahasiswa (encrypted NIM)
 * GET /api/staff/akademik/khs
 */
export async function getStaffMahasiswaKhs(code: string) {
  try {
    const response = await api.get("/api/staff/akademik/khs", {
      params: { code },
      data: { code },
    });
    return successResponse<StaffKhsMahasiswaItem[]>(
      200,
      response.data.data || [],
      response.data.message
    );
  } catch (error) {
    let errorMessage = "Gagal mengambil data KHS mahasiswa.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

/**
 * Mengambil detail KHS mahasiswa berdasarkan code_krs
 * GET /api/staff/akademik/khs-detail
 */
export async function getStaffKhsDetail(codeKrs: string) {
  try {
    const response = await api.get("/api/staff/akademik/khs-detail", {
      params: { code_krs: codeKrs },
      data: { code_krs: codeKrs },
    });
    return successResponse<StaffKhsDetailData>(
      200,
      response.data.data,
      response.data.message
    );
  } catch (error) {
    let errorMessage = "Gagal mengambil detail KHS.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}
