import { Link } from "react-router-dom";

export default function DashboardMedicalCurriculum() {
  const activeBlocks = [
    {
      angkatan: "Angkatan 2024",
      semester: "Semester 2",
      kodeBlok: "BLK-102",
      namaBlok: "Sistem Muskuloskeletal & Integumen",
      minggu: 4,
      totalMinggu: 6,
      koordinator: "dr. Budi Setiawan, Sp.OT",
      status: "Berjalan (Minggu 4/6)",
      statusColor: "bg-brand-50 text-brand-700 border-brand-200",
      pblGroups: "12 Kelompok",
    },
    {
      angkatan: "Angkatan 2023",
      semester: "Semester 4",
      kodeBlok: "BLK-202",
      namaBlok: "Sistem Kardiovaskular & Respirasi",
      minggu: 5,
      totalMinggu: 6,
      koordinator: "dr. Sarah Sp.JP(K)",
      status: "Minggu Menjelang Ujian",
      statusColor: "bg-brand-100/70 text-brand-800 border-brand-200",
      pblGroups: "11 Kelompok",
    },
    {
      angkatan: "Angkatan 2022",
      semester: "Semester 6",
      kodeBlok: "BLK-302",
      namaBlok: "Neuropsikiatri & Penginderaan",
      minggu: 3,
      totalMinggu: 6,
      koordinator: "dr. Hendra Sp.S, M.Kes",
      status: "Berjalan (Minggu 3/6)",
      statusColor: "bg-brand-50 text-brand-700 border-brand-200",
      pblGroups: "10 Kelompok",
    },
  ];

  const upcomingExams = [
    {
      id: 1,
      title: "Ujian OSCE Komprehensif Semester Genap",
      type: "OSCE",
      badgeColor: "bg-brand-100 text-brand-800 border border-brand-200",
      date: "Sabtu, 18 Okt 2026",
      time: "08:00 - 15:00 WIB",
      location: "Gedung Skills Lab FK (Station 1 - 14)",
      peserta: "115 Mahasiswa",
    },
    {
      id: 2,
      title: "Ujian CBT / MCQ Teori Blok 2.2",
      type: "CBT",
      badgeColor: "bg-brand-50 text-brand-700 border border-brand-200",
      date: "Selasa, 21 Okt 2026",
      time: "09:00 - 11:30 WIB",
      location: "Laboratorium Komputer CBT Center",
      peserta: "110 Mahasiswa",
    },
    {
      id: 3,
      title: "Sidang Pleno Skenario 3 Tutorial PBL",
      type: "PLENO",
      badgeColor: "bg-brand-100/80 text-brand-800 border border-brand-200",
      date: "Jumat, 17 Okt 2026",
      time: "13:30 - 16:00 WIB",
      location: "Auditorium Lantai 3 FK",
      peserta: "Semua Kelompok Angkatan 2024",
    },
  ];

  const gradingComponents = [
    { name: "Tutorial & Keaktifan PBL", progress: 92, status: "Hampir Lengkap", color: "bg-brand-600" },
    { name: "Praktikum Lab (Anatomi, PA, PK)", progress: 85, status: "Tepat Waktu", color: "bg-brand-500" },
    { name: "Ujian Keterampilan Klinis (OSCE/SOCA)", progress: 60, status: "Proses Input Dosen", color: "bg-brand-400" },
    { name: "Ujian Teori CBT / MCQ Akhir Blok", progress: 45, status: "Menunggu Jadwal", color: "bg-brand-300" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* ── Blok Aktif per Angkatan (2 Kolom di Desktop) ── */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-xs border border-gray-200/80 p-5 md:p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Kurikulum Blok Berjalan (PBL / KBK)</h2>
                <p className="text-xs text-gray-500">Modul blok yang sedang aktif berlangsung pada masing-masing angkatan.</p>
              </div>
            </div>
            <Link
              to="/admin/blok/master-data"
              className="text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors"
            >
              Kelola Blok &rarr;
            </Link>
          </div>

          <div className="space-y-3.5">
            {activeBlocks.map((blk, idx) => {
              const progressPct = Math.round((blk.minggu / blk.totalMinggu) * 100);
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-gray-200 p-4 hover:border-brand-200 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">{blk.kodeBlok}</span>
                        <span className="text-xs font-semibold text-gray-400">•</span>
                        <span className="text-xs font-semibold text-gray-700">{blk.angkatan} ({blk.semester})</span>
                      </div>
                      <h4 className="text-sm font-bold text-brand-900 mt-0.5">{blk.namaBlok}</h4>
                    </div>

                    <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full border font-semibold ${blk.statusColor}`}>
                      {blk.status}
                    </span>
                  </div>

                  {/* Progress Bar Minggu Blok */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                      <span>Progres Waktu: Minggu ke-{blk.minggu} dari {blk.totalMinggu} minggu</span>
                      <span className="font-semibold text-gray-700">{progressPct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-brand-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex flex-wrap items-center justify-between text-xs text-gray-500 gap-2">
                    <span>Koordinator: <strong className="text-gray-700">{blk.koordinator}</strong></span>
                    <span>Tutorial: <strong className="text-gray-700">{blk.pblGroups}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
          <span className="text-gray-500">Sistem Pembelajaran: <strong>Problem Based Learning (PBL)</strong></span>
          <Link to="/admin/blok/PenilaianBlok" className="font-semibold text-brand-600 hover:underline">
            Setup Penilaian Blok &rarr;
          </Link>
        </div>
      </div>

      {/* ── Agenda Evaluasi & Status Komponen Penilaian ── */}
      <div className="space-y-6">
        {/* Jadwal Ujian Terdekat */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200/80 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Jadwal Ujian & Evaluasi
            </h3>
            <span className="text-[11px] font-semibold text-gray-400">7 Hari ke Depan</span>
          </div>

          <div className="space-y-3">
            {upcomingExams.map((exam) => (
              <div
                key={exam.id}
                className="p-3 rounded-lg border border-gray-100 bg-gray-50/70 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${exam.badgeColor}`}>
                    {exam.type}
                  </span>
                  <span className="text-[11px] font-semibold text-gray-700">{exam.date}</span>
                </div>
                <h4 className="text-xs font-bold text-gray-900 leading-snug">{exam.title}</h4>
                <div className="mt-1.5 text-[11px] text-gray-500 flex flex-col gap-0.5">
                  <div>🕒 {exam.time}</div>
                  <div>📍 {exam.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progres Penilaian Komponen Blok */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200/80 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900">Kelengkapan Nilai Blok</h3>
            <span className="text-[11px] font-semibold text-brand-600">Semester Ini</span>
          </div>

          <div className="space-y-3">
            {gradingComponents.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-gray-700">{item.name}</span>
                  <span className="font-bold text-gray-900">{item.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`${item.color} h-1.5 rounded-full`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
