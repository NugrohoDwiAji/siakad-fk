import { useState, useEffect, useCallback } from "react";
import { getAllKaprodiProgramStudi } from "@/features/admin/api/masterData";
import AssignKaprodiModal from "./AssignKaprodiModal";
import type { KaprodiProgramStudiData } from "@/features/admin/types";

export default function KaprodiTab() {
  const [data, setData] = useState<KaprodiProgramStudiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedProdi, setSelectedProdi] = useState<string>("all");

  // Modal & Toast states
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedProdiForAssign, setSelectedProdiForAssign] = useState<KaprodiProgramStudiData | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const fetchKaprodi = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await getAllKaprodiProgramStudi();

    if (!result.status) {
      setError(result.message || "Gagal memuat data Kaprodi.");
      setData([]);
    } else {
      setData(result.data);
    }
    setLoading(false);
  }, []);

  const filteredData =
    selectedProdi === "all"
      ? data
      : data.filter((item) => item.code_program_studi === selectedProdi);

  useEffect(() => {
    fetchKaprodi();
  }, [fetchKaprodi]);

  function handleOpenAssignModal(item: KaprodiProgramStudiData) {
    setSelectedProdiForAssign(item);
    setAssignModalOpen(true);
  }

  function handleAssignSuccess(message?: string) {
    setToastMessage(message || "Kaprodi program studi berhasil diperbarui.");
    fetchKaprodi();
  }

  function handleCopyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  }

  // Helper initial generator for avatar
  function getInitials(name: string) {
    if (!name) return "KP";
    // Remove title prefixes like dr., Dr., Prof., etc.
    const cleanName = name.replace(/^(dr\.|drg\.|prof\.|ir\.|drs\.)\s*/i, "").trim();
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  return (
    <div className="space-y-6">
      {/* ── Toolbar / Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
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
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800">
              Data Ketua Program Studi (Kaprodi)
            </h2>
            <p className="text-xs text-gray-500">
              Informasi dosen yang menjabat sebagai Ketua Program Studi
            </p>
          </div>
        </div>

        <button
          onClick={fetchKaprodi}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Segarkan Data
        </button>
      </div>

      {/* ── Loading State ── */}
      {loading && (
        <div className="grid grid-cols-1 gap-6">
          {[1].map((n) => (
            <div
              key={n}
              className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm animate-pulse space-y-5"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="h-6 w-48 bg-gray-200 rounded-md" />
                <div className="h-5 w-24 bg-gray-200 rounded-full" />
              </div>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-gray-200 rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-64 bg-gray-200 rounded-md" />
                  <div className="h-4 w-40 bg-gray-200 rounded-md" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Error State ── */}
      {!loading && error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-center">
          <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-red-800">
            Gagal Memuat Data Kaprodi
          </h3>
          <p className="text-xs text-red-600 mt-1 max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchKaprodi}
            className="mt-4 px-4 py-2 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && !error && data.length === 0 && (
        <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center shadow-sm">
          <div className="h-16 w-16 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-700">
            Belum Ada Data Kaprodi
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Data kaprodi program studi belum tersedia dari server.
          </p>
        </div>
      )}

      {/* ── Program Studi Filter Pills (if multiple prodi) ── */}
      {!loading && !error && data.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedProdi("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
              selectedProdi === "all"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            Semua Program Studi ({data.length})
          </button>
          {data.map((item) => (
            <button
              key={item.code_program_studi}
              type="button"
              onClick={() => setSelectedProdi(item.code_program_studi)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
                selectedProdi === item.code_program_studi
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {item.nama_program_studi}
            </button>
          ))}
        </div>
      )}

      {/* ── Cards List ── */}
      {!loading && !error && filteredData.length > 0 && (
        <div className="space-y-6">
          {filteredData.map((item, index) => {
            const kaprodi = item.kaprodi;
            const isAktif = kaprodi?.aktif === "A";

            return (
              <div
                key={item.code_program_studi || index}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition hover:shadow-md"
              >
                {/* ── Card Header: Program Studi ── */}
                <div className="px-6 py-4 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-600 text-white shadow-xs">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                        />
                      </svg>
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-gray-800">
                        {item.nama_program_studi}
                      </h3>
                      <p className="text-xs text-gray-500 font-mono">
                        Code Prodi:{" "}
                        <span className="font-semibold text-gray-700">
                          {item.code_program_studi
                            ? `${item.code_program_studi.substring(0, 18)}...`
                            : "-"}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {kaprodi ? (
                      <>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            isAktif
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-rose-100 text-rose-800 border border-rose-200"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isAktif ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                            }`}
                          />
                          {isAktif ? "Status: Aktif" : "Status: Nonaktif"}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenAssignModal(item)}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition shadow-2xs"
                          title="Ubah Kaprodi"
                        >
                          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>Ubah Kaprodi</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                          Belum Ada Kaprodi
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenAssignModal(item)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition"
                          title="Tambah Kaprodi"
                        >
                          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          <span>Tambah Kaprodi</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* ── Card Body ── */}
                <div className="p-6">
                  {!kaprodi ? (
                    <div className="py-10 text-center text-gray-500 space-y-3">
                      <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="8.5" cy="7" r="4" />
                          <line x1="20" y1="8" x2="20" y2="14" />
                          <line x1="23" y1="11" x2="17" y2="11" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          Belum Ada Kaprodi
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 max-w-sm mx-auto">
                          Belum ada dosen yang ditugaskan sebagai Ketua Program Studi untuk {item.nama_program_studi}.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenAssignModal(item)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        <span>Tambah Kaprodi Sekarang</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Dosen Profile Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-5 border-b border-gray-100">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                          {getInitials(kaprodi.nama_dosen)}
                        </div>
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-lg font-bold text-gray-900 leading-snug">
                              {kaprodi.nama_dosen}
                            </h4>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                              Ketua Program Studi
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 flex items-center gap-2">
                            <span>NIK:</span>
                            <span className="font-mono font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                              {kaprodi.nik || "-"}
                            </span>
                            <span>•</span>
                            <span>Homebase:</span>
                            <span className="font-medium text-gray-700">
                              {kaprodi.homebase || item.nama_program_studi}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Detail Fields Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* 1. NIK */}
                        <div className="bg-gray-50/80 rounded-xl p-3.5 border border-gray-100 flex items-start gap-3">
                          <div className="h-9 w-9 rounded-lg bg-white border border-gray-200 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
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
                                d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                              />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">
                              Nomor Induk Karyawan (NIK)
                            </span>
                            <p className="text-sm font-mono font-semibold text-gray-800 mt-0.5 truncate">
                              {kaprodi.nik || "-"}
                            </p>
                          </div>
                        </div>

                        {/* 2. Email */}
                        <div className="bg-gray-50/80 rounded-xl p-3.5 border border-gray-100 flex items-start gap-3">
                          <div className="h-9 w-9 rounded-lg bg-white border border-gray-200 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
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
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">
                              Alamat Email
                            </span>
                            {kaprodi.alamat_email ? (
                              <a
                                href={`mailto:${kaprodi.alamat_email}`}
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline mt-0.5 block truncate"
                                title={kaprodi.alamat_email}
                              >
                                {kaprodi.alamat_email}
                              </a>
                            ) : (
                              <p className="text-sm text-gray-400 mt-0.5">-</p>
                            )}
                          </div>
                        </div>

                        {/* 3. Telepon */}
                        <div className="bg-gray-50/80 rounded-xl p-3.5 border border-gray-100 flex items-start gap-3">
                          <div className="h-9 w-9 rounded-lg bg-white border border-gray-200 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
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
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">
                              Nomor Telepon
                            </span>
                            {kaprodi.no_telp ? (
                              <a
                                href={`tel:${kaprodi.no_telp}`}
                                className="text-sm font-medium text-gray-800 hover:text-blue-600 mt-0.5 block truncate"
                              >
                                {kaprodi.no_telp}
                              </a>
                            ) : (
                              <p className="text-sm text-gray-400 mt-0.5">-</p>
                            )}
                          </div>
                        </div>

                        {/* 4. Bidang Studi */}
                        <div className="bg-gray-50/80 rounded-xl p-3.5 border border-gray-100 flex items-start gap-3">
                          <div className="h-9 w-9 rounded-lg bg-white border border-gray-200 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs">
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
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                              />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">
                              Bidang Studi / Spesialisasi
                            </span>
                            <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">
                              {kaprodi.field_studi || "-"}
                            </p>
                          </div>
                        </div>

                        {/* 5. Alumni */}
                        <div className="bg-gray-50/80 rounded-xl p-3.5 border border-gray-100 flex items-start gap-3">
                          <div className="h-9 w-9 rounded-lg bg-white border border-gray-200 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
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
                                d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                              />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">
                              Alumni
                            </span>
                            <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">
                              {kaprodi.alumni || "-"}
                            </p>
                          </div>
                        </div>

                        {/* 6. Homebase */}
                        <div className="bg-gray-50/80 rounded-xl p-3.5 border border-gray-100 flex items-start gap-3">
                          <div className="h-9 w-9 rounded-lg bg-white border border-gray-200 text-teal-600 flex items-center justify-center shrink-0 shadow-2xs">
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
                          </div>
                          <div className="min-w-0">
                            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">
                              Homebase
                            </span>
                            <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">
                              {kaprodi.homebase || "-"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Footer: Encrypted Code Dosen */}
                      <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-400">Kode Dosen:</span>
                          <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700 max-w-[260px] truncate">
                            {kaprodi.code || "-"}
                          </span>
                          {kaprodi.code && (
                            <button
                              onClick={() => handleCopyCode(kaprodi.code)}
                              className="text-blue-600 hover:text-blue-800 transition"
                              title="Salin Kode Dosen"
                            >
                              {copiedCode === kaprodi.code ? (
                                <span className="text-emerald-600 font-medium text-[11px]">
                                  Tersalin!
                                </span>
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3.5 w-3.5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                  />
                                </svg>
                              )}
                            </button>
                          )}
                        </div>

                        <span className="text-[11px] text-gray-400">
                          Data sinkron dengan Master Data Program Studi
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Assign / Update Kaprodi Modal ── */}
      {selectedProdiForAssign && (
        <AssignKaprodiModal
          isOpen={assignModalOpen}
          onClose={() => {
            setAssignModalOpen(false);
            setSelectedProdiForAssign(null);
          }}
          onSuccess={handleAssignSuccess}
          codeProgramStudi={selectedProdiForAssign.code_program_studi}
          namaProgramStudi={selectedProdiForAssign.nama_program_studi}
          currentKaprodiCode={selectedProdiForAssign.kaprodi?.code || null}
          currentKaprodiName={selectedProdiForAssign.kaprodi?.nama_dosen || null}
        />
      )}

      {/* ── Toast Notification ── */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-600 text-white shadow-xl animate-fadeIn text-xs font-medium">
          <svg
            className="h-4 w-4 shrink-0 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-white/80 hover:text-white"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
