// ─── Props ────────────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: "aktif" | "tidak_aktif";
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function StatusBadge({ status }: StatusBadgeProps) {
  const isAktif = status === "aktif";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        isAktif
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-500"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isAktif ? "bg-green-500" : "bg-gray-400"}`}
      />
      {isAktif ? "Aktif" : "Tidak Aktif"}
    </span>
  );
}
