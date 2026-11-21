// ─── Props ─────────────────────────────────────────────────────────────────────

interface AddIconButtonProps {
  onClick?: () => void;
  label?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function AddIconButton({ onClick, label = "Tambah Komponen" }: AddIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed border-brand-300 text-brand-600 hover:border-brand-500 hover:bg-brand-50 transition-colors w-full justify-center text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
    >
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      {label}
    </button>
  );
}
