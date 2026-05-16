import { LucideChevronRight, LucideFolder, LucideMessageSquarePlus } from "lucide-react";
import { cn } from "~/lib/utils";
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "../ui/collapsible";
import { SidebarHoverButton } from "./sidebar";

interface SidebarCollapseProps {
  title: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function SidebarCollapse({ title, icon, children }: SidebarCollapseProps) {
  return (
    <Collapsible className="group">
      <div className="flex-y-center justify-between py-1">
        <CollapsibleTrigger className="flex-center gap-2 text-muted-foreground transition-colors focus-visible:outline-none group-hover:text-primary data-panel-open:[&>svg]:rotate-90 data-panel-open:[&_span]:font-semibold data-panel-open:[&_span]:text-primary">
          <LucideChevronRight className="size-4 transition-transform duration-150" />
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
        "flex-y-center justify-between px-3 py-1.5 text-muted-foreground text-sm transition-colors rounded-md focus-visible:outline-none [&_span]:text-xs [&_span]:font-normal [&_span]:text-muted-foreground/80",
        active && "text-primary font-medium bg-muted",
        !active && "hover:text-primary",
      )}
    >
      {children}
    </button>
  );
}
