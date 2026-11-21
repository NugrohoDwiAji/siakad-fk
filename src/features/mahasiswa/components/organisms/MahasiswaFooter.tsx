import { Link } from "react-router-dom";

// ─── Data ─────────────────────────────────────────────────────────────────────

const quickLinks = [
  { label: "Profile", to: "/profile" },
  { label: "Kurikulum", to: "/kurikulum" },
  { label: "KHS", to: "/khs" },
  { label: "KRS", to: "/krs" },
];

const infoLinks = [
  { label: "Panduan Penggunaan", to: "/panduan" },
  { label: "FAQ", to: "/faq" },
  { label: "Kebijakan Privasi", to: "/privasi" },
  { label: "Hubungi Kami", to: "/kontak" },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

function MapPinIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
      <circle cx={12} cy={10} r={3} />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.39 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 5.55 5.55l.93-.93a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x={2} y={4} width={20} height={16} rx={2} />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={12} cy={12} r={10} />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

function MahasiswaFooter() {
  return (
    <footer className="bg-brand-900 text-brand-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand & address */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center text-white font-bold text-sm select-none shrink-0">
                FK
              </div>
              <div>
                <p className="font-semibold text-white text-sm leading-tight">SIAKAD FK</p>
                <p className="text-xs text-brand-300">Fakultas Kedokteran</p>
              </div>
            </div>
            <p className="text-xs text-brand-300 leading-relaxed">
              Sistem Informasi Akademik resmi Fakultas Kedokteran untuk pengelolaan data studi mahasiswa.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Kontak Kami</h3>
            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-2 text-xs">
                <MapPinIcon />
                <span>Jl. Ismail Marzuki No.22, Cilinaya, Kec. Cakranegara, Kota Mataram, Nusa Tenggara Barat 83127</span>
              </li>
              <li className="flex items-center gap-2 text-xs">
                <PhoneIcon />
                <a href="tel:+6285936159726" className="hover:text-white transition-colors">
                  +62 859-3615-9726
                </a>
              </li>
              <li className="flex items-center gap-2 text-xs">
                <EnvelopeIcon />
                <a href="mailto:akademik@universitasbumigora.ac.id" className="hover:text-white transition-colors">
                  akademik@universitasbumigora.ac.id
                </a>
              </li>
              <li className="flex items-center gap-2 text-xs">
                <GlobeIcon />
                <a
                  href="https://fk.ubg.ac.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  fk.ubg.ac.id
                </a>
              </li>
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Menu</h3>
            <ul className="flex flex-col gap-2">
              {quickLinks.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-xs hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Informasi</h3>
            <ul className="flex flex-col gap-2">
              {infoLinks.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-xs hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-brand-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-brand-400">
            © {new Date().getFullYear()} Fakultas Kedokteran. All rights reserved.
          </p>
          <p className="text-xs text-brand-400">
            Dikembangkan oleh Tim PUSTIK Universitas Bumigora.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default MahasiswaFooter;
