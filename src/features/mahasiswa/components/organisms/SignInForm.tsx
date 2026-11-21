import { useState } from "react";
import FormField from "@/components/ui/FormField";
import PasswordField from "@/components/ui/PasswordField";
import Button from "@/components/ui/Button";
import type { SignInFormProps, SignInFormValues } from "@/features/auth/types";

function SignInForm({ onSubmit, isLoading = false, error }: SignInFormProps) {
  const [values, setValues] = useState<SignInFormValues>({
    nim: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<SignInFormValues>>({});

  function validate(): boolean {
    const next: Partial<SignInFormValues> = {};
    if (!values.nim.trim()) next.nim = "NIM wajib diisi.";
    if (!values.password) next.password = "Password wajib diisi.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleChange(field: keyof SignInFormValues) {
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
        label="NIM"
        placeholder="Masukkan NIM Anda"
        autoComplete="username"
        value={values.nim}
        onChange={handleChange("nim")}
        error={errors.nim}
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

export default SignInForm;
export type { SignInFormProps, SignInFormValues };
