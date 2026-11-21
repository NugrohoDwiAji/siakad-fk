import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import {
  getKaprodiPenilaianMahasiswa,
  getKaprodiPenilaianKelas,
} from "@/features/dosen/api/kaprodiPenilaian";
import DosenKaprodiPenilaianDetailModal from "@/features/dosen/components/organisms/DosenKaprodiPenilaianDetailModal";
import type {
  KaprodiPenilaianKelasItem,
  KaprodiPenilaianMahasiswaItem,
} from "@/features/dosen/types";

export default function DosenKaprodiMahasiswaKelas() {
  const { codeKelas } = useParams<{ codeKelas: string }>();
  const location = useLocation();

  // Class info from location state if available
  const stateKelas = (location.state as { kelas?: KaprodiPenilaianKelasItem })
    ?.kelas;
  const [kelasInfo, setKelasInfo] = useState<KaprodiPenilaianKelasItem | null>(
    stateKelas || null
  );

  const [mahasiswaList, setMahasiswaList] = useState<
    KaprodiPenilaianMahasiswaItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  // Detail Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMhsForDetail, setSelectedMhsForDetail] =
    useState<KaprodiPenilaianMahasiswaItem | null>(null);

  const loadData = useCallback(async () => {
    if (!codeKelas) return;

    setLoading(true);
    setError(null);

    try {
      const mhsPromise = getKaprodiPenilaianMahasiswa(codeKelas);
      const kelasPromise = !kelasInfo ? getKaprodiPenilaianKelas() : null;

      const [mhsRes, kelasRes] = await Promise.all([mhsPromise, kelasPromise]);

      if (!mhsRes.status) {
        setError(mhsRes.message || "Gagal memuat data mahasiswa penilaian.");
      } else {
        setMahasiswaList(mhsRes.data || []);
      }

      if (kelasRes && kelasRes.status && kelasRes.data) {
        const found = kelasRes.data.find((k) => k.code_kelas === codeKelas);
        if (found) {
          setKelasInfo(found);
        }
      }
    } catch {
      setError("Terjadi kesalahan saat memuat data penilaian mahasiswa.");
    } finally {
      setLoading(false);
    }
  }, [codeKelas, kelasInfo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered Students
  const filteredMahasiswa = useMemo(() => {
    return mahasiswaList.filter((mhs) => {
      // Status Filter
      if (statusFilter !== "all") {
        if (mhs.status_penilaian?.toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNama = mhs.nama_mahasiswa?.toLowerCase().includes(q);
        const matchNim = mhs.nim?.toLowerCase().includes(q);
        return matchNama || matchNim;
      }
      return true;
    });
  }, [mahasiswaList, statusFilter, searchQuery]);

  // Statistics
  const totalMhs = mahasiswaList.length;
  const countValid = mahasiswaList.filter(
    (m) => m.status_penilaian?.toLowerCase() === "valid"
  ).length;
  const countProses = mahasiswaList.filter(
    (m) => m.status_penilaian?.toLowerCase() === "proses"
  ).length;

  function handleOpenDetail(mhs: KaprodiPenilaianMahasiswaItem) {
    setSelectedMhsForDetail(mhs);
    setIsDetailModalOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Link
          to="/dosen/penilaian/validasi"
          className="text-brand-700 hover:text-brand-900 font-semibold flex items-center gap-1.5 transition-colors"
        >
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Kembali ke Validasi Penilaian Kelas
        </Link>
        <span>/</span>
        <span className="text-gray-700 font-medium truncate max-w-xs sm:max-w-md">
          {kelasInfo ? `${kelasInfo.nama_kelas} - ${kelasInfo.nama_matakuliah}` : "Daftar Mahasiswa"}
        </span>
      </div>

      {/* Class Header Banner */}
      <div className="rounded-2xl bg-white shadow-xs border border-gray-200/80 p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                {kelasInfo?.kode_matakuliah || "MK"}
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                {kelasInfo?.nama_matakuliah || "Detail Penilaian Kelas"}
              </h1>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
              <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                {kelasInfo?.nama_kelas || "Kelas"}
              </span>
              <span>•</span>
              <span>Semester {kelasInfo?.semester || 1}</span>
              <span>•</span>
              <span>T.A. {kelasInfo?.tahun_akademik || "2025/2026"}</span>
              <span>•</span>
              <span>{kelasInfo?.nama_program_studi || "Program Studi"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={loadData}
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
              <span>Segarkan</span>
            </button>
          </div>
        </div>

        {/* Quick summary counters */}
        <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100">
            <span className="text-[11px] text-gray-400 block font-medium">Total Mahasiswa</span>
            <span className="text-xl font-extrabold text-gray-900">{totalMhs}</span>
          </div>
          <div className="p-3 bg-brand-50/50 rounded-xl border border-brand-100">
            <span className="text-[11px] text-brand-600 block font-medium">Dalam Proses</span>
            <span className="text-xl font-extrabold text-brand-700">{countProses}</span>
          </div>
          <div className="p-3 bg-brand-50/80 rounded-xl border border-brand-200">
            <span className="text-[11px] text-brand-700 block font-medium">Tervalidasi Final</span>
            <span className="text-xl font-extrabold text-brand-900">{countValid}</span>
          </div>
          <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100">
            <span className="text-[11px] text-gray-400 block font-medium">Status Evaluasi</span>
            <span className="text-xs font-bold text-brand-700 truncate block mt-1">
              {countValid === totalMhs && totalMhs > 0 ? "100% Selesai" : `${countProses} Perlu Approval`}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Cari berdasarkan nama mahasiswa atau NIM..."
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

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter Status"
            className="px-3 py-2 text-sm text-gray-700 bg-gray-50/70 border border-gray-200 rounded-xl outline-none focus:border-brand-600 focus:bg-white transition"
          >
            <option value="all">Semua Status</option>
            <option value="proses">Proses</option>
            <option value="valid">Valid / Selesai</option>
          </select>

          {(statusFilter !== "all" || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter("all");
                setSearchQuery("");
              }}
              className="text-xs text-brand-700 hover:text-brand-800 font-semibold px-2 py-1.5 whitespace-nowrap cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800 flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg shadow-2xs transition-all cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Student List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200/80 p-5 animate-pulse flex items-center justify-between"
            >
              <div className="space-y-2 w-1/3">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
              <div className="h-8 bg-gray-100 rounded w-24" />
            </div>
          ))}
        </div>
      ) : filteredMahasiswa.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200/80 p-12 text-center shadow-xs">
          <h3 className="text-base font-semibold text-gray-900">
            Tidak ada data mahasiswa ditemukan
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {searchQuery || statusFilter !== "all"
              ? "Silakan periksa filter pencarian Anda."
              : "Belum ada mahasiswa yang terdaftar di kelas ini."}
          </p>
        </div>
      ) : viewMode === "table" ? (
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/75 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Mahasiswa</th>
                  <th className="py-3 px-4 min-w-[170px]">Komponen Diisi</th>
                  <th className="py-3 px-4 text-center">Nilai Akhir</th>
                  <th className="py-3 px-4">Catatan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Validasi Oleh</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredMahasiswa.map((mhs, idx) => {
                  const isValid = mhs.status_penilaian?.toLowerCase() === "valid";
                  const pctFilled =
                    mhs.total_nodes > 0
                      ? Math.round((mhs.sudah_diisi / mhs.total_nodes) * 100)
                      : 0;

                  return (
                    <tr
                      key={mhs.code_mahasiswa}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-center font-medium text-gray-400">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900 text-sm">
                          {mhs.nama_mahasiswa}
                        </div>
                        <div className="mt-0.5">
                          <span className="font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                            NIM: {mhs.nim}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-gray-600">
                            <span>
                              <strong>{mhs.sudah_diisi}</strong> / {mhs.total_nodes} Node
                            </span>
                            <span className="font-semibold text-brand-700">
                              {pctFilled}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${pctFilled}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-base font-extrabold text-brand-900">
                          {mhs.nilai_akhir != null
                            ? Number(mhs.nilai_akhir).toFixed(1)
                            : "-"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-[200px]">
                        {mhs.catatan_dosen ? (
                          <div
                            className="text-[11px] text-gray-700 truncate"
                            title={`Dosen: ${mhs.catatan_dosen}`}
                          >
                            <span className="font-medium text-gray-400">Dosen: </span>
                            &quot;{mhs.catatan_dosen}&quot;
                          </div>
                        ) : null}
                        {mhs.catatan_kaprodi ? (
                          <div
                            className="text-[11px] text-brand-800 truncate"
                            title={`Kaprodi: ${mhs.catatan_kaprodi}`}
                          >
                            <span className="font-medium text-brand-500">Kaprodi: </span>
                            &quot;{mhs.catatan_kaprodi}&quot;
                          </div>
                        ) : null}
                        {!mhs.catatan_dosen && !mhs.catatan_kaprodi ? (
                          <span className="text-gray-400">-</span>
                        ) : null}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isValid ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200 whitespace-nowrap">
                            <svg
                              className="w-3 h-3 text-brand-600"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2.5}
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200 whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                            Proses
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        {mhs.validated_by ? (
                          <div>
                            <div className="font-medium text-gray-800">
                              {mhs.validated_by}
                            </div>
                            {mhs.validated_at && (
                              <div className="text-[10px] text-gray-400 mt-0.5">
                                {mhs.validated_at}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(mhs)}
                          className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-brand-700 bg-white hover:bg-brand-50/80 active:bg-brand-100 border border-brand-200 rounded-lg shadow-2xs transition-all cursor-pointer select-none ml-auto"
                        >
                          <svg
                            className="h-3.5 w-3.5 text-brand-600 shrink-0"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>Detail Nilai</span>
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
        <div className="space-y-3">
          {filteredMahasiswa.map((mhs) => {
            const isValid = mhs.status_penilaian?.toLowerCase() === "valid";

            return (
              <div
                key={mhs.code_mahasiswa}
                className="bg-white rounded-xl border border-gray-200/80 shadow-xs hover:border-brand-300 transition-all p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Student Info */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center font-bold text-sm shrink-0">
                    {mhs.nama_mahasiswa?.charAt(0)?.toUpperCase() || "M"}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-gray-900 truncate">
                        {mhs.nama_mahasiswa}
                      </h3>
                      <span className="font-mono text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                        NIM: {mhs.nim}
                      </span>
                      {isValid ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                          <svg className="w-3 h-3 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand-50/50 text-brand-700 border border-brand-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                          Proses
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                      <span>
                        Komponen: <strong>{mhs.sudah_diisi} / {mhs.total_nodes} Node</strong>
                      </span>
                      {mhs.catatan_dosen && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-xs text-gray-600">
                            Catatan Dosen: &quot;{mhs.catatan_dosen}&quot;
                          </span>
                        </>
                      )}
                      {mhs.validated_by && (
                        <>
                          <span>•</span>
                          <span className="text-brand-700">
                            Divalidasi: {mhs.validated_by}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score & Detail Action */}
                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
                      Nilai Akhir
                    </span>
                    <span className="text-xl font-black text-brand-900">
                      {mhs.nilai_akhir != null ? Number(mhs.nilai_akhir).toFixed(1) : "-"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenDetail(mhs)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-white hover:bg-brand-50/80 active:bg-brand-100 border border-brand-200 rounded-lg shadow-2xs transition-all cursor-pointer select-none"
                  >
                    <svg
                      className="h-3.5 w-3.5 text-brand-600 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>Detail Nilai</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Grade Detail Modal */}
      {codeKelas && selectedMhsForDetail && (
        <DosenKaprodiPenilaianDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedMhsForDetail(null);
          }}
          codeKelas={codeKelas}
          codeMahasiswa={selectedMhsForDetail.code_mahasiswa}
          nim={selectedMhsForDetail.nim}
          namaMahasiswa={selectedMhsForDetail.nama_mahasiswa}
          catatanDosen={selectedMhsForDetail.catatan_dosen}
          catatanKaprodi={selectedMhsForDetail.catatan_kaprodi}
          validatedBy={selectedMhsForDetail.validated_by}
          validatedAt={selectedMhsForDetail.validated_at}
        />
      )}
    </div>
  );
}
