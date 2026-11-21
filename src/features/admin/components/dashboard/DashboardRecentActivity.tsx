
export default function DashboardRecentActivity() {
  const activities = [
    {
      id: 1,
      type: "krs",
      user: "dr. Budi Santoso, Sp.PD",
      role: "Dosen PA",
      action: "menyetujui KRS",
      target: "5 Mahasiswa Angkatan 2024",
      time: "15 menit lalu",
      iconBg: "bg-brand-50 text-brand-700 border border-brand-200/80",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    {
      id: 2,
      type: "nilai",
      user: "dr. Rina Puspita, M.Biomed",
      role: "Koordinator Blok",
      action: "mengunci nilai Praktikum Anatomi",
      target: "Blok 1.2 (Sistem Muskuloskeletal)",
      time: "48 menit lalu",
      iconBg: "bg-brand-100 text-brand-700 border border-brand-200/80",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      id: 3,
      type: "akademik",
      user: "Admin Akademik",
      role: "Staf BAAK",
      action: "memperbarui aturan batas SKS",
      target: "Program Studi Sarjana Kedokteran",
      time: "2 jam lalu",
      iconBg: "bg-brand-50 text-brand-700 border border-brand-200/80",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        </svg>
      ),
    },
    {
      id: 4,
      type: "ujian",
      user: "Tim IT CBT",
      role: "Teknisi Lab",
      action: "menyiapkan sesi ujian CBT Teori",
      target: "Lab Komputer 1 & 2 (120 Kursi)",
      time: "4 jam lalu",
      iconBg: "bg-brand-100 text-brand-700 border border-brand-200/80",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 5,
      type: "mahasiswa",
      user: "Admin Registrasi",
      role: "Staf",
      action: "mendaftarkan 14 mahasiswa mutasi/baru",
      target: "Tahun Akademik 2025/2026",
      time: "Kemarin, 16:30 WIB",
      iconBg: "bg-brand-50 text-brand-700 border border-brand-200/80",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-200/80 p-5 md:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Aktivitas Terkini Sistem (Audit Trail)</h2>
          <p className="text-xs text-gray-500">Log sinkronisasi dan tindakan administratif terbaru pada SIAKAD FK.</p>
        </div>
        <span className="text-xs font-semibold text-brand-600 hover:underline cursor-pointer">
          Semua Riwayat &rarr;
        </span>
      </div>

      <div className="divide-y divide-gray-100">
        {activities.map((act) => (
          <div key={act.id} className="py-3 flex items-start gap-3.5 hover:bg-gray-50/60 px-2 rounded-lg transition-colors">
            <div className={`h-8 w-8 rounded-lg ${act.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
              {act.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <p className="text-xs text-gray-900 font-medium">
                  <strong className="font-semibold text-gray-900">{act.user}</strong>{" "}
                  <span className="text-gray-400">({act.role})</span>{" "}
                  <span className="text-gray-600">{act.action}</span>{" "}
                  <strong className="text-brand-900">{act.target}</strong>
                </p>
                <span className="text-[11px] text-gray-400 shrink-0 font-medium">{act.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
