interface SidebarProps {
  children?: React.ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  return <aside className="sticky flex flex-col w-70 px-2 gap-2">{children}</aside>;
}

export function SidebarHoverButton({ children, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      {...props}
      className="hover:ring hover:bg-muted active:text-secondary-foreground ring-border group-hover:opacity-100 opacity-0 transition-opacity duration-150 flex-center p-1 rounded-sm text-secondary-foreground/80 outline-none [&>svg]:size-3.5"
    >
      {children}
    </button>
  );
}
