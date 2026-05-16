import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  staticData: {
    title: "Welcome",
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/"!</div>;
}
