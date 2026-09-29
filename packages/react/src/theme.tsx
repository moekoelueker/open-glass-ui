import {
  createGlassLookTokens,
  createGlassTheme,
  createGlassThemeTokens,
  type GlassAppearance,
  type GlassAppearancePreference,
  type GlassDesign,
  type GlassLookTokens,
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
  /** Theme tokens plus any `--ogui-glass-*` look tokens set on this boundary. */
  tokens: GlassThemeTokens & GlassLookTokens;
  hydrated: boolean;
  /** Visual language every descendant recipe and `<Glass>` renders in. */
  design: GlassDesign;
}

export interface GlassThemeProviderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "color" | "children"> {
  children: ReactNode;
  appearance?: GlassAppearancePreference;
  defaultAppearance?: GlassAppearance;
  theme?: GlassThemeInput;
  /**
   * `liquid` (default) renders the current OpenGlass look. `classic` restores
   * the 0.3 look exactly, including its default `balanced` corner radius.
   */
  design?: GlassDesign;
}

const DEFAULT_PALETTE = createGlassTheme("dark");
const DEFAULT_THEME: GlassThemeRuntime = {
  appearance: "dark",
  preference: "system",
  palette: DEFAULT_PALETTE,
  tokens: createGlassThemeTokens(DEFAULT_PALETTE),
  hydrated: false,
  design: "liquid",
};

const GlassThemeContext = /* @__PURE__ */ createContext<GlassThemeRuntime>(DEFAULT_THEME);

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
  design = "liquid",
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
  // Liquid reads best with larger, concentric corners, so it defaults to the
  // `soft` scale. An explicit `theme.radius` always wins, and `classic` keeps
  // the 0.3 default of `balanced`.
  const palette = useMemo(
    () =>
      createGlassTheme(
        appearance,
        design === "liquid" && theme?.radius === undefined ? { ...theme, radius: "soft" } : theme,
      ),
    [appearance, theme, design],
  );
  const glass = theme?.glass;
  const lookKey = typeof glass === "string" ? glass : JSON.stringify(glass ?? null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: lookKey is a stable serialization of glass, so inline look objects do not re-create tokens every render.
  const lookTokens = useMemo(
    () => (glass === undefined ? {} : createGlassLookTokens(glass)),
    [lookKey],
  );
  const tokens = useMemo(
    () => ({ ...createGlassThemeTokens(palette), ...lookTokens }),
    [palette, lookTokens],
  );
  const effectiveTokens = useMemo(() => {
    const styleValues = (style ?? {}) as Record<string, string | number | undefined>;
    return Object.fromEntries(
      Object.entries(tokens).map(([name, value]) => [
        name,
        styleValues[name] === undefined ? value : String(styleValues[name]),
      ]),
    ) as unknown as GlassThemeTokens & GlassLookTokens;
  }, [style, tokens]);
  const runtime = useMemo<GlassThemeRuntime>(
    () => ({ appearance, preference, palette, tokens: effectiveTokens, hydrated, design }),
    [appearance, preference, palette, effectiveTokens, hydrated, design],
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
        data-ogui-design={design}
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
