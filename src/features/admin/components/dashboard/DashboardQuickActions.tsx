import { Link } from "react-router-dom";

export default function DashboardQuickActions() {
  const actions = [
    {
      title: "Tambah Mahasiswa",
      desc: "Input data mahasiswa baru",
      link: "/admin/data-mahasiswa",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
    },
    {
      title: "Tambah Dosen",
      desc: "Registrasi dosen & tutor baru",
      link: "/admin/data-dosen",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      title: "Periode & Kalender",
      desc: "Buka/tutup periode semester & KRS",
      link: "/admin/tahun-akademik",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "Aturan & Cek KRS",
      desc: "Pengaturan batas SKS & status KRS",
      link: "/admin/krs",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: "Rekap Nilai KHS",
      desc: "Pencarian KHS & transkrip nilai",
      link: "/admin/khs",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      title: "Setup Penilaian Blok",
      desc: "Atur bobot OSCE, CBT & Tutorial",
      link: "/admin/blok/PenilaianBlok",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      title: "Kelola Kelas & Ruang",
      desc: "Penempatan kelompok & jadwal",
      link: "/admin/kelas",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm5 16h8m-4-4v4" />
        </svg>
      ),
    },
    {
      title: "Distribusi Perwalian",
      desc: "Alokasi mahasiswa ke Dosen PA",
      link: "/admin/perwalian",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zm10 0v6m-3-3h6" />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-200/80 p-5 md:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Pintasan Aksi Cepat (Quick Actions)</h2>
          <p className="text-xs text-gray-500">Akses langsung ke menu-menu operasional yang paling sering digunakan.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {actions.map((act, idx) => (
          <Link
            key={idx}
            to={act.link}
            className="p-3.5 rounded-xl border border-brand-200/80 bg-brand-50/60 hover:bg-brand-100/70 hover:border-brand-300 transition-all duration-150 flex items-start gap-3 group cursor-pointer"
          >
            <div className="shrink-0 p-2 rounded-lg bg-white text-brand-600 shadow-2xs group-hover:bg-brand-600 group-hover:text-white transition-all duration-150 group-hover:scale-105">
              {act.icon}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-gray-900 group-hover:text-brand-800 transition-colors truncate">
                {act.title}
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                {act.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
