import axios from "axios";
import api from "@/lib/api/axios";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import type { ApiResponse } from "@/lib/apiResponse";
import type { StaffPembayaranResponseData, StaffPembayaranItem } from "@/features/admin/types";

/**
 * Mengambil daftar data pembayaran mahasiswa langsung dari server
 * Endpoint: GET /api/staff/pembayaran (tanpa parameter)
 */
export async function getStaffPembayaran(): Promise<ApiResponse<StaffPembayaranResponseData>> {
  try {
    const response = await api.get("/api/staff/pembayaran", {
      headers: {
        Accept: "application/json",
      },
    });

    const resData = response.data;

    if (resData && (resData.status !== undefined || resData.data !== undefined)) {
      const items = Array.isArray(resData.data)
        ? resData.data
        : Array.isArray(resData)
        ? resData
        : [];

      const resultData: StaffPembayaranResponseData = {
        jumlah: resData.jumlah ?? items.length,
        data: items,
        pagination: resData.pagination,
      };

      return successResponse<StaffPembayaranResponseData>(
        response.status || 200,
        resultData,
        resData.message || "Data pembayaran berhasil diambil."
      );
    }

    return errorResponse(
      response.status || 400,
      resData?.message || "Gagal mengambil data pembayaran."
    );
  } catch (error) {
    let errorMessage = "Gagal mengambil data pembayaran dari server.";
    let statusCode = 500;
    let validationErrors: Record<string, string[]> | null = null;

    if (axios.isAxiosError(error)) {
      if (error.response) {
        statusCode = error.response.status;
        errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          error.message ||
          errorMessage;
        validationErrors = error.response.data?.errors || null;
      } else if (error.request) {
        errorMessage = "Tidak dapat terhubung ke server backend (Network/CORS Error). Pastikan server aktif.";
      } else {
        errorMessage = error.message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return errorResponse(statusCode, errorMessage, validationErrors);
  }
}

/**
 * Mengambil detail pembayaran mahasiswa berdasarkan parameter code (encrypted)
 * Endpoint: GET /api/staff/pembayaran/show
 * Params: { code: string }
 */
export async function getStaffPembayaranDetail(
  code: string
): Promise<ApiResponse<StaffPembayaranItem>> {
  try {
    const response = await api.get("/api/staff/pembayaran/show", {
      params: { code },
      headers: {
        Accept: "application/json",
      },
    });

    const resData = response.data;

    if (resData && (resData.status !== undefined || resData.data !== undefined)) {
      const detailItem: StaffPembayaranItem = resData.data || resData;
      return successResponse<StaffPembayaranItem>(
        response.status || 200,
        detailItem,
        resData.message || "Detail pembayaran berhasil diambil."
      );
    }

    return errorResponse(
      response.status || 400,
      resData?.message || "Gagal mengambil detail pembayaran."
    );
  } catch (error) {
    let errorMessage = "Gagal mengambil detail pembayaran dari server.";
    let statusCode = 500;
    let validationErrors: Record<string, string[]> | null = null;

    if (axios.isAxiosError(error)) {
      if (error.response) {
        statusCode = error.response.status;
        errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          error.message ||
          errorMessage;
        validationErrors = error.response.data?.errors || null;
      } else if (error.request) {
        errorMessage = "Tidak dapat terhubung ke server backend (Network/CORS Error). Pastikan server aktif.";
      } else {
        errorMessage = error.message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return errorResponse(statusCode, errorMessage, validationErrors);
  }
}
