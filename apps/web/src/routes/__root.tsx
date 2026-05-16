import { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Outlet } from "@tanstack/react-router";
import { AppLayout } from "~/components/app-layout";
import { ThemeProvider } from "~/components/theme/theme-provider";
import { ToastProvider } from "~/components/ui/toast";
import { TooltipProvider } from "~/components/ui/tooltip";
import { APP_DISPLAY_NAME } from "~/env";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  staticData: {
    title: APP_DISPLAY_NAME,
  },
  component: RootRouteLayout,
});

function RootRouteLayout() {
  return (
    <>
      <HeadContent />
      <ThemeProvider>
        <TooltipProvider>
          <ToastProvider>
            <AppLayout>
              <Outlet />
            </AppLayout>
          </ToastProvider>
        </TooltipProvider>
      </ThemeProvider>
    </>
  );
}
