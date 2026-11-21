
import { useEffect, useState } from "react";
import ProfileCard from "../components/organisms/ProfileCard";
import OrangTuaCard from "../components/organisms/OrangTuaCard";
import EditProfileCard from "../components/organisms/EditProfileCard";
import EditOrangTuaCard from "../components/organisms/EditOrangTuaCard";
import type { Mahasiswa } from "@/features/mahasiswa/types";
import type { User } from "@/features/auth/types";
import type { EditProfileValues } from "../components/organisms/EditProfileCard";
import type { EditOrangTuaValues } from "../components/organisms/EditOrangTuaCard";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { getSemester } from "@/utils/mahasiswa";
import { useDispatch, useSelector } from "react-redux";

// IMPORT REDUX FILES KITA
import type { RootState } from "@/stores/configStore";
import { 
  setProfilMahasiswa, 

} from "../store/mahasiswaSlice"; // Sesuaikan path


function mapUserToMahasiswa(user: User): Mahasiswa {
  
  const statusAktif = ["Cuti", "Lulus", "Keluar"].includes(user.status)
    ? (user.status as "Cuti" | "Lulus" | "Keluar")
    : "Aktif";

  return {
   
    nim: user.nim || "-",
    nama: user.nama_mahasiswa || "-",
    tempatLahir: user.tempat_lahir || "-",
    tanggalLahir: user.tanggal_lahir || "-",
    jenisKelamin: user.jenis_kelamin || "-",
    agama: user.agama || "-",
    golonganDarah: user.golongan_darah || "-",
    alamat: user.alamat || "-",
    noHp: user.telepon || "-",
    email: user.email || "-",
    programStudi: "S1 Kedokteran",
    fakultas: "Fakultas Kedokteran",
    angkatan: user.nim ? parseInt(`20${user.nim.substring(0, 2)}`) : 0,
    semester: user.nim ? getSemester(user.nim) : 0,
    statusAktif,
    foto: user.foto || undefined,
    orangTua: {
      namaAyah: user.nama_ayah || "-",
      pekerjaanAyah: user.pekerjaan_ayah || "-",
      nohpAyah: user.telepon_orangtua || "-",
      namaIbu: user.nama_ibu || "-",
      pekerjaanIbu: user.pekerjaan_ibu || "-",
      nohpIbu: user.telepon_orangtua || "-",
      alamat: user.alamat_orangtua || "-",
    },
  };
}

export default function Profile() {
  const dispatch = useDispatch();
  const user = useAuthStore((state) => state.user);
  const profile = useSelector((state: RootState) => state.mahasiswa.profile);
  const [profilMhs, setProfilMhs] = useState<Mahasiswa>(
    profile || {
      nim: "-",
      nama: "-",
      tempatLahir: "-",
      tanggalLahir: "-",
      jenisKelamin: "-",
      agama: "-",
      golonganDarah: "-",
      alamat: "-",
      noHp: "-",
      email: "-",
      programStudi: "S1 Kedokteran",
      fakultas: "Fakultas Kedokteran",
      angkatan: 0,
      semester: 0,
      statusAktif: "-",
      orangTua: {
        namaAyah: "-",
        pekerjaanAyah: "-",
        nohpAyah: "-",
        namaIbu: "-",
        pekerjaanIbu: "-",
        nohpIbu: "-",
        alamat: "-",
      },
    }
  );
  const [editMode, setEditMode] = useState<"none" | "profile" | "orangtua">("none");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Jika ada user login, TAPI data profil di Redux belum ada
    if (user && !profile) {
      const mappedData = mapUserToMahasiswa(user);
      dispatch(setProfilMahasiswa(mappedData)); // Simpan ke Redux
    }
  }, [user, profile, dispatch]);

  useEffect(() => {
    if (user) {
      setProfilMhs((current) =>
        current.nim === "-" || current.nim === "" ? mapUserToMahasiswa(user) : current
      );
    }
  }, [user]);

  async function handleSaveProfile(values: EditProfileValues) {
    setIsSaving(true);
    try {
      // TODO: kirim ke API
      setProfilMhs((m) => ({ ...m, ...values }));
      setEditMode("none");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveOrangTua(values: EditOrangTuaValues) {
    setIsSaving(true);
    try {
      // TODO: kirim ke API
      setProfilMhs((m) => ({ ...m, orangTua: values }));
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
          mahasiswa={profilMhs}
          onSave={handleSaveProfile}
          onCancel={() => setEditMode("none")}
          isLoading={isSaving}
        />
      ) : (
        <ProfileCard mahasiswa={profilMhs} onEditProfile={() => setEditMode("profile")} />
      )}

      {editMode === "orangtua" ? (
        <EditOrangTuaCard
          orangTua={profilMhs.orangTua}
          onSave={handleSaveOrangTua}
          onCancel={() => setEditMode("none")}
          isLoading={isSaving}
        />
      ) : (
        <OrangTuaCard
          orangTua={profilMhs.orangTua}
          onEdit={() => setEditMode("orangtua")}
        />
      )}
    </div>
  );
}
