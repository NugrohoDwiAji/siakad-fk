import type { KhsEntry } from "../../types/mahasiswa";
import KrsActions from "../moleculs/KrsActions";

// ─── IP Badge ───────────────────────────────────────────────────────────────────

function IpBadge({ value }: { value: number }) {
  const color =
    value >= 3.5
      ? "bg-green-100 text-green-700"
      : value >= 3.0
      ? "bg-blue-100 text-blue-700"
      : value >= 2.5
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-700";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${color}`}
    >
      {value.toFixed(2)}
    </span>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <tr>
      <td colSpan={6} className="px-6 py-12 text-center">
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
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
          <p className="text-sm text-gray-400">Belum ada data KHS</p>
        </div>
      </td>
    </tr>
  );
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface KhsTableProps {
  data: KhsEntry[];
  onDetail?: (entry: KhsEntry) => void;
  onPrint?: (entry: KhsEntry) => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function KhsTable({ data, onDetail, onPrint }: KhsTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* ── Card header ── */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-800">Daftar KHS</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {data.length} data ditemukan
          </p>
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
                Tahun Ajaran
              </th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-32 text-center">
                Semester
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
                  {/* No */}
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

                  {/* Tahun Ajaran */}
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-semibold text-gray-800 leading-tight">
                        T.A. {entry.tahunAjaran}
                      </p>
                      <p className="text-xs text-brand-600 mt-0.5 font-medium">
                        {entry.totalSks} SKS
                      </p>
                    </div>
                  </td>

                  {/* Semester + IP */}
                  <td className="px-5 py-4 text-center">
                    <p className="font-semibold text-gray-800">
                      Sem. {entry.semester}
                    </p>
                    <div className="flex items-center justify-center gap-1.5 mt-1">
                      <IpBadge value={entry.ipSemester} />
                      <span className="text-xs text-gray-400">IPS</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 mt-0.5">
                      <IpBadge value={entry.ipKumulatif} />
                      <span className="text-xs text-gray-400">IPK</span>
                    </div>
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
