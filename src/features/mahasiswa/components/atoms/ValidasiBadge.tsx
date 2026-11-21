import type { StatusValidasi } from "@/features/mahasiswa/types";

// ─── Config ────────────────────────────────────────────────────────────────────

const statusConfig: Record<
  StatusValidasi,
  { bg: string; text: string; dot: string }
> = {
  Tervalidasi: {
    bg: "bg-green-100",
    text: "text-green-700",
    dot: "bg-green-500",
  },
  Menunggu: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    dot: "bg-amber-400",
  },
  Ditolak: {
    bg: "bg-red-100",
    text: "text-red-700",
    dot: "bg-red-500",
  },
};

// ─── Props ─────────────────────────────────────────────────────────────────────

interface ValidasiBadgeProps {
  status: StatusValidasi;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function ValidasiBadge({ status }: ValidasiBadgeProps) {
  const { bg, text, dot } = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dot}`} />
      {status}
    </span>
  );
}
