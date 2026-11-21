import { useState, useEffect } from "react";
import KurikulumCard from "../components/organisms/KurikulumCard";
import type { KurikulumSemester } from "@/features/mahasiswa/types";
import { getKurikulum } from "@/features/mahasiswa/api/kurikulum";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { getSemester } from "@/utils/mahasiswa";

// ─── Raw API types ────────────────────────────────────────────────────────────

interface RawMataKuliahItem {
  kode_matakuliah?: string;
  nama_matakuliah?: string;
  sks_teori?: number;
  sks_praktik?: number;
  block?: string;
}

interface RawSemesterItem {
  semester?: number;
  total_sks?: number;
  matakuliah?: RawMataKuliahItem[];
}

// ─── Normalize ────────────────────────────────────────────────────────────────

function normalizeKurikulumData(raw: unknown): KurikulumSemester[] {
  if (!raw) return [];

  let items: RawSemesterItem[] = [];

  if (Array.isArray(raw)) {
    items = raw;
  } else if (typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    // Response: { data_kurikulum: [...], kurikulum: {...} }
    if (Array.isArray(obj.data_kurikulum)) {
      items = obj.data_kurikulum as RawSemesterItem[];
    } else if (Array.isArray(obj.data)) {
      items = obj.data as RawSemesterItem[];
    }
  }

  return items.map((sem) => ({
    semester: Number(sem.semester || 0),
    totalSks: Number(sem.total_sks || 0),
    mataKuliah: Array.isArray(sem.matakuliah)
      ? sem.matakuliah.map((mk) => ({
          code: String(mk.kode_matakuliah || ""),
          nama: String(mk.nama_matakuliah || ""),
          sksTeori: Number(mk.sks_teori || 0),
          sksPraktek: Number(mk.sks_praktik || 0),
          block: mk.block,
        }))
      : [],
  }));
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Kurikulum() {
  const user = useAuthStore((state) => state.user);
  const [kurikulumData, setKurikulumData] = useState<KurikulumSemester[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const semesterAktif = user?.nim ? getSemester(user.nim) : 1;

  useEffect(() => {
    async function fetchKurikulum() {
      setLoading(true);
      setError(null);
      const response = await getKurikulum();
      console.log("ini response get kurikulum", response);
      if (!response.status) {
        setError(response.message);
      } else {
        const normalized = normalizeKurikulumData(response.data);
        setKurikulumData(normalized);
      }
      setLoading(false);
    }
    fetchKurikulum();
  }, []);

  const totalSksKeseluruhan = kurikulumData.reduce(
    (sum, s) => sum + s.totalSks,
    0,
  );
  const totalMataKuliah = kurikulumData.reduce(
    (sum, s) => sum + s.mataKuliah.length,
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Kurikulum</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Daftar mata kuliah per semester program studi
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
        </div>
      )}

      {/* Summary pills */}
      {!loading && kurikulumData.length > 0 && (
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
      )}

      {/* Kurikulum cards */}
      {!loading && (
        <div className="flex flex-col gap-3">
          {kurikulumData.map((semester) => (
            <KurikulumCard
              key={semester.semester}
              data={semester}
              semesterAktif={semesterAktif}
              defaultOpen={semester.semester === semesterAktif}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && kurikulumData.length === 0 && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-sm text-gray-400">Belum ada data kurikulum</p>
        </div>
      )}
    </div>
  );
}
