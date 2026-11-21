interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

function Label({ children, required = false, className = "", ...props }: LabelProps) {
  return (
    <label
      className={["block text-sm font-medium text-gray-700", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
      {required && <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>}
    </label>
  );
}

export default Label;
export type { LabelProps };
