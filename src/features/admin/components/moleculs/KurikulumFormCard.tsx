import { useState } from "react";
import type { MataKuliah } from "@/features/admin/kurikulumTypes";

// ─── Types ────────────────────────────────────────────────────────────────────

type FormData = Omit<MataKuliah, "id">;

interface KurikulumFormCardProps {
  initial?: MataKuliah;
  onSave: (data: FormData) => void;
  onCancel: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function KurikulumFormCard({ initial, onSave, onCancel }: KurikulumFormCardProps) {
  const [kode, setKode] = useState(initial?.kode ?? "");
  const [nama, setNama] = useState(initial?.nama ?? "");
  const [semester, setSemester] = useState<number>(initial?.semester ?? 1);
  const [sksTeori, setSksTeori] = useState<number>(initial?.sksTeori ?? 2);
  const [sksPraktek, setSksPraktek] = useState<number>(initial?.sksPraktek ?? 0);
  const [status, setStatus] = useState<MataKuliah["status"]>(initial?.status ?? "aktif");
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const isEdit = !!initial;

  function validate(): boolean {
    const next: Partial<Record<keyof FormData, string>> = {};
    if (!kode.trim()) next.kode = "Kode mata kuliah wajib diisi.";
    if (!nama.trim()) next.nama = "Nama mata kuliah wajib diisi.";
    if (sksTeori < 0) next.sksTeori = "SKS teori tidak boleh negatif.";
    if (sksPraktek < 0) next.sksPraktek = "SKS praktik tidak boleh negatif.";
    if (sksTeori + sksPraktek === 0) next.sksTeori = "Total SKS harus lebih dari 0.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSave({ kode: kode.trim(), nama: nama.trim(), semester, sksTeori, sksPraktek, status });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 animate-[fadeInUp_0.18s_ease]">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              {isEdit ? "Edit Mata Kuliah" : "Tambah Mata Kuliah"}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEdit ? "Perbarui data mata kuliah." : "Masukkan data mata kuliah baru."}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 focus-visible:outline-none"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Kode */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Kode <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={kode}
              onChange={(e) => { setKode(e.target.value); setErrors((p) => ({ ...p, kode: undefined })); }}
              placeholder="Contoh: FK1101"
              className="w-full px-3.5 py-2.5 text-sm text-gray-800 bg-white border border-gray-300 rounded-md outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-colors"
              autoFocus
            />
            {errors.kode && <p className="text-xs text-red-600">{errors.kode}</p>}
          </div>

          {/* Nama */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Nama Mata Kuliah <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => { setNama(e.target.value); setErrors((p) => ({ ...p, nama: undefined })); }}
              placeholder="Contoh: Anatomi Dasar"
              className="w-full px-3.5 py-2.5 text-sm text-gray-800 bg-white border border-gray-300 rounded-md outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-colors"
            />
            {errors.nama && <p className="text-xs text-red-600">{errors.nama}</p>}
          </div>

          {/* Semester + SKS row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="px-3 py-2.5 text-sm text-gray-800 bg-white border border-gray-300 rounded-md outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-colors"
              >
                {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                SKS Teori
              </label>
              <input
                type="number"
                min={0}
                max={6}
                value={sksTeori}
                onChange={(e) => { setSksTeori(Number(e.target.value)); setErrors((p) => ({ ...p, sksTeori: undefined })); }}
                className="px-3 py-2.5 text-sm text-gray-800 bg-white border border-gray-300 rounded-md outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-colors"
              />
              {errors.sksTeori && <p className="text-xs text-red-600 col-span-3">{errors.sksTeori}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                SKS Praktik
              </label>
              <input
                type="number"
                min={0}
                max={6}
                value={sksPraktek}
                onChange={(e) => { setSksPraktek(Number(e.target.value)); setErrors((p) => ({ ...p, sksPraktek: undefined })); }}
                className="px-3 py-2.5 text-sm text-gray-800 bg-white border border-gray-300 rounded-md outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-colors"
              />
              {errors.sksPraktek && <p className="text-xs text-red-600">{errors.sksPraktek}</p>}
            </div>
          </div>

          {/* Total SKS info */}
          <p className="text-xs text-gray-400">
            Total SKS: <span className="font-semibold text-gray-600">{sksTeori + sksPraktek} SKS</span>
          </p>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Status
            </label>
            <div className="flex gap-4">
              {(["aktif", "tidak_aktif"] as const).map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value={s}
                    checked={status === s}
                    onChange={() => setStatus(s)}
                    className="accent-brand-700"
                  />
                  <span className="text-sm text-gray-700">
                    {s === "aktif" ? "Aktif" : "Tidak Aktif"}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-brand-800 hover:bg-brand-700 rounded-md transition-colors shadow-sm"
            >
              {isEdit ? "Simpan Perubahan" : "Tambah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
