import axios from "axios";
import api from "@/lib/api/axios";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import type { ApiResponse } from "@/lib/apiResponse";
import type {
  DosenKurikulumMahasiswaData,
  DosenKelasItem,
  DosenKelasPagination,
  DosenKelasDetailData,
} from "@/features/dosen/types";

export interface DosenKelasListResult {
  items: DosenKelasItem[];
  pagination?: DosenKelasPagination;
}

/**
 * Mengambil kurikulum mahasiswa berdasarkan code_mahasiswa
 * GET /api/dosen/kurikulum
 */
export async function getKurikulumMahasiswa(
  codeMahasiswa: string
): Promise<ApiResponse<DosenKurikulumMahasiswaData>> {
  try {
    const response = await api.get("/api/dosen/kurikulum", {
      params: { code_mahasiswa: codeMahasiswa },
      data: { code_mahasiswa: codeMahasiswa },
    });

    return successResponse<DosenKurikulumMahasiswaData>(
      200,
      response.data.data,
      response.data?.message
    );
  } catch (error) {
    let errorMessage = "Gagal mengambil data kurikulum mahasiswa.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

/**
 * Mengambil daftar kelas mengajar dosen
 * GET /api/dosen/kurikulum/kelas
 */
export async function getDaftarKelasDosen(
  page: number = 1
): Promise<ApiResponse<DosenKelasListResult>> {
  try {
    const response = await api.get("/api/dosen/kurikulum/kelas", {
      params: { page },
    });

    const result: DosenKelasListResult = {
      items: response.data.data || [],
      pagination: response.data.pagination,
    };

    return successResponse<DosenKelasListResult>(
      200,
      result,
      response.data?.message
    );
  } catch (error) {
    let errorMessage = "Gagal mengambil daftar kelas dosen.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

/**
 * Mengambil detail kelas dan daftar mahasiswa di dalamnya
 * GET /api/dosen/kurikulum/detail
 */
export async function getDetailKelasDosen(
  codeKelas: string
): Promise<ApiResponse<DosenKelasDetailData>> {
  try {
    const response = await api.get("/api/dosen/kurikulum/detail", {
      params: { code: codeKelas },
      data: { code: codeKelas },
    });

    return successResponse<DosenKelasDetailData>(
      200,
      response.data.data,
      response.data?.message
    );
  } catch (error) {
    let errorMessage = "Gagal mengambil detail kelas.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}
