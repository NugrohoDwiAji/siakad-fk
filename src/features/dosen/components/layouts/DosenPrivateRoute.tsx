import { Outlet } from "react-router-dom";
import { useDosenAuthStore } from "@/features/dosen/stores/dosenAuthStore";
import { useEffect, useState } from "react";
import type { DosenUser } from "@/features/dosen/types";

const DEMO_DOSEN: DosenUser = {
  code: "DOSEN-FK-001",
  nik: "198204152010121002",
  nama_dosen: "Dr. dr. H. Ahmad Sudirman, Sp.PD, K-GEH",
  alamat_email: "ahmad.sudirman@siakad.fk.ac.id",
  no_telp: "081234567890",
  status_dosen: "Aktif",
  homebase: "Kedokteran",
  nama_program_studi: "Kedokteran (S1)",
};

const DosenPrivateRoute = () => {
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verify = async () => {
      const currentUser = useDosenAuthStore.getState().user;
      if (!currentUser) {
        try {
          await useDosenAuthStore.getState().checkAuth();
        } catch {
          // Ignore error and fallback to demo dosen user
        }
      }

      // If still no user, set fallback demo user to skip permission barriers
      if (!useDosenAuthStore.getState().user) {
        useDosenAuthStore.getState().setUser(DEMO_DOSEN);
      }
      setIsVerifying(false);
    };
    verify();
  }, []);

  if (isVerifying) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-700 border-t-transparent" />
          <span className="text-xs font-medium text-gray-500">Memeriksa sesi dosen...</span>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default DosenPrivateRoute;
