import {
  Component,
  lazy,
  type ReactNode,
  Suspense,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import type { AtlasVariant } from "./component-atlas";
import { LandingPage } from "./landing-page";
import { AppLink, routeCommitted, routeLeft, scrollAfterRouteCommits } from "./navigation";

const loadAtlas = () => import("./component-atlas");
const loadPages = () => import("./pages");
const loadCompare = () => import("./compare-page");
const loadOg = () => import("./og-page");

const ComponentAtlasHome = lazy(() =>
  loadAtlas().then((module) => ({ default: module.ComponentAtlasHome })),
);
const ComponentAtlasPage = lazy(() =>
  loadAtlas().then((module) => ({ default: module.ComponentAtlasPage })),
);
const ComparisonHome = lazy(() =>
  loadPages().then((module) => ({ default: module.ComparisonHome })),
);
const ComparePage = lazy(() => loadCompare().then((module) => ({ default: module.ComparePage })));
const OgPage = lazy(() => loadOg().then((module) => ({ default: module.OgPage })));
const DocumentationView = lazy(() =>
  loadPages().then((module) => ({ default: module.DocumentationView })),
);
const ExperimentPage = lazy(() =>
  loadPages().then((module) => ({ default: module.ExperimentPage })),
);
const ValidationView = lazy(() =>
  loadPages().then((module) => ({ default: module.ValidationView })),
);

function normalizedPath() {
  return window.location.pathname.replace(/\/+$/, "") || "/";
}

function RoutePending() {
  return (
    <div className="site-shell route-pending">
      <main id="main-content" tabIndex={-1} aria-busy="true">
        <h1 className="ogui-sr-only">OpenGlass UI</h1>
        <div role="status">
          <span aria-hidden="true" />
          Loading OpenGlass UI
        </div>
      </main>
    </div>
  );
}

class RouteErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override render() {
    if (!this.state.failed) {
      return this.props.children;
    }

    return (
      <div className="site-shell">
        <main id="main-content" tabIndex={-1} className="not-found" aria-live="assertive">
          <span className="section-kicker">Route recovery / Chunk unavailable</span>
          <h1>This surface could not finish loading.</h1>
          <p>
            The app may have updated while this page was open. Reload this route or return to the
            stable landing page.
          </p>
          <div className="landing-hero__actions">
            <button
              type="button"
              className="landing-button landing-button--primary"
              onClick={() => window.location.reload()}
            >
              <span>Reload this route</span>
            </button>
            <AppLink className="landing-button" href="/">
              Return to OpenGlass UI
            </AppLink>
          </div>
        </main>
      </div>
    );
  }
}

function NotFound() {
  return (
    <div className="site-shell">
      <main id="main-content" tabIndex={-1} className="not-found">
        <span className="section-kicker">404 / Unknown surface</span>
        <h1>That glass is not in the system.</h1>
        <AppLink className="text-link" href="/">
          Return to OpenGlass UI
        </AppLink>
      </main>
    </div>
  );
}

function Route({ path }: { path: string }) {
  const experimentId = path.startsWith("/experiments/") ? path.split("/")[2] : undefined;
  const atlasId = path.startsWith("/library/") ? path.split("/")[2] : undefined;

  if (path === "/") {
    return <LandingPage />;
  }
  if (path === "/components") {
    return <ComponentAtlasPage variant="hybrid" product />;
  }
  if (path === "/og") {
    // Social preview composition for the repository; not linked or indexed.
    return <OgPage />;
  }
  if (path === "/compare") {
    return <ComparePage />;
  }
  if (path === "/research") {
    return <ComparisonHome />;
  }
  if (experimentId) {
    return <ExperimentPage key={experimentId} id={experimentId} />;
  }
  if (atlasId && ["hybrid", "css", "webgl"].includes(atlasId)) {
    return <ComponentAtlasPage key={atlasId} variant={atlasId as AtlasVariant} />;
  }
  if (path === "/library") {
    return <ComponentAtlasHome />;
  }
  if (path === "/docs") {
    return <DocumentationView />;
  }
  if (path === "/validation") {
    return <ValidationView />;
  }
  return <NotFound />;
}

/**
 * Rendered inside the route's Suspense boundary, after the route, so its
 * effect runs only once the route's content has committed, however long its
 * lazy chunk took. The boundary is keyed by path, so every route gets one.
 */
function RouteReady({ path }: { path: string }) {
  useEffect(() => {
    routeCommitted(path);
    return () => routeLeft(path);
  }, [path]);
  return null;
}

export function App() {
  const [path, setPath] = useState(normalizedPath);

  // A deep link such as /components#atlas-A loads a lazy route, so the browser's
  // own fragment scroll finds nothing. Look for the target once the route has
  // rendered. A layout effect, so the request is in place before RouteReady's
  // effect runs when the route renders in this same commit.
  useLayoutEffect(() => {
    if (window.location.hash) {
      scrollAfterRouteCommits(normalizedPath(), window.location.hash);
    }
  }, []);

  useEffect(() => {
    const handlePathChange = () => setPath(normalizedPath());
    window.addEventListener("popstate", handlePathChange);
    return () => window.removeEventListener("popstate", handlePathChange);
  }, []);

  return (
    <RouteErrorBoundary key={path}>
      <Suspense fallback={<RoutePending />}>
        <Route path={path} />
        <RouteReady path={path} />
      </Suspense>
    </RouteErrorBoundary>
  );
}
