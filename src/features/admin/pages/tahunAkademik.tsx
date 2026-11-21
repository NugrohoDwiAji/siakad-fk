import { useState, useEffect } from "react";
import { getListTahunAkademik, createTahunAkademik, getTahunAkademikDetail, updateTahunAkademik } from "@/features/admin/api/masterData";
import type { TahunAkademikItem, Pagination, CreateTahunAkademikRequest, UpdateTahunAkademikRequest } from "@/features/admin/types";

export default function TahunAkademik() {
  const [data, setData] = useState<TahunAkademikItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Add form ──
  const [addOpen, setAddOpen] = useState(false);
  const [addSaving, setAddSaving] = useState(false);
  const [addErrors, setAddErrors] = useState<Record<string, string[]> | null>(null);
  const [addFormData, setAddFormData] = useState<CreateTahunAkademikRequest>({
    tahun_akademik: "",
    semester: 1,
    tanggal_mulai: "",
    tanggal_berakhir: "",
    status: "A",
    status_kpat: null,
    tanggal_buka_krs: null,
    tanggal_tutup_krs: null,
  });

  // ── Edit form ──
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editErrors, setEditErrors] = useState<Record<string, string[]> | null>(null);
  const [editFormData, setEditFormData] = useState<UpdateTahunAkademikRequest>({
    code: "",
    tahun_akademik: "",
    semester: 1,
    tanggal_mulai: "",
    tanggal_berakhir: "",
    status: "A",
    status_kpat: null,
    tanggal_buka_krs: null,
    tanggal_tutup_krs: null,
  });

  // ── Toast notification ──
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      const result = await getListTahunAkademik();

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
  }, []);

  function formatDate(dateStr: string) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  }

  // ── Add form handlers ──
  function handleAddInputChange(field: keyof CreateTahunAkademikRequest, value: string | number) {
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
      tahun_akademik: "",
      semester: 1,
      tanggal_mulai: "",
      tanggal_berakhir: "",
      status: "A",
      status_kpat: null,
      tanggal_buka_krs: null,
      tanggal_tutup_krs: null,
    });
    setAddErrors(null);
  }

  async function handleAddSubmit() {
    setAddSaving(true);
    setAddErrors(null);
    const result = await createTahunAkademik(addFormData);
    setAddSaving(false);
    if (result.status) {
      setToast({ type: "success", message: "Tahun akademik berhasil ditambahkan." });
      setAddOpen(false);
      resetAddForm();
      const listResult = await getListTahunAkademik();
      if (listResult.status) {
        setData(listResult.data.data);
        setPagination(listResult.data.pagination);
      }
    } else {
      if (result.errors) {
        setAddErrors(result.errors);
      }
      setToast({ type: "error", message: result.message || "Gagal menambahkan tahun akademik." });
    }
  }

  // ── Edit handlers ──
  async function handleEditClick(code: string) {
    setEditLoading(true);
    setEditErrors(null);
    setEditOpen(true);

    const result = await getTahunAkademikDetail(code);
    setEditLoading(false);

    if (result.status) {
      const d = result.data;
      setEditFormData({
        code: d.code,
        tahun_akademik: d.tahun_akademik,
        semester: d.semester,
        tanggal_mulai: d.tanggal_mulai,
        tanggal_berakhir: d.tanggal_berakhir,
        status: d.status,
        status_kpat: d.status_kpat || null,
        tanggal_buka_krs: d.tanggal_buka_krs || null,
        tanggal_tutup_krs: d.tanggal_tutup_krs || null,
      });
    } else {
      setToast({ type: "error", message: result.message || "Gagal memuat data." });
      setEditOpen(false);
    }
  }

  function handleEditInputChange(field: keyof UpdateTahunAkademikRequest, value: string | number) {
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
    const result = await updateTahunAkademik(editFormData);
    setEditSaving(false);
    if (result.status) {
      setToast({ type: "success", message: "Tahun akademik berhasil diperbarui." });
      setEditOpen(false);
      setEditErrors(null);
      const listResult = await getListTahunAkademik();
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

  // ── Auto-hide toast ──
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className="space-y-4 p-6">
      {/* ── Header ── */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Tahun Akademik</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {pagination ? `${pagination.total} tahun akademik terdaftar` : "Memuat data..."}
          </p>
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
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Tahun Akademik</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Semester</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Tanggal Mulai</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Tanggal Berakhir</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Buka KRS</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Tutup KRS</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-gray-400">
                      Tidak ada tahun akademik yang sesuai.
                    </td>
                  </tr>
                ) : (
                  data.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3 text-gray-500">{(pagination?.from ?? 0) + idx}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{item.tahun_akademik}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{item.semester}</td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(item.tanggal_mulai)}</td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(item.tanggal_berakhir)}</td>
                      <td className="px-4 py-3 text-center">
                        {item.status === "A" ? (
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                            Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(item.tanggal_buka_krs)}</td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(item.tanggal_tutup_krs)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEditClick(item.code)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {/* TODO: delete handler */}}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                            title="Hapus"
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

      {/* ── Add Tahun Akademik Modal ── */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-10">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <h2 className="text-lg font-semibold text-gray-800">Tambah Tahun Akademik</h2>
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

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Tahun Akademik <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={addFormData.tahun_akademik}
                  onChange={(e) => handleAddInputChange("tahun_akademik", e.target.value)}
                  className={`w-full rounded-lg border ${addErrors?.tahun_akademik ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                  placeholder="2025/2026"
                />
                {addErrors?.tahun_akademik && <p className="mt-1 text-xs text-red-500">{addErrors.tahun_akademik[0]}</p>}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Semester <span className="text-red-500">*</span></label>
                  <select
                    value={addFormData.semester}
                    onChange={(e) => handleAddInputChange("semester", parseInt(e.target.value))}
                    className={`w-full rounded-lg border ${addErrors?.semester ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                  >
                    <option value={1}>Ganjil</option>
                    <option value={2}>Genap</option>
                  </select>
                  {addErrors?.semester && <p className="mt-1 text-xs text-red-500">{addErrors.semester[0]}</p>}
                </div>
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
                  <label className="block text-xs font-medium text-gray-500 mb-1">Status KPAT</label>
                  <select
                    value={addFormData.status_kpat ?? ""}
                    onChange={(e) => handleAddInputChange("status_kpat", e.target.value || "")}
                    className={`w-full rounded-lg border ${addErrors?.status_kpat ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                  >
                    <option value="">-</option>
                    <option value="A">Aktif</option>
                    <option value="N">Nonaktif</option>
                  </select>
                  {addErrors?.status_kpat && <p className="mt-1 text-xs text-red-500">{addErrors.status_kpat[0]}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal Mulai <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={addFormData.tanggal_mulai}
                    onChange={(e) => handleAddInputChange("tanggal_mulai", e.target.value)}
                    className={`w-full rounded-lg border ${addErrors?.tanggal_mulai ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                  />
                  {addErrors?.tanggal_mulai && <p className="mt-1 text-xs text-red-500">{addErrors.tanggal_mulai[0]}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal Berakhir <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={addFormData.tanggal_berakhir}
                    onChange={(e) => handleAddInputChange("tanggal_berakhir", e.target.value)}
                    className={`w-full rounded-lg border ${addErrors?.tanggal_berakhir ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                  />
                  {addErrors?.tanggal_berakhir && <p className="mt-1 text-xs text-red-500">{addErrors.tanggal_berakhir[0]}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Buka KRS <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={addFormData.tanggal_buka_krs || ""}
                    onChange={(e) => handleAddInputChange("tanggal_buka_krs", e.target.value)}
                    className={`w-full rounded-lg border ${addErrors?.tanggal_buka_krs ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                  />
                  {addErrors?.tanggal_buka_krs && <p className="mt-1 text-xs text-red-500">{addErrors.tanggal_buka_krs[0]}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Tutup KRS <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={addFormData.tanggal_tutup_krs || ""}
                    onChange={(e) => handleAddInputChange("tanggal_tutup_krs", e.target.value)}
                    className={`w-full rounded-lg border ${addErrors?.tanggal_tutup_krs ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                  />
                  {addErrors?.tanggal_tutup_krs && <p className="mt-1 text-xs text-red-500">{addErrors.tanggal_tutup_krs[0]}</p>}
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

      {/* ── Edit Tahun Akademik Modal ── */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-10">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <h2 className="text-lg font-semibold text-gray-800">Edit Tahun Akademik</h2>
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
              {editLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              ) : (
                <>
                  {/* General Error */}
                  {editErrors?.general && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm">
                      {editErrors.general.map((msg, i) => (
                        <p key={i}>{msg}</p>
                      ))}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Tahun Akademik <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={editFormData.tahun_akademik}
                      onChange={(e) => handleEditInputChange("tahun_akademik", e.target.value)}
                      className={`w-full rounded-lg border ${editErrors?.tahun_akademik ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                      placeholder="2025/2026"
                    />
                    {editErrors?.tahun_akademik && <p className="mt-1 text-xs text-red-500">{editErrors.tahun_akademik[0]}</p>}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Semester <span className="text-red-500">*</span></label>
                      <select
                        value={editFormData.semester}
                        onChange={(e) => handleEditInputChange("semester", parseInt(e.target.value))}
                        className={`w-full rounded-lg border ${editErrors?.semester ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                      >
                        <option value={1}>Ganjil</option>
                        <option value={2}>Genap</option>
                      </select>
                      {editErrors?.semester && <p className="mt-1 text-xs text-red-500">{editErrors.semester[0]}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Status <span className="text-red-500">*</span></label>
                      <select
                        value={editFormData.status}
                        onChange={(e) => handleEditInputChange("status", e.target.value)}
                        className={`w-full rounded-lg border ${editErrors?.status ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                      >
                        <option value="A">Aktif</option>
                        <option value="N">Nonaktif</option>
                      </select>
                      {editErrors?.status && <p className="mt-1 text-xs text-red-500">{editErrors.status[0]}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Status KPAT</label>
                      <select
                        value={editFormData.status_kpat ?? ""}
                        onChange={(e) => handleEditInputChange("status_kpat", e.target.value || "")}
                        className={`w-full rounded-lg border ${editErrors?.status_kpat ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                      >
                        <option value="">-</option>
                        <option value="A">Aktif</option>
                        <option value="N">Nonaktif</option>
                      </select>
                      {editErrors?.status_kpat && <p className="mt-1 text-xs text-red-500">{editErrors.status_kpat[0]}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal Mulai <span className="text-red-500">*</span></label>
                      <input
                        type="date"
                        value={editFormData.tanggal_mulai}
                        onChange={(e) => handleEditInputChange("tanggal_mulai", e.target.value)}
                        className={`w-full rounded-lg border ${editErrors?.tanggal_mulai ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                      />
                      {editErrors?.tanggal_mulai && <p className="mt-1 text-xs text-red-500">{editErrors.tanggal_mulai[0]}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal Berakhir <span className="text-red-500">*</span></label>
                      <input
                        type="date"
                        value={editFormData.tanggal_berakhir}
                        onChange={(e) => handleEditInputChange("tanggal_berakhir", e.target.value)}
                        className={`w-full rounded-lg border ${editErrors?.tanggal_berakhir ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                      />
                      {editErrors?.tanggal_berakhir && <p className="mt-1 text-xs text-red-500">{editErrors.tanggal_berakhir[0]}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Buka KRS</label>
                      <input
                        type="date"
                        value={editFormData.tanggal_buka_krs ?? ""}
                        onChange={(e) => handleEditInputChange("tanggal_buka_krs", e.target.value || "")}
                        className={`w-full rounded-lg border ${editErrors?.tanggal_buka_krs ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                      />
                      {editErrors?.tanggal_buka_krs && <p className="mt-1 text-xs text-red-500">{editErrors.tanggal_buka_krs[0]}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Tutup KRS</label>
                      <input
                        type="date"
                        value={editFormData.tanggal_tutup_krs ?? ""}
                        onChange={(e) => handleEditInputChange("tanggal_tutup_krs", e.target.value || "")}
                        className={`w-full rounded-lg border ${editErrors?.tanggal_tutup_krs ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
                      />
                      {editErrors?.tanggal_tutup_krs && <p className="mt-1 text-xs text-red-500">{editErrors.tanggal_tutup_krs[0]}</p>}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {!editLoading && (
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
            )}
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
