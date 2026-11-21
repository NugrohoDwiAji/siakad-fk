import { useState } from "react";
import type { KrsEditResponse } from "@/features/mahasiswa/types";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface KrsEditCardProps {
  data: KrsEditResponse;
  saving: boolean;
  onClose: () => void;
  onSave: (semester: number, matakuliahCodes: string[]) => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function KrsEditCard({ data, saving, onClose, onSave }: KrsEditCardProps) {
  const { mahasiswa, krs, kurikulum } = data;

  // Track selected mata kuliah by kode_matakuliah
  const [selected, setSelected] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const mk of krs.detail) {
      initial.add(mk.kode_matakuliah);
    }
    return initial;
  });

  function toggle(kode: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(kode)) {
        next.delete(kode);
      } else {
        next.add(kode);
      }
      return next;
    });
  }

  function toggleSemester(semesters: { kode_matakuliah: string }[]) {
    const allSelected = semesters.every((mk) => selected.has(mk.kode_matakuliah));
    setSelected((prev) => {
      const next = new Set(prev);
      for (const mk of semesters) {
        if (allSelected) {
          next.delete(mk.kode_matakuliah);
        } else {
          next.add(mk.kode_matakuliah);
        }
      }
      return next;
    });
  }

  function handleSave() {
    const allMk = kurikulum.flatMap((s) => s.matakuliah);
    const codes = allMk
      .filter((mk) => selected.has(mk.kode_matakuliah) && mk.code_matakuliah)
      .map((mk) => mk.code_matakuliah);
    onSave(krs.semester, codes);
  }

  // Calculate totals from kurikulum based on selected
  const allMk = kurikulum.flatMap((s) => s.matakuliah);
  const selectedMk = allMk.filter((mk) => selected.has(mk.kode_matakuliah));
  const totalSksTeori = selectedMk.reduce((s, mk) => s + mk.sks_teori, 0);
  const totalSksPraktik = selectedMk.reduce((s, mk) => s + mk.sks_praktik, 0);
  const totalSks = totalSksTeori + totalSksPraktik;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* ── Header ── */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-800">
            Edit KRS Semester {krs.semester}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {mahasiswa.nim} &bull; {mahasiswa.nama_mahasiswa} &bull; {mahasiswa.nama_program_studi}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {/* TODO: open add mata kuliah modal */}}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-brand-600 bg-brand-50 border border-brand-200 hover:bg-brand-100 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Tambah Mata Kuliah
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── SKS Info ── */}
      <div className="px-5 py-3 bg-blue-50 border-b border-blue-100 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-blue-600 font-medium">Tahun Akademik:</span>
          <span className="text-sm font-semibold text-blue-800">{krs.tahun_akademik}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-blue-600 font-medium">SKS Limit:</span>
          <span className="text-sm font-semibold text-blue-800">{krs.sks_limit}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-blue-600 font-medium">SKS Terpakai:</span>
          <span className="text-sm font-semibold text-blue-800">{totalSks}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-blue-600 font-medium">SKS Tersisa:</span>
          <span className={`text-sm font-semibold ${krs.sks_limit - totalSks >= 0 ? "text-green-700" : "text-red-600"}`}>
            {krs.sks_limit - totalSks}
          </span>
        </div>
      </div>

      {/* ── Kurikulum List ── */}
      <div className="max-h-[500px] overflow-y-auto">
        {kurikulum.map((sem) => {
          const allSemSelected = sem.matakuliah.every((mk) => selected.has(mk.kode_matakuliah));
          const semSks = sem.matakuliah.reduce((s, mk) => s + mk.sks_teori + mk.sks_praktik, 0);

          return (
            <div key={sem.semester} className="border-b border-gray-100 last:border-b-0">
              {/* Semester Header */}
              <button
                type="button"
                onClick={() => toggleSemester(sem.matakuliah)}
                className="w-full px-5 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={allSemSelected}
                    onChange={() => toggleSemester(sem.matakuliah)}
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-sm font-semibold text-gray-700">Semester {sem.semester}</span>
                  <span className="text-xs text-gray-400">{sem.matakuliah.length} mata kuliah &bull; {semSks} SKS</span>
                </div>
                <span className="text-xs text-gray-400">
                  {sem.matakuliah.filter((mk) => selected.has(mk.kode_matakuliah)).length} dipilih
                </span>
              </button>

              {/* Mata Kuliah List */}
              <div className="divide-y divide-gray-50">
                {sem.matakuliah.map((mk) => {
                  const isChecked = selected.has(mk.kode_matakuliah);
                  const mkSks = mk.sks_teori + mk.sks_praktik;

                  return (
                    <label
                      key={mk.kode_matakuliah}
                      className={`flex items-center gap-3 px-5 py-2.5 cursor-pointer transition ${
                        isChecked ? "bg-brand-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggle(mk.kode_matakuliah)}
                        className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{mk.kode_matakuliah}</span>
                          <span className="text-sm text-gray-800 font-medium truncate">{mk.nama_matakuliah}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-medium">T: {mk.sks_teori}</span>
                        <span className="text-xs text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium">P: {mk.sks_praktik}</span>
                        <span className="text-xs font-semibold text-gray-700 w-10 text-right">{mkSks} SKS</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500">
            Dipilih: <span className="font-semibold text-gray-800">{selected.size}</span> mata kuliah
          </span>
          <span className="text-xs text-gray-500">
            Total SKS: <span className="font-bold text-brand-600">{totalSks}</span>
          </span>
          {totalSks > krs.sks_limit && (
            <span className="text-xs text-red-600 font-medium">Melebihi SKS Limit!</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={totalSks > krs.sks_limit || saving}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition inline-flex items-center gap-2"
          >
            {saving && (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {saving ? "Menyimpan..." : "Simpan KRS"}
          </button>
        </div>
      </div>
    </div>
  );
}
