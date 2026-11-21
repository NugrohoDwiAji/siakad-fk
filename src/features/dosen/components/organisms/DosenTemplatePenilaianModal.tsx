import { useState, useEffect } from "react";
import { getTemplatePenilaianKelas } from "@/features/dosen/api/penilaian";
import Button from "@/components/ui/Button";
import type {
  DosenPenilaianTemplateData,
  PenilaianTreeStructureNode,
} from "@/features/dosen/types";

interface DosenTemplatePenilaianModalProps {
  isOpen: boolean;
  onClose: () => void;
  codeKelas: string;
  namaKelas?: string;
  namaMatakuliah?: string;
}

// ─── Recursive Tree Node Component ────────────────────────────────────────────

function TreeNodeView({
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
            ? "border-brand-300 bg-brand-50/40 p-4 shadow-xs"
            : isLeaf
            ? "border-gray-200 bg-white p-3.5 hover:border-brand-200"
            : "border-gray-200 bg-gray-50/60 p-3.5"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {isTopLevel ? (
              <div className="h-8 w-8 rounded-lg bg-brand-700 text-white flex items-center justify-center shrink-0">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </div>
            ) : hasChildren ? (
              <div className="h-7 w-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
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
              <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
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
                  className={`text-sm truncate ${
                    isTopLevel
                      ? "font-bold text-brand-900"
                      : hasChildren
                      ? "font-semibold text-gray-800"
                      : "font-medium text-gray-700"
                  }`}
                >
                  {node.name || node.key}
                </span>
                <span className="font-mono text-[11px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                  {node.key}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Tipe: <span className="font-medium text-gray-700">{node.type || (isLeaf ? "input" : "category")}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                isTopLevel
                  ? "bg-brand-100 text-brand-800 border border-brand-200"
                  : isLeaf
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              Bobot: {node.weight}%
            </span>
          </div>
        </div>
      </div>

      {hasChildren && (
        <div className="relative pl-2 sm:pl-3 border-l-2 border-brand-200/60 ml-3 sm:ml-4 space-y-1 mt-1">
          {node.children!.map((child, idx) => (
            <TreeNodeView key={child.key || idx} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function DosenTemplatePenilaianModal({
  isOpen,
  onClose,
  codeKelas,
  namaKelas,
  namaMatakuliah,
}: DosenTemplatePenilaianModalProps) {
  const [template, setTemplate] = useState<DosenPenilaianTemplateData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !codeKelas) return;

    let isMounted = true;
    async function fetchTemplate() {
      setLoading(true);
      setError(null);
      const res = await getTemplatePenilaianKelas(codeKelas);
      if (!isMounted) return;

      if (!res.status) {
        setError(res.message);
        setTemplate(null);
      } else {
        setTemplate(res.data);
      }
      setLoading(false);
    }

    fetchTemplate();
    return () => {
      isMounted = false;
    };
  }, [isOpen, codeKelas]);

  // Handle ESC key
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
                <path d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Struktur Tree Penilaian
              </h2>
              <p className="text-xs text-gray-500">
                {namaMatakuliah || template?.nama_matakuliah || "Mata Kuliah"} {namaKelas ? `• ${namaKelas}` : ""}
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

          {!loading && !error && template && (
            <>
              {/* Info pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[11px] font-medium text-gray-500">Kode Mata Kuliah</p>
                  <p className="text-sm font-bold text-gray-800 font-mono mt-0.5">
                    {template.kode_matakuliah}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[11px] font-medium text-gray-500">Total Komponen Input</p>
                  <p className="text-sm font-bold text-brand-700 mt-0.5">
                    {template.leaf_nodes?.length || 0} Leaf Nodes
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[11px] font-medium text-gray-500">Total Bobot Penilaian</p>
                  <p className="text-sm font-bold text-emerald-700 mt-0.5">
                    {template.structure?.weight ?? 100}%
                  </p>
                </div>
              </div>

              {/* Leaf Nodes Summary */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2.5">
                  Daftar Leaf Nodes (Komponen yang dinilai)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {template.leaf_nodes?.map((leaf) => (
                    <div
                      key={leaf.key}
                      className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-xs shadow-2xs"
                    >
                      <span className="font-semibold text-gray-800">{leaf.name}</span>
                      <span className="bg-brand-50 text-brand-700 font-semibold px-1.5 py-0.5 rounded text-[11px]">
                        {leaf.weight}%
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        ({leaf.key})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tree View */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-3">
                  Hirarki Struktur Penilaian
                </h3>
                {template.structure ? (
                  <TreeNodeView node={template.structure} />
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    Struktur pohon penilaian belum ditentukan.
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
          <Button variant="outline" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
