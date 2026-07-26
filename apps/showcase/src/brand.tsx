import { Icon } from "./icons";
import { AppLink } from "./navigation";

/**
 * One source of truth for site identity and primary navigation. The landing
 * page and the interior pages render different visual treatments, but they must
 * never disagree about what the product is called or where its sections live.
 */
export const BRAND_TAGLINE = "Glass UI for React";

export const REPOSITORY_URL =
  import.meta.env.VITE_GITHUB_URL?.trim() || "https://github.com/moekoelueker/open-glass-ui";

export type NavSection = "library" | "docs" | "research" | "validation";

export const PRIMARY_NAV: ReadonlyArray<{
  href: string;
  label: string;
  section: NavSection;
}> = [
  { href: "/components", label: "Components", section: "library" },
  { href: "/docs", label: "Docs", section: "docs" },
  { href: "/validation", label: "Validation", section: "validation" },
];

// `exactOptionalPropertyTypes` is on, so callers forwarding a possibly
// undefined section need the union spelled out.
export function PrimaryNavLinks({ section }: { section?: NavSection | undefined }) {
  return (
    <>
      {PRIMARY_NAV.map((item) => (
        <AppLink
          key={item.href}
          href={item.href}
          className={section === item.section ? "is-active" : undefined}
          aria-current={section === item.section ? "page" : undefined}
        >
          {item.label}
        </AppLink>
      ))}
    </>
  );
}

export function RepositoryLink({ className }: { className?: string }) {
  return (
    <a
      className={className}
      href={REPOSITORY_URL}
      rel="noreferrer"
      aria-label="OpenGlass UI on GitHub"
    >
      <span className="repo-link__full">GitHub</span>
      <b className="repo-link__short" aria-hidden="true">
        GH
      </b>
      <Icon name="arrow" />
    </a>
  );
}
