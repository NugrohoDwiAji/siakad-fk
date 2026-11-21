// ─── Props ─────────────────────────────────────────────────────────────────────

interface SidebarSectionLabelProps {
  children: React.ReactNode;
  collapsed?: boolean;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function SidebarSectionLabel({
  children,
  collapsed = false,
}: SidebarSectionLabelProps) {
  if (collapsed) {
    return <div className="mx-3 my-1 h-px bg-brand-700" />;
  }

  return (
    <p className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-brand-400 select-none">
      {children}
    </p>
  );
}
