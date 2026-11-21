import { useState, useEffect, useCallback } from "react";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardStatsGrid, { type DashboardStats } from "../components/dashboard/DashboardStatsGrid";
import DashboardAlerts from "../components/dashboard/DashboardAlerts";
import DashboardCharts from "../components/dashboard/DashboardCharts";
import DashboardMedicalCurriculum from "../components/dashboard/DashboardMedicalCurriculum";
import DashboardQuickActions from "../components/dashboard/DashboardQuickActions";
import DashboardRecentActivity from "../components/dashboard/DashboardRecentActivity";

import {
  getListTahunAkademik,
  getListMahasiswa,
  getListDosen,
  getListMatakuliah,
  getListProgramStudi,
} from "@/features/admin/api/masterData";
import { getStaffKelasList } from "@/features/admin/api/kelas";
import type { TahunAkademikItem } from "@/features/admin/types";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeTahunAkademik, setActiveTahunAkademik] = useState<TahunAkademikItem | null>(null);

  const [stats, setStats] = useState<DashboardStats>({
    totalMahasiswa: 631,
    totalDosen: 84,
    totalMataKuliah: 52,
    totalKelas: 36,
    totalProdi: 2,
    mahasiswaAktif: 618,
    mahasiswaCuti: 13,
    dosenAktif: 78,
  });

  const [krsStats] = useState({
    disetujui: 420,
    menunggu: 112,
    belum: 99,
  });

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Tahun Akademik
      const taRes = await getListTahunAkademik();
      if (taRes.status && taRes.data?.data) {
        // cari yang status === "A" (Aktif) atau ambil data pertama
        const active = taRes.data.data.find((item) => item.status === "A") || taRes.data.data[0];
        if (active) setActiveTahunAkademik(active);
      }

      // 2. Fetch parallel stats
      const [mhsRes, dosenRes, mkRes, prodiRes, kelasRes] = await Promise.allSettled([
        getListMahasiswa(1, 1),
        getListDosen(1, 1),
        getListMatakuliah(undefined, 1),
        getListProgramStudi(1, 10),
        getStaffKelasList(),
      ]);

      setStats((prev) => {
        const totalMahasiswa =
          mhsRes.status === "fulfilled" && mhsRes.value.status && mhsRes.value.data
            ? mhsRes.value.data.jumlah || mhsRes.value.data.pagination?.total || prev.totalMahasiswa
            : prev.totalMahasiswa;

        const totalDosen =
          dosenRes.status === "fulfilled" && dosenRes.value.status && dosenRes.value.data
            ? dosenRes.value.data.jumlah || dosenRes.value.data.pagination?.total || prev.totalDosen
            : prev.totalDosen;

        const totalMataKuliah =
          mkRes.status === "fulfilled" && mkRes.value.status && mkRes.value.data
            ? mkRes.value.data.jumlah || mkRes.value.data.pagination?.total || prev.totalMataKuliah
            : prev.totalMataKuliah;

        const totalProdi =
          prodiRes.status === "fulfilled" && prodiRes.value.status && prodiRes.value.data
            ? prodiRes.value.data.jumlah || prodiRes.value.data.data.length || prev.totalProdi
            : prev.totalProdi;

        const totalKelas =
          kelasRes.status === "fulfilled" && kelasRes.value.status && Array.isArray(kelasRes.value.data)
            ? kelasRes.value.data.length || prev.totalKelas
            : prev.totalKelas;

        return {
          ...prev,
          totalMahasiswa,
          totalDosen,
          totalMataKuliah,
          totalProdi,
          totalKelas,
          mahasiswaAktif: Math.max(0, totalMahasiswa - prev.mahasiswaCuti),
          dosenAktif: Math.max(0, totalDosen - 6),
        };
      });
    } catch (err) {
      console.warn("Gagal mengambil data dashboard secara lengkap, menggunakan data fallback:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="space-y-2 pb-12">
      {/* 1. Header & Periode Akademik Aktif */}
      <DashboardHeader
        activeTahunAkademik={activeTahunAkademik}
        loading={loading}
        onRefresh={fetchDashboardData}
      />

      {/* 2. Kartu Metrik Utama */}
      <DashboardStatsGrid stats={stats} loading={loading} />

      {/* 3. Kotak Perhatian & Tindakan Mendesak Admin */}
      <DashboardAlerts />

      {/* 4. Grafik & Analitik Chart.js */}
      <DashboardCharts krsStats={krsStats} />

      {/* 5. Khusus FK: Monitoring Kurikulum Blok & Evaluasi */}
      <DashboardMedicalCurriculum />

      {/* 6. Pintasan Aksi Cepat */}
      <DashboardQuickActions />

      {/* 7. Aktivitas Terkini (Audit Log) */}
      <DashboardRecentActivity />
    </div>
  );
}
