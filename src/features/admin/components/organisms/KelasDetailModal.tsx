import { useState, useEffect, useMemo, useCallback } from "react";
import Button from "@/components/ui/Button";
import {
  getStaffKelasDetail,
  createStaffPenempatan,
  deleteStaffKelasDosen,
} from "@/features/admin/api/kelas";
import AddDosenPengampuModal from "./AddDosenPengampuModal";
import type {
  StaffKelasDetailData,
  StaffKelasMahasiswaItem,
  StaffKelasDosenItem,
  StaffKelasBelumMasukItem,
} from "@/features/admin/types";

interface KelasDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  kelasId: number | null;
  onDeleteClick: (mhs: StaffKelasMahasiswaItem, namaKelas: string) => void;
  onAddPesertaClick: (kelasId: number) => void;
  onDataChanged?: () => void;
  refetchTrigger?: number;
}

type ModalTab = "info" | "peserta" | "belum_masuk";

export default function KelasDetailModal({
  isOpen,
  onClose,
  kelasId,
  onDeleteClick,
  onAddPesertaClick,
  onDataChanged,
  refetchTrigger = 0,
}: KelasDetailModalProps) {
  const [detail, setDetail] = useState<StaffKelasDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ModalTab>("info");
  const [searchPeserta, setSearchPeserta] = useState("");
  const [searchBelumMasuk, setSearchBelumMasuk] = useState("");
  const [placingCode, setPlacingCode] = useState<string | null>(null);
  const [isAddDosenOpen, setIsAddDosenOpen] = useState(false);
  const [dosenToDelete, setDosenToDelete] = useState<StaffKelasDosenItem | null>(null);
  const [isDeletingDosen, setIsDeletingDosen] = useState(false);
  const [alertNotice, setAlertNotice] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Close handler with tab reset
  const handleClose = useCallback(() => {
    setActiveTab("info");
    setSearchPeserta("");
    setSearchBelumMasuk("");
    setAlertNotice(null);
    setIsAddDosenOpen(false);
    setDosenToDelete(null);
    onClose();
  }, [onClose]);

  // Fetch detail data from GET /api/staff/kelas/show
  const fetchDetail = useCallback(async () => {
    if (!kelasId) return;
    setLoading(true);
    setError(null);
    const res = await getStaffKelasDetail(kelasId);
    if (res.status && res.data) {
      setDetail(res.data);
    } else {
      setError(res.message || "Gagal memuat detail kelas.");
      setDetail(null);
    }
    setLoading(false);
  }, [kelasId]);

  // Handle delete lecturer from class
  async function handleConfirmDeleteDosen() {
    if (!dosenToDelete) return;

    setIsDeletingDosen(true);
    const res = await deleteStaffKelasDosen(dosenToDelete.mengajar_id);
    setIsDeletingDosen(false);

    if (res.status) {
      setAlertNotice({
        type: "success",
        message: `${dosenToDelete.nama_dosen} berhasil dihapus dari daftar dosen pengampu.`,
      });
      setDosenToDelete(null);
      fetchDetail();
      onDataChanged?.();
    } else {
      setAlertNotice({
        type: "error",
        message: res.message || "Gagal menghapus dosen pengampu dari kelas.",
      });
      setDosenToDelete(null);
    }
  }

  useEffect(() => {
    if (!isOpen || !kelasId) return;

    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) {
        setLoading(true);
        setError(null);
      }
    });

    getStaffKelasDetail(kelasId).then((res) => {
      if (!isMounted) return;
      if (res.status && res.data) {
        setDetail(res.data);
      } else {
        setError(res.message || "Gagal memuat detail kelas.");
        setDetail(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, kelasId, refetchTrigger]);

  // Handle ESC key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !loading) {
        handleClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, handleClose]);

  const kelas = detail?.kelas;
  const mahasiswaList: StaffKelasMahasiswaItem[] = useMemo(
    () => detail?.mahasiswa || [],
    [detail?.mahasiswa]
  );
  const dosenList: StaffKelasDosenItem[] = useMemo(
    () => detail?.dosen || [],
    [detail?.dosen]
  );
  const belumMasukList: StaffKelasBelumMasukItem[] = useMemo(
    () => detail?.belum_masuk_kelas || [],
    [detail?.belum_masuk_kelas]
  );

  // Filtered Peserta list
  const filteredMahasiswa = useMemo(() => {
    if (!searchPeserta.trim()) return mahasiswaList;
    const q = searchPeserta.toLowerCase();
    return mahasiswaList.filter(
      (mhs) =>
        (mhs.nama_mahasiswa && mhs.nama_mahasiswa.toLowerCase().includes(q)) ||
        mhs.nim.toLowerCase().includes(q)
    );
  }, [mahasiswaList, searchPeserta]);

  // Filtered Belum Masuk list
  const filteredBelumMasuk = useMemo(() => {
    if (!searchBelumMasuk.trim()) return belumMasukList;
    const q = searchBelumMasuk.toLowerCase();
    return belumMasukList.filter(
      (mhs) =>
        (mhs.nama_mahasiswa && mhs.nama_mahasiswa.toLowerCase().includes(q)) ||
        mhs.nim.toLowerCase().includes(q)
    );
  }, [belumMasukList, searchBelumMasuk]);

  // Quick place single student from belum_masuk into this class
  async function handleQuickPlace(codeKrsDetail: string, namaMahasiswa: string) {
    if (!kelas) return;
    setPlacingCode(codeKrsDetail);
    setAlertNotice(null);

    const res = await createStaffPenempatan({
      kelas_id: kelas.kelas_id,
      code_krs_detail: codeKrsDetail,
    });

    setPlacingCode(null);

    if (res.status) {
      setAlertNotice({
        type: "success",
        message: `${namaMahasiswa} berhasil ditempatkan ke Kelas ${kelas.nama_kelas}.`,
      });
      fetchDetail();
      onDataChanged?.();
    } else {
      setAlertNotice({
        type: "error",
        message: res.message || "Gagal menempatkan mahasiswa ke kelas ini.",
      });
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs transition-opacity animate-fadeIn"
      aria-modal="true"
      role="dialog"
      aria-labelledby="detail-kelas-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          handleClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-100 transition-all">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700 font-bold text-sm shrink-0 border border-brand-100">
              {kelas ? `Kls ${kelas.nama_kelas}` : "KLS"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="detail-kelas-modal-title"
                  className="text-base font-bold text-gray-900"
                >
                  {kelas
                    ? `Kelas ${kelas.nama_kelas} - ${kelas.nama_matakuliah}`
                    : "Detail Informasi Kelas"}
                </h2>
                {kelas?.nama_program_studi && (
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700">
                    {kelas.nama_program_studi}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {kelas
                  ? `${kelas.kode_matakuliah} • Semester ${kelas.semester} • Tahun Akademik ${kelas.tahun_akademik}`
                  : "Memuat informasi detail kelas..."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Tutup modal"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-1 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("info")}
            className={`px-3.5 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "info"
                ? "border-brand-700 text-brand-700 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>Informasi &amp; Dosen</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("peserta")}
            className={`px-3.5 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "peserta"
                ? "border-brand-700 text-brand-700 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <svg
              className="h-4 w-4"
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
            <span>Lihat Peserta</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === "peserta"
                  ? "bg-brand-100 text-brand-700"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {mahasiswaList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("belum_masuk")}
            className={`px-3.5 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "belum_masuk"
                ? "border-brand-700 text-brand-700 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            <span>Belum Masuk Kelas</span>
            {belumMasukList.length > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === "belum_masuk"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {belumMasukList.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Action Notice Alert */}
          {alertNotice && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center justify-between border ${
                alertNotice.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  {alertNotice.type === "success" ? (
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" />
                  ) : (
                    <>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </>
                  )}
                </svg>
                <p className="font-semibold">{alertNotice.message}</p>
              </div>
              <button
                type="button"
                onClick={() => setAlertNotice(null)}
                className="text-gray-400 hover:text-gray-600 font-bold ml-2 text-sm"
              >
                &times;
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="h-8 w-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-500 font-medium">
                Memuat detail kelas dan data peserta...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5">
              <svg
                className="h-5 w-5 text-red-600 shrink-0 mt-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <p className="font-bold">Terjadi Kesalahan</p>
                <p className="text-xs text-red-600 mt-0.5">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchDetail}
                  className="mt-3 text-xs"
                >
                  Coba Lagi
                </Button>
              </div>
            </div>
          ) : kelas ? (
            <>
              {/* TAB 1: INFORMASI KELAS & DOSEN */}
              {activeTab === "info" && (
                <div className="space-y-5 animate-fadeIn">
                  {/* Grid Metadata */}
                  <div className="p-4.5 bg-gray-50/75 border border-gray-100 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-gray-400 font-medium block text-[11px]">
                        Program Studi
                      </span>
                      <span className="font-bold text-gray-900">
                        {kelas.nama_program_studi || "Kedokteran"}
                      </span>
                      {kelas.kode_program_studi && (
                        <span className="text-[11px] text-gray-400 font-mono block">
                          Kode: {kelas.kode_program_studi}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block text-[11px]">
                        Tahun Akademik
                      </span>
                      <span className="font-bold text-gray-900">
                        {kelas.tahun_akademik}
                      </span>
                      <span className="text-[11px] text-emerald-600 font-medium block">
                        Tahun Aktif
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block text-[11px]">
                        Semester &amp; Rombel
                      </span>
                      <span className="font-bold text-gray-900">
                        Semester {kelas.semester}
                      </span>
                      <span className="text-[11px] text-brand-700 font-semibold block">
                        Kelas {kelas.nama_kelas}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block text-[11px]">
                        Mata Kuliah
                      </span>
                      <span className="font-bold text-gray-900 line-clamp-1" title={kelas.nama_matakuliah}>
                        {kelas.nama_matakuliah}
                      </span>
                      <span className="text-[11px] text-gray-400 font-mono block">
                        {kelas.kode_matakuliah}
                      </span>
                    </div>
                  </div>

                  {/* 2 Feature Cards: Peserta Terdaftar & Belum Masuk Kelas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Feature Card 1: Peserta Terdaftar with "Lihat Peserta" button */}
                    <div className="p-4.5 bg-white border border-gray-200 rounded-2xl hover:border-brand-300 transition-all shadow-xs flex flex-col justify-between space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
                            <svg
                              className="h-5 w-5"
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
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">
                              Peserta Kelas
                            </h4>
                            <p className="text-[11px] text-gray-400">
                              Mahasiswa terdaftar dalam kelas ini
                            </p>
                          </div>
                        </div>
                        <span className="text-xl font-extrabold text-brand-700">
                          {mahasiswaList.length}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                        {/* THE BUTTON LIHAT PESERTA SHIFTED INSIDE THE DETAIL */}
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => setActiveTab("peserta")}
                          rightIcon={
                            <svg
                              className="h-3.5 w-3.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          }
                          className="flex-1 text-xs"
                        >
                          Lihat Peserta ({mahasiswaList.length})
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onAddPesertaClick(kelas.kelas_id)}
                          title="Tambah mahasiswa ke kelas"
                          className="text-xs"
                        >
                          + Tambah
                        </Button>
                      </div>
                    </div>

                    {/* Feature Card 2: Mahasiswa Belum Masuk Kelas */}
                    <div className="p-4.5 bg-white border border-gray-200 rounded-2xl hover:border-amber-300 transition-all shadow-xs flex flex-col justify-between space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                            <svg
                              className="h-5 w-5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                              <circle cx="8.5" cy="7" r="4" />
                              <line x1="20" y1="8" x2="20" y2="14" />
                              <line x1="23" y1="11" x2="17" y2="11" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">
                              Belum Masuk Kelas
                            </h4>
                            <p className="text-[11px] text-gray-400">
                              Mahasiswa ber-KRS mata kuliah ini
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-xl font-extrabold ${
                            belumMasukList.length > 0
                              ? "text-amber-600"
                              : "text-gray-400"
                          }`}
                        >
                          {belumMasukList.length}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab("belum_masuk")}
                          rightIcon={
                            <svg
                              className="h-3.5 w-3.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          }
                          className="flex-1 text-xs"
                        >
                          Daftar Belum Masuk ({belumMasukList.length})
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Section Dosen Pengampu */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900">
                          Dosen Pengampu Kelas
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">
                          {dosenList.length} Dosen
                        </span>
                      </div>

                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => setIsAddDosenOpen(true)}
                        leftIcon={
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
                        }
                        className="text-xs"
                      >
                        Tambah Dosen Pengampu
                      </Button>
                    </div>

                    {dosenList.length === 0 ? (
                      <div className="p-6 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/50 space-y-2.5">
                        <p className="text-xs text-gray-400 italic">
                          Belum ada data dosen pengampu yang terdaftar pada kelas ini.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsAddDosenOpen(true)}
                          className="text-xs"
                        >
                          + Tambah Dosen Pengampu
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {dosenList.map((dosen, idx) => (
                          <div
                            key={dosen.mengajar_id || idx}
                            className="p-3.5 bg-gray-50/75 border border-gray-100 rounded-xl flex items-center gap-3 hover:bg-gray-50 transition"
                          >
                            <div className="h-9 w-9 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {dosen.nama_dosen
                                ? dosen.nama_dosen.charAt(0).toUpperCase()
                                : "D"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-gray-900 truncate">
                                {dosen.nama_dosen}
                              </p>
                              <p className="text-[11px] text-gray-400 font-mono">
                                Kode: {dosen.kode_dosen || "-"}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                Pengampu
                              </span>
                              <button
                                type="button"
                                onClick={() => setDosenToDelete(dosen)}
                                title={`Hapus ${dosen.nama_dosen} dari kelas ini`}
                                className="p-1 rounded-md text-red-500 hover:text-white hover:bg-red-500 transition-colors"
                                aria-label={`Hapus ${dosen.nama_dosen}`}
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
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: DAFTAR PESERTA KELAS (ROSTER) */}
              {activeTab === "peserta" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-800">
                          Daftar Mahasiswa Terdaftar
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-100">
                          {filteredMahasiswa.length} Peserta
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Mahasiswa yang telah ditempatkan pada Kelas {kelas.nama_kelas}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative w-full sm:w-60">
                        <input
                          type="text"
                          placeholder="Cari NIM atau Nama..."
                          value={searchPeserta}
                          onChange={(e) => setSearchPeserta(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-brand-600 focus:ring-1 focus:ring-brand-100 transition"
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

                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => onAddPesertaClick(kelas.kelas_id)}
                        leftIcon={
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
                        }
                      >
                        Tambah Peserta
                      </Button>
                    </div>
                  </div>

                  {/* Table Mahasiswa Peserta */}
                  <div className="border border-gray-100 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-gray-50 text-gray-600 border-b border-gray-100 font-semibold">
                        <tr>
                          <th className="px-4 py-3 w-12 text-center">No</th>
                          <th className="px-4 py-3">NIM</th>
                          <th className="px-4 py-3">Nama Mahasiswa</th>
                          <th className="px-4 py-3 text-center">Semester</th>
                          <th className="px-4 py-3 text-center">Kode KRS Detail</th>
                          <th className="px-4 py-3 text-center w-28">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredMahasiswa.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-4 py-8 text-center text-gray-400 italic"
                            >
                              {searchPeserta.trim()
                                ? "Tidak ada mahasiswa yang cocok dengan kata kunci pencarian."
                                : "Belum ada mahasiswa yang terdaftar pada kelas ini."}
                            </td>
                          </tr>
                        ) : (
                          filteredMahasiswa.map((mhs, idx) => (
                            <tr
                              key={mhs.kelas_mahasiswa_id}
                              className="hover:bg-gray-50/80 transition-colors"
                            >
                              <td className="px-4 py-2.5 text-center text-gray-400 font-mono">
                                {idx + 1}
                              </td>
                              <td className="px-4 py-2.5 font-mono font-medium text-gray-900">
                                {mhs.nim}
                              </td>
                              <td className="px-4 py-2.5 font-semibold text-gray-800">
                                {mhs.nama_mahasiswa || "-"}
                              </td>
                              <td className="px-4 py-2.5 text-center text-gray-600">
                                Semester {mhs.semester}
                              </td>
                              <td className="px-4 py-2.5 text-center font-mono text-gray-500">
                                {mhs.kode_krs_detail || "-"}
                              </td>
                              <td className="px-4 py-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() =>
                                    onDeleteClick(mhs, kelas.nama_kelas)
                                  }
                                  title="Hapus penempatan mahasiswa dari kelas ini"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-red-600 hover:text-white bg-red-50 hover:bg-red-600 rounded-md transition-colors"
                                >
                                  <svg
                                    className="h-3.5 w-3.5 shrink-0"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                  >
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  </svg>
                                  <span>Hapus</span>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: BELUM MASUK KELAS */}
              {activeTab === "belum_masuk" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-800">
                          Mahasiswa Belum Masuk Kelas
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          {filteredBelumMasuk.length} Mahasiswa
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Mahasiswa yang memprogram mata kuliah{" "}
                        <span className="font-semibold text-gray-700">
                          {kelas.nama_matakuliah}
                        </span>{" "}
                        namun belum ditempatkan ke kelas
                      </p>
                    </div>

                    <div className="relative w-full sm:w-64">
                      <input
                        type="text"
                        placeholder="Cari NIM atau Nama..."
                        value={searchBelumMasuk}
                        onChange={(e) => setSearchBelumMasuk(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-brand-600 focus:ring-1 focus:ring-brand-100 transition"
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
                  </div>

                  {/* Table Belum Masuk Kelas */}
                  <div className="border border-gray-100 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-gray-50 text-gray-600 border-b border-gray-100 font-semibold">
                        <tr>
                          <th className="px-4 py-3 w-12 text-center">No</th>
                          <th className="px-4 py-3">NIM</th>
                          <th className="px-4 py-3">Nama Mahasiswa</th>
                          <th className="px-4 py-3 text-center">Semester</th>
                          <th className="px-4 py-3 text-center">Kode KRS Detail</th>
                          <th className="px-4 py-3 text-center w-36">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredBelumMasuk.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-4 py-8 text-center text-gray-400 italic"
                            >
                              {searchBelumMasuk.trim()
                                ? "Tidak ada mahasiswa yang cocok dengan pencarian."
                                : "Semua mahasiswa yang mengambil mata kuliah ini sudah masuk kelas."}
                            </td>
                          </tr>
                        ) : (
                          filteredBelumMasuk.map((item, idx) => (
                            <tr
                              key={item.code_krs_detail || idx}
                              className="hover:bg-gray-50/80 transition-colors"
                            >
                              <td className="px-4 py-2.5 text-center text-gray-400 font-mono">
                                {idx + 1}
                              </td>
                              <td className="px-4 py-2.5 font-mono font-medium text-gray-900">
                                {item.nim}
                              </td>
                              <td className="px-4 py-2.5 font-semibold text-gray-800">
                                {item.nama_mahasiswa}
                              </td>
                              <td className="px-4 py-2.5 text-center text-gray-600">
                                Semester {item.semester}
                              </td>
                              <td className="px-4 py-2.5 text-center font-mono text-gray-500">
                                {item.kode_krs_detail}
                              </td>
                              <td className="px-4 py-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleQuickPlace(
                                      item.code_krs_detail,
                                      item.nama_mahasiswa
                                    )
                                  }
                                  disabled={placingCode === item.code_krs_detail}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-brand-700 hover:text-white bg-brand-50 hover:bg-brand-700 rounded-md transition-colors disabled:opacity-50"
                                >
                                  {placingCode === item.code_krs_detail ? (
                                    <>
                                      <div className="h-3 w-3 border-2 border-brand-700 border-t-transparent rounded-full animate-spin" />
                                      <span>Menempatkan...</span>
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
                                      <span>Tempatkan ke Kelas</span>
                                    </>
                                  )}
                                </button>
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
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0 text-xs">
          <span className="text-gray-500">
            {mahasiswaList.length} Mahasiswa Terdaftar &bull; {dosenList.length} Dosen Pengampu &bull; {belumMasukList.length} Belum Masuk Kelas
          </span>

          <div className="flex items-center gap-2">
            {activeTab === "info" ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setActiveTab("peserta")}
                className="text-xs"
              >
                Lihat Peserta
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("info")}
                className="text-xs"
              >
                Kembali ke Informasi
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="text-xs"
            >
              Tutup
            </Button>
          </div>
        </div>
      </div>

      {/* Modal Tambah Dosen Pengampu */}
      {isAddDosenOpen && kelas && (
        <AddDosenPengampuModal
          isOpen={isAddDosenOpen}
          onClose={() => setIsAddDosenOpen(false)}
          onSuccess={(data) => {
            setAlertNotice({
              type: "success",
              message: data?.nama_dosen
                ? `${data.nama_dosen} berhasil ditambahkan sebagai dosen pengampu.`
                : "Dosen pengampu berhasil ditambahkan ke kelas.",
            });
            fetchDetail();
            onDataChanged?.();
          }}
          kelasId={kelas.kelas_id}
          namaKelas={kelas.nama_kelas}
          namaMatakuliah={kelas.nama_matakuliah}
          currentDosenCodes={dosenList
            .map((d) => d.code_dosen)
            .filter((c): c is string => Boolean(c))}
        />
      )}

      {/* ── Dialog Konfirmasi Hapus Dosen Pengampu ── */}
      {dosenToDelete && (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-fadeIn"
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
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-gray-900">
                Hapus Dosen Pengampu?
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Apakah Anda yakin ingin menghapus{" "}
                <span className="font-semibold text-gray-800">
                  {dosenToDelete.nama_dosen}
                </span>{" "}
                dari daftar dosen pengampu{" "}
                <span className="font-semibold text-gray-800">
                  Kelas {kelas?.nama_kelas}
                </span>
                ? Dosen ini tidak lagi memiliki hak pengajaran pada kelas ini.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDosenToDelete(null)}
                disabled={isDeletingDosen}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                isLoading={isDeletingDosen}
                onClick={handleConfirmDeleteDosen}
              >
                Ya, Hapus Dosen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
