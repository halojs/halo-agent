import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { LucidePanelLeft, LucideSettings } from "lucide-react";
import { Fragment } from "react";
import { APP_STAGE_LABEL } from "~/env";
import { usePageMeta } from "~/hooks/use-page-meta";
import { AppSidebar } from "./app-sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from "./ui/breadcrumb";
import { Button } from "./ui/button";
import { HaloIcon, HaloTextIcon } from "./ui/icons";
import { ScrollArea } from "./ui/scroll-area";
import { Sidebar } from "./ui/sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = useLocation({ select: (loc) => loc.pathname });

  return (
    <div className="h-full flex p-2 gap-2">
      <Sidebar>
        <AppLayoutTitle />
        <AppSidebar pathname={pathname} />
      </Sidebar>
      <main className="flex flex-col grow h-full">
        <AppLayoutHeader />
        <div className="grow p-6 bg-card text-card-foreground border rounded-xl">
          <ScrollArea>{children}</ScrollArea>
        </div>
      </main>
    </div>
  );
}

function AppLayoutTitle() {
  return (
    <div className="flex-y-center h-8.5 mb-2">
      <div className="grow flex-y-center gap-4">
        <Link to="/" className="flex-y-center gap-2">
          <div className="flex-center size-6 rounded-full bg-foreground text-background">
            <HaloIcon className="w-2" />
          </div>
          <HaloTextIcon className="w-9" />
        </Link>
        <span className="px-2 text-xs uppercase bg-muted text-muted-foreground rounded-md select-none">
          <small>{APP_STAGE_LABEL}</small>
        </span>
      </div>

      <AppLayoutButton>
        <LucidePanelLeft />
      </AppLayoutButton>
    </div>
  );
}

function AppLayoutHeader() {
  const navigate = useNavigate();

  return (
    <header className="flex-y-center gap-4 h-8.5 mb-2 px-2">
      <div className="grow flex-y-center gap-2">
        <AppLayoutBreadcrumb />
      </div>

      <div className="flex-y-center gap-4">
        <AppLayoutButton onClick={() => navigate({ to: "/settings" })}>
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
              <BreadcrumbItem className={isLast ? "text-foreground font-medium" : ""}>
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

function AppLayoutButton({ children, ...props }: React.ComponentProps<"button">) {
  return (
    <Button {...props} variant="ghost" size="sm">
      {children}
    </Button>
  );
}
