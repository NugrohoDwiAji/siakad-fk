// ─── Props ─────────────────────────────────────────────────────────────────────

interface SidebarParentItemProps {
  label: string;
  icon: React.ReactNode;
  open: boolean;
  onClick: () => void;
  collapsed?: boolean;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function SidebarParentItem({
  label,
  icon,
  open,
  onClick,
  collapsed = false,
}: SidebarParentItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={[
        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium",
        "transition-colors duration-150",
        open
          ? "bg-brand-700/40 text-white"
          : "text-brand-200 hover:bg-brand-700/60 hover:text-white",
        collapsed ? "justify-center" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Icon */}
      <span className="h-5 w-5 shrink-0">{icon}</span>

      {/* Label + chevron — hidden when sidebar is collapsed */}
      {!collapsed && (
        <>
          <span className="flex-1 truncate text-left leading-tight">{label}</span>
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
        </>
      )}
    </button>
  );
}
