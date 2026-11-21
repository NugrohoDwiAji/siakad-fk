import { useState, useEffect, useMemo, useCallback } from "react";
import Button from "@/components/ui/Button";
import { getStaffPembayaran, getStaffPembayaranDetail } from "@/features/admin/api/pembayaran";
import type { StaffPembayaranItem, StaffPembayaranPagination } from "@/features/admin/types";

// ─── Format Date Helper ────────────────────────────────────────────────────────
function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return dateStr;
  }
}

export default function AdminPembayaran() {
  // ─── Data States ───
  const [pembayaranList, setPembayaranList] = useState<StaffPembayaranItem[]>([]);
  const [pagination, setPagination] = useState<StaffPembayaranPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Server Response States ───
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverJumlah, setServerJumlah] = useState<number | null>(null);
  const [showRawResponse, setShowRawResponse] = useState(false);
  const [copied, setCopied] = useState(false);

  // ─── Search & Filters ───
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterSemester, setFilterSemester] = useState<string>("");
  const [filterTahunAkademik, setFilterTahunAkademik] = useState<string>("");

  // ─── Modal Detail State (GET /api/staff/pembayaran/show) ───
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<StaffPembayaranItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailServerMessage, setDetailServerMessage] = useState<string | null>(null);
  const [showDetailRawJson, setShowDetailRawJson] = useState(false);
  const [copiedDetail, setCopiedDetail] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // ─── Handle Fetch Detail (/api/staff/pembayaran/show) ───
  const handleOpenDetail = useCallback(async (code: string) => {
    setSelectedCode(code);
    setIsDetailModalOpen(true);
    setDetailLoading(true);
    setDetailError(null);
    setDetailData(null);
    setDetailServerMessage(null);
    setShowDetailRawJson(false);

    const res = await getStaffPembayaranDetail(code);
    setDetailLoading(false);

    if (!res.status) {
      setDetailError(res.message || "Gagal mengambil detail pembayaran dari server.");
    } else {
      setDetailData(res.data);
      setDetailServerMessage(res.message || "Detail pembayaran berhasil diambil.");
    }
  }, []);

  const handleRetryDetail = useCallback(() => {
    if (selectedCode) {
      handleOpenDetail(selectedCode);
    }
  }, [handleOpenDetail, selectedCode]);

  function handleCopyDetailJson() {
    if (!detailData) return;
    const jsonStr = JSON.stringify(
      {
        status: !detailError,
        message: detailServerMessage,
        data: detailData,
      },
      null,
      2
    );
    navigator.clipboard.writeText(jsonStr);
    setCopiedDetail(true);
    setTimeout(() => setCopiedDetail(false), 2000);
  }

  // ─── Fetch Data ───
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const res = await getStaffPembayaran();
    if (!res.status) {
      setError(res.message || "Gagal memuat data pembayaran dari server.");
      setServerMessage(null);
      setPembayaranList([]);
      setPagination(null);
      setServerJumlah(null);
    } else {
      setServerMessage(res.message || "Data pembayaran berhasil diambil.");
      setServerJumlah(res.data.jumlah);
      setPembayaranList(res.data.data || []);
      setPagination(res.data.pagination || null);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    let ignore = false;
    async function loadInitial() {
      setLoading(true);
      setError(null);
      const res = await getStaffPembayaran();
      if (ignore) return;
      if (!res.status) {
        setError(res.message || "Gagal memuat data pembayaran dari server.");
        setServerMessage(null);
        setPembayaranList([]);
        setPagination(null);
        setServerJumlah(null);
      } else {
        setServerMessage(res.message || "Data pembayaran berhasil diambil.");
        setServerJumlah(res.data.jumlah);
        setPembayaranList(res.data.data || []);
        setPagination(res.data.pagination || null);
      }
      setLoading(false);
    }
    loadInitial();
    return () => {
      ignore = true;
    };
  }, []);

  function handleCopyJson() {
    const jsonStr = JSON.stringify(
      {
        status: !error,
        message: serverMessage,
        jumlah: serverJumlah ?? pembayaranList.length,
        data: pembayaranList,
        pagination: pagination,
      },
      null,
      2
    );
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ─── Filter Options ───
  const statusOptions = useMemo(() => {
    const set = new Set(pembayaranList.map((item) => item.status).filter(Boolean));
    return Array.from(set);
  }, [pembayaranList]);

  const semesterOptions = useMemo(() => {
    const set = new Set(pembayaranList.map((item) => item.semester).filter(Boolean));
    return Array.from(set).sort((a, b) => Number(a) - Number(b));
  }, [pembayaranList]);

  const tahunAkademikOptions = useMemo(() => {
    const set = new Set(pembayaranList.map((item) => item.tahun_akademik).filter(Boolean));
    return Array.from(set);
  }, [pembayaranList]);

  // ─── Filtered Data ───
  const filteredList = useMemo(() => {
    return pembayaranList.filter((item) => {
      if (filterStatus && item.status.toLowerCase() !== filterStatus.toLowerCase()) {
        return false;
      }
      if (filterSemester && String(item.semester) !== filterSemester) {
        return false;
      }
      if (filterTahunAkademik && item.tahun_akademik !== filterTahunAkademik) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNim = item.nim?.toLowerCase().includes(q);
        const matchNama = item.nama_mahasiswa?.toLowerCase().includes(q);
        const matchKet = item.keterangan?.toLowerCase().includes(q);
        return matchNim || matchNama || matchKet;
      }
      return true;
    });
  }, [pembayaranList, filterStatus, filterSemester, filterTahunAkademik, searchQuery]);

  // ─── Statistics ───
  const totalLunas = useMemo(() => {
    return pembayaranList.filter((item) => item.status?.toLowerCase() === "lunas").length;
  }, [pembayaranList]);

  const totalSksOverride = useMemo(() => {
    return pembayaranList.filter((item) => item.sks_override !== null && item.sks_override !== undefined).length;
  }, [pembayaranList]);

  const totalMahasiswaAktif = useMemo(() => {
    return pembayaranList.filter((item) => item.status_mahasiswa?.toLowerCase() === "aktif").length;
  }, [pembayaranList]);

  return (
    <div className="space-y-6">
      {/* ─── Header Banner ─── */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-brand-700 font-semibold uppercase tracking-wider mb-1">
            <span>Keuangan</span>
            <span>•</span>
            <span>Pembayaran Mahasiswa</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            Daftar Pembayaran Mahasiswa
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Pantau status pembayaran UKT, verifikasi tagihan mahasiswa, dan penyesuaian SKS override.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5"
          >
            <svg
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Muat Ulang Data
          </Button>
        </div>
      </div>

      {/* ─── Server Response Success Banner ─── */}
      {serverMessage && !error && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200/90 p-4 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-950 uppercase tracking-wider text-[11px]">
                  Respons Server
                </span>
                <span className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                  HTTP 200 OK
                </span>
              </div>
              <p className="text-emerald-800">
                &ldquo;{serverMessage}&rdquo; &bull; Server mengembalikan <strong>{serverJumlah ?? pembayaranList.length}</strong> data pembayaran.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowRawResponse((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 bg-white text-emerald-800 font-medium hover:bg-emerald-100/60 transition text-xs shrink-0 self-start sm:self-auto shadow-2xs"
          >
            <svg className="h-3.5 w-3.5 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <span>{showRawResponse ? "Sembunyikan JSON" : "Lihat JSON Server"}</span>
          </button>
        </div>
      )}

      {/* ─── Server Raw JSON Inspector ─── */}
      {showRawResponse && (
        <div className="rounded-2xl bg-gray-900 border border-gray-800 p-4 text-xs text-gray-200 space-y-2.5 shadow-xl animate-fadeIn">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-gray-400 text-[11px]">GET /api/staff/pembayaran</span>
            </div>
            <button
              type="button"
              onClick={handleCopyJson}
              className="text-[11px] text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-2.5 py-1 rounded-lg transition flex items-center gap-1 font-mono"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>{copied ? "Tersalin!" : "Salin JSON"}</span>
            </button>
          </div>
          <pre className="max-h-72 overflow-auto font-mono text-[11px] text-emerald-400 p-3 bg-black/50 rounded-xl leading-relaxed">
            {JSON.stringify(
              {
                status: !error,
                message: serverMessage,
                jumlah: serverJumlah ?? pembayaranList.length,
                data: pembayaranList,
                pagination: pagination,
              },
              null,
              2
            )}
          </pre>
        </div>
      )}

      {/* ─── Summary Statistic Cards ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Total Data */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium">Total Pembayaran</span>
            <span className="h-7 w-7 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{pembayaranList.length}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Semua catatan transaksi</p>
          </div>
        </div>

        {/* Total Lunas */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium">Status Lunas</span>
            <span className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-700">{totalLunas}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Pembayaran terverifikasi</p>
          </div>
        </div>

        {/* Mahasiswa Aktif */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium">Mahasiswa Aktif</span>
            <span className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-700">{totalMahasiswaAktif}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Status mahasiswa aktif</p>
          </div>
        </div>

        {/* SKS Override */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium">SKS Override</span>
            <span className="h-7 w-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-700">{totalSksOverride}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Penyesuaian batas SKS</p>
          </div>
        </div>
      </div>

      {/* ─── Search & Filter Bar ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Cari berdasarkan NIM, nama mahasiswa, atau keterangan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-600 focus:bg-white focus:ring-2 focus:ring-brand-100 transition"
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600"
              title="Hapus pencarian"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Status Filter */}
          <div className="w-full sm:w-36">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              aria-label="Filter Status"
              className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-600 focus:bg-white transition"
            >
              <option value="">Semua Status</option>
              {statusOptions.map((st) => (
                <option key={st} value={st}>
                  {st.charAt(0).toUpperCase() + st.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Tahun Akademik Filter */}
          <div className="w-full sm:w-44">
            <select
              value={filterTahunAkademik}
              onChange={(e) => setFilterTahunAkademik(e.target.value)}
              aria-label="Filter Tahun Akademik"
              className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-600 focus:bg-white transition"
            >
              <option value="">Semua T.A.</option>
              {tahunAkademikOptions.map((ta) => (
                <option key={ta} value={ta}>
                  {ta}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div className="w-full sm:w-36">
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              aria-label="Filter Semester"
              className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-600 focus:bg-white transition"
            >
              <option value="">Semua Semester</option>
              {semesterOptions.map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>

          {(searchQuery || filterStatus || filterSemester || filterTahunAkademik) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("");
                setFilterSemester("");
                setFilterTahunAkademik("");
              }}
              className="text-xs text-brand-700 hover:text-brand-800 font-semibold px-2 py-1.5 whitespace-nowrap"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* ─── Error State ─── */}
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
          <Button variant="outline" size="sm" onClick={fetchData}>
            Coba Lagi
          </Button>
        </div>
      )}

      {/* ─── Main Table ─── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-5 bg-gray-200 rounded w-1/4" />
                <div className="h-6 bg-gray-100 rounded-full w-20" />
              </div>
              <div className="h-4 bg-gray-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-xs">
          <div className="h-16 w-16 mx-auto rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
            <svg
              className="h-8 w-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900">
            Tidak ada data pembayaran yang ditemukan
          </h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            {searchQuery || filterStatus || filterSemester || filterTahunAkademik
              ? "Coba ubah kata kunci pencarian atau sesuaikan filter Anda."
              : "Saat ini belum ada data pembayaran yang tercatat pada sistem."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Mahasiswa</th>
                  <th className="py-3 px-4">Periode</th>
                  <th className="py-3 px-4">Tanggal Bayar</th>
                  <th className="py-3 px-4">Keterangan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">SKS Override</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredList.map((item, idx) => (
                  <tr
                    key={item.id || item.code || idx}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    {/* No */}
                    <td className="py-3.5 px-4 text-center text-xs font-mono text-gray-400">
                      {idx + 1}
                    </td>

                    {/* Mahasiswa */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-gray-900">
                            {item.nim}
                          </span>
                          {item.status_mahasiswa && (
                            <span
                              className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                                item.status_mahasiswa.toLowerCase() === "aktif"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {item.status_mahasiswa}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 font-medium">
                          {item.nama_mahasiswa}
                        </p>
                      </div>
                    </td>

                    {/* Periode */}
                    <td className="py-3.5 px-4">
                      <div className="text-xs">
                        <span className="font-semibold text-gray-800">
                          Semester {item.semester}
                        </span>
                        <p className="text-[11px] text-gray-400">
                          T.A. {item.tahun_akademik}
                        </p>
                      </div>
                    </td>

                    {/* Tanggal Bayar */}
                    <td className="py-3.5 px-4 text-xs text-gray-600">
                      <span className="font-medium text-gray-800">
                        {formatDate(item.tanggal_bayar)}
                      </span>
                    </td>

                    {/* Keterangan */}
                    <td className="py-3.5 px-4 text-xs text-gray-600 max-w-xs truncate">
                      {item.keterangan || "-"}
                    </td>

                    {/* Status Pembayaran */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          item.status?.toLowerCase() === "lunas"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {item.status?.toLowerCase() === "lunas" && (
                          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                        {item.status ? item.status.toUpperCase() : "-"}
                      </span>
                    </td>

                    {/* SKS Override */}
                    <td className="py-3.5 px-4 text-center">
                      {item.sks_override ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          <svg className="h-3 w-3 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          {item.sks_override} SKS
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs font-mono">-</span>
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDetail(item.code)}
                        className="text-xs flex items-center gap-1 shadow-2xs hover:bg-brand-50 hover:text-brand-700"
                        title="Lihat detail pembayaran"
                      >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        <span>Detail</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Pagination Info */}
          {pagination && (
            <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
              <div>
                Menampilkan <strong>{pagination.from || 1}</strong> -{" "}
                <strong>{pagination.to || filteredList.length}</strong> dari{" "}
                <strong>{pagination.total || filteredList.length}</strong> data pembayaran
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-gray-600">
                  Halaman {pagination.current_page} dari {pagination.last_page}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Detail Modal (GET /api/staff/pembayaran/show) ─── */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-scaleUp">
            {/* Header Modal */}
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Detail Pembayaran Mahasiswa
                  </h3>
                  <p className="text-xs text-gray-500">
                    Rincian transaksi dan status pembayaran mahasiswa
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Loading State */}
            {detailLoading && (
              <div className="py-10 space-y-4">
                <div className="flex flex-col items-center justify-center text-center space-y-2">
                  <div className="h-9 w-9 rounded-full border-3 border-brand-200 border-t-brand-700 animate-spin" />
                  <p className="text-xs font-medium text-gray-600">
                    Memuat data detail pembayaran...
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 animate-pulse pt-2">
                  <div className="h-14 bg-gray-100 rounded-xl" />
                  <div className="h-14 bg-gray-100 rounded-xl" />
                  <div className="h-14 bg-gray-100 rounded-xl" />
                  <div className="h-14 bg-gray-100 rounded-xl" />
                </div>
              </div>
            )}

            {/* Modal Body: Error State */}
            {!detailLoading && detailError && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-800 space-y-3">
                <div className="flex items-start gap-2.5">
                  <svg className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <div>
                    <p className="font-semibold text-rose-900">Gagal Mengambil Detail Pembayaran</p>
                    <p className="mt-0.5 text-rose-700">{detailError}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1 border-t border-rose-200/60">
                  <Button variant="outline" size="sm" onClick={handleRetryDetail}>
                    Coba Lagi
                  </Button>
                </div>
              </div>
            )}

            {/* Modal Body: Success Data */}
            {!detailLoading && !detailError && detailData && (
              <div className="space-y-4">
                {/* Server Response Message Info */}
                {detailServerMessage && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200/80 px-3.5 py-2.5 flex items-center justify-between text-xs text-emerald-900">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="font-medium text-emerald-850">
                        {detailServerMessage}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDetailRawJson((prev) => !prev)}
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 underline ml-2 shrink-0"
                    >
                      {showDetailRawJson ? "Sembunyikan JSON" : "Lihat JSON Server"}
                    </button>
                  </div>
                )}

                {/* Raw JSON viewer */}
                {showDetailRawJson && (
                  <div className="rounded-xl bg-gray-900 p-3 text-[11px] text-gray-200 font-mono space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between text-gray-400 border-b border-gray-800 pb-1.5">
                      <span>Response: GET /api/staff/pembayaran/show</span>
                      <button
                        type="button"
                        onClick={handleCopyDetailJson}
                        className="text-gray-300 hover:text-white bg-gray-800 px-2 py-0.5 rounded text-[10px]"
                      >
                        {copiedDetail ? "Tersalin!" : "Salin JSON"}
                      </button>
                    </div>
                    <pre className="max-h-56 overflow-auto text-emerald-400">
                      {JSON.stringify(
                        {
                          status: true,
                          message: detailServerMessage,
                          data: detailData,
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                )}

                {/* Grid Info Mahasiswa & Transaksi */}
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                    <span className="text-[11px] text-gray-400">ID Transaksi</span>
                    <p className="font-mono font-bold text-gray-900">#{detailData.id}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                    <span className="text-[11px] text-gray-400">NIM Mahasiswa</span>
                    <p className="font-mono font-bold text-gray-900">{detailData.nim}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                    <span className="text-[11px] text-gray-400">Nama Mahasiswa</span>
                    <p className="font-bold text-gray-900 truncate">{detailData.nama_mahasiswa}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                    <span className="text-[11px] text-gray-400">Status Mahasiswa</span>
                    <div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                        {detailData.status_mahasiswa || "Aktif"}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                    <span className="text-[11px] text-gray-400">Status Pembayaran</span>
                    <div>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                          String(detailData.status).toLowerCase() === "lunas"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {detailData.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                    <span className="text-[11px] text-gray-400">Semester & T.A.</span>
                    <p className="font-medium text-gray-900">
                      Semester {detailData.semester} • T.A. {detailData.tahun_akademik}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                    <span className="text-[11px] text-gray-400">Kode Tahun Akademik</span>
                    <p className="font-mono font-medium text-gray-900">
                      {detailData.kode_tahun_akademik}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                    <span className="text-[11px] text-gray-400">Tanggal Bayar</span>
                    <p className="font-medium text-gray-900">
                      {formatDate(detailData.tanggal_bayar)}
                    </p>
                  </div>
                </div>

                {/* Keterangan */}
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs space-y-1">
                  <span className="text-[11px] text-gray-400">Keterangan Transaksi</span>
                  <p className="text-gray-800 font-medium">{detailData.keterangan || "-"}</p>
                </div>

                {/* SKS Override Section */}
                <div className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/40 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5">
                      <svg className="h-4 w-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      Informasi SKS Override
                    </span>
                    <span className="font-bold text-amber-800">
                      {detailData.sks_override ? `${detailData.sks_override} SKS` : "Tidak ada override"}
                    </span>
                  </div>
                  {detailData.sks_override ? (
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 pt-1 border-t border-amber-100">
                      <div>
                        <span className="text-gray-400">Alasan:</span>{" "}
                        <span className="text-gray-800">{detailData.sks_override_reason || "-"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Diberikan Oleh:</span>{" "}
                        <span className="text-gray-800">{detailData.sks_override_by || "-"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Waktu Override:</span>{" "}
                        <span className="text-gray-800">{formatDate(detailData.sks_override_at || undefined)}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-500">
                      Mahasiswa ini tidak memiliki pengaturan SKS override khusus.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Footer Modal */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
