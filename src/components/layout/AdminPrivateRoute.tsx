import { Navigate, Outlet } from "react-router-dom";
import { useStafAuthStore } from "@/features/auth/stores/stafAuthStore";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useDosenAuthStore } from "@/features/dosen/stores/dosenAuthStore";
import { useEffect, useState } from "react";

const AdminPrivateRoute = () => {
  const user = useStafAuthStore((state) => state.user);
  const mhsUser = useAuthStore((state) => state.user);
  const dsnUser = useDosenAuthStore((state) => state.user);

  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verify = async () => {
      if (!useStafAuthStore.getState().user) {
        await useStafAuthStore.getState().checkAuth();
      }
      setIsVerifying(false);
    };
    verify();
  }, []);

  if (isVerifying) {
    return <div>Memeriksa sesi...</div>;
  }

  if (mhsUser) return <Navigate to="/profile" replace />;
  if (dsnUser) return <Navigate to="/dosen/dashboard" replace />;

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default AdminPrivateRoute;
