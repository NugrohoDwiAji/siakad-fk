export interface MataKuliah {
  kode: string;
  nama: string;
  sksTeori: number;
  sksPraktek: number;
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

export interface KhsEntry {
  id: string;
  nim: string;
  nama: string;
  semester: number;
  tahunAjaran: string;
  totalSks: number;
  ipSemester: number;
  ipKumulatif: number;
}

// ─── KRS ─────────────────────────────────────────────────────────────────────

export type StatusValidasi = "Tervalidasi" | "Menunggu" | "Ditolak";

export interface KrsEntry {
  id: string;
  nim: string;
  nama: string;
  semester: number;
  tahunAjaran: string;
  totalSks: number;
  validasi: {
    dosenWali: StatusValidasi;
    keuangan: StatusValidasi;
  };
}

// ─── Mahasiswa ────────────────────────────────────────────────────────────────

export interface Mahasiswa {
  nim: string;
  nama: string;
  tempatLahir: string;
  tanggalLahir: string; // ISO date string
  jenisKelamin: "L" | "P";
  agama: string;
  golonganDarah: string;
  alamat: string;
  noHp: string;
  email: string;
  programStudi: string;
  fakultas: string;
  angkatan: number;
  semester: number;
  statusAktif: "Aktif" | "Cuti" | "Lulus" | "Keluar";
  dosenWali?: string;
  foto?: string; // URL
  orangTua: OrangTua;
}
