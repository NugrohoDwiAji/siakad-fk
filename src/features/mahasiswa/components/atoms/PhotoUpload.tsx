import { useRef } from "react";

interface PhotoUploadProps {
  preview?: string;
  nama: string;
  onChange: (dataUrl: string) => void;
}

function CameraIcon() {
  return (
    <svg
      className="h-6 w-6 text-white"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx={12} cy={13} r={4} />
    </svg>
  );
}

function PhotoUpload({ preview, nama, onChange }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const initials = nama
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative h-28 w-28 rounded-xl border-4 border-brand-100 overflow-hidden bg-brand-100 group cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <img
            src={preview}
            alt="Foto profil"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-brand-700 font-bold text-3xl select-none">
            {initials}
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <CameraIcon />
        </div>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="text-xs text-brand-600 hover:text-brand-800 font-medium transition-colors focus-visible:outline-none"
      >
        Ganti Foto
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

export default PhotoUpload;
export type { PhotoUploadProps };
