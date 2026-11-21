import type { KrsApiResponse, KrsDetailItem, StatusValidasi } from "@/features/mahasiswa/types";

// ─── Validation Badge ──────────────────────────────────────────────────────────

function ValidationBadge({ label, status }: { label: string; status: StatusValidasi }) {
  const config: Record<StatusValidasi, { bg: string; text: string; dot: string; display: string }> = {
    Tervalidasi: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500", display: "Tervalidasi" },
    Menunggu: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", display: "Menunggu" },
    Ditolak: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", display: "Ditolak" },
  };
  const c = config[status];
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-blue-600 font-medium">{label}:</span>
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
        {c.display}
      </span>
    </div>
  );
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface KrsTableProps {
  data: KrsApiResponse | null;
  semesterAktif?: number;
  onEdit?: () => void;
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ semester }: { semester?: number }) {
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
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
            />
          </svg>
          <p className="text-sm text-gray-400">
            {semester
              ? `Belum ada data KRS Semester ${semester}`
              : "Pilih semester untuk melihat KRS"}
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
          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
        />
      </svg>
      <p className="text-sm text-gray-400 mt-2">
        {semester
          ? `Belum ada data KRS Semester ${semester}`
          : "Pilih semester untuk melihat KRS"}
      </p>
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function KrsTable({ data, semesterAktif, onEdit }: KrsTableProps) {
  const krs = data?.krs;
  const mkList: KrsDetailItem[] = krs?.detail || [];
  const totalSksTeori = mkList.reduce((s, mk) => s + mk.sks_teori, 0);
  const totalSksPraktik = mkList.reduce((s, mk) => s + mk.sks_praktik, 0);
  const totalSks = mkList.reduce((s, mk) => s + mk.sks_teori + mk.sks_praktik, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* ── Header ── */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-800">
            {semesterAktif ? `KRS Semester ${semesterAktif}` : "Kartu Rencana Studi"}
          </h2>
          {data?.mahasiswa && (
            <p className="text-xs text-gray-400 mt-0.5">
              {data.mahasiswa.nim} &bull; {data.mahasiswa.nama_mahasiswa} &bull; {data.mahasiswa.nama_program_studi}
            </p>
          )}
        </div>
        {krs && onEdit && (
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-600 text-white hover:bg-brand-700 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
        )}
      </div>

      {/* ── SKS Info ── */}
      {krs && (
        <div className="px-5 py-3 bg-blue-50 border-b border-blue-100 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-600 font-medium">Tahun Akademik:</span>
            <span className="text-sm font-semibold text-blue-800">{krs.tahun_akademik}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-600 font-medium">SKS Limit:</span>
            <span className="text-sm font-semibold text-blue-800">{krs.sks_limit}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-600 font-medium">SKS Terpakai:</span>
            <span className="text-sm font-semibold text-blue-800">{krs.sks_terpakai}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-600 font-medium">SKS Tersisa:</span>
            <span className="text-sm font-semibold text-green-700">{krs.sks_tersisa}</span>
          </div>
          <div className="h-4 w-px bg-blue-200" />
          <ValidationBadge label="Dosen" status={data?.validasi?.dosen_wali || "Menunggu"} />
          <ValidationBadge label="Keuangan" status={data?.validasi?.keuangan || "Menunggu"} />
        </div>
      )}

      {/* ── Table (desktop) ── */}
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-10">No</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-32">Kode</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Mata Kuliah</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-24 text-center">SKS Teori</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-24 text-center">SKS Praktik</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-20 text-center">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mkList.length === 0 ? (
              <EmptyState semester={semesterAktif} />
            ) : (
              <>
                {mkList.map((mk, index) => (
                  <tr key={mk.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-400 text-xs font-medium">{index + 1}</td>
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{mk.kode_matakuliah}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-800 font-medium">{mk.nama_matakuliah}</td>
                    <td className="px-5 py-3 text-center text-gray-600">{mk.sks_teori}</td>
                    <td className="px-5 py-3 text-center text-gray-600">{mk.sks_praktik}</td>
                    <td className="px-5 py-3 text-center font-semibold text-gray-800">{mk.sks_teori + mk.sks_praktik}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td colSpan={3} className="px-5 py-3 text-right font-semibold text-gray-700">Total</td>
                  <td className="px-5 py-3 text-center font-bold text-gray-800">{totalSksTeori}</td>
                  <td className="px-5 py-3 text-center font-bold text-gray-800">{totalSksPraktik}</td>
                  <td className="px-5 py-3 text-center font-bold text-brand-600">{totalSks}</td>
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
            {mkList.map((mk, index) => (
              <div key={mk.id} className="px-5 py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-medium">{index + 1}.</span>
                    <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{mk.kode_matakuliah}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{mk.sks_teori + mk.sks_praktik} SKS</span>
                </div>
                <p className="text-sm text-gray-800 font-medium">{mk.nama_matakuliah}</p>
                <div className="flex gap-2">
                  <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-medium">T: {mk.sks_teori}</span>
                  <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">P: {mk.sks_praktik}</span>
                </div>
              </div>
            ))}
            <div className="px-5 py-3 bg-gray-50 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase">Total</span>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-700">T: {totalSksTeori}</span>
                <span className="text-xs font-bold text-gray-700">P: {totalSksPraktik}</span>
                <span className="text-sm font-bold text-brand-600">{totalSks} SKS</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
