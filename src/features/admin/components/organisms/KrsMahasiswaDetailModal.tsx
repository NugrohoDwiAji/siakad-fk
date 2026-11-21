import { useState, useEffect } from "react";
import { getStaffKrsDetail } from "@/features/admin/api/krs";
import type { StaffKrsDetailData } from "@/features/admin/types";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface KrsMahasiswaDetailModalProps {
  codeKrs: string;
  semester?: number | string;
  onClose: () => void;
}

// ─── Info Item ────────────────────────────────────────────────────────────────

function InfoItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-gray-400 font-medium">{label}</dt>
      <dd className="text-sm text-gray-800 font-semibold">{value || "-"}</dd>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function KrsMahasiswaDetailModal({
  codeKrs,
  semester,
  onClose,
}: KrsMahasiswaDetailModalProps) {
  const [data, setData] = useState<StaffKrsDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchDetail() {
      setLoading(true);
      setError(null);

      const result = await getStaffKrsDetail(codeKrs);
      if (cancelled) return;

      if (result.status && result.data) {
        setData(result.data);
      } else {
        setError(result.message || "Gagal mengambil detail KRS.");
      }
      setLoading(false);
    }

    fetchDetail();
    return () => {
      cancelled = true;
    };
  }, [codeKrs]);

  // Escape key handler
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const mahasiswa = data?.mahasiswa?.[0];
  const krsList = data?.krs || [];

  const totalSksTeori = krsList.reduce(
    (acc, item) => acc + (Number(item.sks_teori) || 0),
    0
  );
  const totalSksPraktik = krsList.reduce(
    (acc, item) => acc + (Number(item.sks_praktik) || 0),
    0
  );
  const totalSks = totalSksTeori + totalSksPraktik;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-gray-800">
                Detail KRS Mahasiswa
              </h2>
              {(mahasiswa?.semester || semester) && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                  Semester {mahasiswa?.semester || semester}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Rincian mata kuliah yang diambil mahasiswa pada semester ini
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
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

        {/* Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
              <p className="text-xs text-gray-400">Memuat detail KRS...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center">
              {error}
            </div>
          ) : data ? (
            <>
              {/* Mahasiswa Info Card */}
              {mahasiswa && (
                <div className="rounded-xl bg-gray-50/80 border border-gray-200/80 p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                    Informasi Mahasiswa
                  </h3>
                  <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <InfoItem label="NIM" value={mahasiswa.nim} />
                    <InfoItem
                      label="Nama Mahasiswa"
                      value={mahasiswa.nama_mahasiswa}
                    />
                    <InfoItem
                      label="Program Studi"
                      value={mahasiswa.nama_program_studi}
                    />
                    <InfoItem
                      label="Semester"
                      value={`Semester ${mahasiswa.semester}`}
                    />
                  </dl>
                </div>
              )}

              {/* Mata Kuliah Table */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-sm font-semibold text-gray-800">
                    Daftar Mata Kuliah
                  </h3>
                  <span className="text-xs font-medium text-gray-500">
                    {krsList.length} mata kuliah
                  </span>
                </div>

                <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200 font-semibold">
                          <th className="px-4 py-3 text-left w-12">No</th>
                          <th className="px-4 py-3 text-left w-28">Kode MK</th>
                          <th className="px-4 py-3 text-left">Mata Kuliah</th>
                          <th className="px-4 py-3 text-center w-24">SKS Teori</th>
                          <th className="px-4 py-3 text-center w-24">SKS Praktik</th>
                          <th className="px-4 py-3 text-center w-24">Total SKS</th>
                          <th className="px-4 py-3 text-center w-28">Tipe</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {krsList.length === 0 ? (
                          <tr>
                            <td
                              colSpan={7}
                              className="px-4 py-8 text-center text-gray-400 text-xs"
                            >
                              Tidak ada mata kuliah pada KRS ini.
                            </td>
                          </tr>
                        ) : (
                          krsList.map((item, idx) => {
                            const itemTotalSks =
                              (Number(item.sks_teori) || 0) +
                              (Number(item.sks_praktik) || 0);
                            return (
                              <tr
                                key={item.id || idx}
                                className="hover:bg-gray-50/70 transition-colors"
                              >
                                <td className="px-4 py-3 text-gray-500 text-xs">
                                  {idx + 1}
                                </td>
                                <td className="px-4 py-3 font-mono font-medium text-gray-700 text-xs">
                                  {item.kode_matakuliah}
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-800">
                                  {item.nama_matakuliah}
                                </td>
                                <td className="px-4 py-3 text-center text-gray-600">
                                  {item.sks_teori}
                                </td>
                                <td className="px-4 py-3 text-center text-gray-600">
                                  {item.sks_praktik}
                                </td>
                                <td className="px-4 py-3 text-center font-semibold text-brand-800">
                                  {itemTotalSks}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {item.block ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-700 border border-blue-200">
                                      Blok
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                      Reguler
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                      {krsList.length > 0 && (
                        <tfoot>
                          <tr className="bg-gray-50 border-t-2 border-gray-200 font-semibold text-gray-800 text-xs">
                            <td colSpan={3} className="px-4 py-3 text-right">
                              Total SKS Diambil:
                            </td>
                            <td className="px-4 py-3 text-center text-gray-700">
                              {totalSksTeori} Teori
                            </td>
                            <td className="px-4 py-3 text-center text-gray-700">
                              {totalSksPraktik} Praktik
                            </td>
                            <td className="px-4 py-3 text-center text-brand-800 font-bold text-sm">
                              {totalSks} SKS
                            </td>
                            <td className="px-4 py-3" />
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-gray-200 bg-gray-50/80 flex items-center justify-between shrink-0">
          <div className="text-xs text-gray-400 font-mono truncate max-w-sm">
            Kode KRS: {codeKrs}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 text-white hover:bg-gray-700 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
