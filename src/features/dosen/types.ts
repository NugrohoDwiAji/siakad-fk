export interface DosenUser {
  code: string;
  nik: string;
  no_telp: string;
  nama_dosen: string;
  alamat_email: string;
  status_dosen: string;
  homebase?: string;
  nama_program_studi: string;
  type?: string;
  status?: string;
  foto_url?: string | null;
}

export interface DosenMeData {
  code: string;
  nik: string;
  no_telp: string;
  nama_dosen: string;
  alamat_email: string;
  status_dosen: string;
  nama_program_studi: string;
  status: string;
  foto_url?: string | null;
  homebase?: string;
  type?: string;
}

export interface DosenMeResponse {
  status: boolean;
  message: string;
  data: DosenMeData;
}

export interface DosenLoginPayload {
  email: string;
  password: string;
}

export interface DosenLoginResponse {
  status: boolean;
  message: string;
  data: {
    kode_dosen: string;
    nik: string;
    nama: string;
    email: string;
    type: string;
  };
}

// ─── Profile Update ──────────────────────────────────────────────────────────

export interface DosenProfileUpdatePayload {
  nik?: string;
  no_telp?: string;
  alamat_email?: string;
  sandi?: string;
}

export interface DosenProfileUpdateResponse {
  status: boolean;
  message: string;
  data?: Partial<DosenUser>;
}

// ─── Perwalian ────────────────────────────────────────────────────────────────

export interface DosenPerwalianItem {
  id: number;
  code: string;
  nim: string;
  nama_mahasiswa: string;
  code_dosen: string;
  nama_dosen: string;
  code_dosen_perwakilan: string | null;
  nama_dosen_perwakilan: string | null;
  code_mahasiswa?: string;
  status_krs?: "A" | "N" | string | null;
  catatan?: string | null;
}

export interface DosenPerwalianData {
  code_dosen: string;
  semester: number;
  jumlah: number;
  perwalian: DosenPerwalianItem[];
}

export interface DosenPerwalianResponse {
  status: boolean;
  message: string;
  data: DosenPerwalianData;
}

// ─── Kurikulum Mahasiswa ──────────────────────────────────────────────────────

export interface DosenMataKuliahKurikulum {
  code_matakuliah: string;
  kode_matakuliah: string;
  nama_matakuliah: string;
  sks_teori: number;
  sks_praktik: number;
  block: boolean;
}

export interface DosenSemesterKurikulum {
  semester: number;
  total_sks: number;
  matakuliah: DosenMataKuliahKurikulum[];
}

export interface DosenKurikulumHeader {
  angkatan: string;
  code_nama_kurikulum: string;
  nama_kurikulum: string;
}

export interface DosenKurikulumMahasiswaData {
  kurikulum: DosenKurikulumHeader;
  data_kurikulum: DosenSemesterKurikulum[];
}

export interface DosenKurikulumResponse {
  status: boolean;
  message: string;
  data: DosenKurikulumMahasiswaData;
}

// ─── Kelas Dosen ─────────────────────────────────────────────────────────────

export interface DosenKelasItem {
  code_mengajar: string;
  code_kelas: string;
  nama_kelas: string;
  semester: number;
  tahun_akademik: string;
  nama_program_studi: string;
  kode_matakuliah: string;
  nama_matakuliah: string;
  sks_teori: number;
  sks_praktik: number;
  block: boolean;
}

export interface DosenKelasPagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface DosenKelasListResponse {
  status: boolean;
  message: string;
  data: DosenKelasItem[];
  pagination?: DosenKelasPagination;
}

// ─── Detail Kelas ────────────────────────────────────────────────────────────

export interface DosenKelasMahasiswaItem {
  code_mahasiswa: string;
  nim: string;
  nama_mahasiswa: string;
}

export interface DosenKelasDetailData {
  code_kelas: string;
  nama_kelas: string;
  semester: number;
  tahun_akademik: string;
  nama_program_studi: string;
  kode_matakuliah: string;
  nama_matakuliah: string;
  sks_teori: number;
  sks_praktik: number;
  block: boolean;
  mahasiswa: DosenKelasMahasiswaItem[];
}

export interface DosenKelasDetailResponse {
  status: boolean;
  message: string;
  data: DosenKelasDetailData;
}

// ─── Detail KRS Perwalian ───────────────────────────────────────────────────

export interface DosenPerwalianKrsMahasiswa {
  nim: string;
  nama_mahasiswa: string;
  nama_program_studi: string;
  semester: number;
}

export interface DosenPerwalianKrsItem {
  id: number;
  code: string;
  kode_matakuliah: string;
  nama_matakuliah: string;
  sks_teori: number;
  sks_praktik: number;
  block: boolean;
}

export interface DosenPerwalianKrsData {
  mahasiswa: DosenPerwalianKrsMahasiswa[];
  krs: DosenPerwalianKrsItem[];
}

export interface DosenPerwalianKrsResponse {
  status: boolean;
  message: string;
  data: DosenPerwalianKrsData;
}

// ─── Validasi KRS ────────────────────────────────────────────────────────────

export interface DosenValidasiKrsPayload {
  code_mahasiswa: string;
  status_krs: "A" | "N";
  catatan?: string | null;
}

export interface DosenValidasiKrsData {
  code_perwalian_krs_validasi: string;
  nim: string;
  code_dosen_validator: string;
  status_krs: "A" | "N" | string;
  catatan: string | null;
}

export interface DosenValidasiKrsResponse {
  status: boolean;
  message: string;
  data: DosenValidasiKrsData;
}

// ─── Penilaian (Tree Penilaian Dosen) ─────────────────────────────────────────

export interface DosenMyAssessmentNodeItem {
  assessment_dosen_id: number;
  code_kelas: string;
  nama_kelas: string;
  matakuliah: string;
  node_key: string;
}

export interface DosenMyAssessmentNodesResponse {
  status: boolean;
  message: string;
  data: DosenMyAssessmentNodeItem[];
}

export interface DosenPenilaianKelasItem {
  code_kelas: string;
  nama_kelas: string;
  semester: number;
  tahun_akademik: string;
  nama_program_studi: string;
  kode_matakuliah: string;
  nama_matakuliah: string;
  block: boolean;
  jumlah_mahasiswa: number;
  sudah_input: number;
  sudah_validasi: number;
  belum_input: number;
}

export interface DosenPenilaianKelasResponse {
  status: boolean;
  message: string;
  data: DosenPenilaianKelasItem[];
}

export type DosenPenilaianStatus =
  | "proses"
  | "revisi"
  | "valid"
  | "sudah_validasi"
  | "belum_input"
  | string;

export interface DosenPenilaianMahasiswaItem {
  code_mahasiswa: string;
  nim: string;
  nama_mahasiswa: string;
  status_mahasiswa: string;
  status_penilaian: DosenPenilaianStatus;
  nilai_akhir: number | null;
  catatan_dosen: string | null;
  catatan_kaprodi: string | null;
  sudah_diisi: number;
  total_nodes: number;
}

export interface DosenPenilaianMahasiswaResponse {
  status: boolean;
  message: string;
  data: DosenPenilaianMahasiswaItem[];
}

export interface PenilaianTreeStructureNode {
  key: string;
  name: string;
  weight: number;
  type: "category" | "input" | string;
  children?: PenilaianTreeStructureNode[];
  score?: number | null;
  dosen_kode_dosen?: number | string | null;
  calculated_score?: number | null;
  filled_count?: number;
  total_nodes?: number;
}

export interface PenilaianLeafNode {
  key: string;
  name: string;
  weight: number;
  type: "input" | string;
}

export interface DosenPenilaianTemplateData {
  template_id: number;
  code_matakuliah: string;
  kode_matakuliah: string;
  nama_matakuliah: string;
  structure: PenilaianTreeStructureNode;
  leaf_nodes: PenilaianLeafNode[];
}

export interface DosenPenilaianTemplateResponse {
  status: boolean;
  message: string;
  data: DosenPenilaianTemplateData;
}

export interface DosenPenilaianMahasiswaDetailData {
  code_mahasiswa: string;
  nim: string;
  nama_mahasiswa: string;
  template_id: number;
  structure: PenilaianTreeStructureNode;
}

export interface DosenPenilaianMahasiswaDetailResponse {
  status: boolean;
  message: string;
  data: DosenPenilaianMahasiswaDetailData;
}

export interface DosenScoreInputItem {
  node_key: string;
  score: string | number;
}

export interface DosenMahasiswaScorePayload {
  code_mahasiswa: string;
  scores: DosenScoreInputItem[];
  catatan?: string | null;
}

export interface DosenInputNilaiPayload {
  code_kelas: string;
  mahasiswa: DosenMahasiswaScorePayload[];
}

export interface DosenInputNilaiResultItem {
  code_mahasiswa: string;
  nim: string;
  nama_mahasiswa: string;
  status: string;
}

export interface DosenInputNilaiResponse {
  status: boolean;
  message: string;
  data: DosenInputNilaiResultItem[];
}

// ─── Kaprodi Penilaian ──────────────────────────────────────────────────────

export interface KaprodiPenilaianKelasItem {
  code_kelas: string;
  nama_kelas: string;
  semester: number;
  tahun_akademik: string;
  nama_program_studi: string;
  kode_matakuliah: string;
  nama_matakuliah: string;
  jumlah_mahasiswa: number;
  proses: number;
  validasi: number;
}

export interface KaprodiPenilaianKelasResponse {
  status: boolean;
  message: string;
  data: KaprodiPenilaianKelasItem[];
}

export interface KaprodiPenilaianMahasiswaItem {
  code_mahasiswa: string;
  nim: string;
  nama_mahasiswa: string;
  status_penilaian: string;
  nilai_akhir: number | null;
  catatan_dosen: string | null;
  catatan_kaprodi: string | null;
  validated_by: string | null;
  validated_at: string | null;
  sudah_diisi: number;
  total_nodes: number;
}

export interface KaprodiPenilaianMahasiswaResponse {
  status: boolean;
  message: string;
  data: KaprodiPenilaianMahasiswaItem[];
}

export interface KaprodiPenilaianDetailData {
  code_mahasiswa: string;
  nim: string;
  nama_mahasiswa: string;
  template_id: number;
  structure: PenilaianTreeStructureNode;
}

export interface KaprodiPenilaianDetailResponse {
  status: boolean;
  message: string;
  data: KaprodiPenilaianDetailData;
}

