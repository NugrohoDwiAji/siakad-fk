import type { KomponenPenilaian } from "../../types/penilaianBlok";

// ─── Icons ─────────────────────────────────────────────────────────────────────

function EditIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}

function SubBabIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface KomponenBarProps {
  komponen: KomponenPenilaian;
  index: number;
  onEdit?: (komponen: KomponenPenilaian) => void;
  onDelete?: (id: string) => void;
  onAddSubBab?: (komponen: KomponenPenilaian) => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function KomponenBar({ komponen, index, onEdit, onDelete, onAddSubBab }: KomponenBarProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border border-gray-200 shadow-sm group hover:border-brand-300 transition-colors">
      {/* Nomor urut */}
      <div className="h-7 w-7 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-brand-700">{index + 1}</span>
      </div>

      {/* Judul */}
      <span className="flex-1 text-sm font-medium text-gray-800 truncate">
        {komponen.judul}
      </span>

      {/* Bobot badge */}
      <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-brand-100 text-brand-700">
        {komponen.bobot}%
      </span>

      {/* Progress bar */}
      <div className="hidden sm:block w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden shrink-0">
        <div
          className="h-full bg-brand-500 rounded-full transition-all"
          style={{ width: `${komponen.bobot}%` }}
        />
      </div>

      {/* Sub bab count badge */}
      {komponen.subKomponen.length > 0 && (
        <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
          {komponen.subKomponen.length} sub
        </span>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          type="button"
          onClick={() => onAddSubBab?.(komponen)}
          className="p-1.5 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          title="Tambah sub bab"
        >
          <SubBabIcon />
        </button>
        <button
          type="button"
          onClick={() => onEdit?.(komponen)}
          className="p-1.5 rounded-md text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
          title="Edit komponen"
        >
          <EditIcon />
        </button>
        <button
          type="button"
          onClick={() => onDelete?.(komponen.id)}
          className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Hapus komponen"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}
