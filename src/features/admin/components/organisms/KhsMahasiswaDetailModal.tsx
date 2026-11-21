import { useState, useEffect } from "react";
import { getStaffKhsDetail } from "@/features/admin/api/khs";
import type { StaffKhsDetailData } from "@/features/admin/types";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface KhsMahasiswaDetailModalProps {
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

// ─── Grade Badge ──────────────────────────────────────────────────────────────

function GradeBadge({ grade }: { grade: string }) {
  const g = (grade || "").toUpperCase();
  let color = "bg-gray-100 text-gray-700 border-gray-200";

  if (g.startsWith("A")) {
    color = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (g.startsWith("B")) {
    color = "bg-blue-50 text-blue-700 border-blue-200";
  } else if (g.startsWith("C")) {
    color = "bg-amber-50 text-amber-700 border-amber-200";
  } else if (g.startsWith("D") || g.startsWith("E")) {
    color = "bg-red-50 text-red-700 border-red-200";
  }

  return (
    <span
      className={`inline-flex items-center justify-center min-w-7 px-2 py-0.5 rounded-full text-xs font-bold border ${color}`}
    >
      {grade || "-"}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function KhsMahasiswaDetailModal({
  codeKrs,
  semester,
  onClose,
}: KhsMahasiswaDetailModalProps) {
  const [data, setData] = useState<StaffKhsDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchDetail() {
      setLoading(true);
      setError(null);

      const result = await getStaffKhsDetail(codeKrs);
      if (cancelled) return;

      if (result.status && result.data) {
        setData(result.data);
      } else {
        setError(result.message || "Gagal mengambil detail KHS.");
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
  const khsList = data?.khs || [];

  // Totals & IPS calculation
  const totalSksTeori = khsList.reduce(
    (acc, item) => acc + (Number(item.sks_teori) || 0),
    0
  );
  const totalSksPraktik = khsList.reduce(
    (acc, item) => acc + (Number(item.sks_praktik) || 0),
    0
  );
  const totalSks = totalSksTeori + totalSksPraktik;

  const totalMutu = khsList.reduce((acc, item) => {
    const itemSks =
      (Number(item.sks_teori) || 0) + (Number(item.sks_praktik) || 0);
    const score = Number(item.score) || 0;
    return acc + itemSks * score;
  }, 0);

  const ips = totalSks > 0 ? (totalMutu / totalSks).toFixed(2) : "0.00";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-gray-800">
                Detail KHS Mahasiswa
              </h2>
              {(mahasiswa?.semester || semester) && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                  Semester {mahasiswa?.semester || semester}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Rincian nilai dan hasil studi mahasiswa pada semester ini
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
              <p className="text-xs text-gray-400">Memuat detail KHS...</p>
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

              {/* Summary Stats Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl bg-blue-50/60 border border-blue-100 p-3.5">
                  <span className="text-[11px] font-medium text-blue-600 uppercase tracking-wider">
                    Total SKS Diambil
                  </span>
                  <p className="text-xl font-bold text-blue-900 mt-1">
                    {totalSks}{" "}
                    <span className="text-xs font-normal text-blue-600">
                      SKS
                    </span>
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-50/60 border border-emerald-100 p-3.5">
                  <span className="text-[11px] font-medium text-emerald-600 uppercase tracking-wider">
                    Indeks Prestasi Semester
                  </span>
                  <p className="text-xl font-bold text-emerald-900 mt-1">
                    {ips}
                  </p>
                </div>
                <div className="rounded-xl bg-purple-50/60 border border-purple-100 p-3.5">
                  <span className="text-[11px] font-medium text-purple-600 uppercase tracking-wider">
                    Total Mutu (SKS x Bobot)
                  </span>
                  <p className="text-xl font-bold text-purple-900 mt-1">
                    {totalMutu.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-xl bg-amber-50/60 border border-amber-100 p-3.5">
                  <span className="text-[11px] font-medium text-amber-600 uppercase tracking-wider">
                    Mata Kuliah
                  </span>
                  <p className="text-xl font-bold text-amber-900 mt-1">
                    {khsList.length}{" "}
                    <span className="text-xs font-normal text-amber-600">
                      MK
                    </span>
                  </p>
                </div>
              </div>

              {/* Nilai Mata Kuliah Table */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-sm font-semibold text-gray-800">
                    Daftar Nilai Mata Kuliah
                  </h3>
                  <span className="text-xs font-medium text-gray-500">
                    {khsList.length} mata kuliah
                  </span>
                </div>

                <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200 font-semibold">
                          <th className="px-3.5 py-3 text-left w-12">No</th>
                          <th className="px-3.5 py-3 text-left w-24">Kode MK</th>
                          <th className="px-3.5 py-3 text-left">Mata Kuliah</th>
                          <th className="px-3.5 py-3 text-center w-20">SKS T</th>
                          <th className="px-3.5 py-3 text-center w-20">SKS P</th>
                          <th className="px-3.5 py-3 text-center w-20">Total</th>
                          <th className="px-3.5 py-3 text-center w-24">Tipe</th>
                          <th className="px-3.5 py-3 text-center w-24">Nilai</th>
                          <th className="px-3.5 py-3 text-center w-20">Grade</th>
                          <th className="px-3.5 py-3 text-center w-20">Bobot</th>
                          <th className="px-3.5 py-3 text-center w-24">Mutu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {khsList.length === 0 ? (
                          <tr>
                            <td
                              colSpan={11}
                              className="px-4 py-8 text-center text-gray-400 text-xs"
                            >
                              Tidak ada data nilai pada KHS ini.
                            </td>
                          </tr>
                        ) : (
                          khsList.map((item, idx) => {
                            const itemTotalSks =
                              (Number(item.sks_teori) || 0) +
                              (Number(item.sks_praktik) || 0);
                            const itemScore = Number(item.score) || 0;
                            const itemMutu = itemTotalSks * itemScore;

                            return (
                              <tr
                                key={item.id || idx}
                                className="hover:bg-gray-50/70 transition-colors"
                              >
                                <td className="px-3.5 py-3 text-gray-500 text-xs">
                                  {idx + 1}
                                </td>
                                <td className="px-3.5 py-3 font-mono font-medium text-gray-700 text-xs">
                                  {item.kode_matakuliah}
                                </td>
                                <td className="px-3.5 py-3 font-medium text-gray-800">
                                  {item.nama_matakuliah}
                                </td>
                                <td className="px-3.5 py-3 text-center text-gray-600">
                                  {item.sks_teori}
                                </td>
                                <td className="px-3.5 py-3 text-center text-gray-600">
                                  {item.sks_praktik}
                                </td>
                                <td className="px-3.5 py-3 text-center font-semibold text-brand-800">
                                  {itemTotalSks}
                                </td>
                                <td className="px-3.5 py-3 text-center">
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
                                <td className="px-3.5 py-3 text-center font-semibold text-gray-800">
                                  {item.nilai_akhir !== undefined &&
                                  item.nilai_akhir !== null
                                    ? Number(item.nilai_akhir).toFixed(1)
                                    : "-"}
                                </td>
                                <td className="px-3.5 py-3 text-center">
                                  <GradeBadge grade={item.grade} />
                                </td>
                                <td className="px-3.5 py-3 text-center text-gray-700 font-medium">
                                  {item.score !== undefined &&
                                  item.score !== null
                                    ? Number(item.score).toFixed(2)
                                    : "-"}
                                </td>
                                <td className="px-3.5 py-3 text-center font-semibold text-gray-900">
                                  {itemMutu.toFixed(2)}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                      {khsList.length > 0 && (
                        <tfoot>
                          <tr className="bg-gray-50 border-t-2 border-gray-200 font-semibold text-gray-800 text-xs">
                            <td colSpan={3} className="px-3.5 py-3 text-right">
                              Total / Rata-rata:
                            </td>
                            <td className="px-3.5 py-3 text-center text-gray-700">
                              {totalSksTeori} T
                            </td>
                            <td className="px-3.5 py-3 text-center text-gray-700">
                              {totalSksPraktik} P
                            </td>
                            <td className="px-3.5 py-3 text-center text-brand-800 font-bold text-sm">
                              {totalSks} SKS
                            </td>
                            <td colSpan={2} className="px-3.5 py-3" />
                            <td className="px-3.5 py-3 text-center text-gray-500 text-[11px]">
                              IPS:
                            </td>
                            <td className="px-3.5 py-3 text-center font-bold text-emerald-700 text-sm">
                              {ips}
                            </td>
                            <td className="px-3.5 py-3 text-center font-bold text-gray-900">
                              {totalMutu.toFixed(2)}
                            </td>
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
            Kode KRS/KHS: {codeKrs}
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
