import { useState, useEffect } from "react";
import { getDaftarKelasDosen } from "@/features/dosen/api/kurikulum";
import DosenKelasDetailModal from "@/features/dosen/components/organisms/DosenKelasDetailModal";
import Button from "@/components/ui/Button";
import type { DosenKelasItem, DosenKelasPagination } from "@/features/dosen/types";

export default function DosenKelas() {
  const [kelasList, setKelasList] = useState<DosenKelasItem[]>([]);
  const [pagination, setPagination] = useState<DosenKelasPagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Selected class code for detail modal
  const [selectedCodeKelas, setSelectedCodeKelas] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchKelas() {
      setLoading(true);
      setError(null);

      const res = await getDaftarKelasDosen(currentPage);

      if (!isMounted) return;

      if (!res.status) {
        setError(res.message);
        setKelasList([]);
      } else {
        setKelasList(res.data.items);
        setPagination(res.data.pagination ?? null);
      }

      setLoading(false);
    }

    fetchKelas();

    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  function handleOpenDetail(codeKelas: string) {
    setSelectedCodeKelas(codeKelas);
    setIsDetailOpen(true);
  }

  function handleCloseDetail() {
    setIsDetailOpen(false);
    setSelectedCodeKelas(null);
  }

  const filteredKelas = kelasList.filter((k) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      k.nama_kelas.toLowerCase().includes(q) ||
      k.nama_matakuliah.toLowerCase().includes(q) ||
      k.kode_matakuliah.toLowerCase().includes(q) ||
      k.nama_program_studi.toLowerCase().includes(q)
    );
  });

  const totalSksDiampu = kelasList.reduce(
    (sum, k) => sum + k.sks_teori + k.sks_praktik,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Kelas Dosen</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Daftar kelas dan mata kuliah yang diampu
          </p>
        </div>

        {/* Search */}
        <div className="w-full sm:w-72">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari kelas atau mata kuliah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-600 focus:bg-white focus:ring-2 focus:ring-brand-100 transition"
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

      {/* Summary stats */}
      {!loading && kelasList.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 font-medium">Total Kelas</p>
            <p className="text-xl font-bold text-gray-800 mt-1">
              {pagination?.total ?? kelasList.length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 font-medium">Total SKS Diampu</p>
            <p className="text-xl font-bold text-brand-700 mt-1">
              {totalSksDiampu} SKS
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 font-medium">Tahun Akademik</p>
            <p className="text-sm font-bold text-gray-800 mt-2 truncate">
              {kelasList[0]?.tahun_akademik || "-"}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 font-medium">Program Studi</p>
            <p className="text-sm font-bold text-gray-800 mt-2 truncate">
              {kelasList[0]?.nama_program_studi || "-"}
            </p>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
        </div>
      )}

      {/* Classes Table */}
      {!loading && !error && (
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-left">
                  <th className="px-4 py-3.5 font-semibold text-gray-600 w-12 text-center">
                    No
                  </th>
                  <th className="px-4 py-3.5 font-semibold text-gray-600">
                    Kelas
                  </th>
                  <th className="px-4 py-3.5 font-semibold text-gray-600">
                    Mata Kuliah
                  </th>
                  <th className="px-4 py-3.5 font-semibold text-gray-600 text-center">
                    Semester
                  </th>
                  <th className="px-4 py-3.5 font-semibold text-gray-600 text-center">
                    SKS
                  </th>
                  <th className="px-4 py-3.5 font-semibold text-gray-600">
                    Tahun Akademik
                  </th>
                  <th className="px-4 py-3.5 font-semibold text-gray-600">
                    Tipe
                  </th>
                  <th className="px-4 py-3.5 font-semibold text-gray-600 text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredKelas.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-12 text-center text-gray-400"
                    >
                      {searchQuery
                        ? "Tidak ada kelas yang cocok dengan pencarian."
                        : "Belum ada daftar kelas mengajar."}
                    </td>
                  </tr>
                ) : (
                  filteredKelas.map((kelas, idx) => {
                    const totalSks = kelas.sks_teori + kelas.sks_praktik;
                    return (
                      <tr
                        key={kelas.code_mengajar || kelas.code_kelas}
                        className="hover:bg-gray-50/70 transition-colors"
                      >
                        <td className="px-4 py-3.5 text-gray-400 text-center">
                          {pagination
                            ? (pagination.current_page - 1) * pagination.per_page +
                              idx +
                              1
                            : idx + 1}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-gray-900">
                            {kelas.nama_kelas}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-800">
                              {kelas.nama_matakuliah}
                            </span>
                            <span className="font-mono text-xs text-brand-600">
                              {kelas.kode_matakuliah}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                            Sem {kelas.semester}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="text-xs font-semibold text-brand-800">
                            {totalSks} SKS
                          </span>
                          <span className="text-[10px] text-gray-400 block">
                            ({kelas.sks_teori}T / {kelas.sks_praktik}P)
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 text-xs">
                          {kelas.tahun_akademik}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              kelas.block
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {kelas.block ? "Blok" : "Reguler"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Button
                            type="button"
                            variant="soft"
                            size="sm"
                            onClick={() => handleOpenDetail(kelas.code_kelas)}
                            leftIcon={
                              <svg
                                className="h-3.5 w-3.5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            }
                          >
                            Lihat Kelas
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>
                Halaman {pagination.current_page} dari {pagination.last_page} (
                Total {pagination.total} kelas)
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Sebelumnya
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= pagination.last_page}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(pagination.last_page, p + 1))
                  }
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Kelas Modal */}
      {isDetailOpen && selectedCodeKelas && (
        <DosenKelasDetailModal
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          codeKelas={selectedCodeKelas}
        />
      )}
    </div>
  );
}
