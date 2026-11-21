import { useState, useEffect, useTransition } from "react";
import { useSearchParams } from "react-router-dom";
import { getKurikulumMahasiswa } from "@/features/dosen/api/kurikulum";
import { getPerwalianDosen } from "@/features/dosen/api/perwalian";
import Button from "@/components/ui/Button";
import type {
  DosenKurikulumMahasiswaData,
  DosenSemesterKurikulum,
  DosenPerwalianItem,
} from "@/features/dosen/types";

// ─── Semester Card Component ───────────────────────────────────────────────────

function SemesterCard({
  semesterData,
  defaultOpen = false,
}: {
  semesterData: DosenSemesterKurikulum;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const totalTeori = semesterData.matakuliah.reduce(
    (acc, m) => acc + (m.sks_teori || 0),
    0
  );
  const totalPraktik = semesterData.matakuliah.reduce(
    (acc, m) => acc + (m.sks_praktik || 0),
    0
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-colors">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4.5 text-left hover:bg-gray-50/70 transition-colors focus-visible:outline-none"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-sm shrink-0 select-none">
            {semesterData.semester}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 leading-tight">
              Semester {semesterData.semester}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {semesterData.matakuliah.length} mata kuliah &bull;{" "}
              {semesterData.total_sks} SKS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex gap-2 text-xs">
            <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md font-medium">
              Teori: {totalTeori} SKS
            </span>
            <span className="bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-md font-medium">
              Praktik: {totalPraktik} SKS
            </span>
          </div>
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="bg-gray-50/70 text-left border-b border-gray-100">
                <th className="px-5 py-3 font-semibold text-gray-500 w-12 text-center">
                  No
                </th>
                <th className="px-5 py-3 font-semibold text-gray-500 w-28">
                  Kode MK
                </th>
                <th className="px-5 py-3 font-semibold text-gray-500">
                  Nama Mata Kuliah
                </th>
                <th className="px-5 py-3 font-semibold text-gray-500 text-center w-24">
                  SKS Teori
                </th>
                <th className="px-5 py-3 font-semibold text-gray-500 text-center w-24">
                  SKS Praktik
                </th>
                <th className="px-5 py-3 font-semibold text-gray-500 text-center w-24">
                  Total SKS
                </th>
                <th className="px-5 py-3 font-semibold text-gray-500 text-center w-28">
                  Tipe
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {semesterData.matakuliah.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-6 text-center text-gray-400">
                    Tidak ada mata kuliah pada semester ini.
                  </td>
                </tr>
              ) : (
                semesterData.matakuliah.map((mk, idx) => {
                  const totalMkSks = mk.sks_teori + mk.sks_praktik;
                  return (
                    <tr
                      key={mk.code_matakuliah || mk.kode_matakuliah}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-5 py-3 text-gray-400 text-center">
                        {idx + 1}
                      </td>
                      <td className="px-5 py-3 font-mono font-medium text-brand-700">
                        {mk.kode_matakuliah}
                      </td>
                      <td className="px-5 py-3 font-medium text-gray-800">
                        {mk.nama_matakuliah}
                      </td>
                      <td className="px-5 py-3 text-center text-gray-600">
                        {mk.sks_teori}
                      </td>
                      <td className="px-5 py-3 text-center text-gray-600">
                        {mk.sks_praktik}
                      </td>
                      <td className="px-5 py-3 text-center font-bold text-gray-900">
                        {totalMkSks}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                            mk.block
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {mk.block ? "Blok" : "Reguler"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              <tr className="bg-brand-50/60 border-t border-brand-100 font-semibold text-brand-900">
                <td colSpan={3} className="px-5 py-3 text-right">
                  Total SKS Semester {semesterData.semester}:
                </td>
                <td className="px-5 py-3 text-center text-blue-700">
                  {totalTeori}
                </td>
                <td className="px-5 py-3 text-center text-amber-700">
                  {totalPraktik}
                </td>
                <td className="px-5 py-3 text-center text-brand-800 font-bold">
                  {semesterData.total_sks}
                </td>
                <td className="px-5 py-3" />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function DosenKurikulumMahasiswa() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [, startTransition] = useTransition();

  const codeParam = searchParams.get("code_mahasiswa") || "";
  const nimParam = searchParams.get("nim") || "";
  const namaParam = searchParams.get("nama") || "";

  const [inputCode, setInputCode] = useState(codeParam);
  const [selectedStudentInfo, setSelectedStudentInfo] = useState<{
    nim?: string;
    nama?: string;
  }>({
    nim: nimParam || undefined,
    nama: namaParam || undefined,
  });

  const [perwalianList, setPerwalianList] = useState<DosenPerwalianItem[]>([]);
  const [kurikulumData, setKurikulumData] =
    useState<DosenKurikulumMahasiswaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch perwalian students list for quick selector dropdown
  useEffect(() => {
    let isMounted = true;
    async function loadPerwalian() {
      const res = await getPerwalianDosen(1);
      if (isMounted && res.status) {
        setPerwalianList(res.data.perwalian || []);
      }
    }
    loadPerwalian();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch kurikulum when codeParam changes
  useEffect(() => {
    if (!codeParam) return;

    let isMounted = true;
    async function fetchKurikulum() {
      setLoading(true);
      setError(null);

      const res = await getKurikulumMahasiswa(codeParam);
      if (!isMounted) return;

      if (!res.status) {
        setError(res.message);
        setKurikulumData(null);
      } else {
        setKurikulumData(res.data);
      }

      setLoading(false);
    }

    fetchKurikulum();

    return () => {
      isMounted = false;
    };
  }, [codeParam]);

  const displayedKurikulumData = codeParam ? kurikulumData : null;

  function handleSelectPerwalian(studentCode: string) {
    if (!studentCode) return;
    const found = perwalianList.find((p) => p.code === studentCode);
    setInputCode(studentCode);
    setSelectedStudentInfo({
      nim: found?.nim,
      nama: found?.nama_mahasiswa,
    });

    startTransition(() => {
      setSearchParams({
        code_mahasiswa: studentCode,
        nim: found?.nim || "",
        nama: found?.nama_mahasiswa || "",
      });
    });
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inputCode.trim()) return;

    const found = perwalianList.find((p) => p.code === inputCode.trim());
    setSelectedStudentInfo({
      nim: found?.nim || selectedStudentInfo.nim,
      nama: found?.nama_mahasiswa || selectedStudentInfo.nama,
    });

    startTransition(() => {
      setSearchParams({
        code_mahasiswa: inputCode.trim(),
        nim: found?.nim || selectedStudentInfo.nim || "",
        nama: found?.nama_mahasiswa || selectedStudentInfo.nama || "",
      });
    });
  }

  const totalSksKeseluruhan = (displayedKurikulumData?.data_kurikulum || []).reduce(
    (sum, s) => sum + s.total_sks,
    0
  );
  const totalMataKuliah = (displayedKurikulumData?.data_kurikulum || []).reduce(
    (sum, s) => sum + s.matakuliah.length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5">
        <h1 className="text-xl font-semibold text-gray-800">
          Kurikulum Mahasiswa
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Lihat struktur kurikulum dan daftar mata kuliah per semester mahasiswa
        </p>
      </div>

      {/* Student Selector Card */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
          Pilih Mahasiswa
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option 1: Pick from Perwalian list */}
          <div>
            <label
              htmlFor="select-perwalian"
              className="block text-xs font-medium text-gray-500 mb-1.5"
            >
              Pilih dari Mahasiswa Perwalian:
            </label>
            <select
              id="select-perwalian"
              value={inputCode}
              onChange={(e) => handleSelectPerwalian(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-600 focus:bg-white focus:ring-2 focus:ring-brand-100 transition"
            >
              <option value="">-- Pilih Mahasiswa Bimbingan --</option>
              {perwalianList.map((mhs) => (
                <option key={mhs.code} value={mhs.code}>
                  {mhs.nim} - {mhs.nama_mahasiswa}
                </option>
              ))}
            </select>
          </div>

          {/* Option 2: Enter code_mahasiswa manually */}
          <form onSubmit={handleManualSubmit}>
            <label
              htmlFor="input-code-mhs"
              className="block text-xs font-medium text-gray-500 mb-1.5"
            >
              Atau Masukkan Kode Mahasiswa (Encrypted):
            </label>
            <div className="flex gap-2">
              <input
                id="input-code-mhs"
                type="text"
                placeholder="Masukkan code_mahasiswa..."
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="flex-1 px-3.5 py-2.5 text-xs font-mono text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-600 focus:bg-white focus:ring-2 focus:ring-brand-100 transition"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={loading}
              >
                Tampilkan
              </Button>
            </div>
          </form>
        </div>

        {/* Selected Student Banner */}
        {(selectedStudentInfo.nama || selectedStudentInfo.nim) && (
          <div className="bg-brand-50/80 border border-brand-100 rounded-xl px-4 py-3 text-xs text-brand-900 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-full bg-brand-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {selectedStudentInfo.nama?.charAt(0) || "M"}
              </div>
              <div>
                <span className="font-semibold text-brand-950">
                  {selectedStudentInfo.nama || "Mahasiswa"}
                </span>
                {selectedStudentInfo.nim && (
                  <span className="ml-2 font-mono text-brand-600">
                    ({selectedStudentInfo.nim})
                  </span>
                )}
              </div>
            </div>
            <span className="text-[11px] text-brand-600 font-medium">
              Mahasiswa Terpilih
            </span>
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm flex items-start gap-3">
          <svg
            className="h-5 w-5 shrink-0 mt-0.5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="font-semibold">Gagal memuat kurikulum</p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-brand-600 mb-3" />
          <p className="text-sm">Memuat data kurikulum mahasiswa...</p>
        </div>
      )}

      {/* Kurikulum Content */}
      {!loading && displayedKurikulumData && (
        <div className="space-y-6">
          {/* Summary Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400 font-medium">Kurikulum</p>
              <p className="text-sm font-bold text-gray-800 mt-1 truncate">
                {displayedKurikulumData.kurikulum.nama_kurikulum}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400 font-medium">Angkatan</p>
              <p className="text-xl font-bold text-gray-800 mt-1">
                {displayedKurikulumData.kurikulum.angkatan}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400 font-medium">Total Semester</p>
              <p className="text-xl font-bold text-brand-700 mt-1">
                {displayedKurikulumData.data_kurikulum.length}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400 font-medium">
                Total SKS / MK
              </p>
              <p className="text-xl font-bold text-brand-700 mt-1">
                {totalSksKeseluruhan} SKS{" "}
                <span className="text-xs font-normal text-gray-500">
                  ({totalMataKuliah} MK)
                </span>
              </p>
            </div>
          </div>

          {/* Semesters list */}
          <div className="space-y-4">
            {displayedKurikulumData.data_kurikulum.map((sem, idx) => (
              <SemesterCard
                key={sem.semester}
                semesterData={sem}
                defaultOpen={idx === 0}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State when no student selected */}
      {!loading && !displayedKurikulumData && !error && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="h-14 w-14 rounded-2xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center mb-4">
            <svg
              className="h-7 w-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-gray-800">
            Pilih Mahasiswa Terlebih Dahulu
          </h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Silakan pilih mahasiswa dari daftar perwalian di atas atau masukkan kode
            mahasiswa untuk melihat struktur kurikulum dan mata kuliah per semester.
          </p>
        </div>
      )}
    </div>
  );
}
