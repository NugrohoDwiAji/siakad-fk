import { useState } from "react";
import FormField from "@/components/ui/FormField";
import PasswordField from "@/components/ui/PasswordField";
import Button from "@/components/ui/Button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminSignInFormValues {
  email: string;
  password: string;
}

interface AdminSignInFormProps {
  onSubmit: (values: AdminSignInFormValues) => void | Promise<void>;
  isLoading?: boolean;
  error?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

function AdminSignInForm({ onSubmit, isLoading = false, error }: AdminSignInFormProps) {
  const [values, setValues] = useState<AdminSignInFormValues>({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<AdminSignInFormValues>>({});

  function validate(): boolean {
    const next: Partial<AdminSignInFormValues> = {};
    if (!values.email.trim()) {
      next.email = "Email wajib diisi.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      next.email = "Format email tidak valid.";
    }
    if (!values.password) next.password = "Password wajib diisi.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleChange(field: keyof AdminSignInFormValues) {
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
        placeholder="admin@example.com"
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

export default AdminSignInForm;
export type { AdminSignInFormProps, AdminSignInFormValues };
