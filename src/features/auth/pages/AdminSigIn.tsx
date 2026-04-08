import { useState } from "react";
import SignInForm from "../../../components/organisms/SignInForm";
import type { SignInFormValues } from "../../../components/organisms/SignInForm";

function AdminSignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | undefined>();

  async function handleSignIn(values: SignInFormValues) {
    setIsLoading(true);
    setAuthError(undefined);
    try {
      // TODO: integrate with admin auth API
      console.log("Admin sign in", values);
    } catch {
      setAuthError("Username atau password salah. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-brand-50">
      {/* Left panel — form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="h-9 w-9 rounded-full bg-brand-800 flex items-center justify-center text-white font-bold text-sm select-none">
              FK
            </div>
            <span className="font-semibold text-brand-800 tracking-wide">
              SIAKAD FK
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Portal Admin
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Masuk dengan akun administrator Anda
            </p>
          </div>

          <SignInForm
            onSubmit={handleSignIn}
            isLoading={isLoading}
            error={authError}
          />
        </div>
      </div>

      {/* Right panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-brand-800 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg select-none">
            FK
          </div>
          <span className="font-semibold text-lg tracking-wide">SIAKAD FK</span>
        </div>

        <div>
          <h2 className="text-3xl font-bold leading-snug mb-3">
            Panel Administrasi
            <br />
            Fakultas Kedokteran
          </h2>
          <p className="text-brand-200 text-sm leading-relaxed">
            Kelola seluruh data akademik dan pengguna sistem melalui panel
            administrasi terpusat.
          </p>
        </div>

        <p className="text-brand-300 text-xs">
          © {new Date().getFullYear()} Fakultas Kedokteran. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default AdminSignIn;
