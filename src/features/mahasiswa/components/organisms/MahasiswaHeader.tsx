import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/stores/authStore";

const navItems = [
  { label: "Kurikulum", to: "/kurikulum" },
  { label: "KRS", to: "/krs" },
  { label: "KHS", to: "/khs" },
  { label: "Petikan Nilai", to: "/petikan-nilai" },
];

function getInitial(name?: string) {
  if (!name) return "FK";
  return name
    .split(" ")
    .map((segment) => segment[0].toUpperCase())
    .slice(0, 2)
    .join("");
}

function MahasiswaHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

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
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Menu mahasiswa"
          >
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                {item.label}
              </NavLink>
            ))}

            {/* User dropdown */}
            <div className="relative ml-4">
              <button
                type="button"
                className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/10 text-white font-semibold text-sm uppercase shadow-sm hover:bg-white/20 transition-colors focus-visible:outline-none"
                onClick={() => setDropdownOpen((open) => !open)}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                {user ? getInitial(user.nama_mahasiswa) : "FK"}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-white/10 bg-brand-800 shadow-lg ring-1 ring-black/10">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/profile");
                    }}
                    className="flex w-full items-center gap-3 text-left px-4 py-2 text-sm text-white hover:bg-white/10"
                  >
                    <svg
                      className="h-4 w-4 text-brand-200"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Profil
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setDropdownOpen(false);
                      await logout();
                      navigate("/login");
                    }}
                    className="flex w-full items-center gap-3 text-left px-4 py-2 text-sm text-white hover:bg-white/10"
                  >
                    <svg
                      className="h-4 w-4 text-brand-200"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
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
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1={18} y1={6} x2={6} y2={18} />
                <line x1={6} y1={6} x2={18} y2={18} />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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
