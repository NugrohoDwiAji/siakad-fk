
import KurikulumCard from "../components/organisms/KurikulumCard";
import type { KurikulumSemester } from "../types/mahasiswa";

// TODO: ganti dengan data dari API
const kurikulumData: KurikulumSemester[] = [
  {
    semester: 1,
    totalSks: 22,
    mataKuliah: [
      { kode: "FK1101", nama: "Biologi Sel dan Molekuler", sksTeori: 3, sksPraktek: 1 },
      { kode: "FK1102", nama: "Kimia Kedokteran", sksTeori: 2, sksPraktek: 1 },
      { kode: "FK1103", nama: "Anatomi Dasar", sksTeori: 3, sksPraktek: 1 },
      { kode: "FK1104", nama: "Fisika Medik", sksTeori: 2, sksPraktek: 1 },
      { kode: "FK1105", nama: "Praktikum Anatomi", sksTeori: 0, sksPraktek: 2 },
      { kode: "FK1106", nama: "Pendidikan Agama", sksTeori: 2, sksPraktek: 0 },
      { kode: "FK1107", nama: "Bahasa Indonesia", sksTeori: 2, sksPraktek: 0 },
      { kode: "FK1108", nama: "Bahasa Inggris Medis", sksTeori: 2, sksPraktek: 0 },
    ],
  },
  {
    semester: 2,
    totalSks: 22,
    mataKuliah: [
      { kode: "FK1201", nama: "Histologi", sksTeori: 3, sksPraktek: 1 },
      { kode: "FK1202", nama: "Fisiologi I", sksTeori: 3, sksPraktek: 1 },
      { kode: "FK1203", nama: "Biokimia Dasar", sksTeori: 2, sksPraktek: 1 },
      { kode: "FK1204", nama: "Praktikum Histologi", sksTeori: 0, sksPraktek: 2 },
      { kode: "FK1205", nama: "Praktikum Biokimia", sksTeori: 0, sksPraktek: 2 },
      { kode: "FK1206", nama: "Ilmu Kesehatan Masyarakat I", sksTeori: 2, sksPraktek: 1 },
      { kode: "FK1207", nama: "Pancasila & Kewarganegaraan", sksTeori: 2, sksPraktek: 0 },
      { kode: "FK1208", nama: "Etika & Hukum Kedokteran", sksTeori: 2, sksPraktek: 0 },
    ],
  },
  {
    semester: 3,
    totalSks: 24,
    mataKuliah: [
      { kode: "FK2101", nama: "Patologi Anatomi I", sksTeori: 3, sksPraktek: 1 },
      { kode: "FK2102", nama: "Mikrobiologi Dasar", sksTeori: 2, sksPraktek: 1 },
      { kode: "FK2103", nama: "Fisiologi II", sksTeori: 3, sksPraktek: 1 },
      { kode: "FK2104", nama: "Farmakologi Dasar", sksTeori: 2, sksPraktek: 1 },
      { kode: "FK2105", nama: "Praktikum Mikrobiologi", sksTeori: 0, sksPraktek: 2 },
      { kode: "FK2106", nama: "Praktikum Farmakologi", sksTeori: 0, sksPraktek: 2 },
      { kode: "FK2107", nama: "Parasitologi", sksTeori: 2, sksPraktek: 1 },
      { kode: "FK2108", nama: "Bahasa Inggris Lanjut", sksTeori: 2, sksPraktek: 1 },
    ],
  },
  {
    semester: 4,
    totalSks: 24,
    mataKuliah: [
      { kode: "FK2201", nama: "Patologi Anatomi II", sksTeori: 3, sksPraktek: 1 },
      { kode: "FK2202", nama: "Farmakologi Klinik", sksTeori: 2, sksPraktek: 1 },
      { kode: "FK2203", nama: "Radiologi Dasar", sksTeori: 2, sksPraktek: 1 },
      { kode: "FK2204", nama: "Patologi Klinik", sksTeori: 3, sksPraktek: 1 },
      { kode: "FK2205", nama: "Praktikum Patologi Klinik", sksTeori: 0, sksPraktek: 2 },
      { kode: "FK2206", nama: "Imunologi", sksTeori: 2, sksPraktek: 1 },
      { kode: "FK2207", nama: "Metodologi Penelitian", sksTeori: 2, sksPraktek: 1 },
      { kode: "FK2208", nama: "Biostatistik", sksTeori: 2, sksPraktek: 0 },
    ],
  },
];

// Semester aktif mahasiswa — TODO: ambil dari data sesi
const SEMESTER_AKTIF = 4;

export default function Kurikulum() {
  const totalSksKeseluruhan = kurikulumData.reduce((sum, s) => sum + s.totalSks, 0);
  const totalMataKuliah = kurikulumData.reduce((sum, s) => sum + s.mataKuliah.length, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Kurikulum</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Daftar mata kuliah per semester program studi Pendidikan Dokter
        </p>
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total Semester", value: kurikulumData.length },
          { label: "Total Mata Kuliah", value: totalMataKuliah },
          { label: "Total SKS", value: totalSksKeseluruhan },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white border border-gray-200 rounded-lg px-4 py-3 min-w-32"
          >
            <p className="text-xs text-gray-500">{item.label}</p>
            <p className="text-xl font-bold text-brand-800">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Kurikulum cards */}
      <div className="flex flex-col gap-3">
        {kurikulumData.map((semester) => (
          <KurikulumCard
            key={semester.semester}
            data={semester}
            semesterAktif={SEMESTER_AKTIF}
            defaultOpen={semester.semester === SEMESTER_AKTIF}
          />
        ))}
      </div>
    </div>
  );
}

