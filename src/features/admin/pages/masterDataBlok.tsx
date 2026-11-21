import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getListTemplateBlok } from "@/features/admin/api/masterData";
import type { TemplateBlokItem, Pagination } from "@/features/admin/types";

const PER_PAGE_OPTIONS = [10, 15, 25, 50];

export default function MasterDataBlok() {
  const navigate = useNavigate();
  const [data, setData] = useState<TemplateBlokItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [angkatan, setAngkatan] = useState("");
  const [versi, setVersi] = useState("");
  const [perPage, setPerPage] = useState(15);
  const [hasSearched, setHasSearched] = useState(false);
  const angkatanRef = useRef(angkatan);
  const versiRef = useRef(versi);
  const perPageRef = useRef(perPage);

  // ── Delete confirmation ──
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteData, setDeleteData] = useState<TemplateBlokItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Toast ──
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function fetchData() {
    setLoading(true);
    setError(null);

    const result = await getListTemplateBlok(perPageRef.current, {
      angkatan: angkatanRef.current ? Number(angkatanRef.current) : undefined,
      versi: versiRef.current ? Number(versiRef.current) : undefined,
    });

    if (!result.status) {
      setError(result.message);
      setData([]);
    } else {
      setData(result.data.data);
      setPagination(result.data.pagination);
    }

    setLoading(false);
  }

  // ── Auto-hide toast ──
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    angkatanRef.current = angkatan;
    versiRef.current = versi;
    perPageRef.current = perPage;
    setHasSearched(true);
    fetchData();
  }

  function handleDetail(item: TemplateBlokItem) {
    navigate(`/admin/blok/master-data/${item.code}`);
  }

  function handleEdit(item: TemplateBlokItem) {
    navigate(`/admin/blok/master-data/${item.code}/edit`);
  }

  function handleDeleteClick(item: TemplateBlokItem) {
    setDeleteData(item);
    setDeleteOpen(true);
  }

  function handleDeleteConfirm() {
    if (!deleteData) return;
    setDeleteLoading(true);
    setTimeout(() => {
      setDeleteLoading(false);
      setDeleteOpen(false);
      setDeleteData(null);
      setToast({ type: "error", message: "Fitur hapus belum tersedia." });
    }, 500);
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <div className="space-y-4 p-6">
      {/* ── Header ── */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5">
        <h1 className="text-xl font-semibold text-gray-800">Master Data Blok</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          {pagination ? `${pagination.total} template penilaian terdaftar` : "Memuat data..."}
        </p>
      </div>

      {/* ── Filter ── */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-5 py-4">
        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
          <div className="w-32">
            <label className="block text-xs font-medium text-gray-500 mb-1">Angkatan</label>
            <input
              type="number"
              value={angkatan}
              onChange={(e) => setAngkatan(e.target.value)}
              placeholder="2025"
              min="2000"
              max="2099"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          <div className="w-24">
            <label className="block text-xs font-medium text-gray-500 mb-1">Versi</label>
            <input
              type="number"
              value={versi}
              onChange={(e) => setVersi(e.target.value)}
              placeholder="1"
              min="1"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          <div className="w-28">
            <label className="block text-xs font-medium text-gray-500 mb-1">Per Page</label>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
            >
              {PER_PAGE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            Cari
          </button>
        </form>
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
          {pagination && hasSearched && (
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
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Mata Kuliah</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Versi</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Angkatan</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Dibuat</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Diupdate</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600 w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                      {!hasSearched ? "Masukkan angkatan dan tekan Cari untuk melihat data." : "Tidak ada template yang sesuai."}
                    </td>
                  </tr>
                ) : (
                  data.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3 text-gray-500">{(pagination?.from ?? 0) + idx}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{item.matakuliah}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                          v{item.versi}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">{item.kurikulum_angkatan}</td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(item.created_at)}</td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(item.updated_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            title="Lihat Detail"
                            onClick={() => handleDetail(item)}
                            className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            title="Edit"
                            onClick={() => handleEdit(item)}
                            className="p-1.5 rounded-md text-amber-600 hover:bg-amber-50 transition"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            title="Hapus"
                            onClick={() => handleDeleteClick(item)}
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
          {pagination && hasSearched && (
            <div className="px-5 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Menampilkan {pagination.from}–{pagination.to} dari {pagination.total}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteOpen && deleteData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="flex flex-col items-center px-6 py-8 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">Hapus Template?</h2>
              <p className="text-sm text-gray-500 mb-6">
                Template untuk <span className="font-medium">{deleteData.matakuliah}</span> akan dihapus.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => { setDeleteOpen(false); setDeleteData(null); }}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
                >
                  {deleteLoading ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
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
