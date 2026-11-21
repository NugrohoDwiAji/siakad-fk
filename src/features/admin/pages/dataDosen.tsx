import { useState, useEffect, useCallback, useRef } from "react";
import { getListDosen, searchDosen, createDosen, updateDosen, deleteDosen } from "@/features/admin/api/masterData";
import KaprodiTab from "@/features/admin/components/organisms/KaprodiTab";
import type { DosenItem, DosenSearchItem, CreateDosenRequest, Pagination } from "@/features/admin/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_AKTIF: Record<string, string> = {
  A: "bg-green-100 text-green-700 border border-green-200",
  N: "bg-red-100 text-red-700 border border-red-200",
};

const STATUS_AKTIF_LABEL: Record<string, string> = {
  A: "Aktif",
  N: "Nonaktif",
};

const STATUS_DOSEN: Record<string, string> = {
  T: "bg-blue-100 text-blue-700 border border-blue-200",
  L: "bg-amber-100 text-amber-700 border border-amber-200",
};

const STATUS_DOSEN_LABEL: Record<string, string> = {
  T: "Tetap",
  L: "Tidak Tetap",
};

const DEBOUNCE_MS = 2000;

// ─── Component ───────────────────────────────────────────────────────────────

export default function DataDosen() {
  const [data, setData] = useState<DosenItem[]>([]);
  const [jumlah, setJumlah] = useState<number>(0);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<DosenSearchItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Tab state ──
  const [activeTab, setActiveTab] = useState<"dosen" | "kaprodi">("dosen");

  // ── Edit modal ──
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState<DosenItem | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  // ── Delete confirmation ──
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteCode, setDeleteCode] = useState<string | null>(null);
  const [deleteNama, setDeleteNama] = useState<string>("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ── Toast notification ──
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // ── Add form ──
  const [addOpen, setAddOpen] = useState(false);
  const [addSaving, setAddSaving] = useState(false);
  const [addErrors, setAddErrors] = useState<Record<string, string[]> | null>(null);
  const [addFormData, setAddFormData] = useState<CreateDosenRequest>({
    nama_dosen: "",
    nik: "",
    no_telp: "",
    alamat_email: "",
    field_studi: "",
    alumni: "",
    homebase: "",
    status_dosen: "T",
    aktif: "A",
    chatid: "",
    sandi_pengguna: "",
  });

  // ── Fetch list ──
  useEffect(() => {
    if (isSearching) return;

    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      const result = await getListDosen(page, 20);

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
  }, [page, isSearching]);

  // ── Debounced search ──
  const handleSearchInput = useCallback((value: string) => {
    setSearch(value);

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
      const result = await searchDosen(value.trim());
      if (result.status) {
        setSearchResults(result.data);
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
    setSearch("");
    setSearchResults([]);
    setIsSearching(false);
  }

  // ── Edit handlers ──
  function handleEditClick(dosen: DosenItem) {
    setEditData({ ...dosen });
    setEditOpen(true);
  }

  async function handleEditSave() {
    if (!editData) return;
    setEditSaving(true);
    const result = await updateDosen(editData.code, editData);
    setEditSaving(false);
    if (result.status) {
      setToast({ type: "success", message: "Data dosen berhasil diperbarui." });
      setEditOpen(false);
      setEditData(null);
      // Refresh list
      const listResult = await getListDosen(page, 20);
      if (listResult.status) {
        setData(listResult.data.data);
        setJumlah(listResult.data.jumlah);
        setPagination(listResult.data.pagination);
      }
    } else {
      setToast({ type: "error", message: result.message || "Gagal memperbarui data." });
    }
  }

  // ── Delete handlers ──
  function handleDeleteClick(code: string, nama: string) {
    setDeleteCode(code);
    setDeleteNama(nama);
    setDeleteOpen(true);
    setDeleteError(null);
  }

  async function handleDeleteConfirm() {
    if (!deleteCode) return;
    setDeleteLoading(true);
    setDeleteError(null);
    const result = await deleteDosen(deleteCode);
    setDeleteLoading(false);
    if (result.status) {
      setToast({ type: "success", message: "Data dosen berhasil dihapus." });
      setDeleteOpen(false);
      setDeleteCode(null);
      setDeleteNama("");
      // Refresh list
      const listResult = await getListDosen(page, 20);
      if (listResult.status) {
        setData(listResult.data.data);
        setJumlah(listResult.data.jumlah);
        setPagination(listResult.data.pagination);
      }
    } else {
      setDeleteError(result.message || "Gagal menghapus data.");
    }
  }

  // ── Auto-hide toast ──
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ── Add form handlers ──
  function handleAddInputChange(field: keyof CreateDosenRequest, value: string) {
    setAddFormData((prev) => ({ ...prev, [field]: value }));
    if (addErrors?.[field]) {
      setAddErrors((prev) => {
        if (!prev) return null;
        const next = { ...prev };
        delete next[field];
        return Object.keys(next).length === 0 ? null : next;
      });
    }
  }

  function resetAddForm() {
    setAddFormData({
      nama_dosen: "",
      nik: "",
      no_telp: "",
      alamat_email: "",
      field_studi: "",
      alumni: "",
      homebase: "",
      status_dosen: "T",
      aktif: "A",
      chatid: "",
      sandi_pengguna: "",
    });
    setAddErrors(null);
  }

  async function handleAddSubmit() {
    setAddSaving(true);
    setAddErrors(null);
    const result = await createDosen(addFormData);
    setAddSaving(false);
    if (result.status) {
      setToast({ type: "success", message: "Dosen berhasil ditambahkan." });
      setAddOpen(false);
      resetAddForm();
      setPage(1);
      const listResult = await getListDosen(1, 20);
      if (listResult.status) {
        setData(listResult.data.data);
        setJumlah(listResult.data.jumlah);
        setPagination(listResult.data.pagination);
      }
    } else {
      setToast({ type: "error", message: result.message || "Gagal menambahkan dosen." });
    }
  }

  // ── Cleanup timer ──
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const displayData = isSearching ? searchResults : data;

  return (
    <div className="space-y-4 p-6">
      {/* ── Header ── */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Data Dosen</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {activeTab === "dosen"
              ? loading
                ? "Memuat data..."
                : `${jumlah} dosen terdaftar`
              : "Ketua Program Studi"}
          </p>
        </div>
        {activeTab === "dosen" && (
          <button
            onClick={() => { resetAddForm(); setAddOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Tambah Dosen
          </button>
        )}
      </div>

      {/* ── Tabs Switcher ── */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("dosen")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === "dosen"
              ? "bg-white text-gray-800 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          Daftar Dosen
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("kaprodi")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === "kaprodi"
              ? "bg-white text-gray-800 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          Kaprodi
        </button>
      </div>

      {/* ── Content: Kaprodi ── */}
      {activeTab === "kaprodi" && <KaprodiTab />}

      {/* ── Content: Daftar Dosen ── */}
      {activeTab === "dosen" && (
        <>
          {/* ── Search ── */}
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-5 py-4">
            <div className="relative max-w-sm">
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
                value={search}
                onChange={(e) => handleSearchInput(e.target.value)}
                placeholder="Cari nama dosen..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
              />
              {search && (
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
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm">
              {error}
            </div>
          )}

          {/* ── Loading ── */}
          {(loading || searchLoading) && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          )}

          {/* ── Search Results Info ── */}
          {isSearching && !searchLoading && (
            <p className="text-xs text-gray-400">
              Hasil pencarian: <span className="font-semibold text-gray-600">{searchResults.length}</span> dosen ditemukan
            </p>
          )}

          {/* ── Table ── */}
          {!loading && !searchLoading && !error && (
            <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
              {/* ── Pagination Top ── */}
              {!isSearching && pagination && (
                <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Menampilkan {pagination.from}–{pagination.to} dari {pagination.total}
                  </p>
                  {pagination.last_page > 1 && (
                    <div className="flex items-center gap-1">
                      <button
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
                              onClick={() => setPage(item)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                pagination.current_page === item
                                  ? "bg-blue-600 text-white"
                                  : "border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              {item}
                            </button>
                          ),
                        )}
                      <button
                        onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
                        disabled={pagination.current_page >= pagination.last_page}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        Selanjutnya
                      </button>
                    </div>
                  )}
                </div>
              )}

          {/* ── Scrollable Table ── */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 w-12">No</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">NIK</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Nama Dosen</th>
                  {!isSearching && (
                    <>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Field Studi</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Alumni</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Homebase</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Email</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Telepon</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                    </>
                  )}
                  <th className="px-4 py-3 text-center font-semibold text-gray-600 w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayData.length === 0 ? (
                  <tr>
                    <td colSpan={isSearching ? 4 : 10} className="px-4 py-10 text-center text-gray-400">
                      {isSearching ? "Tidak ada dosen yang sesuai." : "Tidak ada data dosen."}
                    </td>
                  </tr>
                ) : (
                  displayData.map((d, idx) => {
                    const isSearchResult = isSearching && "code" in d;
                    const code = isSearchResult ? d.code : (d as DosenItem).code;
                    const nik = isSearchResult ? d.nik : (d as DosenItem).nik;
                    const nama = d.nama_dosen;
                    const item = isSearchResult ? null : (d as DosenItem);

                    return (
                      <tr key={code} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3 text-gray-500">{(pagination?.from ?? 0) + idx}</td>
                        <td className="px-4 py-3 font-mono text-gray-700">{nik}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{nama}</td>
                        {!isSearching && item && (
                          <>
                            <td className="px-4 py-3 text-gray-600">{item.field_studi}</td>
                            <td className="px-4 py-3 text-gray-600">{item.alumni}</td>
                            <td className="px-4 py-3 text-gray-600">{item.homebase}</td>
                            <td className="px-4 py-3 text-gray-600">{item.alamat_email}</td>
                            <td className="px-4 py-3 text-gray-600">{item.no_telp}</td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-1">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_AKTIF[item.aktif] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}>
                                  {STATUS_AKTIF_LABEL[item.aktif] ?? item.aktif}
                                </span>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_DOSEN[item.status_dosen] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}>
                                  {STATUS_DOSEN_LABEL[item.status_dosen] ?? item.status_dosen}
                                </span>
                              </div>
                            </td>
                          </>
                        )}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              title="Lihat Detail"
                              className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            {!isSearching && item && (
                              <>
                                <button
                                  title="Edit"
                                  onClick={() => handleEditClick(item)}
                                  className="p-1.5 rounded-md text-amber-600 hover:bg-amber-50 transition"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  title="Hapus"
                                  onClick={() => handleDeleteClick(code, nama)}
                                  className="p-1.5 rounded-md text-red-600 hover:bg-red-50 transition"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination Bottom ── */}
          {!isSearching && pagination && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Menampilkan {pagination.from}–{pagination.to} dari {pagination.total}
              </p>
              {pagination.last_page > 1 && (
                <div className="flex items-center gap-1">
                  <button
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
                          onClick={() => setPage(item)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                            pagination.current_page === item
                              ? "bg-blue-600 text-white"
                              : "border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {item}
                        </button>
                      ),
                    )}
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
                    disabled={pagination.current_page >= pagination.last_page}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Selanjutnya
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  )}

      {/* ── Edit Modal ── */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Edit Dosen</h2>
              <button
                onClick={() => { setEditOpen(false); setEditData(null); }}
                className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {editData && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">NIK</label>
                      <input
                        type="text"
                        value={editData.nik}
                        onChange={(e) => setEditData({ ...editData, nik: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Nama Dosen</label>
                      <input
                        type="text"
                        value={editData.nama_dosen}
                        onChange={(e) => setEditData({ ...editData, nama_dosen: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                      <input
                        type="email"
                        value={editData.alamat_email}
                        onChange={(e) => setEditData({ ...editData, alamat_email: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Telepon</label>
                      <input
                        type="text"
                        value={editData.no_telp}
                        onChange={(e) => setEditData({ ...editData, no_telp: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Field Studi</label>
                      <input
                        type="text"
                        value={editData.field_studi}
                        onChange={(e) => setEditData({ ...editData, field_studi: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Alumni</label>
                      <input
                        type="text"
                        value={editData.alumni}
                        onChange={(e) => setEditData({ ...editData, alumni: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Homebase</label>
                      <input
                        type="text"
                        value={editData.homebase}
                        onChange={(e) => setEditData({ ...editData, homebase: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Status Aktif</label>
                      <select
                        value={editData.aktif}
                        onChange={(e) => setEditData({ ...editData, aktif: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                      >
                        <option value="A">Aktif</option>
                        <option value="N">Nonaktif</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Status Dosen</label>
                    <select
                      value={editData.status_dosen}
                      onChange={(e) => setEditData({ ...editData, status_dosen: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                    >
                      <option value="T">Tetap</option>
                      <option value="L">Tidak Tetap</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => { setEditOpen(false); setEditData(null); }}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition"
              >
                Batal
              </button>
              <button
                onClick={handleEditSave}
                disabled={editSaving || !editData}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {editSaving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Hapus Dosen</h3>
                  <p className="text-sm text-gray-500">Tindakan ini tidak dapat dibatalkan.</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Apakah Anda yakin ingin menghapus <span className="font-semibold">{deleteNama}</span>?
              </p>
              {deleteError && (
                <p className="mt-2 text-sm text-red-600">{deleteError}</p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => { setDeleteOpen(false); setDeleteCode(null); setDeleteNama(""); }}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {deleteLoading ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Dosen Modal ── */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-10">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <h2 className="text-lg font-semibold text-gray-800">Tambah Dosen Baru</h2>
              <button
                onClick={() => { setAddOpen(false); resetAddForm(); }}
                className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4 space-y-4">
              {/* General Error */}
              {addErrors?.general && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm">
                  {addErrors.general.map((msg, i) => (
                    <p key={i}>{msg}</p>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nama Dosen <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={addFormData.nama_dosen}
                    onChange={(e) => handleAddInputChange("nama_dosen", e.target.value)}
                    className={`w-full rounded-lg border ${addErrors?.nama_dosen ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                  />
                  {addErrors?.nama_dosen && <p className="mt-1 text-xs text-red-500">{addErrors.nama_dosen[0]}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">NIK <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={addFormData.nik}
                    onChange={(e) => handleAddInputChange("nik", e.target.value)}
                    className={`w-full rounded-lg border ${addErrors?.nik ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                  />
                  {addErrors?.nik && <p className="mt-1 text-xs text-red-500">{addErrors.nik[0]}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={addFormData.alamat_email}
                    onChange={(e) => handleAddInputChange("alamat_email", e.target.value)}
                    className={`w-full rounded-lg border ${addErrors?.alamat_email ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                  />
                  {addErrors?.alamat_email && <p className="mt-1 text-xs text-red-500">{addErrors.alamat_email[0]}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Telepon <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={addFormData.no_telp}
                    onChange={(e) => handleAddInputChange("no_telp", e.target.value)}
                    className={`w-full rounded-lg border ${addErrors?.no_telp ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                  />
                  {addErrors?.no_telp && <p className="mt-1 text-xs text-red-500">{addErrors.no_telp[0]}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Field Studi <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={addFormData.field_studi}
                    onChange={(e) => handleAddInputChange("field_studi", e.target.value)}
                    className={`w-full rounded-lg border ${addErrors?.field_studi ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                  />
                  {addErrors?.field_studi && <p className="mt-1 text-xs text-red-500">{addErrors.field_studi[0]}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Alumni <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={addFormData.alumni}
                    onChange={(e) => handleAddInputChange("alumni", e.target.value)}
                    className={`w-full rounded-lg border ${addErrors?.alumni ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                  />
                  {addErrors?.alumni && <p className="mt-1 text-xs text-red-500">{addErrors.alumni[0]}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Homebase <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={addFormData.homebase}
                    onChange={(e) => handleAddInputChange("homebase", e.target.value)}
                    className={`w-full rounded-lg border ${addErrors?.homebase ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                  />
                  {addErrors?.homebase && <p className="mt-1 text-xs text-red-500">{addErrors.homebase[0]}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Status Dosen <span className="text-red-500">*</span></label>
                  <select
                    value={addFormData.status_dosen}
                    onChange={(e) => handleAddInputChange("status_dosen", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                  >
                    <option value="T">Tetap</option>
                    <option value="L">Tidak Tetap</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Status Aktif <span className="text-red-500">*</span></label>
                  <select
                    value={addFormData.aktif}
                    onChange={(e) => handleAddInputChange("aktif", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                  >
                    <option value="A">Aktif</option>
                    <option value="N">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Chat ID</label>
                  <input
                    type="text"
                    value={addFormData.chatid || ""}
                    onChange={(e) => handleAddInputChange("chatid", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Sandi Pengguna <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    value={addFormData.sandi_pengguna}
                    onChange={(e) => handleAddInputChange("sandi_pengguna", e.target.value)}
                    className={`w-full rounded-lg border ${addErrors?.sandi_pengguna ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                  />
                  {addErrors?.sandi_pengguna && <p className="mt-1 text-xs text-red-500">{addErrors.sandi_pengguna[0]}</p>}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white rounded-b-2xl">
              <button
                onClick={() => { setAddOpen(false); resetAddForm(); }}
                disabled={addSaving}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleAddSubmit}
                disabled={addSaving}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {addSaving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notification ── */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg transition-all ${
          toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
        }`}>
          {toast.type === "success" ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}