import { useState } from "react";
import FormField from "@/components/ui/FormField";
import PasswordField from "@/components/ui/PasswordField";
import Button from "@/components/ui/Button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DosenSignInFormValues {
  email: string;
  password: string;
}

interface DosenSignInFormProps {
  onSubmit: (values: DosenSignInFormValues) => void | Promise<void>;
  isLoading?: boolean;
  error?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

function DosenSignInForm({ onSubmit, isLoading = false, error }: DosenSignInFormProps) {
  const [values, setValues] = useState<DosenSignInFormValues>({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<DosenSignInFormValues>>({});

  function validate(): boolean {
    const next: Partial<DosenSignInFormValues> = {};
    if (!values.email.trim()) {
      next.email = "Email wajib diisi.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      next.email = "Format email tidak valid.";
    }
    if (!values.password) next.password = "Password wajib diisi.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleChange(field: keyof DosenSignInFormValues) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
      if (errors[field]) setErrors((err) => ({ ...err, [field]: undefined }));
    };
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <FormField
        label="Email"
        type="email"
        placeholder="dosen@example.com"
        autoComplete="email"
        value={values.email}
        onChange={handleChange("email")}
        error={errors.email}
        required
      />

      <PasswordField
        label="Password"
        placeholder="Masukkan password"
        autoComplete="current-password"
        value={values.password}
        onChange={handleChange("password")}
        error={errors.password}
        required
      />

      <div className="flex items-center gap-2 text-xs flex-wrap">
        <span className="text-gray-400">Pintasan uji coba:</span>
        <button
          type="button"
          onClick={() => setValues({ email: "kaprodi@siakad.ac.id", password: "password123" })}
          className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 font-medium transition cursor-pointer"
        >
          Isi Akun Kaprodi
        </button>
        <button
          type="button"
          onClick={() => setValues({ email: "dosen@siakad.ac.id", password: "password123" })}
          className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 font-medium transition cursor-pointer"
        >
          Isi Akun Dosen
        </button>
      </div>

      {error && (
        <p
          className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2"
          role="alert"
        >
          {error}
        </p>
      )}

      <Button type="submit" size="lg" fullWidth isLoading={isLoading}>
        Masuk
      </Button>
    </form>
  );
}

export default DosenSignInForm;
export type { DosenSignInFormProps, DosenSignInFormValues };
