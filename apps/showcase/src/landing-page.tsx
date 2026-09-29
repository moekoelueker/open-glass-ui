import {
  type GlassThemeInput,
  type GlassThemePreset,
  getMaterialPreset,
  type MaterialPresetName,
} from "@open-glass-ui/core";
import { Glass, GlassThemeProvider, useGlassRuntime } from "@open-glass-ui/react";
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
import { type CSSProperties, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { BRAND_TAGLINE, PrimaryNavLinks, REPOSITORY_URL, RepositoryLink } from "./brand";
import { Icon } from "./icons";
import { LiquidShowcase } from "./liquid-showcase";
import { AppLink } from "./navigation";
import "./landing-page.css";

type LandingScene = "motion" | "photo" | "topography" | "chroma";
type ScenarioId = "studio" | "analytics" | "builder" | "feedback";
type LensResponse = "balanced" | "frosted" | "spectral";

const INSTALL_COMMAND = "npm install open-glass-ui react react-dom";
const QUICKSTART = `import "open-glass-ui/styles.css";
import { Button, Glass, GlassSystemProvider } from "open-glass-ui";

export function App() {
  return (
    <GlassSystemProvider
      renderer="auto"
      theme={{ appearance: "system" }}
    >
      <Glass material="frosted">
        <Button variant="primary">Create project</Button>
      </Glass>
    </GlassSystemProvider>
  );
}`;
const AGENT_PROMPT = `Use the public open-glass-ui facade and import open-glass-ui/styles.css once. Default to CSS-first renderer="auto". Keep all controls as semantic DOM. Use the existing forty recipes before creating custom controls. Require accessible labels, preserve keyboard behavior, reduced motion/transparency, and forced-colors fallbacks. Use open-glass-ui/webgl only for an owned image/canvas/video source. Use open-glass-ui/core for server-safe pure utilities. Keep Next.js server output deterministic.`;

const COMPONENT_GROUPS = [
  {
    title: "Creative studio",
    description: "Command surfaces, media, and direct manipulation.",
    components: [
      "Button",
      "IconButton",
      "SegmentedControl",
      "Switch",
      "Slider",
      "Toolbar",
      "Dock",
      "Menu",
      "MenuItem",
      "Popover",
      "Tooltip",
      "MediaControls",
      "ToggleButton",
    ],
  },
  {
    title: "Analytics console",
    description: "Dense information with legible hierarchy.",
    components: [
      "Tabs",
      "Badge",
      "Avatar",
      "AvatarGroup",
      "Card",
      "Stat",
      "Progress",
      "Meter",
      "Breadcrumbs",
      "Pagination",
      "SearchField",
    ],
  },
  {
    title: "Material builder",
    description: "Predictable authoring and form contracts.",
    components: [
      "Stepper",
      "Checkbox",
      "RadioGroup",
      "Select",
      "TextField",
      "Textarea",
      "NumberField",
      "FileDropzone",
    ],
  },
  {
    title: "Feedback & overlays",
    description: "State changes that remain clear and accessible.",
    components: [
      "Spinner",
      "Skeleton",
      "Alert",
      "Banner",
      "Accordion",
      "Dialog",
      "Drawer",
      "Toast",
    ],
  },
] as const;

const ACCENTS: ReadonlyArray<{
  id: GlassThemePreset;
  label: string;
  color: string;
}> = [
  { id: "neutral", label: "Neutral", color: "#f4f3ee" },
  { id: "cobalt", label: "Cobalt", color: "#7896ff" },
  { id: "teal", label: "Teal", color: "#43d6b0" },
  { id: "violet", label: "Violet", color: "#aa92ff" },
  { id: "coral", label: "Coral", color: "#ff8a76" },
  { id: "amber", label: "Amber", color: "#f1c75b" },
];

function copyFallback(value: string) {
  const field = document.createElement("textarea");
  field.value = value;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.append(field);
  field.select();
  const copied = document.execCommand("copy");
  field.remove();
  if (!copied) {
    throw new Error("The browser rejected the fallback copy command.");
  }
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      copyFallback(value);
      return;
    }
  }
  copyFallback(value);
}

function useCopyAnnouncement() {
  const [announcement, setAnnouncement] = useState("");

  const copy = async (value: string, label: string) => {
    try {
      await copyText(value);
      setAnnouncement(`${label} copied.`);
    } catch {
      setAnnouncement(`${label} could not be copied. Select and copy it manually.`);
    }
  };

  return { announcement, copy };
}

function Wordmark() {
  return (
    <AppLink className="landing-wordmark" href="/" aria-label="OpenGlass UI home">
      <span className="landing-wordmark__mark" aria-hidden="true">
        <i />
      </span>
      <span>
        <strong>OPENGLASS</strong>
        <small>{BRAND_TAGLINE}</small>
      </span>
    </AppLink>
  );
}

function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 48);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div
        className={`landing-header-wrap${scrolled ? " is-scrolled" : ""}`}
        data-nav-state={scrolled ? "scrolled" : "top"}
        data-landing-header=""
        data-scrolled={scrolled}
        data-surface={scrolled ? "frosted" : "plain"}
      >
        <header className="landing-header">
          <Wordmark />
          <nav aria-label="Primary navigation">
            <PrimaryNavLinks />
            <a href="#setup">Install</a>
          </nav>
          <RepositoryLink className="landing-header__github" />
        </header>
      </div>
    </>
  );
}

function LandingBackdrop({ scene, motion }: { scene: LandingScene; motion: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    if (motion) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [motion]);

  return (
    <div className={`landing-backdrop landing-backdrop--${scene}`} aria-hidden="true">
      {scene === "motion" ? (
        <video
          ref={videoRef}
          className="landing-backdrop__video"
          data-landing-video=""
          muted
          loop
          playsInline
          autoPlay={motion}
          preload="metadata"
          poster="/assets/architectural-contrast.jpg"
          width={960}
          height={540}
        >
          <source src="/assets/motion-source.mp4" type="video/mp4" />
        </video>
      ) : null}
      {scene === "photo" ? (
        <img
          src="/assets/architectural-contrast.jpg"
          width={960}
          height={540}
          alt=""
          loading="eager"
        />
      ) : null}
      <span className="landing-backdrop__grid" />
      <span className="landing-backdrop__glow landing-backdrop__glow--a" />
      <span className="landing-backdrop__glow landing-backdrop__glow--b" />
      <span className="landing-backdrop__contours" />
    </div>
  );
}

/**
 * The inventory section claims every primitive is interactive, so it has to
 * show that rather than assert it. These are the exported recipes, not
 * screenshots or styled markup: they take focus, respond to input, and use the
 * same tokens a consumer gets.
 */
function InventoryBench() {
  const [notify, setNotify] = useState(true);
  const [stage, setStage] = useState<"draft" | "review" | "shipped">("review");
  const [grain, setGrain] = useState(62);
  const [pinned, setPinned] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <Glass
      as="section"
      className="landing-bench"
      material="regular"
      aria-label="Live component specimens"
      data-landing-bench=""
    >
      <div className="landing-bench__row">
        <Button variant="primary">Create project</Button>
        <Button variant="secondary">Duplicate</Button>
        <Tooltip label="Add a collaborator">
          <IconButton aria-label="Add a collaborator">+</IconButton>
        </Tooltip>
        <SegmentedControl
          aria-label="Project stage"
          value={stage}
          onValueChange={setStage}
          items={[
            { value: "draft", label: "Draft" },
            { value: "review", label: "Review" },
            { value: "shipped", label: "Shipped" },
          ]}
        />
        <ToggleButton pressed={pinned} onPressedChange={setPinned}>
          {pinned ? "Pinned" : "Pin"}
        </ToggleButton>
        <Badge tone="positive">{stage}</Badge>
      </div>
      <div className="landing-bench__row">
        <Switch label="Notify reviewers" checked={notify} onCheckedChange={setNotify} />
        <Slider
          label="Grain"
          value={grain}
          unit="%"
          onChange={(event) => setGrain(Number(event.currentTarget.value))}
        />
        <SearchField
          label="Find a component"
          placeholder="Search components"
          value={query}
          onValueChange={setQuery}
        />
        <AvatarGroup>
          <Avatar name="Ada Lovelace" size="small" />
          <Avatar name="Grace Hopper" size="small" />
          <Avatar name="Alan Turing" size="small" />
        </AvatarGroup>
      </div>
      <p className="landing-bench__note">
        Every control above is the shipped component. Tab into it, type in it, and it behaves the
        same way in your app.
      </p>
    </Glass>
  );
}

const RENDERER_REASON_LABEL: Record<string, string> = {
  "css-first": "CSS-first default",
  explicit: "Explicitly requested",
  "capability-fallback": "Capability fallback",
  "accessibility-fallback": "Accessibility fallback",
};

/**
 * Reports what this surface actually resolved to, read back from the
 * `data-ogui-*` attributes `Glass` writes onto its own element. That is the
 * documented way to inspect a surface, so anyone can reproduce this readout in
 * their own app rather than taking a published figure on trust.
 */
function HeroRuntimeReadout({
  material,
  intensity,
  frost,
  onFrostChange,
}: {
  material: MaterialPresetName;
  intensity: number;
  frost: number;
  onFrostChange: (frost: number) => void;
}) {
  const runtime = useGlassRuntime();
  const surfaceRef = useRef<HTMLElement>(null);
  const [resolved, setResolved] = useState<{
    renderer: string;
    reason: string;
    material: MaterialPresetName;
    hydrated: boolean;
    motion: string;
  } | null>(null);
  const optics = getMaterialPreset(material);

  // Snapshot the material, the runtime, and the attributes together so the
  // panel never pairs a freshly selected material with a stale renderer read.
  useEffect(() => {
    const element = surfaceRef.current;
    if (!element) {
      return;
    }
    setResolved({
      renderer: element.dataset.oguiRenderer ?? "css",
      reason: element.dataset.oguiRendererReason ?? "css-first",
      material,
      hydrated: runtime.hydrated,
      motion: runtime.motion,
    });
  }, [material, runtime]);

  return (
    <Glass
      ref={surfaceRef}
      as="section"
      className="landing-score"
      material={material}
      optics={{ frost }}
      tone="dark"
      interactive
      aria-label="Live material runtime readout"
      data-landing-hero-glass=""
      data-landing-readout=""
      style={{ "--landing-intensity": intensity / 100 } as CSSProperties}
    >
      <header>
        <span>OPENGLASS / RUNTIME</span>
        <i aria-hidden="true" />
        <Badge tone={resolved?.hydrated ? "positive" : "neutral"}>
          {resolved ? resolved.renderer : "ssr"}
        </Badge>
      </header>
      <strong>
        {optics.ior.toFixed(2)} <span>refractive index</span>
      </strong>
      <p>
        {resolved ? RENDERER_REASON_LABEL[resolved.reason] : "Server render"} ·{" "}
        {resolved?.material ?? material} material
      </p>
      <Slider
        label="Frost"
        unit="%"
        min={0}
        max={100}
        value={Math.round(frost * 100)}
        onChange={(event) => onFrostChange(Number(event.currentTarget.value) / 100)}
      />
      <small>
        Drag frost to thicken the material. Thickness {optics.thickness.toFixed(2)} · dispersion{" "}
        {optics.dispersion.toFixed(3)} · motion {resolved?.motion ?? "pending"}
      </small>
    </Glass>
  );
}

function HeroControls({
  scene,
  onSceneChange,
  material,
  onMaterialChange,
  accent,
  onAccentChange,
  customAccent,
  onCustomAccentChange,
  intensity,
  onIntensityChange,
  motion,
  onMotionChange,
  systemMotion,
}: {
  scene: LandingScene;
  onSceneChange: (scene: LandingScene) => void;
  material: MaterialPresetName;
  onMaterialChange: (material: MaterialPresetName) => void;
  accent: GlassThemePreset;
  onAccentChange: (accent: GlassThemePreset) => void;
  customAccent: string;
  onCustomAccentChange: (accent: string) => void;
  intensity: number;
  onIntensityChange: (intensity: number) => void;
  motion: boolean;
  onMotionChange: (motion: boolean) => void;
  systemMotion: "on" | "off";
}) {
  return (
    <div className="landing-instrument__controls">
      <fieldset>
        <legend>Source</legend>
        <SegmentedControl
          aria-label="Preview background"
          value={scene}
          onValueChange={onSceneChange}
          items={[
            { value: "motion", label: "Motion" },
            { value: "photo", label: "Photo" },
            { value: "topography", label: "Topo" },
            { value: "chroma", label: "Chroma" },
          ]}
        />
      </fieldset>
      <fieldset>
        <legend>Material</legend>
        <SegmentedControl
          aria-label="Glass material"
          value={material}
          onValueChange={onMaterialChange}
          items={[
            { value: "clear", label: "Clear" },
            { value: "regular", label: "Regular" },
            { value: "frosted", label: "Frosted" },
          ]}
        />
      </fieldset>
      <fieldset className="landing-accent-field">
        <legend>Accent</legend>
        <div className="landing-accent-list">
          {ACCENTS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-label={`${option.label} accent`}
              aria-pressed={!customAccent && accent === option.id}
              onClick={() => {
                onCustomAccentChange("");
                onAccentChange(option.id);
              }}
              style={{ "--swatch": option.color } as CSSProperties}
            >
              <i aria-hidden="true" />
            </button>
          ))}
          <label title="Custom accent">
            <span className="ogui-sr-only">Custom accent</span>
            <input
              aria-label="Custom accent"
              type="color"
              value={customAccent || "#7896ff"}
              onChange={(event) => onCustomAccentChange(event.currentTarget.value)}
            />
          </label>
        </div>
      </fieldset>
      <Slider
        label="Optical intensity"
        min={35}
        max={100}
        value={intensity}
        unit="%"
        onInput={(event) => onIntensityChange(Number(event.currentTarget.value))}
      />
      <Switch
        label="Scene motion"
        description={systemMotion === "off" ? "Paused by system preference" : "Pause any time"}
        checked={motion && systemMotion === "on"}
        disabled={systemMotion === "off"}
        onCheckedChange={onMotionChange}
      />
    </div>
  );
}

function Benefit({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="landing-benefit">
      <span>{index}</span>
      <h3>{title}</h3>
      <p>{children}</p>
    </article>
  );
}

function CreativeStudio() {
  const [playing, setPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(43);
  const [muted, setMuted] = useState(false);
  const [contours, setContours] = useState(true);
  const [distortion, setDistortion] = useState(72);

  return (
    <div className="landing-scenario landing-scenario--studio" data-use-case="creative-studio">
      <div
        id="studio-field"
        className="landing-scenario__canvas"
        data-studio-canvas=""
        data-contours={contours ? "on" : "off"}
        data-distortion={distortion}
        style={
          {
            "--studio-distortion": distortion / 100,
            "--studio-blur": `${6 + distortion * 0.16}px`,
            "--studio-edge": `${1 + distortion * 0.06}px`,
            "--studio-edge-negative": `${-1 - distortion * 0.06}px`,
            "--studio-edge-blur": `${3 + distortion * 0.18}px`,
            "--studio-scale": 0.96 + distortion * 0.0008,
            "--studio-contour-scale": 1 + (distortion / 100) * 0.12,
            "--studio-angle-a": `${-4 - distortion * 0.12}deg`,
            "--studio-angle-b": `${10 + distortion * 0.18}deg`,
            "--studio-shift": `${distortion * 0.075}px`,
            "--studio-shift-b": `${distortion * -0.04125}px`,
            "--studio-selection-shift": `${distortion * -0.03}px`,
          } as CSSProperties
        }
      >
        <span className="landing-scenario__contours" data-contour-field="" aria-hidden="true" />
        <span
          className="landing-scenario__orb landing-scenario__orb--a"
          data-morph-shape=""
          aria-hidden="true"
        />
        <span
          className="landing-scenario__orb landing-scenario__orb--b"
          data-morph-shape=""
          aria-hidden="true"
        />
        <Toolbar label="Creative tools" material="clear">
          <Tooltip label="Select">
            <IconButton aria-label="Select tool" variant="primary">
              <Icon name="spark" />
            </IconButton>
          </Tooltip>
          <IconButton aria-label="Tune material">
            <Icon name="tune" />
          </IconButton>
          <ToggleButton
            pressed={contours}
            onPressedChange={setContours}
            aria-controls="studio-field"
          >
            Contours
          </ToggleButton>
          <Popover label="Canvas information" trigger={<Button variant="quiet">Inspect</Button>}>
            <p>960 × 540 · adaptive color profile</p>
          </Popover>
          <Menu label="Layer actions" trigger={<Button variant="quiet">Actions</Button>}>
            <MenuItem>Duplicate layer</MenuItem>
            <MenuItem>Pin to library</MenuItem>
            <MenuItem destructive>Remove source</MenuItem>
          </Menu>
        </Toolbar>
        <Glass className="landing-scenario__selection" material="clear" tone="dark" interactive>
          <span>REFRACTION FIELD</span>
          <strong data-distortion-output="">{distortion}%</strong>
          <Slider
            label="Distortion"
            value={distortion}
            unit="%"
            onInput={(event) => setDistortion(Number(event.currentTarget.value))}
          />
        </Glass>
        <p className="landing-scenario__explanation">
          Contours reveal the thickness field. Distortion turns that field into visible optical
          displacement.
        </p>
        <Dock label="Studio navigation" material="frosted" tone="dark">
          <IconButton aria-label="Canvas">
            <Icon name="grid" />
          </IconButton>
          <IconButton aria-label="Generate">
            <Icon name="spark" />
          </IconButton>
          <IconButton aria-label="Settings">
            <Icon name="tune" />
          </IconButton>
        </Dock>
      </div>
      <MediaControls
        playing={playing}
        currentTime={currentTime}
        duration={128}
        muted={muted}
        onPlayingChange={setPlaying}
        onSeek={setCurrentTime}
        onMutedChange={setMuted}
      />
    </div>
  );
}

function AnalyticsConsole() {
  const [page, setPage] = useState(2);
  const [search, setSearch] = useState("Surface");

  return (
    <div className="landing-scenario landing-scenario--analytics" data-use-case="analytics-console">
      <header className="landing-console__header">
        <Breadcrumbs
          items={[
            { label: "Workspace", href: "/" },
            { label: "Materials", href: "/" },
            { label: "Overview" },
          ]}
        />
        <AvatarGroup role="group" aria-label="Active collaborators">
          <Avatar name="Moe Lueker" />
          <Avatar name="Ada Chen" />
          <Avatar name="Sol Kim" />
        </AvatarGroup>
      </header>
      <div className="landing-console__stats">
        <Stat label="Material fit" value="94" change="+6.4%" tone="positive" />
        <Stat label="Input p95" value="17.7ms" change="Reference host" />
        <Stat label="Browsers" value="3" change="Validated" tone="positive" />
      </div>
      <div className="landing-console__body">
        <Card
          eyebrow="Runtime"
          title="Adaptive quality"
          footer={<Badge tone="positive">Stable</Badge>}
        >
          <Progress label="Capability fit" value={98} />
          <Meter label="Text clarity" value={92} optimum={90} />
        </Card>
        <div>
          <SearchField label="Search materials" value={search} onValueChange={setSearch} />
          <Tabs
            label="Analytics period"
            defaultValue="week"
            items={[
              { value: "day", label: "Day", content: <p>18 sessions today.</p> },
              { value: "week", label: "Week", content: <p>184 verified sessions this week.</p> },
              { value: "month", label: "Month", content: <p>718 verified sessions this month.</p> },
            ]}
          />
          <Pagination page={page} count={5} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}

function MaterialBuilder() {
  const [step, setStep] = useState(1);
  const [samples, setSamples] = useState(3);

  return (
    <div className="landing-scenario landing-scenario--builder" data-use-case="material-builder">
      <Stepper
        current={step}
        onStepChange={setStep}
        items={[
          { id: "source", label: "Source", description: "Photo" },
          { id: "material", label: "Material", description: "Regular" },
          { id: "verify", label: "Verify", description: "3 browsers" },
        ]}
      />
      <div className="landing-builder__form">
        <TextField label="Preset name" defaultValue="Coastal clear" hint="Shared semantic token." />
        <Select
          label="Material"
          defaultValue="regular"
          options={[
            { value: "clear", label: "Clear" },
            { value: "regular", label: "Regular" },
            { value: "frosted", label: "Frosted" },
          ]}
        />
        <NumberField label="Samples" value={samples} min={1} max={8} onValueChange={setSamples} />
        <RadioGroup
          label="Priority"
          defaultValue="balanced"
          items={[
            { value: "quality", label: "Quality" },
            { value: "balanced", label: "Balanced" },
            { value: "speed", label: "Speed" },
          ]}
        />
        <Textarea
          className="landing-builder__notes"
          label="Release note"
          defaultValue="Sharper text, calmer highlights, predictable fallbacks."
        />
        <FileDropzone
          className="landing-builder__dropzone"
          label="Add reference photo"
          accept="image/*"
        />
        <Checkbox label="Use adaptive quality" defaultChecked />
      </div>
    </div>
  );
}

function FeedbackSystem() {
  const [alertVisible, setAlertVisible] = useState(true);

  return (
    <div className="landing-scenario landing-scenario--feedback" data-use-case="feedback-overlays">
      <Banner title="Now on npm" dismissible>
        open-glass-ui 0.4.0 is published. Install it and open an issue if anything breaks.
      </Banner>
      <div className="landing-feedback__grid">
        <div>
          {alertVisible ? (
            <Alert
              title="Fallback verified"
              tone="positive"
              onDismiss={() => setAlertVisible(false)}
            >
              The opaque branch keeps the same semantics.
            </Alert>
          ) : (
            <Button variant="quiet" onClick={() => setAlertVisible(true)}>
              Restore alert
            </Button>
          )}
          <Accordion
            items={[
              {
                id: "fallback",
                title: "What if blur is unavailable?",
                content: "The material resolves to a high-contrast opaque surface.",
              },
              {
                id: "motion",
                title: "What if reduced motion is enabled?",
                content: "Morphing and media pause while every control stays available.",
              },
            ]}
          />
        </div>
        <div className="landing-feedback__actions">
          <div>
            <Spinner label="Verifying package" />
            <Skeleton width="76%" />
            <Skeleton width="54%" />
          </div>
          <Dialog title="Publish material" triggerLabel="Open publish dialog">
            <p>Review the semantic token changes before publishing.</p>
            <Button variant="primary">Confirm</Button>
          </Dialog>
          <Drawer title="Optical settings" triggerLabel="Open settings drawer">
            <Slider label="Edge strength" defaultValue={68} unit="%" />
            <Switch label="Spectral highlight" defaultChecked />
          </Drawer>
          <Toast title="Preset saved" actionLabel="Undo">
            Coastal clear is available locally.
          </Toast>
        </div>
      </div>
    </div>
  );
}

function ScenarioExplorer() {
  const [active, setActive] = useState<ScenarioId>("studio");

  return (
    <Tabs
      className="landing-use-case-tabs"
      label="Product use cases"
      value={active}
      onValueChange={setActive}
      items={[
        { value: "studio", label: "Creative Studio", content: <CreativeStudio /> },
        { value: "analytics", label: "Analytics", content: <AnalyticsConsole /> },
        { value: "builder", label: "Builder", content: <MaterialBuilder /> },
        { value: "feedback", label: "Feedback", content: <FeedbackSystem /> },
      ]}
    />
  );
}

function CodePanel({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  return (
    <div className="landing-code">
      <header>
        <span>{label}</span>
        <Button size="small" variant="quiet" onClick={onCopy}>
          Copy
        </Button>
      </header>
      <pre>
        <code>{value}</code>
      </pre>
    </div>
  );
}

export function LandingPage() {
  const runtime = useGlassRuntime();
  const [scene, setScene] = useState<LandingScene>("motion");
  const [material, setMaterial] = useState<MaterialPresetName>("clear");
  const [frost, setFrost] = useState(() => getMaterialPreset("clear").frost);

  // Choosing a material re-seeds frost from that preset, so the slider always
  // starts from the material you just picked rather than stranding an old value.
  const selectMaterial = (next: MaterialPresetName) => {
    setMaterial(next);
    setFrost(getMaterialPreset(next).frost);
  };
  const [preset, setPreset] = useState<GlassThemePreset>("neutral");
  const [customAccent, setCustomAccent] = useState("");
  const [intensity, setIntensity] = useState(78);
  const [motionEnabled, setMotionEnabled] = useState(true);
  const [lensResponse, setLensResponse] = useState<LensResponse>("balanced");
  const { announcement, copy } = useCopyAnnouncement();
  const effectiveMotion = runtime.motion === "on" && motionEnabled;
  const theme = useMemo<GlassThemeInput>(
    () => ({
      preset,
      contrast: "high",
      radius: "balanced",
      ...(customAccent ? { accent: customAccent } : {}),
    }),
    [customAccent, preset],
  );

  return (
    <GlassThemeProvider
      appearance="dark"
      theme={theme}
      className="site-shell landing-page"
      data-landing-motion=""
      data-motion={effectiveMotion ? "on" : "off"}
    >
      <LandingHeader />
      <main id="main-content" tabIndex={-1}>
        <section className="landing-hero" id="overview">
          <div className="landing-hero__copy">
            <span className="landing-kicker">
              <span>OPENGLASS UI / MATERIAL SYSTEM 01</span>
              <b aria-hidden="true" />
              <span>REACT 18+ · MIT</span>
            </span>
            <h1>Glass is not a blur. It’s an interface system.</h1>
            <p>
              Build cinematic, accessible product interfaces with 40 React components, neutral
              adaptive themes, CSS-first glass materials, and opt-in refraction for controlled
              media.
            </p>
            <div className="landing-hero__actions">
              <AppLink
                className="landing-button landing-button--primary"
                href="/components"
                data-premium-cta="components"
              >
                <span>Explore 40 Components</span>
                <Icon name="arrow" />
              </AppLink>
              <a className="landing-button" href="#setup">
                Read the Quickstart
              </a>
            </div>
            <button
              type="button"
              className="landing-install"
              aria-label="Copy Install Command"
              onClick={() => void copy(INSTALL_COMMAND, "Install command")}
            >
              <span>$</span>
              <code>{INSTALL_COMMAND}</code>
              <small>{announcement.startsWith("Install command copied") ? "Copied" : "Copy"}</small>
            </button>
            <small className="landing-release-note">
              Published on npm · MIT · zero runtime dependencies
            </small>
          </div>

          <section
            className="landing-instrument"
            aria-label="Live material playground"
            data-environment={scene}
            data-accent={customAccent || preset}
            style={{ "--landing-intensity": intensity / 100 } as CSSProperties}
          >
            <div className="landing-instrument__scene" data-lens-response={lensResponse}>
              <LandingBackdrop scene={scene} motion={effectiveMotion} />
              <button
                type="button"
                className="landing-shape landing-shape--spectral"
                data-morph-shape=""
                data-interactive-blob=""
                aria-label="Spectral glass lens"
                aria-pressed={lensResponse === "spectral"}
                onClick={() =>
                  setLensResponse((current) => (current === "spectral" ? "balanced" : "spectral"))
                }
              >
                <i aria-hidden="true" />
              </button>
              <button
                type="button"
                className="landing-shape landing-shape--clear"
                data-morph-shape=""
                data-interactive-blob=""
                aria-label="Frosted glass lens"
                aria-pressed={lensResponse === "frosted"}
                onClick={() =>
                  setLensResponse((current) => (current === "frosted" ? "balanced" : "frosted"))
                }
              >
                <i aria-hidden="true" />
              </button>
              <HeroRuntimeReadout
                material={material}
                intensity={intensity}
                frost={frost}
                onFrostChange={setFrost}
              />
              <span className="landing-lens-readout" role="status" aria-live="polite">
                Hover to bend · click to hold / <strong>{lensResponse}</strong>
              </span>
              <span className="landing-instrument__caption">
                <i aria-hidden="true" /> Live CSS / native DOM
              </span>
            </div>
            <HeroControls
              scene={scene}
              onSceneChange={setScene}
              material={material}
              onMaterialChange={selectMaterial}
              accent={preset}
              onAccentChange={setPreset}
              customAccent={customAccent}
              onCustomAccentChange={setCustomAccent}
              intensity={intensity}
              onIntensityChange={setIntensity}
              motion={motionEnabled}
              onMotionChange={setMotionEnabled}
              systemMotion={runtime.motion}
            />
          </section>
        </section>

        <section className="landing-proof" aria-label="OpenGlass UI facts">
          <div>
            <strong>40</strong>
            <span>Accessible components</span>
          </div>
          <div>
            <strong>0</strong>
            <span>Runtime dependencies</span>
          </div>
          <div>
            <strong>1</strong>
            <span>Package to install</span>
          </div>
          <div>
            <strong>3</strong>
            <span>Browser engines tested</span>
          </div>
          <div>
            <strong>18+</strong>
            <span>React versions supported</span>
          </div>
          <div>
            <strong>MIT</strong>
            <span>Licensed, free forever</span>
          </div>
        </section>

        <section
          className="landing-section landing-liquid"
          id="liquid"
          aria-labelledby="liquid-heading"
        >
          <div className="landing-section__intro">
            <span className="landing-index">New in 0.4 / Liquid</span>
            <h2 id="liquid-heading">Liquid by default. Classic in one prop.</h2>
            <p>
              Clearer, brighter glass with one clean lit edge, pill-shaped controls, and selection
              that flows. Drag the divider, try a look, move the light. Upgrading from 0.3? Pass
              design="classic" and nothing changes.
            </p>
          </div>
          <LiquidShowcase compareHref="/compare" />
        </section>

        <section className="landing-section landing-benefits" aria-labelledby="benefits-heading">
          <div className="landing-section__intro">
            <span className="landing-index">01 / System</span>
            <h2 id="benefits-heading">Cinematic when it matters. Dependable everywhere.</h2>
            <p>
              The surface adapts. The contract does not. OpenGlass keeps spectacle at the edges and
              interaction semantics at the center.
            </p>
          </div>
          <div className="landing-benefit-grid">
            <Benefit index="A" title="CSS-first by default">
              Inspectable, themeable materials with an intentional opaque fallback.
            </Benefit>
            <Benefit index="B" title="Native DOM throughout">
              Real text, forms, focus, selection, and keyboard behavior.
            </Benefit>
            <Benefit index="C" title="Adaptive by design">
              Reduced motion, reduced transparency, forced colors, and capability policy.
            </Benefit>
            <Benefit index="D" title="40 complete components">
              From buttons and menus to dialogs, inputs, toasts, and navigation.
            </Benefit>
            <Benefit index="E" title="Theme it in seconds">
              Neutral defaults, six presets, semantic colors, and safe foregrounds.
            </Benefit>
            <Benefit index="F" title="Spectacle on demand">
              Opt-in owned-media refraction without burdening ordinary controls.
            </Benefit>
          </div>
        </section>

        <section
          className="landing-section landing-topology"
          id="materials"
          aria-labelledby="topology-heading"
        >
          <div className="landing-section__intro">
            <span className="landing-index">02 / Material anatomy</span>
            <h2 id="topology-heading">See what each optical layer is doing.</h2>
            <p>
              Each study isolates one job: protect text, reveal simulated thickness, or add
              restrained chromatic depth. The irregular outline makes those optics feel formed
              rather than synthetic.
            </p>
          </div>
          <div className="landing-topology__stage">
            <article
              className="landing-topology__card"
              data-material-study="frost"
              data-material-effect="backdrop diffusion"
              data-material-use="menus dialogs toasts"
            >
              <div
                className="landing-topology__source landing-topology__source--frost"
                aria-hidden="true"
              >
                <small>SOURCE</small>
                <strong>94</strong>
                <i />
              </div>
              <div
                className="landing-topology__shape landing-topology__shape--frost"
                data-morph-shape=""
                aria-hidden
              >
                <i />
              </div>
              <div className="landing-topology__copy">
                <span>01 / Frost · Legibility layer</span>
                <h3>Frost diffuses the source, not the content.</h3>
                <p>
                  The color and detail behind the pane soften while labels rendered above it stay
                  sharp and high-contrast.
                </p>
                <small className="landing-topology__mechanic">
                  <b>USE</b> Menus, dialogs &amp; toasts
                </small>
              </div>
            </article>
            <article
              className="landing-topology__card"
              data-material-study="thickness"
              data-material-effect="geometry to refraction"
              data-material-use="diagnostics and material tuning"
            >
              <div
                className="landing-topology__shape landing-topology__shape--contour"
                data-morph-shape=""
                aria-hidden
              >
                <i />
                <span className="landing-topology__depth">
                  <b>CORE 1 / MORE BEND</b>
                  <b>EDGE 0 / EDGE LIGHT</b>
                </span>
              </div>
              <div className="landing-topology__copy">
                <span>02 / Thickness · Geometry input</span>
                <h3>Contours map simulated glass thickness.</h3>
                <p>
                  Distance from the edge becomes a thickness field: the core bends more, while the
                  perimeter catches light. The rings are a diagnostic, not decoration.
                </p>
                <small className="landing-topology__mechanic">
                  <b>MAP</b> Geometry → refraction strength
                </small>
              </div>
            </article>
            <article
              className="landing-topology__card"
              data-material-study="spectral"
              data-material-effect="perimeter dispersion"
              data-material-use="owned image and video surfaces"
            >
              <div
                className="landing-topology__source landing-topology__source--chroma"
                aria-hidden="true"
              >
                <small>OWNED MEDIA</small>
                <strong>R · G · B</strong>
                <i />
              </div>
              <div
                className="landing-topology__shape landing-topology__shape--chroma"
                data-morph-shape=""
                aria-hidden
              >
                <i />
              </div>
              <div className="landing-topology__copy">
                <span>03 / Spectral · Media accent</span>
                <h3>Dispersion belongs at the perimeter.</h3>
                <p>
                  Coral and teal separate at the boundary while the center remains neutral and
                  legible. Reserve it for imagery and motion—not text surfaces.
                </p>
                <small className="landing-topology__mechanic">
                  <b>USE</b> Owned image &amp; video surfaces
                </small>
              </div>
            </article>
          </div>
        </section>

        <section className="landing-section landing-scenarios" aria-labelledby="scenarios-heading">
          <div className="landing-section__intro">
            <span className="landing-index">03 / In product</span>
            <h2 id="scenarios-heading">Not isolated effects. Working interface compositions.</h2>
            <p>
              Open the overlays, change the data, scrub the media, and move through the workflow.
              These are the same exported recipes consumers receive.
            </p>
          </div>
          <ScenarioExplorer />
        </section>

        <section className="landing-section landing-inventory" aria-labelledby="inventory-heading">
          <div className="landing-section__intro landing-section__intro--split">
            <div>
              <span className="landing-index">04 / Component system</span>
              <h2 id="inventory-heading">40 components. One predictable API.</h2>
            </div>
            <div>
              <p>
                Every primitive is interactive in the full catalog, built with semantic DOM, and
                governed by the same neutral token system.
              </p>
              <AppLink className="landing-text-link" href="/components">
                Open the complete component catalog <Icon name="arrow" />
              </AppLink>
            </div>
          </div>
          <InventoryBench />
          <div className="landing-inventory__groups">
            {COMPONENT_GROUPS.map((group, groupIndex) => (
              <article key={group.title}>
                <header>
                  <span>0{groupIndex + 1}</span>
                  <div>
                    <h3>{group.title}</h3>
                    <p>{group.description}</p>
                  </div>
                  <strong>{String(group.components.length).padStart(2, "0")}</strong>
                </header>
                <div>
                  {group.components.map((component) => (
                    <span key={component} data-component-name={component}>
                      {component}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className="landing-section landing-setup"
          id="setup"
          aria-labelledby="setup-heading"
        >
          <div className="landing-section__intro">
            <span className="landing-index">05 / Setup</span>
            <h2 id="setup-heading">One stylesheet. One provider. Use the components you need.</h2>
            <p>
              One package, zero runtime dependencies, and React stays a peer so your app owns its
              version. Copy the command and you are three lines from a glass surface.
            </p>
          </div>
          <div className="landing-setup__grid">
            <div className="landing-setup__steps">
              <article>
                <span>01</span>
                <div>
                  <h3>Install the public facade</h3>
                  <p>React and React DOM remain peers, so your application owns their versions.</p>
                </div>
              </article>
              <article>
                <span>02</span>
                <div>
                  <h3>Set the adaptive boundary</h3>
                  <p>Neutral light and dark tokens work immediately. Override colors when ready.</p>
                </div>
              </article>
              <article>
                <span>03</span>
                <div>
                  <h3>Compose native controls</h3>
                  <p>
                    Import only what the surface needs; enhanced media remains an opt-in subpath.
                  </p>
                </div>
              </article>
            </div>
            <div>
              <CodePanel
                label="Terminal"
                value={INSTALL_COMMAND}
                onCopy={() => void copy(INSTALL_COMMAND, "Install command")}
              />
              <CodePanel
                label="App.tsx"
                value={QUICKSTART}
                onCopy={() => void copy(QUICKSTART, "Quickstart")}
              />
            </div>
          </div>
        </section>

        <section className="landing-section landing-ai" id="ai" aria-labelledby="ai-heading">
          <div className="landing-ai__visual" aria-hidden="true">
            <span className="landing-ai__prompt">
              <i />
              <code>renderer="auto"</code>
            </span>
            <span className="landing-ai__prompt">
              <i />
              <code>semantic DOM</code>
            </span>
            <span className="landing-ai__prompt">
              <i />
              <code>reduced motion</code>
            </span>
            <span className="landing-ai__lens" data-morph-shape="">
              <i />
            </span>
          </div>
          <div className="landing-ai__copy">
            <span className="landing-index">06 / For AI agents</span>
            <h2 id="ai-heading">Give your agent the right constraints.</h2>
            <p>
              A compact integration prompt tells an agent which facade to use, when enhanced optics
              are appropriate, and which accessibility behavior must stay intact.
            </p>
            <blockquote>{AGENT_PROMPT}</blockquote>
            <div className="landing-ai__actions">
              <Button variant="primary" onClick={() => void copy(AGENT_PROMPT, "AI agent prompt")}>
                Copy AI Agent Prompt
              </Button>
              <a className="landing-ai__link" href="/llms.txt">
                Read llms.txt
              </a>
              <a className="landing-ai__link" href="/llms-full.txt">
                Read llms-full.txt
              </a>
              <AppLink className="landing-ai__link" href="/docs">
                Open integration guide
              </AppLink>
            </div>
          </div>
        </section>

        <section
          className="landing-section landing-validation"
          aria-labelledby="validation-heading"
        >
          <div className="landing-validation__lead">
            <span className="landing-index">07 / Evidence</span>
            <h2 id="validation-heading">Built to survive more than the hero shot.</h2>
            <AppLink className="landing-text-link" href="/validation">
              Inspect validation evidence <Icon name="arrow" />
            </AppLink>
          </div>
          <div className="landing-validation__grid">
            <article>
              <strong>137</strong>
              <span>Unit, SSR, and recipe checks</span>
              <p>Geometry, policy, theming, package contracts, and native interaction behavior.</p>
            </article>
            <article>
              <strong>3×</strong>
              <span>Browser engines</span>
              <p>Chromium, Firefox, and WebKit at desktop and mobile boundaries.</p>
            </article>
            <article>
              <strong>0</strong>
              <span>Eager WebGL inputs</span>
              <p>The CSS-first package root keeps advanced optics behind an explicit import.</p>
            </article>
            <article>
              <strong>28%</strong>
              <span>Barrel cost for one component</span>
              <p>
                Importing a single component pulls 17.8 KB of the 63.7 KB barrel, so unused
                components are shaken out rather than shipped.
              </p>
            </article>
          </div>
        </section>

        <section className="landing-final">
          <span className="landing-final__shape" data-morph-shape="" aria-hidden="true">
            <i />
          </span>
          <div>
            <span className="landing-kicker">OpenGlass UI / open source</span>
            <h2>Make the interface feel dimensional. Keep the product usable.</h2>
            <p>
              Explore every live component, theme the system, and take a production-minded glass
              foundation into your next React project.
            </p>
            <div className="landing-final__actions">
              <AppLink
                className="landing-button landing-button--primary"
                href="/components"
                data-premium-cta="components"
              >
                <span>Explore 40 Components</span>
                <Icon name="arrow" />
              </AppLink>
              <button
                type="button"
                className="landing-button"
                onClick={() => void copy(INSTALL_COMMAND, "Install command")}
              >
                Copy Install Command
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <Wordmark />
        <p>
          CSS-first liquid glass for the open web.
          <br />
          Native semantics · adaptive materials · MIT.
        </p>
        <nav aria-label="Secondary navigation">
          <AppLink href="/components">Components</AppLink>
          <AppLink href="/docs">Documentation</AppLink>
          <AppLink href="/validation">Validation</AppLink>
          <AppLink href="/research">Material research</AppLink>
          <a href={REPOSITORY_URL} rel="noreferrer">
            GitHub
          </a>
          <a href={`${REPOSITORY_URL}/blob/main/CONTRIBUTING.md`} rel="noreferrer">
            Contribute
          </a>
        </nav>
      </footer>

      <div
        className="ogui-sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-copy-status=""
      >
        {announcement}
      </div>
    </GlassThemeProvider>
  );
}
