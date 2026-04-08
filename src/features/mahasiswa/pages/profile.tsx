
import { useState } from "react";
import ProfileCard from "../components/organisms/ProfileCard";
import OrangTuaCard from "../components/organisms/OrangTuaCard";
import EditProfileCard from "../components/organisms/EditProfileCard";
import EditOrangTuaCard from "../components/organisms/EditOrangTuaCard";
import type { Mahasiswa } from "../types/mahasiswa";
import type { EditProfileValues } from "../components/organisms/EditProfileCard";
import type { EditOrangTuaValues } from "../components/organisms/EditOrangTuaCard";

// TODO: ganti dengan data dari API
const dummyMahasiswa: Mahasiswa = {
  nim: "2101020042",
  nama: "Nugroho Dwi Aji",
  tempatLahir: "Tanjung",
  tanggalLahir: "2002-01-11",
  jenisKelamin: "L",
  agama: "Islam",
  golonganDarah: "O",
  alamat: "Jl. Merdeka No. 12, Tanjung, Jawa Barat 40111",
  noHp: "081234567890",
  email: "nugrohodwiaji@mahasiswa.fk.ac.id",
  programStudi: "Pendidikan Dokter",
  fakultas: "Kedokteran",
  angkatan: 2024,
  semester: 4,
  statusAktif: "Aktif",
  foto: undefined,
  orangTua: {
    namaAyah: "Rudi Ramdhan",
    pekerjaanAyah: "Wiraswasta",
    nohpAyah: "08198765432",
    namaIbu: "Siti Aminah",
    pekerjaanIbu: "Ibu Rumah Tangga",
    nohpIbu: "08112345678",
    alamat: "Jl. Merdeka No. 12, Tanjung, Jawa Barat 40111",
  },
};

export default function Profile() {
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa>(dummyMahasiswa);
  const [editMode, setEditMode] = useState<"none" | "profile" | "orangtua">("none");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSaveProfile(values: EditProfileValues) {
    setIsSaving(true);
    try {
      // TODO: kirim ke API
      setMahasiswa((m) => ({ ...m, ...values }));
      setEditMode("none");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveOrangTua(values: EditOrangTuaValues) {
    setIsSaving(true);
    try {
      // TODO: kirim ke API
      setMahasiswa((m) => ({ ...m, orangTua: values }));
      setEditMode("none");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Profil Mahasiswa</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Informasi data diri dan orang tua mahasiswa
        </p>
      </div>

      {editMode === "profile" ? (
        <EditProfileCard
          mahasiswa={mahasiswa}
          onSave={handleSaveProfile}
          onCancel={() => setEditMode("none")}
          isLoading={isSaving}
        />
      ) : (
        <ProfileCard mahasiswa={mahasiswa} onEditProfile={() => setEditMode("profile")} />
      )}

      {editMode === "orangtua" ? (
        <EditOrangTuaCard
          orangTua={mahasiswa.orangTua}
          onSave={handleSaveOrangTua}
          onCancel={() => setEditMode("none")}
          isLoading={isSaving}
        />
      ) : (
        <OrangTuaCard
          orangTua={mahasiswa.orangTua}
          onEdit={() => setEditMode("orangtua")}
        />
      )}
    </div>
  );
}
