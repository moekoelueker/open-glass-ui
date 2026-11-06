import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";

function normalizedPath(pathname = window.location.pathname) {
  return pathname.replace(/\/+$/, "") || "/";
}

// Routes are lazy, so the element a hash points at may not exist when
// navigation starts or when the page first loads. Retry across animation frames
// until it mounts, but never for longer than this.
const HASH_SCROLL_TIMEOUT_MS = 2000;

let cancelPendingScroll: (() => void) | null = null;

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
  const interruptions = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
  let frame = 0;
  const stop = () => {
    window.cancelAnimationFrame(frame);
    for (const type of interruptions) {
      window.removeEventListener(type, stop);
    }
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
  // Stop looking as soon as the reader scrolls or types, so a late mount never
  // yanks the page away from where they went.
  for (const type of interruptions) {
    window.addEventListener(type, stop, { passive: true, once: true });
  }
  frame = window.requestAnimationFrame(tick);
}

export function navigate(href: string) {
  const destination = new URL(href, window.location.origin);
  const nextPath = normalizedPath(destination.pathname);
  const currentPath = normalizedPath();
  const nextLocation = `${destination.pathname}${destination.search}${destination.hash}`;
  const currentLocation = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (currentLocation === nextLocation) {
    scrollToDestination(destination.hash);
    return;
  }

  window.history.pushState({}, "", nextLocation);
  if (currentPath !== nextPath) {
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
  window.requestAnimationFrame(() => scrollToDestination(destination.hash));
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
