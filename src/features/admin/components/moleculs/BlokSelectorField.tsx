import SelectInput from "../../../../components/atoms/SelectInput";
import type { Blok } from "../../types/penilaianBlok";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface BlokSelectorFieldProps {
  blokList: Blok[];
  selectedId: string;
  onChange: (id: string) => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function BlokSelectorField({ blokList, selectedId, onChange }: BlokSelectorFieldProps) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
      <label
        htmlFor="blok-select"
        className="text-sm font-semibold text-gray-700 whitespace-nowrap"
      >
        Pilih Blok
      </label>
      <div className="flex-1 max-w-sm">
        <SelectInput
          id="blok-select"
          value={selectedId}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">-- Pilih Blok --</option>
          {blokList.map((blok) => (
            <option key={blok.id} value={blok.id}>
              {blok.kode} — {blok.nama} (Sem. {blok.semester} / {blok.tahunAjaran})
            </option>
          ))}
        </SelectInput>
      </div>
    </div>
  );
}
