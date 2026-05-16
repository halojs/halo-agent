import { useMemo } from "react";

export const kbdKeysMap = {
  win: "⊞",
  command: "⌘",
  shift: "⇧",
  control: "⌃",
  option: "⌥",
  enter: "↵",
  delete: "⌦",
  backspace: "⌫",
  escape: "Esc",
  tab: "⇥",
  capsLock: "⇪",
  arrowUp: "↑",
  arrowRight: "→",
  arrowDown: "↓",
  arrowLeft: "←",
  pageup: "⇞",
  pagedown: "⇟",
  home: "↖",
  end: "↘",
};

export type KbdKey = keyof typeof kbdKeysMap;

export function useKbd() {
  const isMac = useMemo(() => {
    if (typeof window === "undefined") return false;
    return /Macintosh/.test(navigator.userAgent);
  }, []);

  const specificMap = useMemo(
    () => ({
      meta: isMac ? kbdKeysMap.command : "Ctrl",
      ctrl: isMac ? kbdKeysMap.control : "Ctrl",
      alt: isMac ? kbdKeysMap.option : "Alt",
    }),
    [isMac],
  );

  const getKbdKey = (value?: KbdKey | string) => {
    if (!value) return "";

    if (value === "meta" || value === "alt" || value === "ctrl") {
      return specificMap[value as keyof typeof specificMap];
    }

    return kbdKeysMap[value as KbdKey] || value;
  };

  return {
    isMac,
    getKbdKey,
  };
}
