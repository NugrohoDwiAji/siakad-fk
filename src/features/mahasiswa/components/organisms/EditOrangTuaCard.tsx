import { useState } from "react";
import Button from "../../../../components/atoms/Button";
import FormField from "../../../../components/molecules/FormField";
import TextareaField from "../../../../components/molecules/TextareaField";
import type { OrangTua } from "../../types/mahasiswa";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type EditOrangTuaValues = OrangTua;

interface EditOrangTuaCardProps {
  orangTua: OrangTua;
  onSave: (values: EditOrangTuaValues) => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

// ─── Validation ────────────────────────────────────────────────────────────────

type EditOrangTuaErrors = Partial<Record<keyof EditOrangTuaValues, string>>;

const phoneRegex = /^(\+62|0)[0-9]{8,13}$/;

function validate(values: EditOrangTuaValues): EditOrangTuaErrors {
  const errors: EditOrangTuaErrors = {};
  if (!values.namaAyah.trim()) errors.namaAyah = "Nama ayah wajib diisi.";
  if (!values.namaIbu.trim()) errors.namaIbu = "Nama ibu wajib diisi.";
  if (values.nohpAyah && !phoneRegex.test(values.nohpAyah.trim()))
    errors.nohpAyah = "Format no. handphone tidak valid.";
  if (values.nohpIbu && !phoneRegex.test(values.nohpIbu.trim()))
    errors.nohpIbu = "Format no. handphone tidak valid.";
  if (!values.alamat.trim()) errors.alamat = "Alamat orang tua wajib diisi.";
  return errors;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function EditOrangTuaCard({
  orangTua,
  onSave,
  onCancel,
  isLoading = false,
}: EditOrangTuaCardProps) {
  const [values, setValues] = useState<EditOrangTuaValues>({ ...orangTua });
  const [errors, setErrors] = useState<EditOrangTuaErrors>({});

  function set<K extends keyof EditOrangTuaValues>(field: K, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(values);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    await onSave(values);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <svg className="h-5 w-5 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx={9} cy={7} r={4} />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <h2 className="text-base font-semibold text-gray-800">Ubah Data Orang Tua / Wali</h2>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="px-6 py-6 flex flex-col gap-8">
          {/* Ayah */}
          <section>
            <h3 className="text-xs font-bold text-brand-700 uppercase tracking-widest mb-4">
              Ayah
            </h3>
            <div className="flex flex-col gap-4">
              <FormField
                label="Nama Ayah"
                placeholder="Nama lengkap ayah"
                value={values.namaAyah}
                onChange={(e) => set("namaAyah", e.target.value)}
                error={errors.namaAyah}
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Pekerjaan Ayah"
                  placeholder="Pekerjaan ayah"
                  value={values.pekerjaanAyah}
                  onChange={(e) => set("pekerjaanAyah", e.target.value)}
                  error={errors.pekerjaanAyah}
                />
                <FormField
                  label="No. Handphone Ayah"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={values.nohpAyah}
                  onChange={(e) => set("nohpAyah", e.target.value)}
                  error={errors.nohpAyah}
                />
              </div>
            </div>
          </section>

          <div className="border-t border-gray-100" />

          {/* Ibu */}
          <section>
            <h3 className="text-xs font-bold text-brand-700 uppercase tracking-widest mb-4">
              Ibu
            </h3>
            <div className="flex flex-col gap-4">
              <FormField
                label="Nama Ibu"
                placeholder="Nama lengkap ibu"
                value={values.namaIbu}
                onChange={(e) => set("namaIbu", e.target.value)}
                error={errors.namaIbu}
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Pekerjaan Ibu"
                  placeholder="Pekerjaan ibu"
                  value={values.pekerjaanIbu}
                  onChange={(e) => set("pekerjaanIbu", e.target.value)}
                  error={errors.pekerjaanIbu}
                />
                <FormField
                  label="No. Handphone Ibu"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={values.nohpIbu}
                  onChange={(e) => set("nohpIbu", e.target.value)}
                  error={errors.nohpIbu}
                />
              </div>
            </div>
          </section>

          <div className="border-t border-gray-100" />

          {/* Alamat */}
          <section>
            <h3 className="text-xs font-bold text-brand-700 uppercase tracking-widest mb-4">
              Alamat
            </h3>
            <TextareaField
              label="Alamat Orang Tua"
              rows={3}
              placeholder="Alamat lengkap orang tua / wali"
              value={values.alamat}
              onChange={(e) => set("alamat", e.target.value)}
              error={errors.alamat}
              required
            />
          </section>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  );
}
