
import type { KrsEntry, Mahasiswa } from "../types/mahasiswa";
import KrsTable from "../components/organisms/KrsTable";
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

const krsData: KrsEntry[] = [
  {
    id: "krs-001",
    nim: "2023010001",
    nama: "Ahmad Fauzi Ramadhan",
    semester: 1,
    tahunAjaran: "2023/2024",
    totalSks: 22,
    validasi: { dosenWali: "Tervalidasi", keuangan: "Tervalidasi" },
  },
  {
    id: "krs-002",
    nim: "2023010001",
    nama: "Ahmad Fauzi Ramadhan",
    semester: 2,
    tahunAjaran: "2023/2024",
    totalSks: 22,
    validasi: { dosenWali: "Tervalidasi", keuangan: "Tervalidasi" },
  },
  {
    id: "krs-003",
    nim: "2023010001",
    nama: "Ahmad Fauzi Ramadhan",
    semester: 3,
    tahunAjaran: "2024/2025",
    totalSks: 24,
    validasi: { dosenWali: "Tervalidasi", keuangan: "Tervalidasi" },
  },
  {
    id: "krs-004",
    nim: "2023010001",
    nama: "Ahmad Fauzi Ramadhan",
    semester: 4,
    tahunAjaran: "2024/2025",
    totalSks: 24,
    validasi: { dosenWali: "Menunggu", keuangan: "Tervalidasi" },
  },
  {
    id: "krs-005",
    nim: "2023010001",
    nama: "Ahmad Fauzi Ramadhan",
    semester: 5,
    tahunAjaran: "2025/2026",
    totalSks: 20,
    validasi: { dosenWali: "Menunggu", keuangan: "Menunggu" },
  },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Krs() {
  function handleDetail(entry: KrsEntry) {
    alert(`Detail KRS Semester ${entry.semester} - T.A. ${entry.tahunAjaran}`);
  }

  function handlePrint(entry: KrsEntry) {
    alert(`Print KRS Semester ${entry.semester} - T.A. ${entry.tahunAjaran}`);
  }

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kartu Rencana Studi</h1>
        <p className="text-sm text-gray-500 mt-1">
          Riwayat pengajuan KRS per semester
        </p>
      </div>

      <KrsInfoCard mahasiswa={mahasiswaData} />
      <KrsTable data={krsData} onDetail={handleDetail} onPrint={handlePrint} />
    </div>
  );
}

