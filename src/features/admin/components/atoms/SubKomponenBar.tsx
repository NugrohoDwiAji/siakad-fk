import type { SubKomponen } from "../../types/penilaianBlok";

// ─── Icons ─────────────────────────────────────────────────────────────────────

function EditIcon() {
  return (
    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface SubKomponenBarProps {
  subKomponen: SubKomponen;
  index: number;
  onEdit?: (subKomponen: SubKomponen) => void;
  onDelete?: (id: string) => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function SubKomponenBar({ subKomponen, index, onEdit, onDelete }: SubKomponenBarProps) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 rounded-md border border-gray-100 group hover:border-brand-200 hover:bg-brand-50/30 transition-colors">
      {/* Huruf urut: a, b, c… */}
      <span className="text-xs font-semibold text-gray-400 w-4 shrink-0 text-center select-none">
        {String.fromCharCode(97 + index)}.
      </span>

      {/* Judul */}
      <span className="flex-1 text-sm text-gray-700 truncate">
        {subKomponen.judul}
      </span>

      {/* Bobot badge */}
      <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-600">
        {subKomponen.bobot}%
      </span>

      {/* Progress bar */}
      <div className="hidden sm:block w-16 h-1 bg-gray-100 rounded-full overflow-hidden shrink-0">
        <div
          className="h-full bg-brand-400 rounded-full transition-all"
          style={{ width: `${subKomponen.bobot}%` }}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          type="button"
          onClick={() => onEdit?.(subKomponen)}
          className="p-1 rounded text-gray-400 hover:text-brand-600 hover:bg-brand-100 transition-colors"
          title="Edit sub komponen"
        >
          <EditIcon />
        </button>
        <button
          type="button"
          onClick={() => onDelete?.(subKomponen.id)}
          className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Hapus sub komponen"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}
