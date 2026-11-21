import type { KhsEntry } from "@/features/mahasiswa/types";

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
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${color}`}>
      {value.toFixed(2)}
    </span>
  );
}

// ─── Grade Badge ────────────────────────────────────────────────────────────────

function GradeBadge({ grade }: { grade: string }) {
  const g = grade.toUpperCase();
  const colorMap: Record<string, string> = {
    A: "bg-green-100 text-green-700",
    "B+": "bg-blue-100 text-blue-700",
    B: "bg-blue-100 text-blue-600",
    "C+": "bg-amber-100 text-amber-700",
    C: "bg-amber-100 text-amber-600",
    D: "bg-orange-100 text-orange-700",
    E: "bg-red-100 text-red-700",
  };
  const color = colorMap[g] || "bg-gray-100 text-gray-600";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${color}`}>
      {grade}
    </span>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────────────

function EmptyState({ semester }: { semester?: number }) {
  return (
    <tr>
      <td colSpan={7} className="px-6 py-12 text-center">
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
          <p className="text-sm text-gray-400">
            {semester
              ? `Belum ada data KHS Semester ${semester}`
              : "Pilih semester untuk melihat KHS"}
          </p>
        </div>
      </td>
    </tr>
  );
}

function EmptyStateCard({ semester }: { semester?: number }) {
  return (
    <div className="flex flex-col items-center py-12 text-center">
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
      <p className="text-sm text-gray-400 mt-2">
        {semester
          ? `Belum ada data KHS Semester ${semester}`
          : "Pilih semester untuk melihat KHS"}
      </p>
    </div>
  );
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface KhsTableProps {
  data: KhsEntry[];
  semesterAktif?: number;
  onPrint?: (entry: KhsEntry) => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function KhsTable({ data, semesterAktif, onPrint }: KhsTableProps) {
  const entry = data.length > 0 ? data[0] : null;
  const mkList = entry?.mataKuliah || [];
  const totalSks = mkList.reduce((s, mk) => s + mk.sks, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* ── Header ── */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-800">
            {semesterAktif ? `KHS Semester ${semesterAktif}` : "Kartu Hasil Studi"}
          </h2>
          {entry && (
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <p className="text-xs text-gray-400">
                {entry.nim} &bull; {entry.nama} &bull; T.A. {entry.tahunAjaran}
              </p>
              <div className="flex items-center gap-1.5">
                <IpBadge value={entry.ipSemester} />
                <span className="text-xs text-gray-400">IPS</span>
              </div>
              <div className="flex items-center gap-1.5">
                <IpBadge value={entry.ipKumulatif} />
                <span className="text-xs text-gray-400">IPK</span>
              </div>
            </div>
          )}
        </div>
        {entry && (
          <button
            onClick={() => onPrint?.(entry)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print KHS
          </button>
        )}
      </div>

      {/* ── Table (desktop) ── */}
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-10">No</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-32">Kode MK (Blok)</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Mata Kuliah (Blok)</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-20 text-center">SKS</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-20 text-center">Grade</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-28 text-center">SKS Kumulatif</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-32">Keterangan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mkList.length === 0 ? (
              <EmptyState semester={semesterAktif} />
            ) : (
              <>
                {mkList.map((mk, index) => {
                  const sksKumulatif = mkList
                    .slice(0, index + 1)
                    .reduce((s, item) => s + item.sks, 0);

                  return (
                    <tr key={mk.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400 text-xs font-medium">{index + 1}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{mk.kodeMatakuliah}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-800 font-medium">{mk.namaMatakuliah}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{mk.sks}</td>
                      <td className="px-4 py-3 text-center"><GradeBadge grade={mk.grade} /></td>
                      <td className="px-4 py-3 text-center text-gray-600">{sksKumulatif}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${
                          mk.keterangan === "Lulus"
                            ? "text-green-600"
                            : mk.keterangan === "Tidak Lulus"
                              ? "text-red-600"
                              : "text-gray-600"
                        }`}>
                          {mk.keterangan}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-700">Total SKS</td>
                  <td className="px-4 py-3 text-center font-bold text-brand-600">{totalSks}</td>
                  <td colSpan={3}></td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Cards (mobile) ── */}
      <div className="md:hidden">
        {mkList.length === 0 ? (
          <EmptyStateCard semester={semesterAktif} />
        ) : (
          <div className="divide-y divide-gray-100">
            {mkList.map((mk, index) => {
              const sksKumulatif = mkList
                .slice(0, index + 1)
                .reduce((s, item) => s + item.sks, 0);

              return (
                <div key={mk.id} className="px-5 py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-medium">{index + 1}.</span>
                      <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{mk.kodeMatakuliah}</span>
                    </div>
                    <GradeBadge grade={mk.grade} />
                  </div>
                  <p className="text-sm text-gray-800 font-medium">{mk.namaMatakuliah}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">SKS: {mk.sks}</span>
                    <span className="text-xs text-gray-500">Kumulatif: {sksKumulatif}</span>
                    <span className={`text-xs font-medium ${
                      mk.keterangan === "Lulus"
                        ? "text-green-600"
                        : mk.keterangan === "Tidak Lulus"
                          ? "text-red-600"
                          : "text-gray-600"
                    }`}>
                      {mk.keterangan}
                    </span>
                  </div>
                </div>
              );
            })}
            <div className="px-5 py-3 bg-gray-50 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase">Total SKS</span>
              <span className="text-sm font-bold text-brand-600">{totalSks}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
