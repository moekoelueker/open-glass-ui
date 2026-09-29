"use client";

import { Glass, type GlassProps, useGlassTheme } from "@open-glass-ui/react";
import {
  type ButtonHTMLAttributes,
  type CSSProperties,
  cloneElement,
  createContext,
  type FieldsetHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import "./styles.css";
import "./liquid.css";

export type {
  AccordionItem,
  AlertProps,
  AvatarProps,
  BadgeProps,
  BannerProps,
  BreadcrumbItem,
  CardProps,
  CheckboxProps,
  FileDropzoneProps,
  MeterProps,
  NumberFieldProps,
  OverlayProps,
  PaginationProps,
  ProgressProps,
  RadioGroupProps,
  RadioItem,
  SearchFieldProps,
  SelectOption,
  SelectProps,
  SemanticTone,
  StatProps,
  StepItem,
  TextareaProps,
  TextFieldProps,
  ToastController,
  ToastOptions,
  ToastProps,
  ToastProviderProps,
  ToggleButtonProps,
} from "./atlas";
export {
  Accordion,
  Alert,
  Avatar,
  AvatarGroup,
  Badge,
  Banner,
  Breadcrumbs,
  Card,
  Checkbox,
  Dialog,
  Drawer,
  FileDropzone,
  Meter,
  NumberField,
  Pagination,
  Progress,
  RadioGroup,
  SearchField,
  Select,
  Skeleton,
  Spinner,
  Stat,
  Stepper,
  Textarea,
  TextField,
  Toast,
  ToastProvider,
  ToggleButton,
  useToast,
} from "./atlas";

function classes(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function idPart(value: string) {
  return encodeURIComponent(value).replaceAll("%", "_");
}

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Publishes the selected item's box as CSS variables on its container so the
 * stylesheet can slide one shared indicator between items. Writes go straight
 * to the element style: the indicator never causes a React render.
 */
function useSelectionIndicator(
  containerRef: { current: HTMLElement | null },
  selector: string,
  key: unknown,
) {
  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const place = () => {
      const selected = container.querySelector<HTMLElement>(selector);
      if (!selected) {
        container.removeAttribute("data-ogui-indicator");
        return;
      }
      container.style.setProperty("--ogui-indicator-x", `${selected.offsetLeft}px`);
      container.style.setProperty("--ogui-indicator-y", `${selected.offsetTop}px`);
      container.style.setProperty("--ogui-indicator-w", `${selected.offsetWidth}px`);
      container.style.setProperty("--ogui-indicator-h", `${selected.offsetHeight}px`);
      container.setAttribute("data-ogui-indicator", "ready");
    };
    place();
    if (typeof ResizeObserver === "undefined") {
      return;
    }
    const observer = new ResizeObserver(place);
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, selector, key]);
}

/** Filled fraction (0 to 1) of a range input's track, for the liquid track. */
function rangeProgress(value: unknown, min: unknown, max: unknown) {
  const low = Number(min);
  const high = Number(max);
  const current = Number(value);
  if (![low, high, current].every(Number.isFinite) || high <= low) {
    return "0";
  }
  return Math.min(Math.max((current - low) / (high - low), 0), 1).toFixed(4);
}

function useControllableValue<T>(
  controlledValue: T | undefined,
  defaultValue: T,
  onChange: ((value: T) => void) | undefined,
) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue ?? internalValue;
  const setValue = useCallback(
    (nextValue: T) => {
      if (controlledValue === undefined) {
        setInternalValue(nextValue);
      }
      onChange?.(nextValue);
    },
    [controlledValue, onChange],
  );

  return [value, setValue] as const;
}

export type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";
export type ControlSize = "small" | "medium" | "large";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ControlSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export function Button({
  variant = "secondary",
  size = "medium",
  leadingIcon,
  trailingIcon,
  className,
  children,
  type = "button",
  onPointerMove,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      onPointerMove={(event) => {
        // Drives the pointer-following specular highlight in the liquid design
        // without a React render; the classic stylesheet ignores the values.
        const target = event.currentTarget;
        const box = target.getBoundingClientRect();
        if (box.width > 0 && box.height > 0) {
          target.style.setProperty(
            "--ogui-light-x",
            `${(((event.clientX - box.left) / box.width) * 100).toFixed(1)}%`,
          );
          target.style.setProperty(
            "--ogui-light-y",
            `${(((event.clientY - box.top) / box.height) * 100).toFixed(1)}%`,
          );
        }
        onPointerMove?.(event);
      }}
      className={classes(
        "ogui-button",
        `ogui-button--${variant}`,
        `ogui-control--${size}`,
        className,
      )}
    >
      {leadingIcon ? <span className="ogui-button__icon">{leadingIcon}</span> : null}
      <span className="ogui-button__label">{children}</span>
      {trailingIcon ? <span className="ogui-button__icon">{trailingIcon}</span> : null}
    </button>
  );
}

export interface IconButtonProps extends Omit<ButtonProps, "children" | "aria-label"> {
  "aria-label": string;
  children: ReactNode;
}

export function IconButton({
  size = "medium",
  variant = "quiet",
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <Button
      {...props}
      size={size}
      variant={variant}
      className={classes("ogui-icon-button", className)}
    >
      {children}
    </Button>
  );
}

export interface SegmentItem<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string>
  extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "onChange" | "defaultValue"> {
  "aria-label": string;
  items: readonly SegmentItem<T>[];
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  items,
  value: controlledValue,
  defaultValue = items[0]?.value,
  onValueChange,
  className,
  "aria-label": label,
  ...props
}: SegmentedControlProps<T>) {
  if (defaultValue === undefined) {
    throw new Error("SegmentedControl requires at least one item or a defaultValue.");
  }
  const [value, setValue] = useControllableValue(controlledValue, defaultValue, onValueChange);
  const segmentsRef = useRef<HTMLFieldSetElement>(null);
  useSelectionIndicator(segmentsRef, '.ogui-segments__item[aria-pressed="true"]', value);

  return (
    <fieldset ref={segmentsRef} {...props} className={classes("ogui-segments", className)}>
      <legend className="ogui-sr-only">{label}</legend>
      <span className="ogui-segments__indicator" aria-hidden="true" />
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          className="ogui-segments__item"
          aria-pressed={item.value === value}
          disabled={item.disabled}
          onClick={() => setValue(item.value)}
        >
          {item.icon ? <span aria-hidden="true">{item.icon}</span> : null}
          <span>{item.label}</span>
        </button>
      ))}
    </fieldset>
  );
}

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label: ReactNode;
  description?: ReactNode;
  labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
  onCheckedChange?: (checked: boolean) => void;
}

export function Switch({
  label,
  description,
  className,
  labelProps,
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  onCheckedChange,
  id: suppliedId,
  ...props
}: SwitchProps) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const descriptionId = description ? `${id}-description` : undefined;
  const [checked, setChecked] = useControllableValue(
    controlledChecked,
    defaultChecked,
    onCheckedChange,
  );

  return (
    <label
      {...labelProps}
      className={classes("ogui-switch", labelProps?.className, className)}
      htmlFor={id}
    >
      <input
        {...props}
        id={id}
        name={props.name ?? id}
        type="checkbox"
        role="switch"
        checked={checked}
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={descriptionId}
        onChange={(event) => {
          setChecked(event.currentTarget.checked);
          onChange?.(event);
        }}
      />
      <span className="ogui-switch__copy">
        <span id={`${id}-label`} className="ogui-switch__label">
          {label}
        </span>
        {description ? (
          <span id={descriptionId} className="ogui-switch__description">
            {description}
          </span>
        ) : null}
      </span>
      <span className="ogui-switch__track" aria-hidden="true">
        <span className="ogui-switch__thumb" />
      </span>
    </label>
  );
}

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label: ReactNode;
  valueText?: string;
  unit?: string;
}

export function Slider({
  label,
  valueText,
  unit = "",
  className,
  id: suppliedId,
  value,
  defaultValue,
  min = 0,
  max = 100,
  ...props
}: SliderProps) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const labelId = `${id}-label`;
  const [liveValue, setLiveValue] = useState(defaultValue ?? min);
  const shownValue = value ?? liveValue;
  const numericValue = Array.isArray(shownValue) ? shownValue[0] : shownValue;
  const progress = rangeProgress(numericValue, min, max);

  return (
    <label
      className={classes("ogui-slider", className)}
      htmlFor={id}
      style={{ "--ogui-range-progress": progress } as CSSProperties}
    >
      <span className="ogui-slider__header">
        <span id={labelId}>{label}</span>
        <output htmlFor={id}>{valueText ?? `${numericValue}${unit}`}</output>
      </span>
      <input
        {...props}
        id={id}
        name={props.name ?? id}
        type="range"
        aria-labelledby={labelId}
        min={min}
        max={max}
        value={value}
        defaultValue={defaultValue}
        onInput={(event) => {
          setLiveValue(event.currentTarget.value);
          props.onInput?.(event);
        }}
      />
    </label>
  );
}

export interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  orientation?: "horizontal" | "vertical";
  material?: GlassProps["material"];
  tone?: GlassProps["tone"];
}

export function Toolbar({
  label,
  orientation = "horizontal",
  material = "regular",
  tone = "auto",
  className,
  children,
  ...props
}: ToolbarProps) {
  return (
    <Glass
      {...props}
      className={classes("ogui-toolbar", className)}
      role="toolbar"
      aria-label={label}
      aria-orientation={orientation}
      data-orientation={orientation}
      material={material}
      tone={tone}
    >
      {children}
    </Glass>
  );
}

export interface DockProps extends HTMLAttributes<HTMLElement> {
  label: string;
  material?: GlassProps["material"];
  tone?: GlassProps["tone"];
}

export function Dock({
  label,
  material = "regular",
  tone = "auto",
  className,
  children,
  ...props
}: DockProps) {
  return (
    <Glass
      {...props}
      as="nav"
      aria-label={label}
      className={classes("ogui-dock", className)}
      material={material}
      tone={tone}
    >
      {children}
    </Glass>
  );
}

export interface TabItem<T extends string> {
  value: T;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps<T extends string>
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  label: string;
  items: readonly TabItem<T>[];
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
}

export function Tabs<T extends string>({
  label,
  items,
  value: controlledValue,
  defaultValue: suppliedDefaultValue,
  onValueChange,
  className,
  ...props
}: TabsProps<T>) {
  const firstEnabled = items.find((item) => !item.disabled);
  const defaultValue =
    items.find((item) => item.value === suppliedDefaultValue && !item.disabled)?.value ??
    firstEnabled?.value;
  if (defaultValue === undefined) {
    throw new Error("Tabs requires at least one enabled item.");
  }
  const id = useId();
  const [value, setValue] = useControllableValue(controlledValue, defaultValue, onValueChange);
  const activeItem = items.find((item) => item.value === value && !item.disabled) ?? firstEnabled;
  const tabsRef = useRef<HTMLDivElement>(null);
  useSelectionIndicator(tabsRef, '[role="tab"][aria-selected="true"]', activeItem?.value);

  const move = (currentValue: T, direction: number) => {
    const enabled = items.filter((item) => !item.disabled);
    const currentIndex = enabled.findIndex((item) => item.value === currentValue);
    const next = enabled[(currentIndex + direction + enabled.length) % enabled.length];
    if (next) {
      setValue(next.value);
      const button = [
        ...(tabsRef.current?.querySelectorAll<HTMLButtonElement>("[role=tab]") ?? []),
      ].find((candidate) => candidate.dataset.tabValue === next.value);
      button?.focus();
    }
  };

  const moveToEdge = (edge: "first" | "last") => {
    const enabled = items.filter((item) => !item.disabled);
    const next = edge === "first" ? enabled[0] : enabled.at(-1);
    if (next) {
      setValue(next.value);
      const button = [
        ...(tabsRef.current?.querySelectorAll<HTMLButtonElement>("[role=tab]") ?? []),
      ].find((candidate) => candidate.dataset.tabValue === next.value);
      button?.focus();
    }
  };

  return (
    <div {...props} className={classes("ogui-tabs", className)}>
      <div ref={tabsRef} className="ogui-tabs__list" role="tablist" aria-label={label}>
        <span className="ogui-tabs__indicator" aria-hidden="true" />
        {items.map((item) => {
          const selected = item.value === activeItem?.value;
          const itemId = idPart(item.value);
          return (
            <button
              key={item.value}
              id={`${id}-tab-${itemId}`}
              type="button"
              role="tab"
              data-tab-value={item.value}
              aria-selected={selected}
              aria-controls={`${id}-panel-${itemId}`}
              tabIndex={selected ? 0 : -1}
              disabled={item.disabled}
              onClick={() => setValue(item.value)}
              onKeyDown={(event) => {
                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  move(item.value, -1);
                }
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  move(item.value, 1);
                }
                if (event.key === "Home") {
                  event.preventDefault();
                  moveToEdge("first");
                }
                if (event.key === "End") {
                  event.preventDefault();
                  moveToEdge("last");
                }
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {activeItem ? (
        <div
          id={`${id}-panel-${idPart(activeItem.value)}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${idPart(activeItem.value)}`}
          className="ogui-tabs__panel"
        >
          {activeItem.content}
        </div>
      ) : null}
    </div>
  );
}

export interface DisclosureSurfaceProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  trigger: ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>;
  triggerLabel?: string;
  material?: GlassProps["material"];
  tone?: GlassProps["tone"];
  placement?: "start" | "center" | "end";
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  focusOnOpen?: "none" | "first" | "last";
  openOnArrowKeys?: boolean;
}

const DisclosureCloseContext = /* @__PURE__ */ createContext<(() => void) | null>(null);

function DisclosureSurface({
  trigger,
  triggerLabel,
  material = "frosted",
  tone = "auto",
  placement = "start",
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  focusOnOpen = "none",
  openOnArrowKeys = false,
  className,
  children,
  ...props
}: DisclosureSurfaceProps) {
  const id = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLElement>(null);
  const requestedFocusRef = useRef(focusOnOpen);
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null);
  const [surfacePosition, setSurfacePosition] = useState<CSSProperties>({
    top: -10_000,
    left: -10_000,
  });
  const [open, setOpen] = useControllableValue(controlledOpen, defaultOpen, onOpenChange);
  const { appearance, tokens } = useGlassTheme();
  const focusTrigger = useCallback(() => {
    wrapperRef.current?.querySelector<HTMLButtonElement>("button[aria-controls]")?.focus();
  }, []);

  useEffect(() => {
    const host = document.createElement("div");
    host.setAttribute("data-ogui-portal", "disclosure");
    document.body.append(host);
    setPortalHost(host);
    return () => host.remove();
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !wrapperRef.current?.contains(event.target) &&
        !surfaceRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        focusTrigger();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [focusTrigger, open, setOpen]);

  useEffect(() => {
    if (!open || !portalHost || requestedFocusRef.current === "none") {
      return;
    }

    const focusFrame = requestAnimationFrame(() => {
      const surface = surfaceRef.current;
      if (!surface) {
        return;
      }
      const autofocus = surface.querySelector<HTMLElement>("[data-ogui-autofocus]:not([disabled])");
      const items = [
        ...surface.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ];
      const target = autofocus ?? (requestedFocusRef.current === "last" ? items.at(-1) : items[0]);
      target?.focus();
    });

    return () => cancelAnimationFrame(focusFrame);
  }, [open, portalHost]);

  useLayoutEffect(() => {
    if (!open || !portalHost) {
      return;
    }

    const updatePosition = () => {
      const trigger = wrapperRef.current?.querySelector<HTMLButtonElement>("button[aria-controls]");
      const surface = surfaceRef.current;
      if (!trigger || !surface) {
        return;
      }

      const gap = 8;
      const edge = 8;
      const triggerRect = trigger.getBoundingClientRect();
      const surfaceRect = surface.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = document.documentElement.clientHeight;
      const roomBelow = viewportHeight - triggerRect.bottom - gap;
      const roomAbove = triggerRect.top - gap;
      const placeAbove = surfaceRect.height > roomBelow && roomAbove > roomBelow;
      const preferredTop = placeAbove
        ? triggerRect.top - surfaceRect.height - gap
        : triggerRect.bottom + gap;
      const preferredLeft =
        placement === "center"
          ? triggerRect.left + (triggerRect.width - surfaceRect.width) / 2
          : placement === "end"
            ? triggerRect.right - surfaceRect.width
            : triggerRect.left;
      const maxLeft = Math.max(edge, viewportWidth - surfaceRect.width - edge);
      const maxTop = Math.max(edge, viewportHeight - surfaceRect.height - edge);

      setSurfacePosition({
        top: Math.min(Math.max(preferredTop, edge), maxTop),
        left: Math.min(Math.max(preferredLeft, edge), maxLeft),
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, placement, portalHost]);

  const close = useCallback(() => {
    setOpen(false);
    focusTrigger();
  }, [focusTrigger, setOpen]);

  return (
    <div
      {...props}
      ref={wrapperRef}
      className={classes("ogui-disclosure", className)}
      data-placement={placement}
      data-open={open ? "true" : "false"}
    >
      {cloneElement(trigger, {
        id: `${id}-trigger`,
        "aria-label": triggerLabel ?? trigger.props["aria-label"],
        "aria-expanded": open,
        "aria-controls": `${id}-surface`,
        "aria-haspopup": openOnArrowKeys ? "menu" : trigger.props["aria-haspopup"],
        onClick: (event) => {
          trigger.props.onClick?.(event);
          if (!event.defaultPrevented) {
            requestedFocusRef.current = focusOnOpen;
            setOpen(!open);
          }
        },
        onKeyDown: (event) => {
          trigger.props.onKeyDown?.(event);
          if (
            !event.defaultPrevented &&
            openOnArrowKeys &&
            (event.key === "ArrowDown" || event.key === "ArrowUp")
          ) {
            event.preventDefault();
            requestedFocusRef.current = event.key === "ArrowUp" ? "last" : "first";
            setOpen(true);
          }
        },
      })}
      {open && portalHost
        ? createPortal(
            <DisclosureCloseContext.Provider value={close}>
              <Glass
                ref={surfaceRef}
                id={`${id}-surface`}
                className="ogui-disclosure__surface ogui-disclosure__surface--portal"
                material={material}
                tone={tone}
                data-ogui-appearance={appearance}
                data-ogui-disclosure-surface=""
                data-placement={placement}
                style={
                  {
                    ...tokens,
                    colorScheme: appearance,
                    ...surfacePosition,
                  } as CSSProperties
                }
              >
                {children}
              </Glass>
            </DisclosureCloseContext.Provider>,
            portalHost,
          )
        : null}
    </div>
  );
}

export interface MenuProps extends DisclosureSurfaceProps {
  label: string;
}

function MenuItems({ label, children }: { label: string; children: ReactNode }) {
  const menuRef = useRef<HTMLDivElement>(null);
  const close = useContext(DisclosureCloseContext);

  const focusItem = (intent: "first" | "last" | "next" | "previous", current?: HTMLElement) => {
    const items = [
      ...(menuRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"]:not([disabled])',
      ) ?? []),
    ];
    if (items.length === 0) {
      return;
    }
    if (intent === "first") {
      items[0]?.focus();
      return;
    }
    if (intent === "last") {
      items.at(-1)?.focus();
      return;
    }
    const currentIndex = current ? items.indexOf(current as HTMLButtonElement) : -1;
    const delta = intent === "next" ? 1 : -1;
    items[(currentIndex + delta + items.length) % items.length]?.focus();
  };

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label={label}
      className="ogui-menu__items"
      onKeyDown={(event) => {
        const current = event.target instanceof HTMLElement ? event.target : undefined;
        if (event.key === "ArrowDown") {
          event.preventDefault();
          focusItem("next", current);
          return;
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          focusItem("previous", current);
          return;
        }
        if (event.key === "Home") {
          event.preventDefault();
          focusItem("first");
          return;
        }
        if (event.key === "End") {
          event.preventDefault();
          focusItem("last");
          return;
        }
        if (event.key === "Tab") {
          close?.();
          return;
        }
        if (event.key.length === 1 && /\S/.test(event.key)) {
          const items = [
            ...(menuRef.current?.querySelectorAll<HTMLButtonElement>(
              '[role="menuitem"]:not([disabled])',
            ) ?? []),
          ];
          const currentIndex = current ? items.indexOf(current as HTMLButtonElement) : -1;
          const orderedItems = [
            ...items.slice(currentIndex + 1),
            ...items.slice(0, currentIndex + 1),
          ];
          orderedItems
            .find((item) =>
              item.textContent
                ?.trim()
                .toLocaleLowerCase()
                .startsWith(event.key.toLocaleLowerCase()),
            )
            ?.focus();
        }
      }}
    >
      {children}
    </div>
  );
}

export function Menu({ label, children, ...props }: MenuProps) {
  return (
    <DisclosureSurface
      {...props}
      triggerLabel={label}
      className={classes("ogui-menu", props.className)}
      focusOnOpen="first"
      openOnArrowKeys
    >
      <MenuItems label={label}>{children}</MenuItems>
    </DisclosureSurface>
  );
}

export interface MenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  destructive?: boolean;
}

export function MenuItem({
  destructive = false,
  className,
  children,
  type = "button",
  onClick,
  ...props
}: MenuItemProps) {
  const close = useContext(DisclosureCloseContext);

  return (
    <button
      {...props}
      type={type}
      role="menuitem"
      tabIndex={-1}
      className={classes("ogui-menu__item", destructive && "is-destructive", className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          close?.();
        }
      }}
    >
      {children}
    </button>
  );
}

export interface PopoverProps extends DisclosureSurfaceProps {
  label: string;
}

export function Popover({ label, children, ...props }: PopoverProps) {
  return (
    <DisclosureSurface
      {...props}
      triggerLabel={label}
      className={classes("ogui-popover", props.className)}
      focusOnOpen="first"
    >
      <div className="ogui-popover__content" role="dialog" aria-label={label}>
        {children}
      </div>
    </DisclosureSurface>
  );
}

export interface TooltipProps {
  label: ReactNode;
  children: ReactElement<{ "aria-describedby"?: string }>;
  placement?: "top" | "bottom";
}

export function Tooltip({ label, children, placement = "top" }: TooltipProps) {
  const id = useId();
  const [dismissed, setDismissed] = useState(false);
  const describedBy = [children.props["aria-describedby"], id].filter(Boolean).join(" ");

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: the handlers only observe events bubbling from the interactive child to dismiss the tooltip (WCAG 1.4.13); the wrapper itself is never operable.
    <span
      className="ogui-tooltip"
      data-placement={placement}
      data-dismissed={dismissed ? "true" : "false"}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setDismissed(true);
        }
      }}
      onMouseLeave={() => setDismissed(false)}
      onBlurCapture={() => setDismissed(false)}
    >
      {cloneElement(children, { "aria-describedby": describedBy })}
      <span id={id} role="tooltip" className="ogui-tooltip__bubble">
        {label}
      </span>
    </span>
  );
}

export interface MediaControlsProps extends HTMLAttributes<HTMLDivElement> {
  playing: boolean;
  currentTime: number;
  duration: number;
  muted?: boolean;
  onPlayingChange: (playing: boolean) => void;
  onSeek: (time: number) => void;
  onMutedChange?: (muted: boolean) => void;
}

function formatTime(seconds: number) {
  const safeSeconds = Math.max(Number.isFinite(seconds) ? seconds : 0, 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = Math.floor(safeSeconds % 60);
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

// Inline vector icons keep playback glyphs crisp and identical across
// platforms; text glyphs like "▶" can render as emoji or fall back per font.
const MEDIA_ICON_PATHS = {
  play: "M5 3.2 12.8 8 5 12.8Z",
  pause: "M4.6 3.2h2.4v9.6H4.6Zm4.4 0h2.4v9.6H9Z",
  volume:
    "M2.4 5.6h2.3L8.2 3v10L4.7 10.4H2.4Zm7.6-.3a3.9 3.9 0 0 1 0 5.4l-1-1a2.5 2.5 0 0 0 0-3.4Z",
  muted:
    "M2.4 5.6h2.3L8.2 3v10L4.7 10.4H2.4Zm7.5.7 1-1 1.6 1.6 1.6-1.6 1 1L13.5 8l1.6 1.6-1 1-1.6-1.6-1.6 1.6-1-1L11.5 8Z",
} as const;

function MediaIcon({ name }: { name: keyof typeof MEDIA_ICON_PATHS }) {
  return (
    <svg
      aria-hidden="true"
      className="ogui-media__icon"
      fill="currentColor"
      focusable="false"
      height="14"
      viewBox="0 0 16 16"
      width="14"
    >
      <path d={MEDIA_ICON_PATHS[name]} />
    </svg>
  );
}

export function MediaControls({
  playing,
  currentTime,
  duration,
  muted = false,
  onPlayingChange,
  onSeek,
  onMutedChange,
  className,
  ...props
}: MediaControlsProps) {
  const seekId = useId();

  const seekMax = Math.max(duration, 1);

  return (
    <div
      {...props}
      className={classes("ogui-media", className)}
      style={
        {
          "--ogui-range-progress": rangeProgress(Math.min(currentTime, seekMax), 0, seekMax),
          ...props.style,
        } as CSSProperties
      }
    >
      <IconButton
        size="small"
        variant="quiet"
        aria-label={playing ? "Pause" : "Play"}
        onClick={() => onPlayingChange(!playing)}
      >
        <MediaIcon name={playing ? "pause" : "play"} />
      </IconButton>
      <label className="ogui-media__seek" htmlFor={seekId}>
        <span className="ogui-sr-only">Seek media</span>
        <input
          id={seekId}
          type="range"
          min={0}
          max={Math.max(duration, 1)}
          step={0.01}
          value={Math.min(currentTime, Math.max(duration, 1))}
          aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
          onChange={(event) => onSeek(Number(event.currentTarget.value))}
        />
      </label>
      <output className="ogui-media__time" htmlFor={seekId}>
        {formatTime(currentTime)} / {formatTime(duration)}
      </output>
      {onMutedChange ? (
        <IconButton
          size="small"
          variant="quiet"
          aria-label={muted ? "Unmute" : "Mute"}
          onClick={() => onMutedChange(!muted)}
        >
          <MediaIcon name={muted ? "muted" : "volume"} />
        </IconButton>
      ) : null}
    </div>
  );
}
