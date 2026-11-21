import { useState, useEffect } from "react";
import { getDetailNilaiMahasiswa } from "@/features/dosen/api/penilaian";
import type {
  DosenPenilaianMahasiswaDetailData,
  PenilaianTreeStructureNode,
} from "@/features/dosen/types";

interface DosenPenilaianDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  codeKelas: string;
  codeMahasiswa: string;
  nim?: string;
  namaMahasiswa?: string;
}

// ─── Score Tree Node Item ─────────────────────────────────────────────────────

function DetailTreeNodeItem({
  node,
  depth = 0,
}: {
  node: PenilaianTreeStructureNode;
  depth?: number;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isTopLevel = depth === 0;
  const isLeaf = !hasChildren || node.type === "input";

  return (
    <div className={isTopLevel ? "" : "ml-4 sm:ml-6 mt-2"}>
      <div
        className={`rounded-xl border transition-all ${
          isTopLevel
            ? "border-brand-300 bg-brand-50/50 p-4 shadow-xs"
            : isLeaf
            ? "border-gray-200 bg-white p-3.5 hover:border-brand-200"
            : "border-gray-200 bg-gray-50/70 p-3.5"
        }`}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3 min-w-0">
            {isTopLevel ? (
              <div className="h-9 w-9 rounded-xl bg-brand-700 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            ) : hasChildren ? (
              <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
            ) : (
              <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-sm ${
                    isTopLevel
                      ? "font-bold text-brand-900"
                      : hasChildren
                      ? "font-semibold text-gray-800"
                      : "font-medium text-gray-700"
                  }`}
                >
                  {node.name || node.key}
                </span>
                <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                  {node.key}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                <span>Bobot: <strong className="text-gray-700">{node.weight}%</strong></span>
                {node.dosen_kode_dosen != null && (
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] text-brand-700 bg-brand-50 border border-brand-100 px-1.5 py-0.5 rounded">
                    Dosen ID: {String(node.dosen_kode_dosen)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
            {isTopLevel ? (
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-700 block">
                  Nilai Akhir
                </span>
                <span className="text-xl font-extrabold text-brand-900">
                  {node.calculated_score != null ? Number(node.calculated_score).toFixed(2) : "-"}
                </span>
              </div>
            ) : isLeaf ? (
              <div className="text-right">
                <span className="text-[10px] text-gray-400 block font-medium">Skor</span>
                <span
                  className={`inline-block font-mono text-sm font-bold px-2.5 py-0.5 rounded-md ${
                    node.score != null
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-gray-100 text-gray-400 border border-gray-200"
                  }`}
                >
                  {node.score != null ? Number(node.score).toFixed(2) : "Belum diisi"}
                </span>
              </div>
            ) : (
              node.calculated_score != null && (
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block font-medium">Subtotal</span>
                  <span className="font-mono text-sm font-bold text-gray-800">
                    {Number(node.calculated_score).toFixed(2)}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {hasChildren && (
        <div className="relative pl-2 sm:pl-3 border-l-2 border-brand-200/60 ml-3 sm:ml-4 space-y-1 mt-1">
          {node.children!.map((child, idx) => (
            <DetailTreeNodeItem key={child.key || idx} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function DosenPenilaianDetailModal({
  isOpen,
  onClose,
  codeKelas,
  codeMahasiswa,
  nim,
  namaMahasiswa,
}: DosenPenilaianDetailModalProps) {
  const [detail, setDetail] = useState<DosenPenilaianMahasiswaDetailData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !codeKelas || !codeMahasiswa) return;

    let isMounted = true;
    async function fetchDetail() {
      setLoading(true);
      setError(null);
      const res = await getDetailNilaiMahasiswa(codeKelas, codeMahasiswa, {
        nim,
        nama_mahasiswa: namaMahasiswa,
      });
      if (!isMounted) return;

      if (!res.status) {
        setError(res.message);
        setDetail(null);
      } else {
        setDetail(res.data);
      }
      setLoading(false);
    }

    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [isOpen, codeKelas, codeMahasiswa, nim, namaMahasiswa]);

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

  const structure = detail?.structure;
  const calculatedScore = structure?.calculated_score;
  const filledCount = structure?.filled_count ?? 0;
  const totalNodes = structure?.total_nodes ?? 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs transition-opacity"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] transition-all">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Detail Nilai Mahasiswa
              </h2>
              <p className="text-xs text-gray-500">
                {namaMahasiswa || detail?.nama_mahasiswa || "Mahasiswa"} •{" "}
                <span className="font-mono">{nim || detail?.nim}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && detail && (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-brand-50 to-brand-100/50 rounded-xl p-4 border border-brand-200/80">
                  <p className="text-[11px] font-semibold text-brand-700 uppercase tracking-wider">
                    Nilai Akhir (Kalkulasi)
                  </p>
                  <p className="text-2xl font-black text-brand-900 mt-1">
                    {calculatedScore != null ? Number(calculatedScore).toFixed(2) : "-"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-[11px] font-medium text-gray-500">Progress Komponen</p>
                  <p className="text-lg font-bold text-gray-800 mt-1">
                    {filledCount} / {totalNodes} Komponen
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className="bg-brand-600 h-1.5 rounded-full transition-all"
                      style={{
                        width: `${totalNodes > 0 ? (filledCount / totalNodes) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-[11px] font-medium text-gray-500">Template ID</p>
                  <p className="text-lg font-bold text-gray-800 mt-1">
                    #{detail.template_id}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Struktur Nilai Berbasis Tree</p>
                </div>
              </div>

              {/* Tree Breakdown */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-3">
                  Rincian Pohon Nilai Komponen
                </h3>
                {structure ? (
                  <DetailTreeNodeItem node={structure} />
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    Struktur penilaian belum tersedia.
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center px-4 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-200 rounded-lg shadow-2xs transition-all cursor-pointer select-none"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
