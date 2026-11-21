import { useState, useEffect, useMemo, useCallback } from "react";
import * as XLSX from "xlsx";
import {
  getFeederStatus,
  getAuditKelasList,
  pullFeederKelas,
} from "@/features/admin/api/pddikti";
import type {
  FeederStatusData,
  StaffKelasItem,
  FeederPullKelasData,
} from "@/features/admin/types";

// ─── Format Date Utility ────────────────────────────────────────────────────────

function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr.replace(" ", "T"));
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    }).format(d);
  } catch {
    return dateStr;
  }
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function AuditPddikti() {
  // ── Feeder State ──
  const [feederData, setFeederData] = useState<FeederStatusData | null>(null);
  const [feederMessage, setFeederMessage] = useState<string>("");
  const [loadingFeeder, setLoadingFeeder] = useState<boolean>(true);
  const [feederError, setFeederError] = useState<string | null>(null);
  const [lastFeederChecked, setLastFeederChecked] = useState<Date | null>(null);

  // ── Kelas State ──
  const [kelasList, setKelasList] = useState<StaffKelasItem[]>([]);
  const [loadingKelas, setLoadingKelas] = useState<boolean>(true);
  const [kelasError, setKelasError] = useState<string | null>(null);

  // ── Search & Filter State ──
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedTahunAkademik, setSelectedTahunAkademik] = useState<string>("");
  const [selectedProdi, setSelectedProdi] = useState<string>("");
  const [auditStatusFilter, setAuditStatusFilter] = useState<"all" | "ready" | "no_dosen" | "no_mhs">("all");

  // ── Pagination State ──
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // ── Feeder Pull Audit State ──
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [auditingCode, setAuditingCode] = useState<string | null>(null);
  const [auditResultModal, setAuditResultModal] = useState<{
    kelas: StaffKelasItem;
    result: FeederPullKelasData;
    message: string;
  } | null>(null);
  const [auditModalTab, setAuditModalTab] = useState<"data" | "json">("data");
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>("");

  // ── Toast State ──
  const [toast, setToast] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const showToast = useCallback((type: "success" | "error" | "info", message: string) => {
    setToast({ type, message });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  // ─── Fetch Feeder Status ───────────────────────────────────────────────────────

  const fetchFeederStatus = useCallback(async (isManual = false) => {
    setLoadingFeeder(true);
    setFeederError(null);
    try {
      const res = await getFeederStatus();
      if (res.status && res.data) {
        setFeederData(res.data);
        setFeederMessage(res.message || "Koneksi ke Feeder aktif.");
        setLastFeederChecked(new Date());
        if (isManual) {
          showToast(
            res.data.connected ? "success" : "error",
            res.data.connected
              ? "Koneksi ke Feeder PDDIKTI berhasil diverifikasi!"
              : "Status: Feeder tidak terhubung."
          );
        }
      } else {
        setFeederData({ connected: false, token_valid_until: null });
        setFeederError(res.message || "Koneksi ke Feeder gagal.");
        setLastFeederChecked(new Date());
        if (isManual) {
          showToast("error", res.message || "Gagal menghubungi Feeder PDDIKTI.");
        }
      }
    } catch {
      setFeederData({ connected: false, token_valid_until: null });
      setFeederError("Terjadi kesalahan jaringan saat memeriksa koneksi Feeder.");
      setLastFeederChecked(new Date());
      if (isManual) {
        showToast("error", "Gagal menghubungi Feeder PDDIKTI.");
      }
    } finally {
      setLoadingFeeder(false);
    }
  }, [showToast]);

  // ─── Fetch Kelas List ─────────────────────────────────────────────────────────

  const fetchKelasList = useCallback(async (isManual = false) => {
    setLoadingKelas(true);
    setKelasError(null);
    try {
      const res = await getAuditKelasList();
      if (res.status && Array.isArray(res.data)) {
        setKelasList(res.data);
        if (isManual) {
          showToast("success", `Data audit kelas berhasil dimuat (${res.data.length} kelas).`);
        }
      } else {
        setKelasError(res.message || "Gagal mengambil daftar kelas.");
        if (isManual) {
          showToast("error", res.message || "Gagal mengambil daftar kelas.");
        }
      }
    } catch {
      setKelasError("Terjadi kesalahan jaringan saat mengambil data kelas.");
      if (isManual) {
        showToast("error", "Terjadi kesalahan saat mengambil daftar kelas.");
      }
    } finally {
      setLoadingKelas(false);
    }
  }, [showToast]);

  // Initial load
  useEffect(() => {
    fetchFeederStatus();
    fetchKelasList();
  }, [fetchFeederStatus, fetchKelasList]);

  // Manual refresh all
  const handleRefreshAll = () => {
    fetchFeederStatus(true);
    fetchKelasList(true);
  };

  // ─── Trigger Pull Feeder Kelas (Audit Action) ──────────────────────────────

  const handleAuditKelas = useCallback(
    async (item: StaffKelasItem) => {
      const codeKelas = item.code_kelas;
      if (!codeKelas) {
        showToast("error", "Kode kelas (code_kelas) tidak ditemukan.");
        return;
      }

      setAuditingCode(codeKelas);
      try {
        const res = await pullFeederKelas(codeKelas);
        if (res.status && res.data) {
          showToast(
            "success",
            res.message || "Data nilai kelas berhasil ditarik dari Feeder dan disimpan di cache."
          );
          setAuditResultModal({
            kelas: item,
            result: res.data,
            message:
              res.message ||
              "Data nilai kelas berhasil ditarik dari Feeder dan disimpan di cache.",
          });
          setAuditModalTab("data");
          setAuditSearchQuery("");
        } else {
          showToast("error", res.message || "Gagal menarik data kelas dari Feeder.");
        }
      } catch {
        showToast("error", "Terjadi kesalahan saat menghubungi endpoint Feeder pull kelas.");
      } finally {
        setAuditingCode(null);
      }
    },
    [showToast]
  );

  // Rows and columns within the audit modal
  const modalDataRows = useMemo(() => {
    if (!auditResultModal?.result?.data || !Array.isArray(auditResultModal.result.data)) {
      return [];
    }
    const rawList = auditResultModal.result.data;
    if (!auditSearchQuery.trim()) return rawList;
    const q = auditSearchQuery.toLowerCase().trim();
    return rawList.filter((row) => {
      if (typeof row === "object" && row !== null) {
        return Object.values(row).some((val) =>
          String(val).toLowerCase().includes(q)
        );
      }
      return String(row).toLowerCase().includes(q);
    });
  }, [auditResultModal, auditSearchQuery]);

  const modalDataColumns = useMemo(() => {
    if (
      !auditResultModal?.result?.data ||
      !Array.isArray(auditResultModal.result.data) ||
      auditResultModal.result.data.length === 0
    ) {
      return [];
    }
    const firstRow = auditResultModal.result.data[0];
    if (typeof firstRow === "object" && firstRow !== null) {
      return Object.keys(firstRow);
    }
    return ["Value"];
  }, [auditResultModal]);

  const handleExportModalDataExcel = () => {
    if (!auditResultModal || modalDataRows.length === 0) {
      showToast("error", "Tidak ada data baris Feeder untuk diekspor.");
      return;
    }
    try {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(modalDataRows);
      XLSX.utils.book_append_sheet(wb, ws, "Feeder Kelas");
      const safeKelas = (auditResultModal.kelas.nama_kelas || "Kelas").replace(/[^a-zA-Z0-9_-]/g, "_");
      const safeMk = (auditResultModal.kelas.kode_matakuliah || "MK").replace(/[^a-zA-Z0-9_-]/g, "_");
      XLSX.writeFile(wb, `Audit_Feeder_Kelas_${safeKelas}_${safeMk}.xlsx`);
      showToast("success", "Data Feeder kelas berhasil diekspor ke Excel.");
    } catch {
      showToast("error", "Gagal mengekspor data Feeder ke Excel.");
    }
  };

  // ─── Dynamic Filter Options ───────────────────────────────────────────────────

  const filterOptions = useMemo(() => {
    const semesters = new Set<string>();
    const tahunAkademiks = new Set<string>();
    const prodis = new Set<string>();

    kelasList.forEach((k) => {
      if (k.semester) semesters.add(String(k.semester));
      if (k.tahun_akademik) tahunAkademiks.add(String(k.tahun_akademik));
      if (k.kode_program_studi) prodis.add(String(k.kode_program_studi));
    });

    return {
      semesters: Array.from(semesters).sort((a, b) => Number(a) - Number(b)),
      tahunAkademiks: Array.from(tahunAkademiks).sort(),
      prodis: Array.from(prodis).sort(),
    };
  }, [kelasList]);

  // ─── Filtered Data ───────────────────────────────────────────────────────────

  const filteredKelas = useMemo(() => {
    return kelasList.filter((item) => {
      // Search query (Mata Kuliah, Kode MK, Nama Kelas, Tahun Akademik, Prodi)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNamaMk = item.nama_matakuliah?.toLowerCase().includes(q);
        const matchKodeMk = item.kode_matakuliah?.toLowerCase().includes(q);
        const matchKelas = item.nama_kelas?.toLowerCase().includes(q);
        const matchTahun = item.tahun_akademik?.toLowerCase().includes(q);
        const matchProdi = item.kode_program_studi?.toLowerCase().includes(q);
        if (!matchNamaMk && !matchKodeMk && !matchKelas && !matchTahun && !matchProdi) {
          return false;
        }
      }

      // Semester Filter
      if (selectedSemester && String(item.semester) !== selectedSemester) {
        return false;
      }

      // Tahun Akademik Filter
      if (selectedTahunAkademik && item.tahun_akademik !== selectedTahunAkademik) {
        return false;
      }

      // Program Studi Filter
      if (selectedProdi && item.kode_program_studi !== selectedProdi) {
        return false;
      }

      // Audit Status Filter
      const mhsCount = Number(item.jumlah_mahasiswa || 0);
      const dosenCount = Number(item.jumlah_dosen || 0);
      if (auditStatusFilter === "ready") {
        if (mhsCount === 0 || dosenCount === 0) return false;
      } else if (auditStatusFilter === "no_dosen") {
        if (dosenCount > 0) return false;
      } else if (auditStatusFilter === "no_mhs") {
        if (mhsCount > 0) return false;
      }

      return true;
    });
  }, [
    kelasList,
    searchQuery,
    selectedSemester,
    selectedTahunAkademik,
    selectedProdi,
    auditStatusFilter,
  ]);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSemester, selectedTahunAkademik, selectedProdi, auditStatusFilter]);

  // ─── Paginated Data ──────────────────────────────────────────────────────────

  const totalPages = Math.ceil(filteredKelas.length / pageSize) || 1;
  const paginatedKelas = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredKelas.slice(start, start + pageSize);
  }, [filteredKelas, currentPage, pageSize]);

  // ─── KPI Aggregates ──────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const totalKelasCount = kelasList.length;
    const totalMahasiswa = kelasList.reduce(
      (acc, item) => acc + Number(item.jumlah_mahasiswa || 0),
      0
    );
    const totalDosen = kelasList.reduce(
      (acc, item) => acc + Number(item.jumlah_dosen || 0),
      0
    );
    const readyKelas = kelasList.filter(
      (item) => Number(item.jumlah_mahasiswa || 0) > 0 && Number(item.jumlah_dosen || 0) > 0
    ).length;
    const readyPercentage =
      totalKelasCount > 0 ? Math.round((readyKelas / totalKelasCount) * 100) : 0;

    return {
      totalKelasCount,
      totalMahasiswa,
      totalDosen,
      readyKelas,
      readyPercentage,
    };
  }, [kelasList]);

  // ─── Export to Excel ─────────────────────────────────────────────────────────

  const handleExportExcel = () => {
    if (filteredKelas.length === 0) {
      showToast("error", "Tidak ada data kelas untuk diekspor.");
      return;
    }

    try {
      const dataToExport = filteredKelas.map((item, idx) => {
        const mhsCount = Number(item.jumlah_mahasiswa || 0);
        const dosenCount = Number(item.jumlah_dosen || 0);
        let statusAudit = "Lengkap (Siap Sinkron)";
        if (mhsCount === 0 && dosenCount === 0) {
          statusAudit = "Belum Ada Dosen & Mahasiswa";
        } else if (dosenCount === 0) {
          statusAudit = "Belum Ada Dosen Pengampu";
        } else if (mhsCount === 0) {
          statusAudit = "Belum Ada Mahasiswa";
        }

        return {
          No: idx + 1,
          "Kode MK": item.kode_matakuliah || "-",
          "Nama Mata Kuliah": item.nama_matakuliah || "-",
          Kelas: item.nama_kelas || "-",
          Semester: item.semester || "-",
          "Kode Prodi": item.kode_program_studi || "-",
          "Tahun Akademik": item.tahun_akademik || "-",
          "Jumlah Mahasiswa": mhsCount,
          "Jumlah Dosen": dosenCount,
          "Status Audit": statusAudit,
          "Code Kelas (Encrypted)": item.code_kelas || "-",
        };
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dataToExport);

      // Auto-width column adjustment
      ws["!cols"] = [
        { wch: 6 },
        { wch: 14 },
        { wch: 36 },
        { wch: 10 },
        { wch: 12 },
        { wch: 12 },
        { wch: 16 },
        { wch: 18 },
        { wch: 14 },
        { wch: 28 },
        { wch: 30 },
      ];

      XLSX.utils.book_append_sheet(wb, ws, "Audit Kelas PDDIKTI");

      const now = new Date();
      const dateTag = now.toISOString().slice(0, 10);
      XLSX.writeFile(wb, `Audit_PDDIKTI_Kelas_${dateTag}.xlsx`);
      showToast("success", "File Excel audit kelas berhasil diunduh.");
    } catch {
      showToast("error", "Gagal mengekspor data ke Excel.");
    }
  };

  // ─── Copy to Clipboard ────────────────────────────────────────────────────────

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    showToast("info", `${label} berhasil disalin ke clipboard.`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isConnected = feederData?.connected === true;

  return (
    <div className="space-y-6 pb-12">
      {/* ── Toast Notification ── */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 transition-all transform ease-out duration-300">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-xs font-medium text-white ${
              toast.type === "success"
                ? "bg-emerald-600"
                : toast.type === "error"
                ? "bg-rose-600"
                : "bg-blue-600"
            }`}
          >
            {toast.type === "success" && (
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            {toast.type === "error" && (
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
            {toast.type === "info" && (
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
                Audit PDDIKTI
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                  Feeder Sync
                </span>
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Monitoring konektivitas PDDIKTI Feeder & audit kelengkapan data rombongan belajar kelas perkuliahan
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-xs"
            title="Ekspor data kelas yang difilter ke file Excel"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            <span>Export Excel</span>
          </button>

          <button
            type="button"
            onClick={handleRefreshAll}
            disabled={loadingFeeder || loadingKelas}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-60 transition-colors shadow-xs"
            title="Muat ulang status Feeder dan data kelas"
          >
            <svg
              className={`h-4 w-4 ${loadingFeeder || loadingKelas ? "animate-spin" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            <span>{loadingFeeder || loadingKelas ? "Memuat..." : "Muat Ulang"}</span>
          </button>
        </div>
      </div>

      {/* ── Feeder Status Hero Card ── */}
      <div
        className={`rounded-2xl border p-5 sm:p-6 transition-all duration-200 ${
          isConnected
            ? "bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 border-emerald-200/90 shadow-xs"
            : "bg-gradient-to-br from-rose-50/70 via-white to-amber-50/30 border-rose-200/90 shadow-xs"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Status Ping Dot */}
            <div className="relative mt-1">
              <span
                className={`flex h-4 w-4 rounded-full ${
                  loadingFeeder
                    ? "bg-amber-400"
                    : isConnected
                    ? "bg-emerald-500"
                    : "bg-rose-500"
                }`}
              />
              {!loadingFeeder && isConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 top-0 left-0" />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-base font-bold text-gray-900">
                  Koneksi PDDIKTI Feeder
                </h2>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    loadingFeeder
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : isConnected
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-rose-100 text-rose-800 border border-rose-300"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      loadingFeeder ? "bg-amber-500" : isConnected ? "bg-emerald-600" : "bg-rose-600"
                    }`}
                  />
                  {loadingFeeder
                    ? "Memeriksa..."
                    : isConnected
                    ? "Terhubung ke Feeder"
                    : "Tidak Terhubung"}
                </span>

                <span className="text-[11px] font-mono text-gray-500 bg-gray-100/80 px-2 py-0.5 rounded-md border border-gray-200">
                  GET /api/staff/feeder/status
                </span>
              </div>

              <p className="text-xs text-gray-600 mt-1">
                {feederMessage || feederError || (isConnected ? "Koneksi ke Feeder aktif." : "Koneksi ke Feeder terputus.")}
              </p>

              {/* Token Valid Until Metadata */}
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-3 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>
                    Token Berlaku Hingga:{" "}
                    <strong className="text-gray-700 font-mono">
                      {feederData?.token_valid_until || "-"}
                    </strong>
                    {feederData?.token_valid_until && (
                      <span className="text-gray-400 ml-1.5">
                        ({formatDateTime(feederData.token_valid_until)})
                      </span>
                    )}
                  </span>
                </div>

                {lastFeederChecked && (
                  <div className="flex items-center gap-1 text-[11px] text-gray-400">
                    <span>Terakhir dicek:</span>
                    <span className="font-medium text-gray-500">
                      {lastFeederChecked.toLocaleTimeString("id-ID")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action: Ping Feeder Status */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              type="button"
              onClick={() => fetchFeederStatus(true)}
              disabled={loadingFeeder}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 shadow-2xs transition-colors disabled:opacity-60"
            >
              <svg
                className={`h-3.5 w-3.5 text-gray-500 ${loadingFeeder ? "animate-spin" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M23 4v6h-6M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              <span>{loadingFeeder ? "Mengecek..." : "Cek Ulang Feeder"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Feeder Status */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3.5">
          <div
            className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
              isConnected
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                : "bg-rose-50 text-rose-600 border border-rose-100"
            }`}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12A10 10 0 0 1 12 2z" />
              {isConnected ? (
                <polyline points="9 12 11 14 15 10" />
              ) : (
                <>
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </>
              )}
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-500">Status Feeder</p>
            <p
              className={`text-lg font-bold truncate ${
                isConnected ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {loadingFeeder ? "Memeriksa..." : isConnected ? "Aktif" : "Terputus"}
            </p>
            <p className="text-[11px] text-gray-400 truncate">
              {feederData?.token_valid_until ? `Valid s/d ${feederData.token_valid_until.split(" ")[0]}` : "Tidak ada token"}
            </p>
          </div>
        </div>

        {/* Metric 2: Total Kelas */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-500">Total Kelas</p>
            <p className="text-lg font-bold text-gray-900">
              {loadingKelas ? "..." : `${stats.totalKelasCount} Kelas`}
            </p>
            <p className="text-[11px] text-gray-400 truncate">Terdaftar di Siakad FK</p>
          </div>
        </div>

        {/* Metric 3: Total Mahasiswa */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-500">Total Peserta Mhs</p>
            <p className="text-lg font-bold text-gray-900">
              {loadingKelas ? "..." : `${stats.totalMahasiswa} Mahasiswa`}
            </p>
            <p className="text-[11px] text-gray-400 truncate">Di seluruh kelas perkuliahan</p>
          </div>
        </div>

        {/* Metric 4: Kesiapan Audit */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-500">Kesiapan Audit Sinkron</p>
            <p className="text-lg font-bold text-gray-900">
              {loadingKelas ? "..." : `${stats.readyPercentage}%`}
            </p>
            <p className="text-[11px] text-gray-400 truncate">
              {stats.readyKelas} dari {stats.totalKelasCount} kelas lengkap
            </p>
          </div>
        </div>
      </div>

      {/* ── Kelas Section (Audit PDDIKTI) ── */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {/* Section Header & Toolbar */}
        <div className="p-5 border-b border-gray-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                Daftar Kelas Perkuliahan
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {filteredKelas.length} Kelas
                </span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Data rombongan belajar diambil langsung dari endpoint{" "}
                <span className="font-mono text-gray-700">/api/staff/kelas</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              {(searchQuery || selectedSemester || selectedTahunAkademik || selectedProdi || auditStatusFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSemester("");
                    setSelectedTahunAkademik("");
                    setSelectedProdi("");
                    setAuditStatusFilter("all");
                  }}
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium px-2 py-1 rounded-md hover:bg-brand-50 transition-colors"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 pt-1">
            {/* Search */}
            <div className="md:col-span-4 relative">
              <input
                type="text"
                placeholder="Cari mata kuliah, kode MK, kelas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 placeholder-gray-400"
              />
              <svg
                className="h-4 w-4 text-gray-400 absolute left-3 top-2.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            {/* Semester Dropdown */}
            <div className="md:col-span-2">
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="">Semua Semester</option>
                {filterOptions.semesters.map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Tahun Akademik Dropdown */}
            <div className="md:col-span-2">
              <select
                value={selectedTahunAkademik}
                onChange={(e) => setSelectedTahunAkademik(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="">Semua Thn Akademik</option>
                {filterOptions.tahunAkademiks.map((ta) => (
                  <option key={ta} value={ta}>
                    {ta}
                  </option>
                ))}
              </select>
            </div>

            {/* Prodi Dropdown */}
            <div className="md:col-span-2">
              <select
                value={selectedProdi}
                onChange={(e) => setSelectedProdi(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="">Semua Prodi</option>
                {filterOptions.prodis.map((p) => (
                  <option key={p} value={p}>
                    Prodi {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Audit Dropdown */}
            <div className="md:col-span-2">
              <select
                value={auditStatusFilter}
                onChange={(e) =>
                  setAuditStatusFilter(e.target.value as "all" | "ready" | "no_dosen" | "no_mhs")
                }
                className="w-full py-2 px-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white font-medium"
              >
                <option value="all">Semua Status Audit</option>
                <option value="ready">✓ Siap Sinkron (Lengkap)</option>
                <option value="no_dosen">⚠ Belum Ada Dosen</option>
                <option value="no_mhs">⚠ Belum Ada Mahasiswa</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Table Area ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Mata Kuliah</th>
                <th className="py-3 px-4 text-center">Kelas</th>
                <th className="py-3 px-4 text-center">Semester</th>
                <th className="py-3 px-4 text-center">Prodi</th>
                <th className="py-3 px-4 text-center">Tahun Akademik</th>
                <th className="py-3 px-4 text-center">Mahasiswa</th>
                <th className="py-3 px-4 text-center">Dosen</th>
                <th className="py-3 px-4 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingKelas ? (
                // Skeleton Rows
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4 text-center">
                      <div className="h-4 w-4 bg-gray-200 rounded mx-auto" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-40 bg-gray-200 rounded mb-1" />
                      <div className="h-3 w-20 bg-gray-100 rounded" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-5 w-8 bg-gray-200 rounded-full mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-5 w-12 bg-gray-200 rounded-full mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-4 w-8 bg-gray-200 rounded mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-4 w-16 bg-gray-200 rounded mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-5 w-12 bg-gray-200 rounded-full mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-5 w-12 bg-gray-200 rounded-full mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-6 w-12 bg-gray-200 rounded mx-auto" />
                    </td>
                  </tr>
                ))
              ) : kelasError ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                      </div>
                      <p className="font-medium text-gray-800">{kelasError}</p>
                      <button
                        type="button"
                        onClick={() => fetchKelasList(true)}
                        className="mt-2 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-200"
                      >
                        Coba Lagi
                      </button>
                    </div>
                  </td>
                </tr>
              ) : paginatedKelas.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg className="h-10 w-10 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-sm font-medium text-gray-600">Tidak ada data kelas yang sesuai</p>
                      <p className="text-xs text-gray-400">Silakan ubah kata kunci pencarian atau sesuaikan filter Anda.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedKelas.map((item, index) => {
                  const rowNumber = (currentPage - 1) * pageSize + index + 1;
                  const mhsCount = Number(item.jumlah_mahasiswa || 0);
                  const dosenCount = Number(item.jumlah_dosen || 0);

                  return (
                    <tr
                      key={item.code_kelas || item.kelas_id || index}
                      className="hover:bg-gray-50/70 transition-colors group"
                    >
                      {/* No */}
                      <td className="py-3 px-4 text-center font-medium text-gray-500">
                        {rowNumber}
                      </td>

                      {/* Mata Kuliah */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">
                          {item.nama_matakuliah || "-"}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200">
                            {item.kode_matakuliah || "-"}
                          </span>
                          {item.code_kelas && (
                            <span
                              className="text-[10px] font-mono text-gray-400 truncate max-w-[120px]"
                              title={item.code_kelas}
                            >
                              id: {item.kelas_id}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Kelas */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                          {item.nama_kelas || "-"}
                        </span>
                      </td>

                      {/* Semester */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          Smt {item.semester || "-"}
                        </span>
                      </td>

                      {/* Prodi */}
                      <td className="py-3 px-4 text-center">
                        <span className="font-medium text-gray-700 font-mono">
                          {item.kode_program_studi || "-"}
                        </span>
                      </td>

                      {/* Tahun Akademik */}
                      <td className="py-3 px-4 text-center text-gray-700 font-medium">
                        {item.tahun_akademik || "-"}
                      </td>

                      {/* Mahasiswa */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                            mhsCount > 0
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                          </svg>
                          {mhsCount} Mhs
                        </span>
                      </td>

                      {/* Dosen */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                            dosenCount > 0
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          {dosenCount} Dosen
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleAuditKelas(item)}
                          disabled={auditingCode === item.code_kelas}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:text-white bg-brand-50 hover:bg-brand-600 disabled:opacity-60 rounded-lg border border-brand-200 transition-colors shadow-2xs cursor-pointer"
                        >
                          {auditingCode === item.code_kelas ? (
                            <>
                              <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                <path d="M23 4v6h-6M1 20v-6h6" />
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                              </svg>
                              <span>Menarik...</span>
                            </>
                          ) : (
                            <>
                              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path d="M9 11l3 3L22 4" />
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1 2-2h11" />
                              </svg>
                              <span>Audit</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Footer ── */}
        {!loadingKelas && filteredKelas.length > 0 && (
          <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span>Menampilkan</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="py-1 px-2 rounded-lg border border-gray-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>
                dari <strong className="text-gray-800">{filteredKelas.length}</strong> kelas
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50 transition-colors font-medium"
              >
                Sebelumnya
              </button>

              <div className="flex items-center gap-1 px-2 font-medium text-gray-700">
                Halaman {currentPage} dari {totalPages}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50 transition-colors font-medium"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal Hasil Audit Pull Feeder Kelas ── */}
      {auditResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full border border-gray-200 shadow-2xl overflow-hidden transition-all transform animate-in fade-in-50 zoom-in-95 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 via-white to-brand-50/30 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Feeder Sync Active
                  </span>
                  <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                    GET /api/staff/feeder/pull/kelas
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  Hasil Audit Feeder PDDIKTI: {auditResultModal.kelas.nama_matakuliah}
                </h3>
                <p className="text-xs text-gray-500">
                  Kelas {auditResultModal.kelas.nama_kelas} • Semester {auditResultModal.kelas.semester} • Tahun Akademik {auditResultModal.kelas.tahun_akademik} • Kode MK: {auditResultModal.kelas.kode_matakuliah}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAuditResultModal(null)}
                className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Server Message Banner */}
            <div className="px-5 py-3 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between gap-3 text-xs text-emerald-800 shrink-0">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span className="font-medium">{auditResultModal.message}</span>
              </div>
              <span className="text-[11px] text-emerald-600 bg-white/80 px-2 py-0.5 rounded-md border border-emerald-200">
                Cache Stored
              </span>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Summary Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                {/* Source */}
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Sumber Data (Source)</p>
                  <p className="font-bold text-gray-900 text-sm mt-0.5 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {auditResultModal.result.source}
                  </p>
                </div>

                {/* Pulled At */}
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Waktu Tarik (Pulled At)</p>
                  <p className="font-semibold text-gray-900 mt-0.5 truncate" title={auditResultModal.result.pulled_at}>
                    {formatDateTime(auditResultModal.result.pulled_at)}
                  </p>
                </div>

                {/* Total Rows */}
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Total Baris Data</p>
                  <p className="font-bold text-brand-700 text-sm mt-0.5">
                    {auditResultModal.result.total_rows} Baris Data
                  </p>
                </div>

                {/* Code Kelas */}
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Code Kelas</p>
                    <button
                      type="button"
                      onClick={() => handleCopyText(auditResultModal.result.code_kelas, "code_kelas")}
                      className="text-[11px] text-brand-600 hover:text-brand-700 font-semibold cursor-pointer"
                    >
                      {copiedKey === "code_kelas" ? "Tersalin!" : "Salin"}
                    </button>
                  </div>
                  <p className="font-mono text-[11px] text-gray-700 truncate mt-0.5" title={auditResultModal.result.code_kelas}>
                    {auditResultModal.result.code_kelas}
                  </p>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="flex items-center justify-between border-b border-gray-200 pt-1">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAuditModalTab("data")}
                    className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                      auditModalTab === "data"
                        ? "border-brand-600 text-brand-700"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Daftar Nilai / Data ({auditResultModal.result.total_rows})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuditModalTab("json")}
                    className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                      auditModalTab === "json"
                        ? "border-brand-600 text-brand-700"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Raw Response JSON
                  </button>
                </div>

                {auditModalTab === "data" && modalDataRows.length > 0 && (
                  <button
                    type="button"
                    onClick={handleExportModalDataExcel}
                    className="flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 mb-2 transition-colors cursor-pointer"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    <span>Export Excel</span>
                  </button>
                )}
              </div>

              {/* Tab Content: Data */}
              {auditModalTab === "data" ? (
                <div className="space-y-3">
                  {/* Modal Search within rows if data is not empty */}
                  {Array.isArray(auditResultModal.result.data) && auditResultModal.result.data.length > 0 && (
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Cari dalam hasil data Feeder..."
                        value={auditSearchQuery}
                        onChange={(e) => setAuditSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white placeholder-gray-400"
                      />
                      <svg className="h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </div>
                  )}

                  {modalDataRows.length > 0 ? (
                    <div className="border border-gray-200 rounded-xl overflow-hidden max-h-80 overflow-y-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-[11px] uppercase tracking-wider sticky top-0">
                          <tr>
                            <th className="py-2.5 px-3 w-10 text-center">No</th>
                            {modalDataColumns.map((col) => (
                              <th key={col} className="py-2.5 px-3">
                                {col.replace(/_/g, " ")}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {modalDataRows.map((row, rowIdx) => (
                            <tr key={rowIdx} className="hover:bg-gray-50/80">
                              <td className="py-2 px-3 text-center text-gray-400 font-medium">{rowIdx + 1}</td>
                              {typeof row === "object" && row !== null ? (
                                modalDataColumns.map((col) => {
                                  const val = (row as Record<string, unknown>)[col];
                                  return (
                                    <td key={col} className="py-2 px-3 text-gray-700">
                                      {val !== null && val !== undefined
                                        ? typeof val === "object"
                                          ? JSON.stringify(val)
                                          : String(val)
                                        : "-"}
                                    </td>
                                  );
                                })
                              ) : (
                                <td className="py-2 px-3 text-gray-700">{String(row)}</td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 space-y-1">
                      <p className="text-xs font-semibold text-gray-600">Tidak ada baris data rincian</p>
                      <p className="text-[11px] text-gray-400">
                        Payload data dari Feeder berisi 0 baris atau belum memiliki rincian nilai. Silakan periksa tab Raw Response JSON.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Tab Content: JSON */
                <div className="relative">
                  <div className="absolute right-3 top-3 z-10">
                    <button
                      type="button"
                      onClick={() => handleCopyText(JSON.stringify(auditResultModal.result, null, 2), "JSON Response")}
                      className="px-2.5 py-1 text-xs font-semibold text-white bg-gray-800 hover:bg-gray-700 rounded-md shadow-xs transition-colors cursor-pointer"
                    >
                      {copiedKey === "JSON Response" ? "Tersalin!" : "Salin JSON"}
                    </button>
                  </div>
                  <pre className="p-4 bg-gray-950 text-emerald-400 rounded-xl overflow-x-auto text-[11px] font-mono max-h-80 border border-gray-800">
                    {JSON.stringify(
                      {
                        status: true,
                        message: auditResultModal.message,
                        data: auditResultModal.result,
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => handleAuditKelas(auditResultModal.kelas)}
                disabled={auditingCode === auditResultModal.kelas.code_kelas}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-brand-700 bg-white hover:bg-brand-50 border border-brand-200 shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                <svg
                  className={`h-3.5 w-3.5 ${auditingCode === auditResultModal.kelas.code_kelas ? "animate-spin" : ""}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M23 4v6h-6M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                <span>{auditingCode === auditResultModal.kelas.code_kelas ? "Menarik Ulang..." : "Tarik Ulang Feeder"}</span>
              </button>

              <button
                type="button"
                onClick={() => setAuditResultModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 transition-colors shadow-2xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
