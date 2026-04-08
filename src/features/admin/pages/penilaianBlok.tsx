import { useState } from "react";
import type { Blok, KomponenPenilaian } from "../types/penilaianBlok";
import BlokSelectorField from "../components/moleculs/BlokSelectorField";
import KomponenPenilaianPanel from "../components/organisms/KomponenPenilaianPanel";

// ─── Dummy Data ────────────────────────────────────────────────────────────────

const blokList: Blok[] = [
  { id: "blok-1", kode: "BLK-01", nama: "Sistem Respirasi", semester: 3, tahunAjaran: "2025/2026" },
  { id: "blok-2", kode: "BLK-02", nama: "Sistem Kardiovaskular", semester: 3, tahunAjaran: "2025/2026" },
  { id: "blok-3", kode: "BLK-03", nama: "Sistem Saraf Pusat", semester: 4, tahunAjaran: "2025/2026" },
  { id: "blok-4", kode: "BLK-04", nama: "Sistem Gastrointestinal", semester: 4, tahunAjaran: "2025/2026" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function generateId() {
  return `komp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PenilaianBlok() {
  const [selectedBlokId, setSelectedBlokId] = useState<string>("");
  // Map blokId → daftar komponen
  const [komponenMap, setKomponenMap] = useState<Record<string, KomponenPenilaian[]>>({});

  const selectedBlok = blokList.find((b) => b.id === selectedBlokId) ?? null;
  const komponenList = selectedBlokId ? (komponenMap[selectedBlokId] ?? []) : [];

  function setKomponenForBlok(blokId: string, updater: (prev: KomponenPenilaian[]) => KomponenPenilaian[]) {
    setKomponenMap((prev) => ({
      ...prev,
      [blokId]: updater(prev[blokId] ?? []),
    }));
  }

  function handleAdd(data: { judul: string; bobot: number }) {
    if (!selectedBlokId) return;
    setKomponenForBlok(selectedBlokId, (prev) => [
      ...prev,
      { id: generateId(), ...data, subKomponen: [] },
    ]);
  }

  function handleEdit(id: string, data: { judul: string; bobot: number }) {
    if (!selectedBlokId) return;
    setKomponenForBlok(selectedBlokId, (prev) =>
      prev.map((k) => (k.id === id ? { ...k, ...data } : k))
    );
  }

  function handleDelete(id: string) {
    if (!selectedBlokId) return;
    setKomponenForBlok(selectedBlokId, (prev) => prev.filter((k) => k.id !== id));
  }

  function handleAddSubKomponen(komponenId: string, data: { judul: string; bobot: number }) {
    if (!selectedBlokId) return;
    setKomponenForBlok(selectedBlokId, (prev) =>
      prev.map((k) =>
        k.id === komponenId
          ? { ...k, subKomponen: [...k.subKomponen, { id: generateId(), ...data }] }
          : k
      )
    );
  }

  function handleEditSubKomponen(komponenId: string, subKomponenId: string, data: { judul: string; bobot: number }) {
    if (!selectedBlokId) return;
    setKomponenForBlok(selectedBlokId, (prev) =>
      prev.map((k) =>
        k.id === komponenId
          ? { ...k, subKomponen: k.subKomponen.map((sk) => (sk.id === subKomponenId ? { id: subKomponenId, ...data } : sk)) }
          : k
      )
    );
  }

  function handleDeleteSubKomponen(komponenId: string, subKomponenId: string) {
    if (!selectedBlokId) return;
    setKomponenForBlok(selectedBlokId, (prev) =>
      prev.map((k) =>
        k.id === komponenId
          ? { ...k, subKomponen: k.subKomponen.filter((sk) => sk.id !== subKomponenId) }
          : k
      )
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Page title ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Setup Penilaian Blok</h1>
        <p className="text-sm text-gray-500 mt-1">
          Atur komponen penilaian untuk setiap blok mata kuliah.
        </p>
      </div>

      {/* ── Blok selector card ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
        <BlokSelectorField
          blokList={blokList}
          selectedId={selectedBlokId}
          onChange={setSelectedBlokId}
        />
      </div>

      {/* ── Komponen panel (hanya muncul setelah blok dipilih) ── */}
      {selectedBlok ? (
        <KomponenPenilaianPanel
          blok={selectedBlok}
          komponenList={komponenList}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddSubKomponen={handleAddSubKomponen}
          onEditSubKomponen={handleEditSubKomponen}
          onDeleteSubKomponen={handleDeleteSubKomponen}
        />
      ) : (
        /* Placeholder */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-full bg-brand-50 flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-brand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500">Pilih blok terlebih dahulu</p>
          <p className="text-xs text-gray-400 mt-1">
            Gunakan dropdown di atas untuk memilih blok yang ingin dikonfigurasi.
          </p>
        </div>
      )}
    </div>
  );
}
