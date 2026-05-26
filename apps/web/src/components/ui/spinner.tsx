import type React from "react";
import { RiLoaderLine } from "@remixicon/react";
import { cn } from "~/lib/utils";

export function Spinner({
  className,
  ...props
}: React.ComponentProps<typeof RiLoaderLine>): React.ReactElement {
  return (
    <RiLoaderLine
      aria-label="Loading"
      className={cn("animate-spin", className)}
      role="status"
      {...props}
    />
  );
}
