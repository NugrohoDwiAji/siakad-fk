import axios from "axios";
import api from "@/lib/api/axios";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import type { KrsApiResponse, KrsEditResponse, KrsDetailRequest, KrsDetailResponseData, KrsUpdateRequest, KrsUpdateResponseData } from "@/features/mahasiswa/types";

export async function getKrs(semester?: number | null) {
  try {
    const params = semester ? { semester } : {};
    const response = await api.get("/api/mhs/krs", { params });
    return successResponse<KrsApiResponse>(200, response.data.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return errorResponse(404, "Silahkan selesaikan pembayaran terlebih dahulu.");
    }
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

export async function getKrsEdit(semester: number) {
  try {
    const response = await api.get("/api/mhs/krs/update", { params: { semester } });
    return successResponse<KrsEditResponse>(200, response.data.data);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

export async function createKrsDetail(payload: KrsDetailRequest) {
  try {
    const response = await api.post("/api/mhs/krs/detail", payload);
    return successResponse<KrsDetailResponseData>(200, response.data.data, response.data.message);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

export async function updateKrs(payload: KrsUpdateRequest) {
  try {
    const response = await api.put("/api/mhs/krs/update", payload);
    return successResponse<KrsUpdateResponseData>(200, response.data.data);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}
