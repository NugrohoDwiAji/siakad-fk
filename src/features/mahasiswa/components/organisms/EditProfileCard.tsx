import { useState } from "react";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import SelectField from "@/components/ui/SelectField";
import TextareaField from "@/components/ui/TextareaField";
import RadioGroupField from "@/components/ui/RadioGroupField";
import PhotoUpload from "../atoms/PhotoUpload";
import type { Mahasiswa } from "@/features/mahasiswa/types";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type EditProfileValues = Pick<
  Mahasiswa,
  | "nama"
  | "tempatLahir"
  | "tanggalLahir"
  | "jenisKelamin"
  | "agama"
  | "golonganDarah"
  | "alamat"
  | "noHp"
  | "email"
  | "foto"
>;

interface EditProfileCardProps {
  mahasiswa: Mahasiswa;
  onSave: (values: EditProfileValues) => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

// ─── Options ───────────────────────────────────────────────────────────────────

const agamaOptions = [
  "Islam",
  "Kristen",
  "Katolik",
  "Hindu",
  "Buddha",
  "Konghucu",
].map((v) => ({ value: v, label: v }));

const golDarahOptions = ["A", "B", "AB", "O"].map((v) => ({
  value: v,
  label: v,
}));

const jenisKelaminOptions = [
  { value: "L" as const, label: "Laki-laki" },
  { value: "P" as const, label: "Perempuan" },
];

// ─── Validation ────────────────────────────────────────────────────────────────

type EditProfileErrors = Partial<Record<keyof EditProfileValues, string>>;

function validate(values: EditProfileValues): EditProfileErrors {
  const errors: EditProfileErrors = {};
  if (!values.nama.trim()) errors.nama = "Nama lengkap wajib diisi.";
  if (!values.tempatLahir.trim())
    errors.tempatLahir = "Tempat lahir wajib diisi.";
  if (!values.tanggalLahir) errors.tanggalLahir = "Tanggal lahir wajib diisi.";
  if (!values.alamat.trim()) errors.alamat = "Alamat wajib diisi.";
  if (!values.noHp.trim()) errors.noHp = "No. handphone wajib diisi.";
  else if (!/^(\+62|0)[0-9]{8,13}$/.test(values.noHp.trim()))
    errors.noHp = "Format no. handphone tidak valid.";
  if (!values.email.trim()) errors.email = "Email wajib diisi.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
    errors.email = "Format email tidak valid.";
  return errors;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function EditProfileCard({
  mahasiswa,
  onSave,
  onCancel,
  isLoading = false,
}: EditProfileCardProps) {
  const [values, setValues] = useState<EditProfileValues>({
    nama: mahasiswa.nama,
    tempatLahir: mahasiswa.tempatLahir,
    tanggalLahir: mahasiswa.tanggalLahir,
    jenisKelamin: mahasiswa.jenisKelamin,
    agama: mahasiswa.agama,
    golonganDarah: mahasiswa.golonganDarah,
    alamat: mahasiswa.alamat,
    noHp: mahasiswa.noHp,
    email: mahasiswa.email,
    foto: mahasiswa.foto,
  });

  const [errors, setErrors] = useState<EditProfileErrors>({});

  function set<K extends keyof EditProfileValues>(
    field: K,
    value: EditProfileValues[K],
  ) {
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
        <svg
          className="h-5 w-5 text-brand-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        <h2 className="text-base font-semibold text-gray-800">
          Ubah Data Pribadi
        </h2>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="px-6 py-6 flex flex-col gap-6">
          {/* Photo */}
          <div className="flex justify-center">
            <PhotoUpload
              preview={values.foto}
              nama={values.nama || mahasiswa.nama}
              onChange={(url) => set("foto", url)}
            />
          </div>

          {/* Row: Nama */}
          <FormField
            label="Nama Lengkap"
            placeholder="Nama lengkap sesuai KTP"
            value={values.nama}
            onChange={(e) => set("nama", e.target.value)}
            error={errors.nama}
            required
          />

          {/* Row: Tempat & Tanggal Lahir */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Tempat Lahir"
              placeholder="Kota tempat lahir"
              value={values.tempatLahir}
              onChange={(e) => set("tempatLahir", e.target.value)}
              error={errors.tempatLahir}
              required
            />
            <FormField
              label="Tanggal Lahir"
              type="date"
              value={values.tanggalLahir}
              onChange={(e) => set("tanggalLahir", e.target.value)}
              error={errors.tanggalLahir}
              required
            />
          </div>

          {/* Row: Jenis Kelamin & Golongan Darah */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <RadioGroupField
              label="Jenis Kelamin"
              name="jenisKelamin"
              options={jenisKelaminOptions}
              value={values.jenisKelamin}
              onChange={(v) => set("jenisKelamin", v)}
              error={errors.jenisKelamin}
              required
            />
            <SelectField
              label="Golongan Darah"
              options={golDarahOptions}
              placeholder="Pilih golongan darah"
              value={values.golonganDarah}
              onChange={(e) => set("golonganDarah", e.target.value)}
            />
          </div>

          {/* Agama */}
          <SelectField
            label="Agama"
            options={agamaOptions}
            placeholder="Pilih agama"
            value={values.agama}
            onChange={(e) => set("agama", e.target.value)}
          />

          {/* Alamat */}
          <TextareaField
            label="Alamat"
            rows={3}
            placeholder="Alamat lengkap tempat tinggal"
            value={values.alamat}
            onChange={(e) => set("alamat", e.target.value)}
            error={errors.alamat}
            required
          />

          {/* No HP & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="No. Handphone"
              type="tel"
              placeholder="08xxxxxxxxxx"
              value={values.noHp}
              onChange={(e) => set("noHp", e.target.value)}
              error={errors.noHp}
              required
            />
            <FormField
              label="Email"
              type="email"
              placeholder="nama@email.com"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              error={errors.email}
              required
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
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
