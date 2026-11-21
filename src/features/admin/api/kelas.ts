import axios from "axios";
import api from "@/lib/api/axios";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import type { ApiResponse } from "@/lib/apiResponse";
import type {
  StaffKelasListParams,
  StaffKelasItem,
  StaffKelasDetailData,
  StaffPenempatanItem,
  CreatePenempatanRequest,
  StaffKrsMahasiswaItem,
  StaffPenempatanBelumKelasItem,
  StaffPenempatanBelumKelasParams,
  StaffMahasiswaBelumKelasItem,
  StaffMahasiswaBelumKelasParams,
  CreateKelasRequest,
  CreateKelasResponseData,
  AddKelasDosenRequest,
  AddKelasDosenResponseData,
} from "@/features/admin/types";

/**
 * Helper to safely extract array data from any Laravel response structure
 * Supports direct array, { data: [...] }, { data: { data: [...] } }, { kelas: [...] }, etc.
 */
function extractArrayData<T>(raw: unknown, normalizer?: (item: unknown) => T): T[] {
  let list: unknown[] = [];
  if (Array.isArray(raw)) {
    list = raw;
  } else if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.data)) {
      list = obj.data;
    } else if (obj.data && typeof obj.data === "object") {
      const nested = obj.data as Record<string, unknown>;
      if (Array.isArray(nested.data)) {
        list = nested.data;
      } else if (Array.isArray(nested.kelas)) {
        list = nested.kelas;
      } else if (Array.isArray(nested.list)) {
        list = nested.list;
      }
    } else if (Array.isArray(obj.kelas)) {
      list = obj.kelas;
    } else if (Array.isArray(obj.list)) {
      list = obj.list;
    }
  }

  if (normalizer) {
    return list.map(normalizer);
  }
  return list as T[];
}

/**
 * Normalize raw server class item into typed StaffKelasItem
 */
export function normalizeStaffKelasItem(rawItem: unknown): StaffKelasItem {
  const item = (rawItem && typeof rawItem === "object" ? rawItem : {}) as Record<string, unknown>;
  const kelasId = Number(item.kelas_id || item.id || 0);
  const codeKelas = String(item.code_kelas || item.code || "");
  const namaKelas = String(item.nama_kelas || item.kelas || item.nama || "");
  const semester = String(item.semester || "");
  const kodeProgramStudi = item.kode_program_studi ? String(item.kode_program_studi) : undefined;
  const namaProgramStudi = item.nama_program_studi ? String(item.nama_program_studi) : undefined;
  const tahunAkademik = String(item.tahun_akademik || "");
  const codeMatakuliah = item.code_matakuliah ? String(item.code_matakuliah) : undefined;
  const kodeMatakuliah = String(item.kode_matakuliah || item.kode_mk || "");
  const namaMatakuliah = String(item.nama_matakuliah || item.nama_mk || "");
  const jumlahMahasiswa = Number(item.jumlah_mahasiswa ?? item.jumlah_peserta ?? item.peserta ?? 0);
  const jumlahDosen = item.jumlah_dosen !== undefined ? Number(item.jumlah_dosen) : undefined;

  const templateMatakuliah =
    item.template_matakuliah !== undefined
      ? Boolean(item.template_matakuliah)
      : false;
  const templateAssignments =
    item.template_assignments !== undefined
      ? Boolean(item.template_assignments)
      : item.template_assignment !== undefined
      ? Boolean(item.template_assignment)
      : false;
  const setupAssignments =
    item.setup_assignments !== undefined
      ? Boolean(item.setup_assignments)
      : item.setup_assignment !== undefined
      ? Boolean(item.setup_assignment)
      : false;

  return {
    code_kelas: codeKelas,
    kelas_id: kelasId,
    nama_kelas: namaKelas,
    semester,
    kode_program_studi: kodeProgramStudi,
    nama_program_studi: namaProgramStudi,
    tahun_akademik: tahunAkademik,
    code_matakuliah: codeMatakuliah,
    kode_matakuliah: kodeMatakuliah,
    nama_matakuliah: namaMatakuliah,
    jumlah_mahasiswa: jumlahMahasiswa,
    jumlah_dosen: jumlahDosen,
    template_matakuliah: templateMatakuliah,
    template_assignments: templateAssignments,
    setup_assignments: setupAssignments,
  };
}

/**
 * Mengambil daftar kelas perkuliahan
 * GET /api/staff/kelas
 */
export async function getStaffKelasList(
  params?: StaffKelasListParams
): Promise<ApiResponse<StaffKelasItem[]>> {
  try {
    const queryParams: Record<string, string | number> = {};
    if (params?.kode_tahun_akademik !== undefined && params?.kode_tahun_akademik !== null) {
      queryParams.kode_tahun_akademik = params.kode_tahun_akademik;
    }
    if (params?.kode_program_studi) {
      queryParams.kode_program_studi = params.kode_program_studi;
    }
    if (params?.semester !== undefined && params?.semester !== "") {
      queryParams.semester = params.semester;
    }
    if (params?.code_matakuliah) {
      queryParams.code_matakuliah = params.code_matakuliah;
    }
    if (params?.tahun_akademik) {
      queryParams.tahun_akademik = params.tahun_akademik;
    }
    if (params?.search) {
      queryParams.search = params.search;
    }

    const response = await api.get("/api/staff/kelas", {
      params: queryParams,
    });

    const list = extractArrayData<StaffKelasItem>(response.data, normalizeStaffKelasItem);

    return successResponse<StaffKelasItem[]>(
      200,
      list,
      response.data?.message || "Daftar kelas berhasil diambil."
    );
  } catch (error) {
    let errorMessage = "Gagal mengambil daftar kelas.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

/**
 * Alias getKelas untuk getStaffKelasList
 */
export const getKelas = getStaffKelasList;

/**
 * Membuat kelas perkuliahan baru
 * POST /api/staff/kelas
 */
export async function createStaffKelas(
  payload: CreateKelasRequest
): Promise<ApiResponse<CreateKelasResponseData>> {
  try {
    const body: Record<string, unknown> = {
      code_matakuliah: payload.code_matakuliah,
      nama_kelas: payload.nama_kelas,
    };
    if (payload.kode_tahun_akademik !== undefined && payload.kode_tahun_akademik !== null) {
      body.kode_tahun_akademik = payload.kode_tahun_akademik;
    }
    if (payload.semester) {
      body.semester = payload.semester;
    }
    if (payload.kode_program_studi) {
      body.kode_program_studi = payload.kode_program_studi;
    }

    const response = await api.post("/api/staff/kelas", body);

    return successResponse<CreateKelasResponseData>(
      201,
      response.data?.data,
      response.data?.message || "Kelas berhasil dibuat."
    );
  } catch (error) {
    let errorMessage = "Gagal membuat kelas perkuliahan.";
    let validationErrors: Record<string, string[]> | null = null;
    let statusCode = 500;

    if (axios.isAxiosError(error) && error.response) {
      statusCode = error.response.status;
      errorMessage = error.response.data?.message || errorMessage;
      validationErrors = error.response.data?.errors || null;
    }

    return errorResponse(statusCode, errorMessage, validationErrors);
  }
}

/**
 * Menghapus kelas perkuliahan
 * DELETE /api/staff/kelas
 */
export async function deleteStaffKelas(
  kelasId: number
): Promise<ApiResponse<null>> {
  try {
    const response = await api.delete("/api/staff/kelas", {
      data: { kelas_id: kelasId },
      params: { kelas_id: kelasId },
    });

    return successResponse<null>(
      200,
      null,
      response.data?.message || "Kelas berhasil dihapus."
    );
  } catch (error) {
    let errorMessage = "Gagal menghapus kelas.";
    let statusCode = 500;

    if (axios.isAxiosError(error) && error.response) {
      statusCode = error.response.status;
      errorMessage = error.response.data?.message || errorMessage;
    }

    return errorResponse(statusCode, errorMessage);
  }
}

/**
 * Mengambil detail kelas dan daftar mahasiswa di dalamnya
 * GET /api/staff/kelas/show
 */
export async function getStaffKelasDetail(
  kelasId: number
): Promise<ApiResponse<StaffKelasDetailData>> {
  try {
    const response = await api.get("/api/staff/kelas/show", {
      params: { kelas_id: kelasId },
      data: { kelas_id: kelasId },
    });

    console.log("Raw response data:", response.data);

    const raw = response.data?.data || response.data;
    const detailData: StaffKelasDetailData = {
      kelas: raw?.kelas || raw,
      mahasiswa: Array.isArray(raw?.mahasiswa) ? raw.mahasiswa : [],
      dosen: Array.isArray(raw?.dosen) ? raw.dosen : [],
      belum_masuk_kelas: Array.isArray(raw?.belum_masuk_kelas) ? raw.belum_masuk_kelas : [],
    };

    return successResponse<StaffKelasDetailData>(
      200,
      detailData,
      response.data?.message || "Detail kelas berhasil diambil."
    );
  } catch (error) {
    let errorMessage = "Gagal mengambil detail kelas.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

/**
 * Menambahkan dosen pengampu ke dalam kelas
 * POST /api/staff/kelas/dosen
 */
export async function addStaffKelasDosen(
  payload: AddKelasDosenRequest
): Promise<ApiResponse<AddKelasDosenResponseData>> {
  try {
    const response = await api.post("/api/staff/kelas/dosen", payload);

    return successResponse<AddKelasDosenResponseData>(
      200,
      response.data?.data,
      response.data?.message || "Dosen pengampu berhasil ditambahkan ke kelas."
    );
  } catch (error) {
    let errorMessage = "Gagal menambahkan dosen pengampu ke kelas.";
    let validationErrors: Record<string, string[]> | null = null;
    let statusCode = 500;

    if (axios.isAxiosError(error) && error.response) {
      statusCode = error.response.status;
      errorMessage = error.response.data?.message || errorMessage;
      validationErrors = error.response.data?.errors || null;
    }

    return errorResponse(statusCode, errorMessage, validationErrors);
  }
}

/**
 * Menghapus dosen pengampu dari kelas
 * DELETE /api/staff/kelas/dosen
 */
export async function deleteStaffKelasDosen(
  mengajarId: number
): Promise<ApiResponse<null>> {
  try {
    const response = await api.delete("/api/staff/kelas/dosen", {
      data: { mengajar_id: mengajarId },
      params: { mengajar_id: mengajarId },
    });

    return successResponse<null>(
      200,
      null,
      response.data?.message || "Dosen pengampu berhasil dihapus dari kelas."
    );
  } catch (error) {
    let errorMessage = "Gagal menghapus dosen pengampu dari kelas.";
    let statusCode = 500;

    if (axios.isAxiosError(error) && error.response) {
      statusCode = error.response.status;
      errorMessage = error.response.data?.message || errorMessage;
    }

    return errorResponse(statusCode, errorMessage);
  }
}

/**
 * Mengambil data penempatan kelas (mahasiswa yang telah ditempatkan di kelas)
 * GET /api/staff/penempatan
 */
export async function getStaffPenempatanList(params?: {
  kelas_id?: number;
  nim?: string;
}): Promise<ApiResponse<StaffPenempatanItem[]>> {
  try {
    const queryParams: Record<string, string | number> = {};
    if (params?.kelas_id) queryParams.kelas_id = params.kelas_id;
    if (params?.nim) queryParams.nim = params.nim;

    const response = await api.get("/api/staff/penempatan", {
      params: queryParams,
    });

    return successResponse<StaffPenempatanItem[]>(
      200,
      response.data.data || [],
      response.data.message
    );
  } catch (error) {
    let errorMessage = "Gagal mengambil data penempatan kelas.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

/**
 * Menambahkan penempatan mahasiswa ke dalam kelas
 * POST /api/staff/penempatan
 */
export async function createStaffPenempatan(
  payload: CreatePenempatanRequest
): Promise<ApiResponse<unknown>> {
  try {
    const response = await api.post("/api/staff/penempatan", payload);

    return successResponse<unknown>(
      200,
      response.data.data,
      response.data.message || "Penempatan kelas berhasil ditambahkan."
    );
  } catch (error) {
    let errorMessage = "Gagal menambahkan penempatan kelas.";
    let validationErrors: Record<string, string[]> | null = null;
    let statusCode = 500;

    if (axios.isAxiosError(error) && error.response) {
      statusCode = error.response.status;
      errorMessage = error.response.data?.message || errorMessage;
      validationErrors = error.response.data?.errors || null;
    }

    return errorResponse(statusCode, errorMessage, validationErrors);
  }
}

/**
 * Menghapus penempatan kelas berdasarkan kelas_mahasiswa_id
 * DELETE /api/staff/penempatan/{kelas_mahasiswa_id}
 */
export async function deleteStaffPenempatan(
  kelasMahasiswaId: number
): Promise<ApiResponse<null>> {
  try {
    const response = await api.delete(`/api/staff/penempatan/${kelasMahasiswaId}`);

    return successResponse<null>(
      200,
      null,
      response.data?.message || "Penempatan kelas berhasil dihapus."
    );
  } catch (error) {
    let errorMessage = "Gagal menghapus penempatan kelas.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

/**
 * Mengambil daftar KRS mahasiswa berdasarkan code_mahasiswa
 * GET /api/staff/akademik/krs
 */
export async function getStaffMahasiswaKrs(
  codeMahasiswa: string
): Promise<ApiResponse<StaffKrsMahasiswaItem[]>> {
  try {
    const response = await api.get("/api/staff/akademik/krs", {
      params: { code: codeMahasiswa },
    });

    return successResponse<StaffKrsMahasiswaItem[]>(
      200,
      response.data.data || [],
      response.data.message
    );
  } catch (error) {
    let errorMessage = "Gagal mengambil daftar KRS mahasiswa.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

/**
 * Normalize penempatan belum kelas item
 */
export function normalizePenempatanBelumKelasItem(rawItem: unknown): StaffPenempatanBelumKelasItem {
  const item = (rawItem && typeof rawItem === "object" ? rawItem : {}) as Record<string, unknown>;
  return {
    code_krs_detail: String(item.code_krs_detail || item.code || ""),
    kode_krs_detail: Number(item.kode_krs_detail || item.id || 0),
    nim: String(item.nim || ""),
    nama_mahasiswa: String(item.nama_mahasiswa || item.nama || ""),
    semester: (item.semester as number | string) || 1,
    tahun_akademik: String(item.tahun_akademik || ""),
    kode_matakuliah: String(item.kode_matakuliah || item.kode_mk || ""),
    nama_matakuliah: String(item.nama_matakuliah || item.nama_mk || ""),
    sks_teori: item.sks_teori !== undefined ? Number(item.sks_teori) : 0,
    sks_praktik: item.sks_praktik !== undefined ? Number(item.sks_praktik) : 0,
  };
}

/**
 * Normalize mahasiswa belum kelas item
 */
export function normalizeMahasiswaBelumKelasItem(rawItem: unknown): StaffMahasiswaBelumKelasItem {
  const item = (rawItem && typeof rawItem === "object" ? rawItem : {}) as Record<string, unknown>;
  return {
    code_krs_detail: String(item.code_krs_detail || item.code || ""),
    kode_krs_detail: Number(item.kode_krs_detail || item.id || 0),
    nim: String(item.nim || ""),
    nama_mahasiswa: String(item.nama_mahasiswa || item.nama || ""),
    semester: (item.semester as number | string) || 1,
  };
}

/**
 * Mengambil data matakuliah yang belum masuk kelas
 * GET /api/staff/penempatan/belum-kelas
 */
export async function getStaffPenempatanBelumKelas(
  params?: StaffPenempatanBelumKelasParams
): Promise<ApiResponse<StaffPenempatanBelumKelasItem[]>> {
  try {
    const queryParams: Record<string, string | number> = {};
    if (params?.tahun_akademik) queryParams.tahun_akademik = params.tahun_akademik;
    if (params?.code_matakuliah) queryParams.code_matakuliah = params.code_matakuliah;

    const response = await api.get("/api/staff/penempatan/belum-kelas", {
      params: queryParams,
      data: queryParams,
    });

    const list = extractArrayData<StaffPenempatanBelumKelasItem>(
      response.data,
      normalizePenempatanBelumKelasItem
    );

    return successResponse<StaffPenempatanBelumKelasItem[]>(
      200,
      list,
      response.data?.message
    );
  } catch (error) {
    let errorMessage = "Gagal mengambil data matakuliah yang belum masuk kelas.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

/**
 * Mengambil data mahasiswa yang belum masuk kelas berdasarkan matakuliah
 * GET /api/staff/kelas/mahasiswa-belum-kelas
 */
export async function getStaffMahasiswaBelumKelas(
  params: StaffMahasiswaBelumKelasParams
): Promise<ApiResponse<StaffMahasiswaBelumKelasItem[]>> {
  try {
    const queryParams: Record<string, string | number> = {
      code_matakuliah: params.code_matakuliah,
    };
    if (params.kode_tahun_akademik !== undefined && params.kode_tahun_akademik !== null) {
      queryParams.kode_tahun_akademik = params.kode_tahun_akademik;
    }

    const response = await api.get("/api/staff/kelas/mahasiswa-belum-kelas", {
      params: queryParams,
      data: queryParams,
    });

    const list = extractArrayData<StaffMahasiswaBelumKelasItem>(
      response.data,
      normalizeMahasiswaBelumKelasItem
    );

    return successResponse<StaffMahasiswaBelumKelasItem[]>(
      200,
      list,
      response.data?.message
    );
  } catch (error) {
    let errorMessage = "Gagal mengambil data mahasiswa belum masuk kelas.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}
