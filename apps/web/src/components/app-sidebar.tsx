import type { ComponentType } from "react";
import {
  RiBookShelfLine,
  RiEqualizer2Line,
  RiFolderAddLine,
  RiRobot2Line,
  RiPulseLine,
  RiStackLine,
  RiSettingsLine,
  RiFlaskLine,
  RiGitBranchLine,
  RiSlashCommands2,
} from "@remixicon/react";
import { useNavigate } from "@tanstack/react-router";
import { MCPIcon } from "./ui/icons";
import {
  SidebarCollapse,
  SidebarCollapseItem,
  SidebarGroup,
  SidebarGroupHeader,
  SidebarItem,
} from "./ui/sidebar";

export function AppSidebar({ pathname }: { pathname: string }) {
  const isOpenSettings = pathname.startsWith("/settings");

  return isOpenSettings ? (
    <SidebarSettingsNav pathname={pathname} />
  ) : (
    <SidebarMainNav pathname={pathname} />
  );
}

function SidebarMainNav({ pathname }: { pathname: string }) {
  return (
    <>
      <ProjectsNav />
      <MainNav pathname={pathname} />
      <SecondaryNav />
    </>
  );
}

function ProjectsNav() {
  return (
    <SidebarGroup>
      <SidebarGroupHeader title="Projects">
        <RiFolderAddLine />
      </SidebarGroupHeader>
      <SidebarCollapse title="Halo Agent">
        <SidebarCollapseItem active={true}>
          <div className="flex flex-y-center truncate">
            <span className="size-2 mr-2 bg-cyan-400" />
            Create an Effect
          </div>
          <small>2d</small>
        </SidebarCollapseItem>
      </SidebarCollapse>
    </SidebarGroup>
  );
}

const MAIN_NAV_ITEMS: ReadonlyArray<{
  label: string;
  to: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { label: "Knowledge Base", to: "/knowledge", icon: RiBookShelfLine },
  { label: "Activity", to: "/activity", icon: RiPulseLine },
];

function MainNav({ pathname }: { pathname: string }) {
  const navigate = useNavigate();

  return (
    <SidebarGroup className="grow">
      {MAIN_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.to;

        return (
          <SidebarItem key={item.to} active={isActive} onClick={() => navigate({ to: item.to })}>
            <Icon />
            {item.label}
          </SidebarItem>
        );
      })}
    </SidebarGroup>
  );
}

function SecondaryNav() {
  const navigate = useNavigate();
  return (
    <SidebarItem onClick={() => navigate({ to: "/settings" })}>
      <RiSettingsLine />
      Settings
    </SidebarItem>
  );
}

const SETTINGS_NAV_ITEMS: ReadonlyArray<{
  label: string;
  to: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { label: "General", to: "/settings/general", icon: RiEqualizer2Line },
  { label: "Models", to: "/settings/models", icon: RiStackLine },
  { label: "Agents", to: "/settings/agents", icon: RiRobot2Line },
  { label: "MCP Servers", to: "/settings/mcp-servers", icon: MCPIcon },
  { label: "Skills", to: "/settings/skills", icon: RiSlashCommands2 },
  { label: "Version Control", to: "/settings/version-control", icon: RiGitBranchLine },
  { label: "Betas", to: "/settings/betas", icon: RiFlaskLine },
];

function SidebarSettingsNav({ pathname }: { pathname: string }) {
  const navigate = useNavigate();

  return (
    <SidebarGroup>
      {SETTINGS_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.to;

        return (
          <SidebarItem key={item.to} active={isActive} onClick={() => navigate({ to: item.to })}>
            <Icon />
            {item.label}
          </SidebarItem>
        );
      })}
    </SidebarGroup>
  );
}
