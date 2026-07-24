import { type MouseEvent, useEffect, useState } from "react";
import { ComparisonHome, DocumentationView, ExperimentPage, ValidationView } from "./pages";

function normalizedPath() {
  return window.location.pathname.replace(/\/+$/, "") || "/";
}

export function navigate(href: string) {
  if (normalizedPath() === href) {
    return;
  }
  window.history.pushState({}, "", href);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "instant" });
}

export function AppLink({
  href,
  className,
  children,
  "aria-label": ariaLabel,
}: {
  href: string;
  className?: string | undefined;
  children: React.ReactNode;
  "aria-label"?: string | undefined;
}) {
  return (
    <a
      href={href}
      className={className}
      aria-label={ariaLabel}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
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

export function App() {
  const [path, setPath] = useState(normalizedPath);

  useEffect(() => {
    const handlePathChange = () => setPath(normalizedPath());
    window.addEventListener("popstate", handlePathChange);
    return () => window.removeEventListener("popstate", handlePathChange);
  }, []);

  const experimentId = path.startsWith("/experiments/") ? path.split("/")[2] : undefined;

  if (experimentId) {
    return <ExperimentPage key={experimentId} id={experimentId} />;
  }
  if (path === "/docs") {
    return <DocumentationView />;
  }
  if (path === "/validation") {
    return <ValidationView />;
  }
  return <ComparisonHome />;
}
