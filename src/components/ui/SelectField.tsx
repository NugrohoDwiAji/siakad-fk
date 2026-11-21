import { useId } from "react";
import Label from "./Label";
import SelectInput from "./SelectInput";
import ErrorMessage from "./ErrorMessage";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  required?: boolean;
}

function SelectField({
  label,
  options,
  placeholder,
  error,
  required,
  id: propId,
  ...selectProps
}: SelectFieldProps) {
  const generatedId = useId();
  const id = propId ?? generatedId;
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <SelectInput
        id={id}
        hasError={!!error}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={!!error || undefined}
        required={required}
        {...selectProps}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </SelectInput>
      <ErrorMessage id={errorId} message={error} />
    </div>
  );
}

export default SelectField;
export type { SelectFieldProps, SelectOption };
