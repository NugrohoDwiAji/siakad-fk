import axios from "axios";
import api from "@/lib/api/axios";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export async function getKhs(semester?: number) {
  try {
    const params = semester ? { semester } : undefined;
    const response = await api.get("/api/mhs/khs", { params });
    return successResponse(200, response.data.data);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}
