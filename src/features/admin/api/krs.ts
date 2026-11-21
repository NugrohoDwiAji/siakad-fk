import axios from "axios";
import api from "@/lib/api/axios";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import type {
  SksRuleItem,
  SksRuleListResult,
  CreateSksRuleRequest,
  UpdateSksRuleRequest,
  StaffKrsMahasiswaItem,
  StaffKrsDetailData,
} from "@/features/admin/types";

export async function getSksRule(codeProgramStudi?: string, perPage?: number) {
  try {
    const params: Record<string, string | number> = {};
    if (codeProgramStudi) params.code_program_studi = codeProgramStudi;
    if (perPage) params.per_page = perPage;

    const response = await api.get("/api/staff/sks-rule", { params });

    const result: SksRuleListResult = {
      data: response.data.data,
      jumlah: response.data.jumlah,
      pagination: response.data.pagination,
    };

    return successResponse<SksRuleListResult>(200, result);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

export async function getSksRuleDetail(code: string) {
  try {
    const response = await api.get("/api/staff/sks-rule/show", {
      params: { code },
    });
    return successResponse<SksRuleItem>(200, response.data.data);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

export async function createSksRule(payload: CreateSksRuleRequest) {
  try {
    const response = await api.post("/api/staff/sks-rule", payload);
    return successResponse<SksRuleItem>(200, response.data.data, response.data.message);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

export async function updateSksRule(payload: UpdateSksRuleRequest) {
  try {
    const response = await api.put("/api/staff/sks-rule/update", payload);
    return successResponse<SksRuleItem>(200, response.data.data, response.data.message);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

export async function deleteSksRule(code: string) {
  try {
    const response = await api.delete(`/api/staff/sks-rule/${code}`);
    return successResponse<null>(200, null, response.data.message);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

/**
 * Mengambil daftar KRS mahasiswa berdasarkan code_mahasiswa (encrypted NIM)
 * GET /api/staff/akademik/krs
 */
export async function getStaffMahasiswaKrs(code: string) {
  try {
    const response = await api.get("/api/staff/akademik/krs", {
      params: { code },
      data: { code },
    });
    return successResponse<StaffKrsMahasiswaItem[]>(
      200,
      response.data.data || [],
      response.data.message
    );
  } catch (error) {
    let errorMessage = "Gagal mengambil data KRS mahasiswa.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

/**
 * Mengambil detail KRS mahasiswa berdasarkan code_krs
 * GET /api/staff/akademik/krs-detail
 */
export async function getStaffKrsDetail(codeKrs: string) {
  try {
    const response = await api.get("/api/staff/akademik/krs-detail", {
      params: { code_krs: codeKrs },
      data: { code_krs: codeKrs },
    });
    return successResponse<StaffKrsDetailData>(
      200,
      response.data.data,
      response.data.message
    );
  } catch (error) {
    let errorMessage = "Gagal mengambil detail KRS.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}
