import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnyRouteMatch, createRouter, type RouterHistory } from "@tanstack/react-router";
import { createElement } from "react";
import { routeTree } from "./routeTree.gen";

export function getRouter(history: RouterHistory) {
  const queryClient = new QueryClient();

  return createRouter({
    routeTree,
    history,
    context: {
      queryClient,
    },
    Wrap: ({ children }) => createElement(QueryClientProvider, { client: queryClient }, children),
    scrollRestoration: true,
    defaultPreload: "intent",
  });
}

export type AppRouter = ReturnType<typeof getRouter>;

export type PageMetaOptions = {
  title?: string | ((match: AnyRouteMatch) => string);
  breadcrumb?: string | ((match: AnyRouteMatch) => string);
};

declare module "@tanstack/react-router" {
  interface Register {
    router: AppRouter;
  }

  interface StaticDataRouteOption extends PageMetaOptions {}
}
