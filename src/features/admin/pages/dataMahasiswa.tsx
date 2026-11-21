import { useState, useEffect, useRef, useCallback } from "react";
import { getListMahasiswa, getDetailMahasiswa, searchMahasiswa, createMahasiswa, updateMahasiswa, deleteMahasiswa, getListProgramStudi } from "@/features/admin/api/masterData";
import type { MahasiswaItem, MahasiswaDetail, MahasiswaSearchItem, Pagination, CreateMahasiswaRequest, UpdateMahasiswaRequest, ProgramStudiItem } from "@/features/admin/types";
import MahasiswaDetailModal from "../components/organisms/MahasiswaDetailModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
  A: "bg-green-100 text-green-700 border border-green-200",
  C: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  L: "bg-blue-100 text-blue-700 border border-blue-200",
  K: "bg-red-100 text-red-700 border border-red-200",
};

const STATUS_LABEL: Record<string, string> = {
  A: "Aktif",
  C: "Cuti",
  L: "Lulus",
  K: "Keluar",
};

const DEBOUNCE_MS = 2000;

// ─── Component ───────────────────────────────────────────────────────────────

export default function DataMahasiswa() {
  const [data, setData] = useState<MahasiswaItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<MahasiswaDetail | null>(null);

  // ── Edit modal ──
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editData, setEditData] = useState<MahasiswaDetail | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editErrors, setEditErrors] = useState<Record<string, string[]> | null>(null);

  // ── Delete confirmation ──
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteCode, setDeleteCode] = useState<string | null>(null);
  const [deleteNama, setDeleteNama] = useState<string>("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ── Toast notification ──
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // ── Program Studi list ──
  const [programStudiList, setProgramStudiList] = useState<ProgramStudiItem[]>([]);

  // ── Search state ──
  const [searchResults, setSearchResults] = useState<MahasiswaSearchItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Add form ──
  const [addOpen, setAddOpen] = useState(false);
  const [addSaving, setAddSaving] = useState(false);
  const [addErrors, setAddErrors] = useState<Record<string, string[]> | null>(null);
  const [addFormData, setAddFormData] = useState<CreateMahasiswaRequest>({
    nim: "",
    nik: "",
    npm: "",
    nomor_pendaftaran: "",
    nomor_pendaftaran_ulang: "",
    program_studi_kode: "",
    nama_mahasiswa: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    alamat: "",
    kota: "",
    propinsi: "",
    telepon: "",
    jenis_kelamin: "L",
    agama: "Islam",
    golongan_darah: "A",
    kewarganegaraan: "Indonesia",
    email: "",
    nama_ayah: "",
    agama_ayah: "Islam",
    pekerjaan_ayah: "",
    nama_ibu: "",
    agama_ibu: "Islam",
    pekerjaan_ibu: "",
    alamat_orangtua: "",
    kota_orangtua: "",
    propinsi_orangtua: "",
    telepon_orangtua: "",
    foto: null,
    status: "A",
    status_pendaftaran: "B",
  });

  // ── Fetch Program Studi ──
  useEffect(() => {
    async function fetchProgramStudi() {
      const result = await getListProgramStudi(1, 100);
      if (result.status) {
        setProgramStudiList(result.data.data);
      }
    }
    fetchProgramStudi();
  }, []);

  // ── Fetch list (non-search) ──
  useEffect(() => {
    if (isSearching) return;

    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      const result = await getListMahasiswa(page, 20);

      if (cancelled) return;

      if (!result.status) {
        setError(result.message);
        setData([]);
      } else {
        setData(result.data.data);
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
      const result = await searchMahasiswa(value.trim());
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

  // ── Cleanup timer ──
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // ── Detail modal ──
  async function handleShowDetail(code: string) {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailData(null);
    const result = await getDetailMahasiswa(code);
    if (result.status) {
      setDetailData(result.data);
    }
    setDetailLoading(false);
  }

  // ── Edit handlers ──
  async function handleEditClick(code: string) {
    setEditOpen(true);
    setEditLoading(true);
    setEditData(null);
    setEditErrors(null);
    const result = await getDetailMahasiswa(code);
    if (result.status) {
      setEditData(result.data);
    }
    setEditLoading(false);
  }

  function handleEditInputChange(field: keyof MahasiswaDetail, value: string) {
    if (!editData) return;
    setEditData({ ...editData, [field]: value });
    // Clear field error when user types
    if (editErrors?.[field]) {
      setEditErrors((prev) => {
        if (!prev) return null;
        const next = { ...prev };
        delete next[field];
        return Object.keys(next).length === 0 ? null : next;
      });
    }
  }

  async function handleEditSave() {
    if (!editData) return;
    setEditSaving(true);
    setEditErrors(null);

    const updateData: UpdateMahasiswaRequest = {
      code: editData.code,
      nim: editData.nim,
      nik: editData.nik,
      npm: editData.npm,
      nomor_pendaftaran: editData.nomor_pendaftaran,
      nomor_pendaftaran_ulang: editData.nomor_pendaftaran_ulang,
      program_studi_kode: editData.nama_program_studi,
      nama_mahasiswa: editData.nama_mahasiswa,
      tempat_lahir: editData.tempat_lahir,
      tanggal_lahir: editData.tanggal_lahir,
      alamat: editData.alamat,
      kota: editData.kota,
      propinsi: editData.propinsi,
      telepon: editData.telepon,
      jenis_kelamin: editData.jenis_kelamin,
      agama: editData.agama,
      golongan_darah: editData.golongan_darah,
      kewarganegaraan: editData.kewarganegaraan,
      email: editData.email,
      nama_ayah: editData.nama_ayah,
      agama_ayah: editData.agama_ayah,
      pekerjaan_ayah: editData.pekerjaan_ayah,
      nama_ibu: editData.nama_ibu,
      agama_ibu: editData.agama_ibu,
      pekerjaan_ibu: editData.pekerjaan_ibu,
      alamat_orangtua: editData.alamat_orangtua,
      kota_orangtua: editData.kota_orangtua,
      propinsi_orangtua: editData.propinsi_orangtua,
      telepon_orangtua: editData.telepon_orangtua,
      foto: editData.foto,
      status: editData.status,
      status_pendaftaran: editData.status_pendaftaran,
    };

    const result = await updateMahasiswa(updateData);
    setEditSaving(false);
    if (result.status) {
      setToast({ type: "success", message: "Data mahasiswa berhasil diperbarui." });
      setEditOpen(false);
      setEditData(null);
      setEditErrors(null);
      // Refresh list
      const listResult = await getListMahasiswa(page, 20);
      if (listResult.status) {
        setData(listResult.data.data);
        setPagination(listResult.data.pagination);
      }
    } else {
      if (result.errors) {
        setEditErrors(result.errors);
      }
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
    const result = await deleteMahasiswa(deleteCode);
    setDeleteLoading(false);
    if (result.status) {
      setToast({ type: "success", message: "Data mahasiswa berhasil dihapus." });
      setDeleteOpen(false);
      setDeleteCode(null);
      setDeleteNama("");
      // Refresh list
      const listResult = await getListMahasiswa(page, 20);
      if (listResult.status) {
        setData(listResult.data.data);
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
  function handleAddInputChange(field: keyof CreateMahasiswaRequest, value: string) {
    setAddFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field error when user types
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
      nim: "",
      nik: "",
      npm: "",
      nomor_pendaftaran: "",
      nomor_pendaftaran_ulang: "",
      program_studi_kode: "",
      nama_mahasiswa: "",
      tempat_lahir: "",
      tanggal_lahir: "",
      alamat: "",
      kota: "",
      propinsi: "",
      telepon: "",
      jenis_kelamin: "L",
      agama: "Islam",
      golongan_darah: "A",
      kewarganegaraan: "Indonesia",
      email: "",
      nama_ayah: "",
      agama_ayah: "Islam",
      pekerjaan_ayah: "",
      nama_ibu: "",
      agama_ibu: "Islam",
      pekerjaan_ibu: "",
      alamat_orangtua: "",
      kota_orangtua: "",
      propinsi_orangtua: "",
      telepon_orangtua: "",
      foto: null,
      status: "A",
      status_pendaftaran: "B",
    });
    setAddErrors(null);
  }

  async function handleAddSubmit() {
    setAddSaving(true);
    setAddErrors(null);
    const result = await createMahasiswa(addFormData);
    setAddSaving(false);
    if (result.status) {
      setToast({ type: "success", message: "Mahasiswa berhasil ditambahkan." });
      setAddOpen(false);
      resetAddForm();
      // Refresh list
      setPage(1);
      const listResult = await getListMahasiswa(1, 20);
      if (listResult.status) {
        setData(listResult.data.data);
        setPagination(listResult.data.pagination);
      }
    } else {
      // Check if there are validation errors
      if (result.errors) {
        setAddErrors(result.errors);
      }
      setToast({ type: "error", message: result.message || "Gagal menambahkan mahasiswa." });
    }
  }

  const totalPages = pagination?.last_page ?? 1;
  const currentPage = pagination?.current_page ?? page;

  const displayData = isSearching ? searchResults : data;

  return (
    <div className="space-y-4 p-6">
      {/* ── Header ── */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Data Mahasiswa</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {pagination ? `${pagination.total} mahasiswa terdaftar` : "Memuat data..."}
          </p>
        </div>
        <button
          onClick={() => { resetAddForm(); setAddOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Mahasiswa
        </button>
      </div>

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
            placeholder="Cari nama mahasiswa..."
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
          Hasil pencarian: <span className="font-semibold text-gray-600">{searchResults.length}</span> mahasiswa ditemukan
        </p>
      )}

      {/* ── Table ── */}
      {!loading && !searchLoading && !error && (
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 w-12">No</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">NIM</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Nama</th>
                  {!isSearching && (
                    <>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Program Studi</th>
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
                    <td colSpan={isSearching ? 4 : 8} className="px-4 py-10 text-center text-gray-400">
                      {isSearching ? "Tidak ada mahasiswa yang sesuai." : "Tidak ada data mahasiswa."}
                    </td>
                  </tr>
                ) : (
                  displayData.map((m, idx) => {
                    const isSearchResult = isSearching && "nim" in m;
                    const code = isSearchResult ? m.code : (m as MahasiswaItem).code;
                    const nim = isSearchResult ? m.nim : (m as MahasiswaItem).nim;
                    const nama = m.nama_mahasiswa;
                    const item = isSearchResult ? null : (m as MahasiswaItem);

                    return (
                      <tr key={code} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                        <td className="px-4 py-3 font-mono text-gray-700">{nim}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{nama}</td>
                        {!isSearching && item && (
                          <>
                            <td className="px-4 py-3 text-gray-600">{item.nama_program_studi}</td>
                            <td className="px-4 py-3 text-gray-600">{item.email}</td>
                            <td className="px-4 py-3 text-gray-600">{item.telepon}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[item.status] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}>
                                {STATUS_LABEL[item.status] ?? item.status}
                              </span>
                            </td>
                          </>
                        )}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              title="Lihat Detail"
                              onClick={() => handleShowDetail(code)}
                              className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              title="Edit"
                              onClick={() => handleEditClick(code)}
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
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination (only when not searching) ── */}
          {!isSearching && pagination && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Menampilkan {pagination.from}–{pagination.to} dari {pagination.total}
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Sebelumnya
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
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
                            currentPage === item
                              ? "bg-blue-600 text-white"
                              : "border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {item}
                        </button>
                      ),
                    )}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
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

      {/* ── Detail Modal ── */}
      <MahasiswaDetailModal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        data={detailData}
        loading={detailLoading}
      />

      {/* ── Edit Modal ── */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-10">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl my-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <h2 className="text-lg font-semibold text-gray-800">Edit Mahasiswa</h2>
              <button
                onClick={() => { setEditOpen(false); setEditData(null); setEditErrors(null); }}
                className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4 space-y-6">
              {editLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              ) : editData ? (
                <>
                  {/* General Error */}
                  {editErrors?.general && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm">
                      {editErrors.general.map((msg, i) => (
                        <p key={i}>{msg}</p>
                      ))}
                    </div>
                  )}

                  {/* Section: Data Pribadi */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">Data Pribadi</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">NIM</label>
                        <input
                          type="text"
                          value={editData.nim}
                          onChange={(e) => handleEditInputChange("nim", e.target.value)}
                          className={`w-full rounded-lg border ${editErrors?.nim ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                        />
                        {editErrors?.nim && <p className="mt-1 text-xs text-red-500">{editErrors.nim[0]}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">NIK</label>
                        <input
                          type="text"
                          value={editData.nik}
                          onChange={(e) => handleEditInputChange("nik", e.target.value)}
                          className={`w-full rounded-lg border ${editErrors?.nik ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                        />
                        {editErrors?.nik && <p className="mt-1 text-xs text-red-500">{editErrors.nik[0]}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">NPM</label>
                        <input
                          type="text"
                          value={editData.npm}
                          onChange={(e) => handleEditInputChange("npm", e.target.value)}
                          className={`w-full rounded-lg border ${editErrors?.npm ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                        />
                        {editErrors?.npm && <p className="mt-1 text-xs text-red-500">{editErrors.npm[0]}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Nama Lengkap</label>
                        <input
                          type="text"
                          value={editData.nama_mahasiswa}
                          onChange={(e) => handleEditInputChange("nama_mahasiswa", e.target.value)}
                          className={`w-full rounded-lg border ${editErrors?.nama_mahasiswa ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                        />
                        {editErrors?.nama_mahasiswa && <p className="mt-1 text-xs text-red-500">{editErrors.nama_mahasiswa[0]}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                        <input
                          type="email"
                          value={editData.email}
                          onChange={(e) => handleEditInputChange("email", e.target.value)}
                          className={`w-full rounded-lg border ${editErrors?.email ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                        />
                        {editErrors?.email && <p className="mt-1 text-xs text-red-500">{editErrors.email[0]}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Tempat Lahir</label>
                        <input
                          type="text"
                          value={editData.tempat_lahir}
                          onChange={(e) => handleEditInputChange("tempat_lahir", e.target.value)}
                          className={`w-full rounded-lg border ${editErrors?.tempat_lahir ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                        />
                        {editErrors?.tempat_lahir && <p className="mt-1 text-xs text-red-500">{editErrors.tempat_lahir[0]}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal Lahir</label>
                        <input
                          type="date"
                          value={editData.tanggal_lahir}
                          onChange={(e) => handleEditInputChange("tanggal_lahir", e.target.value)}
                          className={`w-full rounded-lg border ${editErrors?.tanggal_lahir ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                        />
                        {editErrors?.tanggal_lahir && <p className="mt-1 text-xs text-red-500">{editErrors.tanggal_lahir[0]}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Telepon</label>
                        <input
                          type="text"
                          value={editData.telepon || ""}
                          onChange={(e) => handleEditInputChange("telepon", e.target.value)}
                          className={`w-full rounded-lg border ${editErrors?.telepon ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                        />
                        {editErrors?.telepon && <p className="mt-1 text-xs text-red-500">{editErrors.telepon[0]}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Jenis Kelamin</label>
                        <select
                          value={editData.jenis_kelamin}
                          onChange={(e) => handleEditInputChange("jenis_kelamin", e.target.value)}
                          className={`w-full rounded-lg border ${editErrors?.jenis_kelamin ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                        >
                          <option value="L">Laki-laki</option>
                          <option value="P">Perempuan</option>
                        </select>
                        {editErrors?.jenis_kelamin && <p className="mt-1 text-xs text-red-500">{editErrors.jenis_kelamin[0]}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Agama</label>
                        <select
                          value={editData.agama}
                          onChange={(e) => handleEditInputChange("agama", e.target.value)}
                          className={`w-full rounded-lg border ${editErrors?.agama ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                        >
                          <option value="Islam">Islam</option>
                          <option value="Kristen">Kristen</option>
                          <option value="Katolik">Katolik</option>
                          <option value="Hindu">Hindu</option>
                          <option value="Buddha">Buddha</option>
                          <option value="Konghucu">Konghucu</option>
                        </select>
                        {editErrors?.agama && <p className="mt-1 text-xs text-red-500">{editErrors.agama[0]}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Golongan Darah</label>
                        <select
                          value={editData.golongan_darah}
                          onChange={(e) => handleEditInputChange("golongan_darah", e.target.value)}
                          className={`w-full rounded-lg border ${editErrors?.golongan_darah ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="AB">AB</option>
                          <option value="O">O</option>
                        </select>
                        {editErrors?.golongan_darah && <p className="mt-1 text-xs text-red-500">{editErrors.golongan_darah[0]}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Kewarganegaraan</label>
                        <input
                          type="text"
                          value={editData.kewarganegaraan}
                          onChange={(e) => handleEditInputChange("kewarganegaraan", e.target.value)}
                          className={`w-full rounded-lg border ${editErrors?.kewarganegaraan ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                        />
                        {editErrors?.kewarganegaraan && <p className="mt-1 text-xs text-red-500">{editErrors.kewarganegaraan[0]}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Section: Alamat */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">Alamat</h3>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Alamat</label>
                      <textarea
                        value={editData.alamat}
                        onChange={(e) => handleEditInputChange("alamat", e.target.value)}
                        rows={2}
                        className={`w-full rounded-lg border ${editErrors?.alamat ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition resize-none`}
                      />
                      {editErrors?.alamat && <p className="mt-1 text-xs text-red-500">{editErrors.alamat[0]}</p>}
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Kota</label>
                        <input
                          type="text"
                          value={editData.kota}
                          onChange={(e) => handleEditInputChange("kota", e.target.value)}
                          className={`w-full rounded-lg border ${editErrors?.kota ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                        />
                        {editErrors?.kota && <p className="mt-1 text-xs text-red-500">{editErrors.kota[0]}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Provinsi</label>
                        <input
                          type="text"
                          value={editData.propinsi}
                          onChange={(e) => handleEditInputChange("propinsi", e.target.value)}
                          className={`w-full rounded-lg border ${editErrors?.propinsi ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                        />
                        {editErrors?.propinsi && <p className="mt-1 text-xs text-red-500">{editErrors.propinsi[0]}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Section: Data Orang Tua */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">Data Orang Tua</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Nama Ayah</label>
                        <input
                          type="text"
                          value={editData.nama_ayah}
                          onChange={(e) => handleEditInputChange("nama_ayah", e.target.value)}
                          className={`w-full rounded-lg border ${editErrors?.nama_ayah ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                        />
                        {editErrors?.nama_ayah && <p className="mt-1 text-xs text-red-500">{editErrors.nama_ayah[0]}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Agama Ayah</label>
                        <select
                          value={editData.agama_ayah}
                          onChange={(e) => handleEditInputChange("agama_ayah", e.target.value)}
                          className={`w-full rounded-lg border ${editErrors?.agama_ayah ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                        >
                          <option value="Islam">Islam</option>
                          <option value="Kristen">Kristen</option>
                          <option value="Katolik">Katolik</option>
                          <option value="Hindu">Hindu</option>
                          <option value="Buddha">Buddha</option>
                          <option value="Konghucu">Konghucu</option>
                        </select>
                        {editErrors?.agama_ayah && <p className="mt-1 text-xs text-red-500">{editErrors.agama_ayah[0]}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Pekerjaan Ayah</label>
                        <input
                          type="text"
                          value={editData.pekerjaan_ayah}
                          onChange={(e) => handleEditInputChange("pekerjaan_ayah", e.target.value)}
                          className={`w-full rounded-lg border ${editErrors?.pekerjaan_ayah ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                        />
                        {editErrors?.pekerjaan_ayah && <p className="mt-1 text-xs text-red-500">{editErrors.pekerjaan_ayah[0]}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Nama Ibu</label>
                        <input
                          type="text"
                          value={editData.nama_ibu}
                          onChange={(e) => handleEditInputChange("nama_ibu", e.target.value)}
                          className={`w-full rounded-lg border ${editErrors?.nama_ibu ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                        />
                        {editErrors?.nama_ibu && <p className="mt-1 text-xs text-red-500">{editErrors.nama_ibu[0]}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Agama Ibu</label>
                        <select
                          value={editData.agama_ibu}
                          onChange={(e) => handleEditInputChange("agama_ibu", e.target.value)}
                          className={`w-full rounded-lg border ${editErrors?.agama_ibu ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                        >
                          <option value="Islam">Islam</option>
                          <option value="Kristen">Kristen</option>
                          <option value="Katolik">Katolik</option>
                          <option value="Hindu">Hindu</option>
                          <option value="Buddha">Buddha</option>
                          <option value="Konghucu">Konghucu</option>
                        </select>
                        {editErrors?.agama_ibu && <p className="mt-1 text-xs text-red-500">{editErrors.agama_ibu[0]}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Pekerjaan Ibu</label>
                        <input
                          type="text"
                          value={editData.pekerjaan_ibu}
                          onChange={(e) => handleEditInputChange("pekerjaan_ibu", e.target.value)}
                          className={`w-full rounded-lg border ${editErrors?.pekerjaan_ibu ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                        />
                        {editErrors?.pekerjaan_ibu && <p className="mt-1 text-xs text-red-500">{editErrors.pekerjaan_ibu[0]}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Alamat Orang Tua</label>
                        <input
                          type="text"
                          value={editData.alamat_orangtua}
                          onChange={(e) => handleEditInputChange("alamat_orangtua", e.target.value)}
                          className={`w-full rounded-lg border ${editErrors?.alamat_orangtua ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                        />
                        {editErrors?.alamat_orangtua && <p className="mt-1 text-xs text-red-500">{editErrors.alamat_orangtua[0]}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Telepon Orang Tua</label>
                        <input
                          type="text"
                          value={editData.telepon_orangtua}
                          onChange={(e) => handleEditInputChange("telepon_orangtua", e.target.value)}
                          className={`w-full rounded-lg border ${editErrors?.telepon_orangtua ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                        />
                        {editErrors?.telepon_orangtua && <p className="mt-1 text-xs text-red-500">{editErrors.telepon_orangtua[0]}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Kota Orang Tua</label>
                        <input
                          type="text"
                          value={editData.kota_orangtua}
                          onChange={(e) => handleEditInputChange("kota_orangtua", e.target.value)}
                          className={`w-full rounded-lg border ${editErrors?.kota_orangtua ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                        />
                        {editErrors?.kota_orangtua && <p className="mt-1 text-xs text-red-500">{editErrors.kota_orangtua[0]}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Provinsi Orang Tua</label>
                        <input
                          type="text"
                          value={editData.propinsi_orangtua}
                          onChange={(e) => handleEditInputChange("propinsi_orangtua", e.target.value)}
                          className={`w-full rounded-lg border ${editErrors?.propinsi_orangtua ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                        />
                        {editErrors?.propinsi_orangtua && <p className="mt-1 text-xs text-red-500">{editErrors.propinsi_orangtua[0]}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Section: Pendaftaran */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">Data Pendaftaran</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Nomor Pendaftaran</label>
                        <input
                          type="text"
                          value={editData.nomor_pendaftaran}
                          onChange={(e) => handleEditInputChange("nomor_pendaftaran", e.target.value)}
                          className={`w-full rounded-lg border ${editErrors?.nomor_pendaftaran ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                        />
                        {editErrors?.nomor_pendaftaran && <p className="mt-1 text-xs text-red-500">{editErrors.nomor_pendaftaran[0]}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Nomor Pendaftaran Ulang</label>
                        <input
                          type="text"
                          value={editData.nomor_pendaftaran_ulang}
                          onChange={(e) => handleEditInputChange("nomor_pendaftaran_ulang", e.target.value)}
                          className={`w-full rounded-lg border ${editErrors?.nomor_pendaftaran_ulang ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                        />
                        {editErrors?.nomor_pendaftaran_ulang && <p className="mt-1 text-xs text-red-500">{editErrors.nomor_pendaftaran_ulang[0]}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Kode Program Studi</label>
                        <input
                          type="text"
                          value={editData.nama_program_studi}
                          onChange={(e) => handleEditInputChange("nama_program_studi", e.target.value)}
                          className={`w-full rounded-lg border ${editErrors?.program_studi_kode ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                        />
                        {editErrors?.program_studi_kode && <p className="mt-1 text-xs text-red-500">{editErrors.program_studi_kode[0]}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                        <select
                          value={editData.status}
                          onChange={(e) => handleEditInputChange("status", e.target.value)}
                          className={`w-full rounded-lg border ${editErrors?.status ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                        >
                          <option value="A">Aktif</option>
                          <option value="N">Nonaktif</option>
                        </select>
                        {editErrors?.status && <p className="mt-1 text-xs text-red-500">{editErrors.status[0]}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Status Pendaftaran</label>
                        <select
                          value={editData.status_pendaftaran}
                          onChange={(e) => handleEditInputChange("status_pendaftaran", e.target.value)}
                          className={`w-full rounded-lg border ${editErrors?.status_pendaftaran ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                        >
                          <option value="B">Baru</option>
                          <option value="L">Lama</option>
                          <option value="T">Transfer</option>
                        </select>
                        {editErrors?.status_pendaftaran && <p className="mt-1 text-xs text-red-500">{editErrors.status_pendaftaran[0]}</p>}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-center text-gray-400 py-8">Gagal memuat data.</p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white rounded-b-2xl">
              <button
                onClick={() => { setEditOpen(false); setEditData(null); setEditErrors(null); }}
                disabled={editSaving}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition"
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
                  <h3 className="text-lg font-semibold text-gray-800">Hapus Mahasiswa</h3>
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

      {/* ── Add Mahasiswa Modal ── */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-10">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl my-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <h2 className="text-lg font-semibold text-gray-800">Tambah Mahasiswa Baru</h2>
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
            <div className="px-6 py-4 space-y-6">
              {/* General Error */}
              {addErrors?.general && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm">
                  {addErrors.general.map((msg, i) => (
                    <p key={i}>{msg}</p>
                  ))}
                </div>
              )}

              {/* Section: Data Pribadi */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">Data Pribadi</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">NIM <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={addFormData.nim}
                      onChange={(e) => handleAddInputChange("nim", e.target.value)}
                      className={`w-full rounded-lg border ${addErrors?.nim ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                    />
                    {addErrors?.nim && <p className="mt-1 text-xs text-red-500">{addErrors.nim[0]}</p>}
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
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">NPM <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={addFormData.npm}
                      onChange={(e) => handleAddInputChange("npm", e.target.value)}
                      className={`w-full rounded-lg border ${addErrors?.npm ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                    />
                    {addErrors?.npm && <p className="mt-1 text-xs text-red-500">{addErrors.npm[0]}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={addFormData.nama_mahasiswa}
                      onChange={(e) => handleAddInputChange("nama_mahasiswa", e.target.value)}
                      className={`w-full rounded-lg border ${addErrors?.nama_mahasiswa ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                    />
                    {addErrors?.nama_mahasiswa && <p className="mt-1 text-xs text-red-500">{addErrors.nama_mahasiswa[0]}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Email <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      value={addFormData.email}
                      onChange={(e) => handleAddInputChange("email", e.target.value)}
                      className={`w-full rounded-lg border ${addErrors?.email ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                    />
                    {addErrors?.email && <p className="mt-1 text-xs text-red-500">{addErrors.email[0]}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Tempat Lahir <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={addFormData.tempat_lahir}
                      onChange={(e) => handleAddInputChange("tempat_lahir", e.target.value)}
                      className={`w-full rounded-lg border ${addErrors?.tempat_lahir ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                    />
                    {addErrors?.tempat_lahir && <p className="mt-1 text-xs text-red-500">{addErrors.tempat_lahir[0]}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal Lahir <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={addFormData.tanggal_lahir}
                      onChange={(e) => handleAddInputChange("tanggal_lahir", e.target.value)}
                      className={`w-full rounded-lg border ${addErrors?.tanggal_lahir ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                    />
                    {addErrors?.tanggal_lahir && <p className="mt-1 text-xs text-red-500">{addErrors.tanggal_lahir[0]}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Telepon</label>
                    <input
                      type="text"
                      value={addFormData.telepon || ""}
                      onChange={(e) => handleAddInputChange("telepon", e.target.value)}
                      className={`w-full rounded-lg border ${addErrors?.telepon ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                    />
                    {addErrors?.telepon && <p className="mt-1 text-xs text-red-500">{addErrors.telepon[0]}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Jenis Kelamin <span className="text-red-500">*</span></label>
                    <select
                      value={addFormData.jenis_kelamin}
                      onChange={(e) => handleAddInputChange("jenis_kelamin", e.target.value)}
                      className={`w-full rounded-lg border ${addErrors?.jenis_kelamin ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                    >
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                    {addErrors?.jenis_kelamin && <p className="mt-1 text-xs text-red-500">{addErrors.jenis_kelamin[0]}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Agama <span className="text-red-500">*</span></label>
                    <select
                      value={addFormData.agama}
                      onChange={(e) => handleAddInputChange("agama", e.target.value)}
                      className={`w-full rounded-lg border ${addErrors?.agama ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                    >
                      <option value="Islam">Islam</option>
                      <option value="Kristen">Kristen</option>
                      <option value="Katolik">Katolik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Buddha">Buddha</option>
                      <option value="Konghucu">Konghucu</option>
                    </select>
                    {addErrors?.agama && <p className="mt-1 text-xs text-red-500">{addErrors.agama[0]}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Golongan Darah <span className="text-red-500">*</span></label>
                    <select
                      value={addFormData.golongan_darah}
                      onChange={(e) => handleAddInputChange("golongan_darah", e.target.value)}
                      className={`w-full rounded-lg border ${addErrors?.golongan_darah ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="AB">AB</option>
                      <option value="O">O</option>
                    </select>
                    {addErrors?.golongan_darah && <p className="mt-1 text-xs text-red-500">{addErrors.golongan_darah[0]}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Kewarganegaraan <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={addFormData.kewarganegaraan}
                      onChange={(e) => handleAddInputChange("kewarganegaraan", e.target.value)}
                      className={`w-full rounded-lg border ${addErrors?.kewarganegaraan ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                    />
                    {addErrors?.kewarganegaraan && <p className="mt-1 text-xs text-red-500">{addErrors.kewarganegaraan[0]}</p>}
                  </div>
                </div>
              </div>

              {/* Section: Alamat */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">Alamat</h3>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Alamat <span className="text-red-500">*</span></label>
                  <textarea
                    value={addFormData.alamat}
                    onChange={(e) => handleAddInputChange("alamat", e.target.value)}
                    rows={2}
                    className={`w-full rounded-lg border ${addErrors?.alamat ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition resize-none`}
                  />
                  {addErrors?.alamat && <p className="mt-1 text-xs text-red-500">{addErrors.alamat[0]}</p>}
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Kota <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={addFormData.kota}
                      onChange={(e) => handleAddInputChange("kota", e.target.value)}
                      className={`w-full rounded-lg border ${addErrors?.kota ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                    />
                    {addErrors?.kota && <p className="mt-1 text-xs text-red-500">{addErrors.kota[0]}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Provinsi <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={addFormData.propinsi}
                      onChange={(e) => handleAddInputChange("propinsi", e.target.value)}
                      className={`w-full rounded-lg border ${addErrors?.propinsi ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                    />
                    {addErrors?.propinsi && <p className="mt-1 text-xs text-red-500">{addErrors.propinsi[0]}</p>}
                  </div>
                </div>
              </div>

              {/* Section: Data Orang Tua */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">Data Orang Tua</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Nama Ayah <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={addFormData.nama_ayah}
                      onChange={(e) => handleAddInputChange("nama_ayah", e.target.value)}
                      className={`w-full rounded-lg border ${addErrors?.nama_ayah ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                    />
                    {addErrors?.nama_ayah && <p className="mt-1 text-xs text-red-500">{addErrors.nama_ayah[0]}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Agama Ayah <span className="text-red-500">*</span></label>
                    <select
                      value={addFormData.agama_ayah}
                      onChange={(e) => handleAddInputChange("agama_ayah", e.target.value)}
                      className={`w-full rounded-lg border ${addErrors?.agama_ayah ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                    >
                      <option value="Islam">Islam</option>
                      <option value="Kristen">Kristen</option>
                      <option value="Katolik">Katolik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Buddha">Buddha</option>
                      <option value="Konghucu">Konghucu</option>
                    </select>
                    {addErrors?.agama_ayah && <p className="mt-1 text-xs text-red-500">{addErrors.agama_ayah[0]}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Pekerjaan Ayah <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={addFormData.pekerjaan_ayah}
                      onChange={(e) => handleAddInputChange("pekerjaan_ayah", e.target.value)}
                      className={`w-full rounded-lg border ${addErrors?.pekerjaan_ayah ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                    />
                    {addErrors?.pekerjaan_ayah && <p className="mt-1 text-xs text-red-500">{addErrors.pekerjaan_ayah[0]}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Nama Ibu <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={addFormData.nama_ibu}
                      onChange={(e) => handleAddInputChange("nama_ibu", e.target.value)}
                      className={`w-full rounded-lg border ${addErrors?.nama_ibu ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                    />
                    {addErrors?.nama_ibu && <p className="mt-1 text-xs text-red-500">{addErrors.nama_ibu[0]}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Agama Ibu <span className="text-red-500">*</span></label>
                    <select
                      value={addFormData.agama_ibu}
                      onChange={(e) => handleAddInputChange("agama_ibu", e.target.value)}
                      className={`w-full rounded-lg border ${addErrors?.agama_ibu ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                    >
                      <option value="Islam">Islam</option>
                      <option value="Kristen">Kristen</option>
                      <option value="Katolik">Katolik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Buddha">Buddha</option>
                      <option value="Konghucu">Konghucu</option>
                    </select>
                    {addErrors?.agama_ibu && <p className="mt-1 text-xs text-red-500">{addErrors.agama_ibu[0]}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Pekerjaan Ibu <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={addFormData.pekerjaan_ibu}
                      onChange={(e) => handleAddInputChange("pekerjaan_ibu", e.target.value)}
                      className={`w-full rounded-lg border ${addErrors?.pekerjaan_ibu ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                    />
                    {addErrors?.pekerjaan_ibu && <p className="mt-1 text-xs text-red-500">{addErrors.pekerjaan_ibu[0]}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Alamat Orang Tua <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={addFormData.alamat_orangtua}
                      onChange={(e) => handleAddInputChange("alamat_orangtua", e.target.value)}
                      className={`w-full rounded-lg border ${addErrors?.alamat_orangtua ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                    />
                    {addErrors?.alamat_orangtua && <p className="mt-1 text-xs text-red-500">{addErrors.alamat_orangtua[0]}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Telepon Orang Tua <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={addFormData.telepon_orangtua}
                      onChange={(e) => handleAddInputChange("telepon_orangtua", e.target.value)}
                      className={`w-full rounded-lg border ${addErrors?.telepon_orangtua ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                    />
                    {addErrors?.telepon_orangtua && <p className="mt-1 text-xs text-red-500">{addErrors.telepon_orangtua[0]}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Kota Orang Tua <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={addFormData.kota_orangtua}
                      onChange={(e) => handleAddInputChange("kota_orangtua", e.target.value)}
                      className={`w-full rounded-lg border ${addErrors?.kota_orangtua ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                    />
                    {addErrors?.kota_orangtua && <p className="mt-1 text-xs text-red-500">{addErrors.kota_orangtua[0]}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Provinsi Orang Tua <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={addFormData.propinsi_orangtua}
                      onChange={(e) => handleAddInputChange("propinsi_orangtua", e.target.value)}
                      className={`w-full rounded-lg border ${addErrors?.propinsi_orangtua ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                    />
                    {addErrors?.propinsi_orangtua && <p className="mt-1 text-xs text-red-500">{addErrors.propinsi_orangtua[0]}</p>}
                  </div>
                </div>
              </div>

              {/* Section: Pendaftaran */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">Data Pendaftaran</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Nomor Pendaftaran <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={addFormData.nomor_pendaftaran}
                      onChange={(e) => handleAddInputChange("nomor_pendaftaran", e.target.value)}
                      className={`w-full rounded-lg border ${addErrors?.nomor_pendaftaran ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                    />
                    {addErrors?.nomor_pendaftaran && <p className="mt-1 text-xs text-red-500">{addErrors.nomor_pendaftaran[0]}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Nomor Pendaftaran Ulang <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={addFormData.nomor_pendaftaran_ulang}
                      onChange={(e) => handleAddInputChange("nomor_pendaftaran_ulang", e.target.value)}
                      className={`w-full rounded-lg border ${addErrors?.nomor_pendaftaran_ulang ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                    />
                    {addErrors?.nomor_pendaftaran_ulang && <p className="mt-1 text-xs text-red-500">{addErrors.nomor_pendaftaran_ulang[0]}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Program Studi <span className="text-red-500">*</span></label>
                    <select
                      value={addFormData.program_studi_kode}
                      onChange={(e) => handleAddInputChange("program_studi_kode", e.target.value)}
                      className={`w-full rounded-lg border ${addErrors?.program_studi_kode ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                    >
                      <option value="">-- Pilih Program Studi --</option>
                      {programStudiList.map((ps) => (
                        <option key={ps.code} value={ps.code}>
                          {ps.nama_program_studi} ({ps.singkatan_program_studi})
                        </option>
                      ))}
                    </select>
                    {addErrors?.program_studi_kode && <p className="mt-1 text-xs text-red-500">{addErrors.program_studi_kode[0]}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Status <span className="text-red-500">*</span></label>
                    <select
                      value={addFormData.status}
                      onChange={(e) => handleAddInputChange("status", e.target.value)}
                      className={`w-full rounded-lg border ${addErrors?.status ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                    >
                      <option value="A">Aktif</option>
                      <option value="N">Nonaktif</option>
                    </select>
                    {addErrors?.status && <p className="mt-1 text-xs text-red-500">{addErrors.status[0]}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Status Pendaftaran <span className="text-red-500">*</span></label>
                    <select
                      value={addFormData.status_pendaftaran}
                      onChange={(e) => handleAddInputChange("status_pendaftaran", e.target.value)}
                      className={`w-full rounded-lg border ${addErrors?.status_pendaftaran ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                    >
                      <option value="B">Baru</option>
                      <option value="L">Lama</option>
                      <option value="T">Transfer</option>
                    </select>
                    {addErrors?.status_pendaftaran && <p className="mt-1 text-xs text-red-500">{addErrors.status_pendaftaran[0]}</p>}
                  </div>
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