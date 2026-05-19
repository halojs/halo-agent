import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  staticData: {
    title: "Settings",
  },
  component: SettingsView,
});

function SettingsView() {
  return <div>Hello "/settings"!</div>;
}
