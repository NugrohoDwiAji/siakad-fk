import Button from "@/components/ui/Button";
import type { Mahasiswa } from "@/features/mahasiswa/types";

interface ProfileCardProps {
  mahasiswa: Mahasiswa;
  onEditProfile: () => void;
}

const statusColor: Record<Mahasiswa["statusAktif"], string> = {
  Aktif: "bg-green-100 text-green-700",
  Cuti: "bg-yellow-100 text-yellow-700",
  Lulus: "bg-blue-100 text-blue-700",
  Keluar: "bg-red-100 text-red-700",
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-0.5 sm:gap-0 py-2.5 border-b border-gray-100 last:border-0">
      <dt className="w-full sm:w-48 shrink-0 text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </dt>
      <dd className="text-sm text-gray-800">{value || "-"}</dd>
    </div>
  );
}

function AvatarPlaceholder({ nama }: { nama: string }) {
  const initials = nama
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="h-full w-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-4xl select-none">
      {initials}
    </div>
  );
}

function EditIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export default function ProfileCard({ mahasiswa, onEditProfile }: ProfileCardProps) {
  const tglLahir = mahasiswa.tanggalLahir
    ? new Date(mahasiswa.tanggalLahir).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Top strip */}
      <div className="h-24 bg-linear-to-r from-brand-800 to-brand-600" />

      <div className="px-6 pb-6">
        {/* Avatar + action */}
        <div className="flex items-end justify-between -mt-14 mb-6">
          <div className="h-28 w-28 rounded-xl border-4 border-white shadow-md overflow-hidden bg-brand-100">
            {mahasiswa.foto ? (
              <img
                src={mahasiswa.foto}
                alt={`Foto ${mahasiswa.nama}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <AvatarPlaceholder nama={mahasiswa.nama} />
            )}
          </div>

          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[mahasiswa.statusAktif]}`}>
              {mahasiswa.statusAktif}
            </span>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<EditIcon />}
              onClick={onEditProfile}
            >
              Ubah Profil
            </Button>
          </div>
        </div>

        {/* Name & NIM */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">{mahasiswa.nama}</h2>
          <p className="text-sm text-gray-500">{mahasiswa.nim} &bull; {mahasiswa.programStudi}</p>
        </div>

        {/* Academic info pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { label: "Fakultas", value: mahasiswa.fakultas },
            { label: "Angkatan", value: String(mahasiswa.angkatan) },
            { label: "Semester", value: `Semester ${mahasiswa.semester}` },
          ].map((item) => (
            <div key={item.label} className="bg-brand-50 rounded-lg px-3 py-2 text-center min-w-24">
              <p className="text-xs text-brand-600 font-medium">{item.label}</p>
              <p className="text-sm font-semibold text-brand-900">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Personal info */}
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Data Pribadi</h3>
        <dl>
          <InfoRow label="Tempat, Tanggal Lahir" value={`${mahasiswa.tempatLahir}, ${tglLahir}`} />
          <InfoRow label="Jenis Kelamin" value={mahasiswa.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"} />
          <InfoRow label="Agama" value={mahasiswa.agama} />
          <InfoRow label="Golongan Darah" value={mahasiswa.golonganDarah} />
          <InfoRow label="Alamat" value={mahasiswa.alamat} />
          <InfoRow label="No. Handphone" value={mahasiswa.noHp} />
          <InfoRow label="Email" value={mahasiswa.email} />
        </dl>
      </div>
    </div>
  );
}
