import { useState } from "react";
import type { KurikulumSemester } from "@/features/mahasiswa/types";

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

// ─── Props ─────────────────────────────────────────────────────────────────────

interface KurikulumCardProps {
  data: KurikulumSemester;
  /** Semester aktif mahasiswa untuk highlight */
  semesterAktif?: number;
  /** Buka collapsed secara default */
  defaultOpen?: boolean;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function KurikulumCard({
  data,
  semesterAktif,
  defaultOpen = false,
}: KurikulumCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const isAktif = semesterAktif === data.semester;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-colors ${
        isAktif ? "border-brand-400" : "border-gray-200"
      }`}
    >
      {/* ── Header ── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors focus-visible:outline-none"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          {/* Semester badge */}
          <div
            className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 select-none ${
              isAktif
                ? "bg-brand-800 text-white"
                : "bg-brand-50 text-brand-700"
            }`}
          >
            {data.semester}
          </div>

          <div>
            <p className="font-semibold text-gray-800 leading-tight">
              Semester {data.semester}
              {isAktif && (
                <span className="ml-2 text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                  Aktif
                </span>
              )}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {data.mataKuliah.length} mata kuliah &bull; {data.totalSks} SKS
            </p>
          </div>
        </div>

        {/* SKS summary + chevron */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex gap-2 text-xs">
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
              Teori: {data.mataKuliah.reduce((s, m) => s + m.sksTeori, 0)} SKS
            </span>
            <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-medium">
              Praktek: {data.mataKuliah.reduce((s, m) => s + m.sksPraktek, 0)} SKS
            </span>
          </div>
          <ChevronIcon open={open} />
        </div>
      </button>

      {/* ── Table (desktop) ── */}
      {open && (
        <div className="border-t border-gray-100 overflow-x-auto hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-32">Kode</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama Mata Kuliah</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center w-24">SKS Teori</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center w-24">SKS Praktek</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center w-20">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.mataKuliah.map((mk) => (
                <tr key={mk.code} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-gray-500">{mk.code}</td>
                  <td className="px-5 py-3 text-gray-800 font-medium">{mk.nama}</td>
                  <td className="px-5 py-3 text-center text-gray-700">{mk.sksTeori}</td>
                  <td className="px-5 py-3 text-center text-gray-700">{mk.sksPraktek}</td>
                  <td className="px-5 py-3 text-center font-semibold text-brand-700">{mk.sksTeori + mk.sksPraktek}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-brand-50 border-t border-brand-100">
                <td colSpan={2} className="px-5 py-2.5 text-xs font-semibold text-brand-700">Total</td>
                <td className="px-5 py-2.5 text-center text-xs font-bold text-blue-700">{data.mataKuliah.reduce((s, m) => s + m.sksTeori, 0)}</td>
                <td className="px-5 py-2.5 text-center text-xs font-bold text-amber-700">{data.mataKuliah.reduce((s, m) => s + m.sksPraktek, 0)}</td>
                <td className="px-5 py-2.5 text-center text-xs font-bold text-brand-700">{data.totalSks}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* ── Cards (mobile) ── */}
      {open && (
        <div className="md:hidden border-t border-gray-100">
          <div className="divide-y divide-gray-100">
            {data.mataKuliah.map((mk) => (
              <div key={mk.code} className="px-5 py-3 flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-xs text-gray-500">{mk.code}</span>
                  <span className="text-sm text-gray-800 font-medium">{mk.nama}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-medium">T: {mk.sksTeori}</span>
                  <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">P: {mk.sksPraktek}</span>
                  <span className="text-xs font-bold text-brand-700">{mk.sksTeori + mk.sksPraktek}</span>
                </div>
              </div>
            ))}
            <div className="px-5 py-2.5 bg-brand-50 flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-700">Total</span>
              <span className="text-xs font-bold text-brand-700">{data.totalSks} SKS</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export type { KurikulumCardProps };
