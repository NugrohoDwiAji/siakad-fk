import { useState } from "react";

interface AuthBannerOverlayProps {
  role: "mahasiswa" | "admin" | "dosen";
  headlineTitle?: string;
  headlineSubtitle?: string;
  description?: string;
}

export default function AuthBannerOverlay({
  role,
  headlineTitle,
  headlineSubtitle,
  description,
}: AuthBannerOverlayProps) {
  const [logoError, setLogoError] = useState(false);

  // Default configuration based on role
  const roleConfig = {
    mahasiswa: {
      badge: "Portal Mahasiswa",
      badgeIcon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M12 14l9-5-9-5-9 5 9 5z" />
          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      ),
      title: headlineTitle || "Membentuk Dokter Unggul, Profesional & Beretika",
      subtitle: headlineSubtitle || "Kurikulum Berbasis Kompetensi (KBK) & Problem-Based Learning (PBL)",
      desc:
        description ||
        "Kelola Kartu Rencana Studi (KRS), pantau hasil evaluasi blok, jadwal praktikum laboratorium, dan progres OSCE dalam satu platform terpadu.",
      features: [
        { label: "Modul Blok & Tutorial PBL", icon: "📚" },
        { label: "Jadwal OSCE & Lab Skills", icon: "🩺" },
        { label: "E-KRS & Validasi Dosen PA", icon: "✅" },
      ],
      tagline: "Excellence in Medical Education & Clinical Competence",
    },
    admin: {
      badge: "Portal Administrasi BAAK",
      badgeIcon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: headlineTitle || "Pusat Kendali Akademik & Kurikulum Terpadu",
      subtitle: headlineSubtitle || "Panel Manajemen Data Master, Kurikulum Blok, & Penilaian",
      desc:
        description ||
        "Kelola seluruh siklus operasional akademik Fakultas Kedokteran secara akurat, mulai dari perwalian, distribusi kelas tutorial, hingga rekapitulasi KHS.",
      features: [
        { label: "Manajemen Kurikulum Blok", icon: "🏛️" },
        { label: "Setup Penilaian & OSCE", icon: "⚙️" },
        { label: "Validasi & Rekapitulasi Data", icon: "📊" },
      ],
      tagline: "Integrated Governance & Standardized Medical Administration",
    },
    dosen: {
      badge: "Portal Dosen & Tutor",
      badgeIcon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      title: headlineTitle || "Kolaborasi Pembelajaran & Bimbingan Klinis",
      subtitle: headlineSubtitle || "Fasilitator Problem-Based Learning (PBL) & Pembimbing Akademik",
      desc:
        description ||
        "Akses penilaian pleno skenario tutorial, evaluasi ujian praktikum, penguncian nilai blok, serta bimbingan perwalian mahasiswa secara real-time.",
      features: [
        { label: "Penilaian Pleno & Tutorial", icon: "📝" },
        { label: "Evaluasi Komprehensif Blok", icon: "🩺" },
        { label: "Bimbingan & Konseling PA", icon: "👥" },
      ],
      tagline: "Inspiring Medical Minds & Guiding Future Physicians",
    },
  }[role];

  return (
    <div className="relative hidden lg:flex flex-col justify-between w-1/2 overflow-hidden bg-brand-950 text-white select-none">
      {/* ── 1. Background Image ── */}
      <img
        src="/images/banner2.png"
        alt="SIAKAD FK Background"
        className="absolute inset-0 w-full h-full object-cover object-center transform scale-105 hover:scale-100 transition-transform duration-1000 ease-out"
      />

      {/* ── 2. Aesthetic Gradient Overlays ── */}
      {/* Primary Deep Navy Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-900/85 to-brand-900/60" />
      {/* Diagonal Vignette & Depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-950/80 via-transparent to-brand-900/90 mix-blend-multiply" />
      {/* Subtle radial glows for elegance */}
      <div className="absolute top-1/4 -right-12 w-96 h-96 bg-brand-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-12 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Grid Pattern Texture */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.9) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* ── 3. Overlay Content Layer ── */}
      <div className="relative z-10 flex flex-col justify-between h-full p-10 xl:p-14">
        {/* Top Header & Brand */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-2 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform">
              {!logoError ? (
                <img
                  src="/images/logos/ubg-white.png"
                  alt="Logo FK"
                  className="h-full w-full object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="font-extrabold text-white text-base tracking-wider">FK</span>
              )}
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight block leading-none text-white drop-shadow-xs">
                SIAKAD FK
              </span>
              <span className="text-[11px] font-semibold text-brand-200 tracking-wider uppercase block mt-1">
                Fakultas Kedokteran
              </span>
            </div>
          </div>

          {/* Role Pill Badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xs">
            <span className="text-brand-300">{roleConfig.badgeIcon}</span>
            <span>{roleConfig.badge}</span>
          </span>
        </div>

        {/* Center Hero Information Card */}
        <div className="my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-brand-500/25 border border-brand-400/30 text-brand-200 mb-4 backdrop-blur-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            Sistem Informasi Akademik Terintegrasi
          </div>

          <h1 className="text-2xl xl:text-3xl font-extrabold leading-snug tracking-tight text-white mb-3 drop-shadow-sm">
            {roleConfig.title}
          </h1>

          <p className="text-brand-100 text-sm xl:text-base leading-relaxed mb-6 font-normal max-w-xl text-balance">
            {roleConfig.desc}
          </p>

          {/* Floating Glassmorphic Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            {roleConfig.features.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/15 transition-all duration-200 shadow-xs"
              >
                <span className="text-base shrink-0">{item.icon}</span>
                <span className="text-xs font-semibold text-white truncate">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Footer & Accreditation */}
        <div className="pt-6 border-t border-white/15 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-brand-200 font-medium">
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-cyan-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{roleConfig.tagline}</span>
            </span>
            <span className="text-[11px] text-brand-300 hidden xl:inline">
              Enkripsi SSL 256-bit
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-brand-300/80">
            <span>© {new Date().getFullYear()} Fakultas Kedokteran. All rights reserved.</span>
            <span>v2.0 • Standar KKI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
