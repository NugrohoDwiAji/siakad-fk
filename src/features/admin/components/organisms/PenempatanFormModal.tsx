import { useState, useEffect, useRef, useCallback } from "react";
import Button from "@/components/ui/Button";
import { searchMahasiswa } from "@/features/admin/api/masterData";
import {
  createStaffPenempatan,
  getStaffMahasiswaKrs,
} from "@/features/admin/api/kelas";
import type {
  StaffKelasItem,
  MahasiswaSearchItem,
  StaffKrsMahasiswaItem,
} from "@/features/admin/types";

interface PenempatanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  kelasList: StaffKelasItem[];
  initialKelasId?: number | null;
}

export default function PenempatanFormModal({
  isOpen,
  onClose,
  onSuccess,
  kelasList,
  initialKelasId,
}: PenempatanFormModalProps) {
  const [selectedKelasId, setSelectedKelasId] = useState<number | "">(
    initialKelasId ?? (kelasList[0]?.kelas_id ?? "")
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MahasiswaSearchItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedMahasiswa, setSelectedMahasiswa] =
    useState<MahasiswaSearchItem | null>(null);

  const [krsList, setKrsList] = useState<StaffKrsMahasiswaItem[]>([]);
  const [loadingKrs, setLoadingKrs] = useState(false);
  const [codeKrsDetail, setCodeKrsDetail] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Escape key handler
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !submitting) {
        onClose();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, submitting, onClose]);

  // Debounced search for mahasiswa
  const handleSearchInput = useCallback((value: string) => {
    setSearchQuery(value);
    setSelectedMahasiswa(null);
    setCodeKrsDetail("");
    setKrsList([]);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!value.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setShowDropdown(true);
    setSearchLoading(true);

    debounceTimer.current = setTimeout(async () => {
      const result = await searchMahasiswa(value.trim());
      if (result.status) {
        setSearchResults(result.data || []);
      } else {
        setSearchResults([]);
      }
      setSearchLoading(false);
    }, 400);
  }, []);

  // Handle select student
  async function handleSelectMahasiswa(mhs: MahasiswaSearchItem) {
    setSelectedMahasiswa(mhs);
    setSearchQuery(`${mhs.nama_mahasiswa} (${mhs.nim})`);
    setShowDropdown(false);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.mahasiswa;
      return next;
    });

    // Fetch student's KRS
    setLoadingKrs(true);
    const krsRes = await getStaffMahasiswaKrs(mhs.code);
    setLoadingKrs(false);
    if (krsRes.status && krsRes.data) {
      setKrsList(krsRes.data);
    } else {
      setKrsList([]);
    }
  }

  // Selected kelas info
  const currentKelas = kelasList.find(
    (k) => k.kelas_id === Number(selectedKelasId)
  );

  // Handle form submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    const newErrors: Record<string, string> = {};
    if (!selectedKelasId) {
      newErrors.kelas_id = "Pilih kelas terlebih dahulu.";
    }
    if (!selectedMahasiswa) {
      newErrors.mahasiswa = "Pilih mahasiswa yang akan ditempatkan.";
    }
    if (!codeKrsDetail.trim()) {
      newErrors.code_krs_detail = "Kode KRS Detail wajib diisi.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    const res = await createStaffPenempatan({
      kelas_id: Number(selectedKelasId),
      code_krs_detail: codeKrsDetail.trim(),
    });
    setSubmitting(false);

    if (res.status) {
      onSuccess();
      onClose();
    } else {
      setErrorMsg(res.message || "Gagal menambahkan penempatan kelas.");
      if (res.errors) {
        const fieldErrors: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(res.errors)) {
          fieldErrors[key] = Array.isArray(msgs) ? msgs[0] : String(msgs);
        }
        setErrors(fieldErrors);
      }
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs transition-opacity"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh] transition-all">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Tambah Penempatan Kelas
              </h2>
              <p className="text-xs text-gray-500">
                Tempatkan mahasiswa ke dalam rombongan belajar kelas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-4 text-sm"
        >
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <svg
                className="h-4 w-4 shrink-0 mt-0.5 text-red-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Pilih Kelas */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Pilih Kelas <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedKelasId}
              onChange={(e) => {
                setSelectedKelasId(
                  e.target.value ? Number(e.target.value) : ""
                );
                setErrors((prev) => {
                  const n = { ...prev };
                  delete n.kelas_id;
                  return n;
                });
              }}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 outline-none focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition"
            >
              <option value="">-- Pilih Kelas --</option>
              {kelasList.map((k) => (
                <option key={k.kelas_id} value={k.kelas_id}>
                  Kelas {k.nama_kelas} - {k.kode_matakuliah} {k.nama_matakuliah}{" "}
                  (Sem {k.semester} | {k.jumlah_mahasiswa} Mhs)
                </option>
              ))}
            </select>
            {errors.kelas_id && (
              <p className="text-[11px] text-red-600 mt-1">{errors.kelas_id}</p>
            )}

            {currentKelas && (
              <div className="mt-2 p-2.5 bg-brand-50/60 border border-brand-100 rounded-lg text-xs space-y-1">
                <div className="flex justify-between text-gray-600">
                  <span>Mata Kuliah:</span>
                  <span className="font-semibold text-brand-900">
                    {currentKelas.nama_matakuliah} ({currentKelas.kode_matakuliah})
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Semester & T.A.:</span>
                  <span className="font-medium text-gray-800">
                    Semester {currentKelas.semester} • {currentKelas.tahun_akademik}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Total Peserta Saat Ini:</span>
                  <span className="font-bold text-brand-700">
                    {currentKelas.jumlah_mahasiswa} Mahasiswa
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Cari Mahasiswa */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Cari Mahasiswa <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setShowDropdown(true);
                }}
                placeholder="Ketik Nama atau NIM mahasiswa..."
                className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 outline-none focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition"
              />
              <svg
                className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              {searchLoading && (
                <div className="absolute right-3 top-2.5">
                  <div className="h-4 w-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            {errors.mahasiswa && (
              <p className="text-[11px] text-red-600 mt-1">{errors.mahasiswa}</p>
            )}

            {/* Dropdown Hasil Pencarian */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-20">
                {searchResults.map((mhs) => (
                  <button
                    key={mhs.code}
                    type="button"
                    onClick={() => handleSelectMahasiswa(mhs)}
                    className="w-full px-3 py-2 text-left hover:bg-brand-50 flex items-center justify-between text-xs border-b border-gray-50 last:border-0 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {mhs.nama_mahasiswa}
                      </p>
                      <p className="text-[11px] text-gray-400">NIM: {mhs.nim}</p>
                    </div>
                    <span className="text-[10px] text-brand-600 font-medium px-1.5 py-0.5 bg-brand-50 rounded">
                      Pilih
                    </span>
                  </button>
                ))}
              </div>
            )}

            {showDropdown &&
              !searchLoading &&
              searchQuery.trim() &&
              searchResults.length === 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-center text-xs text-gray-400 z-20">
                  Tidak ditemukan mahasiswa dengan nama atau NIM tersebut.
                </div>
              )}

            {selectedMahasiswa && (
              <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs flex items-center justify-between">
                <div>
                  <p className="font-semibold text-emerald-900">
                    {selectedMahasiswa.nama_mahasiswa}
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    NIM: {selectedMahasiswa.nim}
                  </p>
                </div>
                <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                  <svg
                    className="h-4 w-4 text-emerald-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Terpilih
                </span>
              </div>
            )}
          </div>

          {/* 3. KRS Mahasiswa (Info / Bantuan) */}
          {selectedMahasiswa && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-700">
                  Daftar KRS Mahasiswa
                </label>
                {loadingKrs && (
                  <span className="text-[11px] text-gray-400">Memuat KRS...</span>
                )}
              </div>

              {krsList.length > 0 ? (
                <div className="space-y-1.5">
                  <p className="text-[11px] text-gray-500">
                    Pilih semester KRS mahasiswa untuk menggunakan kode KRS:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {krsList.map((k) => (
                      <button
                        key={k.code_krs}
                        type="button"
                        onClick={() => {
                          setCodeKrsDetail(k.code_krs);
                          setErrors((prev) => {
                            const n = { ...prev };
                            delete n.code_krs_detail;
                            return n;
                          });
                        }}
                        className={`p-2 border rounded-lg text-left text-xs transition ${
                          codeKrsDetail === k.code_krs
                            ? "border-brand-600 bg-brand-50 text-brand-900"
                            : "border-gray-200 hover:border-gray-300 text-gray-700 bg-gray-50/50"
                        }`}
                      >
                        <p className="font-semibold">Semester {k.semester}</p>
                        <p className="text-[10px] text-gray-400 truncate">
                          ID: {k.id}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : !loadingKrs ? (
                <p className="text-[11px] text-gray-400 italic">
                  Belum ada KRS terdaftar untuk mahasiswa ini. Anda dapat
                  memasukkan kode detail KRS secara manual di bawah.
                </p>
              ) : null}
            </div>
          )}

          {/* 4. Kode KRS Detail (Input) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Kode KRS Detail <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={codeKrsDetail}
              onChange={(e) => {
                setCodeKrsDetail(e.target.value);
                setErrors((prev) => {
                  const n = { ...prev };
                  delete n.code_krs_detail;
                  return n;
                });
              }}
              placeholder="Masukkan kode detail KRS (string enkripsi)..."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 outline-none focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition font-mono"
            />
            {errors.code_krs_detail && (
              <p className="text-[11px] text-red-600 mt-1">
                {errors.code_krs_detail}
              </p>
            )}
            <p className="text-[10px] text-gray-400 mt-1">
              Kode unik enkripsi detail KRS mahasiswa untuk mata kuliah pada
              kelas ini.
            </p>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={submitting}
            >
              Simpan Penempatan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
