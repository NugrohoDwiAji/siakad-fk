import type { Mahasiswa, PetikanNilaiData, SemesterKurikulum } from "@/features/mahasiswa/types";
import PetikanNilaiTable from "../components/organisms/PetikanNilaiTable";
import MahasiswaInfoCard from "../components/organisms/MahasiswaInfoCard";
import { useState, useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/stores/configStore";
import { getPetikanNilai } from "@/features/mahasiswa/api/petikanNilai";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { getSemester } from "@/utils/mahasiswa";
import { setProfilMahasiswa } from "../store/mahasiswaSlice";
import type { User } from "@/features/auth/types";

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

function normalizePetikanNilai(raw: unknown): PetikanNilaiData | null {
  if (!raw || typeof raw !== "object") return null;

  const obj = raw as Record<string, unknown>;
  const mahasiswa = obj.mahasiswa as Record<string, string> | undefined;
  const kurikulum = obj.kurikulum as Record<string, unknown> | undefined;
  const dataKurikulum = obj.data_kurikulum as Record<string, unknown>[] | undefined;

  if (!mahasiswa || !dataKurikulum) return null;

  return {
    mahasiswa: {
      nim: mahasiswa.nim || "-",
      namaMahasiswa: mahasiswa.nama_mahasiswa || "-",
      namaProgramStudi: mahasiswa.nama_program_studi || "-",
      alamat: mahasiswa.alamat || "-",
      tempatLahir: mahasiswa.tempat_lahir || "-",
      tanggalLahir: mahasiswa.tanggal_lahir || "-",
      telepon: mahasiswa.telepon || "-",
      teleponOrangtua: mahasiswa.telepon_orangtua || "-",
    },
    kurikulum: {
      id: (kurikulum?.id as string | number) || 0,
      angkatan: Number(kurikulum?.angkatan || 0),
      namaKurikulum: String(kurikulum?.nama_kurikulum || "-"),
      kodeNamaKurikulum: String(kurikulum?.kode_nama_kurikulum || "-"),
    },
    dataKurikulum: dataKurikulum.map((sem) => ({
      id: (sem.id as string | number) || 0,
      semester: Number(sem.semester || 0),
      totalSks: Number(sem.total_sks || 0),
      matakuliah: Array.isArray(sem.matakuliah)
        ? (sem.matakuliah as Record<string, unknown>[]).map((mk) => ({
            kodeMatakuliah: String(mk.kode_matakuliah || ""),
            namaMatakuliah: String(mk.nama_matakuliah || ""),
            sksTeori: Number(mk.sks_teori || 0),
            sksPraktik: Number(mk.sks_praktik || 0),
            nilai: Array.isArray(mk.nilai)
              ? (mk.nilai as Record<string, unknown>[]).map((n) => ({
                  id: (n.id as string | number) || 0,
                  idMatakuliah: (n.id_matakuliah as string | number) || 0,
                  semester: Number(n.semester || 0),
                  nilaiAkhir: String(n.nilai_akhir || "0"),
                }))
              : [],
          }))
        : [],
    })),
  };
}

// ─── Empty Mahasiswa ──────────────────────────────────────────────────────────

const EMPTY_MAHASISWA: Mahasiswa = {
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
  programStudi: "-",
  fakultas: "-",
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

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PetikanNilai() {
  const dispatch = useDispatch();
  const user = useAuthStore((state) => state.user);
  const profile = useSelector((state: RootState) => state.mahasiswa.profile);
  const [petikanData, setPetikanData] = useState<PetikanNilaiData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && !profile) {
      dispatch(setProfilMahasiswa(mapUserToMahasiswa(user)));
    }
  }, [user, profile, dispatch]);

  const mahasiswa = profile || EMPTY_MAHASISWA;

  useEffect(() => {
    async function fetchPetikanNilai() {
      setLoading(true);
      setError(null);
      const response = await getPetikanNilai();
      if (!response.status) {
        setError(response.message);
      } else {
        setPetikanData(normalizePetikanNilai(response.data));
      }
      setLoading(false);
    }
    fetchPetikanNilai();
  }, []);

  // Ambil data kurikulum yang sudah di-sort per semester
  const semesterList: SemesterKurikulum[] = petikanData
    ? [...petikanData.dataKurikulum].sort((a, b) => a.semester - b.semester)
    : [];

  const totalSksKeseluruhan = semesterList.reduce((s, sem) => s + sem.totalSks, 0);

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Petikan Nilai</h1>
        <p className="text-sm text-gray-500 mt-1">
          Daftar nilai seluruh mata kuliah per semester
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm">
          {error}
        </div>
      )}

      <MahasiswaInfoCard mahasiswa={mahasiswa} />

      {/* Info Kurikulum */}
      {petikanData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Kurikulum</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {petikanData.kurikulum.namaKurikulum}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {petikanData.kurikulum.kodeNamaKurikulum} &bull; Angkatan {petikanData.kurikulum.angkatan}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Total SKS</p>
              <p className="text-2xl font-black text-brand-700 leading-none mt-0.5">
                {totalSksKeseluruhan}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
        </div>
      )}

      {/* Tabel per semester */}
      {!loading && semesterList.length > 0 && (
        <div className="space-y-6">
          {semesterList.map((sem) => (
            <PetikanNilaiTable key={sem.id} data={sem} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && semesterList.length === 0 && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-sm text-gray-400">Belum ada data petikan nilai</p>
        </div>
      )}
    </div>
  );
}
