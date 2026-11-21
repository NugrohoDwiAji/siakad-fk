import axios from "axios";
import api from "@/lib/api/axios";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import type { ApiResponse } from "@/lib/apiResponse";
import type {
  SetupAssessmentDosenRequest,
  SetupAssessmentDosenResponseData,
  AssessmentDosenAssignmentItem,
  AssessmentDosenAssignmentData,
  AssessmentDosenAssignmentsResponse,
  AssignAssessmentDosenRequest,
  AssignAssessmentDosenResponse,
} from "@/features/admin/types";

// Re-export getKelas / getStaffKelasList untuk kebutuhan halaman assessment
export { getStaffKelasList as getKelas, getStaffKelasList } from "@/features/admin/api/kelas";

/**
 * Mock data untuk penugasan dosen (digunakan sebagai fallback saat offline/dev)
 */
export const MOCK_ASSESSMENT_ASSIGNMENT_DATA: AssessmentDosenAssignmentData = {
  assessment_dosen_id: 2,
  dosen_pengajar: [
    {
      kode_dosen: 434,
      nama_dosen: "dr. Ahmad Dahlan, Sp.PD",
      nik: "198001012005011001",
      alamat_email: "ahmad.dahlan@fk.ac.id",
    },
    {
      kode_dosen: 435,
      nama_dosen: "dr. Siti Walidah, Sp.A",
      nik: "198202022006022002",
      alamat_email: "siti.walidah@fk.ac.id",
    },
  ],
  available_nodes: [
    {
      node_key: "komponen_1",
      name: "Komponen 1 (Teori Dasar)",
      type: "leaf",
      weight: 50,
      is_assigned: true,
      assigned_dosen: 434,
    },
    {
      node_key: "komponen_2",
      name: "Komponen 2 (Ujian Praktik)",
      type: "leaf",
      weight: 50,
      is_assigned: false,
      assigned_dosen: null,
    },
  ],
  assignments: [
    {
      id: 1,
      node_key: "komponen_1",
      kode_dosen: 434,
      nama_dosen: "dr. Ahmad Dahlan, Sp.PD",
      alamat_email: "ahmad.dahlan@fk.ac.id",
    },
  ],
  payload_sample_put: {
    assessment_dosen_id: 2,
    assignments: [
      {
        node_key: "komponen_1",
        kode_dosen: 434,
      },
    ],
  },
};

/**
 * 1. Setup Assessment Dosen untuk suatu kelas
 * POST /api/staff/assessment/dosen
 *
 * Headers:
 * - Accept: application/json
 * - Content-Type: application/json
 * - Cookie: laravel-session (via withCredentials)
 *
 * Request Params / Payload:
 * {
 *   "code_kelas": "{encrypted kelas}"
 * }
 *
 * Response:
 * {
 *   "code_kelas": "{encrypted kelas}"
 * }
 */
export async function setupAssessmentDosen(
  data: SetupAssessmentDosenRequest
): Promise<ApiResponse<SetupAssessmentDosenResponseData>> {
  try {
    const response = await api.post(
      "/api/staff/assessment/dosen",
      {
        code_kelas: data.code_kelas,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    const rawData =
      response.data?.data && typeof response.data.data === "object"
        ? (response.data.data as Record<string, unknown>)
        : (response.data && typeof response.data === "object"
            ? (response.data as Record<string, unknown>)
            : {});

    const resCodeKelas = String(rawData.code_kelas || response.data?.code_kelas || data.code_kelas);
    const assessmentDosenId =
      rawData.assessment_dosen_id !== undefined
        ? Number(rawData.assessment_dosen_id)
        : rawData.id !== undefined
        ? Number(rawData.id)
        : undefined;

    const result: SetupAssessmentDosenResponseData = {
      id: rawData.id !== undefined ? Number(rawData.id) : undefined,
      assessment_dosen_id: assessmentDosenId,
      code_kelas: resCodeKelas,
      nama_kelas: rawData.nama_kelas ? String(rawData.nama_kelas) : undefined,
      matakuliah: rawData.matakuliah ? String(rawData.matakuliah) : undefined,
      assignments: Array.isArray(rawData.assignments)
        ? (rawData.assignments as AssessmentDosenAssignmentItem[])
        : undefined,
    };

    return successResponse<SetupAssessmentDosenResponseData>(
      response.status || 200,
      result,
      response.data?.message || "AssessmentDosen berhasil dibuat."
    );
  } catch (error) {
    let errorMessage = "Gagal melakukan setup assessment dosen.";
    let statusCode = 500;
    let validationErrors: Record<string, string[]> | null = null;

    if (axios.isAxiosError(error) && error.response) {
      statusCode = error.response.status;
      errorMessage = error.response.data?.message || errorMessage;
      validationErrors = error.response.data?.errors || null;
      return errorResponse(statusCode, errorMessage, validationErrors);
    }

    if (import.meta.env.DEV) {
      return successResponse<SetupAssessmentDosenResponseData>(
        200,
        { code_kelas: data.code_kelas },
        "Setup assessment dosen berhasil dilakukan (mock)."
      );
    }

    return errorResponse(statusCode, errorMessage, validationErrors);
  }
}

/**
 * Normalizer untuk payload assignment assessment dosen
 */
export function normalizeAssessmentAssignmentData(raw: unknown): AssessmentDosenAssignmentData {
  const result: AssessmentDosenAssignmentData = {
    assessment_dosen_id: 0,
    assignments: [],
    dosen_pengajar: [],
  };

  if (!raw) return result;

  const obj = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  const root = (obj.data && typeof obj.data === "object" ? obj.data : obj) as Record<string, unknown>;

  if (root.assessment_dosen_id !== undefined && root.assessment_dosen_id !== null && Number(root.assessment_dosen_id) > 0) {
    result.assessment_dosen_id = Number(root.assessment_dosen_id);
  } else if (root.id !== undefined && root.id !== null && Number(root.id) > 0) {
    result.assessment_dosen_id = Number(root.id);
  } else if (
    root.payload_sample_put &&
    typeof root.payload_sample_put === "object" &&
    (root.payload_sample_put as Record<string, unknown>).assessment_dosen_id !== undefined
  ) {
    result.assessment_dosen_id = Number(
      (root.payload_sample_put as Record<string, unknown>).assessment_dosen_id
    );
  }

  if (root.kelas && typeof root.kelas === "object") {
    result.kelas = root.kelas as AssessmentDosenAssignmentData["kelas"];
  }

  if (root.template && typeof root.template === "object") {
    result.template = root.template as AssessmentDosenAssignmentData["template"];
  }

  if (Array.isArray(root.dosen_pengajar)) {
    result.dosen_pengajar = root.dosen_pengajar.map((rawDosen: unknown) => {
      const d = (rawDosen && typeof rawDosen === "object" ? rawDosen : {}) as Record<string, unknown>;
      return {
        kode_dosen: d.kode_dosen !== undefined ? (d.kode_dosen as number | string) : 0,
        nama_dosen: String(d.nama_dosen || d.nama || "-"),
        nik: d.nik ? String(d.nik) : undefined,
        alamat_email: d.alamat_email ? String(d.alamat_email) : undefined,
      };
    });
  } else {
    result.dosen_pengajar = [];
  }

  if (Array.isArray(root.available_nodes)) {
    result.available_nodes = root.available_nodes as AssessmentDosenAssignmentData["available_nodes"];
  }

  if (root.tree_view && typeof root.tree_view === "object") {
    result.tree_view = root.tree_view as Record<string, unknown>;
  }

  if (root.structure && typeof root.structure === "object") {
    result.structure = root.structure;
  }

  if (root.tree !== undefined && root.tree !== null) {
    result.tree = root.tree;
  }

  if (root.payload_sample_put && typeof root.payload_sample_put === "object") {
    result.payload_sample_put = root.payload_sample_put as AssessmentDosenAssignmentData["payload_sample_put"];
  }

  // Ambil list assignment: prioritas obj.assignments jika tidak kosong,
  // atau fallback ke payload_sample_put.assignments
  let rawAssignments: unknown[] = [];
  if (Array.isArray(root.assignments) && root.assignments.length > 0) {
    rawAssignments = root.assignments;
  } else if (
    root.payload_sample_put &&
    typeof root.payload_sample_put === "object" &&
    Array.isArray((root.payload_sample_put as Record<string, unknown>).assignments)
  ) {
    rawAssignments = (root.payload_sample_put as Record<string, unknown>).assignments as unknown[];
  }

  result.assignments = rawAssignments.map((rawItem: unknown, idx: number) => {
    const item = (rawItem && typeof rawItem === "object" ? rawItem : {}) as Record<string, unknown>;
    const dosenObj = (item.dosen && typeof item.dosen === "object" ? item.dosen : {}) as Record<string, unknown>;
    const kodeDosen = item.kode_dosen ?? item.dosen_id ?? item.id_dosen ?? 0;

    // Ambil referensi data dosen dari dosen_pengajar berdasarkan kode_dosen
    const matchingDosen = (result.dosen_pengajar || []).find(
      (d) => String(d.kode_dosen) === String(kodeDosen)
    );

    return {
      id: Number(item.id ?? item.assessment_dosen_assignment_id ?? idx + 1),
      node_key: String(item.node_key || item.node || item.key || ""),
      kode_dosen: kodeDosen as number | string,
      nama_dosen: String(matchingDosen?.nama_dosen || item.nama_dosen || dosenObj.nama || item.nama || "-"),
      nik: matchingDosen?.nik ? String(matchingDosen.nik) : (item.nik ? String(item.nik) : undefined),
      alamat_email: String(matchingDosen?.alamat_email || item.alamat_email || item.email || dosenObj.email || "-"),
    };
  });

  return result;
}

/**
 * 2. Mengambil daftar assignment dosen untuk suatu kelas
 * GET /api/staff/assessment/dosen/assignments
 *
 * Headers:
 * - Accept: application/json
 * - Content-Type: application/json
 * - Cookie: laravel-session (via withCredentials)
 *
 * Request Body:
 * {
 *   "code_kelas": "{encrypted kelas}"
 * }
 *
 * Response:
 * {
 *   "status": true,
 *   "message": "Daftar assignment berhasil diambil.",
 *   "data": {
 *     "assessment_dosen_id": 1,
 *     "assignments": [
 *       {
 *         "id": 1,
 *         "node_key": "kompetensi_inti",
 *         "kode_dosen": 42,
 *         "nama_dosen": "dr. Nama Dosen, Sp.PK",
 *         "alamat_email": "dosen@example.com"
 *       }
 *     ]
 *   }
 * }
 */
export async function getAssessmentDosenAssignments(
  codeKelas: string
): Promise<ApiResponse<AssessmentDosenAssignmentData>> {
  try {
    const response = await api.request<AssessmentDosenAssignmentsResponse>({
      method: "GET",
      url: "/api/staff/assessment/dosen/assignments",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      params: {
        code_kelas: codeKelas,
      },
      data: {
        code_kelas: codeKelas,
      },
    });

    if (response.data) {
      const rawPayload =
        response.data.data !== undefined ? response.data.data : response.data;
      const normalizedData = normalizeAssessmentAssignmentData(rawPayload);

      return successResponse<AssessmentDosenAssignmentData>(
        response.status || 200,
        normalizedData,
        response.data.message || "Daftar assignment berhasil diambil."
      );
    }

    return errorResponse(
      response.status || 400,
      "Gagal mengambil daftar assignment assessment dosen."
    );
  } catch (error) {
    let errorMessage = "Gagal mengambil daftar assignment assessment dosen.";
    let statusCode = 500;
    let validationErrors: Record<string, string[]> | null = null;

    if (axios.isAxiosError(error) && error.response) {
      statusCode = error.response.status;
      errorMessage = error.response.data?.message || errorMessage;
      validationErrors = error.response.data?.errors || null;
      return errorResponse(statusCode, errorMessage, validationErrors);
    }

    if (import.meta.env.DEV) {
      return successResponse<AssessmentDosenAssignmentData>(
        200,
        MOCK_ASSESSMENT_ASSIGNMENT_DATA,
        "Daftar assignment berhasil diambil (mock)."
      );
    }

    return errorResponse(statusCode, errorMessage, validationErrors);
  }
}

/**
 * 3. Simpan Alokasi / Penugasan Dosen Penilai (Assign Dosen Assessment)
 * PUT /api/staff/assessment/dosen/assign
 *
 * Headers:
 * - Accept: application/json
 * - Content-Type: application/json
 * - Cookie: laravel-session (via withCredentials)
 *
 * Request Body:
 * {
 *   "assessment_dosen_id": 2,
 *   "assignments": [
 *     {
 *       "node_key": "komponen_1",
 *       "kode_dosen": 434
 *     }
 *   ]
 * }
 */
export async function assignAssessmentDosen(
  data: AssignAssessmentDosenRequest
): Promise<ApiResponse<AssignAssessmentDosenResponse>> {
  try {
    const payload = {
      assessment_dosen_id: Number(data.assessment_dosen_id),
      assignments: data.assignments.map((item) => ({
        node_key: String(item.node_key),
        kode_dosen: Number(item.kode_dosen),
      })),
    };

    const response = await api.put("/api/staff/assessment/dosen/assign", payload, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    return successResponse<AssignAssessmentDosenResponse>(
      response.status || 200,
      (response.data?.data || response.data) as AssignAssessmentDosenResponse,
      response.data?.message || "Penugasan dosen assessment berhasil disimpan."
    );
  } catch (error) {
    let errorMessage = "Gagal menyimpan penugasan dosen assessment.";
    let statusCode = 500;
    let validationErrors: Record<string, string[]> | null = null;

    if (axios.isAxiosError(error) && error.response) {
      statusCode = error.response.status;
      errorMessage = error.response.data?.message || errorMessage;
      validationErrors = error.response.data?.errors || null;
      return errorResponse(statusCode, errorMessage, validationErrors);
    }

    if (import.meta.env.DEV) {
      return successResponse<AssignAssessmentDosenResponse>(
        200,
        {
          status: true,
          message: "Penugasan dosen assessment berhasil disimpan (mock).",
          data: data,
        },
        "Penugasan dosen assessment berhasil disimpan (mock)."
      );
    }

    return errorResponse(statusCode, errorMessage, validationErrors);
  }
}
