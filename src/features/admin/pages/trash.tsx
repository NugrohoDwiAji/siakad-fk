import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getTrashMahasiswa, restoreMahasiswa, forceDeleteMahasiswa, getTrashDosen } from "@/features/admin/api/masterData";
import type { TrashMahasiswaItem, TrashDosenItem, Pagination } from "@/features/admin/types";

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

// ─── Types ────────────────────────────────────────────────────────────────────

type TrashTab = "mahasiswa" | "dosen" | "matakuliah";

interface TrashTabConfig {
  key: TrashTab;
  label: string;
  route: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const TRASH_TABS: TrashTabConfig[] = [
  { key: "mahasiswa", label: "Mahasiswa", route: "/admin/trash/mahasiswa" },
  { key: "dosen", label: "Dosen", route: "/admin/trash/dosen" },
  { key: "matakuliah", label: "Mata Kuliah", route: "/admin/trash/matakuliah" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Trash() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentTab = TRASH_TABS.find((t) => location.pathname === t.route)?.key || "mahasiswa";

  function handleTabChange(tab: TrashTabConfig) {
    navigate(tab.route);
  }

  return (
    <div className="space-y-4 p-6">
      {/* ── Header ── */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Trash</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Data yang dihapus dan dapat dipulihkan atau dihapus permanen
            </p>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-5 py-4">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          {TRASH_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition ${
                currentTab === tab.key
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      {currentTab === "mahasiswa" && <TrashMahasiswaContent />}
      {currentTab === "dosen" && <TrashDosenContent />}
      {currentTab === "matakuliah" && <TrashMataKuliahContent />}
    </div>
  );
}

// ─── Trash Mahasiswa Content ──────────────────────────────────────────────────

function TrashMahasiswaContent() {
  const [data, setData] = useState<TrashMahasiswaItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // ── Restore state ──
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [restoreItem, setRestoreItem] = useState<TrashMahasiswaItem | null>(null);
  const [restoreLoading, setRestoreLoading] = useState(false);

  // ── Force delete state ──
  const [forceDeleteOpen, setForceDeleteOpen] = useState(false);
  const [forceDeleteItem, setForceDeleteItem] = useState<TrashMahasiswaItem | null>(null);
  const [forceDeleteLoading, setForceDeleteLoading] = useState(false);

  // ── Toast ──
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // ── Fetch trash data ──
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      const result = await getTrashMahasiswa(page, 20);

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
  }, [page]);

  // ── Auto-hide toast ──
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ── Restore handlers ──
  function handleRestoreClick(item: TrashMahasiswaItem) {
    setRestoreItem(item);
    setRestoreOpen(true);
  }

  async function handleRestoreConfirm() {
    if (!restoreItem) return;
    setRestoreLoading(true);
    const result = await restoreMahasiswa(restoreItem.code);
    setRestoreLoading(false);
    if (result.status) {
      setToast({ type: "success", message: "Mahasiswa berhasil dipulihkan." });
      setRestoreOpen(false);
      setRestoreItem(null);
      // Refresh list
      const listResult = await getTrashMahasiswa(page, 20);
      if (listResult.status) {
        setData(listResult.data.data);
        setPagination(listResult.data.pagination);
      }
    } else {
      setToast({ type: "error", message: result.message || "Gagal memulihkan data." });
    }
  }

  // ── Force delete handlers ──
  function handleForceDeleteClick(item: TrashMahasiswaItem) {
    setForceDeleteItem(item);
    setForceDeleteOpen(true);
  }

  async function handleForceDeleteConfirm() {
    if (!forceDeleteItem) return;
    setForceDeleteLoading(true);
    const result = await forceDeleteMahasiswa(forceDeleteItem.code);
    setForceDeleteLoading(false);
    if (result.status) {
      setToast({ type: "success", message: "Mahasiswa berhasil dihapus permanen." });
      setForceDeleteOpen(false);
      setForceDeleteItem(null);
      // Refresh list
      const listResult = await getTrashMahasiswa(page, 20);
      if (listResult.status) {
        setData(listResult.data.data);
        setPagination(listResult.data.pagination);
      }
    } else {
      setToast({ type: "error", message: result.message || "Gagal menghapus data." });
    }
  }

  const totalPages = pagination?.last_page ?? 1;
  const currentPage = pagination?.current_page ?? page;

  return (
    <>
      {/* ── Table ── */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm">
              {error}
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500">Tidak ada data</p>
            <p className="text-xs text-gray-400 mt-1">Tidak ada data mahasiswa yang dihapus</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 w-12">No</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">NIM</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Nama</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Program Studi</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Telepon</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600 w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map((item, idx) => (
                  <tr key={item.code} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 text-gray-500">{(pagination?.from ?? 0) + idx}</td>
                    <td className="px-4 py-3 font-mono text-gray-700">{item.nim}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{item.nama_mahasiswa}</td>
                    <td className="px-4 py-3 text-gray-600">{item.nama_program_studi}</td>
                    <td className="px-4 py-3 text-gray-600">{item.email}</td>
                    <td className="px-4 py-3 text-gray-600">{item.telepon}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[item.status] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}>
                        {STATUS_LABEL[item.status] ?? item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          title="Pulihkan"
                          onClick={() => handleRestoreClick(item)}
                          className="p-1.5 rounded-md text-green-600 hover:bg-green-50 transition"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                        </button>
                        <button
                          title="Hapus Permanen"
                          onClick={() => handleForceDeleteClick(item)}
                          className="p-1.5 rounded-md text-red-600 hover:bg-red-50 transition"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {!loading && !error && data.length > 0 && pagination && (
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

      {/* ── Restore Confirmation Modal ── */}
      {restoreOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Pulihkan Mahasiswa</h3>
                  <p className="text-sm text-gray-500">Data akan dikembalikan ke daftar aktif.</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Apakah Anda yakin ingin memulihkan <span className="font-semibold">{restoreItem?.nama_mahasiswa}</span>?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => { setRestoreOpen(false); setRestoreItem(null); }}
                disabled={restoreLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleRestoreConfirm}
                disabled={restoreLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {restoreLoading ? "Memulihkan..." : "Pulihkan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Force Delete Confirmation Modal ── */}
      {forceDeleteOpen && (
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
                  <h3 className="text-lg font-semibold text-gray-800">Hapus Permanen</h3>
                  <p className="text-sm text-gray-500">Tindakan ini tidak dapat dibatalkan.</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Apakah Anda yakin ingin menghapus permanen <span className="font-semibold">{forceDeleteItem?.nama_mahasiswa}</span>?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => { setForceDeleteOpen(false); setForceDeleteItem(null); }}
                disabled={forceDeleteLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleForceDeleteConfirm}
                disabled={forceDeleteLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {forceDeleteLoading ? "Menghapus..." : "Hapus Permanen"}
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
    </>
  );
}

// ─── Trash Dosen Content ──────────────────────────────────────────────────────

function TrashDosenContent() {
  const [data, setData] = useState<TrashDosenItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // ── Fetch trash data ──
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      const result = await getTrashDosen(page, 20);

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
  }, [page]);

  const totalPages = pagination?.last_page ?? 1;
  const currentPage = pagination?.current_page ?? page;

  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : error ? (
        <div className="p-6">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm">
            {error}
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500">Tidak ada data</p>
          <p className="text-xs text-gray-400 mt-1">Tidak ada data dosen yang dihapus</p>
        </div>
      ) : (
        <>
          {/* ── Pagination Top ── */}
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Menampilkan {pagination?.from}–{pagination?.to} dari {pagination?.total}
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

          {/* ── Table ── */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 w-12">No</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">NIK</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Nama Dosen</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Tanggal Dihapus</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600 w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map((item, idx) => (
                  <tr key={item.code} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 text-gray-500">{(pagination?.from ?? 0) + idx}</td>
                    <td className="px-4 py-3 font-mono text-gray-700">{item.nik}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{item.nama_dosen}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(item.deleted_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          title="Pulihkan"
                          className="p-1.5 rounded-md text-green-600 hover:bg-green-50 transition"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                        </button>
                        <button
                          title="Hapus Permanen"
                          className="p-1.5 rounded-md text-red-600 hover:bg-red-50 transition"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pagination Bottom ── */}
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Menampilkan {pagination?.from}–{pagination?.to} dari {pagination?.total}
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
        </>
      )}
    </div>
  );
}

// ─── Trash Mata Kuliah Content ────────────────────────────────────────────────

function TrashMataKuliahContent() {
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700">Mata Kuliah Terhapus</h2>
        <p className="text-xs text-gray-400 mt-0.5">Belum ada data mata kuliah yang dihapus</p>
      </div>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-500">Tidak ada data</p>
        <p className="text-xs text-gray-400 mt-1">Data mata kuliah yang dihapus akan muncul di sini</p>
      </div>
    </div>
  );
}
