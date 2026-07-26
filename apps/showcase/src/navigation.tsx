import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";

function normalizedPath(pathname = window.location.pathname) {
  return pathname.replace(/\/+$/, "") || "/";
}

function scrollToDestination(hash: string) {
  if (!hash) {
    window.scrollTo({ top: 0, behavior: "instant" });
    return;
  }

  const target = document.getElementById(decodeURIComponent(hash.slice(1)));
  target?.scrollIntoView({ block: "start", behavior: "instant" });
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
