import type { StatusValidasi } from "../../types/mahasiswa";
import ValidasiBadge from "../atoms/ValidasiBadge";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface KrsValidasiProps {
  dosenWali: StatusValidasi;
  keuangan: StatusValidasi;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function KrsValidasi({ dosenWali, keuangan }: KrsValidasiProps) {
  return (
    <div className="flex flex-col gap-1.5 min-w-40">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 w-18 shrink-0">Dosen Wali</span>
        <ValidasiBadge status={dosenWali} />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 w-18 shrink-0">Keuangan</span>
        <ValidasiBadge status={keuangan} />
      </div>
    </div>
  );
}
