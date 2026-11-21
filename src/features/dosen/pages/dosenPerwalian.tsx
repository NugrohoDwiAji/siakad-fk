import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getPerwalianDosen } from "@/features/dosen/api/perwalian";
import { useDosenAuthStore } from "@/features/dosen/stores/dosenAuthStore";
import DosenPerwalianKrsModal from "@/features/dosen/components/organisms/DosenPerwalianKrsModal";
import DosenValidasiKrsModal from "@/features/dosen/components/organisms/DosenValidasiKrsModal";
import type {
  DosenPerwalianItem,
  DosenValidasiKrsData,
} from "@/features/dosen/types";

export default function DosenPerwalian() {
  const user = useDosenAuthStore((state) => state.user);
  const [semester, setSemester] = useState(1);
  const [data, setData] = useState<DosenPerwalianItem[]>([]);
  const [jumlah, setJumlah] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selected item for KRS detail modal
  const [selectedKrsItem, setSelectedKrsItem] = useState<DosenPerwalianItem | null>(null);
  const [isKrsModalOpen, setIsKrsModalOpen] = useState(false);

  // Selected item for Validasi modal
  const [selectedValidasiItem, setSelectedValidasiItem] = useState<DosenPerwalianItem | null>(null);
  const [isValidasiModalOpen, setIsValidasiModalOpen] = useState(false);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    if (!user?.code) return;

    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      const result = await getPerwalianDosen(semester);

      if (cancelled) return;

      if (!result.status) {
        setError(`Gagal mengambil data: ${result.message}`);
        setData([]);
        setJumlah(0);
      } else {
        setData(result.data.perwalian);
        setJumlah(result.data.jumlah);
      }

      setLoading(false);
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [user?.code, semester]);

  function handleOpenKrsDetail(item: DosenPerwalianItem) {
    setSelectedKrsItem(item);
    setIsKrsModalOpen(true);
  }

  function handleCloseKrsModal() {
    setIsKrsModalOpen(false);
    setSelectedKrsItem(null);
  }

  function handleOpenValidasi(item: DosenPerwalianItem) {
    setSelectedValidasiItem(item);
    setIsValidasiModalOpen(true);
  }

  function handleCloseValidasi() {
    setIsValidasiModalOpen(false);
    setSelectedValidasiItem(null);
  }

  function handleValidasiSuccess(resData: DosenValidasiKrsData) {
    setData((prev) =>
      prev.map((item) => {
        if (
          item.nim === resData.nim ||
          item.code === resData.code_perwalian_krs_validasi ||
          item.code_mahasiswa === resData.code_perwalian_krs_validasi
        ) {
          return {
            ...item,
            status_krs: resData.status_krs as "A" | "N",
            catatan: resData.catatan,
          };
        }
        return item;
      })
    );

    setToastMessage(
      `Validasi KRS untuk NIM ${resData.nim} berhasil disimpan (${
        resData.status_krs === "A" ? "Disetujui" : "Ditolak"
      }).`
    );
  }

  const noCode = !user?.code;

  return (
    <div className="space-y-4 p-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <svg
              className="h-5 w-5 text-green-600 shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-green-600 hover:text-green-800 p-1 rounded-md transition-colors"
            aria-label="Tutup notifikasi"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Perwalian</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {loading ? "Memuat data..." : `${jumlah} mahasiswa bimbingan`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="semester" className="text-sm text-gray-600">
            Semester
          </label>
          <select
            id="semester"
            value={semester}
            onChange={(e) => setSemester(Number(e.target.value))}
            className="rounded-lg border border-gray-200 bg-gray-50 py-2 pl-3 pr-8 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {(error || noCode) && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm">
          {noCode ? "Gagal mengambil data: sesi tidak valid." : error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
        </div>
      )}

      {/* Table */}
      {!loading && !error && !noCode && (
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 w-12">
                    No
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    NIM
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    Nama Mahasiswa
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    Dosen Wali
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    Dosen Perwakilan
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600 w-36">
                    Validasi
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600 w-44">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-gray-400"
                    >
                      Tidak ada data perwalian.
                    </td>
                  </tr>
                ) : (
                  data.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                        {item.nim}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {item.nama_mahasiswa}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {item.nama_dosen}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {item.nama_dosen_perwakilan || "-"}
                      </td>

                      {/* Validasi Column */}
                      <td className="px-4 py-3 text-center">
                        {item.status_krs === "A" ? (
                          <button
                            type="button"
                            onClick={() => handleOpenValidasi(item)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 hover:bg-green-200 transition-colors cursor-pointer"
                            title={
                              item.catatan
                                ? `Catatan: ${item.catatan}`
                                : "KRS Disetujui (Klik untuk ubah)"
                            }
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            <span>Disetujui</span>
                          </button>
                        ) : item.status_krs === "N" ? (
                          <button
                            type="button"
                            onClick={() => handleOpenValidasi(item)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-colors cursor-pointer"
                            title={
                              item.catatan
                                ? `Catatan: ${item.catatan}`
                                : "KRS Ditolak (Klik untuk ubah)"
                            }
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                            <span>Ditolak</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenValidasi(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                            title="Klik untuk memvalidasi KRS"
                          >
                            <svg
                              className="h-3.5 w-3.5 text-amber-600"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            <span>Validasi</span>
                          </button>
                        )}
                      </td>

                      {/* Aksi Column */}
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {/* Button Detail KRS */}
                          <button
                            type="button"
                            onClick={() => handleOpenKrsDetail(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-md transition-colors"
                            title={`Lihat detail KRS ${item.nama_mahasiswa}`}
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
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                              <polyline points="10 9 9 9 8 9" />
                            </svg>
                            <span>Detail</span>
                          </button>

                          {/* Link to Kurikulum Mahasiswa */}
                          <Link
                            to={`/dosen/kurikulum?code_mahasiswa=${encodeURIComponent(
                              item.code_mahasiswa || item.code
                            )}&nim=${encodeURIComponent(
                              item.nim
                            )}&nama=${encodeURIComponent(item.nama_mahasiswa)}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                            title={`Lihat kurikulum ${item.nama_mahasiswa}`}
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
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail KRS Modal */}
      {isKrsModalOpen && selectedKrsItem && (
        <DosenPerwalianKrsModal
          isOpen={isKrsModalOpen}
          onClose={handleCloseKrsModal}
          code={selectedKrsItem.code}
          namaMahasiswa={selectedKrsItem.nama_mahasiswa}
          nim={selectedKrsItem.nim}
          onOpenValidasi={() => {
            const itemToValidate = selectedKrsItem;
            handleCloseKrsModal();
            handleOpenValidasi(itemToValidate);
          }}
        />
      )}

      {/* Validasi KRS Modal */}
      {isValidasiModalOpen && selectedValidasiItem && (
        <DosenValidasiKrsModal
          isOpen={isValidasiModalOpen}
          onClose={handleCloseValidasi}
          item={selectedValidasiItem}
          onSuccess={handleValidasiSuccess}
        />
      )}
    </div>
  );
}
