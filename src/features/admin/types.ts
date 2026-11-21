export interface MahasiswaItem {
  id: number;
  code: string;
  nim: string;
  nama_mahasiswa: string;
  nama_program_studi: string;
  email: string;
  telepon: string;
  status: string;
}

export interface Pagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

export interface MahasiswaResponse {
  status: boolean;
  message: string;
  jumlah: number;
  data: MahasiswaItem[];
  pagination: Pagination;
}

export interface DosenItem {
  id: number;
  code: string;
  nama_dosen: string;
  nik: string;
  no_telp: string;
  alamat_email: string;
  field_studi: string;
  alumni: string;
  homebase: string;
  status_dosen: string;
  aktif: string;
  status_login: string;
  signature: string | null;
}

export interface DosenResponse {
  status: boolean;
  message: string;
  jumlah: number;
  data: DosenItem[];
  pagination: Pagination;
}

export interface MahasiswaDetail {
  code: string;
  nim: string;
  nik: string;
  npm: string;
  nisn: string;
  nomor_pendaftaran: string;
  nomor_pendaftaran_ulang: string;
  nama_program_studi: string;
  nama_mahasiswa: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  alamat: string;
  kota: string;
  propinsi: string;
  telepon: string;
  jenis_kelamin: string;
  agama: string;
  golongan_darah: string;
  kewarganegaraan: string;
  nama_instansi: string;
  email: string;
  nama_ayah: string;
  agama_ayah: string;
  pekerjaan_ayah: string;
  nama_ibu: string;
  agama_ibu: string;
  pekerjaan_ibu: string;
  alamat_orangtua: string;
  kota_orangtua: string;
  propinsi_orangtua: string;
  telepon_orangtua: string;
  foto: string | null;
  status: string;
  status_pendaftaran: string;
  ta_lulus: number;
  created_at: string;
  updated_at: string;
}

export interface MahasiswaDetailResponse {
  status: boolean;
  message: string;
  data: MahasiswaDetail;
}

export interface MataKuliahItem {
  id: number;
  code: string;
  code_matakuliah: string;
  kode_matakuliah: string;
  nama_matakuliah: string;
  sks_teori: number;
  sks_praktik: number;
  block: boolean;
}

export interface MataKuliahSemesterItem {
  semester: number;
  total_sks: number;
  matakuliah: MataKuliahItem[];
}

export interface MataKuliahDetail {
  code: string;
  kode_matakuliah: string;
  nama_matakuliah: string;
  sks_teori: number;
  sks_praktik: number;
  block: boolean;
}

export interface MataKuliahDetailResponse {
  status: boolean;
  message: string;
  data: MataKuliahDetail;
}

export interface CreateMataKuliahRequest {
  kode_matakuliah: string;
  nama_matakuliah: string;
  jenis: boolean | null;
  sks_teori: number;
  sks_praktik: number;
  block: string;
  code_program_studi: string | null;
}

export interface CreateMataKuliahResponse {
  status: boolean;
  message: string;
  data: {
    code: string;
    kode_matakuliah: string;
    nama_matakuliah: string;
    sks_teori: number;
    sks_praktik: number;
    block: boolean;
  };
}

export interface UpdateMataKuliahRequest {
  code: string;
  kode_matakuliah: string;
  nama_matakuliah: string;
  jenis: string;
  sks_teori: number;
  sks_praktik: number;
  block: string;
  kode_program_studi: string;
}

export interface UpdateMataKuliahResponse {
  status: boolean;
  message: string;
  data: {
    code: string;
    kode_matakuliah: string;
    nama_matakuliah: string;
    sks_teori: number;
    sks_praktik: number;
    block: boolean;
  };
}

export interface MataKuliahResponse {
  status: boolean;
  message: string;
  jumlah: number;
  data: MataKuliahItem[];
  pagination: Pagination;
}

export interface KurikulumItem {
  id: number;
  code_nama_kurikulum: string;
  nama_kurikulum: string;
  code_program_studi: string;
  nama_program_studi: string;
  angkatan1: string;
  ekstensi1: string;
  paket1: string;
}

export interface KurikulumAngkatanItem {
  id: number;
  code: string;
  angkatan: string;
  code_nama_kurikulum: string;
  nama_kurikulum: string;
  ekstensi: string;
  paket: string;
}

export interface CreateKurikulumAngkatanRequest {
  angkatan: string;
  kode_nama_kurikulum: string;
  ekstensi?: string | null;
  paket?: string | null;
}

export interface CreateKurikulumAngkatanResponse {
  status: boolean;
  message: string;
  data: KurikulumAngkatanItem;
}

export interface CreateNamaKurikulumRequest {
  nama_kurikulum: string;
  kode_program_studi: number;
  angkatan1?: string | null;
  ekstensi1?: string | null;
  paket1?: string | null;
}

export interface CreateNamaKurikulumResponse {
  status: boolean;
  message: string;
  data: KurikulumItem;
}

export interface KurikulumListResponse {
  status: boolean;
  message: string;
  jumlah: number;
  data: KurikulumItem[];
  pagination: Pagination;
}

export interface MahasiswaSearchItem {
  code: string;
  nim: string;
  nama_mahasiswa: string;
}

export interface MahasiswaSearchResponse {
  status: boolean;
  message: string;
  data: MahasiswaSearchItem[];
}

export interface DosenSearchItem {
  code: string;
  nama_dosen: string;
  nik: string;
}

export interface DosenSearchResponse {
  status: boolean;
  message: string;
  data: DosenSearchItem[];
}

export interface CreateMahasiswaRequest {
  nim: string;
  nik: string;
  npm: string;
  nomor_pendaftaran: string;
  nomor_pendaftaran_ulang: string;
  program_studi_kode: string;
  nama_mahasiswa: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  alamat: string;
  kota: string;
  propinsi: string;
  telepon?: string | null;
  jenis_kelamin: string;
  agama: string;
  golongan_darah: string;
  kewarganegaraan: string;
  email: string;
  nama_ayah: string;
  agama_ayah: string;
  pekerjaan_ayah: string;
  nama_ibu: string;
  agama_ibu: string;
  pekerjaan_ibu: string;
  alamat_orangtua: string;
  kota_orangtua: string;
  propinsi_orangtua: string;
  telepon_orangtua: string;
  foto?: string | null;
  status: string;
  status_pendaftaran: string;
}

export interface CreateMahasiswaResponse {
  status: boolean;
  message: string;
  data: {
    code: string;
    nim: string;
    nama_mahasiswa: string;
  };
}

export interface ProgramStudiItem {
  id: number;
  code: string;
  kode_program_studi?: string;
  nama_program_studi: string;
  singkatan_program_studi: string;
  kompetensi: string;
  code_dosen_kaprodi?: string | null;
  nama_kaprodi?: string | null;
}

export interface ProgramStudiResponse {
  status: boolean;
  message: string;
  jumlah: number;
  data: ProgramStudiItem[];
  pagination: Pagination;
}

export interface KaprodiDetail {
  code: string;
  nama_dosen: string;
  nik: string;
  alamat_email: string;
  no_telp: string;
  field_studi: string;
  alumni: string;
  homebase: string;
  aktif: "A" | "N" | string;
}

export interface KaprodiProgramStudiData {
  nama_program_studi: string;
  code_program_studi: string;
  kaprodi: KaprodiDetail | null;
}

export interface KaprodiProgramStudiResponse {
  status: boolean;
  message: string;
  data: KaprodiProgramStudiData | KaprodiProgramStudiData[];
}

export interface UpdateKaprodiRequest {
  code: string;
  code_dosen: string | null;
}

export interface UpdateKaprodiResponse {
  status: boolean;
  message: string;
  data?: unknown;
}

export interface UpdateMahasiswaRequest {
  code: string;
  nim?: string | null;
  nik?: string | null;
  npm?: string | null;
  nomor_pendaftaran?: string | null;
  nomor_pendaftaran_ulang?: string | null;
  program_studi_kode?: string | null;
  nama_mahasiswa?: string | null;
  tempat_lahir?: string | null;
  tanggal_lahir?: string | null;
  alamat?: string | null;
  kota?: string | null;
  propinsi?: string | null;
  telepon?: string | null;
  jenis_kelamin?: string | null;
  agama?: string | null;
  golongan_darah?: string | null;
  kewarganegaraan?: string | null;
  email?: string | null;
  nama_ayah?: string | null;
  agama_ayah?: string | null;
  pekerjaan_ayah?: string | null;
  nama_ibu?: string | null;
  agama_ibu?: string | null;
  pekerjaan_ibu?: string | null;
  alamat_orangtua?: string | null;
  kota_orangtua?: string | null;
  propinsi_orangtua?: string | null;
  telepon_orangtua?: string | null;
  foto?: string | null;
  status?: string | null;
  status_pendaftaran?: string | null;
}

export interface UpdateMahasiswaResponse {
  status: boolean;
  message: string;
  data: {
    code: string;
    nim: string;
    nama_mahasiswa: string;
  };
}

export interface CreateDosenRequest {
  nama_dosen: string;
  nik: string;
  no_telp: string;
  alamat_email: string;
  field_studi: string;
  alumni: string;
  homebase: string;
  status_dosen: string;
  aktif: string;
  chatid?: string | null;
  sandi_pengguna: string;
}

export interface CreateDosenResponse {
  status: boolean;
  message: string;
  data: {
    code: string;
    nama_dosen: string;
  };
}

export interface TrashMahasiswaItem {
  id: number;
  code: string;
  nim: string;
  nama_mahasiswa: string;
  nama_program_studi: string;
  email: string;
  telepon: string;
  status: string;
}

export interface TrashMahasiswaResponse {
  status: boolean;
  message: string;
  jumlah: number;
  data: TrashMahasiswaItem[];
  pagination: Pagination;
}

export interface TrashDosenItem {
  id: number;
  code: string;
  nama_dosen: string;
  nik: string;
  deleted_at: string;
}

export interface TrashDosenResponse {
  status: boolean;
  message: string;
  jumlah: number;
  data: TrashDosenItem[];
  pagination: Pagination;
}

export interface TahunAkademikItem {
  id: number;
  code: string;
  tahun_akademik: string;
  semester: number;
  tanggal_mulai: string;
  tanggal_berakhir: string;
  status: string;
  status_kpat: string;
  tanggal_buka_krs: string;
  tanggal_tutup_krs: string;
}

export interface TahunAkademikResponse {
  status: boolean;
  message: string;
  jumlah: number;
  data: TahunAkademikItem[];
  pagination: Pagination;
}

export interface CreateTahunAkademikRequest {
  tahun_akademik: string;
  semester: number;
  tanggal_mulai: string;
  tanggal_berakhir: string;
  status: string;
  status_kpat: string | null;
  tanggal_buka_krs: string | null;
  tanggal_tutup_krs: string | null;
}

export interface CreateTahunAkademikResponse {
  status: boolean;
  message: string;
  data: TahunAkademikItem;
}

export interface UpdateTahunAkademikRequest {
  code: string;
  tahun_akademik: string;
  semester: number;
  tanggal_mulai: string;
  tanggal_berakhir: string;
  status: string;
  status_kpat: string | null;
  tanggal_buka_krs: string | null;
  tanggal_tutup_krs: string | null;
}

export interface UpdateTahunAkademikResponse {
  status: boolean;
  message: string;
  data: TahunAkademikItem;
}

// ─── Tree Node (recursive) ────────────────────────────────────────────────────

export interface PenilaianTreeNode {
  name: string;
  weight: number;
  type?: string;
  children?: PenilaianTreeNode[];
}

export interface PenilaianStructure {
  name: string;
  weight: number;
  children: PenilaianTreeNode[];
}

export interface PenilaianBlokRequest {
  code_matakuliah: string;
  code_kurikulum_angkatan: string;
  structure: PenilaianStructure;
}

export interface PenilaianBlokResponse {
  status: boolean;
  message: string;
  data: {
    code: string;
    code_matakuliah: string;
    code_kurikulum_angkatan: string;
    structure: PenilaianStructure;
  };
}

export interface TemplateBlokItem {
  id: number;
  code: string;
  versi: number;
  matakuliah: string;
  kurikulum_angkatan: number;
  created_at: string;
  updated_at: string;
}

export interface TemplateBlokDetailTemplate {
  id: number;
  code: string;
  versi: number;
  is_active: boolean;
  matakuliah: string;
  kurikulum_angkatan: number;
  created_at: string;
  updated_at: string;
}

export interface TemplateBlokTreeNode {
  key: string;
  name: string;
  weight: number;
  type: string;
  children?: TemplateBlokTreeNode[];
}

export interface TemplateBlokLeafNode {
  key: string;
  name: string;
  weight: number;
  type: string;
}

export interface TemplateBlokDetailData {
  template: TemplateBlokDetailTemplate;
  structure: TemplateBlokTreeNode;
  tree: TemplateBlokTreeNode[];
  leaf_nodes: TemplateBlokLeafNode[];
}

export interface TemplateBlokResponse {
  status: boolean;
  message: string;
  data: TemplateBlokItem[];
  pagination: Pagination;
}

// ─── SKS Rule ─────────────────────────────────────────────────────────────────

export interface SksRuleItem {
  id: number;
  code: string;
  code_program_studi: string;
  nama_program_studi: string;
  ip_min: number;
  ip_max: number;
  sks_yang_dapat_diambil: number;
  created_at: string;
  updated_at: string;
}

export interface SksRuleListResult {
  data: SksRuleItem[];
  jumlah: number;
  pagination: Pagination;
}

export interface CreateSksRuleRequest {
  code_program_studi: string;
  ip_min: number;
  ip_max: number;
  sks_yang_dapat_diambil: number;
}

export interface UpdateSksRuleRequest {
  code: string;
  code_program_studi?: string;
  ip_min?: number;
  ip_max?: number;
  sks_yang_dapat_diambil?: number;
}

// ─── Perwalian ────────────────────────────────────────────────────────────────

export interface PerwalianItem {
  id: number;
  code: string;
  nim: string;
  nama_mahasiswa: string;
  nama_program_studi: string;
  code_dosen: string;
  nama_dosen: string;
  code_dosen_perwakilan: string | null;
  nama_dosen_perwakilan: string | null;
}

export interface PerwalianListResult {
  data: PerwalianItem[];
  jumlah: number;
  pagination: Pagination;
}

export interface CreatePerwalianRequest {
  code: string;
  code_dosen: string;
  code_dosen_perwakilan?: string | null;
}

export interface UpdatePerwalianRequest {
  kode_dosen?: number | string | null;
  kode_dosen_perwakilan?: number | string | null;
  nim?: string | null;
}

// ─── Kelas & Penempatan Kelas ──────────────────────────────────────────────────

export interface StaffKelasListParams {
  kode_tahun_akademik?: number;
  kode_program_studi?: string;
  semester?: string | number;
  code_matakuliah?: string;
  tahun_akademik?: string;
  search?: string;
}

export interface StaffKelasItem {
  code_kelas: string;
  kelas_id: number;
  nama_kelas: string;
  semester: string | number;
  kode_program_studi?: string;
  nama_program_studi?: string;
  tahun_akademik: string;
  code_matakuliah?: string;
  kode_matakuliah: string;
  nama_matakuliah: string;
  jumlah_mahasiswa: number;
  jumlah_dosen?: number;
  template_matakuliah?: boolean;
  template_assignments?: boolean;
  setup_assignments?: boolean;
}

export interface StaffKelasDosenItem {
  mengajar_id: number;
  code_dosen?: string;
  kode_dosen: number | string;
  nama_dosen: string;
}

export interface StaffKelasBelumMasukItem {
  code_krs_detail: string;
  kode_krs_detail: number;
  nim: string;
  nama_mahasiswa: string;
  semester: number | string;
}

export interface StaffKelasDetailData {
  kelas: {
    code_kelas: string;
    kelas_id: number;
    nama_kelas: string;
    semester: string | number;
    kode_program_studi?: string;
    nama_program_studi?: string;
    tahun_akademik: string;
    code_matakuliah?: string;
    kode_matakuliah: string;
    nama_matakuliah: string;
  };
  mahasiswa: StaffKelasMahasiswaItem[];
  dosen?: StaffKelasDosenItem[];
  belum_masuk_kelas?: StaffKelasBelumMasukItem[];
}

export interface StaffKelasMahasiswaItem {
  kelas_mahasiswa_id: number;
  kode_krs_detail?: number;
  nim: string;
  nama_mahasiswa: string | null;
  semester: string | number;
}

export interface StaffPenempatanItem {
  kelas_mahasiswa_id: number;
  kode_krs_detail: number;
  kelas_id: number;
  nama_kelas: string;
  kode_matakuliah: string;
  nama_mahasiswa: string;
  nim: string;
  tahun_akademik: string;
  semester: string | number;
}

export interface CreatePenempatanRequest {
  kelas_id: number;
  code_krs_detail: string;
}

export interface StaffKrsMahasiswaItem {
  id: number;
  code_krs: string;
  semester: string | number;
}

export interface StaffKrsDetailMahasiswa {
  nim: string;
  nama_mahasiswa: string;
  nama_program_studi: string;
  semester: number | string;
}

export interface StaffKrsDetailItem {
  id: number;
  code: string;
  kode_matakuliah: string;
  nama_matakuliah: string;
  sks_teori: number;
  sks_praktik: number;
  block: boolean;
}

export interface StaffKrsDetailData {
  mahasiswa: StaffKrsDetailMahasiswa[];
  krs: StaffKrsDetailItem[];
}

export interface StaffKrsDetailResponse {
  status: boolean;
  message: string;
  data: StaffKrsDetailData;
}

export interface StaffKhsMahasiswaItem {
  id: number;
  code_krs: string;
  semester: string | number;
}

export interface StaffKhsDetailMahasiswa {
  nim: string;
  nama_mahasiswa: string;
  nama_program_studi: string;
  semester: number | string;
}

export interface StaffKhsDetailItem {
  id: number;
  code: string;
  kode_matakuliah: string;
  nama_matakuliah: string;
  sks_teori: number;
  sks_praktik: number;
  block: boolean;
  nilai_akhir: number;
  grade: string;
  score: number;
}

export interface StaffKhsDetailData {
  mahasiswa: StaffKhsDetailMahasiswa[];
  khs: StaffKhsDetailItem[];
}

export interface StaffKhsDetailResponse {
  status: boolean;
  message: string;
  data: StaffKhsDetailData;
}

export interface StaffPenempatanBelumKelasItem {
  code_krs_detail: string;
  kode_krs_detail: number;
  nim: string;
  nama_mahasiswa: string;
  semester: number | string;
  tahun_akademik: string;
  kode_matakuliah: string;
  nama_matakuliah: string;
  sks_teori: number;
  sks_praktik: number;
}

export interface StaffPenempatanBelumKelasParams {
  tahun_akademik?: string;
  code_matakuliah?: string;
}

export interface StaffMahasiswaBelumKelasItem {
  code_krs_detail: string;
  kode_krs_detail: number;
  nim: string;
  nama_mahasiswa: string;
  semester: number | string;
}

export interface StaffMahasiswaBelumKelasParams {
  code_matakuliah: string;
  kode_tahun_akademik?: number;
}

export interface CreateKelasRequest {
  code_matakuliah: string;
  nama_kelas: string;
  kode_tahun_akademik?: number | null;
  semester?: string | null;
  kode_program_studi?: string | null;
}

export interface CreateKelasResponseData {
  code_kelas: string;
  kelas_id: number;
  nama_kelas: string;
  semester: string;
  kode_program_studi?: string;
  tahun_akademik: string;
  code_matakuliah: string;
  kode_matakuliah: string;
  nama_matakuliah: string;
}

export interface CreateKelasResponse {
  status: boolean;
  message: string;
  data: CreateKelasResponseData;
}

export interface AddKelasDosenRequest {
  kelas_id: number;
  code_dosen: string;
}

export interface AddKelasDosenResponseData {
  mengajar_id: number;
  kelas_id: number;
  code_dosen: string;
  kode_dosen: number | string;
  nama_dosen: string;
}

export interface AddKelasDosenResponse {
  status: boolean;
  message: string;
  data: AddKelasDosenResponseData;
}

export interface DeleteKelasDosenRequest {
  mengajar_id: number;
}

export interface DeleteKelasDosenResponse {
  status: boolean;
  message: string;
  data: null;
}

export interface DeleteKelasRequest {
  kelas_id: number;
}

export interface DeleteKelasResponse {
  status: boolean;
  message: string;
  data: null;
}

// ─── Setup Assessment Dosen & Assignments ────────────────────────────────────

export interface SetupAssessmentDosenRequest {
  code_kelas: string;
}

export interface SetupAssessmentDosenResponseData {
  id?: number;
  code_kelas: string;
  nama_kelas?: string;
  matakuliah?: string;
  assessment_dosen_id?: number;
  assignments?: AssessmentDosenAssignmentItem[];
}

export interface SetupAssessmentDosenResponse {
  status?: boolean;
  message?: string;
  data?: SetupAssessmentDosenResponseData;
  code_kelas?: string;
}

export interface DosenPengajarItem {
  kode_dosen: number | string;
  nama_dosen: string;
  nik?: string;
  alamat_email?: string;
}

export interface AssessmentDosenAssignmentItem {
  id?: number;
  node_key: string;
  kode_dosen: number | string;
  nama_dosen?: string;
  nik?: string;
  alamat_email?: string;
}

export interface AssessmentDosenAssignmentData {
  assessment_dosen_id: number;
  kelas?: {
    code_kelas: string;
    nama_kelas: string;
    semester: string | number;
    matakuliah: string;
    kode_matakuliah: string;
  };
  template?: {
    template_id: string;
    versi: number;
    root_key: string;
    root_name: string;
  };
  dosen_pengajar?: DosenPengajarItem[];
  available_nodes?: Array<{
    node_key: string;
    name: string;
    type: string;
    weight: number;
    is_assigned: boolean;
    assigned_dosen: string | number | null;
    sub_components?: Array<{
      key: string;
      name: string;
      weight: number;
    }>;
  }>;
  assignments: AssessmentDosenAssignmentItem[];
  tree_view?: Record<string, unknown>;
  structure?: unknown;
  tree?: unknown;
  payload_sample_put?: {
    assessment_dosen_id?: number;
    assignments?: Array<{
      node_key: string;
      kode_dosen: number | string;
    }>;
  };
}

export interface AssessmentDosenAssignmentsResponse {
  status: boolean;
  message: string;
  data: AssessmentDosenAssignmentData;
}

export interface AssignAssessmentDosenItem {
  node_key: string;
  kode_dosen: number;
}

export interface AssignAssessmentDosenRequest {
  assessment_dosen_id: number;
  assignments: AssignAssessmentDosenItem[];
}

export interface AssignAssessmentDosenResponse {
  status: boolean;
  message: string;
  data?: unknown;
}

// ─── Keuangan & Pembayaran ──────────────────────────────────────────────────

export interface StaffPembayaranItem {
  id: number;
  code: string;
  nim: string;
  nama_mahasiswa: string;
  kode_tahun_akademik: number;
  tahun_akademik: string;
  semester: string | number;
  status: string;
  status_mahasiswa: string;
  tanggal_bayar: string;
  keterangan: string;
  sks_override: number | null;
  sks_override_reason: string | null;
  sks_override_by: string | null;
  sks_override_at: string | null;
}

export interface StaffPembayaranPagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

export interface StaffPembayaranResponseData {
  jumlah: number;
  data: StaffPembayaranItem[];
  pagination?: StaffPembayaranPagination;
}

export interface StaffPembayaranResponse {
  status: boolean;
  message: string;
  jumlah: number;
  data: StaffPembayaranItem[];
  pagination?: StaffPembayaranPagination;
}

export interface StaffPembayaranDetailResponse {
  status: boolean;
  message: string;
  data: StaffPembayaranItem;
}

// ─── Feeder & PDDIKTI Types ──────────────────────────────────────────────────

export interface FeederStatusData {
  connected: boolean;
  token_valid_until: string | null;
}

export interface FeederStatusResponse {
  status: boolean;
  message: string;
  data: FeederStatusData;
}

export interface FeederPullKelasData<T = Record<string, unknown>> {
  code_kelas: string;
  source: string;
  pulled_at: string;
  total_rows: number;
  data: T[];
}

export interface FeederPullKelasResponse<T = Record<string, unknown>> {
  status: boolean;
  message: string;
  data: FeederPullKelasData<T>;
}




