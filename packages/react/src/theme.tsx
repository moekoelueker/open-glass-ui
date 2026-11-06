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
  /**
   * The theme input the palette was built from, with the design's defaults
   * applied (liquid's `soft` radius). A tone scope rebuilds the opposite
   * appearance from it, so accent, contrast and radius carry over.
   */
  input: GlassThemeInput;
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

const DEFAULT_INPUT: GlassThemeInput = {};
const DEFAULT_PALETTE = /* @__PURE__ */ createGlassTheme("dark", DEFAULT_INPUT);
const DEFAULT_THEME: GlassThemeRuntime = {
  appearance: "dark",
  preference: "system",
  palette: DEFAULT_PALETTE,
  tokens: /* @__PURE__ */ createGlassThemeTokens(DEFAULT_PALETTE),
  hydrated: false,
  design: "liquid",
  input: DEFAULT_INPUT,
};

/** @internal Shared with `<Glass>`, which opens a nested scope for its tone. */
export const GlassThemeContext = /* @__PURE__ */ createContext<GlassThemeRuntime>(DEFAULT_THEME);

/** The color tokens of a palette: the part of a theme that depends on appearance. */
export type GlassToneTokens = Pick<
  GlassThemeTokens,
  Extract<keyof GlassThemeTokens, `--ogui-color-${string}`>
>;

interface ToneScope {
  runtime: GlassThemeRuntime;
  colorTokens: GlassToneTokens;
}

// Keyed by the parent runtime object, which providers memoize, so a tone scope
// is built once per theme change and keeps a stable identity across renders.
const toneScopes = /* @__PURE__ */ new WeakMap<
  GlassThemeRuntime,
  Partial<Record<GlassAppearance, ToneScope>>
>();

function colorTokensOf(tokens: GlassThemeTokens): GlassToneTokens {
  return Object.fromEntries(
    Object.entries(tokens).filter(([name]) => name.startsWith("--ogui-color-")),
  ) as unknown as GlassToneTokens;
}

/**
 * @internal The scope `<Glass>` opens when its tone differs from the
 * surrounding appearance, or `null` when the tone already matches.
 */
export function resolveToneScope(
  theme: GlassThemeRuntime,
  tone: GlassAppearance | "auto" | undefined,
): ToneScope | null {
  const appearance = tone === undefined || tone === "auto" ? theme.appearance : tone;
  if (appearance === theme.appearance) {
    return null;
  }

  let scopes = toneScopes.get(theme);
  if (!scopes) {
    scopes = {};
    toneScopes.set(theme, scopes);
  }
  const cached = scopes[appearance];
  if (cached) {
    return cached;
  }

  const palette = createGlassTheme(appearance, theme.input);
  const colorTokens = colorTokensOf(createGlassThemeTokens(palette));
  const scope: ToneScope = {
    colorTokens,
    runtime: {
      ...theme,
      appearance,
      preference: appearance,
      palette,
      // Radius and `--ogui-glass-*` look tokens do not depend on appearance,
      // so they carry over from the parent, overrides included.
      tokens: { ...theme.tokens, ...colorTokens },
    },
  };
  scopes[appearance] = scope;
  return scope;
}

/**
 * The theme a surface of the given tone resolves to: the same runtime when the
 * tone matches the theme's appearance (or is `auto`), otherwise the opposite
 * appearance built from the same theme input, with the same design and look.
 *
 * `<Glass tone>` uses this for its own subtree. Portaled surfaces can use it to
 * write the matching `tokens`, `data-ogui-appearance` and `color-scheme` on
 * their own element.
 */
export function resolveToneTheme(
  theme: GlassThemeRuntime,
  tone: GlassAppearance | "auto" | undefined,
): GlassThemeRuntime {
  return resolveToneScope(theme, tone)?.runtime ?? theme;
}

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
  const input = useMemo<GlassThemeInput>(
    () =>
      design === "liquid" && theme?.radius === undefined
        ? { ...theme, radius: "soft" }
        : (theme ?? DEFAULT_INPUT),
    [theme, design],
  );
  const palette = useMemo(() => createGlassTheme(appearance, input), [appearance, input]);
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
    () => ({ appearance, preference, palette, tokens: effectiveTokens, hydrated, design, input }),
    [appearance, preference, palette, effectiveTokens, hydrated, design, input],
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
