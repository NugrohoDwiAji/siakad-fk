import { useState } from "react";
import type { MataKuliah } from "@/features/admin/kurikulumTypes";
import StatusBadge from "../atoms/StatusBadge";

// ─── Icons ────────────────────────────────────────────────────────────────────

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

function EyeIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface KurikulumTableProps {
  data: MataKuliah[];
  onDetail?: (mk: MataKuliah) => void;
  onEdit: (mk: MataKuliah) => void;
  onDelete: (id: string) => void;
}

// ─── Delete confirm row ───────────────────────────────────────────────────────

function DeleteConfirmRow({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <td colSpan={8} className="px-4 py-2 bg-red-50 border-t border-red-100">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-red-700 font-medium">Yakin ingin menghapus mata kuliah ini?</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-3 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
          >
            Hapus
          </button>
        </div>
      </div>
    </td>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function KurikulumTable({ data, onDetail, onEdit, onDelete }: KurikulumTableProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <svg className="h-12 w-12 text-gray-300 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <p className="text-sm font-medium text-gray-500">Belum ada mata kuliah.</p>
        <p className="text-xs text-gray-400 mt-0.5">Klik "Tambah Mata Kuliah" untuk menambahkan.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-10">No</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Kode</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama Mata Kuliah</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Semester</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">SKS T</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">SKS P</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide w-20">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((mk, i) => (
            <>
              <tr
                key={mk.id}
                className={`bg-white hover:bg-brand-50/40 transition-colors ${confirmDeleteId === mk.id ? "bg-red-50/60" : ""}`}
              >
                <td className="px-4 py-3 text-gray-400 text-xs text-center">{i + 1}</td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {mk.kode}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">{mk.nama}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-brand-50 text-brand-700 text-xs font-bold">
                    {mk.semester}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-gray-700 tabular-nums">{mk.sksTeori}</td>
                <td className="px-4 py-3 text-center text-gray-700 tabular-nums">{mk.sksPraktek}</td>
                <td className="px-4 py-3 text-center font-semibold text-gray-800 tabular-nums">
                  {mk.sksTeori + mk.sksPraktek}
                </td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge status={mk.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => onDetail?.(mk)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Lihat Detail"
                    >
                      <EyeIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setConfirmDeleteId(null); onEdit(mk); }}
                      className="p-1.5 rounded-md text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      title="Edit"
                    >
                      <EditIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(confirmDeleteId === mk.id ? null : mk.id)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Hapus"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>

              {/* Inline delete confirmation */}
              {confirmDeleteId === mk.id && (
                <tr key={`${mk.id}-confirm`}>
                  <DeleteConfirmRow
                    onConfirm={() => { onDelete(mk.id); setConfirmDeleteId(null); }}
                    onCancel={() => setConfirmDeleteId(null)}
                  />
                </tr>
              )}
            </>
          ))}
        </tbody>

        {/* Footer — SKS summary */}
        <tfoot>
          <tr className="bg-gray-50 border-t border-gray-200">
            <td colSpan={4} className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Total
            </td>
            <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 tabular-nums">
              {data.reduce((s, mk) => s + mk.sksTeori, 0)}
            </td>
            <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-700 tabular-nums">
              {data.reduce((s, mk) => s + mk.sksPraktek, 0)}
            </td>
            <td className="px-4 py-2.5 text-center text-xs font-bold text-brand-700 tabular-nums">
              {data.reduce((s, mk) => s + mk.sksTeori + mk.sksPraktek, 0)}
            </td>
            <td colSpan={2} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
