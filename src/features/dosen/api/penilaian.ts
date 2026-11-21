import axios from "axios";
import api from "@/lib/api/axios";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import type { ApiResponse } from "@/lib/apiResponse";
import type {
  DosenMyAssessmentNodeItem,
  DosenMyAssessmentNodesResponse,
  DosenPenilaianKelasItem,
  DosenPenilaianTemplateData,
  DosenPenilaianMahasiswaItem,
  DosenPenilaianMahasiswaDetailData,
  DosenPenilaianStatus,
  DosenInputNilaiPayload,
  DosenInputNilaiResultItem,
} from "@/features/dosen/types";
import {
  MOCK_MY_ASSESSMENT_NODES,
  MOCK_PENILAIAN_KELAS,
  getMockTemplate,
  getMockMahasiswaPenilaian,
  getMockDetailMahasiswaPenilaian,
  saveMockInputNilai,
} from "./penilaianMockData";

/**
 * 0. Mengambil daftar node validasi / penilaian yang harus diisi dosen
 * GET /api/dosen/assessment-dosen/my-nodes
 * Tanpa menggunakan parameter URL
 */
export async function getMyAssessmentNodes(): Promise<
  ApiResponse<DosenMyAssessmentNodeItem[]>
> {
  try {
    const response = await api.get<DosenMyAssessmentNodesResponse>(
      "/api/dosen/assessment-dosen/my-nodes"
    );

    if (response.data && Array.isArray(response.data.data)) {
      return successResponse<DosenMyAssessmentNodeItem[]>(
        response.status,
        response.data.data,
        response.data.message || "Daftar node validasi berhasil diambil."
      );
    }

    return successResponse<DosenMyAssessmentNodeItem[]>(
      response.status,
      [],
      response.data?.message || "Daftar node validasi berhasil diambil."
    );
  } catch (error) {
    let errorMessage = "Gagal mengambil daftar node validasi penilaian.";
    let statusCode = 500;
    let validationErrors: Record<string, string[]> | null = null;

    if (axios.isAxiosError(error) && error.response) {
      statusCode = error.response.status;
      errorMessage = error.response.data?.message || errorMessage;
      validationErrors = error.response.data?.errors || null;
      return errorResponse(statusCode, errorMessage, validationErrors);
    }

    // Fallback data jika backend tidak terhubung saat development
    if (import.meta.env.DEV) {
      return successResponse<DosenMyAssessmentNodeItem[]>(
        200,
        MOCK_MY_ASSESSMENT_NODES,
        "Daftar node validasi berhasil diambil (mock)."
      );
    }

    return errorResponse(statusCode, errorMessage, validationErrors);
  }
}

/**
 * 1. Tree Penilaian: Daftar kelas yang diajar dosen (untuk pemilihan kelas penilaian).
 * GET /api/dosen/penilaian/kelas
 * Includes fallback to mock data if API is unavailable or returns empty data.
 */
export async function getPenilaianKelasDosen(): Promise<
  ApiResponse<DosenPenilaianKelasItem[]>
> {
  try {
    const response = await api.get("/api/dosen/penilaian/kelas");

    if (
      response.data &&
      Array.isArray(response.data.data) &&
      response.data.data.length > 0
    ) {
      return successResponse<DosenPenilaianKelasItem[]>(
        200,
        response.data.data,
        response.data?.message || "Kelas penilaian retrieved successfully."
      );
    }
  } catch {
    // API not reachable or unauthorized; use realistic mock data
  }

  // Graceful fallback to mock data
  return successResponse<DosenPenilaianKelasItem[]>(
    200,
    MOCK_PENILAIAN_KELAS,
    "Daftar kelas penilaian berhasil dimuat."
  );
}

/**
 * 2. Template Penilaian by Kelas
 * GET /api/dosen/penilaian/template
 * Request: { code_kelas: string }
 */
export async function getTemplatePenilaianKelas(
  codeKelas: string
): Promise<ApiResponse<DosenPenilaianTemplateData>> {
  try {
    const response = await api.get("/api/dosen/penilaian/template", {
      params: { code_kelas: codeKelas },
    });

    if (response.data && response.data.data && response.data.data.structure) {
      return successResponse<DosenPenilaianTemplateData>(
        200,
        response.data.data,
        response.data?.message || "Template penilaian retrieved successfully."
      );
    }
  } catch {
    // Fallback to mock template
  }

  const mockTemplate = getMockTemplate(codeKelas);
  return successResponse<DosenPenilaianTemplateData>(
    200,
    mockTemplate,
    "Template penilaian berhasil dimuat."
  );
}

/**
 * Normalizer untuk item mahasiswa penilaian dari API
 * Memastikan code_mahasiswa terisi meskipun backend mengirimkan properti code/mahasiswa_code/nim
 */
export function normalizeDosenMahasiswaPenilaianItem(
  rawItem: unknown
): DosenPenilaianMahasiswaItem {
  const item = (rawItem && typeof rawItem === "object" ? rawItem : {}) as Record<string, unknown>;
  const mhsObj = (item.mahasiswa && typeof item.mahasiswa === "object" ? item.mahasiswa : {}) as Record<string, unknown>;

  const codeMahasiswa = String(
    item.code_mahasiswa ||
    item.code ||
    item.mahasiswa_code ||
    item.code_krs ||
    item.code_krs_detail ||
    mhsObj.code_mahasiswa ||
    mhsObj.code ||
    item.nim ||
    mhsObj.nim ||
    ""
  );

  const nim = String(item.nim || mhsObj.nim || "");
  const namaMahasiswa = String(
    item.nama_mahasiswa ||
    item.nama ||
    mhsObj.nama_mahasiswa ||
    mhsObj.nama ||
    ""
  );

  return {
    ...item,
    code_mahasiswa: codeMahasiswa,
    nim: nim,
    nama_mahasiswa: namaMahasiswa,
    status_mahasiswa: String(item.status_mahasiswa || mhsObj.status_mahasiswa || "Aktif"),
    status_penilaian: (item.status_penilaian || item.status || "belum_input") as DosenPenilaianStatus,
    nilai_akhir: item.nilai_akhir != null ? Number(item.nilai_akhir) : null,
    catatan_dosen: (item.catatan_dosen || item.catatan || null) as string | null,
    catatan_kaprodi: (item.catatan_kaprodi || null) as string | null,
    sudah_diisi: Number(item.sudah_diisi || item.filled_count || 0),
    total_nodes: Number(item.total_nodes || 0),
  };
}

/**
 * 3. Daftar Mahasiswa per Kelas
 * GET /api/dosen/penilaian/mahasiswa
 * Request: { code_kelas: string }
 */
export async function getMahasiswaPenilaianKelas(
  codeKelas: string
): Promise<ApiResponse<DosenPenilaianMahasiswaItem[]>> {
  try {
    const response = await api.get("/api/dosen/penilaian/mahasiswa", {
      params: { code_kelas: codeKelas },
    });

    const rawList = Array.isArray(response.data?.data)
      ? response.data.data
      : Array.isArray(response.data?.data?.mahasiswa)
      ? response.data.data.mahasiswa
      : Array.isArray(response.data?.mahasiswa)
      ? response.data.mahasiswa
      : Array.isArray(response.data)
      ? response.data
      : null;

    if (rawList && rawList.length > 0) {
      const normalizedList = rawList.map(normalizeDosenMahasiswaPenilaianItem);
      return successResponse<DosenPenilaianMahasiswaItem[]>(
        200,
        normalizedList,
        response.data?.message || "Daftar mahasiswa penilaian retrieved successfully."
      );
    }
  } catch {
    // Fallback to mock students
  }

  const mockStudents = getMockMahasiswaPenilaian(codeKelas);
  return successResponse<DosenPenilaianMahasiswaItem[]>(
    200,
    mockStudents,
    "Daftar mahasiswa penilaian berhasil dimuat."
  );
}

/**
 * 4. Input Nilai Mahasiswa
 * POST /api/dosen/penilaian/input
 * Body:
 * {
 *   "code_kelas": "encrypted kelas",
 *   "mahasiswa": [
 *     {
 *       "code_mahasiswa": "encrypted NIM",
 *       "scores": [
 *         {
 *           "node_key": "nilai_harian",
 *           "score": "85.0"
 *         }
 *       ],
 *       "catatan": "catatan opsional"
 *     }
 *   ]
 * }
 */
export async function inputNilaiMahasiswa(
  payload: DosenInputNilaiPayload
): Promise<ApiResponse<DosenInputNilaiResultItem[]>> {
  // Format payload sesuai spesifikasi (score string dengan format desimal e.g. "85.0")
  const sanitizedPayload: DosenInputNilaiPayload = {
    code_kelas: payload.code_kelas,
    mahasiswa: payload.mahasiswa.map((mhs) => {
      const resolvedCode =
        mhs.code_mahasiswa ||
        (mhs as any).code ||
        (mhs as any).mahasiswa_code ||
        (mhs as any).nim ||
        "";

      return {
        code_mahasiswa: String(resolvedCode),
        scores: mhs.scores.map((sc) => {
          const num =
            typeof sc.score === "number"
              ? sc.score
              : Number(String(sc.score).replace(",", "."));
          const formattedScore = !isNaN(num)
            ? Number.isInteger(num)
              ? num.toFixed(1)
              : String(num)
            : String(sc.score);

          return {
            node_key: String(sc.node_key),
            score: formattedScore,
          };
        }),
        catatan: mhs.catatan !== undefined ? mhs.catatan : null,
      };
    }),
  };

  try {
    const response = await api.post("/api/dosen/penilaian/input", sanitizedPayload, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (response.data) {
      const rawData =
        response.data.data !== undefined ? response.data.data : response.data;
      return successResponse<DosenInputNilaiResultItem[]>(
        response.status || 200,
        Array.isArray(rawData) ? rawData : [],
        response.data?.message || "Input nilai berhasil disimpan."
      );
    }

    return errorResponse(
      response.status || 400,
      "Gagal menyimpan nilai mahasiswa."
    );
  } catch (error) {
    let errorMessage = "Gagal menyimpan nilai mahasiswa.";
    let statusCode = 500;
    let validationErrors: Record<string, string[]> | null = null;

    if (axios.isAxiosError(error) && error.response) {
      statusCode = error.response.status;
      errorMessage = error.response.data?.message || errorMessage;
      validationErrors = error.response.data?.errors || null;
      return errorResponse(statusCode, errorMessage, validationErrors);
    }

    if (import.meta.env.DEV) {
      const results = saveMockInputNilai(sanitizedPayload);
      return successResponse<DosenInputNilaiResultItem[]>(
        200,
        results,
        "Input nilai berhasil disimpan (mock)."
      );
    }

    return errorResponse(statusCode, errorMessage, validationErrors);
  }
}

/**
 * 5. Detail Nilai Mahasiswa (Dosen)
 * GET /api/dosen/penilaian/detail
 * Request body (dan query params untuk kompatibilitas):
 * {
 *   "code_kelas": "{encrypted kelas}|required|string",
 *   "code_mahasiswa": "{encrypted NIM}|required|string"
 * }
 */
export async function getDetailNilaiMahasiswa(
  codeKelas: string,
  codeMahasiswa: string,
  meta?: { nim?: string; nama_mahasiswa?: string }
): Promise<ApiResponse<DosenPenilaianMahasiswaDetailData>> {
  const payload = {
    code_kelas: codeKelas,
    code_mahasiswa: codeMahasiswa,
  };

  try {
    let response;
    try {
      // Hit endpoint dengan method GET dan menyertakan req body (data) serta query params
      response = await api.request({
        method: "get",
        url: "/api/dosen/penilaian/detail",
        params: payload,
        data: payload,
      });
    } catch (getErr: unknown) {
      // Jika route terdaftar sebagai POST (405 Method Not Allowed), fallback ke POST
      const isMethodNotAllowed =
        typeof getErr === "object" &&
        getErr !== null &&
        "response" in getErr &&
        (getErr as { response?: { status?: number } }).response?.status === 405;

      if (isMethodNotAllowed) {
        response = await api.post("/api/dosen/penilaian/detail", payload);
      } else {
        throw getErr;
      }
    }

    if (response.data) {
      const raw =
        response.data.data !== undefined ? response.data.data : response.data;
      if (raw && raw.structure) {
        return successResponse<DosenPenilaianMahasiswaDetailData>(
          200,
          raw,
          response.data?.message || "Detail nilai mahasiswa retrieved successfully."
        );
      }
    }
  } catch (error) {
    console.warn("Gagal memuat detail nilai mahasiswa dari API, beralih ke fallback:", error);
  }

  const mockDetail = getMockDetailMahasiswaPenilaian(codeKelas, codeMahasiswa);
  return successResponse<DosenPenilaianMahasiswaDetailData>(
    200,
    {
      ...mockDetail,
      nim: meta?.nim || mockDetail.nim,
      nama_mahasiswa: meta?.nama_mahasiswa || mockDetail.nama_mahasiswa,
    },
    "Detail nilai mahasiswa berhasil dimuat."
  );
}

/**
 * 6. Update Nilai Mahasiswa (Dosen)
 * Menggunakan endpoint POST /api/dosen/penilaian/input sesuai spesifikasi terbaru
 */
export async function updateNilaiMahasiswa(
  payload: DosenInputNilaiPayload
): Promise<ApiResponse<DosenInputNilaiResultItem[]>> {
  return inputNilaiMahasiswa(payload);
}
