import {
  createGlassTheme,
  createGlassThemeTokens,
  type GlassAppearance,
  type GlassAppearancePreference,
  type GlassThemeInput,
  type GlassThemePalette,
  type GlassThemeTokens,
} from "@open-glass-ui/core";
import {
  type CSSProperties,
  createContext,
  type HTMLAttributes,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface GlassThemeRuntime {
  appearance: GlassAppearance;
  preference: GlassAppearancePreference;
  palette: GlassThemePalette;
  tokens: GlassThemeTokens;
  hydrated: boolean;
}

export interface GlassThemeProviderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "color" | "children"> {
  children: ReactNode;
  appearance?: GlassAppearancePreference;
  defaultAppearance?: GlassAppearance;
  theme?: GlassThemeInput;
}

const DEFAULT_PALETTE = createGlassTheme("dark");
const DEFAULT_THEME: GlassThemeRuntime = {
  appearance: "dark",
  preference: "system",
  palette: DEFAULT_PALETTE,
  tokens: createGlassThemeTokens(DEFAULT_PALETTE),
  hydrated: false,
};

const GlassThemeContext = createContext<GlassThemeRuntime>(DEFAULT_THEME);

function readSystemAppearance(): GlassAppearance {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "dark";
  }
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function GlassThemeProvider({
  children,
  appearance: preference = "system",
  defaultAppearance = "dark",
  theme,
  className,
  style,
  ...props
}: GlassThemeProviderProps) {
  const [systemAppearance, setSystemAppearance] = useState<GlassAppearance>(defaultAppearance);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (preference !== "system") {
      setHydrated(true);
      return;
    }

    const query = window.matchMedia("(prefers-color-scheme: light)");
    const update = () => {
      setSystemAppearance(readSystemAppearance());
      setHydrated(true);
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [preference]);

  const appearance = preference === "system" ? systemAppearance : preference;
  const palette = useMemo(() => createGlassTheme(appearance, theme), [appearance, theme]);
  const tokens = useMemo(() => createGlassThemeTokens(palette), [palette]);
  const effectiveTokens = useMemo(() => {
    const styleValues = (style ?? {}) as Record<string, string | number | undefined>;
    return Object.fromEntries(
      Object.entries(tokens).map(([name, value]) => [
        name,
        styleValues[name] === undefined ? value : String(styleValues[name]),
      ]),
    ) as unknown as GlassThemeTokens;
  }, [style, tokens]);
  const runtime = useMemo<GlassThemeRuntime>(
    () => ({ appearance, preference, palette, tokens: effectiveTokens, hydrated }),
    [appearance, preference, palette, effectiveTokens, hydrated],
  );
  const mergedStyle = {
    ...effectiveTokens,
    colorScheme: appearance,
    color: "var(--ogui-color-text)",
    ...style,
  } as CSSProperties;

  return (
    <GlassThemeContext.Provider value={runtime}>
      <div
        {...props}
        className={["ogui-theme", className].filter(Boolean).join(" ")}
        data-ogui-theme=""
        data-ogui-appearance={appearance}
        data-ogui-theme-hydrated={hydrated ? "true" : "false"}
        style={mergedStyle}
      >
        {children}
      </div>
    </GlassThemeContext.Provider>
  );
}

export function useGlassTheme() {
  return useContext(GlassThemeContext);
}
