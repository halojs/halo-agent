import { LucideInfo, LucideBotMessageSquare, LucideCog } from "lucide-react";
import { ComponentType } from "react";
import { SidebarGroup, SidebarItem } from "../ui/sidebar";

type SettingsSectionPath = "/settings/general" | "/settings/providers" | "/settings/info";

const SETTINGS_NAV_ITEMS: ReadonlyArray<{
  label: string;
  to: SettingsSectionPath;
  icon: ComponentType<{ className?: string }>;
}> = [
  { label: "General", to: "/settings/general", icon: LucideCog },
  { label: "Providers", to: "/settings/providers", icon: LucideBotMessageSquare },
  { label: "Info", to: "/settings/info", icon: LucideInfo },
];

export function SettingsSidebarNav({ pathname }: { pathname: string }) {
  return (
    <SidebarGroup>
      {SETTINGS_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.to;

        return (
          <SidebarItem key={item.to} active={isActive}>
            <Icon />
            {item.label}
          </SidebarItem>
        );
      })}
    </SidebarGroup>
  );
}
