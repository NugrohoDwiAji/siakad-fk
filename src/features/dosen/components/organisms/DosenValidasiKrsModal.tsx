import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { validasiKrsMahasiswa } from "@/features/dosen/api/perwalian";
import type {
  DosenPerwalianItem,
  DosenValidasiKrsData,
  DosenValidasiKrsPayload,
} from "@/features/dosen/types";

interface DosenValidasiKrsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: DosenPerwalianItem | null;
  onSuccess: (data: DosenValidasiKrsData) => void;
}

export default function DosenValidasiKrsModal({
  isOpen,
  onClose,
  item,
  onSuccess,
}: DosenValidasiKrsModalProps) {
  const initialStatus = item?.status_krs === "N" ? "N" : "A";
  const [statusKrs, setStatusKrs] = useState<"A" | "N">(initialStatus);
  const [catatan, setCatatan] = useState(item?.catatan || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle ESC key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !isSaving) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSaving, onClose]);

  if (!isOpen || !item) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSaving || !item) return;

    setIsSaving(true);
    setError(null);

    const codeMahasiswa = item.code_mahasiswa || item.code;
    const payload: DosenValidasiKrsPayload = {
      code_mahasiswa: codeMahasiswa,
      status_krs: statusKrs,
      catatan: catatan.trim() ? catatan.trim() : null,
    };

    const res = await validasiKrsMahasiswa(payload);

    if (!res.status) {
      setIsSaving(false);
      setError(res.message || "Gagal menyimpan validasi KRS.");
      return;
    }

    setIsSaving(false);
    setIsSuccess(true);
    onSuccess(res.data);

    setTimeout(() => {
      onClose();
    }, 1100);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-xs transition-opacity"
      aria-modal="true"
      role="dialog"
      aria-labelledby="validasi-krs-title"
    >
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] transition-all">
        {/* Animated Progress Bar during saving */}
        {isSaving && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-brand-100 overflow-hidden z-30">
            <div className="h-full bg-linear-to-r from-brand-600 via-blue-400 to-brand-600 animate-pulse w-full" />
          </div>
        )}

        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 shrink-0">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <div>
              <h2
                id="validasi-krs-title"
                className="text-lg font-bold text-gray-900 leading-tight"
              >
                Validasi KRS Mahasiswa
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Konfirmasi persetujuan rencana studi mahasiswa
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 focus-visible:outline-none"
            aria-label="Tutup modal"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {isSuccess ? (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 ring-8 ring-green-50 animate-bounce">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Validasi Berhasil Disimpan!
              </h3>
              <p className="text-sm text-gray-500 mt-1 max-w-xs">
                Status KRS untuk {item.nama_mahasiswa} telah diperbarui.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Student overview */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-400 font-medium">Mahasiswa</span>
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700">
                    {item.nim}
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-900">
                  {item.nama_mahasiswa}
                </p>
                <div className="mt-2 pt-2 border-t border-gray-200/60 flex items-center justify-between text-gray-500 text-[11px]">
                  <span>Dosen Wali: {item.nama_dosen}</span>
                  {item.nama_dosen_perwakilan && (
                    <span>Perwakilan: {item.nama_dosen_perwakilan}</span>
                  )}
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                  <svg
                    className="h-4 w-4 text-red-500 shrink-0 mt-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="font-semibold text-red-800">
                      Gagal Menyimpan Validasi
                    </p>
                    <p className="text-red-600 mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              {/* Status KRS Choice */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Status Validasi KRS <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Option A: Disetujui */}
                  <label
                    className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      statusKrs === "A"
                        ? "border-green-500 bg-green-50/50 shadow-xs"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="h-7 w-7 rounded-lg bg-green-100 text-green-700 flex items-center justify-center font-bold text-xs">
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <input
                        type="radio"
                        name="status_krs"
                        value="A"
                        checked={statusKrs === "A"}
                        onChange={() => setStatusKrs("A")}
                        className="h-4 w-4 text-green-600 focus:ring-green-500"
                        disabled={isSaving}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      Setujui KRS (A)
                    </span>
                    <span className="text-[11px] text-gray-500 mt-0.5 leading-tight">
                      KRS diterima & divalidasi
                    </span>
                  </label>

                  {/* Option N: Ditolak */}
                  <label
                    className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      statusKrs === "N"
                        ? "border-red-500 bg-red-50/50 shadow-xs"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="h-7 w-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </div>
                      <input
                        type="radio"
                        name="status_krs"
                        value="N"
                        checked={statusKrs === "N"}
                        onChange={() => setStatusKrs("N")}
                        className="h-4 w-4 text-red-600 focus:ring-red-500"
                        disabled={isSaving}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      Tolak KRS (N)
                    </span>
                    <span className="text-[11px] text-gray-500 mt-0.5 leading-tight">
                      KRS perlu direvisi mahasiswa
                    </span>
                  </label>
                </div>
              </div>

              {/* Catatan Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="catatan-validasi"
                    className="text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Catatan Validasi (Opsional)
                  </label>
                  <span className="text-[11px] text-gray-400">
                    {catatan.length}/500
                  </span>
                </div>
                <textarea
                  id="catatan-validasi"
                  rows={3}
                  maxLength={500}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Berikan catatan, arahan, atau alasan penolakan untuk mahasiswa..."
                  disabled={isSaving}
                  className="w-full px-3.5 py-2.5 text-xs text-gray-800 bg-white border border-gray-200 rounded-xl outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition resize-none disabled:bg-gray-50"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={isSaving}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant={statusKrs === "A" ? "primary" : "danger"}
                  isLoading={isSaving}
                >
                  {isSaving
                    ? "Menyimpan..."
                    : statusKrs === "A"
                    ? "Setujui KRS"
                    : "Tolak KRS"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
