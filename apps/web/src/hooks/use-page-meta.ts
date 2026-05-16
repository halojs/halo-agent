import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { APP_DISPLAY_NAME } from "~/env";

interface UsePageMetaOptions {
  includeRoot?: boolean;
}

export function usePageMeta(options?: UsePageMetaOptions) {
  const { includeRoot = false } = options || {};
  const matches = useRouterState().matches;

  const breadcrumbs = matches
    .filter(
      (m) =>
        (!includeRoot ? m.id !== "__root__/" : true) &&
        (m.staticData?.breadcrumb !== undefined || m.staticData?.title !== undefined),
    )
    .map((breadcrumb) => {
      const item = breadcrumb.staticData?.breadcrumb || breadcrumb.staticData?.title;
      const label = typeof item === "function" ? item(breadcrumb) : item;

      return {
        label,
        path: breadcrumb.pathname,
      };
    });

  const current = matches[matches.length - 1];
  const item = current?.staticData?.breadcrumb || current?.staticData?.title || APP_DISPLAY_NAME;
  const documentTitle = current && typeof item === "function" ? item(current) : (item as string);

  useEffect(() => {
    document.title =
      documentTitle !== APP_DISPLAY_NAME
        ? `${documentTitle} - ${APP_DISPLAY_NAME}`
        : APP_DISPLAY_NAME;
  }, [documentTitle]);

  return { breadcrumbs, documentTitle };
}
