// ─── Komponen Sumatif (recursive, max 5 tiers) ────────────────────────────────

export interface KomponenSumatif {
  key: string;
  name: string;
  weight: number;           // persentase relatif terhadap parent (0–100)
  type: "category" | "input";
  children: KomponenSumatif[];
}

// ─── Penilaian Sumatif per Mata Kuliah ────────────────────────────────────────

export interface PenilaianSumatif {
  mataKuliahId: string;
  komponen: KomponenSumatif[];
}

// ─── Mata Kuliah ──────────────────────────────────────────────────────────────

export interface MataKuliah {
  id: string;
  kode: string;
  nama: string;
  semester: number;        // 1–7
  sksTeori: number;
  sksPraktek: number;
  status: "aktif" | "tidak_aktif";
}

// ─── Kurikulum (header / program studi) ───────────────────────────────────────

export interface Kurikulum {
  id: string;
  nama: string;           // e.g. "Kurikulum 2023"
  programStudi: string;
  tahunBerlaku: number;
  status: "aktif" | "tidak_aktif";
}
