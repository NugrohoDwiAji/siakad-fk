import axios from "axios";
import api from "@/lib/api/axios";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import type { SemesterOption } from "@/features/mahasiswa/api/semester";

interface SemesterData {
  semester: SemesterOption[];
}

export async function getSemesterListStaff() {
  try {
    const response = await api.get("/api/staff/semester");
    const data: SemesterData = response.data.data;
    return successResponse<SemesterData>(200, data);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}
