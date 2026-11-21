import { Link } from "react-router-dom";

interface AlertItem {
  id: string;
  type: "warning" | "danger" | "info" | "success";
  title: string;
  description: string;
  countBadge?: string;
  actionText: string;
  actionLink: string;
}

export default function DashboardAlerts() {
  const alerts: AlertItem[] = [
    {
      id: "krs-pending",
      type: "warning",
      title: "KRS Menunggu Persetujuan Dosen PA",
      description: "Terdapat 38 rencana studi mahasiswa yang telah diajukan namun belum diverifikasi oleh Dosen Pembimbing Akademik.",
      countBadge: "38 Mahasiswa",
      actionText: "Verifikasi KRS",
      actionLink: "/admin/krs",
    },
    {
      id: "nilai-belum-masuk",
      type: "danger",
      title: "Input Nilai Komponen Blok Belum Lengkap",
      description: "4 Dosen pengampu belum mengunci nilai praktikum dan ujian SOCA/OSCE untuk Blok 2.1 (Sistem Respirasi).",
      countBadge: "4 Pengampu",
      actionText: "Setup Penilaian",
      actionLink: "/admin/blok/PenilaianBlok",
    },
    {
      id: "deadline-krs",
      type: "info",
      title: "Batas Waktu Pengisian & Perubahan KRS",
      description: "Masa pengisian KRS semester ini tersisa 4 hari lagi. 24 mahasiswa reguler tercatat belum melakukan submission.",
      countBadge: "Sisa 4 Hari",
      actionText: "Cek Mahasiswa",
      actionLink: "/admin/krs",
    },
  ];

  const getStyle = (type: AlertItem["type"]) => {
    switch (type) {
      case "danger":
        return {
          wrapper: "bg-brand-50/50 border-brand-200/90 text-brand-950",
          iconBg: "bg-brand-100 text-brand-700",
          badge: "bg-brand-100 text-brand-800 border border-brand-200",
          btn: "bg-brand-700 hover:bg-brand-800 text-white",
        };
      case "warning":
        return {
          wrapper: "bg-brand-50/30 border-brand-200/70 text-brand-950",
          iconBg: "bg-brand-100 text-brand-700",
          badge: "bg-brand-50 text-brand-700 border border-brand-200",
          btn: "bg-brand-600 hover:bg-brand-700 text-white",
        };
      case "info":
      default:
        return {
          wrapper: "bg-white border-brand-200/80 text-brand-950",
          iconBg: "bg-brand-50 text-brand-600",
          badge: "bg-brand-50 text-brand-700 border border-brand-200",
          btn: "bg-brand-600 hover:bg-brand-700 text-white",
        };
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-200/80 p-5 md:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Perhatian & Tindakan Mendesak Admin</h2>
            <p className="text-xs text-gray-500">Tugas tertunda yang memerlukan tindak lanjut atau koordinasi operasional.</p>
          </div>
        </div>
        <span className="hidden sm:inline-flex text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
          {alerts.length} Perlu Tindakan
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {alerts.map((item) => {
          const style = getStyle(item.type);
          return (
            <div
              key={item.id}
              className={`rounded-xl border p-4 flex flex-col justify-between transition-all ${style.wrapper}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
                    {item.countBadge}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">Prioritas Tinggi</span>
                </div>
                <h3 className="text-sm font-bold leading-snug mb-1.5">{item.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">{item.description}</p>
              </div>

              <div className="pt-2 border-t border-black/5 flex justify-end">
                <Link
                  to={item.actionLink}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer ${style.btn}`}
                >
                  <span>{item.actionText}</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
