interface ErrorMessageProps {
  message?: string;
  id?: string;
}

function ErrorMessage({ message, id }: ErrorMessageProps) {
  if (!message) return null;
  return (
    <p id={id} className="text-xs text-red-500 mt-0.5" role="alert">
      {message}
    </p>
  );
}

export default ErrorMessage;
export type { ErrorMessageProps };
