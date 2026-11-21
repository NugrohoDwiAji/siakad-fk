import { useState, useEffect } from "react";
import { FormField, Label } from "@/components/ui";
import { createKurikulumAngkatan } from "@/features/admin/api/kurikulum";
import type { KurikulumAngkatanItem } from "@/features/admin/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CreateKurikulumCardProps {
  onClose: () => void;
  onSuccess: (data: KurikulumAngkatanItem) => void;
}

interface FormValues {
  kode_nama_kurikulum: string;
  angkatan: string;
  ekstensi: string;
  paket: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

// ─── Radio Group ──────────────────────────────────────────────────────────────

function RadioYesNo({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        {["Y", "N"].map((opt) => (
          <label key={opt} className={`inline-flex items-center gap-2 text-sm cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
            <input
              type="radio"
              name={label}
              value={opt}
              checked={value === opt}
              onChange={() => onChange(opt)}
              disabled={disabled}
              className="h-4 w-4 border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-gray-700">{opt === "Y" ? "Ya" : "Tidak"}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateKurikulumCard({ onClose, onSuccess }: CreateKurikulumCardProps) {
  const [values, setValues] = useState<FormValues>({
    kode_nama_kurikulum: "",
    angkatan: "",
    ekstensi: "N",
    paket: "N",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function set<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): boolean {
    const e: FormErrors = {};

    if (!values.kode_nama_kurikulum.trim()) {
      e.kode_nama_kurikulum = "Kode nama kurikulum wajib diisi.";
    } else if (values.kode_nama_kurikulum.trim().length > 4) {
      e.kode_nama_kurikulum = "Kode nama kurikulum maksimal 4 karakter.";
    }

    if (!values.angkatan.trim()) {
      e.angkatan = "Angkatan wajib diisi.";
    } else if (!/^\d{4}$/.test(values.angkatan.trim())) {
      e.angkatan = "Angkatan harus 4 digit tahun (contoh: 2026).";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setSaveError(null);

    const result = await createKurikulumAngkatan({
      angkatan: values.angkatan.trim(),
      kode_nama_kurikulum: values.kode_nama_kurikulum,
      ekstensi: values.ekstensi,
      paket: values.paket,
    });

    setSaving(false);

    if (result.status) {
      onSuccess(result.data);
    } else {
      setSaveError(result.message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="font-semibold text-gray-800">Tambah Kurikulum</h2>
            <p className="text-xs text-gray-400 mt-0.5">Lengkapi form berikut untuk membuat kurikulum baru</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error */}
        {saveError && (
          <div className="mx-5 mt-4 bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm">
            {saveError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <FormField
            label="Kode Nama Kurikulum"
            placeholder="contoh: KR01"
            value={values.kode_nama_kurikulum}
            onChange={(e) => set("kode_nama_kurikulum", e.target.value)}
            error={errors.kode_nama_kurikulum}
            required
            maxLength={4}
            disabled={saving}
          />

          <FormField
            label="Angkatan"
            placeholder="contoh: 2026"
            value={values.angkatan}
            onChange={(e) => set("angkatan", e.target.value)}
            error={errors.angkatan}
            required
            maxLength={4}
            disabled={saving}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <RadioYesNo
              label="Ekstensi"
              value={values.ekstensi}
              onChange={(val) => set("ekstensi", val)}
              disabled={saving}
            />

            <RadioYesNo
              label="Paket"
              value={values.paket}
              onChange={(val) => set("paket", val)}
              disabled={saving}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition"
              disabled={saving}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-800 text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition inline-flex items-center gap-2"
            >
              {saving && (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
