import { useState } from "react";
import type { SubKomponen } from "../../types/penilaianBlok";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface SubKomponenFormCardProps {
  /** Judul komponen induk, ditampilkan sebagai konteks */
  komponenJudul: string;
  /** Diisi saat mode edit, undefined untuk tambah baru */
  initial?: SubKomponen;
  onSave: (data: { judul: string; bobot: number }) => void;
  onCancel: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function SubKomponenFormCard({
  komponenJudul,
  initial,
  onSave,
  onCancel,
}: SubKomponenFormCardProps) {
  const [judul, setJudul] = useState(initial?.judul ?? "");
  const [bobot, setBobot] = useState<number>(initial?.bobot ?? 0);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!judul.trim()) {
      setError("Judul sub komponen tidak boleh kosong.");
      return;
    }
    if (bobot < 0 || bobot > 100) {
      setError("Bobot harus antara 0 dan 100.");
      return;
    }
    onSave({ judul: judul.trim(), bobot });
  }

  const isEdit = !!initial;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      {/* Card */}
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-[fadeInUp_0.18s_ease]">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              {isEdit ? "Edit Sub Komponen" : "Tambah Sub Komponen"}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">
              Komponen: <span className="font-medium text-gray-500">{komponenJudul}</span>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="judul-subkomp" className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Judul Sub Komponen <span className="text-red-500">*</span>
            </label>
            <input
              id="judul-subkomp"
              type="text"
              value={judul}
              onChange={(e) => { setJudul(e.target.value); setError(""); }}
              placeholder="Contoh: Soal Pilihan Ganda"
              className="w-full px-3.5 py-2.5 text-sm text-gray-800 bg-white border border-gray-300 rounded-md outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-colors"
              autoFocus
            />
          </div>

          {/* Bobot */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="bobot-subkomp" className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Bobot (%)
            </label>
            <div className="flex items-center gap-3">
              <input
                id="bobot-subkomp"
                type="number"
                min={0}
                max={100}
                value={bobot}
                onChange={(e) => { setBobot(Number(e.target.value)); setError(""); }}
                className="w-24 px-3.5 py-2.5 text-sm text-gray-800 bg-white border border-gray-300 rounded-md outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-colors"
              />
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-400 rounded-full transition-all"
                  style={{ width: `${Math.min(bobot, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-md">
              {error}
            </p>
          )}

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
