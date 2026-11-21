import { useState, useEffect } from "react";
import { getKurikulumAngkatan, getKurikulumStaff } from "@/features/admin/api/kurikulum";
import type { KurikulumAngkatanItem, KurikulumItem } from "@/features/admin/types";
import CreateKurikulumCard from "../components/organisms/CreateKurikulumCard";
import CreateNamaKurikulumCard from "../components/organisms/CreateNamaKurikulumCard";

// ─── Tab Button ───────────────────────────────────────────────────────────────

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-sm font-medium transition ${
        active
          ? "bg-white text-gray-800 shadow-sm"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function KurikulumAdmin() {
  const [activeTab, setActiveTab] = useState<"angkatan" | "nama">("angkatan");

  // ── Angkatan state ──
  const [angkatanData, setAngkatanData] = useState<KurikulumAngkatanItem[]>([]);
  const [angkatanLoading, setAngkatanLoading] = useState(true);
  const [angkatanError, setAngkatanError] = useState<string | null>(null);
  const [angkatanSearch, setAngkatanSearch] = useState("");
  const [showAngkatanForm, setShowAngkatanForm] = useState(false);
  const [angkatanRefetchKey, setAngkatanRefetchKey] = useState(0);

  // ── Nama state ──
  const [namaData, setNamaData] = useState<KurikulumItem[]>([]);
  const [namaLoading, setNamaLoading] = useState(true);
  const [namaError, setNamaError] = useState<string | null>(null);
  const [namaSearch, setNamaSearch] = useState("");
  const [showNamaForm, setShowNamaForm] = useState(false);
  const [namaRefetchKey, setNamaRefetchKey] = useState(0);

  // ── Fetch angkatan ──
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setAngkatanLoading(true);
      setAngkatanError(null);

      const result = await getKurikulumAngkatan();

      if (cancelled) return;

      if (!result.status) {
        setAngkatanError(result.message);
        setAngkatanData([]);
      } else {
        setAngkatanData(result.data);
      }

      setAngkatanLoading(false);
    }

    fetchData();
    return () => { cancelled = true; };
  }, [angkatanRefetchKey]);

  // ── Fetch nama ──
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setNamaLoading(true);
      setNamaError(null);

      const result = await getKurikulumStaff();

      if (cancelled) return;

      if (!result.status) {
        setNamaError(result.message);
        setNamaData([]);
      } else {
        setNamaData(result.data);
      }

      setNamaLoading(false);
    }

    fetchData();
    return () => { cancelled = true; };
  }, [namaRefetchKey]);

  // ── Filtered data ──
  const filteredAngkatan = angkatanData.filter((k) => {
    const q = angkatanSearch.toLowerCase();
    return (
      !q ||
      k.nama_kurikulum.toLowerCase().includes(q) ||
      k.angkatan.includes(q)
    );
  });

  const filteredNama = namaData.filter((k) => {
    const q = namaSearch.toLowerCase();
    return (
      !q ||
      k.nama_kurikulum.toLowerCase().includes(q) ||
      k.nama_program_studi.toLowerCase().includes(q) ||
      k.angkatan1.includes(q)
    );
  });

  return (
    <div className="space-y-4 p-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Kurikulum</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {activeTab === "angkatan"
              ? `${angkatanData.length} kurikulum angkatan terdaftar`
              : `${namaData.length} nama kurikulum terdaftar`}
          </p>
        </div>
        {activeTab === "angkatan" ? (
          <button
            type="button"
            onClick={() => setShowAngkatanForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-800 text-white text-sm font-semibold hover:bg-brand-700 active:scale-95 transition-all shadow-sm shrink-0"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tambah Kurikulum
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowNamaForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-800 text-white text-sm font-semibold hover:bg-brand-700 active:scale-95 transition-all shadow-sm shrink-0"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tambah Nama Kurikulum
          </button>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <TabButton
          label="Kurikulum Angkatan"
          active={activeTab === "angkatan"}
          onClick={() => setActiveTab("angkatan")}
        />
        <TabButton
          label="Daftar Nama Kurikulum"
          active={activeTab === "nama"}
          onClick={() => setActiveTab("nama")}
        />
      </div>

      {/* ── Create Form (Popup) ── */}
      {showAngkatanForm && (
        <CreateKurikulumCard
          onClose={() => setShowAngkatanForm(false)}
          onSuccess={() => {
            setShowAngkatanForm(false);
            setAngkatanRefetchKey((k) => k + 1);
          }}
        />
      )}

      {showNamaForm && (
        <CreateNamaKurikulumCard
          onClose={() => setShowNamaForm(false)}
          onSuccess={() => {
            setShowNamaForm(false);
            setNamaRefetchKey((k) => k + 1);
          }}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* Tab: Kurikulum Angkatan */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "angkatan" && (
        <>
          {/* Search */}
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-5 py-4">
            <div className="relative max-w-sm">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={angkatanSearch}
                onChange={(e) => setAngkatanSearch(e.target.value)}
                placeholder="Cari nama kurikulum, angkatan..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
              />
              {angkatanSearch && (
                <button
                  type="button"
                  onClick={() => setAngkatanSearch("")}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Error */}
          {angkatanError && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm">
              {angkatanError}
            </div>
          )}

          {/* Loading */}
          {angkatanLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          )}

          {/* Table */}
          {!angkatanLoading && !angkatanError && (
            <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-4 py-3 text-left font-semibold text-gray-600 w-12">No</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Nama Kurikulum</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-600">Angkatan</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-600">Ekstensi</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-600">Paket</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-600 w-32">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredAngkatan.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                          Tidak ada kurikulum yang sesuai.
                        </td>
                      </tr>
                    ) : (
                      filteredAngkatan.map((k, idx) => (
                        <tr key={k.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                          <td className="px-4 py-3 font-medium text-gray-800">{k.nama_kurikulum}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                              {k.angkatan}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-600">{k.ekstensi}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{k.paket}</td>
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
                              <button
                                title="Edit"
                                className="p-1.5 rounded-md text-amber-600 hover:bg-amber-50 transition"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                title="Hapus"
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
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* Tab: Daftar Nama Kurikulum */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "nama" && (
        <>
          {/* Search */}
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-5 py-4">
            <div className="relative max-w-sm">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={namaSearch}
                onChange={(e) => setNamaSearch(e.target.value)}
                placeholder="Cari nama kurikulum, program studi..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
              />
              {namaSearch && (
                <button
                  type="button"
                  onClick={() => setNamaSearch("")}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Error */}
          {namaError && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm">
              {namaError}
            </div>
          )}

          {/* Loading */}
          {namaLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          )}

          {/* Table */}
          {!namaLoading && !namaError && (
            <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-4 py-3 text-left font-semibold text-gray-600 w-12">No</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Nama Kurikulum</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Program Studi</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-600">Angkatan</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-600">Ekstensi</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-600">Paket</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-600 w-32">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredNama.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                          Tidak ada nama kurikulum yang sesuai.
                        </td>
                      </tr>
                    ) : (
                      filteredNama.map((k, idx) => (
                        <tr key={k.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                          <td className="px-4 py-3 font-medium text-gray-800">{k.nama_kurikulum}</td>
                          <td className="px-4 py-3 text-gray-600">{k.nama_program_studi}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                              {k.angkatan1}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-600">{k.ekstensi1}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{k.paket1}</td>
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
                              <button
                                title="Edit"
                                className="p-1.5 rounded-md text-amber-600 hover:bg-amber-50 transition"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                title="Hapus"
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
            </div>
          )}
        </>
      )}
    </div>
  );
}
