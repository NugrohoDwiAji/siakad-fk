import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import SignInForm from "../components/organisms/SignInForm";
import type { SignInFormValues } from "../components/organisms/SignInForm";

import { useAuthStore } from "@/features/auth/stores/authStore";
import { useStafAuthStore } from "@/features/auth/stores/stafAuthStore";
import { useDosenAuthStore } from "@/features/dosen/stores/dosenAuthStore";
import AuthBannerOverlay from "@/components/common/AuthBannerOverlay";

function MahasiswaSignIn() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const adminUser = useStafAuthStore((state) => state.user);
  const dosenUser = useDosenAuthStore((state) => state.user);

  useEffect(() => {
    if (adminUser) navigate("/admin/dashboard", { replace: true });
    else if (dosenUser) navigate("/dosen/dashboard", { replace: true });
  }, [adminUser, dosenUser, navigate]);

  if (adminUser || dosenUser) return null;

  async function handleSignIn(values: SignInFormValues) {
    setErrorMsg("");
    setIsLoading(true);

    const result = await login(values);

    setIsLoading(false);

    if (result.status) {
      navigate("/profile");
      return;
    }

    setErrorMsg(result.message || "Login gagal. Silakan periksa kembali NIM dan password Anda.");
  }

  return (
    <div className="min-h-screen flex bg-gray-50/70">
      {/* ── Left panel: Aesthetic Background Image Overlay ── */}
      <AuthBannerOverlay role="mahasiswa" />

      {/* ── Right panel: Login Form ── */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Mobile brand header (visible on smaller screens) */}
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
                🎓 Portal Mahasiswa
              </span>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Selamat Datang
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Silakan masuk menggunakan NIM dan kata sandi Anda.
              </p>
            </div>

            <SignInForm
              onSubmit={handleSignIn}
              isLoading={isLoading}
              error={errorMsg}
            />

            {/* Portal Switcher Navigation */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-gray-500">
              <span>Bukan mahasiswa?</span>
              <div className="flex items-center gap-3 font-semibold text-brand-700">
                <Link to="/dosen/auth" className="hover:text-brand-900 hover:underline transition-colors">
                  Login Dosen &rarr;
                </Link>
                <span className="text-gray-300">•</span>
                <Link to="/admin/login" className="hover:text-brand-900 hover:underline transition-colors">
                  Portal Admin &rarr;
                </Link>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Butuh bantuan akses akun? Hubungi BAAK Fakultas Kedokteran.
          </p>
        </div>
      </div>
    </div>
  );
}

export default MahasiswaSignIn;
