import Button from "../../../../components/atoms/Button";

// ─── Icons ─────────────────────────────────────────────────────────────────────

function EyeIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PrinterIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface KrsActionsProps {
  onDetail?: () => void;
  onPrint?: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function KrsActions({ onDetail, onPrint }: KrsActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="soft"
        leftIcon={<EyeIcon />}
        onClick={onDetail}
      >
        Detail
      </Button>
      <Button
        size="sm"
        variant="outline"
        leftIcon={<PrinterIcon />}
        onClick={onPrint}
      >
        Print
      </Button>
    </div>
  );
}
