import { useState, useEffect } from "react";
import { getDetailKrsPerwalian } from "@/features/dosen/api/perwalian";
import Button from "@/components/ui/Button";
import type { DosenPerwalianKrsData } from "@/features/dosen/types";

interface DosenPerwalianKrsModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string | null;
  namaMahasiswa?: string;
  nim?: string;
  onOpenValidasi?: () => void;
}

export default function DosenPerwalianKrsModal({
  isOpen,
  onClose,
  code,
  namaMahasiswa,
  nim,
  onOpenValidasi,
}: DosenPerwalianKrsModalProps) {
  const [data, setData] = useState<DosenPerwalianKrsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !code) {
      return;
    }

    let isMounted = true;
    async function fetchDetail() {
      setLoading(true);
      setError(null);

      const res = await getDetailKrsPerwalian(code!);
      if (!isMounted) return;

      if (!res.status) {
        setError(res.message);
        setData(null);
      } else {
        setData(res.data);
      }

      setLoading(false);
    }

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [isOpen, code]);

  // Handle ESC key press
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

  const mhs = Array.isArray(data?.mahasiswa)
    ? data?.mahasiswa[0]
    : undefined;

  const krsList = data?.krs || [];
  const totalTeori = krsList.reduce((acc, k) => acc + (k.sks_teori || 0), 0);
  const totalPraktik = krsList.reduce((acc, k) => acc + (k.sks_praktik || 0), 0);
  const totalSks = totalTeori + totalPraktik;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-xs transition-opacity"
      aria-modal="true"
      role="dialog"
      aria-labelledby="detail-krs-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] transition-all">
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
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div>
              <h2
                id="detail-krs-title"
                className="text-lg font-bold text-gray-900 leading-tight"
              >
                Detail KRS Mahasiswa
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {mhs
                  ? `${mhs.nama_mahasiswa} • ${mhs.nim} • Semester ${mhs.semester}`
                  : namaMahasiswa
                  ? `${namaMahasiswa} • ${nim || "-"}`
                  : "Memuat informasi KRS..."}
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
          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-brand-600 mb-3" />
              <p className="text-sm">Memuat detail KRS mahasiswa...</p>
            </div>
          )}

          {/* Error display */}
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
                <p className="font-semibold">Gagal memuat detail KRS</p>
                <p className="text-xs mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Content */}
          {data && !loading && (
            <>
              {/* Mahasiswa Info Card */}
              {mhs && (
                <div className="bg-brand-50/60 border border-brand-100 rounded-2xl p-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <span className="text-xs text-gray-400 font-medium">
                        Nama Mahasiswa
                      </span>
                      <p className="text-sm font-bold text-gray-800 mt-0.5">
                        {mhs.nama_mahasiswa}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-medium">
                        NIM
                      </span>
                      <p className="text-sm font-mono font-semibold text-brand-700 mt-0.5">
                        {mhs.nim}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-medium">
                        Program Studi
                      </span>
                      <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">
                        {mhs.nama_program_studi}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-medium">
                        Semester
                      </span>
                      <p className="text-sm font-semibold text-gray-800 mt-0.5">
                        Semester {mhs.semester}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-2xs">
                  <p className="text-[11px] text-gray-400 font-medium">
                    Total Mata Kuliah
                  </p>
                  <p className="text-lg font-bold text-gray-800 mt-0.5">
                    {krsList.length} MK
                  </p>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-2xs">
                  <p className="text-[11px] text-gray-400 font-medium">
                    Rincian SKS (T / P)
                  </p>
                  <p className="text-lg font-bold text-blue-700 mt-0.5">
                    {totalTeori} <span className="text-xs font-normal text-gray-400">/</span> {totalPraktik} SKS
                  </p>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-2xs">
                  <p className="text-[11px] text-gray-400 font-medium">
                    Total Beban Studi
                  </p>
                  <p className="text-lg font-bold text-brand-700 mt-0.5">
                    {totalSks} SKS
                  </p>
                </div>
              </div>

              {/* KRS Table */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Daftar Rencana Studi (KRS)
                </h3>
                <div className="rounded-xl border border-gray-100 overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-100 text-left">
                          <th className="px-4 py-2.5 font-semibold text-gray-500 w-12 text-center">
                            No
                          </th>
                          <th className="px-4 py-2.5 font-semibold text-gray-500 w-28">
                            Kode MK
                          </th>
                          <th className="px-4 py-2.5 font-semibold text-gray-500">
                            Nama Mata Kuliah
                          </th>
                          <th className="px-4 py-2.5 font-semibold text-gray-500 text-center w-20">
                            Teori
                          </th>
                          <th className="px-4 py-2.5 font-semibold text-gray-500 text-center w-20">
                            Praktik
                          </th>
                          <th className="px-4 py-2.5 font-semibold text-gray-500 text-center w-24">
                            Total SKS
                          </th>
                          <th className="px-4 py-2.5 font-semibold text-gray-500 text-center w-24">
                            Tipe
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {krsList.length === 0 ? (
                          <tr>
                            <td
                              colSpan={7}
                              className="px-4 py-8 text-center text-gray-400 text-xs"
                            >
                              Tidak ada mata kuliah dalam KRS ini.
                            </td>
                          </tr>
                        ) : (
                          krsList.map((item, idx) => {
                            const mkTotal = item.sks_teori + item.sks_praktik;
                            return (
                              <tr
                                key={item.id || item.code}
                                className="hover:bg-gray-50/70 transition-colors"
                              >
                                <td className="px-4 py-3 text-gray-400 text-center">
                                  {idx + 1}
                                </td>
                                <td className="px-4 py-3 font-mono font-medium text-brand-700">
                                  {item.kode_matakuliah}
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-900">
                                  {item.nama_matakuliah}
                                </td>
                                <td className="px-4 py-3 text-center text-gray-600">
                                  {item.sks_teori}
                                </td>
                                <td className="px-4 py-3 text-center text-gray-600">
                                  {item.sks_praktik}
                                </td>
                                <td className="px-4 py-3 text-center font-bold text-gray-900">
                                  {mkTotal}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                      item.block
                                        ? "bg-purple-100 text-purple-700"
                                        : "bg-blue-100 text-blue-700"
                                    }`}
                                  >
                                    {item.block ? "Blok" : "Reguler"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                      <tfoot>
                        <tr className="bg-brand-50/60 border-t border-brand-100 font-semibold text-brand-900">
                          <td colSpan={3} className="px-4 py-2.5 text-right">
                            Total SKS:
                          </td>
                          <td className="px-4 py-2.5 text-center text-blue-700">
                            {totalTeori}
                          </td>
                          <td className="px-4 py-2.5 text-center text-amber-700">
                            {totalPraktik}
                          </td>
                          <td className="px-4 py-2.5 text-center text-brand-800 font-bold">
                            {totalSks}
                          </td>
                          <td className="px-4 py-2.5" />
                        </tr>
                      </tfoot>
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
            {krsList.length > 0 ? `${krsList.length} mata kuliah terdaftar` : ""}
          </span>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Tutup
            </Button>
            {onOpenValidasi && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={onOpenValidasi}
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
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                }
              >
                Validasi KRS
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
