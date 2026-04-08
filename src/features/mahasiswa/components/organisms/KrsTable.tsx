import type { KrsEntry } from "../../types/mahasiswa";
import KrsValidasi from "../moleculs/KrsValidasi";
import KrsActions from "../moleculs/KrsActions";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface KrsTableProps {
  data: KrsEntry[];
  onDetail?: (entry: KrsEntry) => void;
  onPrint?: (entry: KrsEntry) => void;
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <tr>
      <td colSpan={5} className="px-6 py-12 text-center">
        <div className="flex flex-col items-center gap-2">
          <svg
            className="h-10 w-10 text-gray-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
            />
          </svg>
          <p className="text-sm text-gray-400">Belum ada data KRS</p>
        </div>
      </td>
    </tr>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function KrsTable({ data, onDetail, onPrint }: KrsTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* ── Table header ── */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-800">Daftar KRS</h2>
          <p className="text-xs text-gray-400 mt-0.5">{data.length} data ditemukan</p>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-10">
                No
              </th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-36">
                NIM
              </th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Nama
              </th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-44">
                KRS
              </th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-48">
                Validasi
              </th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-40">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <EmptyState />
            ) : (
              data.map((entry, index) => (
                <tr
                  key={entry.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Nomor */}
                  <td className="px-5 py-4 text-gray-400 text-xs font-medium">
                    {index + 1}
                  </td>

                  {/* NIM */}
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                      {entry.nim}
                    </span>
                  </td>

                  {/* Nama */}
                  <td className="px-5 py-4 text-gray-800 font-medium">
                    {entry.nama}
                  </td>

                  {/* KRS — Semester & tahun ajaran */}
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-semibold text-gray-800 leading-tight">
                        Semester {entry.semester}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        T.A. {entry.tahunAjaran}
                      </p>
                      <p className="text-xs text-brand-600 mt-0.5 font-medium">
                        {entry.totalSks} SKS
                      </p>
                    </div>
                  </td>

                  {/* Validasi */}
                  <td className="px-5 py-4">
                    <KrsValidasi
                      dosenWali={entry.validasi.dosenWali}
                      keuangan={entry.validasi.keuangan}
                    />
                  </td>

                  {/* Action */}
                  <td className="px-5 py-4">
                    <KrsActions
                      onDetail={() => onDetail?.(entry)}
                      onPrint={() => onPrint?.(entry)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
