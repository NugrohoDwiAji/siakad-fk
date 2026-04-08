import { forwardRef } from "react";

interface TextareaInputProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

const TextareaInput = forwardRef<HTMLTextAreaElement, TextareaInputProps>(
  ({ hasError = false, className = "", ...props }, ref) => {
    const baseClasses =
      "w-full px-3.5 py-2.5 text-sm text-gray-800 bg-white border rounded-md outline-none resize-none transition-colors duration-150 placeholder:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed";

    const stateClasses = hasError
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-gray-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-100";

    return (
      <textarea
        ref={ref}
        className={[baseClasses, stateClasses, className]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
    );
  }
);

TextareaInput.displayName = "TextareaInput";

export default TextareaInput;
export type { TextareaInputProps };
