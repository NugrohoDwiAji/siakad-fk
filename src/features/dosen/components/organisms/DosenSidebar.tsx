import { useState, useMemo, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useDosenAuthStore } from "@/features/dosen/stores/dosenAuthStore";

// ─── Icons ─────────────────────────────────────────────────────────────────────

function Icon({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-full w-full"
    >
      <path d={d} />
    </svg>
  );
}

// ─── Menu Config ───────────────────────────────────────────────────────────────

interface NavItemConfig {
  to: string;
  label: string;
  icon: React.ReactNode;
}

interface MenuGroup {
  label: string;
  icon?: React.ReactNode;
  items: NavItemConfig[];
  expandable?: boolean;
  defaultOpen?: boolean;
}

const menuGroups: MenuGroup[] = [
  {
    label: "Utama",
    items: [
      {
        to: "/dosen/dashboard",
        label: "Dashboard",
        icon: (
          <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />
        ),
      },
    ],
  },
  {
    label: "Akademik",
    expandable: true,
    defaultOpen: true,
    icon: (
      <Icon d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    ),
    items: [
      {
        to: "/dosen/kurikulum",
        label: "Kurikulum Mahasiswa",
        icon: (
          <Icon d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        ),
      },
      {
        to: "/dosen/kelas",
        label: "Kelas",
        icon: (
          <Icon d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        ),
      },
      {
        to: "/dosen/perwalian",
        label: "Perwalian",
        icon: (
          <Icon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zm10 0v6m-3-3h6" />
        ),
      },
    ],
  },
  {
    label: "Penilaian",
    expandable: true,
    defaultOpen: true,
    icon: (
      <Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    ),
    items: [
      {
        to: "/dosen/penilaian",
        label: "Penilaian",
        icon: (
          <Icon d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        ),
      },
    ],
  },
];

// ─── Collapse Toggle ────────────────────────────────────────────────────────────

function CollapseToggle({
  collapsed,
  onClick,
}: {
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
      className="flex items-center justify-center h-8 w-8 rounded-md text-brand-300 hover:text-white hover:bg-brand-700 transition-colors focus-visible:outline-none"
    >
      <svg
        className={`h-4 w-4 transition-transform duration-200 ${
          collapsed ? "rotate-180" : ""
        }`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  );
}

// ─── Expandable Menu Group ─────────────────────────────────────────────────────

function ExpandableMenuGroup({
  group,
  collapsed,
}: {
  group: MenuGroup;
  collapsed: boolean;
}) {
  const [open, setOpen] = useState(group.defaultOpen ?? true);
  const location = useLocation();

  const isItemActive = (to: string) => {
    if (to === "/dosen/penilaian") {
      return (
        location.pathname === "/dosen/penilaian" ||
        (location.pathname.startsWith("/dosen/penilaian/") &&
          !location.pathname.startsWith("/dosen/penilaian/validasi"))
      );
    }
    if (to === "/dosen/penilaian/validasi") {
      return location.pathname.startsWith("/dosen/penilaian/validasi");
    }
    return location.pathname === to || location.pathname.startsWith(to + "/");
  };

  useEffect(() => {
    const hasActiveChild = group.items.some((item) => isItemActive(item.to));
    if (hasActiveChild) {
      setOpen(true);
    }
  }, [location.pathname, group.items]);

  if (collapsed) {
    return (
      <div className="mt-2">
        <ul className="space-y-0.5 px-2">
          {group.items.map((item) => {
            const active = isItemActive(item.to);
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={`flex items-center justify-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-brand-700 text-white"
                      : "text-brand-200 hover:bg-brand-800 hover:text-white"
                  }`}
                  title={item.label}
                >
                  <span className="h-5 w-5 shrink-0">{item.icon}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <div className="mt-2 px-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
          open
            ? "bg-brand-800/80 text-white"
            : "text-brand-200 hover:bg-brand-800 hover:text-white"
        }`}
      >
        <span className="h-5 w-5 shrink-0">{group.icon}</span>
        <span className="flex-1 text-left truncate leading-tight font-medium">
          {group.label}
        </span>
        <svg
          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div
        className={`overflow-hidden transition-all duration-200 ${
          open ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="ml-3 pl-3 border-l border-brand-700/60 space-y-0.5">
          {group.items.map((item) => {
            const active = isItemActive(item.to);
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "bg-brand-700 text-white font-semibold shadow-xs"
                      : "text-brand-200 hover:bg-brand-800 hover:text-white"
                  }`}
                  title={item.label}
                >
                  <span className="h-4 w-4 shrink-0">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface DosenSidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (value: boolean) => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function DosenSidebar({
  collapsed: controlledCollapsed,
  onCollapsedChange,
}: DosenSidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const user = useDosenAuthStore((state) => state.user);
  const logout = useDosenAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const collapsed = controlledCollapsed ?? internalCollapsed;

  const toggle = () => {
    const next = !collapsed;
    setInternalCollapsed(next);
    onCollapsedChange?.(next);
  };

  async function handleLogout() {
    await logout();
    navigate("/dosen/auth");
  }

  const userInitial = user?.nama_dosen?.charAt(0)?.toUpperCase() || "D";
  const userName = user?.nama_dosen || "Dosen";
  const userEmail = user?.alamat_email || "dosen@siakad.ac.id";
  const isKaprodi =
    user?.status?.toLowerCase() === "kaprodi" ||
    user?.type?.toLowerCase() === "kaprodi";

  const dynamicMenuGroups = useMemo(() => {
    return menuGroups.map((group) => {
      if (group.label === "Penilaian") {
        const items = [...group.items];
        if (isKaprodi) {
          items.push({
            to: "/dosen/penilaian/validasi",
            label: "Validasi",
            icon: (
              <Icon d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            ),
          });
        }
        return { ...group, items };
      }
      return group;
    });
  }, [isKaprodi]);

  return (
    <aside
      className={`flex flex-col h-full bg-brand-900 transition-all duration-200 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* ── Logo ── */}
      <div
        className={`flex items-center h-16 px-4 border-b border-brand-800 shrink-0 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center text-white font-bold text-xs shrink-0 select-none">
            FK
          </div>
          {!collapsed && (
            <span className="font-bold text-white text-sm tracking-wide truncate">
              SIAKAD FK
            </span>
          )}
        </div>
        {!collapsed && (
          <CollapseToggle collapsed={collapsed} onClick={toggle} />
        )}
      </div>

      {/* ── Navigation ── */}
      <nav
        className="flex-1 overflow-y-auto py-2"
        style={{ scrollbarWidth: "none" }}
        aria-label="Menu dosen"
      >
        {dynamicMenuGroups.map((group) => {
          if (group.expandable) {
            return (
              <ExpandableMenuGroup
                key={group.label}
                group={group}
                collapsed={collapsed}
              />
            );
          }

          return (
            <div key={group.label}>
              <p className="px-4 mt-4 mb-1 text-[10px] font-semibold uppercase tracking-widest text-brand-400">
                {group.label}
              </p>
              <ul className="space-y-0.5 px-2">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-brand-700 text-white font-semibold"
                            : "text-brand-200 hover:bg-brand-800 hover:text-white"
                        } ${collapsed ? "justify-center" : ""}`
                      }
                      title={collapsed ? item.label : undefined}
                    >
                      <span className="h-5 w-5 shrink-0">{item.icon}</span>
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* ── User footer ── */}
      <div className="shrink-0 border-t border-brand-800">
        {collapsed ? (
          <div className="flex justify-center py-3">
            <CollapseToggle collapsed={collapsed} onClick={toggle} />
          </div>
        ) : (
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-brand-700 flex items-center justify-center text-xs font-bold text-white shrink-0 select-none overflow-hidden">
              {user?.foto_url ? (
                <img
                  src={user.foto_url}
                  alt={userName}
                  className="h-full w-full object-cover"
                />
              ) : (
                userInitial
              )}
            </div>
            <div className="overflow-hidden flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-white truncate">
                  {userName}
                </p>
                {isKaprodi && (
                  <span className="text-[9px] font-bold text-brand-200 uppercase tracking-wider bg-brand-800 px-1 py-0.2 rounded border border-brand-700 shrink-0">
                    Kaprodi
                  </span>
                )}
              </div>
              <p className="text-[10px] text-brand-400 truncate">{userEmail}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Keluar"
              className="text-brand-400 hover:text-white transition-colors shrink-0 focus-visible:outline-none"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
