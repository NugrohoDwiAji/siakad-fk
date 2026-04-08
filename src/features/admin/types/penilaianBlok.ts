// ─── Sub Komponen ─────────────────────────────────────────────────────────────

export interface SubKomponen {
  id: string;
  judul: string;
  bobot: number; // persentase (0–100)
}

// ─── Blok ──────────────────────────────────────────────────────────────────────

export interface Blok {
  id: string;
  kode: string;
  nama: string;
  semester: number;
  tahunAjaran: string;
}

// ─── Komponen Penilaian ────────────────────────────────────────────────────────

export interface KomponenPenilaian {
  id: string;
  judul: string;
  bobot: number; // persentase (0–100)
  subKomponen: SubKomponen[];
}
