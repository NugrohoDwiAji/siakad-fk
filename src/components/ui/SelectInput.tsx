import { forwardRef } from "react";

interface SelectInputProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  ({ hasError = false, className = "", children, ...props }, ref) => {
    const baseClasses =
      "w-full px-3.5 py-2.5 text-sm text-gray-800 bg-white border rounded-md outline-none transition-colors duration-150 disabled:bg-gray-50 disabled:cursor-not-allowed";

    const stateClasses = hasError
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-gray-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-100";

    return (
      <select
        ref={ref}
        className={[baseClasses, stateClasses, className]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </select>
    );
  }
);

SelectInput.displayName = "SelectInput";

export default SelectInput;
export type { SelectInputProps };
