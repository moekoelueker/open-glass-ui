import { useGlassRuntime, useGlassTheme } from "@open-glass-ui/react";
import {
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type CSSProperties,
  createContext,
  type DragEvent,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function idPart(value: string) {
  return encodeURIComponent(value).replaceAll("%", "_");
}

export type SemanticTone = "neutral" | "accent" | "positive" | "warning" | "danger";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: SemanticTone;
}

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return <span {...props} className={cx("ogui-badge", className)} data-tone={tone} />;
}

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
  src?: string;
  size?: "small" | "medium" | "large";
}

export function Avatar({ name, src, size = "medium", className, ...props }: AvatarProps) {
  const dimensions = size === "small" ? 32 : size === "large" ? 52 : 40;
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <span
      {...props}
      className={cx("ogui-avatar", className)}
      data-size={size}
      role="img"
      aria-label={name}
      title={name}
    >
      {src ? (
        <img src={src} alt="" width={dimensions} height={dimensions} loading="lazy" />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </span>
  );
}

export function AvatarGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("ogui-avatar-group", className)} />;
}

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: ReactNode;
  title?: ReactNode;
  footer?: ReactNode;
  interactive?: boolean;
  onPress?: () => void;
}

export function Card({
  eyebrow,
  title,
  footer,
  interactive: _interactive = false,
  onPress,
  className,
  children,
  onClick,
  onKeyDown,
  role,
  tabIndex,
  ...props
}: CardProps) {
  const actionable = Boolean(onPress || onClick);
  const Element = actionable ? "div" : "article";
  return (
    <Element
      {...props}
      className={cx("ogui-card", actionable && "is-interactive", className)}
      role={role ?? (actionable ? "button" : undefined)}
      tabIndex={tabIndex ?? (actionable ? 0 : undefined)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          onPress?.();
        }
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (actionable && !event.defaultPrevented && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          event.currentTarget.click();
        }
      }}
    >
      {eyebrow ? <span className="ogui-card__eyebrow">{eyebrow}</span> : null}
      {title ? <strong className="ogui-card__title">{title}</strong> : null}
      <div className="ogui-card__body">{children}</div>
      {footer ? <footer className="ogui-card__footer">{footer}</footer> : null}
    </Element>
  );
}

export interface StatProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  value: ReactNode;
  change?: ReactNode;
  tone?: SemanticTone;
}

export function Stat({ label, value, change, tone = "neutral", className, ...props }: StatProps) {
  return (
    <div {...props} className={cx("ogui-stat", className)} data-tone={tone}>
      <span>{label}</span>
      <strong>{value}</strong>
      {change ? <small>{change}</small> : null}
    </div>
  );
}

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  value: number;
  max?: number;
}

export function Progress({ label, value, max = 100, className, ...props }: ProgressProps) {
  const labelId = useId();
  const safeMax = Math.max(max, 1);
  const safeValue = Math.min(Math.max(value, 0), safeMax);
  return (
    <div {...props} className={cx("ogui-progress", className)}>
      <span>
        <span id={labelId}>{label}</span>
        <output>{Math.round((safeValue / safeMax) * 100)}%</output>
      </span>
      <progress value={safeValue} max={safeMax} aria-labelledby={labelId} />
    </div>
  );
}

export interface MeterProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  value: number;
  min?: number;
  max?: number;
  low?: number;
  high?: number;
  optimum?: number;
}

export function Meter({
  label,
  value,
  min = 0,
  max = 100,
  low = 30,
  high = 75,
  optimum = 90,
  className,
  ...props
}: MeterProps) {
  const labelId = useId();
  return (
    <div {...props} className={cx("ogui-meter", className)}>
      <span id={labelId}>{label}</span>
      <meter
        value={value}
        min={min}
        max={max}
        low={low}
        high={high}
        optimum={optimum}
        aria-labelledby={labelId}
      />
      <output>{value}</output>
    </div>
  );
}

export function Spinner({
  label = "Loading",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { label?: string }) {
  return (
    <span {...props} className={cx("ogui-spinner", className)} role="status">
      <i aria-hidden="true" />
      <span className="ogui-sr-only">{label}</span>
    </span>
  );
}

export function Skeleton({
  width = "100%",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { width?: string }) {
  return (
    <span
      {...props}
      className={cx("ogui-skeleton", className)}
      style={{ ...props.style, width }}
      aria-hidden="true"
    />
  );
}

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  tone?: SemanticTone;
  onDismiss?: () => void;
}

export function Alert({
  title,
  tone = "neutral",
  onDismiss,
  className,
  children,
  ...props
}: AlertProps) {
  return (
    <div
      {...props}
      className={cx("ogui-alert", className)}
      data-tone={tone}
      role={tone === "danger" ? "alert" : "status"}
    >
      <span className="ogui-alert__signal" aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        {children ? <p>{children}</p> : null}
      </div>
      {onDismiss ? (
        <button type="button" onClick={onDismiss} aria-label="Dismiss alert">
          ×
        </button>
      ) : null}
    </div>
  );
}

export interface BannerProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  action?: ReactNode;
  dismissible?: boolean;
}

export function Banner({
  title,
  action,
  dismissible = false,
  className,
  children,
  ...props
}: BannerProps) {
  const [visible, setVisible] = useState(true);
  if (!visible) {
    return null;
  }
  return (
    <aside {...props} className={cx("ogui-banner", className)} aria-label={String(title)}>
      <span className="ogui-banner__flare" aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        {children ? <span>{children}</span> : null}
      </div>
      {action}
      {dismissible ? (
        <button type="button" onClick={() => setVisible(false)} aria-label="Dismiss banner">
          ×
        </button>
      ) : null}
    </aside>
  );
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({
  items,
  className,
  ...props
}: HTMLAttributes<HTMLElement> & { items: readonly BreadcrumbItem[] }) {
  return (
    <nav {...props} className={cx("ogui-breadcrumbs", className)} aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li key={`${item.href ?? "current"}-${item.label}`}>
              {item.href && !current ? (
                <a href={item.href}>{item.label}</a>
              ) : (
                <span aria-current={current ? "page" : undefined}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export interface PaginationProps extends HTMLAttributes<HTMLElement> {
  page: number;
  count: number;
  onPageChange: (page: number) => void;
}

type PaginationItem = number | "start-ellipsis" | "end-ellipsis";

function safePageInteger(value: number) {
  if (!Number.isFinite(value)) {
    return 1;
  }
  return Math.min(Math.max(1, Math.floor(value)), Number.MAX_SAFE_INTEGER);
}

function paginationItems(page: number, count: number): PaginationItem[] {
  if (count <= 7) {
    return Array.from({ length: count }, (_, index) => index + 1);
  }
  if (page <= 4) {
    return [1, 2, 3, 4, 5, "end-ellipsis", count];
  }
  if (page >= count - 3) {
    return [1, "start-ellipsis", count - 4, count - 3, count - 2, count - 1, count];
  }
  return [1, "start-ellipsis", page - 1, page, page + 1, "end-ellipsis", count];
}

export function Pagination({ page, count, onPageChange, className, ...props }: PaginationProps) {
  const safeCount = safePageInteger(count);
  const safePage = Math.min(safePageInteger(page), safeCount);
  const items = paginationItems(safePage, safeCount);
  return (
    <nav {...props} className={cx("ogui-pagination", className)} aria-label="Pagination">
      <button
        type="button"
        aria-label="Previous page"
        disabled={safePage <= 1}
        onClick={() => onPageChange(safePage - 1)}
      >
        ←
      </button>
      {items.map((item) =>
        typeof item === "number" ? (
          <button
            key={item}
            type="button"
            aria-label={`Page ${item}`}
            aria-current={item === safePage ? "page" : undefined}
            onClick={() => onPageChange(item)}
          >
            {item}
          </button>
        ) : (
          <span key={item} className="ogui-pagination__ellipsis" aria-hidden="true">
            …
          </span>
        ),
      )}
      <button
        type="button"
        aria-label="Next page"
        disabled={safePage >= safeCount}
        onClick={() => onPageChange(safePage + 1)}
      >
        →
      </button>
    </nav>
  );
}

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
}

export function Accordion({
  items,
  multiple = false,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  items: readonly AccordionItem[];
  multiple?: boolean;
}) {
  const [openItems, setOpenItems] = useState<Set<string>>(
    () => new Set(items[0] ? [items[0].id] : []),
  );
  const baseId = useId();
  const toggle = (id: string) => {
    setOpenItems((current) => {
      const next = multiple ? new Set(current) : new Set<string>();
      if (!current.has(id)) {
        next.add(id);
      } else if (multiple) {
        next.delete(id);
      }
      return next;
    });
  };

  return (
    <div {...props} className={cx("ogui-accordion", className)}>
      {items.map((item) => {
        const open = openItems.has(item.id);
        const itemId = `${baseId}-${idPart(item.id)}`;
        return (
          <section key={item.id} data-open={open ? "true" : "false"}>
            <h3>
              <button
                id={`${itemId}-trigger`}
                type="button"
                aria-expanded={open}
                aria-controls={`${itemId}-panel`}
                onClick={() => toggle(item.id)}
              >
                <span>{item.title}</span>
                <i aria-hidden="true">+</i>
              </button>
            </h3>
            {open ? (
              <section id={`${itemId}-panel`} aria-labelledby={`${itemId}-trigger`}>
                {item.content}
              </section>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

export interface OverlayProps {
  title: string;
  triggerLabel: string;
  children: ReactNode;
  description?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnBackdrop?: boolean;
}

let activeOverlayLocks = 0;
let bodyOverflowBeforeLock = "";
let bodyPaddingBeforeLock = "";
const inertLedger = new Map<HTMLElement, { count: number; previous: boolean }>();
const activeOverlayStack: string[] = [];
const activeOverlayHosts: HTMLElement[] = [];

function lockDocumentForOverlay(portalHost: HTMLElement) {
  const body = document.body;
  if (activeOverlayLocks === 0) {
    bodyOverflowBeforeLock = body.style.overflow;
    bodyPaddingBeforeLock = body.style.paddingRight;
    const scrollbarWidth = Math.max(window.innerWidth - document.documentElement.clientWidth, 0);
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }
  activeOverlayLocks += 1;

  const inerted = [
    ...new Set([
      ...[...body.children].filter(
        (element): element is HTMLElement =>
          element instanceof HTMLElement &&
          element !== portalHost &&
          !element.hasAttribute("data-ogui-portal"),
      ),
      ...activeOverlayHosts,
    ]),
  ];
  activeOverlayHosts.push(portalHost);
  for (const element of inerted) {
    const existing = inertLedger.get(element);
    inertLedger.set(element, {
      count: (existing?.count ?? 0) + 1,
      previous: existing?.previous ?? element.inert,
    });
    element.inert = true;
  }

  return () => {
    const hostIndex = activeOverlayHosts.lastIndexOf(portalHost);
    if (hostIndex >= 0) {
      activeOverlayHosts.splice(hostIndex, 1);
    }
    for (const element of inerted) {
      const entry = inertLedger.get(element);
      if (!entry) {
        continue;
      }
      if (entry.count > 1) {
        inertLedger.set(element, { ...entry, count: entry.count - 1 });
      } else {
        element.inert = entry.previous;
        inertLedger.delete(element);
      }
    }
    activeOverlayLocks = Math.max(activeOverlayLocks - 1, 0);
    if (activeOverlayLocks === 0) {
      body.style.overflow = bodyOverflowBeforeLock;
      body.style.paddingRight = bodyPaddingBeforeLock;
    }
  };
}

function Overlay({
  title,
  triggerLabel,
  children,
  description,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  closeOnBackdrop = true,
  kind,
}: OverlayProps & { kind: "dialog" | "drawer" }) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null);
  const { appearance, tokens } = useGlassTheme();
  const runtime = useGlassRuntime();
  const open = controlledOpen ?? internalOpen;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(open);
  const titleId = useId();
  const descriptionId = description ? `${titleId}-description` : undefined;

  useEffect(() => {
    const host = document.createElement("div");
    host.setAttribute("data-ogui-portal", "");
    document.body.append(host);
    setPortalHost(host);
    return () => {
      host.remove();
    };
  }, []);

  const setVisibility = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );

  useEffect(() => {
    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = open;
    if (wasOpen && !open) {
      const focusFrame = requestAnimationFrame(() => triggerRef.current?.focus());
      return () => cancelAnimationFrame(focusFrame);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !portalHost) {
      return;
    }
    activeOverlayStack.push(titleId);
    const unlockDocument = lockDocumentForOverlay(portalHost);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (activeOverlayStack.at(-1) !== titleId) {
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        setVisibility(false);
      }
      if (event.key === "Tab") {
        const focusable = [
          ...(surfaceRef.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ) ?? []),
        ].filter((element) => !element.hasAttribute("disabled"));
        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    const focusFrame = requestAnimationFrame(() => closeRef.current?.focus());
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      unlockDocument();
      const stackIndex = activeOverlayStack.lastIndexOf(titleId);
      if (stackIndex >= 0) {
        activeOverlayStack.splice(stackIndex, 1);
      }
    };
  }, [open, portalHost, setVisibility, titleId]);

  const overlay =
    open && portalHost ? (
      <div
        className="ogui-overlay"
        data-kind={kind}
        data-ogui-appearance={appearance}
        data-ogui-motion={runtime.motion}
        style={{ ...tokens, colorScheme: appearance } as CSSProperties}
      >
        {closeOnBackdrop ? (
          <button
            type="button"
            className="ogui-overlay__scrim"
            aria-label={`Close ${title}`}
            onClick={() => setVisibility(false)}
          />
        ) : (
          <div className="ogui-overlay__scrim" aria-hidden="true" />
        )}
        <div
          ref={surfaceRef}
          className="ogui-overlay__surface"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
        >
          <div className="ogui-overlay__header">
            <strong id={titleId}>{title}</strong>
            <button
              ref={closeRef}
              type="button"
              aria-label={`Close ${title}`}
              onClick={() => setVisibility(false)}
            >
              ×
            </button>
          </div>
          {description ? (
            <p id={descriptionId} className="ogui-overlay__description">
              {description}
            </p>
          ) : null}
          <div className="ogui-overlay__body">{children}</div>
        </div>
      </div>
    ) : null;

  return (
    <span className={`ogui-overlay-trigger ogui-overlay-trigger--${kind}`}>
      <button ref={triggerRef} type="button" onClick={() => setVisibility(true)}>
        {triggerLabel}
      </button>
      {portalHost ? createPortal(overlay, portalHost) : null}
    </span>
  );
}

export function Dialog(props: OverlayProps) {
  return <Overlay {...props} kind="dialog" />;
}

export function Drawer(props: OverlayProps) {
  return <Overlay {...props} kind="drawer" />;
}

export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  duration?: number;
  restoreLabel?: string;
}

export function Toast({
  title,
  actionLabel,
  onAction,
  open: controlledOpen,
  defaultOpen = true,
  onOpenChange,
  duration = 0,
  restoreLabel = "Show toast",
  className,
  children,
  onFocusCapture,
  onBlurCapture,
  onMouseEnter,
  onMouseLeave,
  onKeyDown,
  ...props
}: ToastProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [paused, setPaused] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const remainingDuration = useRef(duration);
  const previousDuration = useRef(duration);
  const previouslyOpen = useRef(open);
  const setOpen = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );

  useEffect(() => {
    if (duration !== previousDuration.current || (open && !previouslyOpen.current)) {
      remainingDuration.current = duration;
    }
    previousDuration.current = duration;
    previouslyOpen.current = open;
  }, [duration, open]);

  useEffect(() => {
    if (!open || paused || duration <= 0) {
      return;
    }
    const remaining = Math.max(remainingDuration.current, 0);
    if (remaining === 0) {
      setOpen(false);
      return;
    }
    const startedAt = Date.now();
    const timeout = window.setTimeout(() => setOpen(false), remaining);
    return () => {
      window.clearTimeout(timeout);
      remainingDuration.current = Math.max(remaining - (Date.now() - startedAt), 0);
    };
  }, [duration, open, paused, setOpen]);

  if (!open) {
    if (controlledOpen !== undefined || !restoreLabel) {
      return null;
    }
    return (
      <button type="button" className="ogui-toast__restore" onClick={() => setOpen(true)}>
        {restoreLabel}
      </button>
    );
  }
  return (
    <div
      {...props}
      className={cx("ogui-toast", className)}
      role="status"
      onMouseEnter={(event) => {
        setPaused(true);
        onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        setPaused(false);
        onMouseLeave?.(event);
      }}
      onFocusCapture={(event) => {
        setPaused(true);
        onFocusCapture?.(event);
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPaused(false);
        }
        onBlurCapture?.(event);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented && event.key === "Escape") {
          event.preventDefault();
          setOpen(false);
        }
      }}
    >
      <span className="ogui-toast__mark" aria-hidden="true">
        ✓
      </span>
      <div>
        <strong>{title}</strong>
        {children ? <span>{children}</span> : null}
      </div>
      {actionLabel ? (
        <button
          type="button"
          onClick={() => {
            onAction?.();
            setOpen(false);
          }}
        >
          {actionLabel}
        </button>
      ) : null}
      <button type="button" aria-label="Dismiss notification" onClick={() => setOpen(false)}>
        ×
      </button>
    </div>
  );
}

export interface ToastOptions {
  title: ReactNode;
  description?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

export interface ToastController {
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
}

interface ToastNotice extends ToastOptions {
  id: string;
}

const ToastContext = /* @__PURE__ */ createContext<ToastController | null>(null);

export interface ToastProviderProps {
  children: ReactNode;
  defaultDuration?: number;
  maxVisible?: number;
  label?: string;
}

export function ToastProvider({
  children,
  defaultDuration = 5_000,
  maxVisible = 3,
  label = "Notifications",
}: ToastProviderProps) {
  const idPrefix = useId();
  const nextId = useRef(0);
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null);
  const [notices, setNotices] = useState<ToastNotice[]>([]);
  const { appearance, tokens } = useGlassTheme();
  const runtime = useGlassRuntime();

  useEffect(() => {
    setPortalHost(document.body);
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotices((current) => current.filter((notice) => notice.id !== id));
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      nextId.current += 1;
      const id = `${idPrefix}-toast-${nextId.current}`;
      const notice = { ...options, id };
      setNotices((current) => [...current, notice].slice(-Math.max(1, maxVisible)));
      return id;
    },
    [idPrefix, maxVisible],
  );

  const controller = useMemo(() => ({ toast, dismiss }), [dismiss, toast]);
  const viewport = (
    <section
      className="ogui-toast-viewport"
      aria-label={label}
      data-ogui-appearance={appearance}
      data-ogui-motion={runtime.motion}
      style={{ ...tokens, colorScheme: appearance } as CSSProperties}
    >
      {notices.map((notice) => (
        <Toast
          key={notice.id}
          title={notice.title}
          duration={notice.duration ?? defaultDuration}
          open
          restoreLabel=""
          {...(notice.actionLabel ? { actionLabel: notice.actionLabel } : {})}
          {...(notice.onAction ? { onAction: notice.onAction } : {})}
          onOpenChange={(open) => {
            if (!open) {
              dismiss(notice.id);
            }
          }}
        >
          {notice.description}
        </Toast>
      ))}
    </section>
  );

  return (
    <ToastContext.Provider value={controller}>
      {children}
      {portalHost ? createPortal(viewport, portalHost) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider.");
  }
  return context;
}

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label: ReactNode;
  description?: ReactNode;
}

export function Checkbox({
  label,
  description,
  className,
  id: suppliedId,
  ...props
}: CheckboxProps) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const labelId = `${id}-label`;
  const descriptionId = description ? `${id}-description` : undefined;
  return (
    <label className={cx("ogui-check", className)} htmlFor={id}>
      <input
        {...props}
        id={id}
        name={props.name ?? id}
        type="checkbox"
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
      />
      <i aria-hidden="true">✓</i>
      <span>
        <strong id={labelId}>{label}</strong>
        {description ? <small id={descriptionId}>{description}</small> : null}
      </span>
    </label>
  );
}

export interface RadioItem<T extends string> {
  value: T;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps<T extends string> {
  label: string;
  items: readonly RadioItem<T>[];
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  className?: string;
  name?: string;
  disabled?: boolean;
}

export function RadioGroup<T extends string>({
  label,
  items,
  value,
  defaultValue,
  onValueChange,
  className,
  name: suppliedName,
  disabled = false,
}: RadioGroupProps<T>) {
  const firstEnabled = items.find((item) => !item.disabled)?.value;
  const initialValue =
    items.find((item) => item.value === defaultValue && !item.disabled)?.value ?? firstEnabled;
  const [internalValue, setInternalValue] = useState(initialValue);
  const candidate = value ?? internalValue;
  const selected =
    items.find((item) => item.value === candidate && !item.disabled)?.value ?? firstEnabled;
  const generatedName = useId();
  const name = suppliedName ?? generatedName;
  return (
    <fieldset className={cx("ogui-radio-group", className)} disabled={disabled}>
      <legend>{label}</legend>
      {items.map((item, index) => {
        const itemId = `${name}-${index}`;
        const labelId = `${itemId}-label`;
        const descriptionId = item.description ? `${itemId}-description` : undefined;
        return (
          <label key={item.value} htmlFor={itemId}>
            <input
              id={itemId}
              type="radio"
              name={name}
              value={item.value}
              checked={selected === item.value}
              disabled={item.disabled}
              aria-labelledby={labelId}
              aria-describedby={descriptionId}
              onChange={() => {
                if (value === undefined) {
                  setInternalValue(item.value);
                }
                onValueChange?.(item.value);
              }}
            />
            <i aria-hidden="true" />
            <span>
              <strong id={labelId}>{item.label}</strong>
              {item.description ? <small id={descriptionId}>{item.description}</small> : null}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: ReactNode;
  options: readonly SelectOption[];
}

export function Select({ label, options, className, id: suppliedId, ...props }: SelectProps) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const labelId = `${id}-label`;
  const { appearance } = useGlassTheme();
  return (
    <label className={cx("ogui-field", "ogui-select", className)} htmlFor={id}>
      <span id={labelId}>{label}</span>
      <span className="ogui-select__control">
        <select
          {...props}
          id={id}
          name={props.name ?? id}
          aria-labelledby={labelId}
          autoComplete={props.autoComplete ?? "off"}
          style={{ colorScheme: appearance, ...props.style }}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <i aria-hidden="true">⌄</i>
      </span>
    </label>
  );
}

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
}

export function TextField({
  label,
  hint,
  error,
  className,
  id: suppliedId,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const labelId = `${id}-label`;
  const messageId = hint || error ? `${id}-message` : undefined;
  return (
    <label className={cx("ogui-field", Boolean(error) && "has-error", className)} htmlFor={id}>
      <span id={labelId}>{label}</span>
      <input
        {...props}
        id={id}
        name={props.name ?? id}
        autoComplete={props.autoComplete ?? "off"}
        aria-invalid={error ? true : undefined}
        aria-labelledby={labelId}
        aria-describedby={messageId}
      />
      {hint || error ? (
        <small id={messageId} role={error ? "alert" : undefined}>
          {error ?? hint}
        </small>
      ) : null}
    </label>
  );
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
}

export function Textarea({
  label,
  hint,
  error,
  className,
  id: suppliedId,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const labelId = `${id}-label`;
  const messageId = hint || error ? `${id}-message` : undefined;
  return (
    <label className={cx("ogui-field", Boolean(error) && "has-error", className)} htmlFor={id}>
      <span id={labelId}>{label}</span>
      <textarea
        {...props}
        id={id}
        name={props.name ?? id}
        autoComplete={props.autoComplete ?? "off"}
        aria-invalid={error ? true : undefined}
        aria-labelledby={labelId}
        aria-describedby={messageId}
      />
      {hint || error ? (
        <small id={messageId} role={error ? "alert" : undefined}>
          {error ?? hint}
        </small>
      ) : null}
    </label>
  );
}

export interface SearchFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export function SearchField({
  label,
  value,
  defaultValue = "",
  onValueChange,
  className,
  id: suppliedId,
  ...props
}: SearchFieldProps) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const shownValue = value ?? internalValue;
  const update = (next: string) => {
    if (value === undefined) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  };
  return (
    <label className={cx("ogui-search", className)} htmlFor={id}>
      <span className="ogui-sr-only">{label}</span>
      <i aria-hidden="true">⌕</i>
      <input
        {...props}
        id={id}
        name={props.name ?? id}
        type="search"
        value={shownValue}
        aria-label={label}
        autoComplete={props.autoComplete ?? "off"}
        spellCheck={props.spellCheck ?? false}
        onChange={(event: ChangeEvent<HTMLInputElement>) => update(event.currentTarget.value)}
      />
      {shownValue ? (
        <button type="button" aria-label={`Clear ${label}`} onClick={() => update("")}>
          ×
        </button>
      ) : null}
    </label>
  );
}

export interface NumberFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue"> {
  label: ReactNode;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  decrementLabel?: string;
  incrementLabel?: string;
}

export function NumberField({
  label,
  value,
  defaultValue = 0,
  onValueChange,
  decrementLabel,
  incrementLabel,
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  className,
  id: suppliedId,
  onChange,
  disabled,
  readOnly,
  ...props
}: NumberFieldProps) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const shownValue = value ?? internalValue;
  const rawMin = Number(min);
  const rawMax = Number(max);
  const minValue = Number.isFinite(rawMin) ? rawMin : Number.MIN_SAFE_INTEGER;
  const maxValue = Number.isFinite(rawMax) ? rawMax : Number.MAX_SAFE_INTEGER;
  const rawStep = Number(step);
  const stepValue = Number.isFinite(rawStep) && rawStep !== 0 ? Math.abs(rawStep) : 1;
  const labelText =
    typeof label === "string" || typeof label === "number" ? String(label) : "value";
  const decrementDisabled =
    disabled || readOnly || !Number.isFinite(shownValue) || shownValue <= minValue;
  const incrementDisabled =
    disabled || readOnly || !Number.isFinite(shownValue) || shownValue >= maxValue;
  const update = (next: number) => {
    const bounded = Math.min(Math.max(next, minValue), maxValue);
    if (value === undefined) {
      setInternalValue(bounded);
    }
    onValueChange?.(bounded);
  };
  return (
    <div className={cx("ogui-field", "ogui-number", className)}>
      <label htmlFor={id}>{label}</label>
      <span className="ogui-number__control">
        <button
          type="button"
          aria-label={decrementLabel ?? `Decrease ${labelText}`}
          disabled={decrementDisabled}
          onClick={() => update(shownValue - stepValue)}
        >
          −
        </button>
        <input
          {...props}
          id={id}
          name={props.name ?? id}
          type="number"
          disabled={disabled}
          readOnly={readOnly}
          inputMode={props.inputMode ?? "decimal"}
          min={min}
          max={max}
          step={step}
          value={shownValue}
          onChange={(event) => {
            onChange?.(event);
            if (!event.defaultPrevented && Number.isFinite(event.currentTarget.valueAsNumber)) {
              update(event.currentTarget.valueAsNumber);
            }
          }}
        />
        <button
          type="button"
          aria-label={incrementLabel ?? `Increase ${labelText}`}
          disabled={incrementDisabled}
          onClick={() => update(shownValue + stepValue)}
        >
          +
        </button>
      </span>
    </div>
  );
}

export interface StepItem {
  id?: string;
  label: ReactNode;
  description?: ReactNode;
}

export function Stepper({
  items,
  current,
  onStepChange,
  className,
}: {
  items: readonly StepItem[];
  current: number;
  onStepChange?: (index: number) => void;
  className?: string;
}) {
  const generatedId = useId();

  return (
    <ol className={cx("ogui-stepper", className)}>
      {items.map((item, index) => (
        <li
          key={item.id ?? `${generatedId}-step-${index}`}
          data-state={index < current ? "complete" : index === current ? "current" : "upcoming"}
        >
          <button
            type="button"
            disabled={!onStepChange}
            aria-current={index === current ? "step" : undefined}
            onClick={() => onStepChange?.(index)}
          >
            <i aria-hidden="true">{index < current ? "✓" : index + 1}</i>
            <span>
              <strong>{item.label}</strong>
              {item.description ? <small>{item.description}</small> : null}
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}

export interface ToggleButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "onChange"> {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

export function ToggleButton({
  pressed,
  defaultPressed = false,
  onPressedChange,
  className,
  children,
  onClick,
  ...props
}: ToggleButtonProps) {
  const [internalPressed, setInternalPressed] = useState(defaultPressed);
  const shownPressed = pressed ?? internalPressed;
  return (
    <button
      {...props}
      type="button"
      className={cx("ogui-toggle-button", className)}
      aria-pressed={shownPressed}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) {
          return;
        }
        if (pressed === undefined) {
          setInternalPressed(!shownPressed);
        }
        onPressedChange?.(!shownPressed);
      }}
    >
      {children}
    </button>
  );
}

export interface FileDropzoneProps extends HTMLAttributes<HTMLFieldSetElement> {
  label: string;
  name?: string;
  accept?: string;
  multiple?: boolean;
  maxSizeBytes?: number;
  onFiles?: (files: File[]) => void;
  onRejected?: (files: File[]) => void;
  onInputChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function FileDropzone({
  label,
  name,
  accept,
  multiple = false,
  maxSizeBytes,
  onFiles,
  onRejected,
  onInputChange,
  className,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
  ...props
}: FileDropzoneProps) {
  const inputId = useId();
  const statusId = `${inputId}-status`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [error, setError] = useState("");
  const acceptsFile = (file: File) => {
    if (!accept) {
      return true;
    }
    return accept.split(",").some((rawRule) => {
      const rule = rawRule.trim().toLowerCase();
      if (rule.startsWith(".")) {
        return file.name.toLowerCase().endsWith(rule);
      }
      if (rule.endsWith("/*")) {
        return file.type.toLowerCase().startsWith(rule.slice(0, -1));
      }
      return file.type.toLowerCase() === rule;
    });
  };
  const syncNativeFiles = (files: File[]) => {
    const input = inputRef.current;
    if (!input) {
      return false;
    }
    if (files.length === 0) {
      input.value = "";
      return true;
    }
    if (typeof DataTransfer === "undefined") {
      input.value = "";
      return false;
    }
    try {
      const transfer = new DataTransfer();
      for (const file of files) {
        transfer.items.add(file);
      }
      input.files = transfer.files;
      return true;
    } catch {
      input.value = "";
      return false;
    }
  };
  const receive = (files: File[]) => {
    const selectedFiles = multiple ? files : files.slice(0, 1);
    const overflow = multiple ? [] : files.slice(1);
    const accepted = selectedFiles.filter(
      (file) => acceptsFile(file) && (maxSizeBytes === undefined || file.size <= maxSizeBytes),
    );
    const rejected = [...selectedFiles.filter((file) => !accepted.includes(file)), ...overflow];
    setFileNames(accepted.map((file) => file.name));
    setError(
      rejected.length
        ? `${rejected.length} ${rejected.length === 1 ? "file was" : "files were"} rejected.`
        : "",
    );
    onFiles?.(accepted);
    if (rejected.length) {
      onRejected?.(rejected);
    }
    return { accepted, rejected };
  };
  const handleDrop = (event: DragEvent<HTMLFieldSetElement>) => {
    onDrop?.(event);
    event.preventDefault();
    setDragging(false);
    const { accepted } = receive([...event.dataTransfer.files]);
    syncNativeFiles(accepted);
  };

  return (
    <fieldset
      {...props}
      className={cx("ogui-dropzone", className)}
      data-dragging={dragging ? "true" : "false"}
      onDragEnter={(event) => {
        onDragEnter?.(event);
        event.preventDefault();
        setDragging(true);
      }}
      onDragOver={(event) => {
        onDragOver?.(event);
        event.preventDefault();
      }}
      onDragLeave={(event) => {
        onDragLeave?.(event);
        if (
          !(event.relatedTarget instanceof Node) ||
          !event.currentTarget.contains(event.relatedTarget)
        ) {
          setDragging(false);
        }
      }}
      onDrop={handleDrop}
    >
      <legend className="ogui-sr-only">{label}</legend>
      <input
        ref={inputRef}
        id={inputId}
        name={name ?? inputId}
        type="file"
        aria-label={label}
        aria-describedby={statusId}
        accept={accept}
        multiple={multiple}
        onChange={(event) => {
          onInputChange?.(event);
          if (event.defaultPrevented) {
            return;
          }
          const files = [...(event.currentTarget.files ?? [])];
          const { accepted, rejected } = receive(files);
          if (rejected.length) {
            syncNativeFiles(accepted);
          }
        }}
      />
      <label htmlFor={inputId}>
        <i aria-hidden="true">↥</i>
        <strong>{label}</strong>
        <span id={statusId} role={error ? "alert" : "status"}>
          {error || (fileNames.length ? fileNames.join(", ") : "Drop files or browse")}
        </span>
      </label>
    </fieldset>
  );
}
