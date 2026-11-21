import { useId } from "react";
import Label from "./Label";
import TextareaInput from "./TextareaInput";
import ErrorMessage from "./ErrorMessage";

interface TextareaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  required?: boolean;
}

function TextareaField({
  label,
  error,
  required,
  id: propId,
  ...textareaProps
}: TextareaFieldProps) {
  const generatedId = useId();
  const id = propId ?? generatedId;
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <TextareaInput
        id={id}
        hasError={!!error}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={!!error || undefined}
        required={required}
        {...textareaProps}
      />
      <ErrorMessage id={errorId} message={error} />
    </div>
  );
}

export default TextareaField;
export type { TextareaFieldProps };
