import { LucideChevronRight, LucideFolder, LucideMessageSquarePlus } from "lucide-react";
import { cn } from "~/lib/utils";
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "../ui/collapsible";
import { Button } from "./button";

export function Sidebar({ children }: { children?: React.ReactNode }) {
  return <aside className="sticky flex flex-col w-70 px-2 gap-2">{children}</aside>;
}

export function SidebarGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-1">{children}</div>;
}

export function SidebarGroupHeader({
  title,
  children,
  onClick,
}: {
  title: string;
  children?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div className="group flex-y-center h-6">
      <span className="grow font-heading uppercase text-xs text-muted-foreground select-none">
        {title}
      </span>
      {children && <SidebarHoverButton onClick={onClick}>{children}</SidebarHoverButton>}
    </div>
  );
}

export function SidebarItem({
  active,
  children,
  ...props
}: React.ComponentProps<"button"> & { active?: boolean }) {
  return (
    <button
      {...props}
      className={cn(
        "flex-y-center gap-2 py-2 text-foreground/50 transition-colors focus-visible:outline-none [&_svg]:text-foreground/50 [&_svg]:size-4 hover:not-[&_svg]:text-foreground",
        active && "text-foreground font-medium bg-muted",
        !active && "hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function SidebarCollapse({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <Collapsible className="group select-none">
      <div className="flex-y-center justify-between py-1">
        <CollapsibleTrigger className="flex-y-center gap-2 text-foreground/50 transition-colors focus-visible:outline-none group-hover:text-foreground data-panel-open:[&>svg]:rotate-90 data-panel-open:[&_span]:font-semibold data-panel-open:[&_span]:text-foreground">
          <LucideChevronRight className="text-muted-foreground size-4 transition-transform duration-150" />
          <span className="font-heading flex-y-center gap-2 text-sm">
            {icon || <LucideFolder className="size-4" />}
            {title}
          </span>
        </CollapsibleTrigger>
        <SidebarHoverButton>
          <LucideMessageSquarePlus />
        </SidebarHoverButton>
      </div>
      <CollapsiblePanel className="pl-2">
        <div className="flex flex-col pl-4 py-2 border-l text-sm gap-1">{children}</div>
      </CollapsiblePanel>
    </Collapsible>
  );
}

export function SidebarCollapseItem({
  active,
  children,
}: React.ComponentProps<"button"> & { active?: boolean }) {
  return (
    <button
      className={cn(
        "flex-y-center justify-between px-3 py-1.5 text-muted-foreground text-sm transition-colors rounded-md focus-visible:outline-none [&_small]:text-xs [&_small]:font-normal [&_small]:text-muted-foreground/80",
        active && "text-primary font-medium bg-accent",
        !active && "hover:text-primary",
      )}
    >
      {children}
    </button>
  );
}

export function SidebarHoverButton({ children, ...props }: React.ComponentProps<"button">) {
  return (
    <Button
      {...props}
      variant="ghost"
      size="sm"
      className="opacity-0 group-hover:opacity-100 transition-opacity"
    >
      {children}
    </Button>
  );
}
