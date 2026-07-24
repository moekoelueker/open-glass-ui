import { Glass, type GlassProps } from "@prism-lab/react";
import {
  type ButtonHTMLAttributes,
  cloneElement,
  type DetailsHTMLAttributes,
  type FieldsetHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type ReactElement,
  type ReactNode,
  useId,
  useRef,
  useState,
} from "react";
import "./styles.css";

function classes(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function useControllableValue<T>(
  controlledValue: T | undefined,
  defaultValue: T,
  onChange: ((value: T) => void) | undefined,
) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue ?? internalValue;

  return [
    value,
    (nextValue: T) => {
      if (controlledValue === undefined) {
        setInternalValue(nextValue);
      }
      onChange?.(nextValue);
    },
  ] as const;
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
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={classes("pl-button", `pl-button--${variant}`, `pl-control--${size}`, className)}
    >
      {leadingIcon ? <span className="pl-button__icon">{leadingIcon}</span> : null}
      <span className="pl-button__label">{children}</span>
      {trailingIcon ? <span className="pl-button__icon">{trailingIcon}</span> : null}
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
      className={classes("pl-icon-button", className)}
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

  return (
    <fieldset {...props} className={classes("pl-segments", className)}>
      <legend className="pl-sr-only">{label}</legend>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          className="pl-segments__item"
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
      className={classes("pl-switch", labelProps?.className, className)}
      htmlFor={id}
    >
      <input
        {...props}
        id={id}
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
      <span className="pl-switch__copy">
        <span id={`${id}-label`} className="pl-switch__label">
          {label}
        </span>
        {description ? (
          <span id={descriptionId} className="pl-switch__description">
            {description}
          </span>
        ) : null}
      </span>
      <span className="pl-switch__track" aria-hidden="true">
        <span className="pl-switch__thumb" />
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
  const [liveValue, setLiveValue] = useState(defaultValue ?? min);
  const shownValue = value ?? liveValue;
  const numericValue = Array.isArray(shownValue) ? shownValue[0] : shownValue;

  return (
    <label className={classes("pl-slider", className)} htmlFor={id}>
      <span className="pl-slider__header">
        <span>{label}</span>
        <output htmlFor={id}>{valueText ?? `${numericValue}${unit}`}</output>
      </span>
      <input
        {...props}
        id={id}
        type="range"
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
  tone = "dark",
  className,
  children,
  ...props
}: ToolbarProps) {
  return (
    <Glass
      {...props}
      className={classes("pl-toolbar", className)}
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
  tone = "dark",
  className,
  children,
  ...props
}: DockProps) {
  return (
    <Glass
      {...props}
      as="nav"
      aria-label={label}
      className={classes("pl-dock", className)}
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
  defaultValue = items[0]?.value,
  onValueChange,
  className,
  ...props
}: TabsProps<T>) {
  if (defaultValue === undefined) {
    throw new Error("Tabs requires at least one item or a defaultValue.");
  }
  const id = useId();
  const [value, setValue] = useControllableValue(controlledValue, defaultValue, onValueChange);
  const activeItem = items.find((item) => item.value === value) ?? items[0];
  const tabsRef = useRef<HTMLDivElement>(null);

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
    <div {...props} className={classes("pl-tabs", className)}>
      <div ref={tabsRef} className="pl-tabs__list" role="tablist" aria-label={label}>
        {items.map((item) => {
          const selected = item.value === activeItem?.value;
          return (
            <button
              key={item.value}
              id={`${id}-tab-${item.value}`}
              type="button"
              role="tab"
              data-tab-value={item.value}
              aria-selected={selected}
              aria-controls={`${id}-panel-${item.value}`}
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
          id={`${id}-panel-${activeItem.value}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${activeItem.value}`}
          className="pl-tabs__panel"
        >
          {activeItem.content}
        </div>
      ) : null}
    </div>
  );
}

export interface DisclosureSurfaceProps extends DetailsHTMLAttributes<HTMLDetailsElement> {
  trigger: ReactNode;
  triggerLabel?: string;
  material?: GlassProps["material"];
  tone?: GlassProps["tone"];
  placement?: "start" | "center" | "end";
}

function DisclosureSurface({
  trigger,
  triggerLabel,
  material = "frosted",
  tone = "dark",
  placement = "start",
  className,
  children,
  ...props
}: DisclosureSurfaceProps) {
  return (
    <details {...props} className={classes("pl-disclosure", className)} data-placement={placement}>
      <summary aria-label={triggerLabel}>{trigger}</summary>
      <Glass className="pl-disclosure__surface" material={material} tone={tone}>
        {children}
      </Glass>
    </details>
  );
}

export interface MenuProps extends DisclosureSurfaceProps {
  label: string;
}

export function Menu({ label, children, ...props }: MenuProps) {
  return (
    <DisclosureSurface
      {...props}
      triggerLabel={label}
      className={classes("pl-menu", props.className)}
    >
      <div role="menu" aria-label={label} className="pl-menu__items">
        {children}
      </div>
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
  return (
    <button
      {...props}
      type={type}
      role="menuitem"
      className={classes("pl-menu__item", destructive && "is-destructive", className)}
      onClick={(event) => {
        onClick?.(event);
        event.currentTarget.closest("details")?.removeAttribute("open");
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
      className={classes("pl-popover", props.className)}
    >
      <div className="pl-popover__content" role="dialog" aria-label={label}>
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

  return (
    <span className="pl-tooltip" data-placement={placement}>
      {cloneElement(children, { "aria-describedby": id })}
      <span id={id} role="tooltip" className="pl-tooltip__bubble">
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

  return (
    <div {...props} className={classes("pl-media", className)}>
      <IconButton
        size="small"
        variant="quiet"
        aria-label={playing ? "Pause" : "Play"}
        onClick={() => onPlayingChange(!playing)}
      >
        <span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>
      </IconButton>
      <label className="pl-media__seek" htmlFor={seekId}>
        <span className="pl-sr-only">Seek media</span>
        <input
          id={seekId}
          type="range"
          min={0}
          max={Math.max(duration, 1)}
          step={0.01}
          value={Math.min(currentTime, Math.max(duration, 1))}
          onChange={(event) => onSeek(Number(event.currentTarget.value))}
        />
      </label>
      <output className="pl-media__time" htmlFor={seekId}>
        {formatTime(currentTime)} / {formatTime(duration)}
      </output>
      {onMutedChange ? (
        <IconButton
          size="small"
          variant="quiet"
          aria-label={muted ? "Unmute" : "Mute"}
          onClick={() => onMutedChange(!muted)}
        >
          <span aria-hidden="true">{muted ? "M" : "V"}</span>
        </IconButton>
      ) : null}
    </div>
  );
}
