import { useState, useEffect } from "react";
import type { KrsApiResponse, KrsDetailResponseData, KrsUpdateResponseData, KurikulumSemesterItem } from "@/features/mahasiswa/types";
import { getKurikulum } from "@/features/mahasiswa/api/kurikulum";
import { createKrsDetail, updateKrs } from "@/features/mahasiswa/api/krs";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface KrsFormCardProps {
  data: KrsApiResponse;
  semester: number;
  onClose: () => void;
  onSuccess: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function KrsFormCard({ data, semester, onClose, onSuccess }: KrsFormCardProps) {
  const { mahasiswa, kurikulum: allKurikulum } = data;

  const isEditMode = data.krs !== null;

  const [kurikulum, setKurikulum] = useState<KurikulumSemesterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [successResponse, setSuccessResponse] = useState<KrsDetailResponseData | KrsUpdateResponseData | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchKurikulum() {
      setLoading(true);
      setError(null);

      if (allKurikulum && allKurikulum.length > 0) {
        const filtered = allKurikulum.filter((s) => s.semester === semester);
        setKurikulum(filtered);
      } else {
        const result = await getKurikulum();
        if (result.status) {
          const semesters = result.data as KurikulumSemesterItem[];
          const filtered = semesters.filter((s) => s.semester === semester);
          setKurikulum(filtered);
        } else {
          setError(result.message);
        }
      }
      setLoading(false);
    }
    fetchKurikulum();
  }, [semester, allKurikulum]);

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

  async function handleSave() {
    setSaving(true);
    setSaveError(null);

    const allMk = kurikulum.flatMap((s) => s.matakuliah);
    const codes = allMk
      .filter((mk) => selected.has(mk.kode_matakuliah) && mk.code_matakuliah)
      .map((mk) => mk.code_matakuliah);

    let result;
    if (isEditMode) {
      result = await updateKrs({ semester, matakuliah: codes });
    } else {
      result = await createKrsDetail({ matakuliah: codes });
    }

    setSaving(false);
    if (result.status) {
      setSuccessResponse(result.data);
      setSuccessMessage(result.message || (isEditMode ? "KRS berhasil diperbarui." : "KRS berhasil disimpan."));
    } else {
      setSaveError(result.message || "Gagal menyimpan KRS.");
    }
  }

  function handleCloseSuccess() {
    setSuccessResponse(null);
    setSuccessMessage(null);
    onSuccess();
  }

  // Calculate totals
  const allMk = kurikulum.flatMap((s) => s.matakuliah);
  const selectedMk = allMk.filter((mk) => selected.has(mk.kode_matakuliah));
  const totalSksTeori = selectedMk.reduce((s, mk) => s + mk.sks_teori, 0);
  const totalSksPraktik = selectedMk.reduce((s, mk) => s + mk.sks_praktik, 0);
  const totalSks = totalSksTeori + totalSksPraktik;

  // ── Success Alert ──
  if (successResponse) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">{isEditMode ? "KRS Berhasil Diperbarui" : "KRS Berhasil Disimpan"}</h2>
          <button
            onClick={handleCloseSuccess}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Success Message */}
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="p-2 rounded-full bg-green-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-green-700 font-medium">{successMessage}</p>
          </div>

          {/* KRS Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Informasi KRS</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Tahun Akademik:</span>
                <p className="font-medium text-gray-800">{successResponse.krs.tahun_akademik}</p>
              </div>
              <div>
                <span className="text-gray-500">Semester:</span>
                <p className="font-medium text-gray-800">{successResponse.krs.semester}</p>
              </div>
            </div>
          </div>

          {/* Mata Kuliah */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Mata Kuliah yang Dipilih</h3>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {successResponse.matakuliah.map((mk) => (
                <div key={mk.kode_matakuliah} className="flex items-center justify-between text-sm py-1 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{mk.kode_matakuliah}</span>
                    <span className="text-gray-800">{mk.nama_matakuliah}</span>
                  </div>
                  <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-xs font-medium">{mk.sks} SKS</span>
                </div>
              ))}
            </div>
          </div>

          {/* SKS Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Informasi SKS</h3>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="text-center">
                <span className="text-gray-500 text-xs">Limit</span>
                <p className="font-bold text-gray-800 text-lg">{successResponse.sks.limit}</p>
              </div>
              <div className="text-center">
                <span className="text-gray-500 text-xs">Terpakai</span>
                <p className="font-bold text-blue-700 text-lg">{successResponse.sks.terpakai}</p>
              </div>
              <div className="text-center">
                <span className="text-gray-500 text-xs">Tersisa</span>
                <p className="font-bold text-green-700 text-lg">{successResponse.sks.tersisa}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={handleCloseSuccess}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  // ── Form ──
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* ── Header ── */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-800">
            Pengisian KRS Semester {semester}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {mahasiswa.nim} &bull; {mahasiswa.nama_mahasiswa} &bull; {mahasiswa.nama_program_studi}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* ── SKS Info ── */}
      <div className="px-5 py-3 bg-blue-50 border-b border-blue-100 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-blue-600 font-medium">SKS Terpakai:</span>
          <span className="text-sm font-semibold text-blue-800">{totalSks}</span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-h-[500px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : error ? (
          <div className="p-5 text-center text-red-500 text-sm">{error}</div>
        ) : kurikulum.length === 0 ? (
          <div className="p-5 text-center text-gray-400 text-sm">Tidak ada mata kuliah untuk semester ini.</div>
        ) : (
          kurikulum.map((sem) => {
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
          })
        )}
      </div>

      {/* ── Error ── */}
      {saveError && (
        <div className="px-5 py-3 bg-red-50 border-t border-red-100">
          <p className="text-sm text-red-600">{saveError}</p>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500">
            Dipilih: <span className="font-semibold text-gray-800">{selected.size}</span> mata kuliah
          </span>
          <span className="text-xs text-gray-500">
            Total SKS: <span className="font-bold text-brand-600">{totalSks}</span>
          </span>
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
            disabled={selected.size === 0 || saving}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition inline-flex items-center gap-2"
          >
            {saving && (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {saving ? "Menyimpan..." : isEditMode ? "Update KRS" : "Simpan KRS"}
          </button>
        </div>
      </div>
    </div>
  );
}
