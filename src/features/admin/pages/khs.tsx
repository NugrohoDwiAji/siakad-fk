import { useState, useRef, useEffect, useCallback } from "react";
import { searchMahasiswa } from "@/features/admin/api/masterData";
import { getStaffMahasiswaKhs } from "@/features/admin/api/khs";
import type {
  MahasiswaSearchItem,
  StaffKhsMahasiswaItem,
} from "@/features/admin/types";
import KhsMahasiswaDetailModal from "../components/organisms/KhsMahasiswaDetailModal";

export default function AdminKhs() {
  // ── Search State ──
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MahasiswaSearchItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // ── Selected Student & KHS State ──
  const [selectedMahasiswa, setSelectedMahasiswa] =
    useState<MahasiswaSearchItem | null>(null);
  const [khsList, setKhsList] = useState<StaffKhsMahasiswaItem[]>([]);
  const [loadingKhs, setLoadingKhs] = useState(false);
  const [khsError, setKhsError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // ── Detail Modal State ──
  const [detailModalCode, setDetailModalCode] = useState<string | null>(null);
  const [detailModalSemester, setDetailModalSemester] = useState<
    number | string | undefined
  >(undefined);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Fetch KHS data for a student code
  const fetchStudentKhs = useCallback(
    async (code: string, studentInfo?: MahasiswaSearchItem | null) => {
      setLoadingKhs(true);
      setKhsError(null);
      setHasSearched(true);

      const result = await getStaffMahasiswaKhs(code);
      setLoadingKhs(false);

      if (result.status && result.data) {
        setKhsList(result.data);
        if (studentInfo) {
          setSelectedMahasiswa(studentInfo);
        } else if (!selectedMahasiswa) {
          // If code was entered manually without dropdown selection
          setSelectedMahasiswa({
            code,
            nim: "-",
            nama_mahasiswa: "Mahasiswa Terpilih",
          });
        }
      } else {
        setKhsList([]);
        setKhsError(result.message || "Gagal mengambil data KHS mahasiswa.");
      }
    },
    [selectedMahasiswa]
  );

  // Handle Search Input Change
  const handleSearchInput = (value: string) => {
    setSearchQuery(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!value.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setShowDropdown(true);
    setSearchLoading(true);

    debounceTimer.current = setTimeout(async () => {
      const result = await searchMahasiswa(value.trim());
      if (result.status && result.data) {
        setSearchResults(result.data);
      } else {
        setSearchResults([]);
      }
      setSearchLoading(false);
    }, 400);
  };

  // Select student from dropdown
  const handleSelectStudent = (mhs: MahasiswaSearchItem) => {
    setSelectedMahasiswa(mhs);
    setSearchQuery(`${mhs.nama_mahasiswa} (${mhs.nim})`);
    setShowDropdown(false);
    fetchStudentKhs(mhs.code, mhs);
  };

  // Manual submit (pressing Enter or clicking "Cari")
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setShowDropdown(false);

    // If there's an exact or top match in current searchResults
    if (searchResults.length > 0) {
      const topMatch = searchResults[0];
      handleSelectStudent(topMatch);
      return;
    }

    // Direct code search
    fetchStudentKhs(query);
  };

  // Reset student selection
  const handleReset = () => {
    setSelectedMahasiswa(null);
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
    setKhsList([]);
    setKhsError(null);
    setHasSearched(false);
  };

  // Open detail modal
  const handleOpenDetail = (codeKrs: string, semester?: number | string) => {
    setDetailModalCode(codeKrs);
    setDetailModalSemester(semester);
  };

  return (
    <div className="space-y-5 p-6">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">KHS</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Pencarian dan detail Kartu Hasil Studi (KHS) mahasiswa
        </p>
      </div>

      {/* ── Search Bar Section ── */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5">
        <div className="max-w-2xl">
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">
            Pencarian KHS Mahasiswa
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Cari mahasiswa berdasarkan nama, NIM, atau masukkan kode mahasiswa
            untuk melihat riwayat KHS yang telah ditempuh.
          </p>

          <div ref={dropdownRef} className="relative">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0) setShowDropdown(true);
                  }}
                  placeholder="Ketik nama mahasiswa atau NIM..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-9 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-brand-600 focus:bg-white focus:ring-2 focus:ring-brand-100 transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition"
                  >
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={loadingKhs || !searchQuery.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-800 text-white text-sm font-semibold hover:bg-brand-700 active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:pointer-events-none shrink-0"
              >
                {loadingKhs ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                )}
                Cari
              </button>
            </form>

            {/* Dropdown Results */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 max-h-64 overflow-y-auto z-20">
                {searchLoading ? (
                  <div className="flex items-center justify-center py-6 gap-2 text-xs text-gray-400">
                    <div className="h-4 w-4 border-2 border-brand-600/30 border-t-brand-600 rounded-full animate-spin" />
                    <span>Mencari mahasiswa...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="p-1 divide-y divide-gray-50">
                    {searchResults.map((mhs) => (
                      <button
                        key={mhs.code}
                        type="button"
                        onClick={() => handleSelectStudent(mhs)}
                        className="w-full text-left px-3.5 py-2.5 rounded-lg hover:bg-brand-50/80 transition flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center font-bold text-xs shrink-0">
                            {mhs.nama_mahasiswa?.charAt(0)?.toUpperCase() || "M"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800 group-hover:text-brand-900">
                              {mhs.nama_mahasiswa}
                            </p>
                            <p className="text-xs font-mono text-gray-500">
                              NIM: {mhs.nim}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-brand-700 font-medium opacity-0 group-hover:opacity-100 transition">
                          Pilih &rarr;
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-gray-400">
                    Mahasiswa tidak ditemukan.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Selected Student Banner ── */}
      {selectedMahasiswa && (
        <div className="rounded-2xl bg-gradient-to-r from-brand-900 to-brand-800 text-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg shrink-0 border border-white/20">
              {selectedMahasiswa.nama_mahasiswa?.charAt(0)?.toUpperCase() || "M"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  {selectedMahasiswa.nama_mahasiswa}
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white/20 text-white border border-white/20">
                  Mahasiswa
                </span>
              </div>
              <p className="text-xs text-brand-200 mt-0.5 font-mono">
                NIM: {selectedMahasiswa.nim}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-white border border-white/20 transition active:scale-95"
            >
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Ganti Mahasiswa
            </button>
          </div>
        </div>
      )}

      {/* ── Error Notification ── */}
      {khsError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center justify-between">
          <span>{khsError}</span>
          <button
            type="button"
            onClick={() => setKhsError(null)}
            className="text-xs font-medium text-red-500 hover:text-red-700"
          >
            Tutup
          </button>
        </div>
      )}

      {/* ── Initial Empty State (Before searching) ── */}
      {!hasSearched && !loadingKhs && (
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-12 text-center">
          <div className="max-w-md mx-auto flex flex-col items-center">
            <div className="h-16 w-16 rounded-2xl bg-brand-50 text-brand-800 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">
              Pilih Mahasiswa Terlebih Dahulu
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Silahkan cari mahasiswa berdasarkan Nama atau NIM melalui kolom
              pencarian di atas untuk melihat riwayat Kartu Hasil Studi (KHS).
            </p>
          </div>
        </div>
      )}

      {/* ── Loading Spinner ── */}
      {loadingKhs && (
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-12 text-center">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700" />
            <p className="text-xs text-gray-500 font-medium">
              Memuat data KHS mahasiswa...
            </p>
          </div>
        </div>
      )}

      {/* ── KHS List Table ── */}
      {hasSearched && !loadingKhs && (
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-800">
                Daftar KHS Mahasiswa
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {khsList.length} semester KHS terdaftar
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-600 uppercase font-semibold">
                  <th className="px-4 py-3 text-left w-14">No</th>
                  <th className="px-4 py-3 text-left">Semester</th>
                  <th className="px-4 py-3 text-left">Kode KRS/KHS</th>
                  <th className="px-4 py-3 text-center w-36">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {khsList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-12 text-center text-gray-400 text-sm"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-gray-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                          />
                        </svg>
                        <span>
                          Tidak ada data KHS ditemukan untuk mahasiswa ini.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  khsList.map((item, idx) => (
                    <tr
                      key={item.id || item.code_krs || idx}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      <td className="px-4 py-3.5 text-gray-500 text-xs font-medium">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-800 border border-brand-200">
                          Semester {item.semester}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3.5 font-mono text-xs text-gray-500 max-w-xs truncate"
                        title={item.code_krs}
                      >
                        {item.code_krs}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          title="Lihat Detail KHS"
                          onClick={() =>
                            handleOpenDetail(item.code_krs, item.semester)
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-brand-800 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition active:scale-95 shadow-2xs"
                        >
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          Lihat Detail
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

      {/* ── Detail Modal ── */}
      {detailModalCode && (
        <KhsMahasiswaDetailModal
          codeKrs={detailModalCode}
          semester={detailModalSemester}
          onClose={() => {
            setDetailModalCode(null);
            setDetailModalSemester(undefined);
          }}
        />
      )}
    </div>
  );
}
