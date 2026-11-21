import { useState, useEffect, useMemo } from "react";
import Button from "@/components/ui/Button";
import {
  getStaffPenempatanBelumKelas,
  getStaffMahasiswaBelumKelas,
  createStaffPenempatan,
  getStaffKelasList,
} from "@/features/admin/api/kelas";
import {
  getAllMatakuliah,
  getListMatakuliah,
  getListProgramStudi,
} from "@/features/admin/api/masterData";
import type {
  StaffKelasItem,
  TahunAkademikItem,
  StaffPenempatanBelumKelasItem,
  StaffMahasiswaBelumKelasItem,
  MataKuliahItem,
  ProgramStudiItem,
} from "@/features/admin/types";

// ─── Data Models ─────────────────────────────────────────────────────────────

export interface GroupedMatakuliahBelumKelas {
  kode_matakuliah: string;
  nama_matakuliah: string;
  semester: number | string;
  tahun_akademik: string;
  sks_teori: number;
  sks_praktik: number;
  total_sks: number;
  total_mahasiswa: number;
  code_matakuliah?: string;
  mahasiswa_list: {
    code_krs_detail: string;
    kode_krs_detail: number;
    nim: string;
    nama_mahasiswa: string;
    semester: number | string;
  }[];
}

export interface UnifiedMahasiswaBelumKelas {
  code_krs_detail: string;
  kode_krs_detail: number;
  nim: string;
  nama_mahasiswa: string;
  semester: number | string;
  tahun_akademik?: string;
  kode_matakuliah?: string;
  nama_matakuliah?: string;
}

export type BelumKelasFilterMode = "matakuliah" | "mahasiswa";

interface CourseOption {
  code: string;
  kode: string;
  nama: string;
}

interface KelasItemTabProps {
  kelasList: StaffKelasItem[];
  tahunAkademikList: TahunAkademikItem[];
  onPlacementSuccess: () => void;
  onShowToast: (type: "success" | "error", message: string) => void;
}

export default function KelasItemTab({
  kelasList,
  tahunAkademikList,
  onPlacementSuccess,
  onShowToast,
}: KelasItemTabProps) {
  // ── Mode Filter ──
  // "matakuliah" -> /api/staff/penempatan/belum-kelas -> Tabel Daftar Mata Kuliah
  // "mahasiswa"   -> /api/staff/kelas/mahasiswa-belum-kelas -> Tabel Daftar Mahasiswa
  const [filterMode, setFilterMode] = useState<BelumKelasFilterMode>("matakuliah");

  // ── Filter Values ──
  const [selectedTahunAkademikStr, setSelectedTahunAkademikStr] = useState<string>("");
  const [selectedKodeTahunAkademik, setSelectedKodeTahunAkademik] = useState<number | undefined>(undefined);
  const [selectedCodeMatakuliah, setSelectedCodeMatakuliah] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // ── Filters for Kelas yang Tersedia (GET /api/staff/kelas) ──
  const [selectedSemesterKelas, setSelectedSemesterKelas] = useState<string>("");
  const [selectedProgramStudiKelas, setSelectedProgramStudiKelas] = useState<string>("");
  const [programStudiList, setProgramStudiList] = useState<ProgramStudiItem[]>([]);
  const [availableKelasList, setAvailableKelasList] = useState<StaffKelasItem[]>(kelasList || []);
  const [loadingAvailableKelas, setLoadingAvailableKelas] = useState(false);
  const [searchKelasQuery, setSearchKelasQuery] = useState("");

  // ── Available Courses List ──
  const [masterCourses, setMasterCourses] = useState<CourseOption[]>([]);

  // ── Data States for Mode Mata Kuliah ──
  const [rawMatakuliahData, setRawMatakuliahData] = useState<StaffPenempatanBelumKelasItem[]>([]);
  const [expandedMkKode, setExpandedMkKode] = useState<string | null>(null);

  // ── Data States for Mode Mahasiswa ──
  const [studentList, setStudentList] = useState<UnifiedMahasiswaBelumKelas[]>([]);

  // ── Common Data States ──
  const [loadingData, setLoadingData] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ── Selection State for Placement (in Mahasiswa Mode) ──
  const [selectedKrsCodes, setSelectedKrsCodes] = useState<Set<string>>(new Set());
  const [targetKelasId, setTargetKelasId] = useState<number | "">("");

  // ── Pagination ──
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // ── Placement Modal State ──
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSingleStudent, setModalSingleStudent] = useState<UnifiedMahasiswaBelumKelas | null>(null);
  const [modalTargetKelasId, setModalTargetKelasId] = useState<number | "">("");
  const [isSubmittingPlacement, setIsSubmittingPlacement] = useState(false);

  // ── Manual Refetch Trigger ──
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ── 1. Fetch Program Studi for Dropdown ──
  useEffect(() => {
    let isCancelled = false;
    async function loadProgramStudi() {
      const res = await getListProgramStudi(1, 100);
      if (!isCancelled && res.status && res.data) {
        setProgramStudiList(res.data.data);
      }
    }
    loadProgramStudi();
    return () => {
      isCancelled = true;
    };
  }, []);

  // ── 2. Fetch Master Courses for Dropdown (Runs ONLY once or when kelasList changes) ──
  useEffect(() => {
    let isCancelled = false;

    async function loadMasterCourses() {
      const courseMap = new Map<string, CourseOption>();

      // A. Dari availableKelasList & kelasList
      [...availableKelasList, ...kelasList].forEach((k) => {
        if (k.code_matakuliah) {
          courseMap.set(k.code_matakuliah, {
            code: k.code_matakuliah,
            kode: k.kode_matakuliah,
            nama: k.nama_matakuliah,
          });
        }
      });

      // B. Dari getAllMatakuliah
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
        // fallback ignored
      }

      // C. Dari getListMatakuliah
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
        // fallback ignored
      }

      if (!isCancelled) {
        setMasterCourses(Array.from(courseMap.values()));
      }
    }

    loadMasterCourses();
    return () => {
      isCancelled = true;
    };
  }, [availableKelasList, kelasList]);

  // ── 3. Fetch Kelas yang Tersedia (GET /api/staff/kelas dengan spesifikasi parameter) ──
  useEffect(() => {
    let isCancelled = false;

    async function loadAvailableKelas() {
      setLoadingAvailableKelas(true);
      const res = await getStaffKelasList({
        kode_tahun_akademik: selectedKodeTahunAkademik,
        kode_program_studi: selectedProgramStudiKelas || undefined,
        semester: selectedSemesterKelas || undefined,
        code_matakuliah: selectedCodeMatakuliah || undefined,
        tahun_akademik: selectedTahunAkademikStr || undefined,
      });

      if (isCancelled) return;

      if (res.status && Array.isArray(res.data)) {
        setAvailableKelasList(res.data);
      } else if (
        kelasList.length > 0 &&
        !selectedCodeMatakuliah &&
        !selectedSemesterKelas &&
        !selectedProgramStudiKelas &&
        selectedKodeTahunAkademik === undefined
      ) {
        setAvailableKelasList(kelasList);
      } else {
        setAvailableKelasList([]);
      }
      setLoadingAvailableKelas(false);
    }

    loadAvailableKelas();
    return () => {
      isCancelled = true;
    };
  }, [
    selectedKodeTahunAkademik,
    selectedTahunAkademikStr,
    selectedCodeMatakuliah,
    selectedSemesterKelas,
    selectedProgramStudiKelas,
    refreshTrigger,
    kelasList,
  ]);

  // ── 4. Fetch Data Belum Masuk Kelas (No masterCourses in dependency -> prevents infinite loop) ──
  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      setLoadingData(true);
      setFetchError(null);
      setSelectedKrsCodes(new Set());

      if (filterMode === "matakuliah") {
        // Endpoint 1: GET /api/staff/penempatan/belum-kelas
        const res = await getStaffPenempatanBelumKelas({
          tahun_akademik: selectedTahunAkademikStr || undefined,
          code_matakuliah: selectedCodeMatakuliah || undefined,
        });

        if (isCancelled) return;

        if (res.status && res.data) {
          setRawMatakuliahData(res.data);
        } else {
          setFetchError(res.message || "Gagal memuat data matakuliah yang belum masuk kelas.");
          setRawMatakuliahData([]);
        }
      } else {
        // Endpoint 2: GET /api/staff/kelas/mahasiswa-belum-kelas
        if (!selectedCodeMatakuliah) {
          if (!isCancelled) {
            setStudentList([]);
            setLoadingData(false);
          }
          return;
        }

        const res = await getStaffMahasiswaBelumKelas({
          code_matakuliah: selectedCodeMatakuliah,
          kode_tahun_akademik: selectedKodeTahunAkademik,
        });

        if (isCancelled) return;

        if (res.status && res.data) {
          const unified: UnifiedMahasiswaBelumKelas[] = res.data.map(
            (item: StaffMahasiswaBelumKelasItem) => ({
              code_krs_detail: item.code_krs_detail,
              kode_krs_detail: item.kode_krs_detail,
              nim: item.nim,
              nama_mahasiswa: item.nama_mahasiswa,
              semester: item.semester,
              tahun_akademik: selectedTahunAkademikStr || undefined,
            })
          );
          setStudentList(unified);
        } else {
          setFetchError(res.message || "Gagal memuat data mahasiswa belum masuk kelas.");
          setStudentList([]);
        }
      }

      if (!isCancelled) {
        setLoadingData(false);
      }
    }

    loadData();
    return () => {
      isCancelled = true;
    };
  }, [
    filterMode,
    selectedTahunAkademikStr,
    selectedKodeTahunAkademik,
    selectedCodeMatakuliah,
    refreshTrigger,
  ]);

  // ── 5. Grouping Data for Mode Mata Kuliah ──
  const groupedMatakuliahList = useMemo(() => {
    const map = new Map<string, GroupedMatakuliahBelumKelas>();

    rawMatakuliahData.forEach((item) => {
      const key = `${item.kode_matakuliah}_${item.semester}_${item.tahun_akademik}`;
      const existing = map.get(key);

      const mhsInfo = {
        code_krs_detail: item.code_krs_detail,
        kode_krs_detail: item.kode_krs_detail,
        nim: item.nim,
        nama_mahasiswa: item.nama_mahasiswa,
        semester: item.semester,
      };

      if (existing) {
        existing.total_mahasiswa += 1;
        existing.mahasiswa_list.push(mhsInfo);
      } else {
        // Cari code_matakuliah terenkripsi dari masterCourses atau availableKelasList/kelasList
        const matchMaster = masterCourses.find((c) => c.kode === item.kode_matakuliah);
        const matchKelas =
          availableKelasList.find((k) => k.kode_matakuliah === item.kode_matakuliah) ||
          kelasList.find((k) => k.kode_matakuliah === item.kode_matakuliah);
        const codeMk = matchMaster?.code || matchKelas?.code_matakuliah;

        map.set(key, {
          kode_matakuliah: item.kode_matakuliah,
          nama_matakuliah: item.nama_matakuliah,
          semester: item.semester,
          tahun_akademik: item.tahun_akademik,
          sks_teori: item.sks_teori ?? 0,
          sks_praktik: item.sks_praktik ?? 0,
          total_sks: (item.sks_teori ?? 0) + (item.sks_praktik ?? 0),
          total_mahasiswa: 1,
          code_matakuliah: codeMk,
          mahasiswa_list: [mhsInfo],
        });
      }
    });

    return Array.from(map.values());
  }, [rawMatakuliahData, masterCourses, availableKelasList, kelasList]);

  // ── 6. Filtered Groups for Mode Mata Kuliah (Search) ──
  const filteredMatakuliahList = useMemo(() => {
    if (!searchQuery.trim()) return groupedMatakuliahList;
    const q = searchQuery.toLowerCase();
    return groupedMatakuliahList.filter(
      (m) =>
        m.kode_matakuliah.toLowerCase().includes(q) ||
        m.nama_matakuliah.toLowerCase().includes(q)
    );
  }, [groupedMatakuliahList, searchQuery]);

  // ── 7. Filtered Students for Mode Mahasiswa (Search) ──
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return studentList;
    const q = searchQuery.toLowerCase();
    return studentList.filter(
      (item) =>
        item.nim.toLowerCase().includes(q) ||
        item.nama_mahasiswa.toLowerCase().includes(q)
    );
  }, [studentList, searchQuery]);

  // ── 8. Pagination Calculations ──
  const totalItems =
    filterMode === "matakuliah"
      ? filteredMatakuliahList.length
      : filteredStudents.length;

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

  const paginatedMatakuliah = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMatakuliahList.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMatakuliahList, currentPage]);

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStudents, currentPage]);

  // ── 9. Filtered Available Kelas (Local Search Filter) ──
  const effectiveAvailableList = useMemo(() => {
    if (availableKelasList.length > 0) return availableKelasList;
    if (
      kelasList.length > 0 &&
      !selectedCodeMatakuliah &&
      !selectedSemesterKelas &&
      !selectedProgramStudiKelas &&
      selectedKodeTahunAkademik === undefined
    ) {
      return kelasList;
    }
    return availableKelasList;
  }, [
    availableKelasList,
    kelasList,
    selectedCodeMatakuliah,
    selectedSemesterKelas,
    selectedProgramStudiKelas,
    selectedKodeTahunAkademik,
  ]);

  const filteredAvailableKelasList = useMemo(() => {
    const list = Array.isArray(effectiveAvailableList) ? effectiveAvailableList : [];
    if (!searchKelasQuery.trim()) return list;
    const q = searchKelasQuery.toLowerCase();
    return list.filter(
      (k) =>
        (k.nama_kelas && k.nama_kelas.toLowerCase().includes(q)) ||
        (k.nama_matakuliah && k.nama_matakuliah.toLowerCase().includes(q)) ||
        (k.kode_matakuliah && k.kode_matakuliah.toLowerCase().includes(q))
    );
  }, [effectiveAvailableList, searchKelasQuery]);

  // Selected Course details for Mahasiswa Mode
  const activeSelectedCourseObj = useMemo((): CourseOption | null => {
    const fromMaster = masterCourses.find((c) => c.code === selectedCodeMatakuliah);
    if (fromMaster) {
      return fromMaster;
    }
    const fromAvailable = availableKelasList.find(
      (k) => k.code_matakuliah === selectedCodeMatakuliah
    );
    if (fromAvailable) {
      return {
        code: fromAvailable.code_matakuliah || "",
        kode: fromAvailable.kode_matakuliah,
        nama: fromAvailable.nama_matakuliah,
      };
    }
    const fromKelas = kelasList.find((k) => k.code_matakuliah === selectedCodeMatakuliah);
    if (fromKelas) {
      return {
        code: fromKelas.code_matakuliah || "",
        kode: fromKelas.kode_matakuliah,
        nama: fromKelas.nama_matakuliah,
      };
    }
    return null;
  }, [masterCourses, availableKelasList, kelasList, selectedCodeMatakuliah]);

  // ── Handlers ──

  // Pindah dari tabel Mata Kuliah langsung ke daftar Mahasiswa untuk MK tersebut
  function handleViewMahasiswa(mkItem: GroupedMatakuliahBelumKelas) {
    let code = mkItem.code_matakuliah;
    if (!code) {
      const match = masterCourses.find((c) => c.kode === mkItem.kode_matakuliah);
      if (match) code = match.code;
    }

    if (code) {
      setSelectedCodeMatakuliah(code);
    }
    setFilterMode("mahasiswa");
    setCurrentPage(1);
    setSearchQuery("");
  }

  // Checkbox Selection Handlers (Mahasiswa Mode)
  const isAllCurrentPageSelected = useMemo(() => {
    if (paginatedStudents.length === 0) return false;
    return paginatedStudents.every((s) => selectedKrsCodes.has(s.code_krs_detail));
  }, [paginatedStudents, selectedKrsCodes]);

  function handleToggleSelectAll() {
    setSelectedKrsCodes((prev) => {
      const next = new Set(prev);
      if (isAllCurrentPageSelected) {
        paginatedStudents.forEach((s) => next.delete(s.code_krs_detail));
      } else {
        paginatedStudents.forEach((s) => next.add(s.code_krs_detail));
      }
      return next;
    });
  }

  function handleToggleStudent(codeKrsDetail: string) {
    setSelectedKrsCodes((prev) => {
      const next = new Set(prev);
      if (next.has(codeKrsDetail)) {
        next.delete(codeKrsDetail);
      } else {
        next.add(codeKrsDetail);
      }
      return next;
    });
  }

  // Open modal for single student
  function handleOpenSinglePlacement(student: UnifiedMahasiswaBelumKelas) {
    setModalSingleStudent(student);
    setModalTargetKelasId(targetKelasId || (filteredAvailableKelasList[0]?.kelas_id ?? ""));
    setModalOpen(true);
  }

  // Open modal for batch selected students
  function handleOpenBatchPlacement() {
    if (selectedKrsCodes.size === 0) return;
    setModalSingleStudent(null);
    setModalTargetKelasId(targetKelasId || (filteredAvailableKelasList[0]?.kelas_id ?? ""));
    setModalOpen(true);
  }

  // Confirm placement execution
  async function handleExecutePlacement() {
    if (!modalTargetKelasId) {
      onShowToast("error", "Silakan pilih kelas tujuan penempatan.");
      return;
    }

    const targetKId = Number(modalTargetKelasId);
    const codesToPlace = modalSingleStudent
      ? [modalSingleStudent.code_krs_detail]
      : Array.from(selectedKrsCodes);

    if (codesToPlace.length === 0) return;

    setIsSubmittingPlacement(true);
    let successCount = 0;
    let failCount = 0;

    for (const code of codesToPlace) {
      const res = await createStaffPenempatan({
        kelas_id: targetKId,
        code_krs_detail: code,
      });

      if (res.status) {
        successCount++;
      } else {
        failCount++;
      }
    }

    setIsSubmittingPlacement(false);
    setModalOpen(false);
    setModalSingleStudent(null);

    const targetKelasObj =
      availableKelasList.find((k) => k.kelas_id === targetKId) ||
      kelasList.find((k) => k.kelas_id === targetKId);
    const targetKelasName = targetKelasObj
      ? `Kelas ${targetKelasObj.nama_kelas} (${targetKelasObj.nama_matakuliah})`
      : "kelas tujuan";

    if (successCount > 0) {
      onShowToast(
        "success",
        `Berhasil menempatkan ${successCount} mahasiswa ke ${targetKelasName}.${
          failCount > 0 ? ` (${failCount} gagal)` : ""
        }`
      );
      // Trigger parent refetches
      onPlacementSuccess();
      // Reload current tab data & available classes
      setRefreshTrigger((c) => c + 1);
    } else {
      onShowToast("error", "Gagal menempatkan mahasiswa ke kelas terpilih.");
    }
  }

  return (
    <div className="space-y-5">
      {/* ── 1. FILTER CONTROLS BAR ── */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        {/* Filter Mode Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              {filterMode === "matakuliah"
                ? "Daftar Mata Kuliah Belum Masuk Kelas"
                : "Daftar Mahasiswa Belum Masuk Kelas"}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {filterMode === "matakuliah"
                ? "Menampilkan rekapitulasi mata kuliah dan jumlah mahasiswa yang belum ditempatkan ke kelas"
                : "Menampilkan daftar mahasiswa belum masuk kelas untuk mata kuliah yang dipilih"}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="inline-flex p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setFilterMode("matakuliah");
                setCurrentPage(1);
                setSearchQuery("");
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                filterMode === "matakuliah"
                  ? "bg-white text-brand-700 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span>Mata Kuliah Belum Masuk Kelas</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFilterMode("mahasiswa");
                setCurrentPage(1);
                setSearchQuery("");
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                filterMode === "mahasiswa"
                  ? "bg-white text-brand-700 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>Mahasiswa Belum Masuk Kelas</span>
            </button>
          </div>
        </div>

        {/* Filters Form Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-end">
          {/* Filter Tahun Akademik */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Tahun Akademik
            </label>
            <select
              value={selectedTahunAkademikStr}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedTahunAkademikStr(val);
                const obj = tahunAkademikList.find((t) => t.tahun_akademik === val);
                setSelectedKodeTahunAkademik(obj?.id);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:bg-white focus:border-brand-600 transition"
            >
              <option value="">Semua Tahun Akademik</option>
              {tahunAkademikList.map((t) => (
                <option key={t.id} value={t.tahun_akademik}>
                  {t.tahun_akademik} {t.status === "1" || t.status === "Aktif" ? "(Aktif)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Mata Kuliah */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Mata Kuliah{" "}
              {filterMode === "mahasiswa" ? (
                <span className="text-red-500 font-bold">* Wajib Dipilih</span>
              ) : (
                <span className="text-gray-400 font-normal">(Opsional)</span>
              )}
            </label>
            <select
              value={selectedCodeMatakuliah}
              onChange={(e) => {
                setSelectedCodeMatakuliah(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:bg-white focus:border-brand-600 transition"
            >
              <option value="">
                {filterMode === "mahasiswa"
                  ? "-- Pilih Mata Kuliah Terlebih Dahulu --"
                  : "-- Semua Mata Kuliah --"}
              </option>
              {masterCourses.map((mk) => (
                <option key={mk.code} value={mk.code}>
                  {mk.kode ? `[${mk.kode}] ` : ""}
                  {mk.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Action */}
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRefreshTrigger((c) => c + 1)}
              disabled={loadingData || loadingAvailableKelas}
              className="w-full justify-center"
              leftIcon={
                <svg
                  className={`h-3.5 w-3.5 ${loadingData || loadingAvailableKelas ? "animate-spin" : ""}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
              }
            >
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Notice for Mahasiswa Mode if not selected */}
        {filterMode === "mahasiswa" && !selectedCodeMatakuliah && (
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
            <svg
              className="h-4 w-4 text-amber-600 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>
              Mode <strong>Mahasiswa Belum Masuk Kelas</strong> membutuhkan pilihan Mata Kuliah.
              Silakan pilih salah satu mata kuliah di dropdown atas atau klik tombol{" "}
              <strong>Lihat Mahasiswa</strong> pada tab <em>Mata Kuliah Belum Masuk Kelas</em>.
            </span>
          </div>
        )}
      </div>

      {/* ── 2. SECTION: KELAS YANG TERSEDIA (GET /api/staff/kelas) ── */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-700">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <rect x="3" y="4" width="18" height="12" rx="1" />
                <path d="M8 20h8" />
                <path d="M12 16v4" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span>Kelas yang Tersedia</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-brand-50 text-brand-700">
                  {filteredAvailableKelasList.length} Kelas
                </span>
                {loadingAvailableKelas && (
                  <span className="text-[11px] text-gray-400 font-normal">
                    (Memuat...)
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-gray-400">
                {selectedCodeMatakuliah && activeSelectedCourseObj
                  ? `Daftar kelas perkuliahan untuk ${activeSelectedCourseObj.nama}`
                  : "Daftar kelas perkuliahan yang siap dijadikan tujuan penempatan mahasiswa"}
              </p>
            </div>
          </div>

          {/* Filters for /api/staff/kelas: Semester, Program Studi, and Search */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Semester */}
            <select
              value={selectedSemesterKelas}
              onChange={(e) => setSelectedSemesterKelas(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:bg-white focus:border-brand-600 transition"
              title="Filter Semester Kelas"
            >
              <option value="">Semua Sem</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Sem {s}
                </option>
              ))}
            </select>

            {/* Filter Program Studi */}
            {programStudiList.length > 0 && (
              <select
                value={selectedProgramStudiKelas}
                onChange={(e) => setSelectedProgramStudiKelas(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:bg-white focus:border-brand-600 transition max-w-[140px]"
                title="Filter Program Studi Kelas"
              >
                <option value="">Semua Prodi</option>
                {programStudiList.map((p) => {
                  const val = p.kode_program_studi || String(p.id).padStart(2, "0");
                  return (
                    <option key={p.id} value={val}>
                      {p.nama_program_studi}
                    </option>
                  );
                })}
              </select>
            )}

            {/* Search kelas mini input */}
            <div className="relative sm:w-56">
              <input
                type="text"
                placeholder="Cari nama kelas / MK..."
                value={searchKelasQuery}
                onChange={(e) => setSearchKelasQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-brand-600 transition"
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
          </div>
        </div>

        {/* Classes Grid */}
        {loadingAvailableKelas ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2 bg-gray-50/40 rounded-xl border border-dashed border-gray-200">
            <div className="h-5 w-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-400">Memuat daftar kelas perkuliahan...</p>
          </div>
        ) : filteredAvailableKelasList.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <p>Tidak ada kelas yang sesuai dengan filter tahun akademik atau mata kuliah terpilih.</p>
            <p className="text-[11px] text-gray-400 mt-1">
              Anda dapat membuat kelas baru melalui tab <strong>Daftar Kelas</strong>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-56 overflow-y-auto pr-1">
            {filteredAvailableKelasList.map((k) => {
              const isSelected = targetKelasId === k.kelas_id;
              return (
                <div
                  key={k.kelas_id}
                  onClick={() => setTargetKelasId(isSelected ? "" : k.kelas_id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                    isSelected
                      ? "border-brand-600 bg-brand-50/60 ring-2 ring-brand-100 shadow-xs"
                      : "border-gray-200 bg-gray-50/40 hover:bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-white border border-gray-200 text-brand-800">
                      Kelas {k.nama_kelas}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Sem {k.semester}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-900 line-clamp-1" title={k.nama_matakuliah}>
                      {k.nama_matakuliah}
                    </p>
                    <p className="text-[10px] text-gray-500 font-mono">
                      {k.kode_matakuliah} • {k.tahun_akademik}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-gray-600 font-medium">
                      {k.jumlah_mahasiswa} Mhs {k.jumlah_dosen ? `• ${k.jumlah_dosen} Dosen` : ""}
                    </span>
                    {isSelected ? (
                      <span className="text-[10px] font-bold text-brand-700 flex items-center gap-0.5">
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Target
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-400 hover:text-brand-600">
                        Pilih Target
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 3. BATCH PLACEMENT ACTION BAR (Hanya di mode Mahasiswa jika ada yang dicentang) ── */}
      {filterMode === "mahasiswa" && selectedKrsCodes.size > 0 && (
        <div className="p-3.5 bg-brand-900 text-white rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-xs text-white">
              {selectedKrsCodes.size}
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                {selectedKrsCodes.size} Mahasiswa Terpilih
              </p>
              <p className="text-[11px] text-brand-200">
                Pilih kelas tujuan untuk menempatkan semua mahasiswa yang dicentang sekaligus
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={targetKelasId}
              onChange={(e) => setTargetKelasId(e.target.value ? Number(e.target.value) : "")}
              className="px-3 py-1.5 text-xs bg-brand-800 border border-brand-700 rounded-lg text-white outline-none focus:ring-2 focus:ring-brand-400"
            >
              <option value="">-- Pilih Kelas Tujuan --</option>
              {filteredAvailableKelasList.map((k) => (
                <option key={k.kelas_id} value={k.kelas_id}>
                  Kelas {k.nama_kelas} - {k.kode_matakuliah} {k.nama_matakuliah} ({k.jumlah_mahasiswa} Mhs)
                </option>
              ))}
            </select>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleOpenBatchPlacement}
              disabled={!targetKelasId}
              className="bg-white text-brand-900 hover:bg-brand-50 border-0"
              leftIcon={
                <svg className="h-3.5 w-3.5 text-brand-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              }
            >
              Tempatkan {selectedKrsCodes.size} Mahasiswa
            </Button>

            <button
              type="button"
              onClick={() => setSelectedKrsCodes(new Set())}
              className="text-xs text-brand-200 hover:text-white underline px-2"
            >
              Batal Pilih
            </button>
          </div>
        </div>
      )}

      {/* ── 4. TABLE SECTION ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {/* Table Search & Meta Header */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-800">
              {filterMode === "matakuliah"
                ? "Daftar Mata Kuliah Belum Masuk Kelas"
                : `Daftar Mahasiswa Belum Masuk Kelas ${
                    activeSelectedCourseObj ? `(${activeSelectedCourseObj.nama})` : ""
                  }`}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              {filterMode === "matakuliah"
                ? `${filteredMatakuliahList.length} Mata Kuliah`
                : `${filteredStudents.length} Mahasiswa`}
            </span>
          </div>

          <div className="relative sm:max-w-xs w-full">
            <input
              type="text"
              placeholder={
                filterMode === "matakuliah"
                  ? "Cari kode atau nama mata kuliah..."
                  : "Cari NIM atau nama mahasiswa..."
              }
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3.5 py-1.5 text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-brand-600 transition"
            />
            <svg
              className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>

        {/* Loading / Error / Empty States */}
        {loadingData ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-500 font-medium">
              {filterMode === "matakuliah"
                ? "Memuat data matakuliah yang belum masuk kelas..."
                : "Memuat data mahasiswa yang belum masuk kelas..."}
            </p>
          </div>
        ) : fetchError ? (
          <div className="py-16 text-center text-xs text-red-500 space-y-2">
            <p>{fetchError}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRefreshTrigger((c) => c + 1)}
            >
              Coba Lagi
            </Button>
          </div>
        ) : totalItems === 0 ? (
          <div className="py-16 text-center text-xs text-gray-400 space-y-1">
            <p className="font-semibold text-gray-600">
              {filterMode === "matakuliah"
                ? "Tidak ada mata kuliah yang belum masuk kelas."
                : "Tidak ada mahasiswa yang belum masuk kelas."}
            </p>
            <p className="text-[11px]">
              {filterMode === "matakuliah"
                ? "Semua mata kuliah pada filter tahun akademik ini telah memiliki penempatan kelas."
                : "Semua mahasiswa untuk mata kuliah ini sudah terdaftar ke dalam kelas."}
            </p>
          </div>
        ) : filterMode === "matakuliah" ? (
          /* ── TABEL 1: DAFTAR MATA KULIAH BELUM MASUK KELAS ── */
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50/75 text-gray-600 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3.5 w-12 text-center">No</th>
                  <th className="px-4 py-3.5">Kode MK</th>
                  <th className="px-4 py-3.5">Nama Mata Kuliah</th>
                  <th className="px-4 py-3.5 text-center">Semester</th>
                  <th className="px-4 py-3.5 text-center">SKS (T/P/Total)</th>
                  <th className="px-4 py-3.5">Tahun Akademik</th>
                  <th className="px-4 py-3.5 text-center">Mahasiswa Belum Kelas</th>
                  <th className="px-4 py-3.5 text-center">Kelas Tersedia</th>
                  <th className="px-4 py-3.5 text-center w-48">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedMatakuliah.map((item, idx) => {
                  const isExpanded = expandedMkKode === item.kode_matakuliah;
                  const matchingClasses = effectiveAvailableList.filter(
                    (k) => k.kode_matakuliah === item.kode_matakuliah
                  );

                  return (
                    <tr
                      key={`${item.kode_matakuliah}-${item.semester}-${idx}`}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-4 py-3 text-center text-gray-400">
                        {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-brand-900">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800">
                          {item.kode_matakuliah}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {item.nama_matakuliah}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700">
                          Sem {item.semester}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-gray-700">
                        {item.sks_teori}T / {item.sks_praktik}P ({item.total_sks} SKS)
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {item.tahun_akademik}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <svg className="h-3 w-3 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                          {item.total_mahasiswa} Mahasiswa
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {matchingClasses.length > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800">
                            {matchingClasses.length} Kelas (
                            {matchingClasses.map((c) => c.nama_kelas).join(", ")})
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400 italic">
                            Belum ada kelas
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Tombol Lihat & Kelola Mahasiswa */}
                          <button
                            type="button"
                            onClick={() => handleViewMahasiswa(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-brand-700 hover:bg-brand-800 rounded-md transition shadow-xs"
                            title="Buka daftar mahasiswa untuk mata kuliah ini"
                          >
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            <span>Lihat Mahasiswa</span>
                          </button>

                          {/* Tombol Toggle Rincian Siswa */}
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedMkKode(isExpanded ? null : item.kode_matakuliah)
                            }
                            className="p-1 text-gray-500 hover:text-gray-800 rounded hover:bg-gray-100 transition"
                            title={isExpanded ? "Tutup rincian" : "Lihat rincian nama mahasiswa"}
                          >
                            <svg
                              className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </button>
                        </div>

                        {/* Drawer Rincian Mahasiswa Inline */}
                        {isExpanded && (
                          <div className="mt-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200 text-left space-y-1 text-[11px]">
                            <p className="font-semibold text-gray-700">
                              Daftar Mahasiswa Terdaftar ({item.mahasiswa_list.length}):
                            </p>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                              {item.mahasiswa_list.map((m, mIdx) => (
                                <div key={m.code_krs_detail || mIdx} className="flex justify-between text-gray-600 border-b border-gray-100 pb-0.5">
                                  <span>{m.nama_mahasiswa}</span>
                                  <span className="font-mono text-gray-400">{m.nim}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* ── TABEL 2: DAFTAR MAHASISWA BELUM MASUK KELAS ── */
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50/75 text-gray-600 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllCurrentPageSelected}
                      onChange={handleToggleSelectAll}
                      className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 h-3.5 w-3.5"
                    />
                  </th>
                  <th className="px-4 py-3.5 w-12 text-center">No</th>
                  <th className="px-4 py-3.5">NIM</th>
                  <th className="px-4 py-3.5">Nama Mahasiswa</th>
                  <th className="px-4 py-3.5 text-center">Semester</th>
                  <th className="px-4 py-3.5">Mata Kuliah</th>
                  <th className="px-4 py-3.5">Tahun Akademik</th>
                  <th className="px-4 py-3.5 text-center w-36">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedStudents.map((item, idx) => {
                  const isChecked = selectedKrsCodes.has(item.code_krs_detail);
                  return (
                    <tr
                      key={item.code_krs_detail || `${item.nim}-${idx}`}
                      className={`hover:bg-gray-50/60 transition-colors ${
                        isChecked ? "bg-brand-50/30" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleStudent(item.code_krs_detail)}
                          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 h-3.5 w-3.5"
                        />
                      </td>
                      <td className="px-4 py-3 text-center text-gray-400">
                        {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                      </td>
                      <td className="px-4 py-3 font-mono font-medium text-gray-900">
                        {item.nim}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {item.nama_mahasiswa || "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                          Sem {item.semester}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800">
                          {activeSelectedCourseObj?.nama || "-"}
                        </p>
                        {activeSelectedCourseObj?.kode && (
                          <p className="text-[10px] font-mono text-gray-400">
                            {activeSelectedCourseObj.kode}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {item.tahun_akademik || selectedTahunAkademikStr || "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenSinglePlacement({
                              ...item,
                              kode_matakuliah: activeSelectedCourseObj?.kode,
                              nama_matakuliah: activeSelectedCourseObj?.nama,
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-brand-700 hover:text-white bg-brand-50 hover:bg-brand-700 rounded-md transition-colors"
                        >
                          <svg
                            className="h-3.5 w-3.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          <span>Tempatkan</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-gray-50/50">
            <span>
              Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} dari {totalItems}{" "}
              {filterMode === "matakuliah" ? "mata kuliah" : "mahasiswa"}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 border border-gray-200 rounded-md hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Sebelumnya
              </button>
              <span className="px-2 font-medium text-gray-700">
                Halaman {currentPage} dari {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 border border-gray-200 rounded-md hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── 5. MODAL KONFIRMASI PENEMPATAN ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs transition-opacity"
          aria-modal="true"
          role="dialog"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Konfirmasi Penempatan Kelas
                  </h3>
                  <p className="text-xs text-gray-500">
                    {modalSingleStudent
                      ? "Tempatkan satu mahasiswa ke dalam kelas"
                      : `Tempatkan ${selectedKrsCodes.size} mahasiswa sekaligus`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={isSubmittingPlacement}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs overflow-y-auto">
              {/* Mahasiswa Info */}
              {modalSingleStudent ? (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nama Mahasiswa:</span>
                    <span className="font-bold text-gray-900">
                      {modalSingleStudent.nama_mahasiswa}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">NIM:</span>
                    <span className="font-mono text-gray-800">
                      {modalSingleStudent.nim}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mata Kuliah:</span>
                    <span className="font-medium text-brand-900">
                      {modalSingleStudent.nama_matakuliah || activeSelectedCourseObj?.nama || "-"}{" "}
                      {modalSingleStudent.kode_matakuliah || activeSelectedCourseObj?.kode
                        ? `(${modalSingleStudent.kode_matakuliah || activeSelectedCourseObj?.kode})`
                        : ""}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Semester & T.A.:</span>
                    <span className="text-gray-700">
                      Semester {modalSingleStudent.semester} •{" "}
                      {modalSingleStudent.tahun_akademik || selectedTahunAkademikStr || "-"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl space-y-1">
                  <p className="font-bold text-brand-900">
                    {selectedKrsCodes.size} Mahasiswa Terpilih
                  </p>
                  <p className="text-brand-700">
                    Mahasiswa yang dipilih akan dimasukkan ke rombongan belajar kelas tujuan yang dipilih di bawah ini.
                  </p>
                </div>
              )}

              {/* Target Kelas Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Pilih Kelas Tujuan <span className="text-red-500">*</span>
                </label>
                <select
                  value={modalTargetKelasId}
                  onChange={(e) => setModalTargetKelasId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 outline-none focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition"
                >
                  <option value="">-- Pilih Kelas Tujuan --</option>
                  {filteredAvailableKelasList.map((k) => (
                    <option key={k.kelas_id} value={k.kelas_id}>
                      Kelas {k.nama_kelas} - {k.kode_matakuliah} {k.nama_matakuliah} (Sem {k.semester} | {k.jumlah_mahasiswa} Mhs)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2.5 bg-gray-50/50">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalOpen(false)}
                disabled={isSubmittingPlacement}
              >
                Batal
              </Button>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleExecutePlacement}
                isLoading={isSubmittingPlacement}
                disabled={!modalTargetKelasId || isSubmittingPlacement}
              >
                Simpan Penempatan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
