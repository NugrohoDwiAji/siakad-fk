import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardChartsProps {
  krsStats?: {
    disetujui: number;
    menunggu: number;
    belum: number;
  };
}

export default function DashboardCharts({
  krsStats = { disetujui: 320, menunggu: 54, belum: 36 },
}: DashboardChartsProps) {
  const totalKrs = krsStats.disetujui + krsStats.menunggu + krsStats.belum;
  const persentaseDisetujui = totalKrs > 0 ? Math.round((krsStats.disetujui / totalKrs) * 100) : 0;

  // ── 1. Doughnut Chart Data (KRS Status) ──
  const krsChartData = {
    labels: ["Disetujui Dosen PA", "Menunggu Verifikasi", "Belum Mengajukan"],
    datasets: [
      {
        data: [krsStats.disetujui, krsStats.menunggu, krsStats.belum],
        backgroundColor: [
          "#1e4589", // brand-600
          "#4e7bbf", // brand-400
          "#adc3e3", // brand-200
        ],
        hoverBackgroundColor: [
          "#142647", // brand-900
          "#2f5ca8", // brand-500
          "#7a9ed1", // brand-300
        ],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  const krsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          boxWidth: 12,
          padding: 14,
          font: { size: 11, family: "sans-serif" },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const val = context.raw || 0;
            const pct = totalKrs > 0 ? Math.round((val / totalKrs) * 100) : 0;
            return ` ${context.label}: ${val} Mahasiswa (${pct}%)`;
          },
        },
      },
    },
    cutout: "70%",
  };

  // ── 2. Bar Chart Data (Mahasiswa per Angkatan) ──
  const angkatanLabels = ["Angkatan 2021", "Angkatan 2022", "Angkatan 2023", "Angkatan 2024", "Angkatan 2025"];
  const angkatanData = {
    labels: angkatanLabels,
    datasets: [
      {
        label: "Kedokteran Umum (S.Ked)",
        data: [98, 110, 115, 120, 125],
        backgroundColor: "#1e4589", // brand-600
        borderRadius: 6,
      },
      {
        label: "Profesi Dokter (Koas)",
        data: [85, 78, 0, 0, 0],
        backgroundColor: "#4e7bbf", // brand-400
        borderRadius: 6,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        align: "end" as const,
        labels: {
          boxWidth: 12,
          font: { size: 11 },
        },
      },
      tooltip: {
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#f3f4f6" },
        ticks: { font: { size: 11 } },
      },
    },
  };

  // ── 3. Line Chart Data (Tren IPK Rata-Rata) ──
  const ipkData = {
    labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6", "Sem 7"],
    datasets: [
      {
        label: "Rata-rata IPK Mahasiswa",
        data: [3.38, 3.42, 3.46, 3.44, 3.52, 3.55, 3.58],
        borderColor: "#1e4589",
        backgroundColor: "rgba(30, 69, 137, 0.08)",
        fill: true,
        tension: 0.35,
        pointBackgroundColor: "#1e4589",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "Target Standar FK (3.25)",
        data: [3.25, 3.25, 3.25, 3.25, 3.25, 3.25, 3.25],
        borderColor: "#94a3b8",
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        align: "end" as const,
        labels: {
          boxWidth: 12,
          font: { size: 11 },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
      y: {
        min: 2.8,
        max: 4.0,
        grid: { color: "#f3f4f6" },
        ticks: {
          stepSize: 0.2,
          font: { size: 11 },
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* ── Donut Chart: Status KRS ── */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200/80 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-gray-900">Progres Pengisian KRS</h3>
            <span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
              Semester Aktif
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Status pengajuan dan persetujuan KRS mahasiswa.
          </p>

          <div className="relative h-56 w-full flex items-center justify-center">
            <Doughnut data={krsChartData} options={krsChartOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
              <span className="text-2xl font-black text-gray-900">{persentaseDisetujui}%</span>
              <span className="text-[11px] font-medium text-gray-500">Telah Disetujui</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <div className="font-bold text-brand-700">{krsStats.disetujui}</div>
            <div className="text-[10px] text-gray-500">Disetujui</div>
          </div>
          <div>
            <div className="font-bold text-brand-500">{krsStats.menunggu}</div>
            <div className="text-[10px] text-gray-500">Menunggu PA</div>
          </div>
          <div>
            <div className="font-bold text-brand-400">{krsStats.belum}</div>
            <div className="text-[10px] text-gray-500">Belum Ajukan</div>
          </div>
        </div>
      </div>

      {/* ── Bar Chart: Distribusi Mahasiswa per Angkatan ── */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200/80 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-gray-900">Distribusi Mahasiswa per Angkatan</h3>
            <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
              Total 631
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Jumlah mahasiswa program Sarjana Kedokteran dan Profesi Dokter.
          </p>

          <div className="h-60 w-full">
            <Bar data={angkatanData} options={barChartOptions} />
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Rasio Dosen-Mahasiswa FK: <strong>1 : 7.2</strong></span>
          <span className="text-brand-600 font-semibold text-[11px]">Memenuhi Standar KKI</span>
        </div>
      </div>

      {/* ── Line Chart: Tren Nilai & IPK Rata-Rata ── */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200/80 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-gray-900">Tren Rata-rata IPK Mahasiswa</h3>
            <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
              Avg 3.48
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Evaluasi capaian akademik mahasiswa lintas semester.
          </p>

          <div className="h-60 w-full">
            <Line data={ipkData} options={lineChartOptions} />
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Status Akademik: <strong>Sangat Baik</strong></span>
          <span className="text-[11px] text-gray-400">Target Kelulusan &gt; 95%</span>
        </div>
      </div>
    </div>
  );
}
