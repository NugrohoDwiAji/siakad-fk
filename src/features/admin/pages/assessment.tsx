import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getKelas } from "@/features/admin/api/assessment";
import { getListTahunAkademik } from "@/features/admin/api/masterData";
import { setupAssessmentDosen } from "@/features/admin/api/assessment";
import type {
  StaffKelasItem,
  TahunAkademikItem,
} from "@/features/admin/types";

export default function AdminAssessment() {
  const navigate = useNavigate();

  // ─── Data States ───
  const [kelasList, setKelasList] = useState<StaffKelasItem[]>([]);
  const [tahunAkademikList, setTahunAkademikList] = useState<TahunAkademikItem[]>([]);
  const [loadingKelas, setLoadingKelas] = useState(true);
  const [errorKelas, setErrorKelas] = useState<string | null>(null);

  // ─── Filters & Search ───
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSemester, setFilterSemester] = useState<string>("");
  const [filterTahunAkademik, setFilterTahunAkademik] = useState<string>("");

  // ─── Setup Action State ───
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [settingUpCode, setSettingUpCode] = useState<string | null>(null);

  // ─── Add Assessment Modal State ───
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addCodeKelas, setAddCodeKelas] = useState("");
  const [addInputMode, setAddInputMode] = useState<"select" | "manual">("select");
  const [addSearchQuery, setAddSearchQuery] = useState("");
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // ─── Toast Notifications ───
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // ─── Fetch Tahun Akademik List ───
  useEffect(() => {
    let ignore = false;
    async function fetchTahun() {
      const res = await getListTahunAkademik();
      if (ignore) return;
      if (res.status && res.data) {
        setTahunAkademikList(res.data.data || []);
      }
    }
    fetchTahun();
    return () => {
      ignore = true;
    };
  }, []);

  // ─── Fetch Kelas List (GET /api/staff/kelas) ───
  const fetchKelas = useCallback(async () => {
    setLoadingKelas(true);
    setErrorKelas(null);
    const matchingTa = tahunAkademikList.find((t) => t.tahun_akademik === filterTahunAkademik);
    const res = await getKelas({
      semester: filterSemester || undefined,
      tahun_akademik: filterTahunAkademik || undefined,
      kode_tahun_akademik: matchingTa?.id,
    });
    if (!res.status) {
      setErrorKelas(res.message || "Gagal memuat daftar kelas.");
      setKelasList([]);
    } else {
      setKelasList(res.data || []);
    }
    setLoadingKelas(false);
  }, [filterSemester, filterTahunAkademik, tahunAkademikList]);

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      setLoadingKelas(true);
      setErrorKelas(null);
      const matchingTa = tahunAkademikList.find((t) => t.tahun_akademik === filterTahunAkademik);
      const res = await getKelas({
        semester: filterSemester || undefined,
        tahun_akademik: filterTahunAkademik || undefined,
        kode_tahun_akademik: matchingTa?.id,
      });
      if (ignore) return;
      if (!res.status) {
        setErrorKelas(res.message || "Gagal memuat daftar kelas.");
        setKelasList([]);
      } else {
        setKelasList(res.data || []);
      }
      setLoadingKelas(false);
    }
    loadData();
    return () => {
      ignore = true;
    };
  }, [filterSemester, filterTahunAkademik, tahunAkademikList]);

  // ─── Navigate to Detail Page (Menggunakan Page, Bukan Card/Modal) ───
  function handleNavigateToDetail(kelas: StaffKelasItem) {
    navigate(`/admin/assessment/${encodeURIComponent(kelas.code_kelas)}`, {
      state: { kelas },
    });
  }

  // ─── Handle Open Tambah Assessment Modal ───
  function handleOpenAddModal() {
    setAddError(null);
    setAddSearchQuery("");
    setAddInputMode("select");
    if (kelasList.length > 0) {
      setAddCodeKelas(kelasList[0].code_kelas);
    } else {
      setAddCodeKelas("");
    }
    setIsAddModalOpen(true);
  }

  // ─── Handle Add / Setup Assessment from Modal (POST /api/staff/assessment/dosen) ───
  async function handleAddAssessmentSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setAddError(null);

    const targetCode = addCodeKelas.trim();
    if (!targetCode) {
      setAddError(
        addInputMode === "manual"
          ? "Silakan masukkan code kelas terlebih dahulu."
          : "Silakan pilih kelas perkuliahan terlebih dahulu."
      );
      return;
    }

    setIsSubmittingAdd(true);
    const res = await setupAssessmentDosen({
      code_kelas: targetCode,
    });
    setIsSubmittingAdd(false);

    if (!res.status) {
      const err = res.message || "Gagal menambahkan assessment dosen.";
      setAddError(err);
      setToast({
        type: "error",
        message: err,
      });
    } else {
      const targetKelas = kelasList.find((k) => k.code_kelas === targetCode);
      const label = targetKelas
        ? `kelas "${targetKelas.nama_kelas} - ${targetKelas.nama_matakuliah}"`
        : `code kelas "${targetCode}"`;

      setToast({
        type: "success",
        message: `Assessment untuk ${label} berhasil ditambahkan!`,
      });

      setIsAddModalOpen(false);

      setKelasList((prev) =>
        prev.map((k) =>
          k.code_kelas === targetCode
            ? { ...k, setup_assignments: true }
            : k
        )
      );

      // Navigasi ke halaman detail
      navigate(`/admin/assessment/${encodeURIComponent(targetCode)}`, {
        state: {
          kelas: targetKelas
            ? { ...targetKelas, setup_assignments: true }
            : undefined,
        },
      });
    }
  }

  // ─── Handle Setup Assessment (POST /api/staff/assessment/dosen) ───
  async function handleExecuteSetup(kelas: StaffKelasItem) {
    setIsSettingUp(true);
    setSettingUpCode(kelas.code_kelas);
    const res = await setupAssessmentDosen({
      code_kelas: kelas.code_kelas,
    });
    setIsSettingUp(false);
    setSettingUpCode(null);

    if (!res.status) {
      setToast({
        type: "error",
        message: res.message || "Gagal menjalankan setup assessment dosen.",
      });
    } else {
      setToast({
        type: "success",
        message: res.message || `Setup assessment untuk kelas "${kelas.nama_kelas}" berhasil dijalankan!`,
      });
      // Perbarui status kelasList agar setup_assignments menjadi true
      setKelasList((prev) =>
        prev.map((k) =>
          k.code_kelas === kelas.code_kelas
            ? { ...k, setup_assignments: true, template_assignments: true }
            : k
        )
      );
    }
  }

  // ─── Filtered Classes Logic ───
  const filteredKelasList = useMemo(() => {
    return kelasList.filter((k) => {
      if (filterSemester && String(k.semester) !== filterSemester) {
        return false;
      }
      if (filterTahunAkademik && k.tahun_akademik !== filterTahunAkademik) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNama = k.nama_kelas?.toLowerCase().includes(q);
        const matchMk = k.nama_matakuliah?.toLowerCase().includes(q);
        const matchKodeMk = k.kode_matakuliah?.toLowerCase().includes(q);
        const matchProdi = k.nama_program_studi?.toLowerCase().includes(q);
        return matchNama || matchMk || matchKodeMk || matchProdi;
      }
      return true;
    });
  }, [kelasList, filterSemester, filterTahunAkademik, searchQuery]);

  // ─── Semester Options ───
  const semesterOptions = useMemo(() => {
    const list = Array.from(new Set(kelasList.map((k) => k.semester).filter(Boolean)));
    return list.sort((a, b) => Number(a) - Number(b));
  }, [kelasList]);

  // ─── Modal Tambah: Filtered Classes & Selected Class Item ───
  const filteredModalKelasList = useMemo(() => {
    if (!addSearchQuery.trim()) return kelasList;
    const q = addSearchQuery.toLowerCase();
    return kelasList.filter((k) => {
      const matchNama = k.nama_kelas?.toLowerCase().includes(q);
      const matchMk = k.nama_matakuliah?.toLowerCase().includes(q);
      const matchKodeMk = k.kode_matakuliah?.toLowerCase().includes(q);
      const matchProdi = k.nama_program_studi?.toLowerCase().includes(q);
      return matchNama || matchMk || matchKodeMk || matchProdi;
    });
  }, [kelasList, addSearchQuery]);

  const modalSelectedKelasItem = useMemo(() => {
    return kelasList.find((k) => k.code_kelas === addCodeKelas) || null;
  }, [kelasList, addCodeKelas]);

  return (
    <div className="space-y-6">
      {/* ─── Toast Notification ─── */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-fadeIn">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
              toast.type === "success" ? "bg-emerald-600" : "bg-rose-600"
            }`}
          >
            {toast.type === "success" ? (
              <svg
                className="h-5 w-5 shrink-0"
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
                className="h-5 w-5 shrink-0"
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
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-2 hover:opacity-75 text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ─── Header Banner ─── */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-brand-700 font-semibold uppercase tracking-wider mb-1">
            <span>Kurikulum Blok</span>
            <span>•</span>
            <span>Setup Assessment Dosen</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            Setup Assessment Dosen
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Kelola alokasi dosen pengampu untuk komponen penilaian serta inisialisasi penilaian kelas perkuliahan.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={fetchKelas}
            disabled={loadingKelas}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 active:bg-gray-100 rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50 select-none"
          >
            <svg
              className={`h-3.5 w-3.5 ${loadingKelas ? "animate-spin text-brand-600" : "text-gray-500"}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Muat Ulang Kelas</span>
          </button>

          {/* Menu / Tombol Tambah Assessment */}
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-brand-700 hover:bg-brand-800 active:bg-brand-900 rounded-lg shadow-2xs transition-all cursor-pointer select-none"
            title="Tambah assessment baru menggunakan method POST /api/staff/assessment/dosen"
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Tambah Assessment</span>
          </button>
        </div>
      </div>

      {/* ─── Summary Statistic Cards ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium">Total Kelas</span>
            <span className="h-7 w-7 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center">
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
            <p className="text-2xl font-bold text-gray-900">{kelasList.length}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Semua kelas perkuliahan</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium">Kelas Terfilter</span>
            <span className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-700">{filteredKelasList.length}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Sesuai kriteria pencarian</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium">Tahun Akademik</span>
            <span className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{tahunAkademikList.length}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Periode akademik aktif</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium">Sudah Setup</span>
            <span className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
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
            <p className="text-2xl font-bold text-emerald-700">
              {kelasList.filter((k) => k.setup_assignments).length}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5 truncate max-w-full">
              Kelas penilaian aktif
            </p>
          </div>
        </div>
      </div>

      {/* ─── Search & Filter Bar ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Cari kelas, nama mata kuliah, atau kode MK..."
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

        {/* Filters */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Tahun Akademik */}
          <div className="w-full sm:w-48">
            <select
              value={filterTahunAkademik}
              onChange={(e) => setFilterTahunAkademik(e.target.value)}
              aria-label="Filter Tahun Akademik"
              className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-600 focus:bg-white transition"
            >
              <option value="">Semua Tahun Akademik</option>
              {tahunAkademikList.map((t) => (
                <option key={t.id || t.code || t.tahun_akademik} value={t.tahun_akademik}>
                  {t.tahun_akademik}
                </option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div className="w-full sm:w-40">
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              aria-label="Filter Semester"
              className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-600 focus:bg-white transition"
            >
              <option value="">Semua Semester</option>
              {semesterOptions.map((s) => (
                <option key={String(s)} value={String(s)}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          {(searchQuery || filterSemester || filterTahunAkademik) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setFilterSemester("");
                setFilterTahunAkademik("");
              }}
              className="text-xs text-brand-700 hover:text-brand-800 font-semibold px-2 py-1.5 whitespace-nowrap"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* ─── Error State ─── */}
      {errorKelas && (
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
            <span>{errorKelas}</span>
          </div>
          <button
            type="button"
            onClick={fetchKelas}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg shadow-2xs transition-all cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* ─── Main Content: Classes Table ─── */}
      {loadingKelas ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="h-5 bg-gray-200 rounded w-1/3" />
                <div className="h-6 bg-gray-100 rounded-full w-24" />
              </div>
              <div className="h-4 bg-gray-100 rounded w-1/4" />
              <div className="h-10 bg-gray-50 rounded" />
            </div>
          ))}
        </div>
      ) : filteredKelasList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-xs">
          <div className="h-16 w-16 mx-auto rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
            <svg
              className="h-8 w-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900">
            Tidak ada kelas yang ditemukan
          </h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            {searchQuery || filterSemester || filterTahunAkademik
              ? "Coba ubah kata kunci pencarian atau sesuaikan filter Anda."
              : "Saat ini belum ada data kelas perkuliahan yang terdaftar."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Nama Kelas</th>
                  <th className="py-3 px-4">Mata Kuliah</th>
                  <th className="py-3 px-4">Semester & TA</th>
                  <th className="py-3 px-4 text-center">Peserta</th>
                  <th className="py-3 px-4 text-right">Aksi Assessment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredKelasList.map((k, idx) => (
                  <tr
                    key={k.code_kelas || k.kelas_id || idx}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-center text-xs font-mono text-gray-400">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                          Kelas {k.nama_kelas || "-"}
                        </span>
                        {k.code_kelas && (
                          <p className="text-[10px] font-mono text-gray-400 truncate max-w-[140px]" title={k.code_kelas}>
                            {k.code_kelas.slice(0, 12)}...
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {k.nama_matakuliah || "-"}
                          </span>
                          {k.kode_matakuliah && (
                            <span className="font-mono text-[11px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                              {k.kode_matakuliah}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400">
                          {k.nama_program_studi || "Program Studi"}
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs text-gray-700">
                        <span className="font-medium">Semester {k.semester}</span>
                        <p className="text-[11px] text-gray-400">
                          {k.tahun_akademik || "-"}
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                        <svg
                          className="h-3.5 w-3.5 text-gray-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        <span>{k.jumlah_mahasiswa ?? 0} Mhs</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {(() => {
                          const hasTemplateMatakuliah = Boolean(k.template_matakuliah);
                          const hasTemplateAssignments = Boolean(k.template_assignments);
                          const isSetupAssignments = Boolean(k.setup_assignments);
                          const isRowSettingUp = settingUpCode === k.code_kelas;

                          // 1. Jika template_matakuliah false, template_assignments false, setup_assignments false (atau belum ada template matakuliah)
                          // Tampilan peringatan "Template belum dibuat"
                          if (!hasTemplateMatakuliah) {
                            return (
                              <span
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-50/90 text-amber-800 border border-amber-200/80 select-none whitespace-nowrap ml-auto"
                                title="Template assessment belum dibuat untuk kelas ini"
                              >
                                <svg
                                  className="h-3 w-3 text-amber-600 shrink-0"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <line x1="12" y1="8" x2="12" y2="12" />
                                  <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <span>Template Belum Dibuat</span>
                              </span>
                            );
                          }

                          // 2. Jika template_matakuliah true, template_assignments false, setup_assignments false
                          // Tulisannya bakal "Setup"
                          if (hasTemplateMatakuliah && !hasTemplateAssignments && !isSetupAssignments) {
                            return (
                              <button
                                type="button"
                                onClick={() => handleExecuteSetup(k)}
                                disabled={isRowSettingUp || isSettingUp}
                                className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-white bg-brand-700 hover:bg-brand-800 active:bg-brand-900 rounded-lg shadow-2xs transition-all cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ml-auto"
                                title="Jalankan Setup Assessment Dosen"
                              >
                                {isRowSettingUp ? (
                                  <>
                                    <svg
                                      className="h-3.5 w-3.5 animate-spin"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={2}
                                    >
                                      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span>Setup...</span>
                                  </>
                                ) : (
                                  <>
                                    <svg
                                      className="h-3.5 w-3.5 opacity-90"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={2}
                                    >
                                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                    </svg>
                                    <span>Setup</span>
                                  </>
                                )}
                              </button>
                            );
                          }

                          // 3 & 4. Jika template_matakuliah true dan template_assignments true (baik setup_assignments false maupun true)
                          // Tulisannya "Lihat Detail"
                          if (hasTemplateMatakuliah && hasTemplateAssignments) {
                            return (
                              <button
                                type="button"
                                onClick={() => handleNavigateToDetail(k)}
                                className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-brand-700 bg-white hover:bg-brand-50/80 active:bg-brand-100 border border-brand-200/90 rounded-lg shadow-2xs transition-all cursor-pointer select-none whitespace-nowrap ml-auto"
                                title="Lihat Detail Assessment"
                              >
                                <span>Lihat Detail</span>
                                <svg
                                  className="h-3.5 w-3.5 text-brand-600 opacity-80"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <polyline points="9 18 15 12 9 6" />
                                </svg>
                              </button>
                            );
                          }

                          // Fallback
                          return (
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-50/90 text-amber-800 border border-amber-200/80 select-none whitespace-nowrap ml-auto"
                              title="Template assessment belum dibuat untuk kelas ini"
                            >
                              <svg
                                className="h-3 w-3 text-amber-600 shrink-0"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                              </svg>
                              <span>Template Belum Dibuat</span>
                            </span>
                          );
                        })()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Modal Tambah Assessment (POST /api/staff/assessment/dosen) ─── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-scaleUp">
            {/* Header Modal */}
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Tambah Assessment Dosen
                  </h3>
                  <p className="text-xs text-gray-500">
                    Inisialisasi komponen penilaian dosen untuk kelas perkuliahan (POST /api/staff/assessment/dosen)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAssessmentSubmit} className="space-y-4">
              {/* Error Alert */}
              {addError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-rose-500 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{addError}</span>
                </div>
              )}

              {/* Tab Pilihan Mode: Dari Daftar Kelas vs Input Manual */}
              <div className="flex gap-2 border-b border-gray-100 pb-2">
                <button
                  type="button"
                  onClick={() => {
                    setAddInputMode("select");
                    setAddError(null);
                  }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                    addInputMode === "select"
                      ? "bg-brand-50 text-brand-700"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                >
                  Pilih dari Daftar Kelas ({kelasList.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddInputMode("manual");
                    setAddError(null);
                  }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                    addInputMode === "manual"
                      ? "bg-brand-50 text-brand-700"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                >
                  Input Manual Code Kelas
                </button>
              </div>

              {addInputMode === "select" ? (
                <div className="space-y-3">
                  {/* Search Filter for Classes */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Pilih Kelas Perkuliahan <span className="text-rose-500">*</span>
                    </label>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Cari kelas, nama MK, atau kode..."
                        value={addSearchQuery}
                        onChange={(e) => setAddSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-brand-600 transition mb-2"
                      />
                      <svg
                        className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400 pointer-events-none"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </div>

                    <select
                      value={addCodeKelas}
                      onChange={(e) => {
                        setAddCodeKelas(e.target.value);
                        setAddError(null);
                      }}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 outline-none focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition"
                    >
                      <option value="">-- Pilih Kelas --</option>
                      {filteredModalKelasList.map((k) => (
                        <option key={k.code_kelas || k.kelas_id} value={k.code_kelas}>
                          Kelas {k.nama_kelas} - {k.nama_matakuliah} {k.kode_matakuliah ? `(${k.kode_matakuliah})` : ""} [Sem {k.semester}, TA {k.tahun_akademik}]
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Preview Selected Class Info */}
                  {modalSelectedKelasItem ? (
                    <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-3.5 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded text-xs font-bold bg-brand-100 text-brand-800">
                          Kelas {modalSelectedKelasItem.nama_kelas}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {modalSelectedKelasItem.nama_matakuliah}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 pt-1 border-t border-brand-100/60">
                        <div>
                          <span className="text-gray-400">Kode MK:</span>{" "}
                          <span className="font-mono font-medium text-gray-800">
                            {modalSelectedKelasItem.kode_matakuliah || "-"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Program Studi:</span>{" "}
                          <span className="font-medium text-gray-800">
                            {modalSelectedKelasItem.nama_program_studi || "-"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Semester & TA:</span>{" "}
                          <span className="font-medium text-gray-800">
                            Sem {modalSelectedKelasItem.semester} • {modalSelectedKelasItem.tahun_akademik}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Peserta:</span>{" "}
                          <span className="font-medium text-gray-800">
                            {modalSelectedKelasItem.jumlah_mahasiswa ?? 0} Mahasiswa
                          </span>
                        </div>
                      </div>
                      <div className="pt-1 text-[10px] text-gray-400 font-mono truncate" title={modalSelectedKelasItem.code_kelas}>
                        Code: {modalSelectedKelasItem.code_kelas}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-xs text-gray-400">
                      Silakan pilih salah satu kelas di atas untuk melihat detail.
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700">
                    Code Kelas (Encrypted) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Masukkan encrypted code_kelas..."
                    value={addCodeKelas}
                    onChange={(e) => {
                      setAddCodeKelas(e.target.value);
                      setAddError(null);
                    }}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-800 outline-none focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition"
                  />
                  <p className="text-[11px] text-gray-400">
                    Masukkan token code_kelas terenkripsi kelas yang ingin diinisialisasi penilaiannya.
                  </p>
                </div>
              )}

              {/* Information Box */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 flex items-start gap-2.5 text-xs text-blue-900">
                <svg
                  className="h-4 w-4 text-blue-600 shrink-0 mt-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <div className="space-y-0.5 text-[11px]">
                  <p className="font-semibold text-blue-900">
                    Endpoint: POST /api/staff/assessment/dosen
                  </p>
                  <p className="text-blue-700">
                    Request akan mengirimkan payload <code>{`{ code_kelas }`}</code> untuk menginisialisasi alokasi dosen pada setiap node penilaian kelas ini.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmittingAdd}
                  className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 active:bg-gray-100 rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50 select-none"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdd || !addCodeKelas.trim()}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-brand-700 hover:bg-brand-800 active:bg-brand-900 rounded-lg shadow-2xs transition-all cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingAdd ? (
                    <>
                      <svg
                        className="h-3.5 w-3.5 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Memproses Setup...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-3.5 w-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      <span>Tambah Assessment</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
