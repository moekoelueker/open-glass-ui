import type {
  GlassAppearancePreference,
  GlassRadius,
  GlassThemeInput,
  GlassThemePreset,
} from "@open-glass-ui/core";
import { Glass, GlassThemeProvider, useGlassTheme } from "@open-glass-ui/react";
import {
  Accordion,
  Alert,
  Avatar,
  AvatarGroup,
  Badge,
  Banner,
  Breadcrumbs,
  Button,
  Card,
  Checkbox,
  Dialog,
  Dock,
  Drawer,
  FileDropzone,
  IconButton,
  MediaControls,
  Menu,
  MenuItem,
  Meter,
  NumberField,
  Pagination,
  Popover,
  Progress,
  RadioGroup,
  SearchField,
  SegmentedControl,
  Select,
  Skeleton,
  Slider,
  Spinner,
  Stat,
  Stepper,
  Switch,
  Tabs,
  Textarea,
  TextField,
  Toast,
  ToggleButton,
  Toolbar,
  Tooltip,
} from "@open-glass-ui/recipes";
import { type CSSProperties, type ReactNode, useEffect, useMemo, useState } from "react";
import { EnvironmentBackdrop, WebGLBackdrop } from "./engine-visuals";
import { Icon } from "./icons";
import { AppLink } from "./navigation";
import { Footer, SiteHeader } from "./pages";

export type AtlasVariant = "hybrid" | "css" | "webgl";

export type ComponentAtlasPageProps =
  | {
      variant: "hybrid";
      product: true;
    }
  | {
      variant: AtlasVariant;
      product?: false;
    };

interface AtlasThemeState {
  appearance: GlassAppearancePreference;
  preset: GlassThemePreset;
  radius: GlassRadius;
  accent?: string;
  secondary?: string;
  tertiary?: string;
}

const THEME_PRESETS: readonly GlassThemePreset[] = [
  "neutral",
  "cobalt",
  "teal",
  "violet",
  "coral",
  "amber",
];

function readAtlasThemeState(): AtlasThemeState {
  const fallback: AtlasThemeState = {
    appearance: "system",
    preset: "neutral",
    radius: "balanced",
  };
  if (typeof window === "undefined") {
    return fallback;
  }

  const search = new URLSearchParams(window.location.search);
  const appearance = search.get("appearance");
  const preset = search.get("preset");
  const radius = search.get("radius");
  const readColor = (name: string) => {
    const value = search.get(name);
    return value && /^#[\da-f]{6}$/i.test(value) ? value : undefined;
  };
  const accent = readColor("accent");
  const secondary = readColor("secondary");
  const tertiary = readColor("tertiary");

  return {
    appearance:
      appearance === "dark" || appearance === "light" || appearance === "system"
        ? appearance
        : fallback.appearance,
    preset: THEME_PRESETS.includes(preset as GlassThemePreset)
      ? (preset as GlassThemePreset)
      : fallback.preset,
    radius:
      radius === "sharp" || radius === "balanced" || radius === "soft" ? radius : fallback.radius,
    ...(accent ? { accent } : {}),
    ...(secondary ? { secondary } : {}),
    ...(tertiary ? { tertiary } : {}),
  };
}

interface RankingEntry {
  id: "hybrid" | "css" | "webgl" | "organic" | "sdf";
  name: string;
  role: string;
  visual: number;
  flexibility: number;
  integration: number;
  performance: number;
  resilience: number;
  verdict: string;
}

export const RANKINGS: readonly RankingEntry[] = [
  {
    id: "hybrid",
    name: "Adaptive Hybrid",
    role: "Best overall",
    visual: 9.2,
    flexibility: 9.8,
    integration: 9.7,
    performance: 8.5,
    resilience: 10,
    verdict: "The premium default: rich when capable, dependable everywhere.",
  },
  {
    id: "css",
    name: "Native CSS",
    role: "Best foundation",
    visual: 8.7,
    flexibility: 9.8,
    integration: 9.6,
    performance: 10,
    resilience: 10,
    verdict: "The easiest engine to ship, theme, inspect, and let agents extend.",
  },
  {
    id: "webgl",
    name: "Spectral WebGL",
    role: "Best spectacle",
    visual: 9.7,
    flexibility: 7.8,
    integration: 7.8,
    performance: 6.5,
    resilience: 8.5,
    verdict: "The visual ceiling, reserved for hero surfaces and controlled media.",
  },
  {
    id: "organic",
    name: "Organic SVG",
    role: "Expressive specialist",
    visual: 9.5,
    flexibility: 7.5,
    integration: 8,
    performance: 7,
    resilience: 9,
    verdict: "Beautiful motion language, but visually noisy at full-library scale.",
  },
  {
    id: "sdf",
    name: "SDF Optics",
    role: "Geometry specialist",
    visual: 8.6,
    flexibility: 8.8,
    integration: 8.5,
    performance: 8,
    resilience: 9,
    verdict: "Excellent optical geometry with a more technical authoring surface.",
  },
] as const;

function weightedScore(entry: RankingEntry) {
  return (
    entry.visual * 0.5 +
    entry.flexibility * 0.2 +
    entry.integration * 0.15 +
    entry.performance * 0.1 +
    entry.resilience * 0.05
  );
}

const ATLAS_META: Record<
  AtlasVariant,
  {
    rank: string;
    eyebrow: string;
    title: string;
    description: string;
    metric: string;
    environment: "photo" | "motion";
  }
> = {
  hybrid: {
    rank: "01",
    eyebrow: "Adaptive policy engine",
    title: "One interface. The right glass for the moment.",
    description:
      "A production system that routes spectacle to hero moments and keeps every control crisp, native, and resilient.",
    metric: "94 / 100",
    environment: "motion",
  },
  css: {
    rank: "02",
    eyebrow: "Native browser material",
    title: "Editorial restraint, rendered everywhere.",
    description:
      "A low-cost CSS system with strong hierarchy, direct theming, and zero custom graphics runtime for everyday interface work.",
    metric: "93 / 100",
    environment: "photo",
  },
  webgl: {
    rank: "03",
    eyebrow: "Spectral optical stage",
    title: "Maximum presence. Deliberately contained.",
    description:
      "True source-aware refraction and chromatic separation in one cinematic stage, with DOM components layered above it.",
    metric: "87 / 100",
    environment: "motion",
  },
};

function ScoreBar({ value }: { value: number }) {
  return (
    <span className="rank-score">
      <span style={{ "--score": `${value * 10}%` } as CSSProperties} />
      <output>{value.toFixed(1)}</output>
    </span>
  );
}

export function ComponentAtlasHome() {
  return (
    <div className="site-shell ranking-page">
      <SiteHeader section="library" />
      <main id="main-content" tabIndex={-1}>
        <section className="ranking-hero">
          <div>
            <span className="section-kicker">Weighted decision / 2026.07</span>
            <h1>
              Five engines.
              <br />
              Three make the cut.
            </h1>
          </div>
          <div className="ranking-hero__weight">
            <strong>50%</strong>
            <span>Visual appeal</span>
            <p>
              Beauty carries half the score. Flexibility, integration, performance, and resilience
              decide whether that beauty belongs in a library.
            </p>
          </div>
        </section>

        <section className="ranking-method" aria-labelledby="ranking-heading">
          <div className="ranking-method__intro">
            <span className="section-index">A</span>
            <div>
              <p className="section-kicker">The verdict</p>
              <h2 id="ranking-heading">Weighted for real use, not a still frame.</h2>
            </div>
            <p>
              Scores combine visual quality 50%, flexibility 20%, AI and integration ergonomics 15%,
              browser cost 10%, and accessibility/cross-browser resilience 5%.
            </p>
          </div>
          <table className="ranking-table">
            <caption>Liquid glass engine ranking</caption>
            <thead>
              <tr className="ranking-row ranking-row--head">
                <th scope="col">Rank / engine</th>
                <th scope="col">Visual · 50%</th>
                <th scope="col">Flexible · 20%</th>
                <th scope="col">AI / DX · 15%</th>
                <th scope="col">Perf · 10%</th>
                <th scope="col">Final</th>
              </tr>
            </thead>
            <tbody>
              {RANKINGS.map((entry, index) => {
                const topThree = index < 3;
                return (
                  <tr className="ranking-row" key={entry.id}>
                    <th scope="row" className="ranking-name">
                      <span>0{index + 1}</span>
                      <span>
                        <strong>{entry.name}</strong>
                        <small>{entry.role}</small>
                      </span>
                    </th>
                    <td>
                      <ScoreBar value={entry.visual} />
                    </td>
                    <td>
                      <ScoreBar value={entry.flexibility} />
                    </td>
                    <td>
                      <ScoreBar value={entry.integration} />
                    </td>
                    <td>
                      <ScoreBar value={entry.performance} />
                    </td>
                    <td className="ranking-final">
                      <strong>{weightedScore(entry).toFixed(2)}</strong>
                      {topThree ? (
                        <AppLink
                          href={`/library/${entry.id}`}
                          aria-label={`Open ${entry.name} atlas`}
                        >
                          Open 40 <Icon name="arrow" />
                        </AppLink>
                      ) : (
                        <span>Specialist</span>
                      )}
                    </td>
                    <td colSpan={6} className="ranking-verdict">
                      {entry.verdict}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section className="ranking-podium" aria-labelledby="podium-heading">
          <div className="section-heading section-heading--line">
            <div>
              <span className="section-index">B</span>
              <p className="section-kicker">The finalists</p>
            </div>
            <h2 id="podium-heading">The same 40 components. Three material strategies.</h2>
          </div>
          <div className="podium-grid">
            {RANKINGS.slice(0, 3).map((entry, index) => (
              <AppLink
                href={`/library/${entry.id}`}
                className={`podium-card podium-card--${entry.id}`}
                key={entry.id}
              >
                <span>0{index + 1}</span>
                <div className="podium-card__lens" aria-hidden="true">
                  <i />
                </div>
                <div>
                  <small>{entry.role}</small>
                  <h3>{entry.name}</h3>
                  <p>{entry.verdict}</p>
                </div>
                <strong>{weightedScore(entry).toFixed(2)}</strong>
              </AppLink>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function AtlasNav({ active }: { active: AtlasVariant }) {
  return (
    <nav className="atlas-nav" aria-label="Component atlas variants">
      <AppLink href="/library">Ranking</AppLink>
      {(Object.keys(ATLAS_META) as AtlasVariant[]).map((id) => (
        <AppLink
          href={`/library/${id}`}
          className={active === id ? "is-active" : undefined}
          key={id}
        >
          <span>{ATLAS_META[id].rank}</span>
          {id}
        </AppLink>
      ))}
    </nav>
  );
}

function AtlasHero({ variant, product = false }: { variant: AtlasVariant; product?: boolean }) {
  const meta = ATLAS_META[variant];
  const title = product ? "One system. Forty components. Built to adapt." : meta.title;
  const description = product
    ? "Accessible React components share one neutral theme contract, native DOM semantics, and a CSS-first material that progressively enhances when the surface allows it."
    : meta.description;
  const metric = product ? "40 / 40" : meta.metric;

  return (
    <section className="atlas-hero">
      <div className="atlas-hero__copy">
        <span className="section-kicker">
          {product ? "OpenGlass UI / Component system" : `Rank ${meta.rank} / ${meta.eyebrow}`}
        </span>
        <h1>{title}</h1>
        <p>{description}</p>
        <div>
          <Badge tone="positive">
            {product ? "40 interactive components" : "40 production recipes"}
          </Badge>
          <span>
            {product
              ? "React 18+ · native DOM · neutral by default"
              : "React 19 · native DOM · adaptive motion"}
          </span>
        </div>
      </div>
      <div className="atlas-hero__scene">
        {variant === "webgl" ? (
          <WebGLBackdrop intensity={0.88} dispersion material="clear" motion />
        ) : (
          <EnvironmentBackdrop environment={meta.environment} />
        )}
        <Glass className="atlas-hero__glass" material="clear" tone="dark" interactive>
          <div className="atlas-hero__glass-meta">
            <span>OPENGLASS / {product ? "COMPONENTS" : variant.toUpperCase()}</span>
            <i aria-hidden="true" />
            <span>LIVE</span>
          </div>
          <strong>{metric}</strong>
          <p>{product ? "Interactive React recipes" : "Weighted library score"}</p>
          <Progress
            label={product ? "Component coverage" : "Capability fit"}
            value={product ? 100 : variant === "hybrid" ? 98 : variant === "css" ? 95 : 82}
          />
        </Glass>
        {variant === "hybrid" ? (
          <div className="atlas-policy" aria-hidden="true">
            <span>{product ? "BASELINE" : "HERO"}</span>
            <strong>{product ? "SEMANTIC" : "WEBGL"}</strong>
            <i />
            <span>{product ? "MOTION" : "CONTROL"}</span>
            <strong>{product ? "SYSTEM" : "CSS"}</strong>
            <i />
            <span>{product ? "CONTRAST" : "FALLBACK"}</span>
            <strong>{product ? "HIGH" : "OPAQUE"}</strong>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Specimen({
  number,
  name,
  detail,
  children,
  wide = false,
}: {
  number: number;
  name: string;
  detail: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <article
      className={`atlas-specimen${wide ? " atlas-specimen--wide" : ""}`}
      style={{ "--specimen-index": number } as CSSProperties}
      data-component={name}
      data-component-name={name}
    >
      <header>
        <span>{String(number).padStart(2, "0")}</span>
        <div>
          <h3>{name}</h3>
          <p>{detail}</p>
        </div>
        <code>{`<${name} />`}</code>
      </header>
      <div className="atlas-specimen__stage">{children}</div>
    </article>
  );
}

function Category({
  index,
  kicker,
  title,
  children,
}: {
  index: string;
  kicker: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="atlas-category" aria-labelledby={`atlas-${index}`}>
      <div className="atlas-category__heading">
        <span className="section-index">{index}</span>
        <p className="section-kicker">{kicker}</p>
        <h2 id={`atlas-${index}`}>{title}</h2>
      </div>
      <div className="atlas-grid">{children}</div>
    </section>
  );
}

function AtlasThemeStudio({
  value,
  onChange,
  onReset,
}: {
  value: AtlasThemeState;
  onChange: (next: AtlasThemeState) => void;
  onReset: () => void;
}) {
  const { palette } = useGlassTheme();

  return (
    <section className="atlas-theme-studio" aria-labelledby="atlas-theme-heading">
      <div className="atlas-theme-studio__intro">
        <span className="section-index">T</span>
        <div>
          <p className="section-kicker">Live theme contract</p>
          <h2 id="atlas-theme-heading">Neutral by default. Yours in seconds.</h2>
        </div>
        <p>
          Every control below updates the same semantic tokens consumers receive. Contrast-safe ink
          is derived automatically from the accent.
        </p>
      </div>

      <div className="atlas-theme-studio__controls">
        <fieldset>
          <legend>Appearance</legend>
          <SegmentedControl
            aria-label="Theme appearance"
            value={value.appearance}
            onValueChange={(appearance) => onChange({ ...value, appearance })}
            items={[
              { value: "system", label: "System" },
              { value: "dark", label: "Dark" },
              { value: "light", label: "Light" },
            ]}
          />
        </fieldset>

        <Select
          label="Accent preset"
          name="theme-preset"
          value={value.preset}
          onChange={(event) =>
            onChange({
              appearance: value.appearance,
              preset: event.currentTarget.value as GlassThemePreset,
              radius: value.radius,
            })
          }
          options={THEME_PRESETS.map((preset) => ({
            value: preset,
            label: `${preset[0]?.toUpperCase()}${preset.slice(1)}`,
          }))}
        />

        <Select
          label="Corner language"
          name="theme-radius"
          value={value.radius}
          onChange={(event) =>
            onChange({ ...value, radius: event.currentTarget.value as GlassRadius })
          }
          options={[
            { value: "sharp", label: "Sharp" },
            { value: "balanced", label: "Balanced" },
            { value: "soft", label: "Soft" },
          ]}
        />

        <label className="atlas-color-control">
          <span>
            Accent
            <code>{palette.accent}</code>
          </span>
          <input
            type="color"
            name="theme-accent"
            value={palette.accent}
            onChange={(event) => onChange({ ...value, accent: event.currentTarget.value })}
          />
        </label>

        <label className="atlas-color-control">
          <span>
            Secondary
            <code>{palette.secondary}</code>
          </span>
          <input
            type="color"
            name="theme-secondary"
            value={palette.secondary}
            onChange={(event) => onChange({ ...value, secondary: event.currentTarget.value })}
          />
        </label>

        <label className="atlas-color-control">
          <span>
            Tertiary
            <code>{palette.tertiary}</code>
          </span>
          <input
            type="color"
            name="theme-tertiary"
            value={palette.tertiary}
            onChange={(event) => onChange({ ...value, tertiary: event.currentTarget.value })}
          />
        </label>
      </div>

      <div className="atlas-theme-studio__result">
        <div className="atlas-theme-swatch" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <dl>
          <div>
            <dt>Foreground</dt>
            <dd>{palette.accentInk}</dd>
          </div>
          <div>
            <dt>Contrast</dt>
            <dd>{palette.accentContrast.toFixed(2)}:1</dd>
          </div>
          <div>
            <dt>Runtime</dt>
            <dd>CSS-first</dd>
          </div>
        </dl>
        <Button variant="quiet" onClick={onReset}>
          Reset neutral theme
        </Button>
      </div>
    </section>
  );
}

export function ComponentAtlasPage(props: ComponentAtlasPageProps) {
  const { variant } = props;
  const product = props.product === true;
  const [themeState, setThemeState] = useState<AtlasThemeState>(readAtlasThemeState);
  const [page, setPage] = useState(2);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(42);
  const [muted, setMuted] = useState(false);
  const [step, setStep] = useState(1);
  const [alertVisible, setAlertVisible] = useState(true);
  const [search, setSearch] = useState("Refraction");
  const [quantity, setQuantity] = useState(3);
  const [cardSelected, setCardSelected] = useState(false);
  const theme = useMemo<GlassThemeInput>(
    () => ({
      preset: themeState.preset,
      radius: themeState.radius,
      contrast: "high",
      ...(themeState.accent ? { accent: themeState.accent } : {}),
      ...(themeState.secondary ? { secondary: themeState.secondary } : {}),
      ...(themeState.tertiary ? { tertiary: themeState.tertiary } : {}),
    }),
    [
      themeState.accent,
      themeState.preset,
      themeState.radius,
      themeState.secondary,
      themeState.tertiary,
    ],
  );

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("appearance", themeState.appearance);
    url.searchParams.set("preset", themeState.preset);
    url.searchParams.set("radius", themeState.radius);
    for (const color of ["accent", "secondary", "tertiary"] as const) {
      const value = themeState[color];
      if (value) {
        url.searchParams.set(color, value);
      } else {
        url.searchParams.delete(color);
      }
    }
    window.history.replaceState(window.history.state, "", url);
  }, [themeState]);

  return (
    <GlassThemeProvider
      appearance={themeState.appearance}
      theme={theme}
      className={`site-shell atlas-page atlas--${variant}${product ? " atlas-page--product" : ""}`}
      data-catalog-mode={product ? "product" : "comparison"}
    >
      <SiteHeader section="library" />
      {product ? null : <AtlasNav active={variant} />}
      <main id="main-content" tabIndex={-1}>
        <AtlasHero variant={variant} product={product} />
        <div className="atlas-manifest">
          <div>
            <span>40</span>
            <small>Components</small>
          </div>
          <div>
            <span>{product ? "3" : "6"}</span>
            <small>{product ? "Materials" : "Families"}</small>
          </div>
          <p>
            {product
              ? "Every specimen is live. Tab through it, change it, open it, and stress it. Theme and material can change without giving up the semantic React contract."
              : "Every specimen is live. Tab through it, change it, open it, and stress it. The optical treatment changes; the React contract does not."}
          </p>
          <code>pnpm add open-glass-ui</code>
        </div>
        <AtlasThemeStudio
          value={themeState}
          onChange={setThemeState}
          onReset={() =>
            setThemeState({ appearance: "system", preset: "neutral", radius: "balanced" })
          }
        />

        <Category
          index="A"
          kicker="Action primitives"
          title="Controls should feel physical, not heavy."
        >
          <Specimen number={1} name="Button" detail="Four intent levels, three sizes.">
            <div className="specimen-row">
              <Button variant="primary">Create surface</Button>
              <Button variant="secondary">Preview</Button>
              <Button variant="quiet">Cancel</Button>
            </div>
          </Specimen>
          <Specimen number={2} name="IconButton" detail="Compact action with an explicit name.">
            <div className="specimen-row">
              <IconButton aria-label="Tune optics">
                <Icon name="tune" />
              </IconButton>
              <IconButton aria-label="Generate material" variant="primary">
                <Icon name="spark" />
              </IconButton>
              <IconButton aria-label="More actions">
                <Icon name="more" />
              </IconButton>
            </div>
          </Specimen>
          <Specimen
            number={3}
            name="SegmentedControl"
            detail="A tactile, single-choice mode switch."
          >
            <SegmentedControl
              aria-label="View density"
              defaultValue="balanced"
              items={[
                { value: "quiet", label: "Quiet" },
                { value: "balanced", label: "Balanced" },
                { value: "vivid", label: "Vivid" },
              ]}
            />
          </Specimen>
          <Specimen number={4} name="Switch" detail="Immediate boolean settings.">
            <Switch
              label="Spectral highlights"
              description="Adds edge dispersion to premium surfaces."
              defaultChecked
            />
          </Specimen>
          <Specimen number={5} name="Slider" detail="Native range input with live output.">
            <Slider label="Refraction" min={0} max={100} defaultValue={68} unit="%" />
          </Specimen>
          <Specimen number={6} name="Toolbar" detail="Related commands in a glass group.">
            <Toolbar label="Canvas tools">
              <IconButton aria-label="Grid view" size="small">
                <Icon name="grid" />
              </IconButton>
              <IconButton aria-label="Auto enhance" size="small">
                <Icon name="spark" />
              </IconButton>
              <IconButton aria-label="Tune" size="small">
                <Icon name="tune" />
              </IconButton>
            </Toolbar>
          </Specimen>
          <Specimen number={7} name="Dock" detail="A compact navigation landmark.">
            <Dock label="Workspace dock">
              <IconButton aria-label="Open grid" size="small">
                <Icon name="grid" />
              </IconButton>
              <IconButton aria-label="Create new" size="small" variant="primary">
                <Icon name="spark" />
              </IconButton>
              <IconButton aria-label="Open tuning" size="small">
                <Icon name="tune" />
              </IconButton>
            </Dock>
          </Specimen>
          <Specimen number={8} name="Tabs" detail="Keyboard-complete content navigation." wide>
            <Tabs
              label="Material inspector"
              defaultValue="optics"
              items={[
                { value: "optics", label: "Optics", content: "Blur 24px · Tint 12% · Edge 34%" },
                { value: "motion", label: "Motion", content: "Spring 180ms · Damping 0.82" },
                { value: "access", label: "Access", content: "Contrast 7.1:1 · Motion follows OS" },
              ]}
            />
          </Specimen>
          <Specimen number={9} name="Menu" detail="Dismissible command surface.">
            <Menu
              label="Open actions"
              trigger={
                <Button variant="secondary" trailingIcon={<Icon name="chevron" />}>
                  Actions
                </Button>
              }
            >
              <MenuItem>Duplicate material</MenuItem>
              <MenuItem>Copy token JSON</MenuItem>
              <MenuItem destructive>Delete preset</MenuItem>
            </Menu>
          </Specimen>
          <Specimen number={10} name="MenuItem" detail="Semantic commands, including danger.">
            <div className="specimen-menu" role="menu" aria-label="Static menu item sample">
              <MenuItem>Pin to library</MenuItem>
              <MenuItem destructive>Remove source</MenuItem>
            </div>
          </Specimen>
          <Specimen number={11} name="Popover" detail="Context without navigation.">
            <Popover
              label="Material details"
              placement="center"
              trigger={<Button variant="secondary">Inspect</Button>}
            >
              <strong>Clear / 0.72</strong>
              <p>Optimized for large type over moving media.</p>
            </Popover>
          </Specimen>
          <Specimen number={12} name="Tooltip" detail="One phrase, attached accessibly.">
            <Tooltip label="Regenerate optical mesh" placement="bottom">
              <IconButton aria-label="Regenerate optical mesh">
                <Icon name="spark" />
              </IconButton>
            </Tooltip>
          </Specimen>
          <Specimen
            number={13}
            name="MediaControls"
            detail="A complete, compact playback cluster."
            wide
          >
            <MediaControls
              playing={playing}
              currentTime={currentTime}
              duration={184}
              muted={muted}
              onPlayingChange={setPlaying}
              onSeek={setCurrentTime}
              onMutedChange={setMuted}
            />
          </Specimen>
        </Category>

        <Category
          index="B"
          kicker="Inputs"
          title="Forms stay unmistakably usable through the glass."
        >
          <Specimen number={14} name="Badge" detail="Quiet status with semantic color.">
            <div className="specimen-row">
              <Badge>Draft</Badge>
              <Badge tone="positive">Stable</Badge>
              <Badge tone="warning">Beta</Badge>
            </div>
          </Specimen>
          <Specimen number={15} name="Avatar" detail="Image or generated initials.">
            <div className="specimen-row">
              <Avatar name="Moe Lueker" size="large" />
              <Avatar name="OpenGlass UI" />
              <Avatar name="Glass Runtime" size="small" />
            </div>
          </Specimen>
          <Specimen number={16} name="AvatarGroup" detail="Overlapping presence with hover lift.">
            <AvatarGroup>
              <Avatar name="Moe Lueker" />
              <Avatar name="Ada Chen" />
              <Avatar name="Sol Kim" />
              <Avatar name="Nia Reed" />
            </AvatarGroup>
          </Specimen>
          <Specimen number={17} name="Card" detail="Composable content, action, and metadata.">
            <Card
              eyebrow="Material 07"
              title="Coastal clear"
              footer={
                <Badge tone={cardSelected ? "accent" : "positive"}>
                  {cardSelected ? "Selected" : "Production"}
                </Badge>
              }
              interactive
              onPress={() => setCardSelected((selected) => !selected)}
            >
              High contrast optics tuned for full-bleed photography.
            </Card>
          </Specimen>
          <Specimen number={18} name="Stat" detail="Tabular metrics and change state.">
            <div className="specimen-row">
              <Stat label="Contrast" value="7.1" change="+0.8" tone="positive" />
              <Stat label="Frame" value="8.4ms" change="P95" />
            </div>
          </Specimen>
          <Specimen number={19} name="Progress" detail="Task completion with native semantics.">
            <Progress label="Material compilation" value={74} />
          </Specimen>
          <Specimen number={20} name="Meter" detail="A bounded quality measurement.">
            <Meter label="Clarity" value={88} optimum={90} />
          </Specimen>
          <Specimen number={21} name="Spinner" detail="Reduced-motion-aware activity.">
            <div className="specimen-row">
              <Spinner label="Compiling shaders" />
              <span className="specimen-caption">Compiling optics</span>
            </div>
          </Specimen>
          <Specimen number={22} name="Skeleton" detail="Low-distraction loading geometry.">
            <div className="skeleton-stack">
              <Skeleton width="42%" />
              <Skeleton width="92%" />
              <Skeleton width="72%" />
            </div>
          </Specimen>
          <Specimen number={23} name="Alert" detail="Semantic feedback that keeps contrast.">
            {alertVisible ? (
              <Alert
                title="Fallback verified"
                tone="positive"
                onDismiss={() => setAlertVisible(false)}
              >
                The opaque branch passes the same interaction checks.
              </Alert>
            ) : (
              <Button variant="quiet" onClick={() => setAlertVisible(true)}>
                Restore alert
              </Button>
            )}
          </Specimen>
          <Specimen number={24} name="Banner" detail="Persistent, actionable system notice." wide>
            <Banner
              title="Adaptive quality is active"
              action={<Button size="small">Review policy</Button>}
              dismissible
            >
              {product
                ? "Premium optics stay contained so every control remains responsive."
                : "WebGL is reserved for the hero surface."}
            </Banner>
          </Specimen>
        </Category>

        <Category index="C" kicker="Navigation" title="Wayfinding with hierarchy, not haze.">
          <Specimen number={25} name="Breadcrumbs" detail="Compact path context." wide>
            <Breadcrumbs
              items={
                product
                  ? [{ label: "OpenGlass UI", href: "/" }, { label: "Components" }]
                  : [
                      { label: "Library", href: "/library" },
                      { label: variant, href: `/library/${variant}` },
                      { label: "Components" },
                    ]
              }
            />
          </Specimen>
          <Specimen number={26} name="Pagination" detail="Explicit pages with native controls.">
            <Pagination page={page} count={5} onPageChange={setPage} />
          </Specimen>
          <Specimen
            number={27}
            name="Accordion"
            detail="Disclosure with correct relationships."
            wide
          >
            <Accordion
              items={[
                {
                  id: "material",
                  title: "How is the material selected?",
                  content:
                    "Runtime policy combines capability, motion preference, and quality budget.",
                },
                {
                  id: "fallback",
                  title: "What happens without backdrop-filter?",
                  content: "The same component switches to a high-contrast opaque material.",
                },
              ]}
            />
          </Specimen>
          <Specimen number={28} name="Dialog" detail="Modal detail with escape handling.">
            <Dialog title="Publish material" triggerLabel="Open publish dialog">
              <p>This preset will become available to every workspace.</p>
              <div className="specimen-row">
                <Button variant="primary">Publish</Button>
                <Button variant="quiet">Save draft</Button>
              </div>
            </Dialog>
          </Specimen>
          <Specimen number={29} name="Drawer" detail="Edge-mounted supporting workflow.">
            <Drawer title="Optical settings" triggerLabel="Open settings drawer">
              <Slider label="Edge strength" min={0} max={100} defaultValue={72} unit="%" />
              <Switch label="Chromatic dispersion" defaultChecked />
            </Drawer>
          </Specimen>
        </Category>

        <Category index="D" kicker="Form controls" title="Authoring APIs that agents can predict.">
          <Specimen number={30} name="Toast" detail="Dismiss, restore, and optional action." wide>
            <Toast title="Preset saved" actionLabel="Undo">
              Coastal clear is now available.
            </Toast>
          </Specimen>
          <Specimen number={31} name="Checkbox" detail="Label and description are one hit target.">
            <Checkbox
              label="Use adaptive quality"
              description="Drops expensive optics before input responsiveness."
              defaultChecked
            />
          </Specimen>
          <Specimen
            number={32}
            name="RadioGroup"
            detail="Controlled or uncontrolled single choice."
          >
            <RadioGroup
              label="Surface priority"
              defaultValue="balanced"
              items={[
                { value: "quality", label: "Quality" },
                { value: "balanced", label: "Balanced" },
                { value: "speed", label: "Speed" },
              ]}
            />
          </Specimen>
          <Specimen number={33} name="Select" detail="Native select with a custom shell.">
            <Select
              label="Material preset"
              defaultValue="regular"
              options={[
                { value: "clear", label: "Clear" },
                { value: "regular", label: "Regular" },
                { value: "frosted", label: "Frosted" },
              ]}
            />
          </Specimen>
          <Specimen number={34} name="TextField" detail="Hint, error, and native input props.">
            <TextField
              label="Preset name"
              defaultValue="Coastal clear"
              hint="Visible to collaborators."
            />
          </Specimen>
          <Specimen number={35} name="Textarea" detail="Long-form input with native resize.">
            <Textarea
              label="Release note"
              defaultValue="Sharper text, calmer highlights, faster fallback."
              hint="Markdown supported."
            />
          </Specimen>
          <Specimen number={36} name="SearchField" detail="Controlled search with a clear action.">
            <SearchField label="Search components" value={search} onValueChange={setSearch} />
          </Specimen>
          <Specimen number={37} name="NumberField" detail="Bounded stepping and direct entry.">
            <NumberField
              label="Samples"
              value={quantity}
              min={1}
              max={8}
              onValueChange={setQuantity}
            />
          </Specimen>
          <Specimen number={38} name="Stepper" detail="Progress plus optional navigation." wide>
            <Stepper
              current={step}
              onStepChange={setStep}
              items={[
                { id: "source", label: "Source", description: "Photo" },
                { id: "material", label: "Material", description: "Clear" },
                { id: "verify", label: "Verify", description: "3 browsers" },
              ]}
            />
          </Specimen>
          <Specimen number={39} name="ToggleButton" detail="A persistent, pressable command.">
            <ToggleButton defaultPressed>
              <span className="specimen-row">
                <Icon name="spark" /> Highlights
              </span>
            </ToggleButton>
          </Specimen>
          <Specimen
            number={40}
            name="FileDropzone"
            detail="Browse and drag/drop with one callback."
            wide
          >
            <FileDropzone label="Add an optical source" accept="image/*,video/*" multiple />
          </Specimen>
        </Category>

        <section className="atlas-outro">
          <span className="section-index">40 / 40</span>
          <h2>
            {product
              ? "A complete system, ready to become yours."
              : "A component library, not an effects reel."}
          </h2>
          <p>
            {product
              ? "Forty native-DOM recipes, three semantic materials, and one theme contract give products a premium glass language without sacrificing usability."
              : "Native semantics and shared React contracts make every variant easy to adopt. The engine is an implementation choice—not a rewrite."}
          </p>
          <div>
            {product ? (
              <AppLink href="/" className="text-link">
                Return to OpenGlass UI <Icon name="arrow" />
              </AppLink>
            ) : (
              <AppLink href="/library" className="text-link">
                Compare the ranking <Icon name="arrow" />
              </AppLink>
            )}
            <AppLink href="/docs" className="text-link">
              Read the architecture <Icon name="arrow" />
            </AppLink>
          </div>
        </section>
      </main>
      <Footer />
    </GlassThemeProvider>
  );
}
