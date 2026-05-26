import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  staticData: {
    title: "Settings",
  },
  beforeLoad: async ({ location }) => {
    if (location.pathname === "/settings") {
      throw redirect({ to: "/settings/general", replace: true });
    }
  },
  component: SettingsRouteLayout,
});

function SettingsRouteLayout() {
  return (
    <div className="mx-auto w-full max-w-3xl flex flex-col gap-8">
      <Outlet />
    </div>
  );
}
