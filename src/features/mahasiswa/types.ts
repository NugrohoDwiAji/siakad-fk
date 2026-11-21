export interface MataKuliah {
  code: string;
  nama: string;
  sksTeori: number;
  sksPraktek: number;
  block?: string;
}

export interface KurikulumSemester {
  semester: number;
  totalSks: number;
  mataKuliah: MataKuliah[];
}

export interface OrangTua {
  namaAyah: string;
  pekerjaanAyah: string;
  nohpAyah: string;
  namaIbu: string;
  pekerjaanIbu: string;
  nohpIbu: string;
  alamat: string;
}

// ─── KHS ──────────────────────────────────────────────────────────────────────

export interface MataKuliahKhs {
  id: string | number;
  code: string;
  kodeMatakuliah: string;
  namaMatakuliah: string;
  sksTeori: number;
  sksPraktik: number;
  nilaiAkhir: string;
  sks: number;
  grade: string;
  keterangan: string;
}

export interface KhsEntry {
  id: string;
  nim: string;
  nama: string;
  semester: number;
  tahunAjaran: string;
  totalSks: number;
  ipSemester: number;
  ipKumulatif: number;
  mataKuliah: MataKuliahKhs[];
}

// ─── KRS ─────────────────────────────────────────────────────────────────────

export type StatusValidasi = "Tervalidasi" | "Menunggu" | "Ditolak";

export interface MataKuliahKrs {
  id: string | number;
  code: string;
  kodeMatakuliah: string;
  namaMatakuliah: string;
  sksTeori: number;
  sksPraktik: number;
  block: boolean;
}

export interface KrsEntry {
  id: string;
  nim: string;
  nama: string;
  semester: number;
  tahunAjaran: string;
  totalSks: number;
  mataKuliah: MataKuliahKrs[];
  validasi: {
    dosenWali: StatusValidasi;
    keuangan: StatusValidasi;
  };
}

// ─── KRS API Response ──────────────────────────────────────────────────────

export interface KrsMahasiswa {
  nim: string;
  nama_mahasiswa: string;
  nama_program_studi: string;
}

export interface KrsDetailItem {
  id: number;
  code: string;
  kode_matakuliah: string;
  nama_matakuliah: string;
  sks_teori: number;
  sks_praktik: number;
  block: boolean;
}

export interface KrsData {
  code: string;
  semester: number;
  tahun_akademik: string;
  sks_limit: number;
  sks_terpakai: number;
  sks_tersisa: number;
  detail: KrsDetailItem[];
}

export interface KurikulumMatakuliah {
  code_matakuliah: string;
  kode_matakuliah: string;
  nama_matakuliah: string;
  sks_teori: number;
  sks_praktik: number;
  block: boolean;
}

export interface KurikulumSemesterItem {
  semester: number;
  total_sks: number;
  matakuliah: KurikulumMatakuliah[];
}

export interface KrsApiResponse {
  mahasiswa: KrsMahasiswa;
  krs: KrsData | null;
  status_validasi: string;
  validasi: {
    dosen_wali: StatusValidasi;
    keuangan: StatusValidasi;
  };
  kurikulum: KurikulumSemesterItem[];
}

// ─── KRS Edit API Response ───────────────────────────────────────────────────

export interface KrsEditResponse {
  mahasiswa: KrsMahasiswa;
  krs: KrsData;
  kurikulum: KurikulumSemesterItem[];
}

// ─── KRS Update ─────────────────────────────────────────────────────────────

export interface KrsSksInfo {
  nim: string;
  kode_tahun_akademik: number;
  tahun_akademik: string;
  semester: number;
  sks_limit: number;
  sks_terpakai: number;
  sks_tersisa: number;
  sks_override: boolean;
  sks_override_reason: string | null;
  sks_override_by: string | null;
  pembayaran_lunas: boolean;
}

export interface KrsUpdateRequest {
  semester: number;
  matakuliah: string[];
}

export interface KrsUpdateKrs {
  code: string;
  semester: number;
  tahun_akademik: string;
}

export interface KrsUpdateMatakuliah {
  kode_matakuliah: string;
  nama_matakuliah: string;
  sks: number;
}

export interface KrsUpdateSks {
  limit: number;
  terpakai: number;
  tersisa: number;
}

export interface KrsUpdateResponseData {
  krs: KrsUpdateKrs;
  matakuliah: KrsUpdateMatakuliah[];
  sks: KrsUpdateSks;
}

// ─── KRS Detail API ──────────────────────────────────────────────────────────

export interface KrsDetailRequest {
  matakuliah: string[];
}

export interface KrsDetailMatakuliah {
  kode_matakuliah: string;
  nama_matakuliah: string;
  sks: number;
}

export interface KrsDetailSks {
  limit: number;
  terpakai: number;
  tersisa: number;
}

export interface KrsDetailResponseData {
  krs: KrsUpdateKrs;
  matakuliah: KrsDetailMatakuliah[];
  sks: KrsDetailSks;
}

// ─── Mahasiswa ────────────────────────────────────────────────────────────────

export interface Mahasiswa {
  nim: string;
  nama: string;
  tempatLahir: string;
  tanggalLahir: string; // ISO date string
  jenisKelamin: string;
  agama: string;
  golonganDarah: string;
  alamat: string;
  noHp: string;
  email: string;
  programStudi: string;
  fakultas: string;
  angkatan: number;
  semester: number;
  statusAktif: string;
  dosenWali?: string;
  foto?: string; // URL
  orangTua: OrangTua;
}

// ─── Petikan Nilai ────────────────────────────────────────────────────────────

export interface NilaiItem {
  id: string | number;
  idMatakuliah: string | number;
  semester: number;
  nilaiAkhir: string;
}

export interface MataKuliahPetikanNilai {
  kodeMatakuliah: string;
  namaMatakuliah: string;
  sksTeori: number;
  sksPraktik: number;
  nilai: NilaiItem[];
}

export interface SemesterKurikulum {
  id: string | number;
  semester: number;
  totalSks: number;
  matakuliah: MataKuliahPetikanNilai[];
}

export interface KurikulumInfo {
  id: string | number;
  angkatan: number;
  namaKurikulum: string;
  kodeNamaKurikulum: string;
}

export interface PetikanNilaiData {
  mahasiswa: {
    nim: string;
    namaMahasiswa: string;
    namaProgramStudi: string;
    alamat: string;
    tempatLahir: string;
    tanggalLahir: string;
    telepon: string;
    teleponOrangtua: string;
  };
  kurikulum: KurikulumInfo;
  dataKurikulum: SemesterKurikulum[];
}

// ─── edit ────────────────────────────────────────────────────────────────

type jenisKelamin = "L" | "P";
type agama = "Islam" | "Kristen" | "Katolik" | "Hindu" | "Buddha" | "Konghucu";
type golonganDarah = "A" | "B" | "AB" | "O" | "-";
type kewarganegaraan = "WNI" | "WNA";
type pekerjaan =
  | "Pegawai Negeri Sipil"
  | "Pegawai Swasta"
  | "Wiraswasta"
  | "TNI/Polri"
  | "Dosen"
  | "Guru"
  | "Petani"
  | "Rumah Tangga"
  | "Lainnya";

export interface EditProfileValues {
  nisn: string | null;
  nama_mahasiswa: string;
  tempat_lahir: string | null;
  tanggal_lahir: Date | null;
  alamat: string | null;
  kota: string | null;
  propinsi: string | null;
  telepon: string | null;
  jenis_kelamin: jenisKelamin | null;
  agama: agama | null;
  golongan_darah: golonganDarah | null;
  kewarganegaraan: kewarganegaraan | null;
  nama_instansi: string | null;
  email: string | null;
  nama_ayah: string | null;
  agama_ayah: agama | null;
  pekerjaan_ayah: pekerjaan | null;
  nama_ibu: string | null;
  agama_ibu: agama | null;
  pekerjaan_ibu: pekerjaan | null;
  alamat_orangtua: string | null;
  kota_orangtua: string | null;
  propinsi_orangtua: string | null;
  telepon_orangtua: string | null;
  sandi: string;
}
