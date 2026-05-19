import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: IndexPageView,
});

function IndexPageView() {
  return <div>Hello "/"!</div>;
}
