import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Button from "@/components/ui/Button";
import { assignAssessmentDosen } from "@/features/admin/api/assessment";
import type { DosenPengajarItem } from "@/features/admin/types";

/**
 * Helper untuk memformat node_key menjadi teks yang rapi dan mudah dibaca
 */
function formatNodeKey(nodeKey: string): string {
  if (!nodeKey) return "-";
  const upperKeys: Record<string, string> = {
    osce: "OSCE",
    cbl: "CBL",
    mcq: "MCQ",
    ospe: "OSPE",
    socap: "SOCAP",
    pbl: "PBL",
  };

  const lower = nodeKey.toLowerCase();
  if (upperKeys[lower]) return upperKeys[lower];

  return nodeKey
    .replace(/[_-]/g, " ")
    .split(" ")
    .map(
      (word) =>
        upperKeys[word.toLowerCase()] ||
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(" ");
}

export interface AvailableAssessmentNode {
  node_key: string;
  name?: string;
  assigned_dosen?: number | string | null;
  assigned_dosen_name?: string;
}

interface AssignDosenAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message?: string) => void;
  assessmentDosenId: number;
  namaKelas: string;
  namaMatakuliah: string;
  dosenPengajarList: DosenPengajarItem[];
  availableNodes?: AvailableAssessmentNode[];
  initialNodeKey?: string;
  initialKodeDosen?: number | string;
}

export default function AssignDosenAssessmentModal({
  isOpen,
  onClose,
  onSuccess,
  assessmentDosenId,
  namaKelas,
  namaMatakuliah,
  dosenPengajarList = [],
  availableNodes = [],
  initialNodeKey,
  initialKodeDosen,
}: AssignDosenAssessmentModalProps) {
  // ─── Form States ───
  const [selectedKodeDosen, setSelectedKodeDosen] = useState<string>("");
  const [selectedNodeKeys, setSelectedNodeKeys] = useState<string[]>([]);
  const [customNodeKey, setCustomNodeKey] = useState<string>("");
  const [isManualInput, setIsManualInput] = useState<boolean>(false);
  const [searchDosenQuery, setSearchDosenQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const modalRef = useRef<HTMLDivElement>(null);

  // Inisialisasi state saat modal dibuka
  useEffect(() => {
    if (!isOpen) return;

    // Reset error & filter
    setErrorMessage(null);
    setFieldErrors({});
    setSearchDosenQuery("");

    // Set initial dosen
    if (initialKodeDosen !== undefined && initialKodeDosen !== null && initialKodeDosen !== 0) {
      setSelectedKodeDosen(String(initialKodeDosen));
    } else if (dosenPengajarList.length === 1) {
      setSelectedKodeDosen(String(dosenPengajarList[0].kode_dosen));
    } else {
      setSelectedKodeDosen("");
    }

    // Set initial node_key
    if (initialNodeKey) {
      setSelectedNodeKeys([initialNodeKey]);
      setIsManualInput(false);
    } else if (availableNodes.length === 1) {
      setSelectedNodeKeys([availableNodes[0].node_key]);
      setIsManualInput(false);
    } else if (availableNodes.length > 0) {
      // Default: pilih node pertama jika tersedia
      setSelectedNodeKeys([availableNodes[0].node_key]);
      setIsManualInput(false);
    } else {
      setSelectedNodeKeys([]);
      setIsManualInput(true);
    }
    setCustomNodeKey("");
  }, [isOpen, initialKodeDosen, initialNodeKey, dosenPengajarList, availableNodes]);

  // Keyboard handler for Escape
  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    onClose();
  }, [isSubmitting, onClose]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        handleClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isSubmitting, handleClose]);

  // Filtered lecturer list based on search query (dari dosen_pengajar API)
  const filteredDosen = useMemo(() => {
    if (!searchDosenQuery.trim()) return dosenPengajarList;
    const q = searchDosenQuery.toLowerCase();
    return dosenPengajarList.filter(
      (d) =>
        (d.nama_dosen && d.nama_dosen.toLowerCase().includes(q)) ||
        (d.nik && d.nik.toLowerCase().includes(q)) ||
        (d.kode_dosen && String(d.kode_dosen).toLowerCase().includes(q)) ||
        (d.alamat_email && d.alamat_email.toLowerCase().includes(q))
    );
  }, [dosenPengajarList, searchDosenQuery]);

  // Toggle selection node key
  const handleToggleNodeKey = (key: string) => {
    setSelectedNodeKeys((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key);
      }
      return [...prev, key];
    });
    if (fieldErrors.node_key) {
      setFieldErrors((prev) => ({ ...prev, node_key: "" }));
    }
    setErrorMessage(null);
  };

  // Pilih semua node
  const handleSelectAllNodes = () => {
    setSelectedNodeKeys(availableNodes.map((n) => n.node_key));
    if (fieldErrors.node_key) {
      setFieldErrors((prev) => ({ ...prev, node_key: "" }));
    }
    setErrorMessage(null);
  };

  // Hapus semua pilihan node
  const handleClearAllNodes = () => {
    setSelectedNodeKeys([]);
  };

  // ─── Handle Form Submission ───
  // PUT /api/staff/assessment/dosen/assign
  // Body: { assessment_dosen_id: number, assignments: [{ node_key: string, kode_dosen: number }] }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};

    if (!assessmentDosenId || assessmentDosenId <= 0) {
      errors.assessment_dosen_id =
        "Assessment ID belum valid. Harap jalankan 'Setup Assessment Dosen' terlebih dahulu.";
    }

    if (!selectedKodeDosen) {
      errors.kode_dosen = "Silakan pilih dosen pengajar terlebih dahulu.";
    }

    // Kumpulkan node_keys yang dipilih
    let finalNodeKeys: string[] = [];
    if (isManualInput) {
      if (!customNodeKey.trim()) {
        errors.node_key = "Silakan masukkan nama/kode komponen penilaian (node key).";
      } else {
        finalNodeKeys = [customNodeKey.trim()];
      }
    } else {
      if (selectedNodeKeys.length === 0) {
        errors.node_key = "Silakan pilih minimal satu komponen penilaian (node key).";
      } else {
        finalNodeKeys = selectedNodeKeys;
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage(
        errors.assessment_dosen_id ||
          errors.kode_dosen ||
          errors.node_key ||
          "Mohon lengkapi semua isian yang wajib diisi."
      );
      return;
    }

    setFieldErrors({});
    setErrorMessage(null);
    setIsSubmitting(true);

    const numericKodeDosen = Number(selectedKodeDosen);
    const assignmentsPayload = finalNodeKeys.map((nodeKey) => ({
      node_key: nodeKey,
      kode_dosen: numericKodeDosen,
    }));

    const res = await assignAssessmentDosen({
      assessment_dosen_id: Number(assessmentDosenId),
      assignments: assignmentsPayload,
    });

    setIsSubmitting(false);

    if (res.status) {
      onSuccess(res.message || "Penugasan dosen assessment berhasil disimpan.");
      onClose();
    } else {
      setErrorMessage(
        res.message || "Gagal menyimpan penugasan dosen ke assessment. Silakan coba lagi."
      );
      if (res.errors) {
        const mapped: Record<string, string> = {};
        Object.entries(res.errors).forEach(([k, msgs]) => {
          if (Array.isArray(msgs) && msgs.length > 0) {
            mapped[k] = msgs[0];
          }
        });
        setFieldErrors(mapped);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs transition-opacity animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assign-dosen-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          handleClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-100 animate-scaleUp"
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0 border border-brand-100">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  id="assign-dosen-modal-title"
                  className="text-base font-bold text-gray-900"
                >
                  Tugaskan Dosen Penilai
                </h3>
                {assessmentDosenId > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-semibold border border-brand-200">
                    ID #{assessmentDosenId}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Kelas {namaKelas} &bull; {namaMatakuliah}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
            aria-label="Tutup modal"
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-5 text-xs overflow-y-auto flex-1">
            {/* Global Error Banner */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5">
                <svg
                  className="h-4 w-4 text-red-600 shrink-0 mt-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div className="flex-1">
                  <p className="font-semibold">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Assessment ID Warning if missing */}
            {(!assessmentDosenId || assessmentDosenId <= 0) && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                <svg
                  className="h-4 w-4 text-amber-600 shrink-0 mt-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p>
                  <strong>Perhatian:</strong> Assessment ID belum diinisialisasi untuk kelas ini. Harap jalankan <strong>Setup Assessment</strong> terlebih dahulu agar penugasan dapat disimpan.
                </p>
              </div>
            )}

            {/* ─── SECTION 1: Pilih Dosen Pengajar (Response API dosen_pengajar) ─── */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-gray-800">
                    Pilih Dosen <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[11px] text-gray-500">
                    Pilihan dosen diambil dari daftar dosen pengajar pada kelas ini
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100">
                  {dosenPengajarList.length} Dosen Pengajar
                </span>
              </div>

              {/* Search Filter jika daftar dosen lebih dari 3 */}
              {dosenPengajarList.length > 3 && (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari dosen berdasarkan nama, NIK, atau kode..."
                    value={searchDosenQuery}
                    onChange={(e) => setSearchDosenQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-brand-600 transition"
                  />
                  <svg
                    className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400 pointer-events-none"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
              )}

              {/* Dosen List */}
              {dosenPengajarList.length === 0 ? (
                <div className="p-4 text-center border border-dashed border-amber-200 rounded-xl bg-amber-50/60 text-amber-800 space-y-1">
                  <p className="font-semibold">
                    Belum Ada Dosen Pengajar Pada Kelas Ini
                  </p>
                  <p className="text-[11px] text-amber-700">
                    Dosen pengajar kelas belum terdaftar. Tambahkan dosen pengampu terlebih dahulu di detail kelas atau jalankan setup assessment.
                  </p>
                </div>
              ) : filteredDosen.length === 0 ? (
                <div className="p-4 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-400 italic">
                  Tidak ada dosen yang cocok dengan pencarian &quot;{searchDosenQuery}&quot;.
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl max-h-52 overflow-y-auto divide-y divide-gray-100 bg-white">
                  {filteredDosen.map((dosen) => {
                    const isSelected = selectedKodeDosen === String(dosen.kode_dosen);

                    return (
                      <div
                        key={dosen.kode_dosen}
                        onClick={() => {
                          setSelectedKodeDosen(String(dosen.kode_dosen));
                          if (fieldErrors.kode_dosen) {
                            setFieldErrors((prev) => ({ ...prev, kode_dosen: "" }));
                          }
                          setErrorMessage(null);
                        }}
                        className={`p-3 flex items-center justify-between cursor-pointer transition ${
                          isSelected
                            ? "bg-brand-50/90 border-l-4 border-brand-700"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`h-9 w-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? "bg-brand-700 text-white border-brand-800"
                                : "bg-brand-50 text-brand-700 border-brand-200"
                            }`}
                          >
                            {dosen.nama_dosen
                              ? dosen.nama_dosen
                                  .replace(/^dr\.\s*/i, "")
                                  .split(" ")
                                  .filter(Boolean)
                                  .map((p) => p[0])
                                  .slice(0, 2)
                                  .join("")
                                  .toUpperCase()
                              : "D"}
                          </div>

                          <div className="min-w-0">
                            <p
                              className={`text-xs font-bold truncate ${
                                isSelected ? "text-brand-900" : "text-gray-900"
                              }`}
                            >
                              {dosen.nama_dosen}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                              <span className="font-mono bg-gray-100 px-1.5 py-0.2 rounded text-[10px] font-semibold text-gray-700">
                                Kode: {dosen.kode_dosen}
                              </span>
                              {dosen.nik && (
                                <span className="font-mono">
                                  NIK: {dosen.nik}
                                </span>
                              )}
                            </div>
                            {dosen.alamat_email && dosen.alamat_email !== "-" && (
                              <p className="text-[10px] text-gray-400 font-mono truncate mt-0.5">
                                {dosen.alamat_email}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 ml-3">
                          {isSelected ? (
                            <span className="h-5 w-5 rounded-full bg-brand-700 text-white flex items-center justify-center shadow-xs">
                              <svg
                                className="h-3 w-3"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </span>
                          ) : (
                            <span className="h-5 w-5 rounded-full border border-gray-300 block hover:border-brand-400" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {fieldErrors.kode_dosen && (
                <p className="text-[11px] text-red-600 font-medium">
                  {fieldErrors.kode_dosen}
                </p>
              )}
            </div>

            {/* ─── SECTION 2: Pilih Komponen Penilaian (Node Key) ─── */}
            <div className="space-y-2.5 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-gray-800">
                    Pilih Komponen Penilaian (Node Key) <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[11px] text-gray-500">
                    Tentukan komponen penilaian yang akan dialokasikan kepada dosen yang dipilih
                  </p>
                </div>

                {availableNodes.length > 0 && !isManualInput && (
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={handleSelectAllNodes}
                      className="text-brand-700 hover:underline font-semibold"
                    >
                      Pilih Semua
                    </button>
                    <span className="text-gray-300">&bull;</span>
                    <button
                      type="button"
                      onClick={handleClearAllNodes}
                      className="text-gray-500 hover:underline"
                    >
                      Batal Pilih
                    </button>
                  </div>
                )}
              </div>

              {/* Mode Toggle: Available Nodes vs Manual Input */}
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setIsManualInput(!isManualInput)}
                  className="text-[11px] text-brand-700 hover:text-brand-800 font-medium flex items-center gap-1"
                >
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <span>
                    {isManualInput
                      ? "Gunakan Daftar Komponen Tersedia"
                      : "Ketik Node Key Manual"}
                  </span>
                </button>
              </div>

              {isManualInput ? (
                /* Manual Node Key Input */
                <div className="space-y-1">
                  <input
                    type="text"
                    placeholder="Contoh: komponen_1 atau osce"
                    value={customNodeKey}
                    onChange={(e) => {
                      setCustomNodeKey(e.target.value);
                      if (fieldErrors.node_key) {
                        setFieldErrors((prev) => ({ ...prev, node_key: "" }));
                      }
                      setErrorMessage(null);
                    }}
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-brand-600 transition font-mono"
                  />
                  <p className="text-[10px] text-gray-400">
                    Masukkan nama atau identifier node key yang terdaftar pada template assessment kelas ini.
                  </p>
                </div>
              ) : availableNodes.length === 0 ? (
                /* Empty Available Nodes fallback */
                <div className="p-4 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50 space-y-2">
                  <p className="text-gray-500 text-xs font-medium">
                    Belum ada daftar komponen penilaian yang dimuat.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsManualInput(true)}
                    className="text-xs text-brand-700 font-semibold underline"
                  >
                    Ketik Node Key Secara Manual
                  </button>
                </div>
              ) : (
                /* List of Available Components */
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {availableNodes.map((node) => {
                    const isChecked = selectedNodeKeys.includes(node.node_key);

                    return (
                      <div
                        key={node.node_key}
                        onClick={() => handleToggleNodeKey(node.node_key)}
                        className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                          isChecked
                            ? "bg-blue-50/70 border-blue-300 shadow-2xs"
                            : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Checkbox Icon */}
                          <div
                            className={`h-4.5 w-4.5 rounded-md flex items-center justify-center shrink-0 transition ${
                              isChecked
                                ? "bg-blue-600 text-white"
                                : "border border-gray-300 bg-white"
                            }`}
                          >
                            {isChecked && (
                              <svg
                                className="h-3 w-3"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-gray-900 text-xs">
                                {node.name || formatNodeKey(node.node_key)}
                              </span>
                              <span className="font-mono text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded">
                                {node.node_key}
                              </span>
                            </div>
                            {node.assigned_dosen && (
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                Saat ini ditugaskan ke:{" "}
                                <span className="font-semibold text-gray-700">
                                  {node.assigned_dosen_name || `Kode #${node.assigned_dosen}`}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>

                        {isChecked && (
                          <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full shrink-0">
                            Dipilih
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {fieldErrors.node_key && (
                <p className="text-[11px] text-red-600 font-medium">
                  {fieldErrors.node_key}
                </p>
              )}
            </div>

            {/* ─── Preview Payload Ringkas ─── */}
            <div className="rounded-xl bg-gray-50 p-3 border border-gray-100 text-[11px] space-y-1">
              <div className="flex items-center justify-between text-gray-500">
                <span>Method & Endpoint:</span>
                <span className="font-mono font-semibold text-brand-800">
                  PUT /api/staff/assessment/dosen/assign
                </span>
              </div>
              <div className="flex items-center justify-between text-gray-500">
                <span>Assessment ID:</span>
                <span className="font-mono font-semibold text-gray-700">
                  {assessmentDosenId || "-"}
                </span>
              </div>
              <div className="flex items-center justify-between text-gray-500">
                <span>Jumlah Penugasan:</span>
                <span className="font-mono font-semibold text-gray-700">
                  {isManualInput
                    ? customNodeKey.trim()
                      ? 1
                      : 0
                    : selectedNodeKeys.length}{" "}
                  komponen
                </span>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2.5 bg-gray-50/60 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              disabled={
                isSubmitting ||
                !selectedKodeDosen ||
                (isManualInput
                  ? !customNodeKey.trim()
                  : selectedNodeKeys.length === 0) ||
                !assessmentDosenId
              }
              className="flex items-center gap-1.5"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              <span>{isSubmitting ? "Menyimpan Penugasan..." : "Simpan Penugasan"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
