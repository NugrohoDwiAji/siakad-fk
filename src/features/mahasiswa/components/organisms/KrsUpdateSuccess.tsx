import type { KrsUpdateResponseData } from "@/features/mahasiswa/types";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface KrsUpdateSuccessProps {
  data: KrsUpdateResponseData;
  onClose: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function KrsUpdateSuccess({ data, onClose }: KrsUpdateSuccessProps) {
  const { krs, matakuliah, sks } = data;
  const totalSks = matakuliah.reduce((sum, mk) => sum + mk.sks, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* ── Success Header ── */}
      <div className="px-5 py-6 bg-green-50 border-b border-green-100 text-center">
        <div className="mx-auto h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-green-800">KRS Berhasil Diperbarui</h2>
        <p className="text-sm text-green-600 mt-1">Perubahan KRS telah disimpan ke dalam sistem</p>
      </div>

      {/* ── KRS Info ── */}
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Informasi KRS</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-gray-400">Semester</dt>
            <dd className="text-sm font-semibold text-gray-800">Semester {krs.semester}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-gray-400">Tahun Akademik</dt>
            <dd className="text-sm font-semibold text-gray-800">{krs.tahun_akademik}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-gray-400">Kode KRS</dt>
            <dd className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded truncate">{krs.code}</dd>
          </div>
        </div>
      </div>

      {/* ── SKS Summary ── */}
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Ringkasan SKS</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-700">{sks.limit}</p>
            <p className="text-xs text-blue-600 font-medium mt-1">SKS Limit</p>
          </div>
          <div className="text-center p-3 bg-brand-50 rounded-lg">
            <p className="text-2xl font-bold text-brand-700">{totalSks}</p>
            <p className="text-xs text-brand-600 font-medium mt-1">SKS Terpakai</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-700">{sks.tersisa}</p>
            <p className="text-xs text-green-600 font-medium mt-1">SKS Tersisa</p>
          </div>
        </div>
      </div>

      {/* ── Mata Kuliah List ── */}
      <div className="px-5 py-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Mata Kuliah ({matakuliah.length})</h3>
        <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <div className="col-span-2">Kode</div>
            <div className="col-span-7">Nama Mata Kuliah</div>
            <div className="col-span-3 text-right">SKS</div>
          </div>
          {matakuliah.map((mk) => (
            <div key={mk.kode_matakuliah} className="grid grid-cols-12 gap-2 px-4 py-2.5 hover:bg-gray-50 transition-colors">
              <div className="col-span-2">
                <span className="font-mono text-xs text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">{mk.kode_matakuliah}</span>
              </div>
              <div className="col-span-7 text-sm text-gray-800 font-medium">{mk.nama_matakuliah}</div>
              <div className="col-span-3 text-right text-sm font-semibold text-gray-700">{mk.sks}</div>
            </div>
          ))}
          <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-gray-50 font-semibold">
            <div className="col-span-9 text-right text-sm text-gray-700">Total</div>
            <div className="col-span-3 text-right text-sm text-brand-600">{totalSks} SKS</div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
        <button
          onClick={onClose}
          className="px-5 py-2 rounded-lg text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 transition"
        >
          Kembali ke KRS
        </button>
      </div>
    </div>
  );
}
