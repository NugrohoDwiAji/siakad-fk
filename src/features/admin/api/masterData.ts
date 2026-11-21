import axios from "axios";
import api from "@/lib/api/axios";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import type { ApiResponse } from "@/lib/apiResponse";
import type { Pagination, MahasiswaItem, DosenItem, MahasiswaDetail, MataKuliahItem, MataKuliahDetail, MahasiswaSearchItem, DosenSearchItem, CreateMahasiswaRequest, CreateMahasiswaResponse, UpdateMahasiswaRequest, UpdateMahasiswaResponse, CreateDosenRequest, CreateMataKuliahRequest, CreateMataKuliahResponse, UpdateMataKuliahRequest, UpdateMataKuliahResponse, TrashMahasiswaItem, TrashDosenItem, ProgramStudiItem, TahunAkademikItem, CreateTahunAkademikRequest, CreateTahunAkademikResponse, UpdateTahunAkademikRequest, UpdateTahunAkademikResponse, PenilaianBlokRequest, PenilaianBlokResponse, TemplateBlokItem, TemplateBlokDetailData, TemplateBlokTreeNode, KaprodiProgramStudiData, UpdateKaprodiRequest } from "@/features/admin/types";

interface MahasiswaListResult {
  data: MahasiswaItem[];
  jumlah: number;
  pagination: Pagination;
}

interface DosenListResult {
  data: DosenItem[];
  jumlah: number;
  pagination: Pagination;
}

interface MataKuliahListResult {
  data: MataKuliahItem[];
  jumlah: number;
  pagination: Pagination;
}

interface TrashMahasiswaListResult {
  data: TrashMahasiswaItem[];
  jumlah: number;
  pagination: Pagination;
}

interface TrashDosenListResult {
  data: TrashDosenItem[];
  jumlah: number;
  pagination: Pagination;
}

interface ProgramStudiListResult {
  data: ProgramStudiItem[];
  jumlah: number;
  pagination: Pagination;
}

interface TahunAkademikListResult {
  data: TahunAkademikItem[];
  jumlah: number;
  pagination: Pagination;
}

interface TemplateBlokListResult {
  data: TemplateBlokItem[];
  pagination: Pagination;
}

export async function getDetailMahasiswa(code: string) {
  try {
    const response = await api.get(`/api/staff/master-data/mahasiswa/show`, {
      params: { code },
    });

    return successResponse<MahasiswaDetail>(200, response.data.data);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

export async function getListMahasiswa(
  page: number = 1,
  perPage: number = 20,
  search?: string,
) {
  try {
    const params: Record<string, string | number> = {
      page,
      per_page: perPage,
    };
    if (search) params.search = search;

    const response = await api.get("/api/staff/master-data/mahasiswa", { params });

    const result: MahasiswaListResult = {
      data: response.data.data,
      jumlah: response.data.jumlah,
      pagination: response.data.pagination,
    };

    return successResponse<MahasiswaListResult>(200, result);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

export async function getListDosen(
  page: number = 1,
  perPage: number = 20,
  search?: string,
) {
  try {
    const params: Record<string, string | number> = {
      page,
      per_page: perPage,
    };
    if (search) params.search = search;

    const response = await api.get("/api/staff/master-data/dosen", { params });

    const result: DosenListResult = {
      data: response.data.data,
      jumlah: response.data.jumlah,
      pagination: response.data.pagination,
    };

    return successResponse<DosenListResult>(200, result);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

export async function getListMatakuliah(
  codeProgramStudi?: string,
  perPage: number = 20,
) {
  try {
    const body: Record<string, string | number> = {
      per_page: perPage,
    };
    if (codeProgramStudi) body.code_program_studi = codeProgramStudi;

    console.log("ini request body", body);
    const response = await api.get("/api/staff/master-data/matakuliah", body);

    const result: MataKuliahListResult = {
      data: response.data.data,
      jumlah: response.data.jumlah,
      pagination: response.data.pagination,
    };

    return successResponse<MataKuliahListResult>(200, result);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

export async function getAllMatakuliah(codeNamaKurikulum?: string) {
  try {
    const response = await api.get("/api/staff/akademik/kurikulum", {
      params: { code_nama_kurikulum: codeNamaKurikulum || null },
    });
    const semesters = response.data.data as { semester: number; matakuliah: MataKuliahItem[] }[];
    const flat = semesters.flatMap((s) => s.matakuliah);
    return successResponse<MataKuliahItem[]>(200, flat);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

export async function getMataKuliahDetail(code: string) {
  try {
    const response = await api.get("/api/staff/master-data/matakuliah/show", {
      params: { code },
    });
    return successResponse<MataKuliahDetail>(200, response.data.data);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

export async function createMatakuliah(data: CreateMataKuliahRequest) {
  try {
    const response = await api.post("/api/staff/master-data/matakuliah", data);
    return successResponse<CreateMataKuliahResponse["data"]>(201, response.data.data);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    let validationErrors: Record<string, string[]> | null = null;

    if (axios.isAxiosError(error) && error.response) {
      const res = error.response.data;
      errorMessage = res?.message || errorMessage;
      if (res?.errors) {
        validationErrors = res.errors;
      }
    }

    return errorResponse(500, errorMessage, validationErrors);
  }
}

export async function searchMahasiswa(nama: string) {
  if (!nama.trim()) {
    return successResponse<never[]>(200, []);
  }

  try {
    const response = await api.get("/api/staff/mahasiswa", {
      params: { nama },
    });
    return successResponse<MahasiswaSearchItem[]>(200, response.data.data);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

export async function searchDosen(nama: string) {
  if (!nama.trim()) {
    return successResponse<never[]>(200, []);
  }

  try {
    const response = await api.get("/api/staff/dosen", {
      params: { nama },
    });
    return successResponse<DosenSearchItem[]>(200, response.data.data);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

// ─── CRUD Operations ─────────────────────────────────────────────────────────

export async function createMahasiswa(data: CreateMahasiswaRequest) {
  try {
    const response = await api.post("/api/staff/master-data/mahasiswa", data);
    return successResponse<CreateMahasiswaResponse["data"]>(201, response.data.data);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    let validationErrors: Record<string, string[]> | null = null;

    if (axios.isAxiosError(error) && error.response) {
      const res = error.response.data;
      errorMessage = res?.message || errorMessage;
      if (res?.errors) {
        validationErrors = res.errors;
      }
    }

    return errorResponse(500, errorMessage, validationErrors);
  }
}

export async function updateMahasiswa(data: UpdateMahasiswaRequest) {
  try {
    const response = await api.put("/api/staff/master-data/mahasiswa", data);
    return successResponse<UpdateMahasiswaResponse["data"]>(200, response.data.data);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    let validationErrors: Record<string, string[]> | null = null;

    if (axios.isAxiosError(error) && error.response) {
      const res = error.response.data;
      errorMessage = res?.message || errorMessage;
      if (res?.errors) {
        validationErrors = res.errors;
      }
    }

    return errorResponse(500, errorMessage, validationErrors);
  }
}

export async function deleteMahasiswa(code: string) {
  try {
    await api.delete(`/api/staff/master-data/mahasiswa/${code}`);
    return successResponse<null>(200, null);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

export async function createDosen(data: CreateDosenRequest) {
  try {
    const response = await api.post("/api/staff/master-data/dosen", data);
    return successResponse<{ code: string; nama_dosen: string }>(201, response.data.data);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

export async function updateDosen(code: string, data: Partial<DosenItem>) {
  try {
    const response = await api.put(`/api/staff/master-data/dosen/${code}`, data);
    return successResponse<DosenItem>(200, response.data.data);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

export async function deleteDosen(code: string) {
  try {
    await api.delete(`/api/staff/master-data/dosen/${code}`);
    return successResponse<null>(200, null);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

export async function updateMatakuliah(data: UpdateMataKuliahRequest) {
  try {
    const response = await api.put("/api/staff/master-data/matakuliah", data);
    return successResponse<UpdateMataKuliahResponse["data"]>(200, response.data.data);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    let validationErrors: Record<string, string[]> | null = null;

    if (axios.isAxiosError(error) && error.response) {
      const res = error.response.data;
      errorMessage = res?.message || errorMessage;
      if (res?.errors) {
        validationErrors = res.errors;
      }
    }

    return errorResponse(500, errorMessage, validationErrors);
  }
}

export async function deleteMatakuliah(code: string) {
  try {
    await api.delete(`/api/staff/master-data/matakuliah/${code}`);
    return successResponse<null>(200, null);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

export async function getListProgramStudi(
  page: number = 1,
  perPage: number = 20,
  search?: string,
) {
  try {
    const params: Record<string, string | number> = {
      page,
      per_page: perPage,
    };
    if (search) params.search = search;

    const response = await api.get("/api/staff/master-data/program-studi", { params });

    const result: ProgramStudiListResult = {
      data: response.data.data,
      jumlah: response.data.jumlah,
      pagination: response.data.pagination,
    };

    return successResponse<ProgramStudiListResult>(200, result);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

export async function getListTahunAkademik() {
  try {
    const response = await api.get("/api/staff/master-data/tahun-akademik");

    const result: TahunAkademikListResult = {
      data: response.data.data,
      jumlah: response.data.jumlah,
      pagination: response.data.pagination,
    };

    return successResponse<TahunAkademikListResult>(200, result);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

export async function createTahunAkademik(data: CreateTahunAkademikRequest) {
  try {
    const response = await api.post("/api/staff/master-data/tahun-akademik", data);
    return successResponse<CreateTahunAkademikResponse["data"]>(201, response.data.data);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    let validationErrors: Record<string, string[]> | null = null;

    if (axios.isAxiosError(error) && error.response) {
      const res = error.response.data;
      errorMessage = res?.message || errorMessage;
      if (res?.errors) {
        validationErrors = res.errors;
      }
    }

    return errorResponse(500, errorMessage, validationErrors);
  }
}

export async function getTahunAkademikDetail(code: string) {
  try {
    const response = await api.get("/api/staff/master-data/tahun-akademik/show", {
      params: { code },
    });
    return successResponse<TahunAkademikItem>(200, response.data.data);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

export async function updateTahunAkademik(data: UpdateTahunAkademikRequest) {
  try {
    const response = await api.put("/api/staff/master-data/tahun-akademik", data);
    return successResponse<UpdateTahunAkademikResponse["data"]>(200, response.data.data);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    let validationErrors: Record<string, string[]> | null = null;

    if (axios.isAxiosError(error) && error.response) {
      const res = error.response.data;
      errorMessage = res?.message || errorMessage;
      if (res?.errors) {
        validationErrors = res.errors;
      }
    }

    return errorResponse(500, errorMessage, validationErrors);
  }
}

export async function createPenilaianBlok(data: PenilaianBlokRequest) {
  console.log("Request data:", JSON.stringify(data, null, 2));
  try {
    const response = await api.post("/api/staff/assessment/templates", data);
    console.log("API Success Response:", JSON.stringify(response.data, null, 2));
    return successResponse<PenilaianBlokResponse["data"]>(201, response.data.data);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    let validationErrors: Record<string, string[]> | null = null;

    if (axios.isAxiosError(error) && error.response) {
      const res = error.response.data;
      console.log("API Error Response:", JSON.stringify(res, null, 2));
      console.log("HTTP Status:", error.response.status);
      errorMessage = res?.message || errorMessage;
      if (res?.errors) {
        validationErrors = res.errors;
      }
    }

    return errorResponse(500, errorMessage, validationErrors);
  }
}

export async function getListTemplateBlok(
  perPage: number = 15,
  filters?: { angkatan?: number; versi?: number },
) {
  try {
    const body: Record<string, string | number | null> = {
      per_page: perPage,
      angkatan: filters?.angkatan ?? null,
      versi: filters?.versi ?? null,
    };

    const response = await api.get("/api/staff/assessment/templates", body);

    const result: TemplateBlokListResult = {
      data: response.data.data,
      pagination: response.data.pagination,
    };

    return successResponse<TemplateBlokListResult>(200, result);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

export async function getDetailTemplateBlok(code: string) {
  try {
    const response = await api.get("/api/staff/assessment/templates/show", {
      params: { code },
    });
    return successResponse<TemplateBlokDetailData>(200, response.data.data);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

export async function updateTemplateBlok(code: string, data: { tree: TemplateBlokTreeNode[] }) {
  try {
    const response = await api.put(`/api/staff/assessment/templates/${code}`, data);
    return successResponse<TemplateBlokDetailData>(200, response.data.data);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

// ─── Trash Operations ─────────────────────────────────────────────────────────

export async function getTrashMahasiswa(
  page: number = 1,
  perPage: number = 20,
) {
  try {
    const params: Record<string, string | number> = {
      page,
      per_page: perPage,
    };

    const response = await api.get("/api/staff/master-data/mahasiswa/trash", { params });

    const result: TrashMahasiswaListResult = {
      data: response.data.data,
      jumlah: response.data.jumlah,
      pagination: response.data.pagination,
    };

    return successResponse<TrashMahasiswaListResult>(200, result);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

export async function restoreMahasiswa(code: string) {
  try {
    const response = await api.post(`/api/staff/master-data/mahasiswa/restore`, { code });
    return successResponse<{ code: string; nim: string; nama_mahasiswa: string }>(200, response.data.data);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

export async function forceDeleteMahasiswa(code: string) {
  try {
    await api.delete(`/api/staff/master-data/mahasiswa/force-delete`, { data: { code } });
    return successResponse<null>(200, null);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

export async function getTrashDosen(
  page: number = 1,
  perPage: number = 20,
) {
  try {
    const params: Record<string, string | number> = {
      page,
      per_page: perPage,
    };

    const response = await api.get("/api/staff/master-data/dosen/trash", { params });

    const result: TrashDosenListResult = {
      data: response.data.data,
      jumlah: response.data.jumlah,
      pagination: response.data.pagination,
    };

    return successResponse<TrashDosenListResult>(200, result);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

/**
 * Mengambil data Kaprodi Program Studi
 * GET /api/staff/master-data/program-studi/kaprodi
 * Request: { code: string } (encrypted kode_program_studi)
 */
export async function getKaprodiProgramStudi(codeProgramStudi?: string): Promise<ApiResponse<KaprodiProgramStudiData>> {
  try {
    const config: { params?: { code: string }; data?: { code: string } } = {};
    if (codeProgramStudi) {
      config.params = { code: codeProgramStudi };
      config.data = { code: codeProgramStudi };
    }

    const response = await api.get("/api/staff/master-data/program-studi/kaprodi", config);

    if (response.data) {
      const rawData = response.data.data;
      const item: KaprodiProgramStudiData = Array.isArray(rawData) ? rawData[0] : rawData;

      return successResponse<KaprodiProgramStudiData>(
        response.status || 200,
        item,
        response.data?.message || "Data Kaprodi Program Studi"
      );
    }

    return errorResponse(500, "Gagal memuat data Kaprodi.");
  } catch (error) {
    let errorMessage = "Gagal memuat data Kaprodi.";
    let statusCode = 500;
    if (axios.isAxiosError(error) && error.response) {
      statusCode = error.response.status;
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(statusCode, errorMessage);
  }
}

/**
 * Mengambil seluruh data Kaprodi untuk semua Program Studi:
 * 1. Hit GET /api/staff/master-data/program-studi untuk mengambil daftar program studi & code terenkripsinya
 * 2. Hit GET /api/staff/master-data/program-studi/kaprodi dengan request body & param { code: prodi.code }
 */
export async function getAllKaprodiProgramStudi(): Promise<ApiResponse<KaprodiProgramStudiData[]>> {
  try {
    // 1. Ambil daftar program studi
    const prodiRes = await getListProgramStudi(1, 100);

    if (!prodiRes.status || !prodiRes.data || !prodiRes.data.data || prodiRes.data.data.length === 0) {
      // Jika list prodi kosong, coba hit kaprodi tanpa code sebagai fallback
      const fallbackRes = await getKaprodiProgramStudi();
      if (fallbackRes.status && fallbackRes.data) {
        return successResponse<KaprodiProgramStudiData[]>(200, [fallbackRes.data]);
      }
      return successResponse<KaprodiProgramStudiData[]>(200, []);
    }

    const prodiList = prodiRes.data.data;

    // 2. Untuk setiap program studi, ambil data kaprodinya menggunakan { code: prodi.code }
    const results = await Promise.allSettled(
      prodiList.map((prodi) => getKaprodiProgramStudi(prodi.code))
    );

    const kaprodiList: KaprodiProgramStudiData[] = [];

    results.forEach((res, index) => {
      const prodi = prodiList[index];
      if (res.status === "fulfilled" && res.value.status && res.value.data) {
        kaprodiList.push(res.value.data);
      } else {
        // Fallback jika kaprodi belum diset atau error, gunakan info dasar dari prodi
        kaprodiList.push({
          nama_program_studi: prodi.nama_program_studi,
          code_program_studi: prodi.code,
          kaprodi: prodi.nama_kaprodi
            ? {
                code: prodi.code_dosen_kaprodi || "",
                nama_dosen: prodi.nama_kaprodi,
                nik: "-",
                alamat_email: "-",
                no_telp: "-",
                field_studi: "-",
                alumni: "-",
                homebase: prodi.nama_program_studi,
                aktif: "A",
              }
            : null,
        });
      }
    });

    return successResponse<KaprodiProgramStudiData[]>(
      200,
      kaprodiList,
      "Data Kaprodi Program Studi berhasil dimuat."
    );
  } catch (error) {
    let errorMessage = "Terjadi kesalahan saat memuat data Kaprodi Program Studi.";
    let statusCode = 500;
    if (axios.isAxiosError(error) && error.response) {
      statusCode = error.response.status;
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(statusCode, errorMessage);
  }
}

/**
 * Menetapkan / mengubah Kaprodi Program Studi
 * PUT /api/staff/master-data/program-studi/kaprodi
 * Body:
 * {
 *   "code": "{encrypted kode_program_studi}",
 *   "code_dosen": "{encrypted kode_dosen}" // nullable
 * }
 */
export async function updateKaprodiProgramStudi(
  payload: UpdateKaprodiRequest
): Promise<ApiResponse<unknown>> {
  try {
    const response = await api.put("/api/staff/master-data/program-studi/kaprodi", payload, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    return successResponse<unknown>(
      response.status || 200,
      response.data?.data ?? null,
      response.data?.message || "Kaprodi program studi berhasil diperbarui."
    );
  } catch (error) {
    let errorMessage = "Gagal memperbarui Kaprodi program studi.";
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
