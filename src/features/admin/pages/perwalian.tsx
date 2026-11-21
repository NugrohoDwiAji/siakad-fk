import { useState, useEffect, useCallback, useRef } from "react";
import { getPerwalianList, getPerwalianByDosen, getPerwalianByMahasiswa, deletePerwalian } from "@/features/admin/api/perwalian";
import { getListDosen } from "@/features/admin/api/masterData";
import type { PerwalianItem, DosenItem, Pagination } from "@/features/admin/types";
import PerwalianFormCard from "../components/organisms/PerwalianFormCard";
import PerwalianDetailCard from "../components/organisms/PerwalianDetailCard";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DEBOUNCE_MS = 500;
const DEBOUNCE_MHS_MS = 2000;

// ─── Component ────────────────────────────────────────────────────────────────

export default function Perwalian() {
  const [data, setData] = useState<PerwalianItem[]>([]);
  const [jumlah, setJumlah] = useState<number>(0);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);

  // ── Filter state ──
  const [dosenList, setDosenList] = useState<DosenItem[]>([]);
  const [selectedDosen, setSelectedDosen] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<PerwalianItem[]>([]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Mahasiswa search state ──
  const [mhsSearchQuery, setMhsSearchQuery] = useState("");
  const [mhsSearchResults, setMhsSearchResults] = useState<PerwalianItem[]>([]);
  const [mhsSearchLoading, setMhsSearchLoading] = useState(false);
  const [isMhsSearching, setIsMhsSearching] = useState(false);
  const mhsDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Form state ──
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<PerwalianItem | undefined>(undefined);

  // ── Detail state ──
  const [detailData, setDetailData] = useState<PerwalianItem | null>(null);

  // ── Delete state ──
  const [confirmDeleteCode, setConfirmDeleteCode] = useState<string | null>(null);
  const [confirmDeleteNama, setConfirmDeleteNama] = useState<string>("");
  const [deleting, setDeleting] = useState(false);

  // ── Toast ──
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // ── Fetch dosen list for filter ──
  useEffect(() => {
    let cancelled = false;

    async function fetchDosen() {
      const result = await getListDosen(1, 100);
      if (cancelled) return;

      if (result.status && result.data) {
        setDosenList(result.data.data);
      }
    }

    fetchDosen();
    return () => { cancelled = true; };
  }, []);

  // ── Fetch data (non-search) ──
  useEffect(() => {
    if (isSearching || isMhsSearching) return;

    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      const result = await getPerwalianList(undefined, selectedDosen || undefined, 20);

      if (cancelled) return;

      if (!result.status) {
        setError(result.message);
        setData([]);
        setJumlah(0);
      } else {
        setData(result.data.data);
        setJumlah(result.data.jumlah);
        setPagination(result.data.pagination);
      }

      setLoading(false);
    }

    fetchData();
    return () => { cancelled = true; };
  }, [selectedDosen, page, refetchKey, isSearching, isMhsSearching]);

  // ── Debounced search by dosen ──
  const handleSearchInput = useCallback((value: string) => {
    setSearchQuery(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!value.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchLoading(true);

    debounceTimer.current = setTimeout(async () => {
      const result = await getPerwalianByDosen(undefined, value.trim());
      if (result.status) {
        setSearchResults(Array.isArray(result.data.data) ? result.data.data : []);
      } else {
        setSearchResults([]);
      }
      setSearchLoading(false);
    }, DEBOUNCE_MS);
  }, []);

  function clearSearch() {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    setSearchQuery("");
    setSearchResults([]);
    setIsSearching(false);
  }

  // ── Debounced search by mahasiswa ──
  const handleMhsSearchInput = useCallback((value: string) => {
    setMhsSearchQuery(value);

    if (mhsDebounceTimer.current) {
      clearTimeout(mhsDebounceTimer.current);
    }

    if (!value.trim()) {
      setIsMhsSearching(false);
      setMhsSearchResults([]);
      return;
    }

    setIsMhsSearching(true);
    setMhsSearchLoading(true);

    mhsDebounceTimer.current = setTimeout(async () => {
      const result = await getPerwalianByMahasiswa(undefined, value.trim());
      if (result.status) {
        setMhsSearchResults(Array.isArray(result.data.data) ? result.data.data : []);
      } else {
        setMhsSearchResults([]);
      }
      setMhsSearchLoading(false);
    }, DEBOUNCE_MHS_MS);
  }, []);

  function clearMhsSearch() {
    if (mhsDebounceTimer.current) {
      clearTimeout(mhsDebounceTimer.current);
    }
    setMhsSearchQuery("");
    setMhsSearchResults([]);
    setIsMhsSearching(false);
  }

  // ── Toast auto-hide ──
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ── Cleanup timer ──
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (mhsDebounceTimer.current) {
        clearTimeout(mhsDebounceTimer.current);
      }
    };
  }, []);

  // ── Handlers ──
  function handleAdd() {
    setEditData(undefined);
    setShowForm(true);
  }

  function handleEdit(item: PerwalianItem) {
    setEditData(item);
    setShowForm(true);
  }

  function handleFormClose() {
    setShowForm(false);
    setEditData(undefined);
  }

  function handleFormSuccess() {
    handleFormClose();
    setToast({ type: "success", message: editData ? "Perwalian berhasil diperbarui." : "Perwalian berhasil ditambahkan." });
    setRefetchKey((k) => k + 1);
  }

  function handleDeleteClick(code: string, nama: string) {
    setConfirmDeleteCode(code);
    setConfirmDeleteNama(nama);
  }

  async function handleDeleteConfirm() {
    if (!confirmDeleteCode) return;
    setDeleting(true);

    const result = await deletePerwalian(confirmDeleteCode);
    setDeleting(false);

    if (result.status) {
      setToast({ type: "success", message: "Perwalian berhasil dihapus." });
      setConfirmDeleteCode(null);
      setConfirmDeleteNama("");
      setRefetchKey((k) => k + 1);
    } else {
      setToast({ type: "error", message: result.message || "Gagal menghapus perwalian." });
    }
  }

  const raw = isMhsSearching ? mhsSearchResults : (isSearching ? searchResults : data);
  const displayData = Array.isArray(raw) ? raw : [];
  const isLoading = loading || searchLoading || mhsSearchLoading;
  const activeSearchLabel = isMhsSearching
    ? `Hasil pencarian mahasiswa: ${mhsSearchResults.length} perwalian ditemukan`
    : isSearching
      ? `Hasil pencarian dosen: ${searchResults.length} perwalian ditemukan`
      : null;

  return (
    <div className="space-y-4 p-6">
      {/* ── Header ── */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Perwalian</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {loading ? "Memuat data..." : `${jumlah} data perwalian terdaftar`}
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-800 text-white text-sm font-semibold hover:bg-brand-700 active:scale-95 transition-all shadow-sm shrink-0"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tambah Perwalian
        </button>
      </div>

      {/* ── Filter ── */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-5 py-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Filter by dosen */}
          <select
            value={selectedDosen}
            onChange={(e) => { setSelectedDosen(e.target.value); clearSearch(); clearMhsSearch(); }}
            className="w-full sm:w-64 rounded-lg border border-gray-200 bg-gray-50 py-2 pl-3 pr-4 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
          >
            <option value="">Semua Dosen Wali</option>
            {dosenList.map((d) => (
              <option key={d.code} value={d.code}>{d.nama_dosen}</option>
            ))}
          </select>

          {/* Search by nama dosen */}
          <div className="relative flex-1 max-w-sm">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              {searchLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              )}
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              placeholder="Cari nama dosen wali..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Search by mahasiswa */}
          <div className="relative flex-1 max-w-sm">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              {mhsSearchLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </span>
            <input
              type="text"
              value={mhsSearchQuery}
              onChange={(e) => handleMhsSearchInput(e.target.value)}
              placeholder="Cari nama/NIM mahasiswa..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
            />
            {mhsSearchQuery && (
              <button
                type="button"
                onClick={clearMhsSearch}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[60] px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
          toast.type === "success"
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {toast.message}
        </div>
      )}

      {/* ── Popup Forms ── */}
      {showForm && (
        <PerwalianFormCard
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          editData={editData}
        />
      )}

      {detailData && (
        <PerwalianDetailCard
          data={detailData}
          onClose={() => setDetailData(null)}
        />
      )}

      {/* ── Loading ── */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
        </div>
      )}

      {/* ── Search Results Info ── */}
      {activeSearchLabel && !isLoading && (
        <p className="text-xs text-gray-400">
          {activeSearchLabel}
        </p>
      )}

      {/* ── Table ── */}
      {!isLoading && !error && (
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          {/* ── Pagination Top ── */}
          {!isSearching && !isMhsSearching && pagination && pagination.last_page > 1 && (
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Menampilkan {pagination.from}–{pagination.to} dari {pagination.total}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.current_page <= 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Sebelumnya
                </button>
                {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === pagination.last_page || Math.abs(p - pagination.current_page) <= 1)
                  .reduce<(number | string)[]>((acc, p, idx, arr) => {
                    if (idx > 0 && typeof arr[idx - 1] === "number" && p - (arr[idx - 1] as number) > 1) {
                      acc.push("...");
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    typeof item === "string" ? (
                      <span key={`dots-${idx}`} className="px-2 py-1.5 text-xs text-gray-400">...</span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setPage(item)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          pagination.current_page === item
                            ? "bg-brand-800 text-white"
                            : "border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {item}
                      </button>
                    ),
                  )}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
                  disabled={pagination.current_page >= pagination.last_page}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}

          {/* ── Scrollable Table ── */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 w-12">No</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">NIM</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Nama Mahasiswa</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Program Studi</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Dosen Wali</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Dosen Perwakilan</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600 w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                      {(isSearching || isMhsSearching) ? "Tidak ada perwalian yang sesuai." : "Tidak ada data perwalian."}
                    </td>
                  </tr>
                ) : (
                  displayData.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3 text-gray-500">{(isSearching || isMhsSearching) ? idx + 1 : (pagination?.from ?? 0) + idx}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{item.nim}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{item.nama_mahasiswa}</td>
                      <td className="px-4 py-3 text-gray-600">{item.nama_program_studi}</td>
                      <td className="px-4 py-3 text-gray-600">{item.nama_dosen}</td>
                      <td className="px-4 py-3 text-gray-600">{item.nama_dosen_perwakilan || "-"}</td>
                      <td className="px-4 py-3">
                        {confirmDeleteCode === item.code ? (
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-xs text-red-600 mr-1">Hapus {confirmDeleteNama}?</span>
                            <button
                              type="button"
                              onClick={handleDeleteConfirm}
                              disabled={deleting}
                              className="px-2.5 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition disabled:opacity-50"
                            >
                              {deleting ? "..." : "Ya"}
                            </button>
                            <button
                              type="button"
                              onClick={() => { setConfirmDeleteCode(null); setConfirmDeleteNama(""); }}
                              className="px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              title="Lihat Detail"
                              onClick={() => setDetailData(item)}
                              className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              title="Edit"
                              onClick={() => handleEdit(item)}
                              className="p-1.5 rounded-md text-amber-600 hover:bg-amber-50 transition"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              title="Hapus"
                              onClick={() => handleDeleteClick(item.code, item.nama_mahasiswa)}
                              className="p-1.5 rounded-md text-red-600 hover:bg-red-50 transition"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination Bottom ── */}
          {!isSearching && !isMhsSearching && pagination && pagination.last_page > 1 && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Menampilkan {pagination.from}–{pagination.to} dari {pagination.total}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.current_page <= 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Sebelumnya
                </button>
                {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === pagination.last_page || Math.abs(p - pagination.current_page) <= 1)
                  .reduce<(number | string)[]>((acc, p, idx, arr) => {
                    if (idx > 0 && typeof arr[idx - 1] === "number" && p - (arr[idx - 1] as number) > 1) {
                      acc.push("...");
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    typeof item === "string" ? (
                      <span key={`dots-${idx}`} className="px-2 py-1.5 text-xs text-gray-400">...</span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setPage(item)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          pagination.current_page === item
                            ? "bg-brand-800 text-white"
                            : "border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {item}
                      </button>
                    ),
                  )}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
                  disabled={pagination.current_page >= pagination.last_page}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
