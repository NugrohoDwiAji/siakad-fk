import { useState, useEffect, useRef, useCallback } from "react";
import { SelectField } from "@/components/ui";
import type { SelectOption } from "@/components/ui/SelectField";
import { createPerwalian, updatePerwalian } from "@/features/admin/api/perwalian";
import { searchMahasiswa, getListDosen } from "@/features/admin/api/masterData";
import type { PerwalianItem, MahasiswaSearchItem } from "@/features/admin/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PerwalianFormCardProps {
  onClose: () => void;
  onSuccess: () => void;
  editData?: PerwalianItem;
}

interface SelectedMahasiswa {
  code: string;
  nim: string;
  nama: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PerwalianFormCard({ onClose, onSuccess, editData }: PerwalianFormCardProps) {
  const isEditMode = !!editData;

  const [selectedMhs, setSelectedMhs] = useState<SelectedMahasiswa | null>(
    editData ? { code: editData.code, nim: editData.nim, nama: editData.nama_mahasiswa } : null
  );
  const [dosenCode, setDosenCode] = useState(editData?.code_dosen || "");
  const [dosenPerwakilanCode, setDosenPerwakilanCode] = useState(editData?.code_dosen_perwakilan || "");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [dosenOptions, setDosenOptions] = useState<SelectOption[]>([]);
  const [loadingDosen, setLoadingDosen] = useState(true);

  // ── Mahasiswa search ──
  const [searchQuery, setSearchQuery] = useState(editData?.nama_mahasiswa || "");
  const [searchResults, setSearchResults] = useState<MahasiswaSearchItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Fetch dosen list ──
  useEffect(() => {
    let cancelled = false;

    async function fetchDosen() {
      setLoadingDosen(true);
      const result = await getListDosen(1, 100);
      if (cancelled) return;

      if (result.status && result.data) {
        setDosenOptions(
          result.data.data.map((d) => ({ value: d.code, label: d.nama_dosen }))
        );
      }
      setLoadingDosen(false);
    }

    fetchDosen();
    return () => { cancelled = true; };
  }, []);

  // ── Close dropdown on outside click ──
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Escape key ──
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // ── Debounced mahasiswa search ──
  const handleSearchInput = useCallback((value: string) => {
    setSearchQuery(value);
    setSelectedMhs(null);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!value.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setSearchLoading(true);
    setShowDropdown(true);

    debounceTimer.current = setTimeout(async () => {
      const result = await searchMahasiswa(value.trim());
      if (result.status) {
        setSearchResults(result.data);
      } else {
        setSearchResults([]);
      }
      setSearchLoading(false);
    }, 500);
  }, []);

  function handleSelectMahasiswa(mhs: MahasiswaSearchItem) {
    setSelectedMhs({ code: mhs.code, nim: mhs.nim, nama: mhs.nama_mahasiswa });
    setSearchQuery(mhs.nama_mahasiswa);
    setSearchResults([]);
    setShowDropdown(false);
    if (errors.code) setErrors((e) => ({ ...e, code: "" }));
  }

  function handleSelectDosen(value: string) {
    setDosenCode(value);
    if (errors.code_dosen) setErrors((e) => ({ ...e, code_dosen: "" }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};

    if (!isEditMode && !selectedMhs) {
      e.code = "Mahasiswa wajib dipilih.";
    }

    if (!isEditMode && !dosenCode) {
      e.code_dosen = "Dosen wali wajib dipilih.";
    }

    if (isEditMode && !dosenCode && !dosenPerwakilanCode) {
      e.code_dosen = "Minimal salah satu dosen harus dipilih.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setSaveError(null);

    let result;
    if (isEditMode) {
      result = await updatePerwalian(editData.code, {
        kode_dosen: dosenCode || null,
        kode_dosen_perwakilan: dosenPerwakilanCode || null,
        nim: selectedMhs?.code || null,
      });
    } else {
      result = await createPerwalian({
        code: selectedMhs!.code,
        code_dosen: dosenCode,
        code_dosen_perwakilan: dosenPerwakilanCode || null,
      });
    }

    setSaving(false);

    if (result.status) {
      onSuccess();
    } else {
      setSaveError(result.message);
    }
  }

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
          <div>
            <h2 className="font-semibold text-gray-800">
              {isEditMode ? "Edit Perwalian" : "Tambah Perwalian"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEditMode ? "Perbarui data perwalian" : "Lengkapi form untuk menambah perwalian"}
            </p>
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

        {/* Error */}
        {saveError && (
          <div className="mx-5 mt-4 bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm">
            {saveError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Mahasiswa Search */}
          <div className="flex flex-col gap-1.5" ref={dropdownRef}>
            <label className="text-sm font-medium text-gray-700">
              Mahasiswa <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
                placeholder={isEditMode ? editData?.nama_mahasiswa : "Cari nama mahasiswa..."}
                disabled={isEditMode}
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-800 outline-none transition ${
                  errors.code
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-gray-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                } ${isEditMode ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
              />
              {searchLoading && (
                <span className="absolute inset-y-0 right-3 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-600" />
                </span>
              )}

              {/* Dropdown */}
              {showDropdown && !isEditMode && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {searchLoading ? (
                    <div className="px-4 py-3 text-center text-sm text-gray-400">Mencari...</div>
                  ) : searchResults.length === 0 ? (
                    <div className="px-4 py-3 text-center text-sm text-gray-400">Tidak ditemukan</div>
                  ) : (
                    searchResults.map((mhs) => (
                      <button
                        key={mhs.code}
                        type="button"
                        onClick={() => handleSelectMahasiswa(mhs)}
                        className="w-full text-left px-4 py-2.5 hover:bg-brand-50 transition flex items-center gap-3"
                      >
                        <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700 shrink-0">
                          {mhs.nama_mahasiswa.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{mhs.nama_mahasiswa}</p>
                          <p className="text-xs text-gray-500">{mhs.nim}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {errors.code && <p className="text-xs text-red-500">{errors.code}</p>}
            {selectedMhs && (
              <p className="text-xs text-green-600">Dipilih: {selectedMhs.nama} ({selectedMhs.nim})</p>
            )}
          </div>

          {/* Dosen Wali */}
          <SelectField
            label="Dosen Wali"
            options={dosenOptions}
            placeholder={loadingDosen ? "Memuat..." : "Pilih dosen wali"}
            value={dosenCode}
            onChange={(e) => handleSelectDosen(e.target.value)}
            error={errors.code_dosen}
            required
            disabled={saving || loadingDosen}
          />

          {/* Dosen Perwakilan */}
          <SelectField
            label="Dosen Perwakilan"
            options={dosenOptions}
            placeholder={loadingDosen ? "Memuat..." : "Pilih dosen perwakilan (opsional)"}
            value={dosenPerwakilanCode || ""}
            onChange={(e) => setDosenPerwakilanCode(e.target.value || "")}
            disabled={saving || loadingDosen}
          />

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition"
              disabled={saving}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-800 text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition inline-flex items-center gap-2"
            >
              {saving && (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {saving ? "Menyimpan..." : isEditMode ? "Perbarui" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
