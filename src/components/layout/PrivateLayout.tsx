import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useStafAuthStore } from "@/features/auth/stores/stafAuthStore";
import { useDosenAuthStore } from "@/features/dosen/stores/dosenAuthStore";
import { useEffect, useState } from "react";

const PrivateRoute = () => {
  const user = useAuthStore((state) => state.user);
  const adminUser = useStafAuthStore((state) => state.user);
  const dosenUser = useDosenAuthStore((state) => state.user);

  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verify = async () => {
      if (!useAuthStore.getState().user) {
        await useAuthStore.getState().checkAuth();
      }
      setIsVerifying(false);
    };
    verify();
  }, []);

  if (isVerifying) {
    return <div>Memeriksa sesi...</div>;
  }

  if (adminUser) return <Navigate to="/admin/dashboard" replace />;
  if (dosenUser) return <Navigate to="/dosen/dashboard" replace />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
