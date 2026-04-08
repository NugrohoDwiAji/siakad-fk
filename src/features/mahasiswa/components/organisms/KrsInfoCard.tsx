import type { Mahasiswa } from "../../types/mahasiswa";

// ─── Info Item ──────────────────────────────────────────────────────────────────

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-gray-400 font-medium">{label}</dt>
      <dd className="text-sm text-gray-800 font-medium">{value}</dd>
    </div>
  );
}

// ─── Section Divider ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="col-span-full flex items-center gap-3 mt-1">
      <span className="text-xs font-semibold text-brand-700 uppercase tracking-wide whitespace-nowrap">
        {children}
      </span>
      <div className="h-px flex-1 bg-brand-100" />
    </div>
  );
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface KrsInfoCardProps {
  mahasiswa: Mahasiswa;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function KrsInfoCard({ mahasiswa }: KrsInfoCardProps) {
  const { orangTua } = mahasiswa;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* ── Header strip ── */}
      <div className="bg-brand-800 px-5 py-3 flex items-center gap-3">
        {/* Avatar initials */}
        <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 select-none">
          <span className="text-sm font-bold text-white">
            {mahasiswa.nama
              .split(" ")
              .slice(0, 2)
              .map((w) => w[0])
              .join("")
              .toUpperCase()}
          </span>
        </div>
        <div>
          <p className="font-bold text-white leading-tight">{mahasiswa.nama}</p>
          <p className="text-xs text-brand-200 mt-0.5">
            {mahasiswa.nim} &bull; {mahasiswa.programStudi}
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-5 py-4">
        <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">
          {/* Informasi Mahasiswa */}
          <SectionLabel>Informasi Mahasiswa</SectionLabel>

          <InfoItem label="NIM" value={mahasiswa.nim} />
          <InfoItem label="Nama Lengkap" value={mahasiswa.nama} />
          <InfoItem label="Semester" value={`Semester ${mahasiswa.semester}`} />
          <InfoItem label="Dosen Wali" value={mahasiswa.dosenWali || "-"} />
          <InfoItem label="No. Telepon" value={mahasiswa.noHp} />
          <div className="col-span-2 sm:col-span-2 lg:col-span-2 flex flex-col gap-0.5">
            <dt className="text-xs text-gray-400 font-medium">Alamat</dt>
            <dd className="text-sm text-gray-800 font-medium">{mahasiswa.alamat}</dd>
          </div>

          {/* Informasi Orang Tua */}
          <SectionLabel>Informasi Orang Tua / Wali</SectionLabel>

          <InfoItem
            label="No. Telepon Ayah"
            value={`${orangTua.namaAyah} — ${orangTua.nohpAyah}`}
          />
          <InfoItem
            label="No. Telepon Ibu"
            value={`${orangTua.namaIbu} — ${orangTua.nohpIbu}`}
          />
          <div className="col-span-2 sm:col-span-3 lg:col-span-4 flex flex-col gap-0.5">
            <dt className="text-xs text-gray-400 font-medium">Alamat Orang Tua</dt>
            <dd className="text-sm text-gray-800 font-medium">{orangTua.alamat}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
