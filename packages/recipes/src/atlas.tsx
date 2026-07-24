import {
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type DragEvent,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export type SemanticTone = "neutral" | "accent" | "positive" | "warning" | "danger";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: SemanticTone;
}

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return <span {...props} className={cx("pl-badge", className)} data-tone={tone} />;
}

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
  src?: string;
  size?: "small" | "medium" | "large";
}

export function Avatar({ name, src, size = "medium", className, ...props }: AvatarProps) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <span
      {...props}
      className={cx("pl-avatar", className)}
      data-size={size}
      role="img"
      aria-label={name}
      title={name}
    >
      {src ? <img src={src} alt="" /> : <span aria-hidden="true">{initials}</span>}
    </span>
  );
}

export function AvatarGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("pl-avatar-group", className)} />;
}

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: ReactNode;
  title?: ReactNode;
  footer?: ReactNode;
  interactive?: boolean;
}

export function Card({
  eyebrow,
  title,
  footer,
  interactive = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <article
      {...props}
      className={cx("pl-card", interactive && "is-interactive", className)}
      tabIndex={interactive ? 0 : undefined}
    >
      {eyebrow ? <span className="pl-card__eyebrow">{eyebrow}</span> : null}
      {title ? <strong className="pl-card__title">{title}</strong> : null}
      <div className="pl-card__body">{children}</div>
      {footer ? <footer className="pl-card__footer">{footer}</footer> : null}
    </article>
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
    <div {...props} className={cx("pl-stat", className)} data-tone={tone}>
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
  const safeMax = Math.max(max, 1);
  const safeValue = Math.min(Math.max(value, 0), safeMax);
  return (
    <div {...props} className={cx("pl-progress", className)}>
      <span>
        <span>{label}</span>
        <output>{Math.round((safeValue / safeMax) * 100)}%</output>
      </span>
      <progress value={safeValue} max={safeMax} />
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
  return (
    <div {...props} className={cx("pl-meter", className)}>
      <span>{label}</span>
      <meter value={value} min={min} max={max} low={low} high={high} optimum={optimum} />
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
    <span {...props} className={cx("pl-spinner", className)} role="status">
      <i aria-hidden="true" />
      <span className="pl-sr-only">{label}</span>
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
      className={cx("pl-skeleton", className)}
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
      className={cx("pl-alert", className)}
      data-tone={tone}
      role={tone === "danger" ? "alert" : "status"}
    >
      <span className="pl-alert__signal" aria-hidden="true" />
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
    <aside {...props} className={cx("pl-banner", className)} aria-label={String(title)}>
      <span className="pl-banner__flare" aria-hidden="true" />
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
    <nav {...props} className={cx("pl-breadcrumbs", className)} aria-label="Breadcrumb">
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

export function Pagination({ page, count, onPageChange, className, ...props }: PaginationProps) {
  const safeCount = Math.max(1, Math.floor(count));
  const safePage = Math.min(Math.max(1, Math.floor(page)), safeCount);
  return (
    <nav {...props} className={cx("pl-pagination", className)} aria-label="Pagination">
      <button
        type="button"
        aria-label="Previous page"
        disabled={safePage <= 1}
        onClick={() => onPageChange(safePage - 1)}
      >
        ←
      </button>
      {Array.from({ length: safeCount }, (_, index) => index + 1).map((item) => (
        <button
          key={item}
          type="button"
          aria-label={`Page ${item}`}
          aria-current={item === safePage ? "page" : undefined}
          onClick={() => onPageChange(item)}
        >
          {item}
        </button>
      ))}
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
    <div {...props} className={cx("pl-accordion", className)}>
      {items.map((item) => {
        const open = openItems.has(item.id);
        return (
          <section key={item.id} data-open={open ? "true" : "false"}>
            <h3>
              <button
                id={`${baseId}-${item.id}-trigger`}
                type="button"
                aria-expanded={open}
                aria-controls={`${baseId}-${item.id}-panel`}
                onClick={() => toggle(item.id)}
              >
                <span>{item.title}</span>
                <i aria-hidden="true">+</i>
              </button>
            </h3>
            {open ? (
              <section
                id={`${baseId}-${item.id}-panel`}
                aria-labelledby={`${baseId}-${item.id}-trigger`}
              >
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
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Overlay({
  title,
  triggerLabel,
  children,
  defaultOpen = false,
  onOpenChange,
  kind,
}: OverlayProps & { kind: "dialog" | "drawer" }) {
  const [open, setOpen] = useState(defaultOpen);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const surfaceRef = useRef<HTMLSpanElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  useEffect(() => {
    if (!open) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        onOpenChange?.(false);
        triggerRef.current?.focus();
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
    };
  }, [onOpenChange, open]);

  const setVisibility = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  return (
    <span className={`pl-overlay-trigger pl-overlay-trigger--${kind}`}>
      <button ref={triggerRef} type="button" onClick={() => setVisibility(true)}>
        {triggerLabel}
      </button>
      {open ? (
        <span className="pl-overlay" data-kind={kind}>
          <button
            type="button"
            className="pl-overlay__scrim"
            aria-label={`Close ${title}`}
            onClick={() => {
              setVisibility(false);
              triggerRef.current?.focus();
            }}
          />
          <span
            ref={surfaceRef}
            className="pl-overlay__surface"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <span className="pl-overlay__header">
              <strong id={titleId}>{title}</strong>
              <button
                ref={closeRef}
                type="button"
                aria-label={`Close ${title}`}
                onClick={() => {
                  setVisibility(false);
                  triggerRef.current?.focus();
                }}
              >
                ×
              </button>
            </span>
            <span className="pl-overlay__body">{children}</span>
          </span>
        </span>
      ) : null}
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
  defaultOpen?: boolean;
}

export function Toast({
  title,
  actionLabel,
  onAction,
  defaultOpen = true,
  className,
  children,
  ...props
}: ToastProps) {
  const [open, setOpen] = useState(defaultOpen);
  if (!open) {
    return (
      <button type="button" className="pl-toast__restore" onClick={() => setOpen(true)}>
        Show toast
      </button>
    );
  }
  return (
    <div {...props} className={cx("pl-toast", className)} role="status">
      <span className="pl-toast__mark" aria-hidden="true">
        ✓
      </span>
      <div>
        <strong>{title}</strong>
        {children ? <span>{children}</span> : null}
      </div>
      {actionLabel ? (
        <button type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
      <button type="button" aria-label="Dismiss notification" onClick={() => setOpen(false)}>
        ×
      </button>
    </div>
  );
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
  const descriptionId = description ? `${id}-description` : undefined;
  return (
    <label className={cx("pl-check", className)} htmlFor={id}>
      <input {...props} id={id} type="checkbox" aria-describedby={descriptionId} />
      <i aria-hidden="true">✓</i>
      <span>
        <strong>{label}</strong>
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

export function RadioGroup<T extends string>({
  label,
  items,
  value,
  defaultValue,
  onValueChange,
  className,
}: {
  label: string;
  items: readonly RadioItem<T>[];
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  className?: string;
}) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? items[0]?.value);
  const selected = value ?? internalValue;
  const name = useId();
  return (
    <fieldset className={cx("pl-radio-group", className)}>
      <legend>{label}</legend>
      {items.map((item) => (
        <label key={item.value}>
          <input
            type="radio"
            name={name}
            value={item.value}
            checked={selected === item.value}
            disabled={item.disabled}
            onChange={() => {
              setInternalValue(item.value);
              onValueChange?.(item.value);
            }}
          />
          <i aria-hidden="true" />
          <span>
            <strong>{item.label}</strong>
            {item.description ? <small>{item.description}</small> : null}
          </span>
        </label>
      ))}
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
  return (
    <label className={cx("pl-field", "pl-select", className)} htmlFor={id}>
      <span>{label}</span>
      <span className="pl-select__control">
        <select {...props} id={id}>
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
  const messageId = hint || error ? `${id}-message` : undefined;
  return (
    <label className={cx("pl-field", Boolean(error) && "has-error", className)} htmlFor={id}>
      <span>{label}</span>
      <input
        {...props}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={messageId}
      />
      {hint || error ? <small id={messageId}>{error ?? hint}</small> : null}
    </label>
  );
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: ReactNode;
  hint?: ReactNode;
}

export function Textarea({ label, hint, className, id: suppliedId, ...props }: TextareaProps) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <label className={cx("pl-field", className)} htmlFor={id}>
      <span>{label}</span>
      <textarea {...props} id={id} aria-describedby={hintId} />
      {hint ? <small id={hintId}>{hint}</small> : null}
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
    <label className={cx("pl-search", className)} htmlFor={id}>
      <span className="pl-sr-only">{label}</span>
      <i aria-hidden="true">⌕</i>
      <input
        {...props}
        id={id}
        type="search"
        value={shownValue}
        aria-label={label}
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
}

export function NumberField({
  label,
  value,
  defaultValue = 0,
  onValueChange,
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  className,
  id: suppliedId,
  ...props
}: NumberFieldProps) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const shownValue = value ?? internalValue;
  const stepValue = Number(step) || 1;
  const update = (next: number) => {
    const bounded = Math.min(Math.max(next, Number(min)), Number(max));
    if (value === undefined) {
      setInternalValue(bounded);
    }
    onValueChange?.(bounded);
  };
  return (
    <div className={cx("pl-field", "pl-number", className)}>
      <label htmlFor={id}>{label}</label>
      <span className="pl-number__control">
        <button
          type="button"
          aria-label={`Decrease ${String(label)}`}
          onClick={() => update(shownValue - stepValue)}
        >
          −
        </button>
        <input
          {...props}
          id={id}
          type="number"
          min={min}
          max={max}
          step={step}
          value={shownValue}
          onChange={(event) => update(Number(event.currentTarget.value))}
        />
        <button
          type="button"
          aria-label={`Increase ${String(label)}`}
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
  return (
    <ol className={cx("pl-stepper", className)}>
      {items.map((item, index) => (
        <li
          key={item.id ?? String(item.label)}
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
  ...props
}: ToggleButtonProps) {
  const [internalPressed, setInternalPressed] = useState(defaultPressed);
  const shownPressed = pressed ?? internalPressed;
  return (
    <button
      {...props}
      type="button"
      className={cx("pl-toggle-button", className)}
      aria-pressed={shownPressed}
      onClick={() => {
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
  accept?: string;
  multiple?: boolean;
  onFiles?: (files: File[]) => void;
}

export function FileDropzone({
  label,
  accept,
  multiple = false,
  onFiles,
  className,
  ...props
}: FileDropzoneProps) {
  const inputId = useId();
  const [dragging, setDragging] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const receive = (files: File[]) => {
    setFileNames(files.map((file) => file.name));
    onFiles?.(files);
  };
  const handleDrop = (event: DragEvent<HTMLFieldSetElement>) => {
    event.preventDefault();
    setDragging(false);
    receive([...event.dataTransfer.files]);
  };

  return (
    <fieldset
      {...props}
      className={cx("pl-dropzone", className)}
      data-dragging={dragging ? "true" : "false"}
      onDragEnter={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <legend className="pl-sr-only">{label}</legend>
      <input
        id={inputId}
        type="file"
        aria-label={label}
        accept={accept}
        multiple={multiple}
        onChange={(event) => receive([...(event.currentTarget.files ?? [])])}
      />
      <label htmlFor={inputId}>
        <i aria-hidden="true">↥</i>
        <strong>{label}</strong>
        <span>{fileNames.length ? fileNames.join(", ") : "Drop files or browse"}</span>
      </label>
    </fieldset>
  );
}
