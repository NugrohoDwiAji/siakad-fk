import type { SemesterKurikulum } from "@/features/mahasiswa/types";

// ─── Grade Helpers ─────────────────────────────────────────────────────────────

function getGrade(nilai: string): string {
  const n = Number(nilai);
  if (n >= 85) return "A";
  if (n >= 80) return "B+";
  if (n >= 75) return "B";
  if (n >= 70) return "C+";
  if (n >= 65) return "C";
  if (n >= 50) return "D";
  return "E";
}

function getKeterangan(nilai: string): string {
  return Number(nilai) >= 65 ? "Lulus" : "Tidak Lulus";
}

// ─── Badge Components ──────────────────────────────────────────────────────────

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

// ─── Props ─────────────────────────────────────────────────────────────────────

interface PetikanNilaiTableProps {
  data: SemesterKurikulum;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function PetikanNilaiTable({ data }: PetikanNilaiTableProps) {
  const mkList = data.matakuliah;
  const totalSksTeori = mkList.reduce((s, mk) => s + mk.sksTeori, 0);
  const totalSksPraktik = mkList.reduce((s, mk) => s + mk.sksPraktik, 0);
  const totalSks = totalSksTeori + totalSksPraktik;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* ── Header ── */}
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">
          Semester {data.semester} — {data.totalSks} SKS
        </h3>
      </div>

      {/* ── Table (desktop) ── */}
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-10">No</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-32">Kode MK</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Mata Kuliah</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-20 text-center">SKS Teori</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-24 text-center">SKS Praktik</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-20 text-center">Total</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-24 text-center">Nilai</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-20 text-center">Grade</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-28">Keterangan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mkList.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-sm text-gray-400">
                  Belum ada data mata kuliah
                </td>
              </tr>
            ) : (
              <>
                {mkList.map((mk, index) => {
                  const nilai = mk.nilai.length > 0 ? mk.nilai[0] : null;
                  const nilaiAkhir = nilai ? String(nilai.nilaiAkhir) : "-";
                  const grade = nilai ? getGrade(nilaiAkhir) : "-";
                  const keterangan = nilai ? getKeterangan(nilaiAkhir) : "-";
                  const sksTotal = mk.sksTeori + mk.sksPraktik;

                  return (
                    <tr key={`${mk.kodeMatakuliah}-${index}`} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400 text-xs font-medium">{index + 1}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{mk.kodeMatakuliah}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-800 font-medium">{mk.namaMatakuliah}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{mk.sksTeori}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{mk.sksPraktik}</td>
                      <td className="px-4 py-3 text-center font-semibold text-gray-800">{sksTotal}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{nilaiAkhir}</td>
                      <td className="px-4 py-3 text-center">
                        {grade !== "-" ? <GradeBadge grade={grade} /> : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${
                          keterangan === "Lulus"
                            ? "text-green-600"
                            : keterangan === "Tidak Lulus"
                              ? "text-red-600"
                              : "text-gray-400"
                        }`}>
                          {keterangan}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-700">Total</td>
                  <td className="px-4 py-3 text-center font-bold text-gray-800">{totalSksTeori}</td>
                  <td className="px-4 py-3 text-center font-bold text-gray-800">{totalSksPraktik}</td>
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
          <div className="px-6 py-8 text-center text-sm text-gray-400">
            Belum ada data mata kuliah
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {mkList.map((mk, index) => {
              const nilai = mk.nilai.length > 0 ? mk.nilai[0] : null;
              const nilaiAkhir = nilai ? String(nilai.nilaiAkhir) : "-";
              const grade = nilai ? getGrade(nilaiAkhir) : "-";
              const keterangan = nilai ? getKeterangan(nilaiAkhir) : "-";
              const sksTotal = mk.sksTeori + mk.sksPraktik;

              return (
                <div key={`${mk.kodeMatakuliah}-${index}`} className="px-5 py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-medium">{index + 1}.</span>
                      <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{mk.kodeMatakuliah}</span>
                    </div>
                    {grade !== "-" ? <GradeBadge grade={grade} /> : <span className="text-gray-400 text-xs">-</span>}
                  </div>
                  <p className="text-sm text-gray-800 font-medium">{mk.namaMatakuliah}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-medium">T: {mk.sksTeori}</span>
                    <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">P: {mk.sksPraktik}</span>
                    <span className="text-xs text-gray-500">Total: {sksTotal}</span>
                    {nilaiAkhir !== "-" && (
                      <span className="text-xs text-gray-500">Nilai: {nilaiAkhir}</span>
                    )}
                    <span className={`text-xs font-medium ${
                      keterangan === "Lulus"
                        ? "text-green-600"
                        : keterangan === "Tidak Lulus"
                          ? "text-red-600"
                          : "text-gray-400"
                    }`}>
                      {keterangan}
                    </span>
                  </div>
                </div>
              );
            })}
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
