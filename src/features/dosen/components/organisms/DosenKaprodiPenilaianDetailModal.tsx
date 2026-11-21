import { useState, useEffect } from "react";
import { getKaprodiPenilaianDetail } from "@/features/dosen/api/kaprodiPenilaian";
import type {
  KaprodiPenilaianDetailData,
  PenilaianTreeStructureNode,
} from "@/features/dosen/types";

interface DosenKaprodiPenilaianDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  codeKelas: string;
  codeMahasiswa: string;
  nim?: string;
  namaMahasiswa?: string;
  catatanDosen?: string | null;
  catatanKaprodi?: string | null;
  validatedBy?: string | null;
  validatedAt?: string | null;
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
            ? "border-brand-300 bg-brand-50/50 p-4 shadow-2xs"
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
              <div className="h-8 w-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
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
              <div className="h-8 w-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
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
                <span>
                  Bobot: <strong className="text-gray-700">{node.weight}%</strong>
                </span>
                {node.dosen_kode_dosen != null && (
                  <>
                    <span>•</span>
                    <span>Pengampu: Dosen #{node.dosen_kode_dosen}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Score display */}
          <div className="text-right shrink-0">
            {isTopLevel ? (
              <div>
                <span className="text-xs text-brand-600 font-medium block">
                  Kalkulasi Nilai Akhir
                </span>
                <span className="text-2xl font-black text-brand-900">
                  {node.calculated_score != null
                    ? Number(node.calculated_score).toFixed(1)
                    : node.score != null
                    ? Number(node.score).toFixed(1)
                    : "-"}
                </span>
              </div>
            ) : isLeaf ? (
              <div>
                <span className="text-[11px] text-gray-400 block">Skor Input</span>
                <span className="text-base font-bold text-gray-900 bg-gray-50 px-2.5 py-0.5 rounded border border-gray-200">
                  {node.score != null ? Number(node.score).toFixed(1) : "-"}
                </span>
              </div>
            ) : (
              <div>
                <span className="text-[11px] text-gray-400 block">Sub-total</span>
                <span className="text-sm font-bold text-brand-700">
                  {node.calculated_score != null
                    ? Number(node.calculated_score).toFixed(1)
                    : "-"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Children nodes */}
      {hasChildren && (
        <div className="space-y-1">
          {node.children!.map((child) => (
            <DetailTreeNodeItem key={child.key} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Modal Component ──────────────────────────────────────────────────────────

export default function DosenKaprodiPenilaianDetailModal({
  isOpen,
  onClose,
  codeKelas,
  codeMahasiswa,
  nim,
  namaMahasiswa,
  catatanDosen,
  catatanKaprodi,
  validatedBy,
  validatedAt,
}: DosenKaprodiPenilaianDetailModalProps) {
  const [detailData, setDetailData] = useState<KaprodiPenilaianDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !codeKelas || !codeMahasiswa) return;

    let isMounted = true;
    async function fetchDetail() {
      setLoading(true);
      setError(null);
      const res = await getKaprodiPenilaianDetail(codeKelas, codeMahasiswa, {
        nim,
        nama_mahasiswa: namaMahasiswa,
      });

      if (!isMounted) return;

      if (!res.status || !res.data) {
        setError(res.message || "Gagal memuat rincian nilai mahasiswa.");
        setDetailData(null);
      } else {
        setDetailData(res.data);
      }
      setLoading(false);
    }

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [isOpen, codeKelas, codeMahasiswa, nim, namaMahasiswa]);

  if (!isOpen) return null;

  const currentNim = detailData?.nim || nim || "-";
  const currentNama = detailData?.nama_mahasiswa || namaMahasiswa || "Mahasiswa";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-brand-50/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-brand-700 bg-brand-100/70 px-2 py-0.5 rounded uppercase tracking-wider">
                Verifikasi Kaprodi
              </span>
              <span className="text-xs text-gray-400 font-mono">
                Template #{detailData?.template_id || 1}
              </span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mt-1">
              Rincian Komponen Nilai Mahasiswa
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Pantauan perolehan skor dan bobot pohon penilaian dari dosen pengampu.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <svg
              className="h-4 w-4"
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Student Banner */}
          <div className="rounded-xl bg-brand-50/60 border border-brand-100 p-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                {currentNama.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">{currentNama}</h3>
                <p className="text-xs text-gray-500 font-mono">NIM: {currentNim}</p>
              </div>
            </div>

            {detailData?.structure && (
              <div className="text-right">
                <span className="text-[11px] text-gray-500 block">Status Node</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                  {detailData.structure.filled_count ?? 3} dari {detailData.structure.total_nodes ?? 3} Diisi
                </span>
              </div>
            )}
          </div>

          {/* Loading / Error / Tree Content */}
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-500 font-medium">
                Mengambil rincian struktur nilai...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-700">
              {error}
            </div>
          ) : detailData?.structure ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Daftar Bobot & Komponen Penilaian
                </h4>
                <span className="text-[11px] text-gray-400">
                  Total Bobot: 100%
                </span>
              </div>

              {/* Tree Rendering */}
              <DetailTreeNodeItem node={detailData.structure} depth={0} />

              {/* Catatan & Audit Info */}
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                {catatanDosen && (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                    <span className="font-semibold text-gray-700 block mb-0.5">
                      Catatan Dosen Pengampu:
                    </span>
                    <p className="text-gray-600">{catatanDosen}</p>
                  </div>
                )}

                {catatanKaprodi && (
                  <div className="p-3 bg-brand-50/50 rounded-xl border border-brand-200 text-xs">
                    <span className="font-semibold text-brand-800 block mb-0.5">
                      Catatan Kaprodi:
                    </span>
                    <p className="text-brand-900">{catatanKaprodi}</p>
                  </div>
                )}

                {validatedBy && (
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                    <span>
                      Divalidasi oleh: <strong className="text-gray-700">{validatedBy}</strong>
                    </span>
                    {validatedAt && <span>Waktu: {validatedAt}</span>}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-gray-500">
              Tidak ada data struktur penilaian untuk mahasiswa ini.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-200 rounded-lg shadow-2xs transition-all cursor-pointer select-none"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
