import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import PasswordField from "@/components/ui/PasswordField";
import { updateDosenProfile } from "@/features/dosen/api/profile";
import { useDosenAuthStore } from "@/features/dosen/stores/dosenAuthStore";
import type { DosenUser, DosenProfileUpdatePayload } from "@/features/dosen/types";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface EditDosenProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: DosenUser;
  onSuccess?: (message?: string) => void;
}

interface FormValues {
  nik: string;
  no_telp: string;
  alamat_email: string;
  sandi: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

// ─── Validation ────────────────────────────────────────────────────────────────

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (values.nik.trim().length > 30) {
    errors.nik = "NIK maksimal 30 karakter.";
  }

  if (values.no_telp.trim().length > 20) {
    errors.no_telp = "No. telepon maksimal 20 karakter.";
  } else if (values.no_telp.trim() && !/^[0-9+()-\s]+$/.test(values.no_telp.trim())) {
    errors.no_telp = "Format no. telepon tidak valid.";
  }

  if (!values.alamat_email.trim()) {
    errors.alamat_email = "Alamat email wajib diisi.";
  } else if (values.alamat_email.trim().length > 75) {
    errors.alamat_email = "Email maksimal 75 karakter.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.alamat_email.trim())) {
    errors.alamat_email = "Format alamat email tidak valid.";
  }

  if (values.sandi && values.sandi.length < 6) {
    errors.sandi = "Kata sandi minimal 6 karakter.";
  }

  return errors;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function EditDosenProfileModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: EditDosenProfileModalProps) {
  const updateUser = useDosenAuthStore((state) => state.updateUser);
  const checkAuth = useDosenAuthStore((state) => state.checkAuth);

  const [values, setValues] = useState<FormValues>({
    nik: user.nik || "",
    no_telp: user.no_telp || "",
    alamat_email: user.alamat_email || "",
    sandi: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Handle ESC key press
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !isSaving) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSaving, onClose]);

  if (!isOpen) return null;

  function handleChange<K extends keyof FormValues>(field: K, val: string) {
    setValues((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (generalError) {
      setGeneralError(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSaving) return;

    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSaving(true);
    setGeneralError(null);

    const payload: DosenProfileUpdatePayload = {
      nik: values.nik.trim(),
      no_telp: values.no_telp.trim(),
      alamat_email: values.alamat_email.trim(),
    };

    if (values.sandi.trim() !== "") {
      payload.sandi = values.sandi;
    }

    const result = await updateDosenProfile(payload);

    if (!result.status) {
      setIsSaving(false);
      setGeneralError(result.message || "Gagal memperbarui profil.");

      // Map Laravel validation errors if present
      if (result.errors) {
        const fieldErrors: FormErrors = {};
        for (const [key, msgList] of Object.entries(result.errors)) {
          if (Array.isArray(msgList) && msgList.length > 0) {
            fieldErrors[key as keyof FormValues] = msgList[0];
          }
        }
        setErrors(fieldErrors);
      }
      return;
    }

    // Success response handling
    const msg = result.message || "Profil berhasil diperbarui.";
    setSuccessMessage(msg);
    setIsSaving(false);
    setIsSuccess(true);

    // Update store immediately for instant UI refresh
    updateUser({
      nik: values.nik.trim(),
      no_telp: values.no_telp.trim(),
      alamat_email: values.alamat_email.trim(),
    });

    // Sync with server me endpoint in background
    checkAuth();

    onSuccess?.(msg);

    // Smoothly close modal after showing success state
    setTimeout(() => {
      onClose();
    }, 1400);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-xs transition-opacity"
      aria-modal="true"
      role="dialog"
      aria-labelledby="edit-profile-modal-title"
    >
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] transition-all transform scale-100">
        {/* Animated Progress Bar during saving */}
        {isSaving && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-brand-100 overflow-hidden z-30">
            <div className="h-full bg-linear-to-r from-brand-600 via-blue-400 to-brand-600 animate-pulse w-full" />
          </div>
        )}

        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between bg-white relative">
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
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <div>
              <h2
                id="edit-profile-modal-title"
                className="text-lg font-bold text-gray-900 leading-tight"
              >
                Edit Profil Dosen
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Perbarui data akun dan informasi kontak Anda
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none"
            aria-label="Tutup modal"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Success State Overlay */}
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Perubahan Disimpan!</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-xs">{successMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Saving Status Notification */}
              {isSaving && (
                <div className="flex items-center gap-3 p-3.5 bg-blue-50/90 border border-blue-200 rounded-xl text-brand-900 transition-all">
                  <div className="h-4 w-4 rounded-full border-2 border-brand-600 border-t-transparent animate-spin shrink-0" />
                  <div className="text-xs">
                    <p className="font-semibold text-brand-900">Menyimpan Perubahan...</p>
                    <p className="text-brand-600">Sedang mengirimkan pembaruan data ke server.</p>
                  </div>
                </div>
              )}

              {/* General Error Alert */}
              {generalError && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  <svg
                    className="h-5 w-5 text-red-500 shrink-0 mt-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="flex-1 text-xs">
                    <p className="font-semibold text-red-800">Gagal Menyimpan</p>
                    <p className="text-red-600 mt-0.5">{generalError}</p>
                  </div>
                </div>
              )}

              {/* Academic Info (Read-only banner) */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-xs text-gray-600 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-gray-800 block">{user.nama_dosen}</span>
                  <span className="text-gray-500">
                    {user.nama_program_studi || "Program Studi Kedokteran"} • {user.homebase || "Homebase"}
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-gray-200 text-gray-700 font-medium rounded text-[11px] shrink-0">
                  {user.status_dosen || "Dosen"}
                </span>
              </div>

              {/* Field: NIK */}
              <FormField
                label="Nomor Induk Karyawan (NIK)"
                placeholder="Contoh: 24.6.XXX"
                maxLength={30}
                value={values.nik}
                onChange={(e) => handleChange("nik", e.target.value)}
                error={errors.nik}
                disabled={isSaving}
              />

              {/* Field: No. Telepon */}
              <FormField
                label="No. Telepon / WhatsApp"
                type="tel"
                placeholder="Contoh: 08123456789"
                maxLength={20}
                value={values.no_telp}
                onChange={(e) => handleChange("no_telp", e.target.value)}
                error={errors.no_telp}
                disabled={isSaving}
              />

              {/* Field: Email */}
              <FormField
                label="Alamat Email"
                type="email"
                placeholder="dosen@example.com"
                maxLength={75}
                value={values.alamat_email}
                onChange={(e) => handleChange("alamat_email", e.target.value)}
                error={errors.alamat_email}
                disabled={isSaving}
                required
              />

              {/* Field: Sandi Baru */}
              <div>
                <PasswordField
                  label="Kata Sandi Baru"
                  placeholder="Masukkan sandi baru (minimal 6 karakter)"
                  value={values.sandi}
                  onChange={(e) => handleChange("sandi", e.target.value)}
                  error={errors.sandi}
                  disabled={isSaving}
                />
                <p className="mt-1 text-[11px] text-gray-400">
                  Kosongkan jika Anda tidak ingin mengubah kata sandi akun.
                </p>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
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
                  variant="primary"
                  isLoading={isSaving}
                >
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
