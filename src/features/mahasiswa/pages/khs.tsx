import type { KhsEntry, Mahasiswa } from "../types/mahasiswa";
import KhsTable from "../components/organisms/KhsTable";
import KrsInfoCard from "../components/organisms/KrsInfoCard";

// ─── Dummy Data ────────────────────────────────────────────────────────────────

const mahasiswaData: Mahasiswa = {
  nim: "2023010001",
  nama: "Ahmad Fauzi Ramadhan",
  tempatLahir: "Makassar",
  tanggalLahir: "2003-05-14",
  jenisKelamin: "L",
  agama: "Islam",
  golonganDarah: "O",
  alamat: "Jl. Perintis Kemerdekaan No. 45, Makassar, Sulawesi Selatan",
  noHp: "081234567890",
  email: "ahmad.fauzi@mahasiswa.unhas.ac.id",
  programStudi: "Pendidikan Dokter",
  fakultas: "Kedokteran",
  angkatan: 2023,
  semester: 5,
  statusAktif: "Aktif",
  dosenWali: "dr. Nurul Hidayah, M.Kes",
  orangTua: {
    namaAyah: "Ramadhan Syukur",
    pekerjaanAyah: "PNS",
    nohpAyah: "082345678901",
    namaIbu: "Siti Aminah",
    pekerjaanIbu: "Ibu Rumah Tangga",
    nohpIbu: "083456789012",
    alamat: "Jl. Veteran Selatan No. 12, Makassar, Sulawesi Selatan",
  },
};

const khsData: KhsEntry[] = [
  {
    id: "khs-001",
    nim: "2023010001",
    nama: "Ahmad Fauzi Ramadhan",
    semester: 1,
    tahunAjaran: "2023/2024",
    totalSks: 22,
    ipSemester: 3.85,
    ipKumulatif: 3.85,
  },
  {
    id: "khs-002",
    nim: "2023010001",
    nama: "Ahmad Fauzi Ramadhan",
    semester: 2,
    tahunAjaran: "2023/2024",
    totalSks: 22,
    ipSemester: 3.72,
    ipKumulatif: 3.79,
  },
  {
    id: "khs-003",
    nim: "2023010001",
    nama: "Ahmad Fauzi Ramadhan",
    semester: 3,
    tahunAjaran: "2024/2025",
    totalSks: 24,
    ipSemester: 3.60,
    ipKumulatif: 3.72,
  },
  {
    id: "khs-004",
    nim: "2023010001",
    nama: "Ahmad Fauzi Ramadhan",
    semester: 4,
    tahunAjaran: "2024/2025",
    totalSks: 24,
    ipSemester: 3.45,
    ipKumulatif: 3.66,
  },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Khs() {
  function handleDetail(entry: KhsEntry) {
    alert(`Detail KHS Semester ${entry.semester} - T.A. ${entry.tahunAjaran}`);
  }

  function handlePrint(entry: KhsEntry) {
    alert(`Print KHS Semester ${entry.semester} - T.A. ${entry.tahunAjaran}`);
  }

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kartu Hasil Studi</h1>
        <p className="text-sm text-gray-500 mt-1">
          Riwayat hasil studi per semester
        </p>
      </div>

      <KrsInfoCard mahasiswa={mahasiswaData} />
      <KhsTable data={khsData} onDetail={handleDetail} onPrint={handlePrint} />
    </div>
  );
}
