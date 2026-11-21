import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDetailKelasDosen } from "@/features/dosen/api/kurikulum";
import Button from "@/components/ui/Button";
import type {
  DosenKelasDetailData,
  DosenKelasMahasiswaItem,
} from "@/features/dosen/types";

interface DosenKelasDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  codeKelas: string | null;
}

export default function DosenKelasDetailModal({
  isOpen,
  onClose,
  codeKelas,
}: DosenKelasDetailModalProps) {
  const navigate = useNavigate();
  const [detail, setDetail] = useState<DosenKelasDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isOpen || !codeKelas) {
      return;
    }

    let isMounted = true;
    async function fetchDetail() {
      setLoading(true);
      setError(null);
      const res = await getDetailKelasDosen(codeKelas!);
      if (!isMounted) return;

      if (!res.status) {
        setError(res.message);
        setDetail(null);
      } else {
        setDetail(res.data);
      }
      setLoading(false);
    }

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [isOpen, codeKelas]);

  // Handle ESC key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const filteredMahasiswa = (detail?.mahasiswa || []).filter((mhs) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      mhs.nama_mahasiswa.toLowerCase().includes(q) ||
      mhs.nim.toLowerCase().includes(q)
    );
  });

  function handleLihatKurikulum(mhs: DosenKelasMahasiswaItem) {
    onClose();
    navigate(
      `/dosen/kurikulum?code_mahasiswa=${encodeURIComponent(
        mhs.code_mahasiswa
      )}&nim=${encodeURIComponent(mhs.nim)}&nama=${encodeURIComponent(
        mhs.nama_mahasiswa
      )}`
    );
  }

  const totalSks = detail ? detail.sks_teori + detail.sks_praktik : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-xs transition-opacity"
      aria-modal="true"
      role="dialog"
      aria-labelledby="detail-kelas-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] transition-all">
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 shrink-0">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2
                id="detail-kelas-title"
                className="text-lg font-bold text-gray-900 leading-tight"
              >
                {detail ? detail.nama_kelas : "Detail Kelas"}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {detail
                  ? `${detail.kode_matakuliah} • ${detail.nama_matakuliah}`
                  : "Memuat detail kelas..."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus-visible:outline-none"
            aria-label="Tutup modal"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-brand-600 mb-3" />
              <p className="text-sm">Memuat informasi kelas...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm flex items-start gap-3">
              <svg
                className="h-5 w-5 shrink-0 mt-0.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="font-semibold">Gagal memuat detail</p>
                <p className="text-xs mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Detail Content */}
          {detail && !loading && (
            <>
              {/* Class Info Card */}
              <div className="bg-brand-50/50 border border-brand-100 rounded-2xl p-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <span className="text-xs text-gray-400 font-medium">
                      Kelas
                    </span>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">
                      {detail.nama_kelas}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-medium">
                      Semester
                    </span>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                      Semester {detail.semester}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-medium">
                      Tahun Akademik
                    </span>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                      {detail.tahun_akademik}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-medium">
                      Program Studi
                    </span>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                      {detail.nama_program_studi}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-medium">
                      Mata Kuliah
                    </span>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                      {detail.nama_matakuliah}{" "}
                      <span className="text-xs text-brand-600 font-mono">
                        ({detail.kode_matakuliah})
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-medium">
                      Bobot SKS
                    </span>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                      {totalSks} SKS{" "}
                      <span className="text-xs text-gray-500 font-normal">
                        ({detail.sks_teori} Teori / {detail.sks_praktik}{" "}
                        Praktik)
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-medium">
                      Tipe Kurikulum
                    </span>
                    <div className="mt-0.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          detail.block
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {detail.block ? "Sistem Blok" : "Reguler"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-medium">
                      Total Peserta
                    </span>
                    <p className="text-sm font-bold text-brand-700 mt-0.5">
                      {detail.mahasiswa.length} Mahasiswa
                    </p>
                  </div>
                </div>
              </div>

              {/* Student Roster Section */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">
                      Daftar Mahasiswa Kelas
                    </h3>
                    <p className="text-xs text-gray-400">
                      Mahasiswa yang terdaftar pada kelas ini
                    </p>
                  </div>

                  {/* Search Bar */}
                  <div className="w-full sm:w-72">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Cari NIM atau Nama..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-brand-600 focus:bg-white focus:ring-2 focus:ring-brand-100 transition"
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
                  </div>
                </div>

                {/* Student Table */}
                <div className="rounded-xl border border-gray-100 overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-100 text-left">
                          <th className="px-4 py-2.5 font-semibold text-gray-500 w-12">
                            No
                          </th>
                          <th className="px-4 py-2.5 font-semibold text-gray-500 w-36">
                            NIM
                          </th>
                          <th className="px-4 py-2.5 font-semibold text-gray-500">
                            Nama Mahasiswa
                          </th>
                          <th className="px-4 py-2.5 font-semibold text-gray-500 text-right w-36">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredMahasiswa.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-4 py-8 text-center text-gray-400 text-xs"
                            >
                              {searchQuery
                                ? "Tidak ada mahasiswa yang cocok dengan pencarian."
                                : "Belum ada mahasiswa yang terdaftar di kelas ini."}
                            </td>
                          </tr>
                        ) : (
                          filteredMahasiswa.map((mhs, idx) => (
                            <tr
                              key={mhs.code_mahasiswa || mhs.nim}
                              className="hover:bg-gray-50/70 transition-colors"
                            >
                              <td className="px-4 py-3 text-gray-400">
                                {idx + 1}
                              </td>
                              <td className="px-4 py-3 font-mono font-medium text-gray-700">
                                <span className="bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                                  {mhs.nim}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-medium text-gray-900">
                                {mhs.nama_mahasiswa}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleLihatKurikulum(mhs)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors"
                                  title={`Lihat kurikulum ${mhs.nama_mahasiswa}`}
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
                                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                                  </svg>
                                  <span>Kurikulum</span>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {detail ? `Total: ${detail.mahasiswa.length} mahasiswa` : ""}
          </span>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
