import type { KrsApiResponse, KrsEditResponse, KrsUpdateResponseData } from "@/features/mahasiswa/types";
import KrsTable from "../components/organisms/KrsTable";
import KrsInfoCard from "../components/organisms/KrsInfoCard";
import KrsEditCard from "../components/organisms/KrsEditCard";
import KrsFormCard from "../components/organisms/KrsFormCard";
import KrsUpdateSuccess from "../components/organisms/KrsUpdateSuccess";
import { useState, useEffect } from "react";
import { getKrs, getKrsEdit, updateKrs } from "@/features/mahasiswa/api/krs";
import { getSemesterList } from "@/features/mahasiswa/api/semester";

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Krs() {
  const [data, setData] = useState<KrsApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<number | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [semesterOptions, setSemesterOptions] = useState<number[]>([]);

  // ── Payment required (404) ──
  const [paymentRequired, setPaymentRequired] = useState(false);

  // ── Edit state ──
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<KrsEditResponse | null>(null);
  const [_editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // ── Save state ──
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<KrsUpdateResponseData | null>(null);

  // ── KRS Form state ──
  const [formMode, setFormMode] = useState(false);

  useEffect(() => {
    async function fetchSemesters() {
      const result = await getSemesterList();
      if (result.status && result.data) {
        const semesters = result.data.semester.map((s) => s.semester);
        setSemesterOptions(semesters);
        if (semesters.length > 0) {
          handleGetKrs(semesters[0]);
        }
      }
    }
    fetchSemesters();
  }, []);

  async function handleGetKrs(semester: number) {
    setLoading(semester);
    setError(null);
    setData(null);
    setPaymentRequired(false);
    setFormMode(false);
    setSelectedSemester(semester);

    const response = await getKrs(semester);

    if (!response.status) {
      if (response.kode === 404) {
        setPaymentRequired(true);
        setData(null);
      } else {
        setError(response.message);
        setData(null);
      }
    } else {
      setData(response.data);
      setPaymentRequired(false);
    }
    setLoading(null);
  }

  async function handleEdit() {
    if (!selectedSemester) return;

    setEditLoading(true);
    setEditError(null);
    setEditData(null);

    const response = await getKrsEdit(selectedSemester);

    if (!response.status) {
      setEditError(response.message);
    } else {
      setEditData(response.data);
      setEditMode(true);
    }
    setEditLoading(false);
  }

  function handleCloseEdit() {
    setEditMode(false);
    setEditData(null);
    setEditError(null);
    setSaveError(null);
  }

  async function handleSave(semester: number, matakuliahCodes: string[]) {
    setSaving(true);
    setSaveError(null);

    const response = await updateKrs({ semester, matakuliah: matakuliahCodes });

    if (!response.status) {
      setSaveError(response.message);
    } else {
      setUpdateSuccess(response.data);
    }
    setSaving(false);
  }

  function handleCloseSuccess() {
    setUpdateSuccess(null);
    setEditMode(false);
    setEditData(null);
    if (selectedSemester) {
      handleGetKrs(selectedSemester);
    }
  }

  const krs = data?.krs;
  const hasKrsData = krs !== null && krs !== undefined;
  const hasDetail = hasKrsData && krs.detail.length > 0;

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kartu Rencana Studi</h1>
        <p className="text-sm text-gray-500 mt-1">
          {updateSuccess ? "KRS berhasil diperbarui" : editMode ? "Edit Kartu Rencana Studi" : formMode ? "Isi KRS" : "Pilih semester untuk melihat KRS"}
        </p>
      </div>

      {(error || editError || saveError) && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm">
          {error || editError || saveError}
        </div>
      )}

      {updateSuccess ? (
        <KrsUpdateSuccess data={updateSuccess} onClose={handleCloseSuccess} />
      ) : editMode && editData ? (
        <KrsEditCard data={editData} saving={saving} onClose={handleCloseEdit} onSave={handleSave} />
      ) : formMode && data ? (
        <KrsFormCard
          data={data}
          semester={selectedSemester!}
          onClose={() => setFormMode(false)}
          onSuccess={() => {
            setFormMode(false);
            if (selectedSemester) {
              handleGetKrs(selectedSemester);
            }
          }}
        />
      ) : (
        <>
          {/* Semester Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Pilih Semester</h3>
            <div className="flex flex-wrap gap-2">
              {semesterOptions.map((sem) => (
                <button
                  key={sem}
                  onClick={() => handleGetKrs(sem)}
                  disabled={loading !== null}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${
                      selectedSemester === sem && loading === null && (data !== null || paymentRequired)
                        ? "bg-brand-600 text-white"
                        : loading === sem
                          ? "bg-brand-600 text-white animate-pulse"
                          : "bg-gray-100 text-gray-700 hover:bg-brand-50 hover:text-brand-700 border border-transparent hover:border-brand-200"
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {loading === sem ? "Memuat..." : `Semester ${sem}`}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Required (404) */}
          {paymentRequired && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">Pembayaran Belum Lunas</h3>
                  <p className="text-xs text-gray-500">Silahkan selesaikan pembayaran terlebih dahulu untuk mengisi KRS.</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-600 font-medium text-center">
                  Silahkan selesaikan pembayaran
                </p>
              </div>
            </div>
          )}

          {/* KRS Data Available */}
          {data && !paymentRequired && (
            <>
              <KrsInfoCard data={data} />

              {/* KRS is null - show payment required */}
              {!hasKrsData && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-red-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700">Pembayaran Belum Lunas</h3>
                      <p className="text-xs text-gray-500">Silahkan selesaikan pembayaran terlebih dahulu untuk mengisi KRS.</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-600 font-medium text-center">
                      Silahkan selesaikan pembayaran
                    </p>
                  </div>
                </div>
              )}

              {/* KRS exists but detail is empty - show form button */}
              {hasKrsData && !hasDetail && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-full bg-blue-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700">KRS Belum Diisi</h3>
                      <p className="text-xs text-gray-500">Anda belum mengisi KRS untuk semester ini. Silahkan isi KRS terlebih dahulu.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFormMode(true)}
                    className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 transition"
                  >
                    Isi KRS
                  </button>
                </div>
              )}

              {/* KRS has detail data - show table */}
              {hasDetail && (
                <KrsTable
                  data={data}
                  semesterAktif={selectedSemester ?? undefined}
                  onEdit={handleEdit}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
