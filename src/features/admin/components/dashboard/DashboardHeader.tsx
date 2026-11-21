import { Link } from "react-router-dom";
import type { TahunAkademikItem } from "@/features/admin/types";

interface DashboardHeaderProps {
  activeTahunAkademik: TahunAkademikItem | null;
  loading: boolean;
  onRefresh: () => void;
}

export default function DashboardHeader({
  activeTahunAkademik,
  loading,
  onRefresh,
}: DashboardHeaderProps) {
  const isKrsOpen = Boolean(
    activeTahunAkademik?.tanggal_buka_krs &&
    activeTahunAkademik?.tanggal_tutup_krs &&
    new Date() >= new Date(activeTahunAkademik.tanggal_buka_krs) &&
    new Date() <= new Date(activeTahunAkademik.tanggal_tutup_krs)
  );

  const semesterLabel =
    activeTahunAkademik?.semester === 1
      ? "Ganjil"
      : activeTahunAkademik?.semester === 2
      ? "Genap"
      : activeTahunAkademik?.semester === 3
      ? "Antara / Pendek"
      : "Ganjil";

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-200/80 p-5 md:p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title & Description */}
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
              Dashboard Akademik FK
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mr-1.5 animate-pulse"></span>
              Sistem Aktif
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Pusat monitoring operasional perkuliahan, kurikulum blok, KRS, dan evaluasi mahasiswa Fakultas Kedokteran.
          </p>
        </div>

        {/* Action Controls & Active Semester Badge */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Active Academic Year Pill */}
          <div className="flex items-center gap-3 bg-brand-50/80 border border-brand-100/90 rounded-lg px-3.5 py-2">
            <div className="h-8 w-8 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="text-[11px] font-medium text-brand-600 uppercase tracking-wider">
                Periode Aktif
              </div>
              <div className="text-xs font-bold text-gray-900">
                {activeTahunAkademik ? (
                  <>
                    T.A. {activeTahunAkademik.tahun_akademik} ({semesterLabel})
                  </>
                ) : (
                  "T.A. 2025/2026 (Ganjil)"
                )}
              </div>
            </div>
          </div>

          {/* Status KRS Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border border-brand-200/80 bg-brand-50/50 text-xs text-gray-700">
            <span
              className={`w-2 h-2 rounded-full ${
                isKrsOpen ? "bg-brand-600 ring-2 ring-brand-200" : "bg-brand-400"
              }`}
            />
            <span>
              KRS:{" "}
              <strong className="text-brand-700">
                {isKrsOpen ? "Buka" : "Menunggu / Berjalan"}
              </strong>
            </span>
            {activeTahunAkademik?.tanggal_tutup_krs && (
              <span className="text-brand-600/70">
                (s/d {formatDate(activeTahunAkademik.tanggal_tutup_krs)})
              </span>
            )}
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            title="Muat Ulang Data"
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-200 text-gray-600 hover:text-brand-700 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <svg
              className={`w-4 h-4 ${loading ? "animate-spin text-brand-600" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* Setting Link */}
          <Link
            to="/admin/tahun-akademik"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors border border-brand-200"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
            <span>Atur Periode</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
