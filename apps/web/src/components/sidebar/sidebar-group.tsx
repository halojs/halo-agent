import { SidebarHoverButton } from "./sidebar";

interface SidebarGroupHeaderProps {
  title: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export function SidebarGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-1">{children}</div>;
}

export function SidebarGroupHeader({ title, children, onClick }: SidebarGroupHeaderProps) {
  return (
    <div className="group flex-y-center h-6">
      <span className="grow font-heading uppercase text-xs text-muted-foreground select-none">
        {title}
      </span>
      {children && <SidebarHoverButton onClick={onClick}>{children}</SidebarHoverButton>}
    </div>
  );
}
