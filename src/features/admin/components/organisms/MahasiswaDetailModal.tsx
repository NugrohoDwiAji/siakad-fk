import type { MahasiswaDetail } from "@/features/admin/types";

interface MahasiswaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: MahasiswaDetail | null;
  loading: boolean;
}

const LABEL_GENDER: Record<string, string> = { L: "Laki-laki", P: "Perempuan" };

const LABEL_STATUS: Record<string, string> = {
  A: "Aktif",
  C: "Cuti",
  L: "Lulus",
  K: "Keluar",
};

const STATUS_COLOR: Record<string, string> = {
  A: "bg-green-100 text-green-700 border border-green-200",
  C: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  L: "bg-blue-100 text-blue-700 border border-blue-200",
  K: "bg-red-100 text-red-700 border border-red-200",
};

function formatDate(iso: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}

function Row({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{label}</span>
      <span className="text-sm text-gray-800 font-medium">{value || "-"}</span>
    </div>
  );
}

export default function MahasiswaDetailModal({ isOpen, onClose, data, loading }: MahasiswaDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent opacity-50 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Detail Mahasiswa</h2>
            <p className="text-sm text-blue-600 font-semibold mt-0.5">
              {data ? `${data.nama_mahasiswa} — ${data.nim}` : "Memuat data..."}
            </p>
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
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          )}

          {!loading && !data && (
            <div className="text-center py-12 text-gray-400 text-sm">Data tidak ditemukan.</div>
          )}

          {!loading && data && (
            <>
              {/* ── Foto + Identitas ── */}
              <div className="flex gap-5 items-start bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <div className="h-20 w-20 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center text-2xl font-bold text-blue-600 shrink-0 overflow-hidden">
                  {data.foto ? (
                    <img src={data.foto} alt={data.nama_mahasiswa} className="h-full w-full object-cover" />
                  ) : (
                    data.nama_mahasiswa.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-gray-900 leading-tight">{data.nama_mahasiswa}</p>
                  <p className="text-sm text-gray-500 font-mono mt-1">{data.nim}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[data.status] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}>
                      {LABEL_STATUS[data.status] ?? data.status}
                    </span>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                      {data.nama_program_studi}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Data Pribadi ── */}
              <Section title="Data Pribadi">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <Row label="NIK" value={data.nik} />
                  <Row label="NPM" value={data.npm} />
                  <Row label="NISN" value={data.nisn} />
                  <Row label="No. Pendaftaran" value={data.nomor_pendaftaran} />
                  <Row label="No. Pendaftaran Ulang" value={data.nomor_pendaftaran_ulang} />
                  <Row label="Jenis Kelamin" value={LABEL_GENDER[data.jenis_kelamin] ?? data.jenis_kelamin} />
                  <Row label="Agama" value={data.agama} />
                  <Row label="Golongan Darah" value={data.golongan_darah} />
                  <Row label="Kewarganegaraan" value={data.kewarganegaraan} />
                  <Row label="Tempat Lahir" value={data.tempat_lahir} />
                  <Row label="Tanggal Lahir" value={formatDate(data.tanggal_lahir)} />
                  <Row label="Telepon" value={data.telepon} />
                  <Row label="Email" value={data.email} />
                  <Row label="Nama Instansi" value={data.nama_instansi} />
                </div>
              </Section>

              {/* ── Alamat ── */}
              <Section title="Alamat">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="col-span-2 sm:col-span-3">
                    <Row label="Alamat" value={data.alamat} />
                  </div>
                  <Row label="Kota" value={data.kota} />
                  <Row label="Provinsi" value={data.propinsi} />
                </div>
              </Section>

              {/* ── Data Orang Tua ── */}
              <Section title="Data Orang Tua">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <Row label="Nama Ayah" value={data.nama_ayah} />
                  <Row label="Agama Ayah" value={data.agama_ayah} />
                  <Row label="Pekerjaan Ayah" value={data.pekerjaan_ayah} />
                  <Row label="Nama Ibu" value={data.nama_ibu} />
                  <Row label="Agama Ibu" value={data.agama_ibu} />
                  <Row label="Pekerjaan Ibu" value={data.pekerjaan_ibu} />
                  <div className="col-span-2 sm:col-span-3">
                    <Row label="Alamat Orang Tua" value={data.alamat_orangtua} />
                  </div>
                  <Row label="Kota Orang Tua" value={data.kota_orangtua} />
                  <Row label="Provinsi Orang Tua" value={data.propinsi_orangtua} />
                  <Row label="Telepon Orang Tua" value={data.telepon_orangtua} />
                </div>
              </Section>

              {/* ── Info Tambahan ── */}
              <Section title="Info Tambahan">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <Row label="Status Pendaftaran" value={data.status_pendaftaran} />
                  <Row label="TA Lulus" value={data.ta_lulus} />
                  <Row label="Dibuat" value={formatDate(data.created_at)} />
                  <Row label="Diperbarui" value={formatDate(data.updated_at)} />
                </div>
              </Section>
            </>
          )}
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {title}
      </h3>
      <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 shadow-sm">
        {children}
      </div>
    </div>
  );
}
