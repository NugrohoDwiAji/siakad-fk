import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Button from "@/components/ui/Button";
import { addStaffKelasDosen } from "@/features/admin/api/kelas";
import { getListDosen } from "@/features/admin/api/masterData";
import type {
  DosenItem,
  AddKelasDosenResponseData,
} from "@/features/admin/types";

interface AddDosenPengampuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data?: AddKelasDosenResponseData) => void;
  kelasId: number;
  namaKelas: string;
  namaMatakuliah: string;
  currentDosenCodes?: string[];
}

export default function AddDosenPengampuModal({
  isOpen,
  onClose,
  onSuccess,
  kelasId,
  namaKelas,
  namaMatakuliah,
  currentDosenCodes = [],
}: AddDosenPengampuModalProps) {
  const [dosenList, setDosenList] = useState<DosenItem[]>([]);
  const [loadingDosen, setLoadingDosen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCodeDosen, setSelectedCodeDosen] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const modalRef = useRef<HTMLDivElement>(null);

  // Close and reset handler
  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    setSelectedCodeDosen("");
    setSearchQuery("");
    setErrorMessage(null);
    setFieldErrors({});
    onClose();
  }, [isSubmitting, onClose]);

  // Load lecturer master list on open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) {
        setLoadingDosen(true);
        setErrorMessage(null);
      }
    });

    getListDosen(1, 100)
      .then((res) => {
        if (!isMounted) return;
        if (res.status && res.data) {
          setDosenList(res.data.data);
        }
        setLoadingDosen(false);
      })
      .catch(() => {
        if (isMounted) setLoadingDosen(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Keyboard handler for Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        handleClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isSubmitting, handleClose]);

  // Filtered lecturer list based on search query
  const filteredDosen = useMemo(() => {
    if (!searchQuery.trim()) return dosenList;
    const q = searchQuery.toLowerCase();
    return dosenList.filter(
      (d) =>
        (d.nama_dosen && d.nama_dosen.toLowerCase().includes(q)) ||
        (d.nik && d.nik.toLowerCase().includes(q))
    );
  }, [dosenList, searchQuery]);

  // Handle Form Submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedCodeDosen.trim()) {
      setFieldErrors({ code_dosen: "Silakan pilih dosen pengampu terlebih dahulu." });
      setErrorMessage("Dosen pengampu wajib dipilih.");
      return;
    }

    setFieldErrors({});
    setErrorMessage(null);
    setIsSubmitting(true);

    const res = await addStaffKelasDosen({
      kelas_id: kelasId,
      code_dosen: selectedCodeDosen.trim(),
    });

    setIsSubmitting(false);

    if (res.status) {
      setSelectedCodeDosen("");
      setSearchQuery("");
      setErrorMessage(null);
      setFieldErrors({});
      onSuccess(res.data);
      onClose();
    } else {
      setErrorMessage(res.message || "Gagal menambahkan dosen pengampu ke kelas.");
      if (res.errors) {
        const mappedErrors: Record<string, string> = {};
        Object.entries(res.errors).forEach(([k, msgs]) => {
          if (Array.isArray(msgs) && msgs.length > 0) {
            mappedErrors[k] = msgs[0];
          }
        });
        setFieldErrors(mappedErrors);
      }
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs transition-opacity animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-dosen-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          handleClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-gray-100"
      >
        {/* Header */}
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
              <h3
                id="add-dosen-modal-title"
                className="text-base font-bold text-gray-900"
              >
                Tambah Dosen Pengampu
              </h3>
              <p className="text-xs text-gray-500">
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
          <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
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

            {/* Dosen Selection Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-gray-700">
                  Pilih Dosen <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-gray-400">
                  {dosenList.length > 0 ? `${dosenList.length} Dosen Tersedia` : ""}
                </span>
              </div>

              {/* Search Filter */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari nama atau NIK dosen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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

              {/* Select or List */}
              {loadingDosen ? (
                <div className="flex items-center justify-center py-8 gap-2.5 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                  <div className="h-4 w-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-gray-500">Memuat daftar dosen...</span>
                </div>
              ) : filteredDosen.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/50 text-gray-400 italic">
                  {searchQuery.trim()
                    ? "Tidak ada dosen yang cocok dengan pencarian."
                    : "Belum ada data dosen."}
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl max-h-56 overflow-y-auto divide-y divide-gray-100 bg-white">
                  {filteredDosen.map((dosen) => {
                    const isAlreadyAssigned = currentDosenCodes.includes(dosen.code);
                    const isSelected = selectedCodeDosen === dosen.code;

                    return (
                      <div
                        key={dosen.code}
                        onClick={() => {
                          if (isAlreadyAssigned) return;
                          setSelectedCodeDosen(dosen.code);
                          if (fieldErrors.code_dosen) {
                            setFieldErrors((prev) => ({ ...prev, code_dosen: "" }));
                          }
                          setErrorMessage(null);
                        }}
                        className={`p-3 flex items-center justify-between cursor-pointer transition ${
                          isAlreadyAssigned
                            ? "bg-gray-50 opacity-60 cursor-not-allowed"
                            : isSelected
                            ? "bg-brand-50/80 border-l-4 border-brand-700"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`h-8 w-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "bg-brand-700 text-white"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {dosen.nama_dosen ? dosen.nama_dosen.charAt(0).toUpperCase() : "D"}
                          </div>
                          <div className="min-w-0">
                            <p
                              className={`text-xs font-bold truncate ${
                                isSelected ? "text-brand-900" : "text-gray-800"
                              }`}
                            >
                              {dosen.nama_dosen}
                            </p>
                            <p className="text-[11px] text-gray-400 font-mono">
                              NIK: {dosen.nik || "-"}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 ml-3">
                          {isAlreadyAssigned ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-200 text-gray-600">
                              Sudah Ditugaskan
                            </span>
                          ) : isSelected ? (
                            <span className="h-5 w-5 rounded-full bg-brand-700 text-white flex items-center justify-center">
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
                            <span className="h-5 w-5 rounded-full border border-gray-300 block" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {fieldErrors.code_dosen && (
                <p className="text-[11px] text-red-600 font-medium">
                  {fieldErrors.code_dosen}
                </p>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2.5 bg-gray-50/50 shrink-0">
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
              disabled={isSubmitting || !selectedCodeDosen}
            >
              Tambahkan ke Kelas
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
