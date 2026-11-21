import { useState, useEffect } from "react";
import { FormField, SelectField, Label } from "@/components/ui";
import type { SelectOption } from "@/components/ui/SelectField";
import { createNamaKurikulum } from "@/features/admin/api/kurikulum";
import { getListProgramStudi } from "@/features/admin/api/masterData";
import type { KurikulumItem } from "@/features/admin/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CreateNamaKurikulumCardProps {
  onClose: () => void;
  onSuccess: (data: KurikulumItem) => void;
}

interface FormValues {
  nama_kurikulum: string;
  kode_program_studi: string;
  angkatan1: string;
  ekstensi1: string;
  paket1: string;
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

export default function CreateNamaKurikulumCard({ onClose, onSuccess }: CreateNamaKurikulumCardProps) {
  const [values, setValues] = useState<FormValues>({
    nama_kurikulum: "",
    kode_program_studi: "",
    angkatan1: "",
    ekstensi1: "N",
    paket1: "N",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [programStudiOptions, setProgramStudiOptions] = useState<SelectOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchOptions() {
      setLoadingOptions(true);
      const result = await getListProgramStudi(1, 100);
      if (cancelled) return;

      if (result.status && result.data) {
        setProgramStudiOptions(
          result.data.data.map((ps) => ({ value: String(ps.id), label: ps.nama_program_studi }))
        );
      }
      setLoadingOptions(false);
    }

    fetchOptions();
    return () => { cancelled = true; };
  }, []);

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

    if (!values.nama_kurikulum.trim()) {
      e.nama_kurikulum = "Nama kurikulum wajib diisi.";
    } else if (values.nama_kurikulum.trim().length > 20) {
      e.nama_kurikulum = "Nama kurikulum maksimal 20 karakter.";
    }

    if (!values.kode_program_studi) {
      e.kode_program_studi = "Program studi wajib dipilih.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setSaveError(null);

    const result = await createNamaKurikulum({
      nama_kurikulum: values.nama_kurikulum.trim(),
      kode_program_studi: Number(values.kode_program_studi),
      angkatan1: values.angkatan1.trim() || null,
      ekstensi1: values.ekstensi1,
      paket1: values.paket1,
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
            <h2 className="font-semibold text-gray-800">Tambah Nama Kurikulum</h2>
            <p className="text-xs text-gray-400 mt-0.5">Lengkapi form berikut untuk menambah nama kurikulum</p>
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
            label="Nama Kurikulum"
            placeholder="contoh: S1 Kedokteran (2026)"
            value={values.nama_kurikulum}
            onChange={(e) => set("nama_kurikulum", e.target.value)}
            error={errors.nama_kurikulum}
            required
            maxLength={20}
            disabled={saving}
          />

          <SelectField
            label="Program Studi"
            options={programStudiOptions}
            placeholder={loadingOptions ? "Memuat..." : "Pilih program studi"}
            value={values.kode_program_studi}
            onChange={(e) => set("kode_program_studi", e.target.value)}
            error={errors.kode_program_studi}
            required
            disabled={saving || loadingOptions}
          />

          <FormField
            label="Angkatan"
            placeholder="contoh: 2026"
            value={values.angkatan1}
            onChange={(e) => set("angkatan1", e.target.value)}
            maxLength={4}
            disabled={saving}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <RadioYesNo
              label="Ekstensi"
              value={values.ekstensi1}
              onChange={(val) => set("ekstensi1", val)}
              disabled={saving}
            />

            <RadioYesNo
              label="Paket"
              value={values.paket1}
              onChange={(val) => set("paket1", val)}
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
