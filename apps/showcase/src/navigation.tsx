import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";

function normalizedPath(pathname = window.location.pathname) {
  return pathname.replace(/\/+$/, "") || "/";
}

// Even after its route has rendered, the element a hash points at may mount a
// little later. Retry across animation frames until it does, but never for
// longer than this.
const HASH_SCROLL_TIMEOUT_MS = 2000;

let cancelPendingScroll: (() => void) | null = null;

// Stop looking as soon as the reader scrolls, touches, types or presses, so a
// late mount never yanks the page away from where they went.
const READER_INPUT = ["wheel", "touchstart", "keydown", "pointerdown"] as const;

function untilReaderInput(stop: () => void) {
  for (const type of READER_INPUT) {
    window.addEventListener(type, stop, { passive: true, once: true });
  }
  return () => {
    for (const type of READER_INPUT) {
      window.removeEventListener(type, stop);
    }
  };
}

// Routes are lazy, so a destination may take any time to load. A scroll for a
// route that has not rendered yet waits here, and the bounded lookup starts
// only once the route has committed (see `routeCommitted`), so a slow chunk
// cannot use up its budget.
let pendingRouteScroll: { path: string; hash: string; cancel: () => void } | null = null;
// The path of the route on screen, or null while none has rendered (first
// load, or after a path change until the new route commits).
let committedPath: string | null = null;

/**
 * Scrolls to `hash` once the route at `path` has rendered. A newer navigation
 * or any reader input drops the request.
 */
export function scrollAfterRouteCommits(path: string, hash: string) {
  cancelPendingScroll?.();
  pendingRouteScroll?.cancel();
  let unsubscribe = () => {};
  const request = {
    path,
    hash,
    cancel: () => {
      unsubscribe();
      if (pendingRouteScroll === request) {
        pendingRouteScroll = null;
      }
    },
  };
  unsubscribe = untilReaderInput(request.cancel);
  pendingRouteScroll = request;
}

/** The app calls this each time a route's content has committed. */
export function routeCommitted(path: string) {
  committedPath = path;
  const request = pendingRouteScroll;
  if (!request) {
    return;
  }
  request.cancel();
  // A request for another path is moot: the reader went somewhere else.
  if (request.path === path) {
    scrollToDestination(request.hash);
  }
}

/** The app calls this when a route's content unmounts. */
export function routeLeft(path: string) {
  if (committedPath === path) {
    committedPath = null;
  }
}

function findHashTarget(hash: string) {
  let id = hash.slice(1);
  try {
    id = decodeURIComponent(id);
  } catch {
    // A malformed escape: fall back to the raw fragment.
  }
  return document.getElementById(id);
}

export function scrollToDestination(hash: string) {
  cancelPendingScroll?.();
  pendingRouteScroll?.cancel();

  if (!hash || hash === "#") {
    window.scrollTo({ top: 0, behavior: "instant" });
    return;
  }

  const immediate = findHashTarget(hash);
  if (immediate) {
    immediate.scrollIntoView({ block: "start", behavior: "instant" });
    return;
  }

  const startedAt = performance.now();
  let frame = 0;
  let unsubscribe = () => {};
  const stop = () => {
    window.cancelAnimationFrame(frame);
    unsubscribe();
    if (cancelPendingScroll === stop) {
      cancelPendingScroll = null;
    }
  };
  const tick = () => {
    const target = findHashTarget(hash);
    if (target) {
      target.scrollIntoView({ block: "start", behavior: "instant" });
      stop();
      return;
    }
    if (performance.now() - startedAt >= HASH_SCROLL_TIMEOUT_MS) {
      stop();
      return;
    }
    frame = window.requestAnimationFrame(tick);
  };

  cancelPendingScroll = stop;
  unsubscribe = untilReaderInput(stop);
  frame = window.requestAnimationFrame(tick);
}

export function navigate(href: string) {
  const destination = new URL(href, window.location.origin);
  const nextPath = normalizedPath(destination.pathname);
  const currentPath = normalizedPath();
  const nextLocation = `${destination.pathname}${destination.search}${destination.hash}`;
  const currentLocation = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  // A destination that has not rendered yet (another route, or this one while
  // its chunk still loads) is looked up once it has.
  const rendered = committedPath === nextPath;

  if (currentLocation === nextLocation) {
    if (rendered) {
      scrollToDestination(destination.hash);
    } else {
      scrollAfterRouteCommits(nextPath, destination.hash);
    }
    return;
  }

  window.history.pushState({}, "", nextLocation);
  if (!rendered) {
    scrollAfterRouteCommits(nextPath, destination.hash);
  }
  if (currentPath !== nextPath) {
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
  if (rendered) {
    window.requestAnimationFrame(() => scrollToDestination(destination.hash));
  }
}

export function AppLink({
  href,
  children,
  onClick,
  ...props
}: {
  href: string;
  children: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children">) {
  return (
    <a
      {...props}
      href={href}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }
        event.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}
