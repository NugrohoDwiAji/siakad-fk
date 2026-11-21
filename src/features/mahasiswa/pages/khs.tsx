import type { KhsEntry, Mahasiswa } from "@/features/mahasiswa/types";
import KhsTable from "../components/organisms/KhsTable";
import KhsInfoCard from "../components/organisms/KhsInfoCard";
import { useState, useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/stores/configStore";
import { getKhs } from "@/features/mahasiswa/api/khs";
import { getSemesterList } from "@/features/mahasiswa/api/semester";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { getSemester } from "@/utils/mahasiswa";
import { setProfilMahasiswa } from "../store/mahasiswaSlice";
import type { User } from "@/features/auth/types";

// ─── Raw API types ────────────────────────────────────────────────────────────

interface RawMataKuliahItem {
  id?: string | number;
  code?: string;
  kode_matakuliah?: string;
  nama_matakuliah?: string;
  sks_teori?: number;
  sks_praktik?: number;
  nilai_akhir?: string;
}

interface RawMahasiswaItem {
  id?: string | number;
  nim?: string;
  nama?: string;
  nama_mahasiswa?: string;
  nama_program_studi?: string;
  semester?: string | number;
  tahun_ajaran?: string;
  tahunAjaran?: string;
  [key: string]: unknown;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapUserToMahasiswa(user: User): Mahasiswa {
  const statusAktif = ["Cuti", "Lulus", "Keluar"].includes(user.status)
    ? (user.status as "Cuti" | "Lulus" | "Keluar")
    : "Aktif";

  return {
    nim: user.nim || "-",
    nama: user.nama_mahasiswa || "-",
    tempatLahir: user.tempat_lahir || "-",
    tanggalLahir: user.tanggal_lahir || "-",
    jenisKelamin: user.jenis_kelamin || "-",
    agama: user.agama || "-",
    golonganDarah: user.golongan_darah || "-",
    alamat: user.alamat || "-",
    noHp: user.telepon || "-",
    email: user.email || "-",
    programStudi: "S1 Kedokteran",
    fakultas: "Fakultas Kedokteran",
    angkatan: user.nim ? parseInt(`20${user.nim.substring(0, 2)}`) : 0,
    semester: user.nim ? getSemester(user.nim) : 0,
    statusAktif,
    foto: user.foto || undefined,
    orangTua: {
      namaAyah: user.nama_ayah || "-",
      pekerjaanAyah: user.pekerjaan_ayah || "-",
      nohpAyah: user.telepon_orangtua || "-",
      namaIbu: user.nama_ibu || "-",
      pekerjaanIbu: user.pekerjaan_ibu || "-",
      nohpIbu: user.telepon_orangtua || "-",
      alamat: user.alamat_orangtua || "-",
    },
  };
}

function getGrade(nilai: string): string {
  const n = Number(nilai);
  if (n >= 85) return "A";
  if (n >= 80) return "B+";
  if (n >= 75) return "B";
  if (n >= 70) return "C+";
  if (n >= 65) return "C";
  if (n >= 50) return "D";
  return "E";
}

function getKeterangan(nilai: string): string {
  return Number(nilai) >= 65 ? "Lulus" : "Tidak Lulus";
}

// ─── Normalize ────────────────────────────────────────────────────────────────

function normalizeKhsData(raw: unknown): KhsEntry | null {
  if (!raw) return null;
  const obj =
    typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : null;

  let krsItems: RawMataKuliahItem[] = [];
  let mhs: RawMahasiswaItem | undefined;

  if (obj && Array.isArray(obj.khs) && obj.mahasiswa) {
    krsItems = obj.khs as RawMataKuliahItem[];
    mhs = (obj.mahasiswa as RawMahasiswaItem[])[0];
  } else if (obj && Array.isArray(obj.data)) {
    const firstItem = obj.data[0];
    if (
      firstItem &&
      typeof firstItem === "object" &&
      (Array.isArray((firstItem as Record<string, unknown>).khs) ||
        Array.isArray((firstItem as Record<string, unknown>).krs))
    ) {
      for (const entry of obj.data as Record<string, unknown>[]) {
        const items = entry.khs || entry.krs;
        if (Array.isArray(items)) {
          krsItems.push(...(items as RawMataKuliahItem[]));
          if (!mhs && Array.isArray(entry.mahasiswa)) {
            mhs = (entry.mahasiswa as RawMahasiswaItem[])[0];
          }
        }
      }
    }
  } else if (Array.isArray(raw)) {
    const firstItem = raw[0];
    if (
      firstItem &&
      typeof firstItem === "object" &&
      (Array.isArray((firstItem as Record<string, unknown>).khs) ||
        Array.isArray((firstItem as Record<string, unknown>).krs))
    ) {
      for (const entry of raw as Record<string, unknown>[]) {
        const items = entry.khs || entry.krs;
        if (Array.isArray(items)) {
          krsItems.push(...(items as RawMataKuliahItem[]));
          if (!mhs && Array.isArray(entry.mahasiswa)) {
            mhs = (entry.mahasiswa as RawMahasiswaItem[])[0];
          }
        }
      }
    }
  }

  if (krsItems.length === 0 || !mhs) return null;

  const nim = mhs.nim || "";
  const nama = mhs.nama || mhs.nama_mahasiswa || "";
  const tahunAjaran = String(mhs.tahunAjaran || mhs.tahun_ajaran || "");
  const semester = Number(mhs.semester || 0);

  const mataKuliah = krsItems.map((mk) => {
    const nilai = String(mk.nilai_akhir || "0");
    const sks = Number(mk.sks_teori || 0) + Number(mk.sks_praktik || 0);
    return {
      id: mk.id || 0,
      code: String(mk.code || ""),
      kodeMatakuliah: String(mk.kode_matakuliah || ""),
      namaMatakuliah: String(mk.nama_matakuliah || ""),
      sksTeori: Number(mk.sks_teori || 0),
      sksPraktik: Number(mk.sks_praktik || 0),
      nilaiAkhir: nilai,
      sks,
      grade: getGrade(nilai),
      keterangan: getKeterangan(nilai),
    };
  });

  const totalSks = mataKuliah.reduce((sum, mk) => sum + mk.sks, 0);

  // Hitung IP sederhana berdasarkan grade
  const gradePoint: Record<string, number> = {
    A: 4,
    "B+": 3.5,
    B: 3,
    "C+": 2.5,
    C: 2,
    D: 1,
    E: 0,
  };
  const totalPoint = mataKuliah.reduce(
    (sum, mk) => sum + (gradePoint[mk.grade] || 0) * mk.sks,
    0,
  );
  const ipSemester = totalSks > 0 ? totalPoint / totalSks : 0;

  return {
    id: `${nim}-${semester}-${Date.now()}`,

    nim,
    nama,
    semester,
    tahunAjaran,
    totalSks,
    ipSemester,
    ipKumulatif: ipSemester,
    mataKuliah,
  };
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Khs() {
  const dispatch = useDispatch();
  const user = useAuthStore((state) => state.user);
  const profile = useSelector((state: RootState) => state.mahasiswa.profile);
  const [khs, setKhs] = useState<KhsEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<number | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [semesterOptions, setSemesterOptions] = useState<number[]>([]);

  useEffect(() => {
    if (user && !profile) {
      dispatch(setProfilMahasiswa(mapUserToMahasiswa(user)));
    }
  }, [user, profile, dispatch]);

  useEffect(() => {
    async function fetchSemesters() {
      const result = await getSemesterList();
      if (result.status && result.data) {
        const semesters = result.data.semester.map((s) => s.semester);
        setSemesterOptions(semesters);
        if (semesters.length > 0) {
          handleGetKhs(1);
        }
      }
    }
    fetchSemesters();
  }, []);

  const mahasiswa = profile || {
    nim: "-",
    nama: "-",
    tempatLahir: "-",
    tanggalLahir: "-",
    jenisKelamin: "-",
    agama: "-",
    golonganDarah: "-",
    alamat: "-",
    noHp: "-",
    email: "-",
    programStudi: "S1 Kedokteran",
    fakultas: "Fakultas Kedokteran",
    angkatan: 0,
    semester: 0,
    statusAktif: "-",
    orangTua: {
      namaAyah: "-",
      pekerjaanAyah: "-",
      nohpAyah: "-",
      namaIbu: "-",
      pekerjaanIbu: "-",
      nohpIbu: "-",
      alamat: "-",
    },
  };

  function handlePrint(entry: KhsEntry) {
    alert(`Print KHS Semester ${entry.semester} - T.A. ${entry.tahunAjaran}`);
  }

  async function handleGetKhs(semester: number) {
    setLoading(semester);
    setError(null);
    setKhs([]);
    setSelectedSemester(semester);

    const response = await getKhs(semester);
    console.log("ini response", response);

    if (!response.status) {
      setError(response.message);
      setKhs([]);
    } else {
      const entry = normalizeKhsData(response.data);
      setKhs(entry ? [entry] : []);
    }
    setLoading(null);
  }

  console.log("ini khs", khs);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kartu Hasil Studi</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pilih semester untuk melihat KHS
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm">
          {error}
        </div>
      )}

      <KhsInfoCard mahasiswa={mahasiswa} semesterAktif={selectedSemester ?? undefined} />

      {/* Tombol Pilih Semester */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Pilih Semester
        </h3>
        <div className="flex flex-wrap gap-2">
          {semesterOptions.map((sem) => (
            <button
              key={sem}
              onClick={() => handleGetKhs(sem)}
              disabled={loading !== null}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  selectedSemester === sem && loading === null && khs.length > 0
                    ? "bg-brand-600 text-white"
                    : loading === sem
                      ? "bg-brand-600 text-white animate-pulse"
                      : "bg-gray-100 text-gray-700 hover:bg-brand-50 hover:text-brand-700 border border-transparent hover:border-brand-200"
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {loading === sem ? "Memuat..." : `Semester ${sem}`}
            </button>
          ))}
        </div>
      </div>

      <KhsTable
        data={khs}
        semesterAktif={selectedSemester ?? undefined}
        onPrint={handlePrint}
      />
    </div>
  );
}
