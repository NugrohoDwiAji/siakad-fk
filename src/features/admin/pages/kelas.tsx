import { useState, useEffect, useMemo } from "react";
import Button from "@/components/ui/Button";
import {
  getStaffKelasList,
  getStaffPenempatanList,
  deleteStaffPenempatan,
  deleteStaffKelas,
} from "@/features/admin/api/kelas";
import { getListTahunAkademik } from "@/features/admin/api/masterData";
import type {
  StaffKelasItem,
  StaffPenempatanItem,
  StaffKelasMahasiswaItem,
  TahunAkademikItem,
} from "@/features/admin/types";
import PenempatanFormModal from "../components/organisms/PenempatanFormModal";
import KelasDetailModal from "../components/organisms/KelasDetailModal";
import KelasItemTab from "../components/organisms/KelasItemTab";
import CreateKelasModal from "../components/organisms/CreateKelasModal";

export default function AdminKelas() {
  // ── Data States ──
  const [kelasList, setKelasList] = useState<StaffKelasItem[]>([]);
  const [penempatanList, setPenempatanList] = useState<StaffPenempatanItem[]>([]);
  const [tahunAkademikList, setTahunAkademikList] = useState<TahunAkademikItem[]>([]);

  const [loadingKelas, setLoadingKelas] = useState(true);
  const [loadingPenempatan, setLoadingPenempatan] = useState(false);
  const [errorKelas, setErrorKelas] = useState<string | null>(null);

  // ── Active Tab ──
  const [activeTab, setActiveTab] = useState<"kelas" | "penempatan" | "item">("kelas");

  // ── Filter States for Tab Kelas ──
  const [searchKelas, setSearchKelas] = useState("");
  const [filterSemester, setFilterSemester] = useState<string>("");
  const [filterTahunAkademik, setFilterTahunAkademik] = useState<string>("");

  // ── Filter States for Tab Penempatan ──
  const [searchPenempatan, setSearchPenempatan] = useState("");
  const [filterPenempatanKelasId, setFilterPenempatanKelasId] = useState<string>("");

  // ── Pagination for Penempatan Tab ──
  const [penempatanPage, setPenempatanPage] = useState(1);
  const PENEMPATAN_PER_PAGE = 20;

  // ── Modals State ──
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formInitialKelasId, setFormInitialKelasId] = useState<number | null>(null);

  const [detailKelasId, setDetailKelasId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [isCreateKelasOpen, setIsCreateKelasOpen] = useState(false);

  // ── Delete Confirmation State ──
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    namaMahasiswa: string;
    nim: string;
    namaKelas: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Delete Confirmation State for Kelas ──
  const [deleteKelasTarget, setDeleteKelasTarget] = useState<StaffKelasItem | null>(null);
  const [isDeletingKelas, setIsDeletingKelas] = useState(false);

  // ── Toast Notification ──
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Toast auto-hide
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ── Fetch Tahun Akademik ──
  useEffect(() => {
    async function fetchTahunAkademik() {
      const res = await getListTahunAkademik();
      if (res.status && res.data) {
        setTahunAkademikList(res.data.data);
      }
    }
    fetchTahunAkademik();
  }, []);

  // ── Refetch triggers ──
  const [refetchKelas, setRefetchKelas] = useState(0);
  const [refetchPenempatan, setRefetchPenempatan] = useState(0);
  const [refetchDetailCounter, setRefetchDetailCounter] = useState(0);

  // ── Fetch Kelas List ──
  useEffect(() => {
    let cancelled = false;

    async function loadKelas() {
      setLoadingKelas(true);
      setErrorKelas(null);

      const matchingTa = tahunAkademikList.find((t) => t.tahun_akademik === filterTahunAkademik);

      const res = await getStaffKelasList({
        semester: filterSemester || undefined,
        tahun_akademik: filterTahunAkademik || undefined,
        kode_tahun_akademik: matchingTa?.id,
      });

      if (cancelled) return;

      if (res.status && res.data) {
        setKelasList(res.data);
      } else {
        setErrorKelas(res.message || "Gagal memuat daftar kelas.");
        setKelasList([]);
      }
      setLoadingKelas(false);
    }

    loadKelas();
    return () => {
      cancelled = true;
    };
  }, [filterSemester, filterTahunAkademik, refetchKelas, tahunAkademikList]);

  // ── Fetch Penempatan List ──
  useEffect(() => {
    if (activeTab !== "penempatan") return;

    let cancelled = false;

    async function loadPenempatan() {
      setLoadingPenempatan(true);
      const res = await getStaffPenempatanList({
        kelas_id: filterPenempatanKelasId
          ? Number(filterPenempatanKelasId)
          : undefined,
      });

      if (cancelled) return;

      if (res.status && res.data) {
        setPenempatanList(res.data);
      } else {
        setPenempatanList([]);
      }
      setLoadingPenempatan(false);
    }

    loadPenempatan();
    return () => {
      cancelled = true;
    };
  }, [activeTab, filterPenempatanKelasId, refetchPenempatan]);

  // ── Filtered Kelas ──
  const filteredKelas = useMemo(() => {
    return kelasList.filter((k) => {
      if (!searchKelas.trim()) return true;
      const q = searchKelas.toLowerCase();
      return (
        k.nama_kelas.toLowerCase().includes(q) ||
        k.nama_matakuliah.toLowerCase().includes(q) ||
        k.kode_matakuliah.toLowerCase().includes(q)
      );
    });
  }, [kelasList, searchKelas]);

  // ── Filtered Penempatan ──
  const filteredPenempatan = useMemo(() => {
    return penempatanList.filter((p) => {
      if (!searchPenempatan.trim()) return true;
      const q = searchPenempatan.toLowerCase();
      return (
        p.nim.toLowerCase().includes(q) ||
        (p.nama_mahasiswa && p.nama_mahasiswa.toLowerCase().includes(q)) ||
        p.nama_kelas.toLowerCase().includes(q) ||
        p.kode_matakuliah.toLowerCase().includes(q)
      );
    });
  }, [penempatanList, searchPenempatan]);

  // Paginated Penempatan
  const paginatedPenempatan = useMemo(() => {
    const start = (penempatanPage - 1) * PENEMPATAN_PER_PAGE;
    return filteredPenempatan.slice(start, start + PENEMPATAN_PER_PAGE);
  }, [filteredPenempatan, penempatanPage]);

  const totalPenempatanPages = Math.ceil(
    filteredPenempatan.length / PENEMPATAN_PER_PAGE
  );

  // ── Statistics ──
  const totalPesertaSemuaKelas = useMemo(() => {
    return kelasList.reduce((acc, curr) => acc + (curr.jumlah_mahasiswa || 0), 0);
  }, [kelasList]);

  // ── Action Handlers ──
  function handleOpenAddModal(kelasId?: number) {
    setFormInitialKelasId(kelasId || null);
    setIsFormOpen(true);
  }

  function handleOpenDetailModal(kelasId: number) {
    setDetailKelasId(kelasId);
    setIsDetailOpen(true);
  }

  function handleFormSuccess() {
    setToast({
      type: "success",
      message: "Penempatan mahasiswa ke kelas berhasil disimpan.",
    });
    setRefetchKelas((k) => k + 1);
    setRefetchPenempatan((k) => k + 1);
  }

  // Delete Penempatan Click from Detail Modal
  function handleDeleteFromDetail(
    mhs: StaffKelasMahasiswaItem,
    namaKelas: string
  ) {
    setDeleteTarget({
      id: mhs.kelas_mahasiswa_id,
      namaMahasiswa: mhs.nama_mahasiswa || `Mahasiswa (${mhs.nim})`,
      nim: mhs.nim,
      namaKelas: `Kelas ${namaKelas}`,
    });
  }

  // Delete Penempatan Click from All Penempatan Table
  function handleDeleteFromPenempatanTab(item: StaffPenempatanItem) {
    setDeleteTarget({
      id: item.kelas_mahasiswa_id,
      namaMahasiswa: item.nama_mahasiswa || `Mahasiswa (${item.nim})`,
      nim: item.nim,
      namaKelas: `Kelas ${item.nama_kelas} (${item.kode_matakuliah})`,
    });
  }

  // Confirm and Execute Delete
  async function handleConfirmDelete() {
    if (!deleteTarget) return;

    setIsDeleting(true);
    const res = await deleteStaffPenempatan(deleteTarget.id);
    setIsDeleting(false);

    if (res.status) {
      setToast({
        type: "success",
        message: `Penempatan ${deleteTarget.namaMahasiswa} berhasil dihapus.`,
      });
      setDeleteTarget(null);
      setRefetchKelas((k) => k + 1);
      setRefetchPenempatan((k) => k + 1);
      setRefetchDetailCounter((c) => c + 1);
    } else {
      setToast({
        type: "error",
        message: res.message || "Gagal menghapus penempatan kelas.",
      });
    }
  }

  // Confirm and Execute Delete Kelas
  async function handleConfirmDeleteKelas() {
    if (!deleteKelasTarget) return;

    setIsDeletingKelas(true);
    const res = await deleteStaffKelas(deleteKelasTarget.kelas_id);
    setIsDeletingKelas(false);

    if (res.status) {
      setToast({
        type: "success",
        message: res.message || "Kelas berhasil dihapus.",
      });
      setDeleteKelasTarget(null);
      setRefetchKelas((k) => k + 1);
    } else {
      setToast({
        type: "error",
        message: res.message || "Gagal menghapus kelas.",
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 transition-all transform ease-out duration-300">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-xs font-medium text-white ${
              toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
            }`}
          >
            {toast.type === "success" ? (
              <svg
                className="h-4 w-4 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            ) : (
              <svg
                className="h-4 w-4 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Kelas & Penempatan
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Kelola daftar kelas perkuliahan dan penempatan mahasiswa ke dalam
            rombongan belajar
          </p>
        </div>

        {/* Feature: Tambah Penempatan Kelas */}
        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => handleOpenAddModal()}
            leftIcon={
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            }
          >
            Tambah Penempatan Kelas
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700">
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <rect x="3" y="4" width="18" height="12" rx="1" />
              <path d="M8 20h8" />
              <path d="M12 16v4" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400">Total Kelas</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">
              {loadingKelas ? "..." : kelasList.length} Kelas
            </p>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400">Total Penempatan</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">
              {loadingKelas ? "..." : totalPesertaSemuaKelas} Mahasiswa
            </p>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400">Tahun Akademik</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">
              {kelasList[0]?.tahun_akademik || "2025/2026"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("kelas")}
          className={`px-4 py-2.5 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "kelas"
              ? "border-brand-700 text-brand-800"
              : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300"
          }`}
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <rect x="3" y="4" width="18" height="12" rx="1" />
            <path d="M8 20h8" />
            <path d="M12 16v4" />
          </svg>
          <span>Daftar Kelas ({kelasList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("penempatan")}
          className={`px-4 py-2.5 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "penempatan"
              ? "border-brand-700 text-brand-800"
              : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300"
          }`}
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
          <span>Semua Penempatan ({penempatanList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("item")}
          className={`px-4 py-2.5 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "item"
              ? "border-brand-700 text-brand-800"
              : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300"
          }`}
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <path d="M9 14l2 2 4-4" />
          </svg>
          <span>Item</span>
        </button>
      </div>

      {/* ── TAB 1: DAFTAR KELAS ── */}
      {activeTab === "kelas" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 sm:max-w-xs">
              <input
                type="text"
                placeholder="Cari kelas atau mata kuliah..."
                value={searchKelas}
                onChange={(e) => setSearchKelas(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition"
              />
              <svg
                className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Filter Semester */}
              <select
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
                className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:bg-white focus:border-brand-600 transition"
              >
                <option value="">Semua Semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>

              {/* Filter Tahun Akademik */}
              <select
                value={filterTahunAkademik}
                onChange={(e) => setFilterTahunAkademik(e.target.value)}
                className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:bg-white focus:border-brand-600 transition"
              >
                <option value="">Semua Tahun Akademik</option>
                {tahunAkademikList.map((t) => (
                  <option key={t.id} value={t.tahun_akademik}>
                    {t.tahun_akademik} (Sem {t.semester})
                  </option>
                ))}
              </select>

              {/* Tombol Buat Kelas di paling kanan di samping dropdown tahun akademik */}
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsCreateKelasOpen(true)}
                leftIcon={
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                }
              >
                Buat Kelas
              </Button>
            </div>
          </div>

          {/* Kelas Table / Card List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            {loadingKelas ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="h-8 w-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-gray-500 font-medium">
                  Memuat daftar kelas...
                </p>
              </div>
            ) : errorKelas ? (
              <div className="p-8 text-center text-xs text-red-600">
                {errorKelas}
              </div>
            ) : filteredKelas.length === 0 ? (
              <div className="py-16 text-center text-xs text-gray-400">
                Tidak ada kelas yang ditemukan.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50/75 text-gray-600 font-semibold border-b border-gray-100">
                    <tr>
                      <th className="px-5 py-3.5">Kelas</th>
                      <th className="px-5 py-3.5">Mata Kuliah</th>
                      <th className="px-5 py-3.5 text-center">Semester</th>
                      <th className="px-5 py-3.5">Tahun Akademik</th>
                      <th className="px-5 py-3.5 text-center">Jumlah Peserta</th>
                      <th className="px-5 py-3.5 text-center">Jumlah Dosen</th>
                      <th className="px-5 py-3.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredKelas.map((k) => (
                      <tr
                        key={k.kelas_id}
                        className="hover:bg-gray-50/60 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-50 text-brand-800 border border-brand-100">
                            Kelas {k.nama_kelas}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-gray-900">
                            {k.nama_matakuliah}
                          </p>
                          <p className="text-[11px] text-gray-400 font-mono">
                            {k.kode_matakuliah}
                          </p>
                        </td>
                        <td className="px-5 py-3.5 text-center text-gray-700 font-medium">
                          Semester {k.semester}
                        </td>
                        <td className="px-5 py-3.5 text-gray-600 font-medium">
                          {k.tahun_akademik}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {k.jumlah_mahasiswa} Mahasiswa
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center text-gray-500 font-medium">
                          {k.jumlah_dosen || 0} Dosen
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenDetailModal(k.kelas_id)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-brand-700 hover:text-white bg-brand-50 hover:bg-brand-700 rounded-lg transition-colors"
                            >
                              <svg
                                className="h-3.5 w-3.5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                              <span>Lihat Detail</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteKelasTarget(k)}
                              title={`Hapus Kelas ${k.nama_kelas} (${k.nama_matakuliah})`}
                              className="p-1.5 text-red-600 hover:text-white bg-red-50 hover:bg-red-600 rounded-lg transition-colors"
                              aria-label={`Hapus Kelas ${k.nama_kelas}`}
                            >
                              <svg
                                className="h-3.5 w-3.5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
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
          </div>
        </div>
      )}

      {/* ── TAB 2: SEMUA PENEMPATAN KELAS ── */}
      {activeTab === "penempatan" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 sm:max-w-md">
              <input
                type="text"
                placeholder="Cari NIM, nama mahasiswa, kelas, atau kode MK..."
                value={searchPenempatan}
                onChange={(e) => {
                  setSearchPenempatan(e.target.value);
                  setPenempatanPage(1);
                }}
                className="w-full pl-9 pr-3.5 py-2 text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition"
              />
              <svg
                className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterPenempatanKelasId}
                onChange={(e) => {
                  setFilterPenempatanKelasId(e.target.value);
                  setPenempatanPage(1);
                }}
                className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:bg-white focus:border-brand-600 transition"
              >
                <option value="">Semua Kelas</option>
                {kelasList.map((k) => (
                  <option key={k.kelas_id} value={k.kelas_id}>
                    Kelas {k.nama_kelas} - {k.kode_matakuliah} {k.nama_matakuliah}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Penempatan Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            {loadingPenempatan ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="h-8 w-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-gray-500 font-medium">
                  Memuat data penempatan kelas...
                </p>
              </div>
            ) : filteredPenempatan.length === 0 ? (
              <div className="py-16 text-center text-xs text-gray-400">
                Tidak ada data penempatan kelas yang sesuai.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50/75 text-gray-600 font-semibold border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3.5 w-12 text-center">No</th>
                      <th className="px-4 py-3.5">NIM</th>
                      <th className="px-4 py-3.5">Nama Mahasiswa</th>
                      <th className="px-4 py-3.5">Kelas</th>
                      <th className="px-4 py-3.5">Mata Kuliah</th>
                      <th className="px-4 py-3.5 text-center">Semester</th>
                      <th className="px-4 py-3.5">Tahun Akademik</th>
                      <th className="px-4 py-3.5 text-center w-28">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedPenempatan.map((item, idx) => (
                      <tr
                        key={item.kelas_mahasiswa_id}
                        className="hover:bg-gray-50/60 transition-colors"
                      >
                        <td className="px-4 py-3 text-center text-gray-400">
                          {(penempatanPage - 1) * PENEMPATAN_PER_PAGE + idx + 1}
                        </td>
                        <td className="px-4 py-3 font-mono font-medium text-gray-900">
                          {item.nim}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-800">
                          {item.nama_mahasiswa || "-"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-brand-50 text-brand-800">
                            Kelas {item.nama_kelas}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-700">
                          {item.kode_matakuliah}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600 font-medium">
                          Sem {item.semester}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {item.tahun_akademik}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {/* Button Delete Penempatan Kelas */}
                          <button
                            type="button"
                            onClick={() => handleDeleteFromPenempatanTab(item)}
                            title="Hapus penempatan kelas mahasiswa"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-red-600 hover:text-white bg-red-50 hover:bg-red-600 rounded-md transition-colors"
                          >
                            <svg
                              className="h-3.5 w-3.5 shrink-0"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            <span>Hapus</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPenempatanPages > 1 && (
              <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-gray-50/50">
                <span>
                  Menampilkan {(penempatanPage - 1) * PENEMPATAN_PER_PAGE + 1} -{" "}
                  {Math.min(
                    penempatanPage * PENEMPATAN_PER_PAGE,
                    filteredPenempatan.length
                  )}{" "}
                  dari {filteredPenempatan.length} data penempatan
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPenempatanPage((p) => Math.max(1, p - 1))}
                    disabled={penempatanPage === 1}
                    className="px-2.5 py-1 border border-gray-200 rounded-md hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Sebelumnya
                  </button>
                  <span className="px-2 font-medium text-gray-700">
                    Halaman {penempatanPage} dari {totalPenempatanPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setPenempatanPage((p) =>
                        Math.min(totalPenempatanPages, p + 1)
                      )
                    }
                    disabled={penempatanPage === totalPenempatanPages}
                    className="px-2.5 py-1 border border-gray-200 rounded-md hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: ITEM (MAHASISWA BELUM MASUK KELAS & KELAS TERSEDIA) ── */}
      {activeTab === "item" && (
        <KelasItemTab
          kelasList={kelasList}
          tahunAkademikList={tahunAkademikList}
          onPlacementSuccess={() => {
            setRefetchKelas((c) => c + 1);
            setRefetchPenempatan((c) => c + 1);
          }}
          onShowToast={(type, message) => setToast({ type, message })}
        />
      )}

      {/* ── Form Modal Tambah Penempatan ── */}
      {isFormOpen && (
        <PenempatanFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleFormSuccess}
          kelasList={kelasList}
          initialKelasId={formInitialKelasId}
        />
      )}

      {/* ── Detail Modal Kelas ── */}
      {isDetailOpen && (
        <KelasDetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          kelasId={detailKelasId}
          onDeleteClick={handleDeleteFromDetail}
          onAddPesertaClick={(kId) => {
            setIsDetailOpen(false);
            handleOpenAddModal(kId);
          }}
          onDataChanged={() => {
            setRefetchKelas((k) => k + 1);
          }}
          refetchTrigger={refetchDetailCounter}
        />
      )}

      {/* ── Modal Buat Kelas Baru ── */}
      {isCreateKelasOpen && (
        <CreateKelasModal
          isOpen={isCreateKelasOpen}
          onClose={() => setIsCreateKelasOpen(false)}
          onSuccess={() => {
            setRefetchKelas((c) => c + 1);
            setToast({
              type: "success",
              message: "Kelas berhasil dibuat.",
            });
          }}
          tahunAkademikList={tahunAkademikList}
          kelasList={kelasList}
        />
      )}

      {/* ── Delete Confirmation Dialog ── */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="h-12 w-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-gray-900">
                Hapus Penempatan Kelas?
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Apakah Anda yakin ingin menghapus penempatan mahasiswa{" "}
                <span className="font-semibold text-gray-800">
                  {deleteTarget.namaMahasiswa}
                </span>{" "}
                (NIM: <span className="font-mono">{deleteTarget.nim}</span>)
                dari{" "}
                <span className="font-semibold text-gray-800">
                  {deleteTarget.namaKelas}
                </span>
                ? Mahasiswa tidak akan lagi terdaftar di rombongan belajar ini.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                isLoading={isDeleting}
                onClick={handleConfirmDelete}
              >
                Ya, Hapus Penempatan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Dialog for Kelas ── */}
      {deleteKelasTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-6 space-y-4 border border-gray-100">
            <div className="h-12 w-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-gray-900">
                Hapus Kelas Perkuliahan?
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Apakah Anda yakin ingin menghapus{" "}
                <span className="font-semibold text-gray-800">
                  Kelas {deleteKelasTarget.nama_kelas}
                </span>{" "}
                mata kuliah{" "}
                <span className="font-semibold text-gray-800">
                  {deleteKelasTarget.nama_matakuliah}
                </span>{" "}
                (Semester {deleteKelasTarget.semester})? Semua data penempatan mahasiswa pada kelas ini akan ikut terhapus.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeleteKelasTarget(null)}
                disabled={isDeletingKelas}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                isLoading={isDeletingKelas}
                onClick={handleConfirmDeleteKelas}
              >
                Ya, Hapus Kelas
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
