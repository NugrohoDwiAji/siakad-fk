import { useId } from "react";
import Label from "./Label";
import InputField from "./InputField";
import ErrorMessage from "./ErrorMessage";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

function FormField({
  label,
  error,
  required,
  id: propId,
  ...inputProps
}: FormFieldProps) {
  const generatedId = useId();
  const id = propId ?? generatedId;
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <InputField
        id={id}
        type="text"
        hasError={!!error}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={!!error || undefined}
        required={required}
        {...inputProps}
      />
      <ErrorMessage id={errorId} message={error} />
    </div>
  );
}

export default FormField;
export type { FormFieldProps };
