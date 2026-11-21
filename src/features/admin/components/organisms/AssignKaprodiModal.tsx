import { useState, useEffect, useMemo, useRef } from "react";
import Button from "@/components/ui/Button";
import { getListDosen, updateKaprodiProgramStudi } from "@/features/admin/api/masterData";
import type { DosenItem, UpdateKaprodiRequest } from "@/features/admin/types";

interface AssignKaprodiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message?: string) => void;
  codeProgramStudi: string;
  namaProgramStudi: string;
  currentKaprodiCode?: string | null;
  currentKaprodiName?: string | null;
}

export default function AssignKaprodiModal({
  isOpen,
  onClose,
  onSuccess,
  codeProgramStudi,
  namaProgramStudi,
  currentKaprodiCode,
  currentKaprodiName,
}: AssignKaprodiModalProps) {
  const [dosenList, setDosenList] = useState<DosenItem[]>([]);
  const [loadingDosen, setLoadingDosen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCodeDosen, setSelectedCodeDosen] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const modalRef = useRef<HTMLDivElement>(null);

  // Initialize selected code when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setSelectedCodeDosen(currentKaprodiCode || "");
    setSearchQuery("");
    setErrorMessage(null);
    setFieldErrors({});

    let isMounted = true;
    setLoadingDosen(true);

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
  }, [isOpen, currentKaprodiCode]);

  // Handle ESC key
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // Filter dosen list by search query
  const filteredDosen = useMemo(() => {
    if (!searchQuery.trim()) return dosenList;
    const q = searchQuery.toLowerCase();
    return dosenList.filter((d) => {
      const matchNama = d.nama_dosen?.toLowerCase().includes(q);
      const matchNik = d.nik?.toLowerCase().includes(q);
      const matchHomebase = d.homebase?.toLowerCase().includes(q);
      return matchNama || matchNik || matchHomebase;
    });
  }, [dosenList, searchQuery]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    if (!codeProgramStudi) {
      setErrorMessage("Kode Program Studi tidak ditemukan.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: UpdateKaprodiRequest = {
        code: codeProgramStudi,
        code_dosen: selectedCodeDosen ? selectedCodeDosen : null,
      };

      const res = await updateKaprodiProgramStudi(payload);

      if (!res.status) {
        setErrorMessage(res.message || "Gagal menetapkan Kaprodi.");
        if (res.errors) {
          setFieldErrors(res.errors);
        }
      } else {
        onSuccess(res.message || "Kaprodi program studi berhasil diperbarui.");
        onClose();
      }
    } catch {
      setErrorMessage("Terjadi kesalahan jaringan atau server saat menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/50 backdrop-blur-xs transition-opacity"
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] transition-all"
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
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
              <h2 className="text-base font-bold text-gray-800">
                {currentKaprodiCode ? "Ubah Ketua Program Studi" : "Tambah Ketua Program Studi"}
              </h2>
              <p className="text-xs text-gray-500">{namaProgramStudi}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
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
            {/* Error Banner */}
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
                  {fieldErrors.code && (
                    <p className="text-[11px] text-red-600 mt-0.5">{fieldErrors.code[0]}</p>
                  )}
                  {fieldErrors.code_dosen && (
                    <p className="text-[11px] text-red-600 mt-0.5">{fieldErrors.code_dosen[0]}</p>
                  )}
                </div>
              </div>
            )}

            {/* Current Status Info */}
            <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-blue-700 block uppercase tracking-wider">
                  Program Studi
                </span>
                <p className="text-xs font-bold text-gray-800 mt-0.5">{namaProgramStudi}</p>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-medium text-gray-500 block">Kaprodi Saat Ini</span>
                <p className="text-xs font-semibold text-gray-700 mt-0.5">
                  {currentKaprodiName || "Belum ditentukan"}
                </p>
              </div>
            </div>

            {/* Dosen Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-gray-700">
                  Pilih Dosen untuk Menjadi Kaprodi <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-gray-400">
                  {dosenList.length > 0 ? `${dosenList.length} Dosen Terdaftar` : ""}
                </span>
              </div>

              {/* Search Filter */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari nama, NIK, atau homebase dosen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-600 transition"
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

              {/* Dosen List */}
              {loadingDosen ? (
                <div className="flex items-center justify-center py-8 gap-2.5 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                  <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-gray-500">Memuat daftar dosen...</span>
                </div>
              ) : filteredDosen.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/50 text-gray-400 italic">
                  {searchQuery.trim()
                    ? "Tidak ada dosen yang cocok dengan pencarian."
                    : "Belum ada data dosen."}
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl max-h-60 overflow-y-auto divide-y divide-gray-100 bg-white">
                  {filteredDosen.map((dosen) => {
                    const isSelected = selectedCodeDosen === dosen.code;
                    const isCurrent = currentKaprodiCode === dosen.code;

                    return (
                      <div
                        key={dosen.code}
                        onClick={() => setSelectedCodeDosen(dosen.code)}
                        className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition select-none ${
                          isSelected
                            ? "bg-blue-50/70 border-l-4 border-l-blue-600"
                            : "hover:bg-gray-50/80"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              isSelected
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {dosen.nama_dosen?.charAt(0)?.toUpperCase() || "D"}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-800 text-xs truncate">
                                {dosen.nama_dosen}
                              </p>
                              {isCurrent && (
                                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-medium shrink-0">
                                  Saat Ini
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                              NIK: <span className="font-mono text-gray-600">{dosen.nik || "-"}</span>
                              {dosen.homebase && ` • ${dosen.homebase}`}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0">
                          <input
                            type="radio"
                            name="selectedDosenKaprodi"
                            checked={isSelected}
                            onChange={() => setSelectedCodeDosen(dosen.code)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Unassign option if currently has Kaprodi */}
              {currentKaprodiCode && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCodeDosen("")}
                    className={`text-xs flex items-center gap-1.5 transition ${
                      selectedCodeDosen === ""
                        ? "text-red-700 font-semibold"
                        : "text-gray-500 hover:text-red-600"
                    }`}
                  >
                    <svg
                      className="h-3.5 w-3.5 text-red-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    <span>Kosongkan Kaprodi (Lepas Penugasan)</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Simpan Kaprodi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
