import { useState, useEffect, useMemo } from "react";
import {
  inputNilaiMahasiswa,
  getDetailNilaiMahasiswa,
  getTemplatePenilaianKelas,
} from "@/features/dosen/api/penilaian";
import Button from "@/components/ui/Button";
import type {
  PenilaianLeafNode,
  PenilaianTreeStructureNode,
  DosenInputNilaiPayload,
} from "@/features/dosen/types";

interface DosenInputNilaiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: "input" | "update";
  codeKelas: string;
  codeMahasiswa: string;
  nim: string;
  namaMahasiswa: string;
  catatanKaprodi?: string | null;
  catatanDosen?: string | null;
  leafNodes?: PenilaianLeafNode[];
}

export default function DosenInputNilaiModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  codeKelas,
  codeMahasiswa,
  nim,
  namaMahasiswa,
  catatanKaprodi,
  catatanDosen: initialCatatanDosen,
  leafNodes: initialLeafNodes,
}: DosenInputNilaiModalProps) {
  const [leafNodes, setLeafNodes] = useState<PenilaianLeafNode[]>(
    initialLeafNodes || []
  );
  const [scores, setScores] = useState<Record<string, string>>({});
  const [catatan, setCatatan] = useState(initialCatatanDosen || "");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]> | null
  >(null);

  // Helper to recursively collect leaf scores from detail structure
  function extractScoresFromTree(
    node: PenilaianTreeStructureNode,
    collected: Record<string, string>
  ) {
    if (node.score != null && node.key) {
      collected[node.key] = String(node.score);
    }
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        extractScoresFromTree(child, collected);
      }
    }
  }

  // Helper to recursively extract leaf nodes if not present
  function extractLeafNodes(
    node: PenilaianTreeStructureNode,
    collected: PenilaianLeafNode[]
  ) {
    const isLeaf = !node.children || node.children.length === 0 || node.type === "input";
    if (isLeaf && node.key) {
      collected.push({
        key: node.key,
        name: node.name || node.key,
        weight: node.weight || 0,
        type: node.type || "input",
      });
    } else if (node.children) {
      for (const child of node.children) {
        extractLeafNodes(child, collected);
      }
    }
  }

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setError(null);
      setValidationErrors(null);
      setCatatan(initialCatatanDosen || "");

      const loadedScores: Record<string, string> = {};
      let loadedLeafNodes: PenilaianLeafNode[] = initialLeafNodes || [];

      try {
        // If leaf nodes not available, fetch template
        if (!loadedLeafNodes || loadedLeafNodes.length === 0) {
          const tplRes = await getTemplatePenilaianKelas(codeKelas);
          if (isMounted && tplRes.status && tplRes.data) {
            if (tplRes.data.leaf_nodes && tplRes.data.leaf_nodes.length > 0) {
              loadedLeafNodes = tplRes.data.leaf_nodes;
            } else if (tplRes.data.structure) {
              const nodes: PenilaianLeafNode[] = [];
              extractLeafNodes(tplRes.data.structure, nodes);
              loadedLeafNodes = nodes;
            }
          }
        }

        // If in update mode (or even in input mode to check existing draft scores), fetch detail
        if (mode === "update") {
          const detailRes = await getDetailNilaiMahasiswa(codeKelas, codeMahasiswa);
          if (isMounted && detailRes.status && detailRes.data?.structure) {
            extractScoresFromTree(detailRes.data.structure, loadedScores);
          }
        }

        if (isMounted) {
          setLeafNodes(loadedLeafNodes);
          setScores(loadedScores);
        }
      } catch (err) {
        if (isMounted) {
          setError("Gagal memuat data komponen penilaian.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [
    isOpen,
    codeKelas,
    codeMahasiswa,
    mode,
    initialLeafNodes,
    initialCatatanDosen,
  ]);

  // Handle ESC key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !submitting) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, submitting, onClose]);

  // Live estimated weighted score calculation
  const calculatedEstimatedScore = useMemo(() => {
    if (!leafNodes || leafNodes.length === 0) return null;
    let totalWeight = 0;
    let weightedSum = 0;
    let anyFilled = false;

    for (const leaf of leafNodes) {
      const val = scores[leaf.key];
      if (val !== undefined && val !== "" && !isNaN(Number(val))) {
        const num = Number(val);
        weightedSum += (num * leaf.weight);
        totalWeight += leaf.weight;
        anyFilled = true;
      }
    }

    if (!anyFilled) return null;
    return totalWeight > 0 ? weightedSum / 100 : 0;
  }, [leafNodes, scores]);

  function handleScoreChange(key: string, value: string) {
    // Allow digits and single dot
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) {
      return;
    }
    const num = Number(value);
    if (value !== "" && !isNaN(num) && (num < 0 || num > 100)) {
      return;
    }

    setScores((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setValidationErrors(null);

    // Build scores array dengan format score string (misal "85.0")
    const scoresArray = leafNodes
      .filter((leaf) => scores[leaf.key] !== undefined && scores[leaf.key].trim() !== "")
      .map((leaf) => {
        const raw = scores[leaf.key].trim().replace(",", ".");
        const num = Number(raw);
        const scoreStr = !isNaN(num)
          ? Number.isInteger(num)
            ? num.toFixed(1)
            : String(num)
          : raw;
        return {
          node_key: leaf.key,
          score: scoreStr,
        };
      });

    if (scoresArray.length === 0) {
      setError("Silakan isi setidaknya satu komponen nilai.");
      return;
    }

    // Validate score ranges
    for (const s of scoresArray) {
      const num = Number(s.score);
      if (isNaN(num) || num < 0 || num > 100) {
        setError(`Nilai untuk komponen "${s.node_key}" harus antara 0 dan 100.`);
        return;
      }
    }

    const finalCodeMahasiswa =
      codeMahasiswa ||
      nim ||
      "";

    if (!finalCodeMahasiswa) {
      setError("Identitas mahasiswa (code_mahasiswa) tidak ditemukan. Silakan muat ulang halaman.");
      return;
    }

    const payload: DosenInputNilaiPayload = {
      code_kelas: codeKelas,
      mahasiswa: [
        {
          code_mahasiswa: finalCodeMahasiswa,
          scores: scoresArray,
          catatan: catatan.trim() || null,
        },
      ],
    };

    setSubmitting(true);

    try {
      const res = await inputNilaiMahasiswa(payload);

      if (!res.status) {
        setError(res.message);
        setValidationErrors(res.errors || null);
      } else {
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan atau server.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs transition-opacity"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh] transition-all">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                mode === "update"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-brand-50 text-brand-700"
              }`}
            >
              {mode === "update" ? (
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M12 4v16m8-8H4" />
                </svg>
              )}
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                {mode === "update" ? "Perbarui Nilai Mahasiswa" : "Input Nilai Mahasiswa"}
              </h2>
              <p className="text-xs text-gray-500">
                {namaMahasiswa} • <span className="font-mono">{nim}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
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

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto flex-1 space-y-5">
            {/* Kaprodi Revision Notice Alert */}
            {catatanKaprodi && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-900">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.2}
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <div className="text-xs space-y-1 min-w-0">
                    <p className="font-bold text-amber-950 uppercase tracking-wider">
                      Catatan Perbaikan dari Kaprodi:
                    </p>
                    <p className="text-amber-900 font-medium whitespace-pre-wrap">
                      {catatanKaprodi}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                <p className="font-semibold">{error}</p>
                {validationErrors && (
                  <ul className="mt-1 list-disc list-inside text-xs space-y-0.5">
                    {Object.entries(validationErrors).map(([field, msgs]) => (
                      <li key={field}>{msgs.join(", ")}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Loading */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
              </div>
            ) : (
              <>
                {/* Leaf Node Scores Input List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                      Komponen Penilaian (Leaf Nodes)
                    </label>
                    <span className="text-[11px] text-gray-400">Rentang skor: 0 - 100</span>
                  </div>

                  {leafNodes.length === 0 ? (
                    <p className="text-xs text-gray-400 italic p-4 bg-gray-50 rounded-xl text-center">
                      Tidak ada komponen leaf node yang dapat diinput.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {leafNodes.map((leaf) => {
                        const currentVal = scores[leaf.key] || "";
                        return (
                          <div
                            key={leaf.key}
                            className="flex items-center justify-between gap-3 p-3.5 bg-gray-50/70 border border-gray-200 rounded-xl hover:bg-white hover:border-brand-300 transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-800">
                                  {leaf.name}
                                </span>
                                <span className="bg-brand-100 text-brand-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                                  {leaf.weight}%
                                </span>
                              </div>
                              <span className="font-mono text-[10px] text-gray-400">
                                {leaf.key}
                              </span>
                            </div>

                            <div className="w-28 shrink-0">
                              <input
                                type="text"
                                inputMode="decimal"
                                placeholder="0.00"
                                value={currentVal}
                                onChange={(e) =>
                                  handleScoreChange(leaf.key, e.target.value)
                                }
                                disabled={submitting}
                                className="w-full text-right font-mono text-sm font-bold px-3 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition disabled:bg-gray-100"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Real-time Estimated Final Score Banner */}
                {calculatedEstimatedScore != null && (
                  <div className="flex items-center justify-between p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        Σ
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-emerald-900">
                          Estimasi Nilai Akhir
                        </p>
                        <p className="text-[11px] text-emerald-700">
                          Dihitung proporsional berdasarkan bobot komponen
                        </p>
                      </div>
                    </div>
                    <span className="text-xl font-black font-mono text-emerald-900">
                      {calculatedEstimatedScore.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Catatan textarea */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {mode === "update"
                      ? "Catatan Perbaikan / Dosen (opsional)"
                      : "Catatan Dosen (opsional)"}
                  </label>
                  <textarea
                    rows={2}
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    disabled={submitting}
                    placeholder={
                      mode === "update"
                        ? "Contoh: Revisi sudah diperbaiki sesuai arahan Kaprodi..."
                        : "Tuliskan catatan opsional terkait penilaian mahasiswa ini..."
                    }
                    className="w-full text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-brand-600 focus:bg-white focus:ring-2 focus:ring-brand-100 transition disabled:bg-gray-100 resize-none"
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-2.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={submitting}
              disabled={loading || leafNodes.length === 0}
            >
              {mode === "update" ? "Simpan Perubahan Nilai" : "Simpan Nilai"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
