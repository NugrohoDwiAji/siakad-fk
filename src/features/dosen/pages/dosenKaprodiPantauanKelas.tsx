import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getKaprodiPenilaianKelas } from "@/features/dosen/api/kaprodiPenilaian";
import type { KaprodiPenilaianKelasItem } from "@/features/dosen/types";

export default function DosenKaprodiPantauanKelas() {
  const navigate = useNavigate();

  const [kelasList, setKelasList] = useState<KaprodiPenilaianKelasItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [selectedProdi, setSelectedProdi] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  async function fetchKelas() {
    setLoading(true);
    setError(null);
    const res = await getKaprodiPenilaianKelas();

    if (!res.status) {
      setError(res.message);
      setKelasList([]);
    } else {
      setKelasList(res.data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    let isMounted = true;
    async function initLoad() {
      setError(null);
      const res = await getKaprodiPenilaianKelas();
      if (!isMounted) return;
      if (!res.status) {
        setError(res.message);
        setKelasList([]);
      } else {
        setKelasList(res.data || []);
      }
      setLoading(false);
    }
    initLoad();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter options
  const semesters = useMemo(() => {
    return Array.from(new Set(kelasList.map((k) => k.semester))).sort(
      (a, b) => a - b
    );
  }, [kelasList]);

  const prodiList = useMemo(() => {
    return Array.from(
      new Set(kelasList.map((k) => k.nama_program_studi).filter(Boolean))
    ).sort();
  }, [kelasList]);

  const filteredKelas = useMemo(() => {
    return kelasList.filter((item) => {
      if (
        selectedSemester !== "all" &&
        item.semester !== Number(selectedSemester)
      ) {
        return false;
      }
      if (
        selectedProdi !== "all" &&
        item.nama_program_studi !== selectedProdi
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNama = item.nama_kelas?.toLowerCase().includes(q);
        const matchMk = item.nama_matakuliah?.toLowerCase().includes(q);
        const matchKodeMk = item.kode_matakuliah?.toLowerCase().includes(q);
        const matchProdi = item.nama_program_studi?.toLowerCase().includes(q);
        const matchTahun = item.tahun_akademik?.toLowerCase().includes(q);
        return matchNama || matchMk || matchKodeMk || matchProdi || matchTahun;
      }
      return true;
    });
  }, [kelasList, selectedSemester, selectedProdi, searchQuery]);

  // Overall Statistics
  const totalKelas = kelasList.length;
  const totalMahasiswa = kelasList.reduce(
    (acc, k) => acc + (k.jumlah_mahasiswa || 0),
    0
  );
  const totalProses = kelasList.reduce(
    (acc, k) => acc + (k.proses || 0),
    0
  );
  const totalValidasi = kelasList.reduce(
    (acc, k) => acc + (k.validasi || 0),
    0
  );

  const overallProgress =
    totalMahasiswa > 0 ? Math.round((totalValidasi / totalMahasiswa) * 100) : 0;

  function handleNavigateToMahasiswa(kelas: KaprodiPenilaianKelasItem) {
    navigate(
      `/dosen/penilaian/validasi/${encodeURIComponent(kelas.code_kelas)}`,
      { state: { kelas } }
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-white shadow-xs border border-gray-200/80 px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-brand-700 font-semibold uppercase tracking-wider mb-1">
            <span>Penilaian</span>
            <span>•</span>
            <span>Validasi</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
            Validasi Penilaian Kelas
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Daftar kelas untuk validasi dan persetujuan nilai mahasiswa oleh Ketua Program Studi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="bg-gray-100 p-0.5 rounded-lg flex items-center border border-gray-200/80">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-gray-900 shadow-2xs font-semibold"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              title="Tampilan Tabel"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18" />
              </svg>
              <span>Tabel</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("card")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                viewMode === "card"
                  ? "bg-white text-gray-900 shadow-2xs font-semibold"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              title="Tampilan Kartu"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              <span>Kartu</span>
            </button>
          </div>

          <button
            type="button"
            onClick={fetchKelas}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 active:bg-gray-100 rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <svg
              className={`h-3.5 w-3.5 ${loading ? "animate-spin text-brand-600" : "text-gray-500"}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Muat Ulang</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Kelas */}
        <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Total Kelas
            </span>
            <span className="h-9 w-9 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center shadow-2xs">
              <svg
                className="h-4.5 w-4.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </span>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-extrabold text-gray-900">{totalKelas}</p>
            <p className="text-xs text-brand-600 font-medium mt-1">Kelas kurikulum aktif</p>
          </div>
        </div>

        {/* Total Mahasiswa */}
        <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Total Mahasiswa
            </span>
            <span className="h-9 w-9 rounded-lg bg-brand-100 text-brand-800 flex items-center justify-center shadow-2xs">
              <svg
                className="h-4.5 w-4.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </span>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-extrabold text-gray-900">{totalMahasiswa}</p>
            <p className="text-xs text-brand-600 font-medium mt-1">Terdaftar semester ini</p>
          </div>
        </div>

        {/* Dalam Proses */}
        <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Nilai Proses
            </span>
            <span className="h-9 w-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shadow-2xs">
              <svg
                className="h-4.5 w-4.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </span>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-extrabold text-brand-700">{totalProses}</p>
            <p className="text-xs text-gray-400 mt-1">Menunggu approval Kaprodi</p>
          </div>
        </div>

        {/* Sudah Tervalidasi */}
        <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Tervalidasi Final
            </span>
            <span className="h-9 w-9 rounded-lg bg-brand-600 text-white flex items-center justify-center shadow-2xs">
              <svg
                className="h-4.5 w-4.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-extrabold text-brand-900">{totalValidasi}</p>
            <p className="text-xs text-brand-700 font-semibold mt-1">
              {overallProgress}% tervalidasi
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Cari kelas, mata kuliah, kode MK, program studi, atau tahun akademik..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm text-gray-800 bg-gray-50/70 border border-gray-200 rounded-xl outline-none focus:border-brand-600 focus:bg-white focus:ring-2 focus:ring-brand-100 transition"
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Semester */}
          <div className="w-full sm:w-44">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              aria-label="Filter Semester"
              className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-50/70 border border-gray-200 rounded-xl outline-none focus:border-brand-600 focus:bg-white transition"
            >
              <option value="all">Semua Semester</option>
              {semesters.map((sem) => (
                <option key={sem} value={String(sem)}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>

          {/* Prodi */}
          {prodiList.length > 1 && (
            <div className="w-full sm:w-52">
              <select
                value={selectedProdi}
                onChange={(e) => setSelectedProdi(e.target.value)}
                aria-label="Filter Program Studi"
                className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-50/70 border border-gray-200 rounded-xl outline-none focus:border-brand-600 focus:bg-white transition"
              >
                <option value="all">Semua Program Studi</option>
                {prodiList.map((prodi) => (
                  <option key={prodi} value={prodi}>
                    {prodi}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(selectedSemester !== "all" ||
            selectedProdi !== "all" ||
            searchQuery) && (
            <button
              onClick={() => {
                setSelectedSemester("all");
                setSelectedProdi("all");
                setSearchQuery("");
              }}
              className="text-xs text-brand-700 hover:text-brand-800 font-semibold px-2 py-1.5 whitespace-nowrap cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-rose-500 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchKelas}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg shadow-2xs transition-all cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Content: List of Classes */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200/80 p-6 animate-pulse space-y-4"
            >
              <div className="h-5 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-100 rounded w-1/4" />
              <div className="h-10 bg-gray-50 rounded" />
            </div>
          ))}
        </div>
      ) : filteredKelas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200/80 p-12 text-center shadow-xs">
          <div className="h-14 w-14 mx-auto rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
            <svg
              className="h-7 w-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900">
            Tidak ada kelas penilaian yang ditemukan
          </h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            {searchQuery || selectedSemester !== "all" || selectedProdi !== "all"
              ? "Coba sesuaikan filter atau kata kunci pencarian Anda."
              : "Saat ini belum ada data kelas penilaian untuk program studi Anda."}
          </p>
        </div>
      ) : viewMode === "table" ? (
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/75 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Mata Kuliah & Kelas</th>
                  <th className="py-3 px-4">Semester & T.A.</th>
                  <th className="py-3 px-4">Program Studi</th>
                  <th className="py-3 px-4 text-center">Mahasiswa</th>
                  <th className="py-3 px-4 min-w-[200px]">Progres Validasi</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredKelas.map((kelas, idx) => {
                  const jml = kelas.jumlah_mahasiswa || 0;
                  const prosesCount = kelas.proses || 0;
                  const validasiCount = kelas.validasi || 0;
                  const pctValidasi =
                    jml > 0 ? Math.round((validasiCount / jml) * 100) : 0;
                  const isAllValid = jml > 0 && validasiCount === jml;

                  return (
                    <tr
                      key={kelas.code_kelas}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-center font-medium text-gray-400">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900 text-sm">
                          {kelas.nama_matakuliah}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                            {kelas.kode_matakuliah}
                          </span>
                          <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 text-[11px]">
                            {kelas.nama_kelas}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        <div className="font-medium">Semester {kelas.semester}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          T.A. {kelas.tahun_akademik}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-700 font-medium">
                        {kelas.nama_program_studi}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-gray-900 text-sm">
                        {jml}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-gray-500 font-medium">
                              {validasiCount} / {jml} ({pctValidasi}%)
                            </span>
                            <span className="text-brand-700 font-semibold">
                              {prosesCount > 0 ? `${prosesCount} proses` : "Selesai"}
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${pctValidasi}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isAllValid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-200 whitespace-nowrap">
                            <svg
                              className="h-3 w-3 text-brand-600"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2.5}
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Tervalidasi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-200 whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse" />
                            {prosesCount} Menunggu
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleNavigateToMahasiswa(kelas)}
                          className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-brand-700 hover:bg-brand-800 active:bg-brand-900 rounded-lg shadow-2xs transition-all cursor-pointer select-none ml-auto"
                        >
                          <span>Validasi Nilai</span>
                          <svg
                            className="h-3.5 w-3.5 opacity-80"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredKelas.map((kelas) => {
            const jml = kelas.jumlah_mahasiswa || 0;
            const prosesCount = kelas.proses || 0;
            const validasiCount = kelas.validasi || 0;
            const pctValidasi = jml > 0 ? Math.round((validasiCount / jml) * 100) : 0;
            const isAllValid = jml > 0 && validasiCount === jml;

            return (
              <div
                key={kelas.code_kelas}
                className="bg-white rounded-xl border border-gray-200/80 shadow-xs hover:border-brand-300 hover:shadow-sm transition-all overflow-hidden"
              >
                <div className="p-5 sm:p-6">
                  {/* Top line info */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-gray-100">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                          {kelas.kode_matakuliah}
                        </span>
                        <h2 className="text-base sm:text-lg font-bold text-gray-900">
                          {kelas.nama_matakuliah}
                        </h2>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                        <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                          {kelas.nama_kelas}
                        </span>
                        <span>•</span>
                        <span>Semester {kelas.semester}</span>
                        <span>•</span>
                        <span>T.A. {kelas.tahun_akademik}</span>
                        <span>•</span>
                        <span>{kelas.nama_program_studi}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {isAllValid ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                          <svg
                            className="h-3.5 w-3.5 text-brand-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Semua Tervalidasi (100%)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse" />
                          {prosesCount} Menunggu Validasi
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress & Breakdown */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Progress Bar */}
                    <div className="md:col-span-7 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-gray-700">
                          Progres Validasi Kaprodi
                        </span>
                        <span className="font-bold text-brand-700">
                          {validasiCount} dari {jml} Mahasiswa ({pctValidasi}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-brand-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${pctValidasi}%` }}
                        />
                      </div>
                    </div>

                    {/* Stat Badges */}
                    <div className="md:col-span-5 flex items-center justify-start md:justify-end gap-2 text-xs flex-wrap">
                      <span className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 border border-brand-200 font-medium flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-brand-600" />
                        Validasi: <strong>{validasiCount}</strong>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-gray-50 text-gray-700 border border-gray-200 font-medium flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-brand-400" />
                        Proses: <strong>{prosesCount}</strong>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-gray-50 text-gray-500 border border-gray-200 font-medium flex items-center gap-1.5">
                        Total: <strong>{jml}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
                    <span className="text-xs text-gray-500 font-medium">
                      {kelas.nama_program_studi} • Semester {kelas.semester}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleNavigateToMahasiswa(kelas)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-brand-700 hover:bg-brand-800 active:bg-brand-900 rounded-lg shadow-2xs transition-all cursor-pointer select-none"
                    >
                      <span>Validasi Nilai Kelas</span>
                      <svg
                        className="h-3.5 w-3.5 opacity-80"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
