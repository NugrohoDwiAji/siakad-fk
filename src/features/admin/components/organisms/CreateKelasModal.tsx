import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Button from "@/components/ui/Button";
import { createStaffKelas } from "@/features/admin/api/kelas";
import {
  getAllMatakuliah,
  getListMatakuliah,
  getListProgramStudi,
} from "@/features/admin/api/masterData";
import type {
  TahunAkademikItem,
  ProgramStudiItem,
  StaffKelasItem,
  MataKuliahItem,
  CreateKelasResponseData,
} from "@/features/admin/types";

interface CourseOption {
  code: string;
  kode: string;
  nama: string;
}

interface CreateKelasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (createdKelas?: CreateKelasResponseData) => void;
  tahunAkademikList: TahunAkademikItem[];
  programStudiList?: ProgramStudiItem[];
  kelasList?: StaffKelasItem[];
}

export default function CreateKelasModal({
  isOpen,
  onClose,
  onSuccess,
  tahunAkademikList,
  programStudiList: propProgramStudiList,
  kelasList = [],
}: CreateKelasModalProps) {
  const defaultYearId = useMemo(() => {
    const activeTa =
      tahunAkademikList.find((t) => t.status === "1" || t.status === "Aktif") ||
      tahunAkademikList[0];
    return activeTa ? activeTa.id : "";
  }, [tahunAkademikList]);

  // Form states
  const [codeMatakuliah, setCodeMatakuliah] = useState("");
  const [namaKelas, setNamaKelas] = useState("");
  const [kodeTahunAkademik, setKodeTahunAkademik] = useState<number | "">(defaultYearId);
  const [semester, setSemester] = useState("");
  const [kodeProgramStudi, setKodeProgramStudi] = useState("");

  // Master options states
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [searchCourseQuery, setSearchCourseQuery] = useState("");
  const [fetchedProgramStudiList, setFetchedProgramStudiList] = useState<ProgramStudiItem[]>([]);

  // Submission & Validation states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const modalRef = useRef<HTMLDivElement>(null);

  // Fetch Program Studi if not provided
  useEffect(() => {
    if (!isOpen) return;
    if (propProgramStudiList && propProgramStudiList.length > 0) return;

    let isCancelled = false;
    async function loadProdi() {
      const res = await getListProgramStudi(1, 100);
      if (!isCancelled && res.status && res.data) {
        setFetchedProgramStudiList(res.data.data);
      }
    }
    loadProdi();
    return () => {
      isCancelled = true;
    };
  }, [isOpen, propProgramStudiList]);

  const programStudiOptions = useMemo(() => {
    if (propProgramStudiList && propProgramStudiList.length > 0) {
      return propProgramStudiList;
    }
    return fetchedProgramStudiList;
  }, [propProgramStudiList, fetchedProgramStudiList]);

  // Load Courses on open
  useEffect(() => {
    if (!isOpen) return;

    let isCancelled = false;
    async function loadCourses() {
      setLoadingCourses(true);
      const courseMap = new Map<string, CourseOption>();

      // 1. Dari kelasList
      kelasList.forEach((k) => {
        if (k.code_matakuliah) {
          courseMap.set(k.code_matakuliah, {
            code: k.code_matakuliah,
            kode: k.kode_matakuliah,
            nama: k.nama_matakuliah,
          });
        }
      });

      // 2. Dari getAllMatakuliah
      try {
        const resKur = await getAllMatakuliah();
        if (resKur.status && resKur.data) {
          resKur.data.forEach((m: MataKuliahItem) => {
            const code = m.code_matakuliah || m.code;
            if (code && !courseMap.has(code)) {
              courseMap.set(code, {
                code,
                kode: m.kode_matakuliah,
                nama: m.nama_matakuliah,
              });
            }
          });
        }
      } catch {
        // ignore
      }

      // 3. Dari getListMatakuliah
      try {
        const resList = await getListMatakuliah(undefined, 100);
        if (resList.status && resList.data?.data) {
          resList.data.data.forEach((m: MataKuliahItem) => {
            const code = m.code_matakuliah || m.code;
            if (code && !courseMap.has(code)) {
              courseMap.set(code, {
                code,
                kode: m.kode_matakuliah,
                nama: m.nama_matakuliah,
              });
            }
          });
        }
      } catch {
        // ignore
      }

      if (!isCancelled) {
        setCourses(Array.from(courseMap.values()));
        setLoadingCourses(false);
      }
    }

    loadCourses();
    return () => {
      isCancelled = true;
    };
  }, [isOpen, kelasList]);

  // Reset and close handler
  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    setCodeMatakuliah("");
    setNamaKelas("");
    setSemester("");
    setKodeProgramStudi("");
    setKodeTahunAkademik(defaultYearId);
    setSearchCourseQuery("");
    setErrorMsg(null);
    setFieldErrors({});
    onClose();
  }, [isSubmitting, defaultYearId, onClose]);

  // Keyboard handler for Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        handleClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isSubmitting, handleClose]);

  // Filter courses based on search input
  const filteredCourses = useMemo(() => {
    if (!searchCourseQuery.trim()) return courses;
    const q = searchCourseQuery.toLowerCase();
    return courses.filter(
      (c) =>
        c.nama.toLowerCase().includes(q) ||
        c.kode.toLowerCase().includes(q)
    );
  }, [courses, searchCourseQuery]);

  // Handle Form Submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const errs: Record<string, string> = {};
    if (!codeMatakuliah.trim()) {
      errs.code_matakuliah = "Mata kuliah wajib dipilih.";
    }
    if (!namaKelas.trim()) {
      errs.nama_kelas = "Nama kelas wajib diisi.";
    } else if (namaKelas.trim().length > 2) {
      errs.nama_kelas = "Nama kelas maksimal 2 karakter (contoh: A, B, atau 01).";
    }

    if (semester && semester.length > 2) {
      errs.semester = "Semester maksimal 2 karakter.";
    }

    if (kodeProgramStudi && kodeProgramStudi.length > 2) {
      errs.kode_program_studi = "Kode program studi maksimal 2 karakter.";
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setErrorMsg("Silakan periksa kembali data yang belum lengkap.");
      return;
    }

    setFieldErrors({});
    setErrorMsg(null);
    setIsSubmitting(true);

    const payload = {
      code_matakuliah: codeMatakuliah.trim(),
      nama_kelas: namaKelas.trim().toUpperCase(),
      kode_tahun_akademik: kodeTahunAkademik !== "" ? Number(kodeTahunAkademik) : null,
      semester: semester.trim() ? semester.trim() : null,
      kode_program_studi: kodeProgramStudi.trim() ? kodeProgramStudi.trim() : null,
    };

    const res = await createStaffKelas(payload);

    setIsSubmitting(false);

    if (res.status) {
      setCodeMatakuliah("");
      setNamaKelas("");
      setSemester("");
      setKodeProgramStudi("");
      setKodeTahunAkademik(defaultYearId);
      setSearchCourseQuery("");
      setErrorMsg(null);
      setFieldErrors({});
      onSuccess(res.data);
      onClose();
    } else {
      setErrorMsg(res.message || "Gagal membuat kelas perkuliahan.");
      if (res.errors) {
        const mappedErrors: Record<string, string> = {};
        Object.entries(res.errors).forEach(([k, msgs]) => {
          if (Array.isArray(msgs) && msgs.length > 0) {
            mappedErrors[k] = msgs[0];
          }
        });
        setFieldErrors(mappedErrors);
      }
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs transition-opacity animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-kelas-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          handleClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] border border-gray-100"
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700 shrink-0">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <rect x="3" y="4" width="18" height="12" rx="1" />
                <path d="M8 20h8" />
                <path d="M12 16v4" />
                <path d="M12 8v4" />
                <path d="M10 10h4" />
              </svg>
            </div>
            <div>
              <h3
                id="create-kelas-modal-title"
                className="text-base font-bold text-gray-900"
              >
                Buat Kelas Baru
              </h3>
              <p className="text-xs text-gray-500">
                Tambahkan kelas perkuliahan baru ke dalam sistem
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
            aria-label="Tutup modal"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
            {/* Alert Error Global */}
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5">
                <svg
                  className="h-4 w-4 text-red-600 shrink-0 mt-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div className="flex-1">
                  <p className="font-semibold">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Field 1: Mata Kuliah (Required) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700">
                Mata Kuliah <span className="text-red-500">*</span>
              </label>

              {/* Mini Search Filter for Courses */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari nama atau kode mata kuliah..."
                  value={searchCourseQuery}
                  onChange={(e) => setSearchCourseQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-brand-600 transition mb-1.5"
                />
                <svg
                  className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400 pointer-events-none"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>

              <select
                value={codeMatakuliah}
                onChange={(e) => {
                  setCodeMatakuliah(e.target.value);
                  if (fieldErrors.code_matakuliah) {
                    setFieldErrors((prev) => ({ ...prev, code_matakuliah: "" }));
                  }
                }}
                disabled={loadingCourses}
                className={`w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs text-gray-800 outline-none focus:bg-white focus:ring-2 focus:ring-brand-100 transition ${
                  fieldErrors.code_matakuliah
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-200 focus:border-brand-600"
                }`}
              >
                <option value="">
                  {loadingCourses
                    ? "-- Memuat daftar mata kuliah... --"
                    : filteredCourses.length === 0
                    ? "-- Tidak ada mata kuliah yang cocok --"
                    : "-- Pilih Mata Kuliah --"}
                </option>
                {filteredCourses.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.kode ? `[${c.kode}] ` : ""}
                    {c.nama}
                  </option>
                ))}
              </select>
              {fieldErrors.code_matakuliah && (
                <p className="text-[11px] text-red-600 font-medium">
                  {fieldErrors.code_matakuliah}
                </p>
              )}
            </div>

            {/* Field 2: Nama Kelas (Required, max: 2) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-gray-700">
                  Nama Kelas <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-gray-400">Maks. 2 karakter</span>
              </div>

              {/* Quick Select Buttons */}
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[11px] text-gray-400">Pilih Cepat:</span>
                {["A", "B", "C", "D", "E"].map((letter) => (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => {
                      setNamaKelas(letter);
                      if (fieldErrors.nama_kelas) {
                        setFieldErrors((prev) => ({ ...prev, nama_kelas: "" }));
                      }
                    }}
                    className={`px-2 py-0.5 rounded text-xs font-bold transition ${
                      namaKelas === letter
                        ? "bg-brand-700 text-white shadow-xs"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>

              <input
                type="text"
                maxLength={2}
                placeholder="Contoh: A, B, atau 01"
                value={namaKelas}
                onChange={(e) => {
                  setNamaKelas(e.target.value.toUpperCase());
                  if (fieldErrors.nama_kelas) {
                    setFieldErrors((prev) => ({ ...prev, nama_kelas: "" }));
                  }
                }}
                className={`w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs text-gray-800 uppercase outline-none focus:bg-white focus:ring-2 focus:ring-brand-100 transition font-bold ${
                  fieldErrors.nama_kelas
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-200 focus:border-brand-600"
                }`}
              />
              {fieldErrors.nama_kelas && (
                <p className="text-[11px] text-red-600 font-medium">
                  {fieldErrors.nama_kelas}
                </p>
              )}
            </div>

            {/* Field 3: Tahun Akademik (Nullable) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700">
                Tahun Akademik <span className="text-gray-400 font-normal">(Opsional)</span>
              </label>
              <select
                value={kodeTahunAkademik}
                onChange={(e) =>
                  setKodeTahunAkademik(e.target.value ? Number(e.target.value) : "")
                }
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 outline-none focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition"
              >
                <option value="">-- Pilih Tahun Akademik (Opsional) --</option>
                {tahunAkademikList.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.tahun_akademik} {t.status === "1" || t.status === "Aktif" ? "(Aktif)" : ""}
                  </option>
                ))}
              </select>
              {fieldErrors.kode_tahun_akademik && (
                <p className="text-[11px] text-red-600 font-medium">
                  {fieldErrors.kode_tahun_akademik}
                </p>
              )}
            </div>

            {/* Grid 2 Columns: Semester & Program Studi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Field 4: Semester (Nullable, max: 2) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  Semester <span className="text-gray-400 font-normal">(Opsional)</span>
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 outline-none focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition"
                >
                  <option value="">-- Pilih Semester --</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={String(s)}>
                      Semester {s}
                    </option>
                  ))}
                </select>
                {fieldErrors.semester && (
                  <p className="text-[11px] text-red-600 font-medium">
                    {fieldErrors.semester}
                  </p>
                )}
              </div>

              {/* Field 5: Program Studi (Nullable, max: 2) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  Program Studi <span className="text-gray-400 font-normal">(Opsional)</span>
                </label>
                <select
                  value={kodeProgramStudi}
                  onChange={(e) => setKodeProgramStudi(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 outline-none focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition"
                >
                  <option value="">-- Pilih Program Studi --</option>
                  {programStudiOptions.map((p) => {
                    const val = p.kode_program_studi || String(p.id).padStart(2, "0");
                    return (
                      <option key={p.id} value={val}>
                        [{val}] {p.nama_program_studi}
                      </option>
                    );
                  })}
                </select>
                {fieldErrors.kode_program_studi && (
                  <p className="text-[11px] text-red-600 font-medium">
                    {fieldErrors.kode_program_studi}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2.5 bg-gray-50/50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Buat Kelas
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
