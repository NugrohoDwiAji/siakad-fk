import type {
  DosenMyAssessmentNodeItem,
  DosenPenilaianKelasItem,
  DosenPenilaianTemplateData,
  DosenPenilaianMahasiswaItem,
  DosenPenilaianMahasiswaDetailData,
  PenilaianTreeStructureNode,
  DosenInputNilaiPayload,
  DosenInputNilaiResultItem,
} from "@/features/dosen/types";

// ─── 0. Mock My Assessment Nodes ─────────────────────────────────────────────

export const MOCK_MY_ASSESSMENT_NODES: DosenMyAssessmentNodeItem[] = [
  {
    assessment_dosen_id: 1,
    code_kelas: "eyJpdiI6InRlc3QxIiwidmFsdWUiOiJLTFMtMDEtQSJ9",
    nama_kelas: "Kelas A",
    matakuliah: "Blok 1.1: Pengantar Pendidikan Kedokteran & Bioetika",
    node_key: "kompetensi_inti",
  },
  {
    assessment_dosen_id: 2,
    code_kelas: "eyJpdiI6InRlc3QxIiwidmFsdWUiOiJLTFMtMDEtQSJ9",
    nama_kelas: "Kelas A",
    matakuliah: "Blok 1.1: Pengantar Pendidikan Kedokteran & Bioetika",
    node_key: "osce",
  },
  {
    assessment_dosen_id: 3,
    code_kelas: "eyJpdiI6InRlc3QyIiwidmFsdWUiOiJLTFMtMDItQiJ9",
    nama_kelas: "Kelas B",
    matakuliah: "Blok 1.2: Biomedik Dasar & Biologi Sel Kedokteran",
    node_key: "praktikum",
  },
];

// ─── 1. Mock Classes for Tree Penilaian ────────────────────────────────────────

export const MOCK_PENILAIAN_KELAS: DosenPenilaianKelasItem[] = [
  {
    code_kelas: "KLS-FK-01-A",
    nama_kelas: "Kelas A (Reguler)",
    semester: 1,
    tahun_akademik: "2024/2025 Ganjil",
    nama_program_studi: "Kedokteran (S1)",
    kode_matakuliah: "FK1101",
    nama_matakuliah: "Blok 1.1: Pengantar Pendidikan Kedokteran & Bioetika",
    block: true,
    jumlah_mahasiswa: 20,
    sudah_input: 16,
    sudah_validasi: 12,
    belum_input: 4,
  },
  {
    code_kelas: "KLS-FK-02-B",
    nama_kelas: "Kelas B (Reguler)",
    semester: 1,
    tahun_akademik: "2024/2025 Ganjil",
    nama_program_studi: "Kedokteran (S1)",
    kode_matakuliah: "FK1102",
    nama_matakuliah: "Blok 1.2: Biomedik Dasar & Biologi Sel Kedokteran",
    block: true,
    jumlah_mahasiswa: 18,
    sudah_input: 18,
    sudah_validasi: 18,
    belum_input: 0,
  },
  {
    code_kelas: "KLS-FK-03-A",
    nama_kelas: "Kelas A (Reguler)",
    semester: 3,
    tahun_akademik: "2024/2025 Ganjil",
    nama_program_studi: "Kedokteran (S1)",
    kode_matakuliah: "FK2101",
    nama_matakuliah: "Blok 2.1: Sistem Kardiovaskular & Hemato-Imunologi",
    block: true,
    jumlah_mahasiswa: 22,
    sudah_input: 22,
    sudah_validasi: 0,
    belum_input: 0,
  },
  {
    code_kelas: "KLS-FK-04-A",
    nama_kelas: "Kelas A (Reguler)",
    semester: 5,
    tahun_akademik: "2024/2025 Ganjil",
    nama_program_studi: "Kedokteran (S1)",
    kode_matakuliah: "FK3102",
    nama_matakuliah: "Blok 3.2: Sistem Respirasi & Kegawatdaruratan Paru",
    block: true,
    jumlah_mahasiswa: 15,
    sudah_input: 7,
    sudah_validasi: 0,
    belum_input: 8,
  },
  {
    code_kelas: "KLS-FK-05-R",
    nama_kelas: "Kelas Reguler Semester 7",
    semester: 7,
    tahun_akademik: "2024/2025 Ganjil",
    nama_program_studi: "Kedokteran (S1)",
    kode_matakuliah: "FK4105",
    nama_matakuliah: "Metodologi Penelitian Kedokteran & Biostatistik",
    block: false,
    jumlah_mahasiswa: 16,
    sudah_input: 0,
    sudah_validasi: 0,
    belum_input: 16,
  },
];

// ─── 2. Mock Tree Assessment Templates ────────────────────────────────────────

const TEMPLATES: Record<string, DosenPenilaianTemplateData> = {
  "KLS-FK-01-A": {
    template_id: 101,
    code_matakuliah: "MK-FK-1101",
    kode_matakuliah: "FK1101",
    nama_matakuliah: "Blok 1.1: Pengantar Pendidikan Kedokteran & Bioetika",
    structure: {
      key: "root_101",
      name: "Blok 1.1: Pengantar Pendidikan Kedokteran & Bioetika",
      weight: 100,
      type: "category",
      children: [
        {
          key: "teori_cbt",
          name: "Ujian Kognitif & Teori CBT",
          weight: 40,
          type: "category",
          children: [
            {
              key: "cbt_formatif",
              name: "MCQ CBT Formatif (Tengah Blok)",
              weight: 15,
              type: "input",
            },
            {
              key: "cbt_sumatif",
              name: "MCQ CBT Sumatif (Akhir Blok)",
              weight: 25,
              type: "input",
            },
          ],
        },
        {
          key: "skills_lab",
          name: "Keterampilan Klinis (Skills Lab)",
          weight: 35,
          type: "category",
          children: [
            {
              key: "osce_anamnesis",
              name: "OSCE Anamnesis Medis & Komunikasi",
              weight: 20,
              type: "input",
            },
            {
              key: "osce_pe_dasar",
              name: "OSCE Pemeriksaan Fisik Dasar",
              weight: 15,
              type: "input",
            },
          ],
        },
        {
          key: "tutorial_pbl",
          name: "Aktivitas Diskusi PBL & Pleno",
          weight: 25,
          type: "category",
          children: [
            {
              key: "pbl_keaktifan",
              name: "Diskusi Tutorial PBL (Skenario 1-4)",
              weight: 15,
              type: "input",
            },
            {
              key: "pleno_etika",
              name: "Laporan Pleno Kasus Bioetika",
              weight: 10,
              type: "input",
            },
          ],
        },
      ],
    },
    leaf_nodes: [
      { key: "cbt_formatif", name: "MCQ CBT Formatif (Tengah Blok)", weight: 15, type: "input" },
      { key: "cbt_sumatif", name: "MCQ CBT Sumatif (Akhir Blok)", weight: 25, type: "input" },
      { key: "osce_anamnesis", name: "OSCE Anamnesis Medis & Komunikasi", weight: 20, type: "input" },
      { key: "osce_pe_dasar", name: "OSCE Pemeriksaan Fisik Dasar", weight: 15, type: "input" },
      { key: "pbl_keaktifan", name: "Diskusi Tutorial PBL (Skenario 1-4)", weight: 15, type: "input" },
      { key: "pleno_etika", name: "Laporan Pleno Kasus Bioetika", weight: 10, type: "input" },
    ],
  },

  "KLS-FK-02-B": {
    template_id: 102,
    code_matakuliah: "MK-FK-1102",
    kode_matakuliah: "FK1102",
    nama_matakuliah: "Blok 1.2: Biomedik Dasar & Biologi Sel Kedokteran",
    structure: {
      key: "root_102",
      name: "Blok 1.2: Biomedik Dasar & Biologi Sel",
      weight: 100,
      type: "category",
      children: [
        {
          key: "teori_biomedik",
          name: "Teori Biomedik & Biologi Molekuler",
          weight: 45,
          type: "category",
          children: [
            {
              key: "cbt_part1",
              name: "Ujian CBT Bagian 1 (Biologi Molekuler)",
              weight: 20,
              type: "input",
            },
            {
              key: "cbt_part2",
              name: "Ujian CBT Bagian 2 (Genetika & Biokimia)",
              weight: 25,
              type: "input",
            },
          ],
        },
        {
          key: "praktikum_lab",
          name: "Praktikum Laboratorium Biomedik",
          weight: 35,
          type: "category",
          children: [
            {
              key: "praktikum_mikro",
              name: "Responsi Mikroskopis & Histologi Dasar",
              weight: 20,
              type: "input",
            },
            {
              key: "pretest_lap",
              name: "Pre-Test & Laporan Praktikum",
              weight: 15,
              type: "input",
            },
          ],
        },
        {
          key: "penugasan",
          name: "Tugas Mandiri & Tutorial",
          weight: 20,
          type: "category",
          children: [
            {
              key: "makalah_biomed",
              name: "Presentasi Makalah Terapan",
              weight: 10,
              type: "input",
            },
            {
              key: "diskusi_tutorial",
              name: "Tutorial Kasus Biomedis",
              weight: 10,
              type: "input",
            },
          ],
        },
      ],
    },
    leaf_nodes: [
      { key: "cbt_part1", name: "Ujian CBT Bagian 1 (Biologi Molekuler)", weight: 20, type: "input" },
      { key: "cbt_part2", name: "Ujian CBT Bagian 2 (Genetika & Biokimia)", weight: 25, type: "input" },
      { key: "praktikum_mikro", name: "Responsi Mikroskopis & Histologi Dasar", weight: 20, type: "input" },
      { key: "pretest_lap", name: "Pre-Test & Laporan Praktikum", weight: 15, type: "input" },
      { key: "makalah_biomed", name: "Presentasi Makalah Terapan", weight: 10, type: "input" },
      { key: "diskusi_tutorial", name: "Tutorial Kasus Biomedis", weight: 10, type: "input" },
    ],
  },

  "KLS-FK-03-A": {
    template_id: 103,
    code_matakuliah: "MK-FK-2101",
    kode_matakuliah: "FK2101",
    nama_matakuliah: "Blok 2.1: Sistem Kardiovaskular & Hemato-Imunologi",
    structure: {
      key: "root_103",
      name: "Blok 2.1: Sistem Kardiovaskular",
      weight: 100,
      type: "category",
      children: [
        {
          key: "teori_kardio",
          name: "Ujian Teori CBT Kardiovaskular",
          weight: 40,
          type: "category",
          children: [
            {
              key: "cbt_kardio",
              name: "MCQ CBT Sumatif Kardiovaskular",
              weight: 40,
              type: "input",
            },
          ],
        },
        {
          key: "skills_kardio",
          name: "Skills Lab & OSCE Kardiovaskular",
          weight: 40,
          type: "category",
          children: [
            {
              key: "osce_jantung",
              name: "OSCE Pemeriksaan Jantung & Thorax",
              weight: 20,
              type: "input",
            },
            {
              key: "osce_ekg",
              name: "OSCE Interpretasi EKG & RJP Dasar",
              weight: 20,
              type: "input",
            },
          ],
        },
        {
          key: "pbl_kardio_group",
          name: "Tutorial PBL & Presentasi Kasus",
          weight: 20,
          type: "category",
          children: [
            {
              key: "pbl_kardio",
              name: "Nilai Tutorial Skenario Nyeri Dada",
              weight: 15,
              type: "input",
            },
            {
              key: "porto_ekg",
              name: "Portofolio Analisis Kasus EKG",
              weight: 5,
              type: "input",
            },
          ],
        },
      ],
    },
    leaf_nodes: [
      { key: "cbt_kardio", name: "MCQ CBT Sumatif Kardiovaskular", weight: 40, type: "input" },
      { key: "osce_jantung", name: "OSCE Pemeriksaan Jantung & Thorax", weight: 20, type: "input" },
      { key: "osce_ekg", name: "OSCE Interpretasi EKG & RJP Dasar", weight: 20, type: "input" },
      { key: "pbl_kardio", name: "Nilai Tutorial Skenario Nyeri Dada", weight: 15, type: "input" },
      { key: "porto_ekg", name: "Portofolio Analisis Kasus EKG", weight: 5, type: "input" },
    ],
  },
};

// Generic fallback template generator for any other class
function createGenericTemplate(codeKelas: string): DosenPenilaianTemplateData {
  const k = MOCK_PENILAIAN_KELAS.find((item) => item.code_kelas === codeKelas);
  const mkName = k?.nama_matakuliah || "Mata Kuliah Penilaian";
  const mkKode = k?.kode_matakuliah || "MK001";

  return {
    template_id: 199,
    code_matakuliah: `MK-${mkKode}`,
    kode_matakuliah: mkKode,
    nama_matakuliah: mkName,
    structure: {
      key: "root_generic",
      name: mkName,
      weight: 100,
      type: "category",
      children: [
        {
          key: "teori_cbt",
          name: "Ujian Teori CBT",
          weight: 40,
          type: "category",
          children: [
            { key: "cbt_sumatif", name: "Ujian CBT Sumatif", weight: 40, type: "input" },
          ],
        },
        {
          key: "praktikum_skills",
          name: "Praktikum & Keterampilan Klinis",
          weight: 40,
          type: "category",
          children: [
            { key: "osce_klinis", name: "Ujian OSCE / Keterampilan Klinis", weight: 25, type: "input" },
            { key: "responsi_lab", name: "Responsi & Praktikum Laboratorium", weight: 15, type: "input" },
          ],
        },
        {
          key: "tugas_tutorial",
          name: "Tugas & Partisipasi Tutorial",
          weight: 20,
          type: "category",
          children: [
            { key: "tutorial_diskusi", name: "Nilai Keaktifan Tutorial PBL", weight: 15, type: "input" },
            { key: "laporan_tugas", name: "Laporan & Refleksi", weight: 5, type: "input" },
          ],
        },
      ],
    },
    leaf_nodes: [
      { key: "cbt_sumatif", name: "Ujian CBT Sumatif", weight: 40, type: "input" },
      { key: "osce_klinis", name: "Ujian OSCE / Keterampilan Klinis", weight: 25, type: "input" },
      { key: "responsi_lab", name: "Responsi & Praktikum Laboratorium", weight: 15, type: "input" },
      { key: "tutorial_diskusi", name: "Nilai Keaktifan Tutorial PBL", weight: 15, type: "input" },
      { key: "laporan_tugas", name: "Laporan & Refleksi", weight: 5, type: "input" },
    ],
  };
}

export function getMockTemplate(codeKelas: string): DosenPenilaianTemplateData {
  return TEMPLATES[codeKelas] || createGenericTemplate(codeKelas);
}

// ─── 3. Mock Students & Grades Data Store ─────────────────────────────────────

interface StudentScoreRecord {
  code_mahasiswa: string;
  nim: string;
  nama_mahasiswa: string;
  status_mahasiswa: string;
  status_penilaian: "valid" | "proses" | "revisi" | "belum_input";
  scores: Record<string, number>;
  catatan_dosen?: string | null;
  catatan_kaprodi?: string | null;
}

const RAW_STUDENTS: { nim: string; nama: string }[] = [
  { nim: "240101001", nama: "Muhammad Rayhan Pratama" },
  { nim: "240101002", nama: "Siti Nur Aisyah" },
  { nim: "240101003", nama: "Kevin Aditya Wijaya" },
  { nim: "240101004", nama: "Farah Diba Azzahra" },
  { nim: "240101005", nama: "Dimas Arya Saputra" },
  { nim: "240101006", nama: "Putri Amanda Sari" },
  { nim: "240101007", nama: "Faisal Rahman Hakim" },
  { nim: "240101008", nama: "Nabila Khairunnisa" },
  { nim: "240101009", nama: "Bagus Tri Nugroho" },
  { nim: "240101010", nama: "Zahra Maulida Ulfa" },
  { nim: "240101011", nama: "Ilham Ramadhan Al-Farizi" },
  { nim: "240101012", nama: "Dewi Anggraini Puspita" },
  { nim: "240101013", nama: "Rizky Dwi Mahendra" },
  { nim: "240101014", nama: "Anisa Fitriani Putri" },
  { nim: "240101015", nama: "Alif Hidayatullah" },
  { nim: "240101016", nama: "Tiara Melati Kusuma" },
  { nim: "240101017", nama: "Raka Danendra Putra" },
  { nim: "240101018", nama: "Gita Savitri Wulandari" },
  { nim: "240101019", nama: "Bayu Aji Pamungkas" },
  { nim: "240101020", nama: "Nadya Cindy Pratiwi" },
];

// Persistent in-memory store for student scores per class
const storeByKelas: Record<string, StudentScoreRecord[]> = {};

function initKelasStudents(codeKelas: string): StudentScoreRecord[] {
  if (storeByKelas[codeKelas]) {
    return storeByKelas[codeKelas];
  }

  const template = getMockTemplate(codeKelas);
  const leafKeys = template.leaf_nodes.map((l) => l.key);

  const k = MOCK_PENILAIAN_KELAS.find((item) => item.code_kelas === codeKelas);
  const count = k ? Math.min(k.jumlah_mahasiswa, RAW_STUDENTS.length) : 20;

  const records: StudentScoreRecord[] = [];

  for (let i = 0; i < count; i++) {
    const raw = RAW_STUDENTS[i];
    const codeMhs = `MHS-${codeKelas}-${raw.nim}`;

    let status: "valid" | "proses" | "revisi" | "belum_input" = "belum_input";
    const scores: Record<string, number> = {};
    let catatanDosen: string | null = null;
    let catatanKaprodi: string | null = null;

    if (codeKelas === "KLS-FK-02-B") {
      // Fully validated class
      status = "valid";
      leafKeys.forEach((key) => {
        scores[key] = Math.round(78 + ((i * 7 + key.length * 3) % 21));
      });
      catatanKaprodi = "Nilai telah divalidasi dan disetujui Kaprodi.";
    } else if (codeKelas === "KLS-FK-03-A") {
      // All inputted, waiting validation
      status = "proses";
      leafKeys.forEach((key) => {
        scores[key] = Math.round(75 + ((i * 5 + key.length * 2) % 22));
      });
      catatanDosen = "Selesai diinput oleh dosen pengampu.";
    } else if (codeKelas === "KLS-FK-05-R") {
      // Nothing inputted
      status = "belum_input";
    } else {
      // KLS-FK-01-A or KLS-FK-04-A: Mixed progress
      if (i < 12) {
        status = "valid";
        leafKeys.forEach((key) => {
          scores[key] = Math.round(80 + ((i * 6 + key.length * 4) % 19));
        });
        catatanKaprodi = "Disetujui Kaprodi.";
      } else if (i < 15) {
        status = "proses";
        // Fill half nodes
        leafKeys.slice(0, Math.ceil(leafKeys.length / 2)).forEach((key) => {
          scores[key] = Math.round(72 + ((i * 4 + key.length) % 20));
        });
        catatanDosen = "Input nilai tahap 1 selesai.";
      } else if (i === 15) {
        status = "revisi";
        leafKeys.forEach((key) => {
          scores[key] = Math.round(62 + ((i * 3 + key.length) % 15));
        });
        catatanDosen = "Perlu remidial pada stase OSCE dan CBT.";
        catatanKaprodi = "Harap dosen melakukan evaluasi remedial sebelum submit ulang.";
      } else {
        status = "belum_input";
      }
    }

    records.push({
      code_mahasiswa: codeMhs,
      nim: raw.nim,
      nama_mahasiswa: raw.nama,
      status_mahasiswa: "Aktif",
      status_penilaian: status,
      scores,
      catatan_dosen: catatanDosen,
      catatan_kaprodi: catatanKaprodi,
    });
  }

  storeByKelas[codeKelas] = records;
  return records;
}

// ─── 4. Public API Methods for Penilaian ───────────────────────────────────────

export function getMockMahasiswaPenilaian(codeKelas: string): DosenPenilaianMahasiswaItem[] {
  const records = initKelasStudents(codeKelas);
  const template = getMockTemplate(codeKelas);
  const totalNodes = template.leaf_nodes.length;

  return records.map((r) => {
    const filledCount = Object.keys(r.scores).length;

    // Calculate weighted final score
    let finalScore: number | null = null;
    if (filledCount > 0) {
      let sum = 0;
      let totalW = 0;
      template.leaf_nodes.forEach((leaf) => {
        const sc = r.scores[leaf.key];
        if (sc != null) {
          sum += (sc * leaf.weight) / 100;
          totalW += leaf.weight;
        }
      });
      finalScore = totalW > 0 ? Number(((sum / totalW) * 100).toFixed(2)) : null;
    }

    return {
      code_mahasiswa: r.code_mahasiswa,
      nim: r.nim,
      nama_mahasiswa: r.nama_mahasiswa,
      status_mahasiswa: r.status_mahasiswa,
      status_penilaian: r.status_penilaian,
      nilai_akhir: finalScore,
      catatan_dosen: r.catatan_dosen ?? null,
      catatan_kaprodi: r.catatan_kaprodi ?? null,
      sudah_diisi: filledCount,
      total_nodes: totalNodes,
    };
  });
}

function attachScoresToTree(
  node: PenilaianTreeStructureNode,
  scores: Record<string, number>
): PenilaianTreeStructureNode {
  const clone = { ...node };

  if (clone.children && clone.children.length > 0) {
    clone.children = clone.children.map((ch) => attachScoresToTree(ch, scores));

    // Calculate subtotal for category
    let subtotal = 0;
    let filled = 0;
    let total = 0;

    clone.children.forEach((ch) => {
      if (ch.type === "input") {
        total += 1;
        if (ch.score != null) {
          filled += 1;
          subtotal += (ch.score * ch.weight) / 100;
        }
      } else if (ch.calculated_score != null) {
        filled += ch.filled_count || 0;
        total += ch.total_nodes || 0;
        subtotal += (ch.calculated_score * ch.weight) / 100;
      }
    });

    clone.calculated_score = Number(subtotal.toFixed(2));
    clone.filled_count = filled;
    clone.total_nodes = total;
  } else {
    // Leaf node
    const sc = scores[clone.key];
    clone.score = sc != null ? sc : null;
    clone.calculated_score = sc != null ? Number(((sc * clone.weight) / 100).toFixed(2)) : null;
    clone.filled_count = sc != null ? 1 : 0;
    clone.total_nodes = 1;
  }

  return clone;
}

export function getMockDetailMahasiswaPenilaian(
  codeKelas: string,
  codeMahasiswa: string
): DosenPenilaianMahasiswaDetailData {
  const records = initKelasStudents(codeKelas);
  const rec =
    records.find(
      (r) => r.code_mahasiswa === codeMahasiswa || r.nim === codeMahasiswa
    ) || records[0];

  const template = getMockTemplate(codeKelas);
  const scores = rec ? rec.scores : { nilai_harian: 80.5, uts: 75, uas: 85 };
  const treeWithScores = attachScoresToTree(template.structure, scores);

  return {
    code_mahasiswa: rec?.code_mahasiswa || codeMahasiswa,
    nim: rec?.nim || "25XXXXXXXXX",
    nama_mahasiswa: rec?.nama_mahasiswa || "Nama Lengkap",
    template_id: template.template_id || 1,
    structure: treeWithScores,
  };
}

export function saveMockInputNilai(
  payload: DosenInputNilaiPayload
): DosenInputNilaiResultItem[] {
  const records = initKelasStudents(payload.code_kelas);
  const results: DosenInputNilaiResultItem[] = [];

  payload.mahasiswa.forEach((mhsInput) => {
    const target = records.find((r) => r.code_mahasiswa === mhsInput.code_mahasiswa);
    if (target) {
      mhsInput.scores.forEach((sc) => {
        if (sc.score != null) {
          target.scores[sc.node_key] = Number(sc.score);
        }
      });
      if (mhsInput.catatan !== undefined) {
        target.catatan_dosen = mhsInput.catatan;
      }
      if (target.status_penilaian === "belum_input") {
        target.status_penilaian = "proses";
      }

      results.push({
        code_mahasiswa: target.code_mahasiswa,
        nim: target.nim,
        nama_mahasiswa: target.nama_mahasiswa,
        status: "success",
      });
    }
  });

  return results;
}
