import React from "react";
import type { MataKuliah, KomponenSumatif } from "@/features/admin/kurikulumTypes";

// ─── Depth styling ────────────────────────────────────────────────────────────

const DEPTH_BADGE: Record<number, string> = {
  0: "bg-brand-800 text-white",
  1: "bg-brand-600 text-white",
  2: "bg-brand-400 text-white",
  3: "bg-brand-200 text-brand-800",
  4: "bg-brand-100 text-brand-700",
};

const DEPTH_INDENT_COLOR: Record<number, string> = {
  0: "border-brand-700",
  1: "border-brand-500",
  2: "border-brand-300",
  3: "border-brand-200",
  4: "border-brand-100",
};

const DEPTH_ROW_BG: Record<number, string> = {
  0: "bg-brand-50/60",
  1: "bg-white",
  2: "bg-gray-50/50",
  3: "bg-white",
  4: "bg-gray-50/50",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Hitung bobot efektif (absolut) sebuah node dari root */
function effectiveBobot(node: KomponenSumatif, parentEffective: number): number {
  return (node.weight / 100) * parentEffective;
}

function isLeaf(node: KomponenSumatif): boolean {
  return !node.children || node.children.length === 0;
}

// ─── Recursive tree row ───────────────────────────────────────────────────────

interface TreeRowsProps {
  nodes: KomponenSumatif[];
  depth: number;
  parentEffective: number;
}

function TreeRows({ nodes, depth, parentEffective }: TreeRowsProps) {
  let count = 0;

  function renderRows(items: KomponenSumatif[], d: number, parentEff: number): React.JSX.Element[] {
    return items.map((node) => {
      const effective = effectiveBobot(node, parentEff);
      const leaf = isLeaf(node);
      const rowNum = leaf ? ++count : null;

      return (
        <React.Fragment key={node.key}>
          {/* ── Row ── */}
          <tr className={`${DEPTH_ROW_BG[d] ?? "bg-white"} border-b border-gray-100`}>
            {/* No (only for leaves) */}
            <td className="px-3 py-2.5 text-center">
              {leaf && (
                <span className="text-xs text-gray-400 tabular-nums">{rowNum}</span>
              )}
            </td>

            {/* Nama + indent */}
            <td className="px-3 py-2.5">
              <div className="flex items-center gap-1.5">
                {/* Indent lines */}
                {Array.from({ length: d }).map((_, i) => (
                  <span
                    key={i}
                    className={`shrink-0 h-5 w-px border-l-2 ${DEPTH_INDENT_COLOR[i] ?? "border-gray-200"}`}
                  />
                ))}
                {/* Depth badge */}
                <span
                  className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded tabular-nums ${DEPTH_BADGE[d] ?? "bg-gray-100 text-gray-600"}`}
                >
                  L{d + 1}
                </span>
                {/* Label */}
                <span className={`text-sm ${leaf ? "text-gray-700" : "font-semibold text-gray-800"}`}>
                  {node.name}
                </span>
              </div>
            </td>

            {/* Bobot relatif */}
            <td className="px-3 py-2.5 text-center">
              <span className="inline-block text-xs font-semibold tabular-nums text-gray-700 bg-gray-100 rounded-full px-2.5 py-0.5">
                {node.weight}%
              </span>
            </td>

            {/* Bobot efektif */}
            <td className="px-3 py-2.5 text-center">
              {leaf ? (
                <span className="inline-block text-xs font-bold tabular-nums text-brand-700 bg-brand-50 rounded-full px-2.5 py-0.5">
                  {effective % 1 === 0 ? effective : effective.toFixed(1)}%
                </span>
              ) : (
                <span className="text-xs text-gray-300">—</span>
              )}
            </td>

            {/* Keterangan */}
            <td className="px-3 py-2.5 text-xs text-gray-400">
              {!leaf && (
                <span className="italic">{node.children.length} sub-komponen</span>
              )}
            </td>
          </tr>

          {/* ── Children ── */}
          {node.children.length > 0 && renderRows(node.children, d + 1, effective)}
        </React.Fragment>
      );
    });
  }

  return <>{renderRows(nodes, depth, parentEffective)}</>;
}

// ─── Summary bar ─────────────────────────────────────────────────────────────

function collectLeaves(nodes: KomponenSumatif[], parentEff: number): { name: string; eff: number }[] {
  const result: { name: string; eff: number }[] = [];
  for (const node of nodes) {
    const eff = (node.weight / 100) * parentEff;
    if (isLeaf(node)) {
      result.push({ name: node.name, eff });
    } else {
      result.push(...collectLeaves(node.children, eff));
    }
  }
  return result;
}

// ─── Props & dummy data ───────────────────────────────────────────────────────

interface KurikulumDetailCardProps {
  mk: MataKuliah;
  komponen: KomponenSumatif[];
  onClose: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function KurikulumDetailCard({ mk, komponen, onClose }: KurikulumDetailCardProps) {
  const totalBobot = komponen.reduce((s, k) => s + k.weight, 0);
  const leaves = collectLeaves(komponen, 100);
  const totalEffective = leaves.reduce((s, l) => s + l.eff, 0);

  return (
    /* ── Overlay ── */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="bg-brand-800 px-6 py-5 flex items-start justify-between gap-4 shrink-0">
          <div>
            <p className="text-brand-300 text-xs font-medium uppercase tracking-wide mb-1">
              Detail Penilaian Sumatif
            </p>
            <h2 className="text-white text-lg font-bold leading-tight">{mk.nama}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="font-mono text-xs bg-brand-700 text-brand-200 px-2 py-0.5 rounded">
                {mk.kode}
              </span>
              <span className="text-brand-300 text-xs">Semester {mk.semester}</span>
              <span className="text-brand-300 text-xs">
                {mk.sksTeori + mk.sksPraktek} SKS ({mk.sksTeori}T + {mk.sksPraktek}P)
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-0.5 p-1.5 rounded-lg text-brand-300 hover:text-white hover:bg-brand-700 transition-colors"
            title="Tutup"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Bobot summary pills ── */}
        {komponen.length > 0 && (
          <div className="px-6 pt-4 pb-0 shrink-0">
            <div className="flex flex-wrap gap-2">
              {komponen.map((k) => (
                <span
                  key={k.key}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-xs font-semibold text-brand-700"
                >
                  <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0" />
                  {k.name}
                  <span className="ml-0.5 text-brand-500 font-bold">{k.weight}%</span>
                </span>
              ))}
              {totalBobot !== 100 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-700">
                  ⚠ Total: {totalBobot}% (bukan 100%)
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Table ── */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {komponen.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <svg className="h-10 w-10 text-gray-300 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm font-medium text-gray-500">Belum ada komponen penilaian.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide w-10">No</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Komponen Penilaian</th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide w-28">Bobot Relatif</th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide w-28">Bobot Efektif</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-36">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  <TreeRows
                    nodes={komponen}
                    depth={0}
                    parentEffective={100}
                  />
                </tbody>

                {/* ── Footer ── */}
                <tfoot>
                  <tr className="bg-brand-50 border-t-2 border-brand-200">
                    <td colSpan={3} className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Total Penilaian
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`text-xs font-black tabular-nums px-3 py-1 rounded-full ${Math.abs(totalEffective - 100) < 0.01 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        {totalEffective % 1 === 0 ? totalEffective : totalEffective.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-400 italic">
                      {leaves.length} komponen penilaian
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* ── Legend ── */}
        <div className="px-6 pb-5 shrink-0 flex flex-wrap gap-x-4 gap-y-1.5">
          {[0, 1, 2, 3, 4].map((d) => (
            <span key={d} className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className={`inline-flex items-center justify-center text-[10px] font-bold px-1.5 py-0.5 rounded ${DEPTH_BADGE[d]}`}>L{d + 1}</span>
              Level {d + 1}
            </span>
          ))}
          <span className="flex items-center gap-1.5 text-xs text-gray-400 ml-auto">
            <span className="inline-block w-3 h-3 rounded-full bg-brand-50 border border-brand-200" />
            Bobot efektif = hasil kali bobot di setiap level
          </span>
        </div>
      </div>
    </div>
  );
}
