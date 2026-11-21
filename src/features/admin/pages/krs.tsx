import { useState, useEffect } from "react";
import { getSksRule, deleteSksRule } from "@/features/admin/api/krs";
import { getListProgramStudi } from "@/features/admin/api/masterData";
import type { SksRuleItem, ProgramStudiItem } from "@/features/admin/types";
import CreateSksRuleCard from "../components/organisms/CreateSksRuleCard";
import SksRuleDetailCard from "../components/organisms/SksRuleDetailCard";
import KrsMahasiswaTab from "../components/organisms/KrsMahasiswaTab";

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminKrs() {
  const [activeTab, setActiveTab] = useState<"role" | "mahasiswa">("role");
  const [data, setData] = useState<SksRuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);

  const [programStudiList, setProgramStudiList] = useState<ProgramStudiItem[]>([]);
  const [selectedProdi, setSelectedProdi] = useState<string>("");

  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<SksRuleItem | undefined>(undefined);

  const [detailCode, setDetailCode] = useState<string | null>(null);

  const [confirmDeleteCode, setConfirmDeleteCode] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch program studi ──
  useEffect(() => {
    let cancelled = false;

    async function fetchProdi() {
      const result = await getListProgramStudi(1, 100);
      if (cancelled) return;

      if (result.status && result.data) {
        setProgramStudiList(result.data.data);
      }
    }

    fetchProdi();
    return () => { cancelled = true; };
  }, []);

  // ── Fetch data ──
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      const result = await getSksRule(selectedProdi || undefined);

      if (cancelled) return;

      if (!result.status) {
        setError(result.message);
        setData([]);
      } else {
        setData(result.data.data);
      }

      setLoading(false);
    }

    fetchData();
    return () => { cancelled = true; };
  }, [selectedProdi, refetchKey]);

  // ── Handlers ──
  function handleAdd() {
    setEditData(undefined);
    setShowForm(true);
  }

  function handleEdit(item: SksRuleItem) {
    setEditData(item);
    setShowForm(true);
  }

  function handleFormClose() {
    setShowForm(false);
    setEditData(undefined);
  }

  function handleFormSuccess() {
    handleFormClose();
    setRefetchKey((k) => k + 1);
  }

  async function handleDeleteConfirm(code: string) {
    setDeleting(true);
    const result = await deleteSksRule(code);
    setDeleting(false);

    if (result.status) {
      setConfirmDeleteCode(null);
      setRefetchKey((k) => k + 1);
    } else {
      setError(result.message);
    }
  }

  return (
    <div className="space-y-4 p-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">KRS</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {activeTab === "role"
              ? `${data.length} aturan SKS terdaftar`
              : "Pencarian dan detail riwayat KRS mahasiswa"}
          </p>
        </div>
        {activeTab === "role" && (
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-800 text-white text-sm font-semibold hover:bg-brand-700 active:scale-95 transition-all shadow-sm shrink-0"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tambah SKS Rule
          </button>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("role")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            activeTab === "role"
              ? "bg-white text-gray-800 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          KRS Role
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("mahasiswa")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            activeTab === "mahasiswa"
              ? "bg-white text-gray-800 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          KRS Mahasiswa
        </button>
      </div>

      {/* ── Tab Content: KRS Mahasiswa ── */}
      {activeTab === "mahasiswa" && <KrsMahasiswaTab />}

      {/* ── Tab Content: KRS Role ── */}
      {activeTab === "role" && (
        <>
          {/* ── Filter ── */}
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-5 py-4">
            <div className="relative max-w-sm">
              <select
                value={selectedProdi}
                onChange={(e) => setSelectedProdi(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-3 pr-4 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
              >
                <option value="">Semua Program Studi</option>
                {programStudiList.map((ps) => (
                  <option key={ps.code} value={ps.code}>
                    {ps.nama_program_studi}
                  </option>
                ))}
              </select>
            </div>
          </div>

      {/* ── Error ── */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* ── Popup Forms ── */}
      {showForm && (
        <CreateSksRuleCard
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          editData={editData}
        />
      )}

      {detailCode && (
        <SksRuleDetailCard
          code={detailCode}
          onClose={() => setDetailCode(null)}
        />
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
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 w-12">No</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Program Studi</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">IP Min</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">IP Max</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">SKS Dapat Diambil</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600 w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                      Tidak ada data SKS rule.
                    </td>
                  </tr>
                ) : (
                  data.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{item.nama_program_studi}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{item.ip_min.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{item.ip_max.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                          {item.sks_yang_dapat_diambil} SKS
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {confirmDeleteCode === item.code ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleDeleteConfirm(item.code)}
                              disabled={deleting}
                              className="px-2.5 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition disabled:opacity-50"
                            >
                              {deleting ? "..." : "Hapus"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteCode(null)}
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
                              onClick={() => setDetailCode(item.code)}
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
                              onClick={() => setConfirmDeleteCode(item.code)}
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
        </div>
      )}
        </>
      )}
    </div>
  );
}
