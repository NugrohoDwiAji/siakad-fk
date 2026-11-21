import axios from "axios";
import api from "@/lib/api/axios";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import type {
  PerwalianItem,
  PerwalianListResult,
  CreatePerwalianRequest,
  UpdatePerwalianRequest,
} from "@/features/admin/types";

export async function getPerwalianList(code?: string, codeDosen?: string, perPage?: number) {
  try {
    const params: Record<string, string | number> = {};
    if (code) params.code = code;
    if (codeDosen) params.code_dosen = codeDosen;
    if (perPage) params.per_page = perPage;

    const response = await api.get("/api/staff/akademik/perwalian", { params });

    const result: PerwalianListResult = {
      data: response.data.data,
      jumlah: response.data.jumlah,
      pagination: response.data.pagination,
    };

    return successResponse<PerwalianListResult>(200, result);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

export async function getPerwalianByDosen(code?: string, nama?: string) {
  try {
    const params: Record<string, string> = {};
    if (code) params.code = code;
    if (nama) params.nama = nama;

    const response = await api.get("/api/staff/akademik/perwalian/dosen", { params });

    const result: PerwalianListResult = {
      data: response.data.data,
      jumlah: response.data.jumlah,
      pagination: response.data.pagination,
    };

    return successResponse<PerwalianListResult>(200, result);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

export async function getPerwalianByMahasiswa(code?: string, nama?: string) {
  try {
    const params: Record<string, string> = {};
    if (code) params.code = code;
    if (nama) params.nama = nama;

    const response = await api.get("/api/staff/akademik/perwalian/mahasiswa", { params });

    const result: PerwalianListResult = {
      data: response.data.data,
      jumlah: response.data.jumlah,
      pagination: response.data.pagination,
    };

    return successResponse<PerwalianListResult>(200, result);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

export async function createPerwalian(payload: CreatePerwalianRequest) {
  try {
    const response = await api.post("/api/staff/akademik/perwalian", payload);
    return successResponse<PerwalianItem>(200, response.data.data, response.data.message);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

export async function updatePerwalian(code: string, payload: UpdatePerwalianRequest) {
  try {
    const response = await api.put(`/api/staff/akademik/perwalian/${code}`, payload);
    return successResponse<PerwalianItem>(200, response.data.data, response.data.message);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

export async function deletePerwalian(code: string) {
  try {
    const response = await api.delete(`/api/staff/akademik/perwalian/${code}`);
    return successResponse<null>(200, null, response.data.message);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}
