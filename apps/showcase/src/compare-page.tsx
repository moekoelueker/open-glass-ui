import {
  DEFAULT_GLASS_LIGHT_ANGLE,
  DEFAULT_GLASS_LIGHT_SPREAD,
  GLASS_LOOK_PRESETS,
  type GlassAppearance,
  type GlassDesign,
  type GlassLook,
  type GlassLookPreset,
} from "@open-glass-ui/core";
import { Glass, GlassThemeProvider } from "@open-glass-ui/react";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Card,
  Checkbox,
  Dialog,
  IconButton,
  MediaControls,
  Menu,
  MenuItem,
  Pagination,
  Progress,
  SearchField,
  SegmentedControl,
  Slider,
  Stat,
  Switch,
  Tabs,
  TextField,
  ToastProvider,
  Toolbar,
  Tooltip,
  useToast,
} from "@open-glass-ui/recipes";
import { type CSSProperties, type KeyboardEvent, type PointerEvent, useRef, useState } from "react";
import "./compare-page.css";

type Wallpaper = "aurora" | "photo" | "dawn";
type Mode = "split" | "stack";

const TILES = [
  { title: "Midnight Drive", meta: "Neon · 12 tracks", hue: "a" },
  { title: "Soft Machines", meta: "Ambient · 9 tracks", hue: "b" },
  { title: "Glass Harbour", meta: "Indie · 11 tracks", hue: "c" },
  { title: "Citrus Hours", meta: "Pop · 14 tracks", hue: "d" },
  { title: "Low Orbit", meta: "Electronic · 8 tracks", hue: "e" },
  { title: "Paper Suns", meta: "Folk · 10 tracks", hue: "f" },
  { title: "Velvet Static", meta: "Lo-fi · 16 tracks", hue: "g" },
  { title: "North Light", meta: "Classical · 7 tracks", hue: "h" },
] as const;

function Glyph({
  name,
}: {
  name: "grid" | "list" | "plus" | "share" | "sort" | "sidebar" | "bell";
}) {
  const paths = {
    grid: "M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3zM9 9h4v4H9z",
    list: "M3 4h10v1.5H3zM3 7.25h10v1.5H3zM3 10.5h10V12H3z",
    plus: "M7.25 3h1.5v4.25H13v1.5H8.75V13h-1.5V8.75H3v-1.5h4.25z",
    share: "M8 2.5 11 5.5l-1 1-1.3-1.3V10H7.3V5.2L6 6.5l-1-1zM3.5 8h1.4v4.1h6.2V8h1.4v5.5h-9z",
    sort: "M4.5 3 7 5.5H5.25V13h-1.5V5.5H2zM11.5 13 9 10.5h1.75V3h1.5v7.5H14z",
    sidebar: "M2.5 3h11v10h-11zM4 4.5v7h2.5v-7zm4 0v7h4v-7z",
    bell: "M8 2.2a3.8 3.8 0 0 1 3.8 3.8v2.7l1.2 2H3l1.2-2V6A3.8 3.8 0 0 1 8 2.2zM6.5 11.8h3a1.5 1.5 0 0 1-3 0z",
  } as const;
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
      <path d={paths[name]} fillRule="evenodd" />
    </svg>
  );
}

function ToastButton() {
  const { toast } = useToast();
  return (
    <IconButton
      aria-label="Notify"
      variant="secondary"
      onClick={() =>
        toast({
          title: "Library synced",
          description: "8 albums are up to date.",
          actionLabel: "View",
        })
      }
    >
      <Glyph name="bell" />
    </IconButton>
  );
}

/**
 * One realistic product scene. It is rendered twice, once per design, so the
 * comparison is always the same markup, state model, and component API.
 */
function Scene({
  design,
  appearance,
  look,
}: {
  design: GlassDesign;
  appearance: GlassAppearance;
  look?: GlassLook | undefined;
}) {
  const [view, setView] = useState<"grid" | "list" | "mixes">("grid");
  const [playing, setPlaying] = useState(true);
  const [time, setTime] = useState(74);
  const [page, setPage] = useState(2);

  return (
    <GlassThemeProvider
      design={design}
      appearance={appearance}
      theme={look ? { preset: "cobalt", glass: look } : { preset: "cobalt" }}
      className="compare-scene"
      data-design={design}
    >
      <ToastProvider label={`${design} notifications`}>
        <div className="compare-scene__content">
          <div className="compare-scene__hero">
            <span>Listen now</span>
            <h2>Made for late light.</h2>
          </div>
          <div className="compare-scene__tiles">
            {TILES.map((tile) => (
              <figure key={tile.title} className={`compare-tile compare-tile--${tile.hue}`}>
                <div aria-hidden="true" />
                <figcaption>
                  <strong>{tile.title}</strong>
                  <span>{tile.meta}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <Glass
          as="aside"
          material="regular"
          className="compare-sidebar"
          aria-label={`Library (${design})`}
        >
          <SearchField label="Search library" placeholder="Search" />
          <nav className="compare-sidebar__nav" aria-label={`Sections (${design})`}>
            {["Listen now", "Browse", "Radio", "Library"].map((item, index) => (
              <Button
                key={item}
                variant={index === 0 ? "secondary" : "quiet"}
                size="small"
                className="compare-sidebar__link"
              >
                {item}
              </Button>
            ))}
          </nav>
          <div className="compare-sidebar__footer">
            <AvatarGroup>
              <Avatar name="Maya Lin" size="small" />
              <Avatar name="Omar Uddin" size="small" />
              <Avatar name="Grace Ruiz" size="small" />
            </AvatarGroup>
            <Badge tone="positive">Live</Badge>
          </div>
        </Glass>

        <Toolbar label={`View options (${design})`} className="compare-toolbar">
          <Tooltip label="Toggle sidebar">
            <IconButton aria-label="Toggle sidebar">
              <Glyph name="sidebar" />
            </IconButton>
          </Tooltip>
          <SegmentedControl
            aria-label="Layout"
            value={view}
            onValueChange={setView}
            items={[
              { value: "grid", label: "Grid" },
              { value: "list", label: "List" },
              { value: "mixes", label: "Mixes" },
            ]}
          />
          <Menu
            label="Sort albums"
            placement="end"
            trigger={
              <IconButton aria-label="Sort albums">
                <Glyph name="sort" />
              </IconButton>
            }
          >
            <MenuItem>Recently added</MenuItem>
            <MenuItem>Artist</MenuItem>
            <MenuItem>Title</MenuItem>
            <MenuItem destructive>Clear history</MenuItem>
          </Menu>
          <ToastButton />
        </Toolbar>

        <Glass
          as="section"
          material="frosted"
          className="compare-inspector"
          aria-label={`Inspector (${design})`}
        >
          <Tabs
            label="Inspector"
            items={[
              {
                value: "sound",
                label: "Sound",
                content: (
                  <div className="compare-stack">
                    <Switch label="Spatial audio" description="Head-tracked" defaultChecked />
                    <Switch label="Crossfade" />
                    <Slider label="Volume" defaultValue={68} unit="%" />
                    <Progress label="Downloading" value={62} />
                  </div>
                ),
              },
              {
                value: "details",
                label: "Details",
                content: (
                  <div className="compare-stack">
                    <TextField label="Playlist name" defaultValue="Late light" />
                    <Checkbox label="Share with friends" defaultChecked />
                  </div>
                ),
              },
              {
                value: "stats",
                label: "Stats",
                content: (
                  <div className="compare-stats">
                    <Stat label="Plays" value="1,284" change="+12%" tone="positive" />
                    <Stat label="Hours" value="86" change="This month" />
                  </div>
                ),
              },
            ]}
          />
          <div className="compare-inspector__actions">
            <Button variant="primary">Add to library</Button>
            <Dialog title="Share playlist" triggerLabel="Share">
              <p>Anyone with the link can listen to “Late light”.</p>
              <div className="compare-dialog-actions">
                <Button variant="primary">Copy link</Button>
                <Button variant="quiet">Cancel</Button>
              </div>
            </Dialog>
          </div>
        </Glass>

        <Card
          className="compare-card"
          eyebrow="Up next"
          title="Glass Harbour"
          footer={
            <Pagination
              aria-label={`Queue pages (${design})`}
              page={page}
              count={4}
              onPageChange={setPage}
            />
          }
        >
          Track 3 of 11 · 3:41
        </Card>

        <Glass material="clear" className="compare-player" aria-label={`Now playing (${design})`}>
          <div className="compare-player__art" aria-hidden="true" />
          <div className="compare-player__meta">
            <strong>Midnight Drive</strong>
            <span>Neon Coast</span>
          </div>
          <MediaControls
            playing={playing}
            currentTime={time}
            duration={212}
            onPlayingChange={setPlaying}
            onSeek={setTime}
            className="compare-player__controls"
          />
        </Glass>
      </ToastProvider>
    </GlassThemeProvider>
  );
}

function SplitHandle({
  value,
  onChange,
  frameRef,
}: {
  value: number;
  onChange: (value: number) => void;
  frameRef: { current: HTMLDivElement | null };
}) {
  const update = (clientX: number) => {
    const box = frameRef.current?.getBoundingClientRect();
    if (box && box.width > 0) {
      onChange(Math.min(Math.max(((clientX - box.left) / box.width) * 100, 0), 100));
    }
  };

  return (
    <div
      className="compare-handle"
      role="slider"
      tabIndex={0}
      aria-label="Before and after divider"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      aria-valuetext={`${Math.round(value)}% classic, ${Math.round(100 - value)}% liquid`}
      onPointerDown={(event: PointerEvent<HTMLDivElement>) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        update(event.clientX);
      }}
      onPointerMove={(event: PointerEvent<HTMLDivElement>) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          update(event.clientX);
        }
      }}
      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
        const step = event.shiftKey ? 10 : 2;
        if (event.key === "ArrowLeft") onChange(Math.max(value - step, 0));
        if (event.key === "ArrowRight") onChange(Math.min(value + step, 100));
        if (event.key === "Home") onChange(0);
        if (event.key === "End") onChange(100);
      }}
    >
      <span className="compare-handle__grip" aria-hidden="true">
        <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
          <path d="M6 4 2 8l4 4zM10 4l4 4-4 4z" />
        </svg>
      </span>
    </div>
  );
}

function lookFromPreset(preset: GlassLookPreset) {
  const base = GLASS_LOOK_PRESETS[preset];
  return {
    ...base,
    blur: base.blur ?? 1,
    opacity: base.opacity ?? 1,
    rim: base.rim ?? 1,
    highlight: base.highlight ?? 1,
    lensing: base.lensing ?? 1,
    lightAngle: base.lightAngle ?? DEFAULT_GLASS_LIGHT_ANGLE,
    lightSpread: base.lightSpread ?? DEFAULT_GLASS_LIGHT_SPREAD,
  };
}

type EditableLook = ReturnType<typeof lookFromPreset>;

const LOOK_SLIDERS: ReadonlyArray<{
  key: "lightAngle" | "lightSpread" | "highlight" | "blur" | "opacity" | "rim" | "lensing";
  label: string;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
}> = [
  {
    key: "lightAngle",
    label: "Light direction",
    min: 0,
    max: 359,
    step: 1,
    format: (v) => `${v}°`,
  },
  {
    key: "lightSpread",
    label: "Highlight spread",
    min: 0,
    max: 170,
    step: 1,
    format: (v) => `${v}°`,
  },
  {
    key: "highlight",
    label: "Highlight intensity",
    min: 0,
    max: 2,
    step: 0.05,
    format: (v) => `${v.toFixed(2)}×`,
  },
  {
    key: "blur",
    label: "Frost (blur)",
    min: 0,
    max: 3,
    step: 0.05,
    format: (v) => `${v.toFixed(2)}×`,
  },
  {
    key: "opacity",
    label: "Tint density",
    min: 0,
    max: 2.5,
    step: 0.05,
    format: (v) => `${v.toFixed(2)}×`,
  },
  {
    key: "rim",
    label: "Edge (rim)",
    min: 0,
    max: 2,
    step: 0.05,
    format: (v) => `${v.toFixed(2)}×`,
  },
  {
    key: "lensing",
    label: "Edge lensing",
    min: 0,
    max: 3,
    step: 0.05,
    format: (v) => `${v.toFixed(2)}×`,
  },
];

function lookSnippet(preset: GlassLookPreset, look: EditableLook) {
  const base = lookFromPreset(preset);
  const changed = LOOK_SLIDERS.filter(({ key }) => look[key] !== base[key]).map(
    ({ key }) => `${key}: ${Number(look[key].toFixed(2))}`,
  );
  if (changed.length === 0) {
    return preset === "liquid" ? "<GlassSystemProvider>" : `theme={{ glass: "${preset}" }}`;
  }
  const extra = preset === "liquid" ? "" : `...GLASS_LOOK_PRESETS.${preset}, `;
  return `theme={{ glass: { ${extra}${changed.join(", ")} } }}`;
}

function LookPanel({
  preset,
  look,
  onPreset,
  onChange,
}: {
  preset: GlassLookPreset;
  look: EditableLook;
  onPreset: (preset: GlassLookPreset) => void;
  onChange: (patch: Partial<EditableLook>) => void;
}) {
  return (
    <section className="compare-look" aria-labelledby="compare-look-title">
      <div className="compare-look__head">
        <div>
          <h2 id="compare-look-title">Glass look</h2>
          <p>Applies to the liquid side. Pick a preset, then fine-tune it.</p>
        </div>
        <SegmentedControl
          aria-label="Glass look preset"
          value={preset}
          onValueChange={onPreset}
          items={[
            { value: "liquid", label: "Liquid" },
            { value: "frosted", label: "Frosted" },
            { value: "clear", label: "Clear" },
            { value: "smoked", label: "Smoked" },
            { value: "lensed", label: "Lensed" },
          ]}
        />
      </div>
      <div className="compare-look__sliders">
        {LOOK_SLIDERS.map((slider) => (
          <Slider
            key={slider.key}
            label={slider.label}
            min={slider.min}
            max={slider.max}
            step={slider.step}
            value={look[slider.key]}
            valueText={slider.format(look[slider.key])}
            onChange={(event) => onChange({ [slider.key]: Number(event.currentTarget.value) })}
          />
        ))}
      </div>
      <code className="compare-look__code">{lookSnippet(preset, look)}</code>
    </section>
  );
}

function initialParam<T extends string>(name: string, allowed: readonly T[], fallback: T): T {
  const value = new URLSearchParams(window.location.search).get(name);
  return allowed.find((candidate) => candidate === value) ?? fallback;
}

export function ComparePage() {
  const [split, setSplit] = useState(() => {
    const raw = new URLSearchParams(window.location.search).get("split");
    const value = raw === null || raw === "" ? Number.NaN : Number(raw);
    return Number.isFinite(value) ? Math.min(Math.max(value, 0), 100) : 50;
  });
  const [mode, setMode] = useState<Mode>(() => initialParam("mode", ["split", "stack"], "split"));
  const [appearance, setAppearance] = useState<GlassAppearance>(() =>
    initialParam("appearance", ["dark", "light"], "dark"),
  );
  const [wallpaper, setWallpaper] = useState<Wallpaper>(() =>
    initialParam("wallpaper", ["aurora", "photo", "dawn"], "aurora"),
  );
  const frameRef = useRef<HTMLDivElement>(null);
  const [preset, setPreset] = useState<GlassLookPreset>("liquid");
  const [look, setLook] = useState<EditableLook>(() => lookFromPreset("liquid"));

  return (
    <GlassThemeProvider appearance="dark" theme={{ preset: "neutral" }} className="compare-page">
      <header className="compare-header">
        <div>
          <span className="compare-kicker">OpenGlass UI · 0.3 → 0.4</span>
          <h1>Before and after</h1>
          <p>
            The same scene, the same components, the same props. Left is the 0.3 classic design,
            right is the new liquid design. Drag the divider, or use the arrow keys on it.
            Everything is live.
          </p>
        </div>
        <div className="compare-controls">
          <SegmentedControl
            aria-label="Comparison layout"
            value={mode}
            onValueChange={setMode}
            items={[
              { value: "split", label: "Split" },
              { value: "stack", label: "Side by side" },
            ]}
          />
          <SegmentedControl
            aria-label="Appearance"
            value={appearance}
            onValueChange={setAppearance}
            items={[
              { value: "dark", label: "Dark" },
              { value: "light", label: "Light" },
            ]}
          />
          <SegmentedControl
            aria-label="Wallpaper"
            value={wallpaper}
            onValueChange={setWallpaper}
            items={[
              { value: "aurora", label: "Aurora" },
              { value: "photo", label: "Photo" },
              { value: "dawn", label: "Dawn" },
            ]}
          />
        </div>
      </header>

      <main id="main-content">
        <LookPanel
          preset={preset}
          look={look}
          onPreset={(next) => {
            setPreset(next);
            setLook(lookFromPreset(next));
          }}
          onChange={(patch) => setLook((current) => ({ ...current, ...patch }))}
        />
        {mode === "split" ? (
          <div
            ref={frameRef}
            className={`compare-frame compare-wallpaper--${wallpaper}`}
            data-appearance={appearance}
            style={{ "--split": `${split}%` } as CSSProperties}
          >
            <div className={`compare-layer compare-layer--before compare-wallpaper--${wallpaper}`}>
              <Scene design="classic" appearance={appearance} />
            </div>
            <div className={`compare-layer compare-layer--after compare-wallpaper--${wallpaper}`}>
              <Scene design="liquid" appearance={appearance} look={look} />
            </div>
            <span className="compare-label compare-label--before">Before · classic</span>
            <span className="compare-label compare-label--after">After · liquid</span>
            <SplitHandle value={split} onChange={setSplit} frameRef={frameRef} />
          </div>
        ) : (
          <div className="compare-pair">
            {(["classic", "liquid"] as const).map((design) => (
              <section key={design} aria-label={design === "classic" ? "Before" : "After"}>
                <h2 className="compare-pair__title">
                  {design === "classic" ? "Before · classic (0.3)" : "After · liquid (0.4)"}
                </h2>
                <div
                  className={`compare-frame compare-frame--single compare-wallpaper--${wallpaper}`}
                  data-appearance={appearance}
                >
                  <div className={`compare-layer compare-wallpaper--${wallpaper}`}>
                    <Scene
                      design={design}
                      appearance={appearance}
                      look={design === "liquid" ? look : undefined}
                    />
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}

        <section className="compare-notes" aria-label="What changed">
          {[
            [
              "Material",
              "Clearer glass with far more saturation, so content beneath reads as lensed colour instead of grey fog.",
            ],
            [
              "Light",
              "One clean specular ring on the outer edge, aimed wherever you point the light, plus a pointer-following glint on buttons.",
            ],
            [
              "Shape",
              "Capsule controls and concentric corners. Surfaces default to the soft radius scale.",
            ],
            [
              "Motion",
              "Segmented controls and tabs share one glass thumb that springs between items. Switch and slider thumbs swell into lenses while held.",
            ],
            [
              "Depth",
              "Inputs are recessed wells, controls are raised glass, sheets float over a lighter, blurrier scrim.",
            ],
            [
              "Art direction",
              "Frost, tint density, saturation, rim, edge lensing, depth and light direction are all tokens. Set them for the whole site, one section, or one element.",
            ],
            [
              "Compatibility",
              'Same components, props, class names and tokens. One prop, design="classic", restores 0.3 exactly.',
            ],
          ].map(([title, body]) => (
            <article key={title}>
              <h2>{title}</h2>
              <p>{body}</p>
            </article>
          ))}
        </section>
      </main>
    </GlassThemeProvider>
  );
}
