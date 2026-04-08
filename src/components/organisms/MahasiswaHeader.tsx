import { useState } from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Profile", to: "/profile" },
  { label: "Kurikulum", to: "/kurikulum" },
  { label: "KRS", to: "/krs" },
  { label: "KHS", to: "/khs" },
];

function MahasiswaHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "text-sm font-medium px-3 py-1.5 rounded-md transition-colors duration-150",
      isActive
        ? "bg-white/15 text-white"
        : "text-brand-200 hover:bg-white/10 hover:text-white",
    ].join(" ");

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "block text-sm font-medium px-4 py-2.5 rounded-md transition-colors duration-150",
      isActive
        ? "bg-brand-700 text-white"
        : "text-brand-100 hover:bg-brand-700 hover:text-white",
    ].join(" ");

  return (
    <header className="bg-brand-800 shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs select-none">
              FK
            </div>
            <span className="font-semibold text-white text-sm tracking-wide hidden sm:block">
              SIAKAD FK
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Menu mahasiswa">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="inline-flex md:hidden items-center justify-center p-2 rounded-md text-brand-200 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none"
            aria-label="Buka menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <line x1={18} y1={6} x2={6} y2={18} />
                <line x1={6} y1={6} x2={18} y2={18} />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <line x1={4} y1={8} x2={20} y2={8} />
                <line x1={4} y1={16} x2={20} y2={16} />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav
          className="md:hidden border-t border-brand-700 bg-brand-800 px-4 py-3 flex flex-col gap-1"
          aria-label="Menu mahasiswa mobile"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={mobileLinkClass}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}

export default MahasiswaHeader;
