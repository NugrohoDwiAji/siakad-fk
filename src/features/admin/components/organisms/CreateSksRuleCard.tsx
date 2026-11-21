import { useState, useEffect } from "react";
import { FormField, SelectField } from "@/components/ui";
import type { SelectOption } from "@/components/ui/SelectField";
import { createSksRule, updateSksRule } from "@/features/admin/api/krs";
import { getListProgramStudi } from "@/features/admin/api/masterData";
import type { SksRuleItem } from "@/features/admin/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CreateSksRuleCardProps {
  onClose: () => void;
  onSuccess: () => void;
  editData?: SksRuleItem;
}

interface FormValues {
  code_program_studi: string;
  ip_min: string;
  ip_max: string;
  sks_yang_dapat_diambil: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateSksRuleCard({ onClose, onSuccess, editData }: CreateSksRuleCardProps) {
  const isEditMode = !!editData;

  const [values, setValues] = useState<FormValues>({
    code_program_studi: editData?.code_program_studi || "",
    ip_min: editData?.ip_min?.toString() || "",
    ip_max: editData?.ip_max?.toString() || "",
    sks_yang_dapat_diambil: editData?.sks_yang_dapat_diambil?.toString() || "",
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
          result.data.data.map((ps) => ({ value: ps.code, label: ps.nama_program_studi }))
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

    if (!values.code_program_studi) {
      e.code_program_studi = "Program studi wajib dipilih.";
    }

    if (!values.ip_min.trim()) {
      e.ip_min = "IP minimum wajib diisi.";
    } else {
      const ipMin = Number(values.ip_min);
      if (isNaN(ipMin) || ipMin < 0 || ipMin > 4) {
        e.ip_min = "IP minimum harus antara 0 - 4.";
      }
    }

    if (!values.ip_max.trim()) {
      e.ip_max = "IP maksimum wajib diisi.";
    } else {
      const ipMax = Number(values.ip_max);
      const ipMin = Number(values.ip_min);
      if (isNaN(ipMax) || ipMax < 0 || ipMax > 4) {
        e.ip_max = "IP maksimum harus antara 0 - 4.";
      } else if (!isNaN(ipMin) && ipMax < ipMin) {
        e.ip_max = "IP maksimum harus lebih besar atau sama dengan IP minimum.";
      }
    }

    if (!values.sks_yang_dapat_diambil.trim()) {
      e.sks_yang_dapat_diambil = "SKS wajib diisi.";
    } else {
      const sks = Number(values.sks_yang_dapat_diambil);
      if (isNaN(sks) || sks < 1 || sks > 32) {
        e.sks_yang_dapat_diambil = "SKS harus antara 1 - 32.";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setSaveError(null);

    const ipMin = Number(values.ip_min);
    const ipMax = Number(values.ip_max);
    const sks = Number(values.sks_yang_dapat_diambil);

    let result;
    if (isEditMode) {
      result = await updateSksRule({
        code: editData.code,
        code_program_studi: values.code_program_studi,
        ip_min: ipMin,
        ip_max: ipMax,
        sks_yang_dapat_diambil: sks,
      });
    } else {
      result = await createSksRule({
        code_program_studi: values.code_program_studi,
        ip_min: ipMin,
        ip_max: ipMax,
        sks_yang_dapat_diambil: sks,
      });
    }

    setSaving(false);

    if (result.status) {
      onSuccess();
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
            <h2 className="font-semibold text-gray-800">
              {isEditMode ? "Edit SKS Rule" : "Tambah SKS Rule"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEditMode ? "Perbarui data SKS rule" : "Lengkapi form untuk menambah SKS rule"}
            </p>
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
          <SelectField
            label="Program Studi"
            options={programStudiOptions}
            placeholder={loadingOptions ? "Memuat..." : "Pilih program studi"}
            value={values.code_program_studi}
            onChange={(e) => set("code_program_studi", e.target.value)}
            error={errors.code_program_studi}
            required
            disabled={saving || loadingOptions}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="IP Minimum"
              placeholder="0.00"
              type="number"
              step="0.01"
              min={0}
              max={4}
              value={values.ip_min}
              onChange={(e) => set("ip_min", e.target.value)}
              error={errors.ip_min}
              required
              disabled={saving}
            />

            <FormField
              label="IP Maksimum"
              placeholder="4.00"
              type="number"
              step="0.01"
              min={0}
              max={4}
              value={values.ip_max}
              onChange={(e) => set("ip_max", e.target.value)}
              error={errors.ip_max}
              required
              disabled={saving}
            />
          </div>

          <FormField
            label="SKS yang Dapat Diambil"
            placeholder="contoh: 24"
            type="number"
            min={1}
            max={32}
            value={values.sks_yang_dapat_diambil}
            onChange={(e) => set("sks_yang_dapat_diambil", e.target.value)}
            error={errors.sks_yang_dapat_diambil}
            required
            disabled={saving}
          />

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
              {saving ? "Menyimpan..." : isEditMode ? "Perbarui" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
