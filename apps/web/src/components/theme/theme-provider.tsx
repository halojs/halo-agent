import { createContext, useContext, useMemo, useState } from "react";

type ColorMode = "light" | "dark" | "system";

interface ThemeSettings {
  colorMode: ColorMode;
  primaryColor: string;
  radius: string;
}

interface ThemeContextState extends ThemeSettings {
  setColorMode: (colorMode: ColorMode) => void;
  setPrimaryColor: (color: string) => void;
  setRadius: (radius: string) => void;
}

const initialState: ThemeContextState = {
  colorMode: "system",
  primaryColor: "",
  radius: "",
  setColorMode: () => null,
  setPrimaryColor: () => null,
  setRadius: () => null,
};

const ThemeProviderContext = createContext<ThemeContextState>(initialState);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const storageKey = "halo-theme";

  const [theme, setTheme] = useState<ThemeSettings>(() => {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : { colorMode: initialState.colorMode };
  });

  const updateTheme = (update: ThemeSettings) => {
    localStorage.setItem(storageKey, JSON.stringify(update));
    setTheme(update);
  };

  const value: ThemeContextState = useMemo(
    () => ({
      ...theme,
      setColorMode: (colorMode: ColorMode) => {
        updateTheme({ ...theme, colorMode });
      },
      setPrimaryColor: (primaryColor: string) => {
        updateTheme({ ...theme, primaryColor });
      },
      setRadius: (radius: string) => {
        updateTheme({ ...theme, radius });
      },
    }),
    [theme],
  );

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
