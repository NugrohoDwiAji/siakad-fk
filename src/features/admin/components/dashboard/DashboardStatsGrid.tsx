import { Link } from "react-router-dom";

export interface DashboardStats {
  totalMahasiswa: number;
  totalDosen: number;
  totalMataKuliah: number;
  totalKelas: number;
  totalProdi: number;
  mahasiswaAktif: number;
  mahasiswaCuti: number;
  dosenAktif: number;
}

interface DashboardStatsGridProps {
  stats: DashboardStats;
  loading: boolean;
}

export default function DashboardStatsGrid({ stats, loading }: DashboardStatsGridProps) {
  const cards = [
    {
      title: "Total Mahasiswa",
      value: stats.totalMahasiswa.toLocaleString("id-ID"),
      subtitle: `${stats.mahasiswaAktif.toLocaleString("id-ID")} Aktif • ${stats.mahasiswaCuti} Cuti`,
      link: "/admin/data-mahasiswa",
      badgeText: "Semua Angkatan",
      badgeColor: "bg-brand-50 text-brand-700 border-brand-200",
      iconBg: "bg-brand-600",
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      title: "Total Dosen Pengajar",
      value: stats.totalDosen.toLocaleString("id-ID"),
      subtitle: `${stats.dosenAktif.toLocaleString("id-ID")} Dosen Aktif & Tutor`,
      link: "/admin/data-dosen",
      badgeText: "Homebase FK",
      badgeColor: "bg-brand-50 text-brand-700 border-brand-200",
      iconBg: "bg-brand-600",
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      title: "Mata Kuliah & Blok FK",
      value: stats.totalMataKuliah.toLocaleString("id-ID"),
      subtitle: "Kurikulum Blok & Elektif",
      link: "/admin/matakuliah",
      badgeText: "KBK / PBL",
      badgeColor: "bg-brand-50 text-brand-700 border-brand-200",
      iconBg: "bg-brand-600",
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      title: "Kelas & Kelompok Tutorial",
      value: stats.totalKelas.toLocaleString("id-ID"),
      subtitle: "Pleno, Tutorial, & Praktikum",
      link: "/admin/kelas",
      badgeText: "Semester Ini",
      badgeColor: "bg-brand-50 text-brand-700 border-brand-200",
      iconBg: "bg-brand-600",
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-6">
      {cards.map((card, idx) => (
        <Link
          key={idx}
          to={card.link}
          className="group relative bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs hover:shadow-md hover:border-brand-300 transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${card.badgeColor}`}>
                {card.badgeText}
              </span>
              <div className={`h-10 w-10 rounded-lg ${card.iconBg} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                {card.icon}
              </div>
            </div>

            <h3 className="text-xs font-semibold text-gray-500 tracking-wider uppercase">
              {card.title}
            </h3>

            {loading ? (
              <div className="h-8 w-24 bg-gray-200 animate-pulse rounded my-1.5" />
            ) : (
              <p className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-1">
                {card.value}
              </p>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span className="truncate">{card.subtitle}</span>
            <span className="text-brand-600 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center">
              Detail &rarr;
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
