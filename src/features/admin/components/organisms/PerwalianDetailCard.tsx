import { useEffect } from "react";
import type { PerwalianItem } from "@/features/admin/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PerwalianDetailCardProps {
  data: PerwalianItem;
  onClose: () => void;
}

// ─── Info Item ────────────────────────────────────────────────────────────────

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-gray-400 font-medium">{label}</dt>
      <dd className="text-sm text-gray-800 font-medium">{value}</dd>
    </div>
  );
}

// ─── Section Divider ──────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function PerwalianDetailCard({ data, onClose }: PerwalianDetailCardProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            {/* Avatar initials */}
            <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center shrink-0 select-none">
              <span className="text-sm font-bold text-brand-700">
                {data.nama_mahasiswa
                  ?.split(" ")
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase() || "?"}
              </span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">Detail Perwalian</h2>
              <p className="text-xs text-gray-400 mt-0.5">{data.nama_mahasiswa}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
            <SectionLabel>Informasi Mahasiswa</SectionLabel>
            <InfoItem label="NIM" value={data.nim} />
            <InfoItem label="Nama Mahasiswa" value={data.nama_mahasiswa} />
            <InfoItem label="Program Studi" value={data.nama_program_studi} />

            <SectionLabel>Dosen Pembimbing</SectionLabel>
            <InfoItem label="Dosen Wali" value={data.nama_dosen || "-"} />
            <InfoItem label="Dosen Perwakilan" value={data.nama_dosen_perwakilan || "-"} />
          </dl>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 flex justify-end rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-800 text-white hover:bg-brand-700 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
