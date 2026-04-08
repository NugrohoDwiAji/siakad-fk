import { NavLink } from "react-router-dom";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface SidebarNavItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  /** Collapse sidebar (icon-only mode) */
  collapsed?: boolean;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function SidebarNavItem({
  to,
  label,
  icon,
  collapsed = false,
}: SidebarNavItemProps) {
  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 group",
          isActive
            ? "bg-brand-700 text-white"
            : "text-brand-200 hover:bg-brand-700/60 hover:text-white",
          collapsed ? "justify-center" : "",
        ]
          .filter(Boolean)
          .join(" ")
      }
    >
      {/* Icon */}
      <span className="h-5 w-5 shrink-0">{icon}</span>

      {/* Label — hidden when collapsed */}
      {!collapsed && (
        <span className="truncate leading-tight">{label}</span>
      )}
    </NavLink>
  );
}
