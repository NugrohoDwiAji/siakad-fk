import { Link } from "react-router-dom";

export default function DosenKaprodiValidasiNilai() {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-white shadow-xs border border-gray-200/80 px-6 py-5">
        <div className="flex items-center gap-2 text-xs text-brand-700 font-semibold uppercase tracking-wider mb-1">
          <span>Persetujuan Nilai</span>
          <span>•</span>
          <span>Portal Kaprodi</span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
          Validasi Nilai Mahasiswa
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Persetujuan dan penguncian nilai akhir mata kuliah / blok sebelum diterbitkan ke KHS mahasiswa.
        </p>
      </div>

      {/* Blank / Placeholder State Card */}
      <div className="rounded-2xl bg-white shadow-xs border border-gray-200/80 p-12 text-center">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center mb-4 border border-brand-100 shadow-2xs">
          <svg
            className="h-8 w-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 mb-3">
          Halaman Dalam Pengembangan
        </span>

        <h2 className="text-lg font-bold text-gray-900">
          Modul Validasi Nilai Massal
        </h2>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto leading-relaxed">
          Fitur validasi nilai massal dan pengesahan KHS mahasiswa sedang dipersiapkan. Untuk saat ini, Anda dapat memantau perolehan nilai dan rincian komponen nilai melalui menu <strong>Validasi Penilaian</strong>.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/dosen/penilaian/validasi"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span>Buka Validasi Penilaian</span>
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
