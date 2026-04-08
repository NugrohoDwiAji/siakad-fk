import { useId } from "react";
import Label from "../atoms/Label";
import ErrorMessage from "../atoms/ErrorMessage";

interface RadioOption<T extends string = string> {
  value: T;
  label: string;
}

interface RadioGroupFieldProps<T extends string = string> {
  label: string;
  name: string;
  options: RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
  error?: string;
  required?: boolean;
}

function RadioGroupField<T extends string = string>({
  label,
  name,
  options,
  value,
  onChange,
  error,
  required,
}: RadioGroupFieldProps<T>) {
  const groupId = useId();
  const errorId = `${groupId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <Label required={required}>{label}</Label>
      <div
        role="radiogroup"
        aria-labelledby={groupId}
        aria-describedby={error ? errorId : undefined}
        className="flex flex-wrap gap-4 pt-1"
      >
        {options.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 select-none"
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value as T)}
              className="accent-brand-700 h-4 w-4"
            />
            {opt.label}
          </label>
        ))}
      </div>
      <ErrorMessage id={errorId} message={error} />
    </div>
  );
}

export default RadioGroupField;
export type { RadioGroupFieldProps, RadioOption };
