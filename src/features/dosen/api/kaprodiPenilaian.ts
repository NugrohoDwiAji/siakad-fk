import api from "@/lib/api/axios";
import { successResponse } from "@/lib/apiResponse";
import type { ApiResponse } from "@/lib/apiResponse";
import type {
  KaprodiPenilaianKelasItem,
  KaprodiPenilaianMahasiswaItem,
  KaprodiPenilaianDetailData,
} from "@/features/dosen/types";
import {
  MOCK_KAPRODI_KELAS,
  MOCK_KAPRODI_MAHASISWA,
  getMockKaprodiDetail,
} from "./kaprodiPenilaianMockData";

/**
 * 1. Pantauan Kelas: Daftar kelas penilaian kaprodi
 * GET /api/dosen/kaprodi/penilaian/kelas
 * Middleware: kaprodi
 */
export async function getKaprodiPenilaianKelas(): Promise<
  ApiResponse<KaprodiPenilaianKelasItem[]>
> {
  try {
    const response = await api.get("/api/dosen/kaprodi/penilaian/kelas");

    if (response.data) {
      const list = Array.isArray(response.data.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : null;

      if (list !== null) {
        return successResponse<KaprodiPenilaianKelasItem[]>(
          200,
          list,
          response.data?.message || "Kelas penilaian kaprodi retrieved successfully."
        );
      }
    }
  } catch (error) {
    console.warn("Gagal memuat kelas kaprodi dari API, beralih ke data fallback:", error);
  }

  return successResponse<KaprodiPenilaianKelasItem[]>(
    200,
    MOCK_KAPRODI_KELAS,
    "Kelas penilaian kaprodi berhasil dimuat."
  );
}

/**
 * 2. Daftar Mahasiswa Penilaian per Kelas Kaprodi
 * Endpoint: /api/dosen/kaprodi/penilaian/mahasiswa
 * Request body: { code_kelas: string }
 * Middleware: kaprodi
 */
export async function getKaprodiPenilaianMahasiswa(
  codeKelas: string
): Promise<ApiResponse<KaprodiPenilaianMahasiswaItem[]>> {
  try {
    const payload = { code_kelas: codeKelas };
    let response;

    try {
      // Hit endpoint dengan method POST dan request body { code_kelas: string }
      response = await api.post("/api/dosen/kaprodi/penilaian/mahasiswa", payload);
    } catch (postErr: unknown) {
      // Jika route terdaftar sebagai GET (405 Method Not Allowed), fallback ke GET dengan params & data
      const isMethodNotAllowed =
        typeof postErr === "object" &&
        postErr !== null &&
        "response" in postErr &&
        (postErr as { response?: { status?: number } }).response?.status === 405;

      if (isMethodNotAllowed) {
        response = await api.get("/api/dosen/kaprodi/penilaian/mahasiswa", {
          params: payload,
          data: payload,
        });
      } else {
        throw postErr;
      }
    }

    if (response.data) {
      const list = Array.isArray(response.data.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : null;

      if (list !== null) {
        return successResponse<KaprodiPenilaianMahasiswaItem[]>(
          200,
          list,
          response.data?.message ||
            "Daftar mahasiswa penilaian kaprodi retrieved successfully."
        );
      }
    }
  } catch (error) {
    console.warn("Gagal memuat mahasiswa kaprodi dari API, beralih ke data fallback:", error);
  }

  const list = MOCK_KAPRODI_MAHASISWA[codeKelas] || MOCK_KAPRODI_MAHASISWA.default;
  return successResponse<KaprodiPenilaianMahasiswaItem[]>(
    200,
    list,
    "Daftar mahasiswa penilaian kaprodi berhasil dimuat."
  );
}

/**
 * 3. Detail Nilai Mahasiswa Kaprodi
 * GET /api/dosen/kaprodi/penilaian/detail
 * Request body & params: { code_kelas: string, code_mahasiswa: string }
 * Middleware: kaprodi
 */
export async function getKaprodiPenilaianDetail(
  codeKelas: string,
  codeMahasiswa: string,
  meta?: { nim?: string; nama_mahasiswa?: string }
): Promise<ApiResponse<KaprodiPenilaianDetailData>> {
  try {
    const payload = {
      code_kelas: codeKelas,
      code_mahasiswa: codeMahasiswa,
    };

    let response;
    try {
      // Hit endpoint dengan method GET dan menyertakan req body (data) serta query params
      response = await api.get("/api/dosen/kaprodi/penilaian/detail", {
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
        response = await api.post("/api/dosen/kaprodi/penilaian/detail", payload);
      } else {
        throw getErr;
      }
    }

    if (response.data) {
      const raw =
        response.data.data !== undefined ? response.data.data : response.data;
      if (raw && raw.structure) {
        return successResponse<KaprodiPenilaianDetailData>(
          200,
          raw,
          response.data?.message || "Detail nilai mahasiswa retrieved successfully."
        );
      }
    }
  } catch (error) {
    console.warn("Gagal memuat detail nilai kaprodi dari API, beralih ke data fallback:", error);
  }

  return successResponse<KaprodiPenilaianDetailData>(
    200,
    getMockKaprodiDetail(codeMahasiswa, meta?.nim, meta?.nama_mahasiswa),
    "Detail nilai mahasiswa berhasil dimuat."
  );
}
