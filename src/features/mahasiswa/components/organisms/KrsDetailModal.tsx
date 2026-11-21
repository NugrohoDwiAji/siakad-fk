import type { KrsEntry, MataKuliah } from "@/features/mahasiswa/types";
import KrsValidasi from "../moleculs/KrsValidasi";

interface KrsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: KrsEntry | null;
}

export default function KrsDetailModal({ isOpen, onClose, data }: KrsDetailModalProps) {
  if (!isOpen || !data) return null;

  // Mock mata kuliah jika data detail belum tersedia dari API
  const krsDataRecord = data as unknown as Record<string, unknown>;
  const mataKuliah = Array.isArray(krsDataRecord.mataKuliah)
    ? (krsDataRecord.mataKuliah as MataKuliah[])
    : [
        { code: "MK001", nama: "Biologi Sel dan Molekuler", sksTeori: 3, sksPraktek: 1 },
        { code: "MK002", nama: "Anatomi Dasar", sksTeori: 3, sksPraktek: 1 },
        { code: "MK003", nama: "Fisiologi Dasar", sksTeori: 2, sksPraktek: 1 },
        { code: "MK004", nama: "Pendidikan Agama", sksTeori: 2, sksPraktek: 0 },
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-50 to-transparent opacity-50 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Detail KRS Semester {data.semester}</h2>
            <p className="text-sm text-brand-600 font-semibold mt-0.5">Tahun Ajaran {data.tahunAjaran}</p>
          </div>
          <button
            onClick={onClose}
            className="relative z-10 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4 bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1.5">Mahasiswa</p>
              <p className="text-base font-bold text-gray-900 leading-tight">{data.nama}</p>
              <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded self-start inline-block mt-1.5">{data.nim}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1.5">Total Beban Studi</p>
              <p className="text-2xl font-black text-brand-700 leading-none">{data.totalSks} <span className="text-sm font-bold text-gray-400 tracking-wider">SKS</span></p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              DAFTAR MATA KULIAH
            </h3>
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/80 text-gray-600 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5 font-bold">Kode</th>
                    <th className="px-5 py-3.5 font-bold">Mata Kuliah</th>
                    <th className="px-5 py-3.5 font-bold text-center">Teori</th>
                    <th className="px-5 py-3.5 font-bold text-center">Praktek</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {mataKuliah.map((mk: MataKuliah, i: number) => (
                    <tr key={i} className="hover:bg-brand-50/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{mk.code}</td>
                      <td className="px-5 py-3.5 font-semibold text-gray-800">{mk.nama}</td>
                      <td className="px-5 py-3.5 text-center font-medium text-gray-600">{mk.sksTeori}</td>
                      <td className="px-5 py-3.5 text-center font-medium text-gray-600">{mk.sksPraktek}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              STATUS VALIDASI
            </h3>
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 inline-block shadow-sm">
              <KrsValidasi dosenWali={data.validasi.dosenWali} keuangan={data.validasi.keuangan} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-100 hover:text-gray-900 transition-all shadow-sm"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
