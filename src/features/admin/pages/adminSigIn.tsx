import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AdminSignInForm from "../components/organisms/AdminSignInForm";
import type { AdminSignInFormValues } from "../components/organisms/AdminSignInForm";
import { useStafAuthStore } from "@/features/auth/stores/stafAuthStore";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useDosenAuthStore } from "@/features/dosen/stores/dosenAuthStore";
import AuthBannerOverlay from "@/components/common/AuthBannerOverlay";

function AdminSignIn() {
  const { login } = useStafAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | undefined>();

  const mhsUser = useAuthStore((state) => state.user);
  const dsnUser = useDosenAuthStore((state) => state.user);

  useEffect(() => {
    if (mhsUser) navigate("/profile", { replace: true });
    else if (dsnUser) navigate("/dosen/dashboard", { replace: true });
  }, [mhsUser, dsnUser, navigate]);

  if (mhsUser || dsnUser) return null;

  async function handleSignIn(values: AdminSignInFormValues) {
    setIsLoading(true);
    setAuthError(undefined);

    const result = await login({ email: values.email, password: values.password });

    setIsLoading(false);

    if (result.status) {
      navigate("/admin/dashboard");
      return;
    }

    setAuthError(result.message || "Email atau password salah. Silakan coba lagi.");
  }

  return (
    <div className="min-h-screen flex bg-gray-50/70">
      {/* ── Left panel: Login Form ── */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Mobile brand header */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="h-10 w-10 rounded-xl bg-brand-800 flex items-center justify-center text-white font-bold text-sm shadow-sm select-none">
              FK
            </div>
            <div>
              <span className="font-extrabold text-brand-900 tracking-tight text-lg block leading-none">
                SIAKAD FK
              </span>
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mt-1">
                Fakultas Kedokteran
              </span>
            </div>
          </div>

          {/* Form Card Container */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-8 sm:p-10">
            <div className="mb-8">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-100 mb-3">
                🛡️ Portal Administrasi
              </span>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Masuk Administrator
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Akses panel operasional staf dan BAAK Fakultas Kedokteran.
              </p>
            </div>

            <AdminSignInForm
              onSubmit={handleSignIn}
              isLoading={isLoading}
              error={authError}
            />

            {/* Portal Switcher Navigation */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-gray-500">
              <span>Bukan administrator?</span>
              <div className="flex items-center gap-3 font-semibold text-brand-700">
                <Link to="/login" className="hover:text-brand-900 hover:underline transition-colors">
                  Login Mahasiswa &rarr;
                </Link>
                <span className="text-gray-300">•</span>
                <Link to="/dosen/auth" className="hover:text-brand-900 hover:underline transition-colors">
                  Portal Dosen &rarr;
                </Link>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Akses khusus staf berwenang • Seluruh log aktivitas tercatat
          </p>
        </div>
      </div>

      {/* ── Right panel: Aesthetic Background Image Overlay ── */}
      <AuthBannerOverlay role="admin" />
    </div>
  );
}

export default AdminSignIn;
