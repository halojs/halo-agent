import type { ComponentType } from "react";

export function SettingsContainer({ children }: React.ComponentProps<"div">) {
  return <div className="flex flex-col gap-8">{children}</div>;
}

export function SettingsGroup({
  icon: GroupIcon,
  title,
  children,
}: React.ComponentProps<"section"> & { icon?: ComponentType<{ className?: string }> }) {
  return (
    <section className="flex flex-col gap-3">
      {title && (
        <h3 className="flex-y-center gap-2 font-heading uppercase text-xs text-muted-foreground">
          {GroupIcon && <GroupIcon className="size-4" />}
          {title}
        </h3>
      )}
      <div className="flex flex-col gap-1 rounded-lg border bg-muted p-2 divide-y divide-border">
        {children}
      </div>
    </section>
  );
}

export function SettingsSection({
  title,
  description,
  children,
}: React.ComponentProps<"div"> & {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex-y-center px-4 py-2">
      <div className="flex flex-col grow gap-1">
        <div className="font-heading text-sm">{title}</div>
        {description && <div className="text-muted-foreground text-xs">{description}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}
