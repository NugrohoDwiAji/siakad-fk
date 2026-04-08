import type { OrangTua } from "../../types/mahasiswa";

interface OrangTuaCardProps {
  orangTua: OrangTua;
  onEdit?: () => void;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-0.5 sm:gap-0 py-2.5 border-b border-gray-100 last:border-0">
      <dt className="w-full sm:w-48 shrink-0 text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </dt>
      <dd className="text-sm text-gray-800">{value || "-"}</dd>
    </div>
  );
}

function ParentIcon() {
  return (
    <svg className="h-5 w-5 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx={9} cy={7} r={4} />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export default function OrangTuaCard({ orangTua, onEdit }: OrangTuaCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <ParentIcon />
          <h2 className="text-base font-semibold text-gray-800">Data Orang Tua / Wali</h2>
        </div>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-800 transition-colors"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Ubah
          </button>
        )}
      </div>

      <div className="px-6 py-4 grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-0 divide-y lg:divide-y-0">
        {/* Ayah */}
        <div>
          <h3 className="text-xs font-bold text-brand-700 uppercase tracking-widest mb-1 mt-2 lg:mt-0">
            Ayah
          </h3>
          <dl>
            <InfoRow label="Nama Ayah" value={orangTua.namaAyah} />
            <InfoRow label="Pekerjaan" value={orangTua.pekerjaanAyah} />
            <InfoRow label="No. Handphone" value={orangTua.nohpAyah} />
          </dl>
        </div>

        {/* Ibu */}
        <div>
          <h3 className="text-xs font-bold text-brand-700 uppercase tracking-widest mb-1 mt-4 lg:mt-0">
            Ibu
          </h3>
          <dl>
            <InfoRow label="Nama Ibu" value={orangTua.namaIbu} />
            <InfoRow label="Pekerjaan" value={orangTua.pekerjaanIbu} />
            <InfoRow label="No. Handphone" value={orangTua.nohpIbu} />
          </dl>
        </div>
      </div>

      {/* Alamat orang tua — full width */}
      <div className="px-6 pb-4 border-t border-gray-100 pt-3">
        <dl>
          <InfoRow label="Alamat Orang Tua" value={orangTua.alamat} />
        </dl>
      </div>
    </div>
  );
}
