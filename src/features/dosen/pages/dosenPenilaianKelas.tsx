import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getMyAssessmentNodes } from "@/features/dosen/api/penilaian";
import DosenTemplatePenilaianModal from "@/features/dosen/components/organisms/DosenTemplatePenilaianModal";
import Button from "@/components/ui/Button";
import type { DosenMyAssessmentNodeItem } from "@/features/dosen/types";

/**
 * Helper untuk memformat node_key menjadi teks yang rapi dan mudah dibaca
 * Contoh: "kompetensi_inti" -> "Kompetensi Inti", "osce" -> "OSCE"
 */
function formatNodeKey(nodeKey: string): string {
  if (!nodeKey) return "-";
  const upperKeys: Record<string, string> = {
    osce: "OSCE",
    cbl: "CBL",
    mcq: "MCQ",
    ospe: "OSPE",
    socap: "SOCAP",
    pbl: "PBL",
  };

  const lower = nodeKey.toLowerCase();
  if (upperKeys[lower]) return upperKeys[lower];

  return nodeKey
    .replace(/[_-]/g, " ")
    .split(" ")
    .map((word) =>
      upperKeys[word.toLowerCase()] ||
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(" ");
}

interface GroupedKelasItem {
  code_kelas: string;
  nama_kelas: string;
  matakuliah: string;
  nodes: DosenMyAssessmentNodeItem[];
}

export default function DosenPenilaianKelas() {
  const navigate = useNavigate();

  const [nodes, setNodes] = useState<DosenMyAssessmentNodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMatakuliah, setSelectedMatakuliah] = useState<string>("all");
  const [selectedKelas, setSelectedKelas] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grouped" | "table">("grouped");

  // Template Modal State
  const [templateModalTarget, setTemplateModalTarget] = useState<{
    codeKelas: string;
    namaKelas: string;
    namaMatakuliah: string;
  } | null>(null);

  // Mengambil data saat pertama kali komponen dimuat
  useEffect(() => {
    let ignore = false;

    async function loadInitialNodes() {
      const res = await getMyAssessmentNodes();
      if (ignore) return;

      if (!res.status) {
        setError(res.message || "Gagal memuat daftar node validasi penilaian.");
        setNodes([]);
      } else {
        setNodes(res.data || []);
      }
      setLoading(false);
    }

    loadInitialNodes();

    return () => {
      ignore = true;
    };
  }, []);

  // Fungsi reload data secara manual
  const handleRefresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    const res = await getMyAssessmentNodes();

    if (!res.status) {
      setError(res.message || "Gagal memuat daftar node validasi penilaian.");
      setNodes([]);
    } else {
      setNodes(res.data || []);
    }
    setLoading(false);
  }, []);

  // Daftar opsi filter unik
  const matakuliahList = useMemo(() => {
    return Array.from(new Set(nodes.map((n) => n.matakuliah).filter(Boolean))).sort();
  }, [nodes]);

  const kelasOptions = useMemo(() => {
    return Array.from(new Set(nodes.map((n) => n.nama_kelas).filter(Boolean))).sort();
  }, [nodes]);

  // Filter & Search logic
  const filteredNodes = useMemo(() => {
    return nodes.filter((item) => {
      // Filter Matakuliah
      if (
        selectedMatakuliah !== "all" &&
        item.matakuliah !== selectedMatakuliah
      ) {
        return false;
      }

      // Filter Nama Kelas
      if (selectedKelas !== "all" && item.nama_kelas !== selectedKelas) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchMk = item.matakuliah?.toLowerCase().includes(q);
        const matchKelas = item.nama_kelas?.toLowerCase().includes(q);
        const matchKey = item.node_key?.toLowerCase().includes(q);
        const matchFormattedKey = formatNodeKey(item.node_key).toLowerCase().includes(q);
        const matchId = String(item.assessment_dosen_id).includes(q);
        return matchMk || matchKelas || matchKey || matchFormattedKey || matchId;
      }

      return true;
    });
  }, [nodes, selectedMatakuliah, selectedKelas, searchQuery]);

  // Kelompokkan node berdasarkan kelas untuk tampilan grup
  const groupedClasses = useMemo<GroupedKelasItem[]>(() => {
    const map = new Map<string, GroupedKelasItem>();

    filteredNodes.forEach((node) => {
      const groupKey = node.code_kelas || `${node.matakuliah}_${node.nama_kelas}`;
      const existing = map.get(groupKey);

      if (existing) {
        existing.nodes.push(node);
      } else {
        map.set(groupKey, {
          code_kelas: node.code_kelas,
          nama_kelas: node.nama_kelas,
          matakuliah: node.matakuliah,
          nodes: [node],
        });
      }
    });

    return Array.from(map.values());
  }, [filteredNodes]);

  // Statistik Ringkasan
  const totalAssignedNodes = nodes.length;
  const totalUniqueClasses = useMemo(() => {
    return new Set(nodes.map((n) => n.code_kelas || n.nama_kelas)).size;
  }, [nodes]);
  const totalUniqueMatakuliah = matakuliahList.length;
  const totalUniqueNodeKeys = useMemo(() => {
    return new Set(nodes.map((n) => n.node_key)).size;
  }, [nodes]);

  // Navigasi ke halaman input nilai per node atau per kelas
  function handleNavigateToPenilaian(node: DosenMyAssessmentNodeItem) {
    navigate(`/dosen/penilaian/${encodeURIComponent(node.code_kelas)}`, {
      state: {
        kelas: {
          code_kelas: node.code_kelas,
          nama_kelas: node.nama_kelas,
          nama_matakuliah: node.matakuliah,
          kode_matakuliah: "",
          semester: 1,
          tahun_akademik: "",
          nama_program_studi: "",
          block: true,
          jumlah_mahasiswa: 0,
          sudah_input: 0,
          sudah_validasi: 0,
          belum_input: 0,
        },
        selectedNodeKey: node.node_key,
        assessmentDosenId: node.assessment_dosen_id,
      },
    });
  }

  function handleNavigateToKelas(group: GroupedKelasItem) {
    navigate(`/dosen/penilaian/${encodeURIComponent(group.code_kelas)}`, {
      state: {
        kelas: {
          code_kelas: group.code_kelas,
          nama_kelas: group.nama_kelas,
          nama_matakuliah: group.matakuliah,
          kode_matakuliah: "",
          semester: 1,
          tahun_akademik: "",
          nama_program_studi: "",
          block: true,
          jumlah_mahasiswa: 0,
          sudah_input: 0,
          sudah_validasi: 0,
          belum_input: 0,
        },
      },
    });
  }

  return (
    <div className="space-y-6">
      {/* ─── Header Banner ─── */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-brand-700 font-semibold uppercase tracking-wider mb-1">
            <span>Penilaian</span>
            <span>•</span>
            <span>Node Validasi Dosen</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            Daftar Penilaian Dosen
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Daftar komponen dan node penilaian kelas yang ditugaskan kepada Anda untuk diisi dan divalidasi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1 border border-gray-200">
            <button
              type="button"
              onClick={() => setViewMode("grouped")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                viewMode === "grouped"
                  ? "bg-white text-gray-900 shadow-xs font-semibold"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              title="Tampilan Tabel per Kelas"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18" />
              </svg>
              <span>Tabel per Kelas</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                viewMode === "table"
                  ? "bg-white text-gray-900 shadow-xs font-semibold"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              title="Tampilan Tabel per Node Penilaian"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              <span>Tabel per Node</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-1.5"
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
            Muat Ulang
          </Button>
        </div>
      </div>

      {/* ─── Statistics Cards ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Total Node Tugas */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium">Tugas Node Validasi</span>
            <span className="h-7 w-7 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalAssignedNodes}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Komponen harus diisi</p>
          </div>
        </div>

        {/* Total Kelas */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium">Total Kelas</span>
            <span className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalUniqueClasses}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Kelas terdaftar</p>
          </div>
        </div>

        {/* Total Mata Kuliah */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium">Mata Kuliah</span>
            <span className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalUniqueMatakuliah}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Mata kuliah aktif</p>
          </div>
        </div>

        {/* Komponen Unik */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium">Tipe Komponen</span>
            <span className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalUniqueNodeKeys}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Jenis node penilaian</p>
          </div>
        </div>
      </div>

      {/* ─── Filter & Search Bar ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Cari mata kuliah, kelas, nama komponen, atau node key..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-600 focus:bg-white focus:ring-2 focus:ring-brand-100 transition"
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none"
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
              className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600"
              title="Hapus pencarian"
            >
              ✕
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Matakuliah Filter */}
          {matakuliahList.length > 1 && (
            <div className="w-full sm:w-56">
              <select
                value={selectedMatakuliah}
                onChange={(e) => setSelectedMatakuliah(e.target.value)}
                aria-label="Filter Mata Kuliah"
                className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-600 focus:bg-white transition"
              >
                <option value="all">Semua Mata Kuliah</option>
                {matakuliahList.map((mk) => (
                  <option key={mk} value={mk}>
                    {mk}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Kelas Filter */}
          {kelasOptions.length > 1 && (
            <div className="w-full sm:w-44">
              <select
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                aria-label="Filter Kelas"
                className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-600 focus:bg-white transition"
              >
                <option value="all">Semua Kelas</option>
                {kelasOptions.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(selectedMatakuliah !== "all" ||
            selectedKelas !== "all" ||
            searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedMatakuliah("all");
                setSelectedKelas("all");
                setSearchQuery("");
              }}
              className="text-xs text-brand-700 hover:text-brand-800 font-semibold px-2 py-1.5 whitespace-nowrap"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* ─── Error State ─── */}
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
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            Coba Lagi
          </Button>
        </div>
      )}

      {/* ─── Loading State (Skeletons) ─── */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="h-5 bg-gray-200 rounded w-1/3" />
                <div className="h-6 bg-gray-100 rounded-full w-20" />
              </div>
              <div className="h-4 bg-gray-100 rounded w-1/4" />
              <div className="h-14 bg-gray-50 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredNodes.length === 0 ? (
        /* ─── Empty State ─── */
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-xs">
          <div className="h-16 w-16 mx-auto rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
            <svg
              className="h-8 w-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900">
            Tidak ada node penilaian yang ditemukan
          </h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            {searchQuery ||
            selectedMatakuliah !== "all" ||
            selectedKelas !== "all"
              ? "Coba sesuaikan kata kunci pencarian atau reset filter Anda."
              : "Saat ini belum ada tugas pengisian node validasi yang dialokasikan untuk akun dosen Anda."}
          </p>
          {(searchQuery ||
            selectedMatakuliah !== "all" ||
            selectedKelas !== "all") && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedMatakuliah("all");
                  setSelectedKelas("all");
                  setSearchQuery("");
                }}
              >
                Reset Filter Pencarian
              </Button>
            </div>
          )}
        </div>
      ) : viewMode === "grouped" ? (
        /* ─── View Mode: Tabel Daftar Penilaian per Kelas ─── */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4">Kelas</th>
                  <th className="py-3.5 px-4">Mata Kuliah</th>
                  <th className="py-3.5 px-4">Komponen Penilaian</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {groupedClasses.map((group, idx) => (
                  <tr
                    key={group.code_kelas}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-center text-xs font-mono text-gray-400 align-top pt-4">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 align-top pt-4">
                      <div className="space-y-1">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                          {group.nama_kelas}
                        </span>
                        {group.code_kelas && (
                          <p
                            className="text-[10px] font-mono text-gray-400 truncate max-w-[130px]"
                            title={group.code_kelas}
                          >
                            Kode: {group.code_kelas.slice(0, 12)}...
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 align-top pt-4">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-gray-900 text-sm">
                          {group.matakuliah}
                        </span>
                        <p className="text-[11px] text-gray-400">
                          Mata Kuliah Blok Perkuliahan
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 align-top pt-3.5">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded-full">
                            {group.nodes.length} Komponen Ditugaskan
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {group.nodes.map((node) => (
                            <button
                              key={node.assessment_dosen_id}
                              type="button"
                              onClick={() => handleNavigateToPenilaian(node)}
                              className="group/chip inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-50 hover:bg-brand-50 text-gray-700 hover:text-brand-800 border border-gray-200 hover:border-brand-200 transition shadow-2xs text-left"
                              title={`Klik untuk langsung input nilai komponen "${formatNodeKey(node.node_key)}"`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-brand-500 group-hover/chip:scale-125 transition-transform" />
                              <span className="font-semibold">
                                {formatNodeKey(node.node_key)}
                              </span>
                              <span className="font-mono text-[10px] text-gray-400 group-hover/chip:text-brand-600 bg-white px-1 rounded border border-gray-200">
                                #{node.assessment_dosen_id}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right align-top pt-3.5">
                      <div className="flex items-center justify-end gap-2 flex-wrap sm:flex-nowrap">
                        <button
                          type="button"
                          onClick={() =>
                            setTemplateModalTarget({
                              codeKelas: group.code_kelas,
                              namaKelas: group.nama_kelas,
                              namaMatakuliah: group.matakuliah,
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-2xs transition-colors cursor-pointer select-none"
                          title="Lihat template tree penilaian kelas"
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
                          <span>Template</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleNavigateToKelas(group)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-brand-700 hover:bg-brand-800 active:bg-brand-900 rounded-lg shadow-2xs transition-all cursor-pointer whitespace-nowrap select-none"
                          title="Input nilai mahasiswa pada kelas ini"
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
                          <span>Input Nilai</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ─── View Mode: Table / List of All Nodes ─── */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4 w-16 text-center">ID</th>
                  <th className="py-3 px-4">Mata Kuliah</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4">Komponen / Node Key</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredNodes.map((node, idx) => (
                  <tr
                    key={node.assessment_dosen_id}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-center text-xs font-mono text-gray-400">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                        #{node.assessment_dosen_id}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900">
                      {node.matakuliah}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-100">
                        {node.nama_kelas}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-gray-800">
                          {formatNodeKey(node.node_key)}
                        </span>
                        <span className="font-mono text-[11px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                          {node.node_key}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleNavigateToPenilaian(node)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-brand-700 hover:bg-brand-800 active:bg-brand-900 rounded-lg shadow-2xs transition-all cursor-pointer whitespace-nowrap select-none ml-auto"
                        title={`Input nilai untuk komponen "${formatNodeKey(node.node_key)}"`}
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
                        <span>Input Nilai</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Template Preview Modal ─── */}
      {templateModalTarget && (
        <DosenTemplatePenilaianModal
          isOpen={Boolean(templateModalTarget)}
          onClose={() => setTemplateModalTarget(null)}
          codeKelas={templateModalTarget.codeKelas}
          namaKelas={templateModalTarget.namaKelas}
          namaMatakuliah={templateModalTarget.namaMatakuliah}
        />
      )}
    </div>
  );
}
