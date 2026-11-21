import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import {
  getMahasiswaPenilaianKelas,
  getTemplatePenilaianKelas,
  getMyAssessmentNodes,
} from "@/features/dosen/api/penilaian";
import DosenTemplatePenilaianModal from "@/features/dosen/components/organisms/DosenTemplatePenilaianModal";
import DosenPenilaianDetailModal from "@/features/dosen/components/organisms/DosenPenilaianDetailModal";
import DosenInputNilaiModal from "@/features/dosen/components/organisms/DosenInputNilaiModal";
import DosenBulkInputNilaiModal from "@/features/dosen/components/organisms/DosenBulkInputNilaiModal";
import Button from "@/components/ui/Button";
import type {
  DosenPenilaianKelasItem,
  DosenPenilaianMahasiswaItem,
  DosenPenilaianTemplateData,
  PenilaianLeafNode,
} from "@/features/dosen/types";

export default function DosenPenilaianMahasiswa() {
  const { codeKelas } = useParams<{ codeKelas: string }>();
  const location = useLocation();

  // Class info from location state if available
  const stateKelas = (location.state as { kelas?: DosenPenilaianKelasItem })
    ?.kelas;
  const [kelasInfo, setKelasInfo] = useState<DosenPenilaianKelasItem | null>(
    stateKelas || null
  );

  const [mahasiswaList, setMahasiswaList] = useState<
    DosenPenilaianMahasiswaItem[]
  >([]);
  const [templateData, setTemplateData] =
    useState<DosenPenilaianTemplateData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal States
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Single Input/Update Modal State
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [inputModalMode, setInputModalMode] = useState<"input" | "update">(
    "input"
  );
  const [selectedMhsForInput, setSelectedMhsForInput] =
    useState<DosenPenilaianMahasiswaItem | null>(null);

  // Detail Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMhsForDetail, setSelectedMhsForDetail] =
    useState<DosenPenilaianMahasiswaItem | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const loadAllData = useCallback(async () => {
    if (!codeKelas) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Fetch Mahasiswa
      const mhsPromise = getMahasiswaPenilaianKelas(codeKelas);

      // 2. Fetch Template
      const templatePromise = getTemplatePenilaianKelas(codeKelas);

      // 3. Fetch Kelas info if not provided in router state
      const kelasPromise = !kelasInfo ? getMyAssessmentNodes() : null;

      const [mhsRes, templateRes, kelasRes] = await Promise.all([
        mhsPromise,
        templatePromise,
        kelasPromise,
      ]);

      if (!mhsRes.status) {
        setError(mhsRes.message || "Gagal memuat data mahasiswa.");
      } else {
        setMahasiswaList(mhsRes.data || []);
      }

      if (templateRes.status && templateRes.data) {
        setTemplateData(templateRes.data);
      }

      if (kelasRes && kelasRes.status && Array.isArray(kelasRes.data)) {
        const found = kelasRes.data.find((k) => k.code_kelas === codeKelas);
        if (found) {
          setKelasInfo({
            code_kelas: found.code_kelas,
            nama_kelas: found.nama_kelas,
            nama_matakuliah: found.matakuliah,
            kode_matakuliah: "",
            semester: 1,
            tahun_akademik: "",
            nama_program_studi: "",
            block: true,
            jumlah_mahasiswa: 0,
            sudah_input: 0,
            sudah_validasi: 0,
            belum_input: 0,
          });
        }
      }
    } catch {
      setError("Terjadi kesalahan saat memuat data penilaian.");
    } finally {
      setLoading(false);
    }
  }, [codeKelas, kelasInfo]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Leaf nodes from template
  const leafNodes: PenilaianLeafNode[] = useMemo(() => {
    if (templateData?.leaf_nodes && templateData.leaf_nodes.length > 0) {
      return templateData.leaf_nodes;
    }
    return [];
  }, [templateData]);

  // Stats calculation
  const totalMhs = mahasiswaList.length;
  const sudahDiisiCount = mahasiswaList.filter(
    (m) =>
      m.status_penilaian === "proses" ||
      m.status_penilaian === "valid" ||
      m.status_penilaian === "sudah_validasi" ||
      m.status_penilaian === "revisi"
  ).length;

  const revisiCount = mahasiswaList.filter(
    (m) => m.status_penilaian === "revisi"
  ).length;

  const validasiCount = mahasiswaList.filter(
    (m) =>
      m.status_penilaian === "valid" || m.status_penilaian === "sudah_validasi"
  ).length;

  const belumInputCount = mahasiswaList.filter(
    (m) =>
      m.status_penilaian === "belum_input" ||
      (!m.status_penilaian && (m.sudah_diisi || 0) === 0)
  ).length;

  // Filtered students
  const filteredMahasiswa = useMemo(() => {
    return mahasiswaList.filter((m) => {
      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "belum_input") {
          const isBelum =
            m.status_penilaian === "belum_input" ||
            (!m.status_penilaian && (m.sudah_diisi || 0) === 0);
          if (!isBelum) return false;
        } else if (statusFilter === "valid") {
          const isValid =
            m.status_penilaian === "valid" ||
            m.status_penilaian === "sudah_validasi";
          if (!isValid) return false;
        } else if (m.status_penilaian !== statusFilter) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNama = m.nama_mahasiswa?.toLowerCase().includes(q);
        const matchNim = m.nim?.toLowerCase().includes(q);
        return matchNama || matchNim;
      }

      return true;
    });
  }, [mahasiswaList, statusFilter, searchQuery]);

  // Handlers
  function handleOpenInputModal(
    mhs: DosenPenilaianMahasiswaItem,
    mode: "input" | "update"
  ) {
    setSelectedMhsForInput(mhs);
    setInputModalMode(mode);
    setIsInputModalOpen(true);
  }

  function handleOpenDetailModal(mhs: DosenPenilaianMahasiswaItem) {
    setSelectedMhsForDetail(mhs);
    setIsDetailModalOpen(true);
  }

  function handleInputSuccess() {
    setToastMessage("Nilai mahasiswa berhasil disimpan!");
    loadAllData();
  }

  function handleBulkSuccess() {
    setToastMessage("Input nilai massal berhasil disimpan!");
    loadAllData();
  }

  const namaMatakuliah =
    kelasInfo?.nama_matakuliah ||
    templateData?.nama_matakuliah ||
    "Penilaian Kelas";
  const kodeMatakuliah =
    kelasInfo?.kode_matakuliah || templateData?.kode_matakuliah || "";
  const namaKelas = kelasInfo?.nama_kelas || "";

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 flex items-center justify-between shadow-xs transition-all animate-fadeIn">
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-emerald-600 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 ml-4 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Navigation Breadcrumbs & Back Button */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/dosen/penilaian"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800 transition"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Kembali ke Daftar Kelas
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsTemplateModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-200 rounded-lg shadow-2xs transition-all cursor-pointer select-none"
          >
            <svg
              className="h-3.5 w-3.5 text-gray-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <span>Template Penilaian</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBulkModalOpen(true)}
            disabled={mahasiswaList.length === 0}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-brand-700 hover:bg-brand-800 active:bg-brand-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-2xs transition-all cursor-pointer select-none"
          >
            <svg
              className="h-3.5 w-3.5 opacity-90"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Input Massal</span>
          </button>

          <button
            type="button"
            onClick={loadAllData}
            disabled={loading}
            className="inline-flex items-center justify-center p-1.5 text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-200 rounded-lg shadow-2xs transition-all cursor-pointer select-none disabled:opacity-50"
            title="Muat ulang data"
          >
            <svg
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Class Information Header Card */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              {kodeMatakuliah && (
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700">
                  {kodeMatakuliah}
                </span>
              )}
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {namaMatakuliah}
              </h1>
              {kelasInfo?.block ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                  Sistem Blok
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                  Reguler
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-500 flex-wrap">
              {namaKelas && (
                <span className="font-semibold text-gray-800 bg-gray-100 px-2.5 py-0.5 rounded">
                  {namaKelas}
                </span>
              )}
              {kelasInfo?.semester && (
                <span>Semester {kelasInfo.semester}</span>
              )}
              {kelasInfo?.tahun_akademik && (
                <span>• T.A. {kelasInfo.tahun_akademik}</span>
              )}
              {kelasInfo?.nama_program_studi && (
                <span>• {kelasInfo.nama_program_studi}</span>
              )}
              {templateData?.leaf_nodes && (
                <span>• {templateData.leaf_nodes.length} Komponen Penilaian</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Revisi Warning Alert if any students need revision */}
      {revisiCount > 0 && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 sm:p-5 text-rose-900 flex items-start gap-3 shadow-xs">
          <svg
            className="h-5 w-5 text-rose-600 shrink-0 mt-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-rose-900">
              Perhatian: {revisiCount} Mahasiswa Memerlukan Revisi Penilaian!
            </h4>
            <p className="text-xs text-rose-700">
              Kaprodi telah memberikan catatan revisi pada nilai mahasiswa berikut.
              Silakan klik tombol <strong>Edit Nilai</strong> untuk meninjau
              catatan Kaprodi dan memperbarui skor.
            </p>
          </div>
        </div>
      )}

      {/* Mini Stats Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-500 font-medium">
              Total Mahasiswa
            </span>
            <p className="text-lg font-bold text-gray-900">{totalMhs}</p>
          </div>
          <span className="h-7 w-7 rounded-lg bg-gray-50 text-gray-600 flex items-center justify-center font-bold text-xs">
            👥
          </span>
        </div>

        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-500 font-medium">
              Sudah Diisi
            </span>
            <p className="text-lg font-bold text-brand-700">{sudahDiisiCount}</p>
          </div>
          <span className="h-7 w-7 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-xs">
            📝
          </span>
        </div>

        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-500 font-medium">
              Tervalidasi
            </span>
            <p className="text-lg font-bold text-emerald-700">{validasiCount}</p>
          </div>
          <span className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
            ✓
          </span>
        </div>

        <div
          className={`bg-white rounded-xl p-3 border shadow-xs flex items-center justify-between ${
            revisiCount > 0 ? "border-rose-300 bg-rose-50/30" : "border-gray-100"
          }`}
        >
          <div>
            <span className="text-[11px] text-gray-500 font-medium">
              Perlu Revisi
            </span>
            <p
              className={`text-lg font-bold ${
                revisiCount > 0 ? "text-rose-600" : "text-gray-400"
              }`}
            >
              {revisiCount}
            </p>
          </div>
          <span className="h-7 w-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs">
            ⚠️
          </span>
        </div>

        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-500 font-medium">
              Belum Diisi
            </span>
            <p className="text-lg font-bold text-gray-500">{belumInputCount}</p>
          </div>
          <span className="h-7 w-7 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-xs">
            ⏳
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Cari mahasiswa berdasarkan nama atau NIM..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-600 focus:bg-white focus:ring-2 focus:ring-brand-100 transition"
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { key: "all", label: "Semua" },
            { key: "belum_input", label: "Belum Diisi" },
            { key: "proses", label: "Proses" },
            { key: "revisi", label: "Revisi" },
            { key: "valid", label: "Tervalidasi" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                statusFilter === tab.key
                  ? "bg-brand-700 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-rose-500 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={loadAllData}>
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Table of Students */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-50 rounded-xl" />
            ))}
          </div>
        ) : filteredMahasiswa.length === 0 ? (
          <div className="p-12 text-center">
            <div className="h-12 w-12 mx-auto rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-3">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h4 className="text-sm font-semibold text-gray-800">
              Tidak ada mahasiswa yang sesuai
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              {searchQuery || statusFilter !== "all"
                ? "Coba sesuaikan pencarian atau filter status Anda."
                : "Belum ada daftar mahasiswa di kelas penilaian ini."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Mahasiswa</th>
                  <th className="py-3 px-4 text-center">Progress Komponen</th>
                  <th className="py-3 px-4 text-center">Nilai Akhir</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Catatan</th>
                  <th className="py-3 px-4 text-center w-44">Aksi Input</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMahasiswa.map((mhs, idx) => {
                  const status = mhs.status_penilaian;
                  const isValidated =
                    status === "valid" || status === "sudah_validasi";
                  const isRevisi = status === "revisi";
                  const isProses = status === "proses";

                  const nodesFilled = mhs.sudah_diisi || 0;
                  const totalNodes =
                    mhs.total_nodes || leafNodes.length || 0;
                  const isFullFilled =
                    totalNodes > 0 && nodesFilled >= totalNodes;

                  return (
                    <tr
                      key={mhs.code_mahasiswa}
                      className={`hover:bg-gray-50/70 transition-colors ${
                        isRevisi ? "bg-rose-50/20" : ""
                      }`}
                    >
                      {/* No */}
                      <td className="py-3.5 px-4 text-center text-xs text-gray-400 font-mono">
                        {idx + 1}
                      </td>

                      {/* Mahasiswa info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-brand-50 text-brand-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {mhs.nama_mahasiswa?.charAt(0)?.toUpperCase() || "M"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">
                              {mhs.nama_mahasiswa}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-xs text-gray-500">
                                {mhs.nim}
                              </span>
                              {mhs.status_mahasiswa && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 font-medium">
                                  {mhs.status_mahasiswa}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Progress Komponen */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              isFullFilled
                                ? "bg-emerald-100 text-emerald-800"
                                : nodesFilled > 0
                                ? "bg-amber-100 text-amber-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {nodesFilled} / {totalNodes} node
                          </span>
                        </div>
                      </td>

                      {/* Nilai Akhir */}
                      <td className="py-3.5 px-4 text-center">
                        {mhs.nilai_akhir != null ? (
                          <span className="text-sm font-bold text-gray-900 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200">
                            {Number(mhs.nilai_akhir).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 font-mono">
                            -
                          </span>
                        )}
                      </td>

                      {/* Status Penilaian */}
                      <td className="py-3.5 px-4 text-center">
                        {isValidated ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <svg
                              className="h-3 w-3"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Tervalidasi
                          </span>
                        ) : isRevisi ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <svg
                              className="h-3 w-3"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2.5}
                            >
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="8" x2="12" y2="12" />
                              <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            Perlu Revisi
                          </span>
                        ) : isProses ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <svg
                              className="h-3 w-3"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            Proses
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500">
                            Belum Diisi
                          </span>
                        )}
                      </td>

                      {/* Catatan Kaprodi / Dosen */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {mhs.catatan_kaprodi && (
                          <div className="rounded-lg bg-rose-50 border border-rose-200 px-2.5 py-1.5 text-xs text-rose-800 mb-1.5 flex items-start gap-1.5">
                            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider shrink-0 mt-0.5">
                              Kaprodi:
                            </span>
                            <span className="line-clamp-2">
                              {mhs.catatan_kaprodi}
                            </span>
                          </div>
                        )}
                        {mhs.catatan_dosen && (
                          <div className="text-xs text-gray-500 italic line-clamp-1">
                            &ldquo;{mhs.catatan_dosen}&rdquo;
                          </div>
                        )}
                        {!mhs.catatan_kaprodi && !mhs.catatan_dosen && (
                          <span className="text-xs text-gray-300">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Detail Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetailModal(mhs)}
                            title="Lihat Detail Tree & Skor"
                            className="inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:text-brand-700 active:bg-gray-100 border border-gray-200 rounded-lg shadow-2xs transition-all cursor-pointer whitespace-nowrap select-none"
                          >
                            <svg
                              className="h-3.5 w-3.5 text-gray-500"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            <span>Detail</span>
                          </button>

                          {/* Input / Update Button */}
                          {isValidated ? (
                            <span
                              title="Nilai telah divalidasi Kaprodi (Terkunci)"
                              className="inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-400 bg-gray-50 border border-gray-200/80 rounded-lg select-none cursor-not-allowed whitespace-nowrap"
                            >
                              <svg
                                className="h-3.5 w-3.5 text-gray-400"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <rect
                                  x="3"
                                  y="11"
                                  width="18"
                                  height="11"
                                  rx="2"
                                  ry="2"
                                />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                              </svg>
                              <span>Terkunci</span>
                            </span>
                          ) : isRevisi ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenInputModal(mhs, "update")
                              }
                              title="Revisi Nilai Mahasiswa"
                              className="inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50/60 hover:bg-rose-100 active:bg-rose-200 border border-rose-200 rounded-lg shadow-2xs transition-all cursor-pointer whitespace-nowrap select-none"
                            >
                              <svg
                                className="h-3.5 w-3.5 text-rose-600"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span>Revisi</span>
                            </button>
                          ) : isProses ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenInputModal(mhs, "update")
                              }
                              title="Edit / Perbarui Nilai Mahasiswa"
                              className="inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-semibold text-brand-700 bg-brand-50/60 hover:bg-brand-100/70 active:bg-brand-200/60 border border-brand-200 rounded-lg shadow-2xs transition-all cursor-pointer whitespace-nowrap select-none"
                            >
                              <svg
                                className="h-3.5 w-3.5 text-brand-600"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span>Edit</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenInputModal(mhs, "input")}
                              title="Input Nilai Baru"
                              className="inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-brand-700 hover:bg-brand-800 active:bg-brand-900 rounded-lg shadow-2xs transition-all cursor-pointer whitespace-nowrap select-none"
                            >
                              <svg
                                className="h-3.5 w-3.5 opacity-90"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span>Input</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Template Modal */}
      {codeKelas && (
        <DosenTemplatePenilaianModal
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          codeKelas={codeKelas}
          namaKelas={namaKelas}
          namaMatakuliah={namaMatakuliah}
        />
      )}

      {/* Bulk Input Modal */}
      {codeKelas && (
        <DosenBulkInputNilaiModal
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
          onSuccess={handleBulkSuccess}
          codeKelas={codeKelas}
          namaKelas={namaKelas}
          namaMatakuliah={namaMatakuliah}
          mahasiswaList={mahasiswaList}
          leafNodes={leafNodes}
        />
      )}

      {/* Single Input / Update Modal */}
      {selectedMhsForInput && codeKelas && (
        <DosenInputNilaiModal
          isOpen={isInputModalOpen}
          onClose={() => {
            setIsInputModalOpen(false);
            setSelectedMhsForInput(null);
          }}
          onSuccess={handleInputSuccess}
          mode={inputModalMode}
          codeKelas={codeKelas}
          codeMahasiswa={
            selectedMhsForInput.code_mahasiswa ||
            (selectedMhsForInput as any).code ||
            (selectedMhsForInput as any).mahasiswa_code ||
            selectedMhsForInput.nim
          }
          nim={selectedMhsForInput.nim}
          namaMahasiswa={selectedMhsForInput.nama_mahasiswa}
          catatanKaprodi={selectedMhsForInput.catatan_kaprodi}
          catatanDosen={selectedMhsForInput.catatan_dosen}
          leafNodes={leafNodes}
        />
      )}

      {/* Detail Modal */}
      {selectedMhsForDetail && codeKelas && (
        <DosenPenilaianDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedMhsForDetail(null);
          }}
          codeKelas={codeKelas}
          codeMahasiswa={
            selectedMhsForDetail.code_mahasiswa ||
            (selectedMhsForDetail as any).code ||
            (selectedMhsForDetail as any).mahasiswa_code ||
            selectedMhsForDetail.nim
          }
          nim={selectedMhsForDetail.nim}
          namaMahasiswa={selectedMhsForDetail.nama_mahasiswa}
        />
      )}
    </div>
  );
}
