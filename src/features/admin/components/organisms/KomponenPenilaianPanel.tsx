import { useState } from "react";
import type { Blok, KomponenPenilaian, SubKomponen } from "../../types/penilaianBlok";
import KomponenBar from "../atoms/KomponenBar";
import SubKomponenBar from "../atoms/SubKomponenBar";
import AddIconButton from "../atoms/AddIconButton";
import KomponenFormCard from "../moleculs/KomponenFormCard";
import SubKomponenFormCard from "../moleculs/SubKomponenFormCard";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface KomponenPenilaianPanelProps {
  blok: Blok;
  komponenList: KomponenPenilaian[];
  onAdd: (data: { judul: string; bobot: number }) => void;
  onEdit: (id: string, data: { judul: string; bobot: number }) => void;
  onDelete: (id: string) => void;
  onAddSubKomponen: (komponenId: string, data: { judul: string; bobot: number }) => void;
  onEditSubKomponen: (komponenId: string, subKomponenId: string, data: { judul: string; bobot: number }) => void;
  onDeleteSubKomponen: (komponenId: string, subKomponenId: string) => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function KomponenPenilaianPanel({
  blok,
  komponenList,
  onAdd,
  onEdit,
  onDelete,
  onAddSubKomponen,
  onEditSubKomponen,
  onDeleteSubKomponen,
}: KomponenPenilaianPanelProps) {
  // ── Komponen form state ──
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<KomponenPenilaian | undefined>();

  // ── Sub komponen form state ──
  const [showSubKomponenForm, setShowSubKomponenForm] = useState(false);
  const [subKomponenKomponenId, setSubKomponenKomponenId] = useState<string | null>(null);
  const [editSubKomponenTarget, setEditSubKomponenTarget] = useState<SubKomponen | undefined>();

  const totalBobot = komponenList.reduce((sum, k) => sum + k.bobot, 0);
  const sisaBobot = 100 - totalBobot;

  function handleSave(data: { judul: string; bobot: number }) {
    if (editTarget) {
      onEdit(editTarget.id, data);
      setEditTarget(undefined);
    } else {
      onAdd(data);
    }
    setShowForm(false);
  }

  function handleEdit(komponen: KomponenPenilaian) {
    setEditTarget(komponen);
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditTarget(undefined);
  }

  // ── Sub komponen handlers ──
  function handleOpenSubKomponenForm(komponen: KomponenPenilaian) {
    setSubKomponenKomponenId(komponen.id);
    setEditSubKomponenTarget(undefined);
    setShowSubKomponenForm(true);
  }

  function handleEditSubKomponenClick(komponenId: string, subKomponen: SubKomponen) {
    setSubKomponenKomponenId(komponenId);
    setEditSubKomponenTarget(subKomponen);
    setShowSubKomponenForm(true);
  }

  function handleSubKomponenSave(data: { judul: string; bobot: number }) {
    if (!subKomponenKomponenId) return;
    if (editSubKomponenTarget) {
      onEditSubKomponen(subKomponenKomponenId, editSubKomponenTarget.id, data);
    } else {
      onAddSubKomponen(subKomponenKomponenId, data);
    }
    setShowSubKomponenForm(false);
    setSubKomponenKomponenId(null);
    setEditSubKomponenTarget(undefined);
  }

  function handleSubKomponenCancel() {
    setShowSubKomponenForm(false);
    setSubKomponenKomponenId(null);
    setEditSubKomponenTarget(undefined);
  }

  const subKomponenParent = komponenList.find((k) => k.id === subKomponenKomponenId);

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* ── Panel header ── */}
        <div className="bg-brand-800 px-5 py-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-brand-300 font-medium uppercase tracking-wide">
              Setup Penilaian
            </p>
            <h2 className="text-white font-bold mt-0.5 leading-tight">
              {blok.kode} — {blok.nama}
            </h2>
            <p className="text-brand-200 text-xs mt-1">
              Semester {blok.semester} &bull; T.A. {blok.tahunAjaran}
            </p>
          </div>

          {/* Bobot summary */}
          <div className="flex flex-col items-end shrink-0">
            <span
              className={`text-xl font-black tabular-nums ${
                totalBobot === 100 ? "text-green-400" : totalBobot > 100 ? "text-red-400" : "text-white"
              }`}
            >
              {totalBobot}%
            </span>
            <span className="text-brand-300 text-xs">
              {totalBobot === 100
                ? "Bobot terpenuhi ✓"
                : `Sisa ${sisaBobot}%`}
            </span>
          </div>
        </div>

        {/* ── Progress bar total bobot ── */}
        <div className="h-1.5 bg-gray-100">
          <div
            className={`h-full transition-all duration-300 ${
              totalBobot > 100 ? "bg-red-500" : totalBobot === 100 ? "bg-green-500" : "bg-brand-500"
            }`}
            style={{ width: `${Math.min(totalBobot, 100)}%` }}
          />
        </div>

        {/* ── Komponen list ── */}
        <div className="p-5 space-y-2.5">
          {/* Sub-header */}
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Komponen Penilaian
            </p>
            <span className="text-xs text-gray-400">
              {komponenList.length} komponen
            </span>
          </div>

          {/* Empty state */}
          {komponenList.length === 0 && (
            <div className="flex flex-col items-center py-8 text-center">
              <svg
                className="h-10 w-10 text-gray-300 mb-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm text-gray-400">
                Belum ada komponen penilaian.
              </p>
              <p className="text-xs text-gray-300 mt-0.5">
                Klik tombol di bawah untuk menambahkan.
              </p>
            </div>
          )}

          {/* Bars */}
          {komponenList.map((k, i) => (
            <div key={k.id} className="space-y-1.5">
              <KomponenBar
                komponen={k}
                index={i}
                onEdit={handleEdit}
                onDelete={onDelete}
                onAddSubBab={handleOpenSubKomponenForm}
              />

              {/* Sub komponen list — indented below the parent bar */}
              {k.subKomponen.length > 0 && (
                <div className="ml-10 space-y-1 border-l-2 border-brand-100 pl-3">
                  {k.subKomponen.map((sk, si) => (
                    <SubKomponenBar
                      key={sk.id}
                      subKomponen={sk}
                      index={si}
                      onEdit={(s) => handleEditSubKomponenClick(k.id, s)}
                      onDelete={(skId) => onDeleteSubKomponen(k.id, skId)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Add button */}
          <div className="pt-1">
            <AddIconButton onClick={() => setShowForm(true)} />
          </div>
        </div>
      </div>

      {/* ── Komponen modal ── */}
      {showForm && (
        <KomponenFormCard
          key={editTarget?.id ?? "__add__"}
          initial={editTarget}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {/* ── Sub komponen modal ── */}
      {showSubKomponenForm && subKomponenParent && (
        <SubKomponenFormCard
          key={editSubKomponenTarget?.id ?? `__subkomp-add-${subKomponenKomponenId}__`}
          komponenJudul={subKomponenParent.judul}
          initial={editSubKomponenTarget}
          onSave={handleSubKomponenSave}
          onCancel={handleSubKomponenCancel}
        />
      )}
    </>
  );
}
