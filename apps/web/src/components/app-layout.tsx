import { Link } from "@tanstack/react-router";
import { LucideFolderPlus, LucidePanelLeft, LucideSettings } from "lucide-react";
import { Fragment } from "react";
import { APP_STAGE_LABEL } from "~/env";
import { usePageMeta } from "~/hooks/use-page-meta";
import { Sidebar } from "./sidebar/sidebar";
import { SidebarCollapse, SidebarCollapseItem } from "./sidebar/sidebar-collapse";
import { SidebarGroup, SidebarGroupHeader } from "./sidebar/sidebar-group";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from "./ui/breadcrumb";
import { HaloIcon, HaloTextIcon } from "./ui/icons";
import { ScrollArea } from "./ui/scroll-area";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full flex p-2 gap-2">
      <Sidebar>
        <AppLayoutTitle />
        <SidebarGroup>
          <SidebarGroupHeader title="Projects">
            <LucideFolderPlus />
          </SidebarGroupHeader>
          <SidebarCollapse title="Halo Agent">
            <SidebarCollapseItem active={true}>
              Hello
              <span>2d</span>
            </SidebarCollapseItem>
            <SidebarCollapseItem>
              Hello
              <span>2d</span>
            </SidebarCollapseItem>
          </SidebarCollapse>
          <SidebarCollapse title="Halo Gateway">
            <SidebarCollapseItem active={true}>
              Hello
              <span>2d</span>
            </SidebarCollapseItem>
            <SidebarCollapseItem>
              Hello
              <span>2d</span>
            </SidebarCollapseItem>
          </SidebarCollapse>
        </SidebarGroup>
      </Sidebar>
      <main className="flex flex-col grow h-full">
        <AppLayoutHeader />
        <div className="grow p-6 bg-card border rounded-xl">
          <ScrollArea>{children}</ScrollArea>
        </div>
      </main>
    </div>
  );
}

function AppLayoutButton({ children, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      {...props}
      className="hover:bg-muted active:text-secondary-foreground flex-center p-1 rounded-sm text-secondary-foreground/80 outline-none [&>svg]:size-4"
    >
      {children}
    </button>
  );
}

function AppLayoutHeader() {
  return (
    <header className="flex-y-center gap-4 h-8.5 mb-2 px-2">
      <div className="grow flex-y-center gap-2">
        <AppLayoutButton>
          <LucidePanelLeft />
        </AppLayoutButton>

        <AppLayoutBreadcrumb />
      </div>

      <div className="flex-y-center gap-4">
        <AppLayoutButton>
          <LucideSettings />
        </AppLayoutButton>
      </div>
    </header>
  );
}

function AppLayoutBreadcrumb() {
  const { breadcrumbs } = usePageMeta();

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList className="font-heading text-xs uppercase text-muted-foreground">
        {breadcrumbs.map((breadcrumb, i) => {
          const isLast = i === breadcrumbs.length - 1;

          return (
            <Fragment key={`${breadcrumb.path}-${i}`}>
              <BreadcrumbItem className={isLast ? "text-primary font-medium" : ""}>
                {breadcrumb.label}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function AppLayoutTitle() {
  return (
    <div className="flex-y-center gap-4 h-8.5 mb-2">
      <Link to="/" className="flex-y-center gap-2">
        <div className="flex-center size-6 rounded-full bg-primary text-primary-foreground">
          <HaloIcon className="w-2" />
        </div>
        <HaloTextIcon className="w-9" />
      </Link>
      <span className="px-2 text-xs uppercase bg-muted text-muted-foreground rounded-md select-none">
        <small>{APP_STAGE_LABEL}</small>
      </span>
    </div>
  );
}
