import { useState } from "react";
import type { KrsApiResponse } from "@/features/mahasiswa/types";

// ─── Chevron icon ──────────────────────────────────────────────────────────────

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 text-brand-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// ─── Info Item ──────────────────────────────────────────────────────────────────

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-gray-400 font-medium">{label}</dt>
      <dd className="text-sm text-gray-800 font-medium">{value}</dd>
    </div>
  );
}

// ─── Section Divider ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="col-span-full flex items-center gap-3 mt-1">
      <span className="text-xs font-semibold text-brand-700 uppercase tracking-wide whitespace-nowrap">
        {children}
      </span>
      <div className="h-px flex-1 bg-brand-100" />
    </div>
  );
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface KrsInfoCardProps {
  data: KrsApiResponse | null;
  defaultOpen?: boolean;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function KrsInfoCard({
  data,
  defaultOpen = false,
}: KrsInfoCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const mahasiswa = data?.mahasiswa;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* ── Header strip ── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full bg-brand-800 px-5 py-3 flex items-center justify-between gap-3 text-left hover:bg-brand-700 transition-colors focus-visible:outline-none"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          {/* Avatar initials */}
          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 select-none">
            <span className="text-sm font-bold text-white">
              {mahasiswa?.nama_mahasiswa
                ?.split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
                .toUpperCase() || "?"}
            </span>
          </div>
          <div>
            <p className="font-bold text-white leading-tight">
              {mahasiswa?.nama_mahasiswa || "Pilih semester untuk melihat data"}
            </p>
            <p className="text-xs text-brand-200 mt-0.5">
              {mahasiswa?.nim || "-"} &bull; {mahasiswa?.nama_program_studi || "-"}
            </p>
          </div>
        </div>
        <ChevronIcon open={open} />
      </button>

      {/* ── Body ── */}
      {open && mahasiswa && (
        <div className="px-5 py-4">
          <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">
            {/* Informasi Mahasiswa */}
            <SectionLabel>Informasi Mahasiswa</SectionLabel>

            <InfoItem label="NIM" value={mahasiswa.nim} />
            <InfoItem label="Nama Lengkap" value={mahasiswa.nama_mahasiswa} />
            <InfoItem label="Program Studi" value={mahasiswa.nama_program_studi} />
            {data?.krs && (
              <>
                <InfoItem label="Semester" value={`Semester ${data.krs.semester}`} />
                <InfoItem label="Tahun Akademik" value={data.krs.tahun_akademik} />
                <InfoItem label="Status Validasi" value={data.status_validasi === "Y" ? "Tervalidasi" : "Menunggu"} />
              </>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
