import { LucideFolderPlus } from "lucide-react";
import {
  SidebarCollapse,
  SidebarCollapseItem,
  SidebarGroup,
  SidebarGroupHeader,
} from "../ui/sidebar";

export function SidebarProjectsNav() {
  return (
    <SidebarGroup>
      <SidebarGroupHeader title="Projects">
        <LucideFolderPlus />
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
      <SidebarCollapse title="Halo Gateway">
        <SidebarCollapseItem>
          <span>Hello</span>
          <small>2d</small>
        </SidebarCollapseItem>
      </SidebarCollapse>
    </SidebarGroup>
  );
}
