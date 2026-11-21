import { useState, useEffect } from "react";
import { getListMatakuliah, getMataKuliahDetail, createMatakuliah, updateMatakuliah, deleteMatakuliah, getListProgramStudi } from "@/features/admin/api/masterData";
import type { MataKuliahItem, MataKuliahDetail, CreateMataKuliahRequest, UpdateMataKuliahRequest, Pagination, ProgramStudiItem } from "@/features/admin/types";

// ─── Component ───────────────────────────────────────────────────────────────

export default function MataKuliah() {
  const [data, setData] = useState<MataKuliahItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Edit modal ──
  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editErrors, setEditErrors] = useState<Record<string, string[]> | null>(null);
  const [editFormData, setEditFormData] = useState<UpdateMataKuliahRequest>({
    code: "",
    kode_matakuliah: "",
    nama_matakuliah: "",
    jenis: "1",
    sks_teori: 0,
    sks_praktik: 0,
    block: "0",
    kode_program_studi: "",
  });

  // ── Delete confirmation ──
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteNama, setDeleteNama] = useState<string>("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ── Detail modal ──
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<MataKuliahDetail | null>(null);

  // ── Add form ──
  const [addOpen, setAddOpen] = useState(false);
  const [addSaving, setAddSaving] = useState(false);
  const [addErrors, setAddErrors] = useState<Record<string, string[]> | null>(null);
  const [addFormData, setAddFormData] = useState<CreateMataKuliahRequest>({
    kode_matakuliah: "",
    nama_matakuliah: "",
    jenis: true,
    sks_teori: 0,
    sks_praktik: 0,
    block: "0",
    code_program_studi: "",
  });

  // ── Toast notification ──
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // ── Program Studi list ──
  const [programStudiList, setProgramStudiList] = useState<ProgramStudiItem[]>([]);

  // ── Filter state ──
  const [filterProgramStudi, setFilterProgramStudi] = useState<string>("");
  const [perPage, setPerPage] = useState(20);

  useEffect(() => {
    async function fetchProgramStudi() {
      const result = await getListProgramStudi(1, 100);
      if (result.status) {
        setProgramStudiList(result.data.data);
      }
    }
    fetchProgramStudi();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      const result = await getListMatakuliah(filterProgramStudi || undefined, perPage);

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
  }, [filterProgramStudi, perPage]);

  // ── Edit handlers ──
  function handleEditClick(mk: MataKuliahItem) {
    setEditFormData({
      code: mk.code,
      kode_matakuliah: mk.kode_matakuliah,
      nama_matakuliah: mk.nama_matakuliah,
      jenis: "1",
      sks_teori: mk.sks_teori,
      sks_praktik: mk.sks_praktik,
      block: mk.block ? "1" : "0",
      kode_program_studi: "",
    });
    setEditErrors(null);
    setEditOpen(true);
  }

  function handleEditInputChange(field: keyof UpdateMataKuliahRequest, value: string | number) {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
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
    setEditSaving(true);
    setEditErrors(null);
    const result = await updateMatakuliah(editFormData);
    setEditSaving(false);
    if (result.status) {
      setToast({ type: "success", message: "Data mata kuliah berhasil diperbarui." });
      setEditOpen(false);
      setEditErrors(null);
      const listResult = await getListMatakuliah(filterProgramStudi || undefined, perPage);
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
    setDeleteId(code);
    setDeleteNama(nama);
    setDeleteOpen(true);
    setDeleteError(null);
  }

  async function handleDeleteConfirm() {
    if (!deleteId) return;
    setDeleteLoading(true);
    setDeleteError(null);
    const result = await deleteMatakuliah(deleteId);
    setDeleteLoading(false);
    if (result.status) {
      setToast({ type: "success", message: "Data mata kuliah berhasil dihapus." });
      setDeleteOpen(false);
      setDeleteId(null);
      setDeleteNama("");
      // Refresh list
      const listResult = await getListMatakuliah(filterProgramStudi || undefined, perPage);
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

  // ── Detail handler ──
  async function handleDetailClick(code: string) {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailData(null);
    const result = await getMataKuliahDetail(code);
    if (result.status) {
      setDetailData(result.data);
    }
    setDetailLoading(false);
  }

  // ── Add form handlers ──
  function handleAddInputChange(field: keyof CreateMataKuliahRequest, value: string | number | boolean | null) {
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
      kode_matakuliah: "",
      nama_matakuliah: "",
      jenis: true,
      sks_teori: 0,
      sks_praktik: 0,
      block: "0",
      code_program_studi: "",
    });
    setAddErrors(null);
  }

  async function handleAddSubmit() {
    setAddSaving(true);
    setAddErrors(null);
    const result = await createMatakuliah(addFormData);
    setAddSaving(false);
    if (result.status) {
      setToast({ type: "success", message: "Mata kuliah berhasil ditambahkan." });
      setAddOpen(false);
      resetAddForm();
      const listResult = await getListMatakuliah(filterProgramStudi || undefined, perPage);
      if (listResult.status) {
        setData(listResult.data.data);
        setPagination(listResult.data.pagination);
      }
    } else {
      if (result.errors) {
        setAddErrors(result.errors);
      }
      setToast({ type: "error", message: result.message || "Gagal menambahkan mata kuliah." });
    }
  }

  return (
    <div className="space-y-4 p-6">
      {/* ── Header ── */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Mata Kuliah</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {pagination ? `${pagination.total} mata kuliah terdaftar` : "Memuat data..."}
          </p>
        </div>
      </div>

      {/* ── Filter & Add Button ── */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-5 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500 whitespace-nowrap">Program Studi</label>
            <select
              value={filterProgramStudi}
              onChange={(e) => setFilterProgramStudi(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
            >
              <option value="">Semua</option>
              {programStudiList.map((ps) => (
                <option key={ps.code} value={ps.code}>
                  {ps.nama_program_studi} ({ps.singkatan_program_studi})
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500 whitespace-nowrap">Per Halaman</label>
            <input
              type="number"
              value={perPage}
              onChange={(e) => setPerPage(parseInt(e.target.value) || 20)}
              min={1}
              max={100}
              className="w-20 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
        </div>
        <button
          onClick={() => { resetAddForm(); setAddOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Tambah
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}

      {/* ── Table ── */}
      {!loading && !error && (
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          {/* ── Pagination Top ── */}
          {pagination && (
            <div className="px-5 py-3 border-b border-gray-100">
              <p className="text-xs text-gray-500">
                Menampilkan {pagination.from}–{pagination.to} dari {pagination.total}
              </p>
            </div>
          )}

          {/* ── Scrollable Table ── */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 w-12">No</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Kode</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Nama Mata Kuliah</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">SKS Teori</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">SKS Praktik</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Total SKS</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Block</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600 w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                      Tidak ada mata kuliah yang sesuai.
                    </td>
                  </tr>
                ) : (
                  data.map((mk, idx) => (
                    <tr key={mk.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3 text-gray-500">{(pagination?.from ?? 0) + idx}</td>
                      <td className="px-4 py-3 font-mono text-gray-700">{mk.kode_matakuliah}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{mk.nama_matakuliah}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{mk.sks_teori}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{mk.sks_praktik}</td>
                      <td className="px-4 py-3 text-center font-semibold text-blue-700">{mk.sks_teori + mk.sks_praktik}</td>
                      <td className="px-4 py-3 text-center">
                        {mk.block ? (
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                            Block
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                            Reguler
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            title="Lihat Detail"
                            onClick={() => handleDetailClick(mk.code)}
                            className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            title="Edit"
                            onClick={() => handleEditClick(mk)}
                            className="p-1.5 rounded-md text-amber-600 hover:bg-amber-50 transition"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            title="Hapus"
                            onClick={() => handleDeleteClick(mk.code, mk.nama_matakuliah)}
                            className="p-1.5 rounded-md text-red-600 hover:bg-red-50 transition"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination Bottom ── */}
          {pagination && (
            <div className="px-5 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Menampilkan {pagination.from}–{pagination.to} dari {pagination.total}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-10">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <h2 className="text-lg font-semibold text-gray-800">Edit Mata Kuliah</h2>
              <button
                onClick={() => { setEditOpen(false); setEditErrors(null); }}
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
              {editErrors?.general && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm">
                  {editErrors.general.map((msg, i) => (
                    <p key={i}>{msg}</p>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Kode Mata Kuliah <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={editFormData.kode_matakuliah}
                    onChange={(e) => handleEditInputChange("kode_matakuliah", e.target.value)}
                    className={`w-full rounded-lg border ${editErrors?.kode_matakuliah ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                    placeholder="MK001"
                  />
                  {editErrors?.kode_matakuliah && <p className="mt-1 text-xs text-red-500">{editErrors.kode_matakuliah[0]}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nama Mata Kuliah <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={editFormData.nama_matakuliah}
                    onChange={(e) => handleEditInputChange("nama_matakuliah", e.target.value)}
                    className={`w-full rounded-lg border ${editErrors?.nama_matakuliah ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                    placeholder="Nama Mata Kuliah"
                  />
                  {editErrors?.nama_matakuliah && <p className="mt-1 text-xs text-red-500">{editErrors.nama_matakuliah[0]}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">SKS Teori <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={editFormData.sks_teori}
                    onChange={(e) => handleEditInputChange("sks_teori", parseInt(e.target.value) || 0)}
                    min="0"
                    className={`w-full rounded-lg border ${editErrors?.sks_teori ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                  />
                  {editErrors?.sks_teori && <p className="mt-1 text-xs text-red-500">{editErrors.sks_teori[0]}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">SKS Praktik <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={editFormData.sks_praktik}
                    onChange={(e) => handleEditInputChange("sks_praktik", parseInt(e.target.value) || 0)}
                    min="0"
                    className={`w-full rounded-lg border ${editErrors?.sks_praktik ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                  />
                  {editErrors?.sks_praktik && <p className="mt-1 text-xs text-red-500">{editErrors.sks_praktik[0]}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Jenis <span className="text-red-500">*</span></label>
                  <select
                    value={editFormData.jenis}
                    onChange={(e) => handleEditInputChange("jenis", e.target.value)}
                    className={`w-full rounded-lg border ${editErrors?.jenis ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                  >
                    <option value="1">Aktif</option>
                    <option value="0">Nonaktif</option>
                  </select>
                  {editErrors?.jenis && <p className="mt-1 text-xs text-red-500">{editErrors.jenis[0]}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Block <span className="text-red-500">*</span></label>
                  <select
                    value={editFormData.block}
                    onChange={(e) => handleEditInputChange("block", e.target.value)}
                    className={`w-full rounded-lg border ${editErrors?.block ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                  >
                    <option value="0">Reguler</option>
                    <option value="1">Block</option>
                  </select>
                  {editErrors?.block && <p className="mt-1 text-xs text-red-500">{editErrors.block[0]}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Kode Program Studi <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={editFormData.kode_program_studi}
                  onChange={(e) => handleEditInputChange("kode_program_studi", e.target.value)}
                  className={`w-full rounded-lg border ${editErrors?.kode_program_studi ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                  placeholder="23"
                />
                {editErrors?.kode_program_studi && <p className="mt-1 text-xs text-red-500">{editErrors.kode_program_studi[0]}</p>}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white rounded-b-2xl">
              <button
                onClick={() => { setEditOpen(false); setEditErrors(null); }}
                disabled={editSaving}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleEditSave}
                disabled={editSaving}
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
                  <h3 className="text-lg font-semibold text-gray-800">Hapus Mata Kuliah</h3>
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
                onClick={() => { setDeleteOpen(false); setDeleteId(null); setDeleteNama(""); }}
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

      {/* ── Detail Modal ── */}
      {detailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Detail Mata Kuliah</h2>
              <button
                onClick={() => { setDetailOpen(false); setDetailData(null); }}
                className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4">
              {detailLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              ) : detailData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Kode</label>
                      <p className="text-sm text-gray-800 font-mono">{detailData.kode_matakuliah}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Nama Mata Kuliah</label>
                      <p className="text-sm text-gray-800 font-medium">{detailData.nama_matakuliah}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">SKS Teori</label>
                      <p className="text-sm text-gray-800">{detailData.sks_teori}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">SKS Praktik</label>
                      <p className="text-sm text-gray-800">{detailData.sks_praktik}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Total SKS</label>
                      <p className="text-sm text-blue-700 font-semibold">{detailData.sks_teori + detailData.sks_praktik}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Tipe</label>
                    {detailData.block ? (
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                        Block
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                        Reguler
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-400 py-8">Gagal memuat data.</p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => { setDetailOpen(false); setDetailData(null); }}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Mata Kuliah Modal ── */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-10">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <h2 className="text-lg font-semibold text-gray-800">Tambah Mata Kuliah</h2>
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
                  <label className="block text-xs font-medium text-gray-500 mb-1">Kode Mata Kuliah <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={addFormData.kode_matakuliah}
                    onChange={(e) => handleAddInputChange("kode_matakuliah", e.target.value)}
                    className={`w-full rounded-lg border ${addErrors?.kode_matakuliah ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                    placeholder="MK001"
                  />
                  {addErrors?.kode_matakuliah && <p className="mt-1 text-xs text-red-500">{addErrors.kode_matakuliah[0]}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nama Mata Kuliah <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={addFormData.nama_matakuliah}
                    onChange={(e) => handleAddInputChange("nama_matakuliah", e.target.value)}
                    className={`w-full rounded-lg border ${addErrors?.nama_matakuliah ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                    placeholder="Nama Mata Kuliah"
                  />
                  {addErrors?.nama_matakuliah && <p className="mt-1 text-xs text-red-500">{addErrors.nama_matakuliah[0]}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">SKS Teori <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={addFormData.sks_teori}
                    onChange={(e) => handleAddInputChange("sks_teori", parseInt(e.target.value) || 0)}
                    min="0"
                    className={`w-full rounded-lg border ${addErrors?.sks_teori ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                  />
                  {addErrors?.sks_teori && <p className="mt-1 text-xs text-red-500">{addErrors.sks_teori[0]}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">SKS Praktik <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={addFormData.sks_praktik}
                    onChange={(e) => handleAddInputChange("sks_praktik", parseInt(e.target.value) || 0)}
                    min="0"
                    className={`w-full rounded-lg border ${addErrors?.sks_praktik ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                  />
                  {addErrors?.sks_praktik && <p className="mt-1 text-xs text-red-500">{addErrors.sks_praktik[0]}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Jenis</label>
                  <select
                    value={addFormData.jenis === true ? "1" : "0"}
                    onChange={(e) => handleAddInputChange("jenis", e.target.value === "1")}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                  >
                    <option value="1">Aktif</option>
                    <option value="0">Nonaktif</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Block <span className="text-red-500">*</span></label>
                  <select
                    value={addFormData.block}
                    onChange={(e) => handleAddInputChange("block", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                  >
                    <option value="0">Reguler</option>
                    <option value="1">Block</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Program Studi <span className="text-red-500">*</span></label>
                  <select
                    value={addFormData.code_program_studi ?? ""}
                    onChange={(e) => handleAddInputChange("code_program_studi", e.target.value)}
                    className={`w-full rounded-lg border ${addErrors?.code_program_studi ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                  >
                    <option value="">-- Pilih Program Studi --</option>
                    {programStudiList.map((ps) => (
                      <option key={ps.code} value={ps.code}>
                        {ps.nama_program_studi} ({ps.singkatan_program_studi})
                      </option>
                    ))}
                  </select>
                  {addErrors?.code_program_studi && <p className="mt-1 text-xs text-red-500">{addErrors.code_program_studi[0]}</p>}
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
