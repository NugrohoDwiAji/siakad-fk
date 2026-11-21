import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import SidebarSectionLabel from "../atoms/SidebarSectionLabel";
import SidebarNavItem from "../atoms/SidebarNavItem";
import SidebarParentItem from "../atoms/SidebarParentItem";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface NavItemConfig {
  to: string;
  label: string;
  icon: React.ReactNode;
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface SidebarNavGroupProps {
  label: string;
  items: NavItemConfig[];
  /** When true, label becomes a toggle button that hides/shows items */
  expandable?: boolean;
  /** Icon shown on the parent toggle button (required when expandable) */
  icon?: React.ReactNode;
  /** Whether the group starts open (only applies when expandable) */
  defaultOpen?: boolean;
  /** Sidebar icon-only mode */
  collapsed?: boolean;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function SidebarNavGroup({
  label,
  items,
  expandable = false,
  icon,
  defaultOpen = false,
  collapsed = false,
}: SidebarNavGroupProps) {
  const location = useLocation();
  const hasActiveChild = items.some(
    (item) =>
      location.pathname === item.to ||
      (item.to !== "/admin" && location.pathname.startsWith(item.to + "/"))
  );
  const [open, setOpen] = useState(defaultOpen || hasActiveChild);

  useEffect(() => {
    if (hasActiveChild) {
      setOpen(true);
    }
  }, [hasActiveChild]);

  // In sidebar-collapsed (icon-only) mode, show all items directly — no room for accordion
  if (collapsed) {
    return (
      <div>
        <SidebarSectionLabel collapsed>{label}</SidebarSectionLabel>
        <ul className="space-y-0.5 px-2">
          {items.map((item) => (
            <li key={item.to}>
              <SidebarNavItem to={item.to} label={item.label} icon={item.icon} collapsed />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Non-expandable: flat section label
  if (!expandable) {
    return (
      <div>
        <SidebarSectionLabel>{label}</SidebarSectionLabel>
        <ul className="space-y-0.5 px-2">
          {items.map((item) => (
            <li key={item.to}>
              <SidebarNavItem to={item.to} label={item.label} icon={item.icon} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Expandable: accordion with parent toggle button + indented children
  return (
    <div className="px-2 mt-1">
      <SidebarParentItem
        label={label}
        icon={icon}
        open={open}
        onClick={() => setOpen((v) => !v)}
      />

      {/* Animated children */}
      <div
        className={`overflow-hidden transition-all duration-200 ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="mt-0.5 ml-3 pl-3 border-l border-brand-700/50 space-y-0.5">
          {items.map((item) => (
            <li key={item.to}>
              <SidebarNavItem to={item.to} label={item.label} icon={item.icon} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

