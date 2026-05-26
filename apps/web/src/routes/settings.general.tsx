import { RiAirplayLine, RiShareBoxLine } from "@remixicon/react";
import {
  RiMacbookLine,
  RiMoonLine,
  RiSunLine,
  RiFontSize,
  RiFolderLine,
  RiInformation2Line,
} from "@remixicon/react";
import { createFileRoute } from "@tanstack/react-router";
import { CircleFlagLanguage } from "react-circle-flags";
import {
  SettingsContainer,
  SettingsGroup,
  SettingsSection,
} from "~/components/settings/settings-layout";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { APP_BUILT_TIME, APP_STAGE_LABEL, APP_VERSION } from "~/env";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/settings/general")({
  staticData: {
    title: "General",
  },
  component: SettingsGeneralView,
});

function SettingsGeneralView() {
  return (
    <SettingsContainer>
      <SettingsAppearanceSection />
      <SettingsProjectsSection />
      <SettingsAboutSection />
    </SettingsContainer>
  );
}

const ThemeOptions: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { label: "Auto", value: "system", icon: RiMacbookLine },
  { label: "Light Mode", value: "light", icon: RiSunLine },
  { label: "Dark Mode", value: "dark", icon: RiMoonLine },
];

const AccentColorOptions: {
  label: string;
  color: string;
}[] = [
  { label: "Clay", color: "oklch(0.672 0.131 38.733)" },
  { label: "Aqua", color: "oklch(0.722 0.106 177.8)" },
  { label: "Emerald", color: "oklch(76.5% 0.177 163.223)" },
];

const FontSizeOptions: {
  label: string;
  value: string;
  className: string;
}[] = [
  { label: "Small", value: "small", className: "size-3" },
  { label: "Medium", value: "medium", className: "size-4" },
  { label: "Large", value: "large", className: "size-5" },
];

const LanguageOptions: {
  label: string;
  value: string;
}[] = [
  { label: "English", value: "en-us" },
  { label: "中文", value: "zh" },
];

function SettingsAppearanceSection() {
  return (
    <SettingsGroup title="Appearance" icon={RiAirplayLine}>
      <SettingsSection title="Themes" description="Choose your style or customize your theme.">
        <Select
          aria-label="Select theme"
          defaultValue={ThemeOptions[0]}
          itemToStringValue={(item) => item.value}
        >
          <SelectTrigger>
            <SelectValue>
              {(item) => (
                <span className="flex items-center gap-2">
                  <item.icon className="text-muted-foreground" />
                  <span className="truncate">{item.label}</span>
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectPopup>
            {ThemeOptions.map((item) => (
              <SelectItem key={item.value} value={item}>
                <span className="flex items-center gap-2">
                  <item.icon className="text-muted-foreground" />
                  <span className="truncate">{item.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>
      </SettingsSection>

      <SettingsSection title="Accent color" description="Use system or custom accent color.">
        <Select
          aria-label="Select Accent Color"
          defaultValue={AccentColorOptions[0]}
          itemToStringValue={(item) => item.color}
        >
          <SelectTrigger>
            <SelectValue>
              {(item) => (
                <span className="flex items-center gap-2">
                  <div
                    style={{ backgroundColor: item.color }}
                    className="size-4 rounded-full border-2 border-foreground"
                  />
                  <span className="truncate">{item.label}</span>
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectPopup>
            {AccentColorOptions.map((item) => (
              <SelectItem key={item.color} value={item}>
                <span className="flex items-center gap-2">
                  <div
                    style={{ backgroundColor: item.color }}
                    className="size-4 rounded-full border-2 border-foreground"
                  />
                  <span className="truncate">{item.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>
      </SettingsSection>

      <SettingsSection title="Font size" description="Use system or custom font size.">
        <Select
          aria-label="Select Font Size"
          defaultValue={FontSizeOptions[0]}
          itemToStringValue={(item) => item.value}
        >
          <SelectTrigger>
            <SelectValue>
              {(item) => (
                <span className="flex items-center gap-2">
                  <RiFontSize className={cn("text-muted-foreground", item.className)} />
                  <span className="truncate">{item.label}</span>
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectPopup>
            {FontSizeOptions.map((item) => (
              <SelectItem key={item.value} value={item}>
                <span className="flex items-center gap-2">
                  <RiFontSize className={cn("text-muted-foreground", item.className)} />
                  <span className="truncate">{item.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>
      </SettingsSection>

      <SettingsSection title="Language" description="Use system or custom language.">
        <Select
          aria-label="Select Language"
          defaultValue={LanguageOptions[0]}
          itemToStringValue={(item) => item.value}
        >
          <SelectTrigger>
            <SelectValue>
              {(item) => (
                <span className="flex items-center gap-2">
                  <CircleFlagLanguage languageCode={item.value} className="size-4" />
                  <span className="truncate">{item.label}</span>
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectPopup>
            {LanguageOptions.map((item) => (
              <SelectItem key={item.value} value={item}>
                <span className="flex items-center gap-2">
                  <CircleFlagLanguage languageCode={item.value} className="size-4" />
                  <span className="truncate">{item.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>
      </SettingsSection>
    </SettingsGroup>
  );
}

function SettingsProjectsSection() {
  return (
    <SettingsGroup title="Projects" icon={RiFolderLine}>
      <SettingsSection
        title="Add project starts in"
        description="Leave empty to use '~/' when the Add Project browser opens."
      >
        <Input placeholder="~/" />
      </SettingsSection>
    </SettingsGroup>
  );
}

function SettingsAboutSection() {
  return (
    <SettingsGroup title="About" icon={RiInformation2Line}>
      <SettingsSection title="Version" description="Current version of the application.">
        <span className="font-heading text-muted-foreground text-sm">
          v{APP_VERSION} ({APP_STAGE_LABEL})
        </span>
      </SettingsSection>
      <SettingsSection title="Built" description="Build time of the application.">
        <span className="font-heading text-muted-foreground text-sm">{APP_BUILT_TIME}</span>
      </SettingsSection>
      <SettingsSection title="Documentation" description="Show documentation in the browser.">
        <Button variant="link">
          <RiShareBoxLine />
        </Button>
      </SettingsSection>
      <SettingsSection title="Github" description="Star the repository on Github.">
        <Button variant="link">
          <RiShareBoxLine />
        </Button>
      </SettingsSection>
    </SettingsGroup>
  );
}
