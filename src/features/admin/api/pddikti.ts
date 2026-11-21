import axios from "axios";
import api from "@/lib/api/axios";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import type { ApiResponse } from "@/lib/apiResponse";
import type {
  FeederStatusData,
  StaffKelasItem,
  FeederPullKelasData,
} from "@/features/admin/types";
import { normalizeStaffKelasItem } from "@/features/admin/api/kelas";

/**
 * Memeriksa status koneksi ke PDDIKTI Feeder
 * GET /api/staff/feeder/status
 * Req body: tidak ada
 */
export async function getFeederStatus(): Promise<ApiResponse<FeederStatusData>> {
  try {
    const response = await api.get("/api/staff/feeder/status");
    const raw = response.data;
    const isSuccess = raw?.status ?? true;
    const dataObj = (raw?.data && typeof raw.data === "object" ? raw.data : {}) as Record<string, unknown>;

    const feederData: FeederStatusData = {
      connected: Boolean(dataObj.connected),
      token_valid_until: dataObj.token_valid_until ? String(dataObj.token_valid_until) : null,
    };

    const message =
      raw?.message ||
      (feederData.connected ? "Koneksi ke Feeder aktif." : "Koneksi ke Feeder tidak aktif.");

    if (!isSuccess) {
      return errorResponse(400, message);
    }

    return successResponse<FeederStatusData>(200, feederData, message);
  } catch (error) {
    let errorMessage = "Gagal memeriksa status koneksi Feeder PDDIKTI.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

/**
 * Mengambil daftar kelas untuk audit PDDIKTI
 * GET /api/staff/kelas
 * Req body: tidak ada
 */
export async function getAuditKelasList(): Promise<ApiResponse<StaffKelasItem[]>> {
  try {
    const response = await api.get("/api/staff/kelas");
    const raw = response.data;
    let listRaw: unknown[] = [];

    if (Array.isArray(raw)) {
      listRaw = raw;
    } else if (raw && typeof raw === "object") {
      const obj = raw as Record<string, unknown>;
      if (Array.isArray(obj.data)) {
        listRaw = obj.data;
      } else if (obj.data && typeof obj.data === "object") {
        const nested = obj.data as Record<string, unknown>;
        if (Array.isArray(nested.data)) {
          listRaw = nested.data;
        } else if (Array.isArray(nested.kelas)) {
          listRaw = nested.kelas;
        }
      } else if (Array.isArray(obj.kelas)) {
        listRaw = obj.kelas;
      }
    }

    const normalizedList: StaffKelasItem[] = listRaw.map(normalizeStaffKelasItem);

    return successResponse<StaffKelasItem[]>(
      200,
      normalizedList,
      raw?.message || "Daftar kelas berhasil diambil."
    );
  } catch (error) {
    let errorMessage = "Gagal mengambil daftar kelas untuk audit PDDIKTI.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

/**
 * Menarik data nilai/kelas dari Feeder
 * GET /api/staff/feeder/pull/kelas
 * Req body: { "code": "code_kelas" }
 */
export async function pullFeederKelas(
  codeKelas: string
): Promise<ApiResponse<FeederPullKelasData>> {
  try {
    const response = await api.get("/api/staff/feeder/pull/kelas", {
      data: { code: codeKelas },
      params: { code: codeKelas },
    });

    const raw = response.data;
    const isSuccess = raw?.status ?? true;
    const dataObj = (raw?.data && typeof raw.data === "object" ? raw.data : {}) as Record<string, unknown>;

    const pullData: FeederPullKelasData = {
      code_kelas: String(dataObj.code_kelas || codeKelas),
      source: String(dataObj.source || "feeder_live"),
      pulled_at: String(dataObj.pulled_at || new Date().toISOString()),
      total_rows: Number(
        dataObj.total_rows ?? (Array.isArray(dataObj.data) ? dataObj.data.length : 0)
      ),
      data: Array.isArray(dataObj.data) ? (dataObj.data as Record<string, unknown>[]) : [],
    };

    const message =
      raw?.message || "Data nilai kelas berhasil ditarik dari Feeder dan disimpan di cache.";

    if (!isSuccess) {
      return errorResponse(400, message);
    }

    return successResponse<FeederPullKelasData>(200, pullData, message);
  } catch (error) {
    let errorMessage = "Gagal menarik data kelas dari Feeder PDDIKTI.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

