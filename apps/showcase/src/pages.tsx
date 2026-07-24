import type { MaterialPresetName } from "@prism-lab/core";
import { Glass, useGlassRuntime } from "@prism-lab/react";
import {
  Button,
  Dock,
  IconButton,
  MediaControls,
  Menu,
  MenuItem,
  Popover,
  SegmentedControl,
  Slider,
  Switch,
  Tabs,
  Toolbar,
  Tooltip,
} from "@prism-lab/recipes";
import { type ReactNode, useState } from "react";
import { AppLink } from "./app";
import {
  ENVIRONMENT_LABELS,
  ENVIRONMENTS,
  type EngineId,
  type EnvironmentId,
  EXPERIMENTS,
  getExperiment,
} from "./data";
import {
  EngineDefinitions,
  EnvironmentBackdrop,
  engineStyle,
  WebGLBackdrop,
} from "./engine-visuals";
import { Icon } from "./icons";

function Wordmark() {
  return (
    <AppLink href="/" className="wordmark" aria-label="Prism Lab comparison home">
      <span className="wordmark__mark" aria-hidden="true">
        P
      </span>
      <span>
        <strong>PRISM</strong>
        <small>Material research 001</small>
      </span>
    </AppLink>
  );
}

export function SiteHeader({
  active,
  section,
}: {
  active?: EngineId;
  section?: "library" | "docs" | "validation";
}) {
  return (
    <header className="site-header">
      <Wordmark />
      <nav className="site-header__nav" aria-label="Primary navigation">
        <AppLink href="/" className={!active && !section ? "is-active" : undefined}>
          Index
        </AppLink>
        <AppLink href="/library" className={section === "library" ? "is-active" : undefined}>
          Library
        </AppLink>
        <AppLink href="/docs" className={section === "docs" ? "is-active" : undefined}>
          Architecture
        </AppLink>
        <AppLink href="/validation" className={section === "validation" ? "is-active" : undefined}>
          Validation
        </AppLink>
      </nav>
      <div className="site-header__status">
        <span className="status-light" aria-hidden="true" />
        Research build
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <Wordmark />
      <p>
        Five rendering hypotheses. One shared test harness.
        <br />
        Built as clean-room, MIT-licensed research.
      </p>
      <div>
        <AppLink href="/library">Open component atlas</AppLink>
        <AppLink href="/docs">Read the architecture</AppLink>
        <AppLink href="/validation">View validation</AppLink>
      </div>
    </footer>
  );
}

function MethodPill({ children }: { children: ReactNode }) {
  return <span className="method-pill">{children}</span>;
}

function HomePreview({ engine }: { engine: EngineId }) {
  return (
    <div className={`home-preview home-preview--${engine}`} aria-hidden="true">
      <span className="home-preview__orb" />
      <span className="home-preview__grid" />
      <span className="home-preview__lens home-preview__lens--large">
        <i />
      </span>
      <span className="home-preview__lens home-preview__lens--small" />
      {engine === "organic" ? <span className="home-preview__flow" /> : null}
      {engine === "sdf" ? <span className="home-preview__measure">R 1.46</span> : null}
      {engine === "webgl" ? <span className="home-preview__spectrum" /> : null}
      {engine === "hybrid" ? <span className="home-preview__policy">AUTO / SDF / CSS</span> : null}
    </div>
  );
}

export function ComparisonHome() {
  return (
    <div className="site-shell home-page">
      <SiteHeader />
      <main>
        <section className="home-hero">
          <div className="eyebrow">
            <span>Independent material study</span>
            <span>July 2026</span>
          </div>
          <div className="home-hero__title">
            <h1>
              Glass is not
              <br />a blur.
            </h1>
            <p>
              Five materially different ways to build optical interfaces for React—from dependable
              CSS to a controlled-media shader and an adaptive production policy.
            </p>
          </div>
          <div className="home-hero__instrument" aria-hidden="true">
            <span className="hero-scope hero-scope--a" />
            <span className="hero-scope hero-scope--b" />
            <span className="hero-scope hero-scope--c" />
            <div className="hero-instrument__plate">
              <small>OPTICAL STUDY / 001</small>
              <strong>5</strong>
              <span>renderers under identical load</span>
            </div>
          </div>
        </section>

        <section className="index-section" aria-labelledby="experiments-heading">
          <div className="section-heading section-heading--line">
            <div>
              <span className="section-index">A</span>
              <p className="section-kicker">The experiments</p>
            </div>
            <h2 id="experiments-heading">Same controls. Different physics.</h2>
          </div>
          <div className="experiment-index">
            {EXPERIMENTS.map((experiment) => (
              <article
                key={experiment.id}
                className={`experiment-card experiment-card--${experiment.id}`}
                style={{ "--experiment-accent": experiment.accent } as React.CSSProperties}
              >
                <AppLink
                  href={`/experiments/${experiment.id}`}
                  className="experiment-card__link"
                  aria-label={`Open ${experiment.title}`}
                >
                  <div className="experiment-card__meta">
                    <span>{experiment.index}</span>
                    <MethodPill>{experiment.renderer}</MethodPill>
                  </div>
                  <HomePreview engine={experiment.id} />
                  <div className="experiment-card__copy">
                    <h3>{experiment.title}</h3>
                    <p>{experiment.thesis}</p>
                  </div>
                  <div className="experiment-card__footer">
                    <span>{experiment.artDirection}</span>
                    <span className="round-arrow">
                      <Icon name="arrow" />
                    </span>
                  </div>
                </AppLink>
              </article>
            ))}
          </div>
        </section>

        <section className="home-thesis">
          <div>
            <span className="section-index">B</span>
            <p className="section-kicker">First principles</p>
          </div>
          <blockquote>
            “Use glass to reveal hierarchy and depth—never to make content prove it can survive an
            effect.”
          </blockquote>
          <div className="thesis-notes">
            <p>Text stays native DOM. Motion stays outside React state. Accessibility wins ties.</p>
            <AppLink href="/docs" className="text-link">
              Inspect the system <Icon name="arrow" />
            </AppLink>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

interface LabState {
  material: MaterialPresetName;
  intensity: number;
  dispersion: boolean;
  motion: boolean;
  environment: EnvironmentId;
  contrast: "auto" | "light" | "dark";
}

function RuntimeReadout({ engine, ready }: { engine: EngineId; ready: boolean }) {
  const runtime = useGlassRuntime();
  const capability =
    engine === "webgl"
      ? runtime.capabilities.webgl2
      : engine === "organic" || engine === "sdf"
        ? runtime.capabilities.svgFilterElements
        : runtime.capabilities.backdropFilter;

  return (
    <div className="runtime-readout" role="status" aria-label="Runtime status">
      <span>
        <i className={capability && ready ? "is-ready" : ""} aria-hidden="true" />
        {capability && ready ? "Enhanced path ready" : "Stable fallback active"}
      </span>
      <span>Quality / {runtime.quality}</span>
      <span>Motion / {runtime.motion}</span>
    </div>
  );
}

function EngineAnnotation({ engine }: { engine: EngineId }) {
  const runtime = useGlassRuntime();

  if (engine === "css") {
    return (
      <div className="css-layer-legend" aria-hidden="true">
        <span>01 / source</span>
        <span>02 / blur + tint</span>
        <span>03 / edge light</span>
      </div>
    );
  }

  if (engine === "organic") {
    return (
      <div className="organic-caustic" aria-hidden="true">
        <i />
        <i />
      </div>
    );
  }

  if (engine === "sdf") {
    return (
      <div className="sdf-fiducials" aria-hidden="true">
        <span className="sdf-fiducials__x">X / 440</span>
        <span className="sdf-fiducials__y">Y / 232</span>
        <span className="sdf-fiducials__normal">N̂ / RGB</span>
      </div>
    );
  }

  if (engine === "webgl") {
    return (
      <aside className="source-ownership" aria-label="WebGL source ownership">
        <span>Source / owned canvas</span>
        <span>Lens batch / 02</span>
        <span>Texture / live</span>
      </aside>
    );
  }

  const accessibilityOverride =
    runtime.capabilities.forcedColors || runtime.capabilities.reducedTransparency;
  const domRenderer =
    runtime.capabilities.svgFilterElements && runtime.capabilities.backdropUrlSyntax
      ? "SDF"
      : "CSS";
  const mediaRenderer = runtime.capabilities.webgl2 ? "GL2" : "CSS";

  return (
    <aside className="policy-rail" aria-label="Adaptive renderer policy">
      <span className={!accessibilityOverride ? "is-active" : ""}>
        <i aria-hidden="true" />
        DOM / {domRenderer}
      </span>
      <span>
        <i aria-hidden="true" />
        MEDIA / {mediaRenderer}
      </span>
      <span className={accessibilityOverride ? "is-active" : ""}>
        <i aria-hidden="true" />
        A11Y / OPAQUE
      </span>
    </aside>
  );
}

function InstrumentControls({
  experiment,
  lab,
  filterId,
  ready,
}: {
  experiment: (typeof EXPERIMENTS)[number];
  lab: LabState;
  filterId?: string | undefined;
  ready: boolean;
}) {
  const [playing, setPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(38);
  const tone = lab.contrast === "light" ? "light" : "dark";

  return (
    <div
      className={`instrument instrument--${experiment.id}`}
      style={engineStyle(filterId, lab.intensity, experiment.accent)}
    >
      {experiment.id === "webgl" ? (
        <WebGLBackdrop
          intensity={lab.intensity}
          dispersion={lab.dispersion}
          material={lab.material}
          motion={lab.motion}
        />
      ) : (
        <EnvironmentBackdrop environment={lab.environment} className="instrument__environment" />
      )}
      <EngineAnnotation engine={experiment.id} />

      <div className="instrument__chrome">
        <div className="instrument__topline">
          <div>
            <span className="instrument__serial">PL–{experiment.index} / LIVE SPECIMEN</span>
            <h2>Field recorder</h2>
          </div>
          <Toolbar label="View tools" material="clear" tone={tone}>
            <Tooltip label="Change layout">
              <IconButton aria-label="Change layout" size="small">
                <Icon name="grid" />
              </IconButton>
            </Tooltip>
            <Tooltip label="Tune optics">
              <IconButton aria-label="Tune optics" size="small">
                <Icon name="tune" />
              </IconButton>
            </Tooltip>
            <Menu
              label="More actions"
              trigger={
                <IconButton aria-label="More actions" size="small">
                  <Icon name="more" />
                </IconButton>
              }
              placement="end"
            >
              <MenuItem>Duplicate specimen</MenuItem>
              <MenuItem>Copy configuration</MenuItem>
              <MenuItem destructive>Reset instrument</MenuItem>
            </Menu>
          </Toolbar>
        </div>

        <Glass
          className={`engine-surface engine-surface--${experiment.id}`}
          material={lab.material}
          tone={tone}
          interactive
          geometry={{
            kind: "superellipse",
            width: 840,
            height: 420,
            cornerRadius: 44,
            exponent: 4.4,
          }}
        >
          <span className="engine-surface__optics" aria-hidden="true" />
          <div className="engine-surface__header">
            <div className="signal-label">
              <span className="signal-label__pulse" aria-hidden="true" />
              Live input
            </div>
            <span>STN–0048 / COASTAL FIELD</span>
          </div>
          <div className="engine-surface__body">
            <div className="recording-title">
              <p>Ambient capture</p>
              <h3>Night Current</h3>
              <span>48 kHz · 24-bit · Stereo</span>
            </div>
            <div className="waveform" aria-hidden="true">
              {Array.from({ length: 42 }, (_, index) => (
                <i
                  // biome-ignore lint/suspicious/noArrayIndexKey: static deterministic waveform
                  key={index}
                  style={{ "--wave": `${18 + ((index * 37) % 72)}%` } as React.CSSProperties}
                />
              ))}
            </div>
          </div>
          <MediaControls
            className="engine-surface__media"
            playing={playing}
            currentTime={currentTime}
            duration={184}
            muted={false}
            onPlayingChange={setPlaying}
            onSeek={setCurrentTime}
            onMutedChange={() => undefined}
          />
          <div className="engine-surface__actions">
            <SegmentedControl
              aria-label="Recording channel"
              defaultValue="mix"
              items={[
                { value: "left", label: "Left" },
                { value: "mix", label: "Mix" },
                { value: "right", label: "Right" },
              ]}
            />
            <div>
              <Button variant="quiet">Discard</Button>
              <Button variant="primary" leadingIcon={<Icon name="check" />}>
                Save capture
              </Button>
            </div>
          </div>
        </Glass>

        <div className="instrument__lower">
          <Dock label="Instrument dock" material="regular" tone={tone}>
            <Tooltip label="Library">
              <IconButton aria-label="Open library" size="small">
                <Icon name="grid" />
              </IconButton>
            </Tooltip>
            <IconButton aria-label="Create capture" size="small" variant="primary">
              <Icon name="spark" />
            </IconButton>
            <Popover
              label="Signal settings"
              placement="center"
              trigger={
                <IconButton aria-label="Open signal settings" size="small">
                  <Icon name="tune" />
                </IconButton>
              }
            >
              <strong>Signal window</strong>
              <p>Transient controls remain native DOM above the optical surface.</p>
            </Popover>
          </Dock>
          <RuntimeReadout engine={experiment.id} ready={ready} />
        </div>
      </div>
    </div>
  );
}

function ParameterLab({ lab, onChange }: { lab: LabState; onChange: (next: LabState) => void }) {
  return (
    <Glass className="parameter-lab" material="frosted" tone="dark">
      <div className="parameter-lab__heading">
        <div>
          <span className="section-index">LAB</span>
          <h2>Material calibration</h2>
        </div>
        <p>Only parameters with perceptible, explainable output are exposed.</p>
      </div>
      <div className="parameter-lab__grid">
        <div className="lab-group">
          <span className="lab-label">Environment</span>
          <SegmentedControl
            aria-label="Preview environment"
            value={lab.environment}
            onValueChange={(environment) => onChange({ ...lab, environment })}
            items={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
              { value: "photo", label: "Photo" },
              { value: "motion", label: "Motion" },
            ]}
          />
        </div>
        <div className="lab-group">
          <span className="lab-label">Material</span>
          <SegmentedControl
            aria-label="Material preset"
            value={lab.material}
            onValueChange={(material) => onChange({ ...lab, material })}
            items={[
              { value: "clear", label: "Clear" },
              { value: "regular", label: "Regular" },
              { value: "frosted", label: "Frosted" },
            ]}
          />
        </div>
        <Slider
          label="Optical intensity"
          min={20}
          max={100}
          value={Math.round(lab.intensity * 100)}
          unit="%"
          onChange={(event) =>
            onChange({ ...lab, intensity: Number(event.currentTarget.value) / 100 })
          }
        />
        <div className="lab-switches">
          <Switch
            label="Spectral edge"
            description="Restrained RGB separation"
            checked={lab.dispersion}
            onCheckedChange={(dispersion) => onChange({ ...lab, dispersion })}
          />
          <Switch
            label="Material motion"
            description="Respects reduced motion"
            checked={lab.motion}
            onCheckedChange={(motion) => onChange({ ...lab, motion })}
          />
        </div>
      </div>
    </Glass>
  );
}

function BackgroundMatrix({
  experiment,
  lab,
  filterId,
}: {
  experiment: (typeof EXPERIMENTS)[number];
  lab: LabState;
  filterId?: string | undefined;
}) {
  return (
    <div className="background-matrix">
      {ENVIRONMENTS.map((environment) => (
        <EnvironmentBackdrop key={environment} environment={environment} className="matrix-tile">
          <Glass
            className={`matrix-tile__sample engine-surface--${experiment.id}`}
            style={engineStyle(filterId, lab.intensity, experiment.accent)}
            material={lab.material}
            tone={environment === "light" ? "light" : "dark"}
          >
            <span className="engine-surface__optics" aria-hidden="true" />
            <span>{ENVIRONMENT_LABELS[environment]}</span>
            <strong>12:48</strong>
            <small>{experiment.id === "webgl" ? "DOM fallback" : experiment.renderer}</small>
          </Glass>
        </EnvironmentBackdrop>
      ))}
    </div>
  );
}

function RendererExplanation({ experiment }: { experiment: (typeof EXPERIMENTS)[number] }) {
  return (
    <div className="method-grid">
      <div className="method-grid__lead">
        <span className="section-index">METHOD</span>
        <h2>What this route is actually doing.</h2>
        <p>{experiment.method}</p>
      </div>
      <dl>
        <div>
          <dt>Enhanced renderer</dt>
          <dd>{experiment.renderer}</dd>
        </div>
        <div>
          <dt>Stable fallback</dt>
          <dd>{experiment.fallback}</dd>
        </div>
        <div>
          <dt>Known limit</dt>
          <dd>{experiment.limitation}</dd>
        </div>
      </dl>
      <div className="method-grid__strengths">
        {experiment.strengths.map((strength, index) => (
          <div key={strength}>
            <span>0{index + 1}</span>
            {strength}
          </div>
        ))}
      </div>
    </div>
  );
}

function ExperimentNav({ active }: { active: EngineId }) {
  return (
    <nav className="experiment-nav" aria-label="Experiment routes">
      {EXPERIMENTS.map((experiment) => (
        <AppLink
          key={experiment.id}
          href={`/experiments/${experiment.id}`}
          className={experiment.id === active ? "is-active" : undefined}
          aria-label={`Experiment ${experiment.index}: ${experiment.shortTitle}`}
        >
          <span>{experiment.index}</span>
          <span>{experiment.shortTitle}</span>
        </AppLink>
      ))}
    </nav>
  );
}

export function ExperimentPage({ id }: { id: string }) {
  const experiment = getExperiment(id);
  const [lab, setLab] = useState<LabState>({
    material: "regular",
    intensity: 0.72,
    dispersion: true,
    motion: true,
    environment: id === "css" ? "photo" : id === "sdf" ? "noise" : "motion",
    contrast: "auto",
  });

  if (!experiment) {
    return (
      <div className="site-shell">
        <SiteHeader />
        <main className="not-found">
          <p className="section-kicker">Unknown specimen</p>
          <h1>That experiment does not exist.</h1>
          <AppLink href="/" className="text-link">
            Return to the index <Icon name="arrow" />
          </AppLink>
        </main>
      </div>
    );
  }

  return (
    <div
      className={`site-shell experiment-page experiment-page--${experiment.id}`}
      style={{ "--experiment-accent": experiment.accent } as React.CSSProperties}
    >
      <SiteHeader active={experiment.id} />
      <main>
        <ExperimentNav active={experiment.id} />
        <section className="experiment-hero">
          <div className="experiment-hero__index">{experiment.index}</div>
          <div className="experiment-hero__copy">
            <div className="eyebrow">
              <span>{experiment.artDirection}</span>
              <MethodPill>{experiment.renderer}</MethodPill>
            </div>
            <h1>{experiment.title}</h1>
            <p>{experiment.thesis}</p>
          </div>
          <div className="experiment-hero__score">
            <span>Final score</span>
            <strong>{experiment.finalScore}</strong>
            <small>/ 100</small>
          </div>
        </section>

        <EngineDefinitions
          engine={experiment.id}
          intensity={lab.intensity}
          dispersion={lab.dispersion}
          material={lab.material}
          motion={lab.motion}
        >
          {(filterId, ready) => (
            <>
              <section className="specimen-section" aria-label="Interactive component specimen">
                <InstrumentControls
                  experiment={experiment}
                  lab={lab}
                  filterId={filterId}
                  ready={ready}
                />
              </section>

              <section className="lab-section">
                <ParameterLab lab={lab} onChange={setLab} />
              </section>

              <section className="stress-section" aria-labelledby="stress-heading">
                <div className="section-heading">
                  <div>
                    <span className="section-index">STRESS</span>
                    <p className="section-kicker">Contrast matrix</p>
                  </div>
                  <div>
                    <h2 id="stress-heading">Six hostile environments.</h2>
                    <p>
                      The same compact specimen crosses light, dark, noisy, chromatic, photographic,
                      and moving sources.
                    </p>
                  </div>
                </div>
                <BackgroundMatrix experiment={experiment} lab={lab} filterId={filterId} />
              </section>
            </>
          )}
        </EngineDefinitions>

        <section className="components-section" aria-labelledby="components-heading">
          <div className="section-heading">
            <div>
              <span className="section-index">UI</span>
              <p className="section-kicker">Recipe inventory</p>
            </div>
            <div>
              <h2 id="components-heading">One semantic surface.</h2>
              <p>Buttons through popovers use the same copy-owned recipes on every route.</p>
            </div>
          </div>
          <Glass className="recipe-board" material="regular" tone="dark">
            <Tabs
              label="Recipe categories"
              items={[
                {
                  value: "actions",
                  label: "Actions",
                  content: (
                    <div className="recipe-row">
                      <Button variant="primary">Primary</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="quiet">Quiet</Button>
                      <Button variant="danger">Destructive</Button>
                      <Button disabled>Disabled</Button>
                      <IconButton aria-label="Tune sample">
                        <Icon name="tune" />
                      </IconButton>
                    </div>
                  ),
                },
                {
                  value: "selection",
                  label: "Selection",
                  content: (
                    <div className="recipe-row">
                      <SegmentedControl
                        aria-label="Density"
                        items={[
                          { value: "calm", label: "Calm" },
                          { value: "balanced", label: "Balanced" },
                          { value: "dense", label: "Dense" },
                        ]}
                        defaultValue="balanced"
                      />
                      <Switch label="Live optics" defaultChecked />
                    </div>
                  ),
                },
                {
                  value: "disclosure",
                  label: "Disclosure",
                  content: (
                    <div className="recipe-row">
                      <Menu label="Material menu" trigger={<Button>Open menu</Button>}>
                        <MenuItem>Clear material</MenuItem>
                        <MenuItem>Regular material</MenuItem>
                        <MenuItem>Frosted material</MenuItem>
                      </Menu>
                      <Popover label="About the sample" trigger={<Button>Open popover</Button>}>
                        Native disclosure behavior with a glass visual surface.
                      </Popover>
                      <Tooltip label="Keyboard and pointer accessible">
                        <Button>Focus for tooltip</Button>
                      </Tooltip>
                    </div>
                  ),
                },
              ]}
            />
          </Glass>
        </section>

        <section className="method-section">
          <RendererExplanation experiment={experiment} />
        </section>
      </main>
      <Footer />
    </div>
  );
}

function DocumentationShell({
  title,
  kicker,
  section,
  children,
}: {
  title: string;
  kicker: string;
  section: "docs" | "validation";
  children: ReactNode;
}) {
  return (
    <div className="site-shell document-page">
      <SiteHeader section={section} />
      <main>
        <header className="document-hero">
          <p className="section-kicker">{kicker}</p>
          <h1>{title}</h1>
        </header>
        {children}
      </main>
      <Footer />
    </div>
  );
}

export function DocumentationView() {
  return (
    <DocumentationShell title="Architecture before spectacle." kicker="System / 01" section="docs">
      <div className="document-layout">
        <aside>
          <span>On this page</span>
          <a href="#layers">Layer model</a>
          <a href="#policy">Renderer policy</a>
          <a href="#api">React surface</a>
          <a href="#limits">Limits</a>
        </aside>
        <article>
          <section id="layers">
            <p className="document-number">01</p>
            <h2>Four layers, narrow contracts.</h2>
            <p>
              A dependency-free optics core produces geometry and maps. Renderer adapters convert
              that data into CSS, SVG, or WebGL2 work. React owns lifecycle—not the math. Recipes
              own accessible behavior without becoming optics internals.
            </p>
            <div className="architecture-stack">
              {[
                ["Recipes", "Buttons, tabs, menus, media controls"],
                ["React", "Provider, Glass, filters, media surface"],
                ["Renderers", "CSS policy, SVG resources, WebGL2"],
                ["Core", "SDF geometry, normals, maps, cache"],
              ].map(([name, description]) => (
                <div key={name}>
                  <strong>{name}</strong>
                  <span>{description}</span>
                </div>
              ))}
            </div>
          </section>
          <section id="policy">
            <p className="document-number">02</p>
            <h2>Capability policy, not browser names.</h2>
            <p>
              Controlled media can graduate to WebGL2. Supplied DOM can use SVG displacement when
              supported. Arbitrary DOM falls back to disciplined CSS. Forced colors and reduced
              transparency always choose an opaque semantic material.
            </p>
          </section>
          <section id="api">
            <p className="document-number">03</p>
            <h2>Semantic first, optical escape hatches second.</h2>
            <pre>
              <code>{`<Glass material="regular" interactive>
  <Toolbar label="Editing tools">…</Toolbar>
</Glass>`}</code>
            </pre>
          </section>
          <section id="limits">
            <p className="document-number">04</p>
            <h2>Honest boundaries.</h2>
            <p>
              Browsers do not expose arbitrary pixels behind a DOM node to shaders. SVG backdrop
              filtering remains inconsistent. WebGL therefore requires owned image, canvas, or video
              sources, and CSS remains the universal safety net.
            </p>
          </section>
        </article>
      </div>
    </DocumentationShell>
  );
}

export function ValidationView() {
  const checks = [
    ["Unit + property", "60 passing", "complete"],
    ["Browser behavior", "62 passing · 4 capability skips", "complete"],
    ["Chromium", "27 approved captures", "complete"],
    ["Firefox", "27 approved captures", "complete"],
    ["WebKit", "27 approved captures", "complete"],
    ["Accessibility", "Axe + keyboard + fallback modes", "complete"],
    ["Packages", "Packed install + exports + tree-shaking", "complete"],
    ["Second-pass refinement", "Five engines improved and revalidated", "complete"],
  ] as const;

  return (
    <DocumentationShell
      title="Evidence, not vibes."
      kicker="Validation / live ledger"
      section="validation"
    >
      <div className="validation-intro">
        <p>
          This ledger records the completed second pass. Every green row is backed by checked-in
          browser, package, performance, or test evidence.
        </p>
        <strong>Pass 02 / approved</strong>
      </div>
      <table className="validation-table">
        <caption className="pl-sr-only">Validation status</caption>
        <tbody>
          {checks.map(([name, value, status]) => (
            <tr key={name}>
              <td>
                <span className={`validation-dot validation-dot--${status}`} aria-hidden="true" />
              </td>
              <th scope="row">{name}</th>
              <td>{value}</td>
              <td>
                <small>{status}</small>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <section className="validation-principles">
        <p className="document-number">RUBRIC</p>
        <h2>Eleven dimensions. One shared burden.</h2>
        <div>
          {[
            "Optical realism",
            "Aesthetic quality",
            "Readability",
            "Interaction",
            "Accessibility",
            "Cross-browser",
            "Performance",
            "SSR safety",
            "API clarity",
            "Maintainability",
            "OSS readiness",
          ].map((item, index) => (
            <span key={item}>
              {String(index + 1).padStart(2, "0")} / {item}
            </span>
          ))}
        </div>
      </section>
    </DocumentationShell>
  );
}
