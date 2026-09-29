import { Glass, GlassThemeProvider } from "@open-glass-ui/react";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  IconButton,
  MediaControls,
  Progress,
  SegmentedControl,
  Slider,
  Stat,
  Switch,
  Tabs,
  Toolbar,
} from "@open-glass-ui/recipes";
import "./og-page.css";

/**
 * A fixed 1280x640 composition used for the repository's social preview.
 * Every element is a real shipped component over the project's own photo, so
 * the image shows the library as it actually renders. Rendered by
 * scripts/capture-readme-media.mjs; not linked from the site.
 */
export function OgPage() {
  return (
    <GlassThemeProvider
      appearance="dark"
      theme={{ preset: "neutral", accent: "#d9c7a7" }}
      className="og-canvas"
    >
      <div className="og-copy">
        <span className="og-kicker">OpenGlass UI · React · MIT</span>
        <h1>Glass that stays readable.</h1>
        <p>40 accessible liquid glass components. One package, zero dependencies.</p>
        <Glass material="regular" className="og-install">
          <code>npm install open-glass-ui</code>
        </Glass>
      </div>

      <div className="og-stage" aria-hidden="true">
        <Toolbar label="Range" className="og-toolbar">
          <IconButton aria-label="Back">‹</IconButton>
          <SegmentedControl
            aria-label="Range"
            defaultValue="week"
            items={[
              { value: "day", label: "Day" },
              { value: "week", label: "Week" },
              { value: "month", label: "Month" },
            ]}
          />
          <IconButton aria-label="Forward">›</IconButton>
        </Toolbar>

        <Glass as="section" material="regular" className="og-panel">
          <Tabs
            label="Settings"
            items={[
              { value: "display", label: "Display", content: null },
              { value: "sound", label: "Sound", content: null },
              { value: "access", label: "Access", content: null },
            ]}
          />
          <Switch label="True tone" description="Adapts to ambient light" defaultChecked />
          <Switch label="Reduce transparency" />
          <Slider label="Brightness" defaultValue={72} unit="%" />
          <div className="og-panel__actions">
            <Button variant="primary">Apply</Button>
            <Button>Preview</Button>
          </div>
        </Glass>

        <Glass as="section" material="regular" className="og-card">
          <div className="og-card__head">
            <Stat label="Visitors" value="48.2k" change="+12.4%" tone="positive" />
            <Badge tone="positive">Live</Badge>
          </div>
          <Progress label="Monthly goal" value={74} />
          <AvatarGroup>
            <Avatar name="Maya Lin" size="small" />
            <Avatar name="Omar Uddin" size="small" />
            <Avatar name="Grace Ruiz" size="small" />
          </AvatarGroup>
        </Glass>

        <Glass material="clear" className="og-player">
          <span className="og-player__art" />
          <MediaControls
            playing
            currentTime={74}
            duration={212}
            onPlayingChange={() => {}}
            onSeek={() => {}}
            className="og-player__controls"
          />
        </Glass>
      </div>
    </GlassThemeProvider>
  );
}
