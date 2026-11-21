import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { inputNilaiMahasiswa } from "@/features/dosen/api/penilaian";
import Button from "@/components/ui/Button";
import type {
  DosenPenilaianMahasiswaItem,
  PenilaianLeafNode,
  DosenInputNilaiPayload,
} from "@/features/dosen/types";

interface DosenBulkInputNilaiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  codeKelas: string;
  namaKelas?: string;
  namaMatakuliah?: string;
  mahasiswaList: DosenPenilaianMahasiswaItem[];
  leafNodes: PenilaianLeafNode[];
}

export default function DosenBulkInputNilaiModal({
  isOpen,
  onClose,
  onSuccess,
  codeKelas,
  namaKelas,
  namaMatakuliah,
  mahasiswaList,
  leafNodes,
}: DosenBulkInputNilaiModalProps) {
  // Matrix of scores: studentCode -> { leafKey: scoreString }
  const [scoresMatrix, setScoresMatrix] = useState<
    Record<string, Record<string, string>>
  >({});
  // Optional catatan per student: studentCode -> catatanString
  const [catatanMap, setCatatanMap] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Excel Import / Export States
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);
  const [importWarnings, setImportWarnings] = useState<string[]>([]);
  const [showWarnings, setShowWarnings] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize matrix with pre-existing or empty values
  useEffect(() => {
    if (!isOpen) return;

    const initialMatrix: Record<string, Record<string, string>> = {};
    const initialNotes: Record<string, string> = {};

    for (const mhs of mahasiswaList) {
      initialMatrix[mhs.code_mahasiswa] = {};
      for (const leaf of leafNodes) {
        initialMatrix[mhs.code_mahasiswa][leaf.key] = "";
      }
      initialNotes[mhs.code_mahasiswa] = mhs.catatan_dosen || "";
    }

    setScoresMatrix(initialMatrix);
    setCatatanMap(initialNotes);
    setError(null);
    setImportSuccessMessage(null);
    setImportWarnings([]);
    setShowWarnings(false);
  }, [isOpen, mahasiswaList, leafNodes]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !submitting) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  function handleScoreChange(
    codeMahasiswa: string,
    leafKey: string,
    value: string
  ) {
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) {
      return;
    }
    const num = Number(value);
    if (value !== "" && !isNaN(num) && (num < 0 || num > 100)) {
      return;
    }

    setScoresMatrix((prev) => ({
      ...prev,
      [codeMahasiswa]: {
        ...(prev[codeMahasiswa] || {}),
        [leafKey]: value,
      },
    }));
  }

  function handleCatatanChange(codeMahasiswa: string, value: string) {
    setCatatanMap((prev) => ({
      ...prev,
      [codeMahasiswa]: value,
    }));
  }

  const filteredMahasiswa = mahasiswaList.filter((mhs) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      mhs.nama_mahasiswa.toLowerCase().includes(q) ||
      mhs.nim.toLowerCase().includes(q)
    );
  });

  // ─── Fitur Download Template Excel ───
  function handleDownloadTemplate() {
    try {
      const wb = XLSX.utils.book_new();

      // Baris Header: No, NIM, Nama Mahasiswa, [Komponen...], Catatan
      const headers = [
        "No",
        "NIM",
        "Nama Mahasiswa",
        ...leafNodes.map((leaf) => `${leaf.name} [${leaf.key}]`),
        "Catatan",
      ];

      // Baris Data: Isi otomatis daftar mahasiswa kelas saat ini
      const dataRows = mahasiswaList.map((mhs, idx) => {
        const studentScores = scoresMatrix[mhs.code_mahasiswa] || {};
        const row: (string | number)[] = [
          idx + 1,
          String(mhs.nim || ""),
          mhs.nama_mahasiswa || "",
          ...leafNodes.map((leaf) => {
            const val = studentScores[leaf.key];
            if (val !== undefined && val !== null && val !== "") {
              const num = Number(val);
              return !isNaN(num) ? num : val;
            }
            return "";
          }),
          catatanMap[mhs.code_mahasiswa] || "",
        ];
        return row;
      });

      const wsData = [headers, ...dataRows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Pastikan format cell NIM sebagai Text agar leading zero tidak hilang
      for (let r = 1; r <= mahasiswaList.length; r++) {
        const nimAddress = XLSX.utils.encode_cell({ r, c: 1 });
        if (ws[nimAddress]) {
          ws[nimAddress].t = "s";
        }
      }

      // Atur lebar kolom yang proporsional
      ws["!cols"] = [
        { wch: 6 },  // No
        { wch: 18 }, // NIM
        { wch: 32 }, // Nama Mahasiswa
        ...leafNodes.map(() => ({ wch: 22 })), // Kolom Nilai Komponen
        { wch: 28 }, // Catatan
      ];

      XLSX.utils.book_append_sheet(wb, ws, "Template Nilai");

      // Sanitasi nama file
      const safeKelas = (namaKelas || "Kelas").replace(/[^a-zA-Z0-9_-]/g, "_");
      const safeMk = (namaMatakuliah || "Matakuliah").replace(/[^a-zA-Z0-9_-]/g, "_");
      const filename = `Template_Nilai_${safeKelas}_${safeMk}.xlsx`;

      XLSX.writeFile(wb, filename);
    } catch {
      setError("Gagal membuat dan mengunduh template Excel. Silakan coba lagi.");
    }
  }

  // ─── Fitur Upload & Parse File Excel ───
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setImportSuccessMessage(null);
    setImportWarnings([]);
    setShowWarnings(false);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const wb = XLSX.read(new Uint8Array(buffer), { type: "array" });

        if (!wb.SheetNames || wb.SheetNames.length === 0) {
          setError("File Excel tidak memiliki sheet yang valid.");
          return;
        }

        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawRows: unknown[][] = XLSX.utils.sheet_to_json(ws, {
          header: 1,
          defval: "",
        });

        if (rawRows.length < 2) {
          setError("File Excel kosong atau tidak memiliki baris data.");
          return;
        }

        // Cari baris header (mengecek baris yang mengandung 'nim')
        let headerRowIndex = 0;
        for (let i = 0; i < Math.min(rawRows.length, 5); i++) {
          const rowStr = rawRows[i].map((c) => String(c || "").toLowerCase().trim());
          if (rowStr.some((c) => c === "nim" || c.includes("nim"))) {
            headerRowIndex = i;
            break;
          }
        }

        const headerRow = rawRows[headerRowIndex].map((c) => String(c || "").trim());

        // Mapping index kolom NIM, Nama, Catatan, dan masing-masing leaf node
        let nimColIdx = -1;
        let namaColIdx = -1;
        let catatanColIdx = -1;
        const leafColMap: Record<string, number> = {};

        headerRow.forEach((colName, colIdx) => {
          const lower = colName.toLowerCase();
          if (nimColIdx === -1 && lower.includes("nim")) {
            nimColIdx = colIdx;
          } else if (namaColIdx === -1 && lower.includes("nama")) {
            namaColIdx = colIdx;
          } else if (catatanColIdx === -1 && (lower.includes("catatan") || lower.includes("note"))) {
            catatanColIdx = colIdx;
          }

          // Pencocokan kolom leaf node
          leafNodes.forEach((leaf) => {
            const keyTag = `[${leaf.key.toLowerCase()}]`;
            if (lower.includes(keyTag)) {
              leafColMap[leaf.key] = colIdx;
            } else if (leafColMap[leaf.key] === undefined) {
              if (
                lower.includes(leaf.key.toLowerCase()) ||
                lower.includes(leaf.name.toLowerCase())
              ) {
                leafColMap[leaf.key] = colIdx;
              }
            }
          });
        });

        if (nimColIdx === -1 && namaColIdx === -1) {
          setError(
            "Kolom 'NIM' atau 'Nama Mahasiswa' tidak ditemukan pada file Excel. Pastikan header sesuai dengan template."
          );
          return;
        }

        const newScores: Record<string, Record<string, string>> = {};
        const newCatatan: Record<string, string> = { ...catatanMap };

        // Salin nilai awal agar baris yang tidak diubah tetap utuh
        for (const mhs of mahasiswaList) {
          newScores[mhs.code_mahasiswa] = { ...(scoresMatrix[mhs.code_mahasiswa] || {}) };
        }

        let matchedCount = 0;
        let updatedScoresCount = 0;
        const warnings: string[] = [];

        for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
          const row = rawRows[r];
          if (!row || row.length === 0) continue;

          const rowNim = nimColIdx >= 0 ? String(row[nimColIdx] || "").trim() : "";
          const rowNama = namaColIdx >= 0 ? String(row[namaColIdx] || "").trim() : "";

          if (!rowNim && !rowNama) continue;

          // Cari mahasiswa berdasarkan NIM atau Nama
          const mhs = mahasiswaList.find((m) => {
            if (rowNim && m.nim.trim().toLowerCase() === rowNim.toLowerCase()) {
              return true;
            }
            if (rowNama && m.nama_mahasiswa.trim().toLowerCase() === rowNama.toLowerCase()) {
              return true;
            }
            return false;
          });

          if (!mhs) {
            if (rowNim || rowNama) {
              warnings.push(`Baris ke-${r + 1}: Mahasiswa "${rowNim || rowNama}" tidak terdaftar di kelas ini.`);
            }
            continue;
          }

          matchedCount++;

          // Ambil nilai setiap komponen
          leafNodes.forEach((leaf) => {
            const colIdx = leafColMap[leaf.key];
            if (colIdx !== undefined && colIdx >= 0 && colIdx < row.length) {
              const rawVal = row[colIdx];
              if (rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== "") {
                const normalizedStr = String(rawVal).replace(",", ".").trim();
                const num = Number(normalizedStr);
                if (!isNaN(num) && num >= 0 && num <= 100) {
                  newScores[mhs.code_mahasiswa][leaf.key] = String(num);
                  updatedScoresCount++;
                } else {
                  warnings.push(
                    `NIM ${mhs.nim}: Nilai untuk "${leaf.name}" tidak valid (${rawVal}). Harus angka 0-100.`
                  );
                }
              }
            }
          });

          // Ambil catatan jika ada
          if (catatanColIdx >= 0 && catatanColIdx < row.length) {
            const noteVal = String(row[catatanColIdx] || "").trim();
            if (noteVal) {
              newCatatan[mhs.code_mahasiswa] = noteVal;
            }
          }
        }

        setScoresMatrix(newScores);
        setCatatanMap(newCatatan);

        if (matchedCount === 0) {
          setError(
            "Tidak ada data mahasiswa pada file Excel yang cocok dengan daftar mahasiswa kelas ini."
          );
        } else {
          setImportSuccessMessage(
            `Berhasil mengimpor nilai dari file "${file.name}" untuk ${matchedCount} mahasiswa (${updatedScoresCount} entri nilai komponen berhasil diisi).`
          );
          if (warnings.length > 0) {
            setImportWarnings(warnings);
          }
        }
      } catch {
        setError("Gagal memproses file Excel. Pastikan file tidak rusak dan format kolom sesuai template.");
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };

    reader.readAsArrayBuffer(file);
  }

  // Calculate how many students have at least one score entered
  const filledCount = mahasiswaList.filter((mhs) => {
    const studentScores = scoresMatrix[mhs.code_mahasiswa] || {};
    return Object.values(studentScores).some((v) => v !== "" && !isNaN(Number(v)));
  }).length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Build payload for all students who have at least one score
    const mahasiswaPayload = [];

    for (const mhs of mahasiswaList) {
      const studentScores = scoresMatrix[mhs.code_mahasiswa] || {};
      const scoresArray = leafNodes
        .filter((leaf) => studentScores[leaf.key] !== undefined && studentScores[leaf.key].trim() !== "")
        .map((leaf) => {
          const raw = studentScores[leaf.key].trim().replace(",", ".");
          const num = Number(raw);
          const scoreStr = !isNaN(num)
            ? Number.isInteger(num)
              ? num.toFixed(1)
              : String(num)
            : raw;
          return {
            node_key: leaf.key,
            score: scoreStr,
          };
        });

      if (scoresArray.length > 0) {
        // Validate score numbers
        for (const s of scoresArray) {
          const num = Number(s.score);
          if (isNaN(num) || num < 0 || num > 100) {
            setError(`Nilai untuk NIM ${mhs.nim} komponen "${s.node_key}" harus antara 0 dan 100.`);
            return;
          }
        }

        const resolvedCode =
          mhs.code_mahasiswa ||
          (mhs as any).code ||
          (mhs as any).mahasiswa_code ||
          mhs.nim ||
          "";

        mahasiswaPayload.push({
          code_mahasiswa: resolvedCode,
          scores: scoresArray,
          catatan: (catatanMap[resolvedCode] || catatanMap[mhs.code_mahasiswa])?.trim() || null,
        });
      }
    }

    if (mahasiswaPayload.length === 0) {
      setError("Silakan isi nilai untuk setidaknya satu mahasiswa.");
      return;
    }

    const payload: DosenInputNilaiPayload = {
      code_kelas: codeKelas,
      mahasiswa: mahasiswaPayload,
    };

    setSubmitting(true);
    try {
      const res = await inputNilaiMahasiswa(payload);
      if (!res.status) {
        setError(res.message);
      } else {
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan atau server saat menyimpan nilai massal.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-gray-900/60 backdrop-blur-xs transition-opacity"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[95vh] transition-all">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Input Nilai Massal (Bulk Grading)
              </h2>
              <p className="text-xs text-gray-500">
                {namaMatakuliah || "Mata Kuliah"} {namaKelas ? `• ${namaKelas}` : ""} (
                Total {mahasiswaList.length} Mahasiswa)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Action bar / Search & Excel Import/Export */}
        <div className="px-6 py-3 bg-gray-50/70 border-b border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 flex-1 flex-wrap sm:flex-nowrap">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Cari mahasiswa atau NIM..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs text-gray-800 bg-white border border-gray-200 rounded-lg outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-100 transition"
              />
              <svg
                className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400 pointer-events-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            {/* Hidden Excel File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Tombol Download Template Excel */}
            <button
              type="button"
              onClick={handleDownloadTemplate}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition shadow-2xs whitespace-nowrap"
              title="Unduh format template Excel untuk pengisian nilai massal"
            >
              <svg
                className="h-3.5 w-3.5 text-emerald-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download Template Excel</span>
            </button>

            {/* Tombol Upload Excel */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-brand-700 bg-white hover:bg-brand-50 border border-brand-200 transition shadow-2xs whitespace-nowrap"
              title="Unggah file Excel yang telah diisi nilai mahasiswa"
            >
              <svg
                className="h-3.5 w-3.5 text-brand-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>Upload Excel</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs shrink-0 justify-end">
            <span className="text-gray-500 font-medium">Mahasiswa Terisi:</span>
            <span className="font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-100">
              {filledCount} / {mahasiswaList.length}
            </span>
          </div>
        </div>

        {/* Import Success Banner */}
        {importSuccessMessage && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start justify-between gap-2 shrink-0 animate-fadeIn">
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-emerald-600 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span className="font-medium">{importSuccessMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setImportSuccessMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs"
              title="Tutup pesan"
            >
              ✕
            </button>
          </div>
        )}

        {/* Import Warnings Banner */}
        {importWarnings.length > 0 && (
          <div className="mx-6 mt-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold">
                <svg
                  className="h-4 w-4 text-amber-600 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{importWarnings.length} catatan saat membaca file Excel</span>
              </div>
              <button
                type="button"
                onClick={() => setShowWarnings(!showWarnings)}
                className="text-amber-800 underline font-medium hover:text-amber-950"
              >
                {showWarnings ? "Sembunyikan Detail" : "Lihat Detail"}
              </button>
            </div>
            {showWarnings && (
              <ul className="mt-2 list-disc list-inside space-y-0.5 text-[11px] text-amber-900 max-h-32 overflow-y-auto">
                {importWarnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mx-6 mt-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 shrink-0">
            {error}
          </div>
        )}

        {/* Grid Table */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-auto flex-1 p-6">
            <table className="min-w-full text-xs divide-y divide-gray-200">
              <thead className="bg-gray-50/90 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-3 font-semibold text-gray-600 text-center w-10">
                    No
                  </th>
                  <th className="px-3 py-3 font-semibold text-gray-600 text-left min-w-[180px]">
                    Mahasiswa
                  </th>
                  {leafNodes.map((leaf) => (
                    <th
                      key={leaf.key}
                      className="px-3 py-3 font-semibold text-gray-700 text-center min-w-[110px]"
                    >
                      <div className="flex flex-col items-center">
                        <span className="truncate max-w-[110px]">{leaf.name}</span>
                        <span className="text-[10px] text-brand-700 bg-brand-50 font-bold px-1.5 py-0.2 rounded mt-0.5">
                          {leaf.weight}%
                        </span>
                      </div>
                    </th>
                  ))}
                  <th className="px-3 py-3 font-semibold text-gray-600 text-left min-w-[160px]">
                    Catatan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredMahasiswa.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3 + leafNodes.length}
                      className="px-4 py-8 text-center text-gray-400"
                    >
                      Tidak ada data mahasiswa yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredMahasiswa.map((mhs, idx) => {
                    const studentScores = scoresMatrix[mhs.code_mahasiswa] || {};
                    return (
                      <tr
                        key={mhs.code_mahasiswa}
                        className="hover:bg-gray-50/70 transition-colors"
                      >
                        <td className="px-3 py-2.5 text-center text-gray-400">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-semibold text-gray-900 truncate max-w-[200px]">
                            {mhs.nama_mahasiswa}
                          </div>
                          <div className="font-mono text-[11px] text-brand-700">
                            {mhs.nim}
                          </div>
                        </td>
                        {leafNodes.map((leaf) => (
                          <td key={leaf.key} className="px-2 py-2 text-center">
                            <input
                              type="text"
                              inputMode="decimal"
                              placeholder="0.00"
                              value={studentScores[leaf.key] || ""}
                              onChange={(e) =>
                                handleScoreChange(
                                  mhs.code_mahasiswa,
                                  leaf.key,
                                  e.target.value
                                )
                              }
                              disabled={submitting}
                              className="w-20 text-center font-mono font-bold text-xs px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-brand-600 focus:bg-white focus:ring-1 focus:ring-brand-100 transition"
                            />
                          </td>
                        ))}
                        <td className="px-2 py-2">
                          <input
                            type="text"
                            placeholder="Catatan..."
                            value={catatanMap[mhs.code_mahasiswa] || ""}
                            onChange={(e) =>
                              handleCatatanChange(
                                mhs.code_mahasiswa,
                                e.target.value
                              )
                            }
                            disabled={submitting}
                            className="w-full text-xs px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-brand-600 focus:bg-white focus:ring-1 focus:ring-brand-100 transition placeholder:text-gray-400"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
            <span className="text-xs text-gray-500">
              {filledCount > 0
                ? `${filledCount} mahasiswa akan disimpan nilainya.`
                : "Belum ada nilai yang diinput."}
            </span>
            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={submitting}
                disabled={filledCount === 0}
              >
                Simpan Nilai Massal ({filledCount})
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
