import {
  DEFAULT_GLASS_LIGHT_ANGLE,
  GLASS_LOOK_PRESETS,
  type GlassDesign,
  type GlassLookPreset,
} from "@open-glass-ui/core";
import { Glass, GlassThemeProvider } from "@open-glass-ui/react";
import {
  Button,
  IconButton,
  MediaControls,
  SegmentedControl,
  Slider,
  Switch,
  Toolbar,
} from "@open-glass-ui/recipes";
import { type CSSProperties, type KeyboardEvent, type PointerEvent, useRef, useState } from "react";
import "./liquid-showcase.css";

/**
 * A compact, self-contained before/after of the classic and liquid designs.
 * Everything it needs lives in this file and liquid-showcase.css, so it can be
 * dropped into any page (the landing, and the moelueker.com port) unchanged.
 */

const LOOKS: ReadonlyArray<{ value: GlassLookPreset; label: string }> = [
  { value: "liquid", label: "Liquid" },
  { value: "frosted", label: "Frosted" },
  { value: "clear", label: "Clear" },
  { value: "smoked", label: "Smoked" },
  { value: "lensed", label: "Lensed" },
];

function MiniScene({
  design,
  look,
  lightAngle,
}: {
  design: GlassDesign;
  look: GlassLookPreset;
  lightAngle: number;
}) {
  const [view, setView] = useState<"grid" | "list" | "mixes">("grid");
  const [playing, setPlaying] = useState(true);
  const [time, setTime] = useState(74);
  const liquid = design === "liquid";

  return (
    <GlassThemeProvider
      design={design}
      appearance="dark"
      theme={
        liquid
          ? { preset: "cobalt", glass: { ...lookPreset(look), lightAngle } }
          : { preset: "cobalt" }
      }
      className="lq-scene"
    >
      <div className="lq-scene__art" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
      <Toolbar label={`View options (${design})`} className="lq-toolbar">
        <IconButton aria-label={`Add (${design})`}>+</IconButton>
        <SegmentedControl
          aria-label={`Layout (${design})`}
          value={view}
          onValueChange={setView}
          items={[
            { value: "grid", label: "Grid" },
            { value: "list", label: "List" },
            { value: "mixes", label: "Mixes" },
          ]}
        />
      </Toolbar>
      <Glass as="section" material="frosted" className="lq-panel" aria-label={`Sound (${design})`}>
        <Switch label="Spatial audio" description="Head-tracked" defaultChecked />
        <Switch label="Crossfade" />
        <Slider label="Volume" defaultValue={68} unit="%" />
        <div className="lq-panel__actions">
          <Button variant="primary">Add to library</Button>
          <Button>Share</Button>
        </div>
      </Glass>
      <Glass material="clear" className="lq-player" aria-label={`Now playing (${design})`}>
        <span className="lq-player__art" aria-hidden="true" />
        <MediaControls
          playing={playing}
          currentTime={time}
          duration={212}
          onPlayingChange={setPlaying}
          onSeek={setTime}
          className="lq-player__controls"
        />
      </Glass>
    </GlassThemeProvider>
  );
}

function lookPreset(look: GlassLookPreset) {
  return { ...GLASS_LOOK_PRESETS[look] };
}

export function LiquidShowcase({ compareHref }: { compareHref?: string }) {
  const [split, setSplit] = useState(50);
  const [look, setLook] = useState<GlassLookPreset>("liquid");
  const [lightAngle, setLightAngle] = useState(DEFAULT_GLASS_LIGHT_ANGLE);
  const frameRef = useRef<HTMLDivElement>(null);

  const moveTo = (clientX: number) => {
    const box = frameRef.current?.getBoundingClientRect();
    if (box && box.width > 0) {
      setSplit(Math.min(Math.max(((clientX - box.left) / box.width) * 100, 0), 100));
    }
  };

  return (
    <div className="lq-showcase">
      <div
        ref={frameRef}
        className="lq-frame"
        style={{ "--lq-split": `${split}%` } as CSSProperties}
      >
        <div className="lq-layer lq-layer--before">
          <MiniScene design="classic" look={look} lightAngle={lightAngle} />
        </div>
        <div className="lq-layer lq-layer--after">
          <MiniScene design="liquid" look={look} lightAngle={lightAngle} />
        </div>
        <span className="lq-label lq-label--before">Classic</span>
        <span className="lq-label lq-label--after">Liquid</span>
        <div
          className="lq-handle"
          role="slider"
          tabIndex={0}
          aria-label="Classic and liquid divider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(split)}
          aria-valuetext={`${Math.round(split)}% classic, ${Math.round(100 - split)}% liquid`}
          onPointerDown={(event: PointerEvent<HTMLDivElement>) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            moveTo(event.clientX);
          }}
          onPointerMove={(event: PointerEvent<HTMLDivElement>) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              moveTo(event.clientX);
            }
          }}
          onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
            const step = event.shiftKey ? 10 : 2;
            if (event.key === "ArrowLeft") setSplit((value) => Math.max(value - step, 0));
            if (event.key === "ArrowRight") setSplit((value) => Math.min(value + step, 100));
            if (event.key === "Home") setSplit(0);
            if (event.key === "End") setSplit(100);
          }}
        >
          <span aria-hidden="true" />
        </div>
      </div>
      <div className="lq-controls">
        <SegmentedControl
          aria-label="Glass look"
          value={look}
          onValueChange={setLook}
          items={LOOKS}
        />
        <Slider
          label="Light direction"
          min={0}
          max={359}
          value={lightAngle}
          valueText={`${lightAngle}°`}
          onChange={(event) => setLightAngle(Number(event.currentTarget.value))}
        />
        {compareHref ? (
          <a className="lq-link" href={compareHref}>
            Open the full before and after
          </a>
        ) : null}
      </div>
    </div>
  );
}
