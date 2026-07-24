import { type PointerEvent as ReactPointerEvent, useEffect, useRef } from "react";

export interface GlassPointerField {
  onPointerMove(event: ReactPointerEvent<HTMLElement>): void;
  onPointerLeave(event: ReactPointerEvent<HTMLElement>): void;
  onPointerDown(event: ReactPointerEvent<HTMLElement>): void;
  onPointerUp(event: ReactPointerEvent<HTMLElement>): void;
  onPointerCancel(event: ReactPointerEvent<HTMLElement>): void;
}

export function useGlassPointerField(enabled: boolean): GlassPointerField {
  const frameRef = useRef<number | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  useEffect(
    () => () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    },
    [],
  );

  const schedule = () => {
    if (!enabled || frameRef.current !== null) {
      return;
    }

    const advance = () => {
      const element = elementRef.current;
      const current = currentRef.current;
      const target = targetRef.current;
      current.x += (target.x - current.x) * 0.18;
      current.y += (target.y - current.y) * 0.18;

      if (element) {
        element.style.setProperty("--prism-pointer-x", current.x.toFixed(4));
        element.style.setProperty("--prism-pointer-y", current.y.toFixed(4));
        element.style.setProperty(
          "--prism-pointer-distance",
          Math.hypot(current.x, current.y).toFixed(4),
        );
      }

      if (Math.abs(target.x - current.x) > 0.002 || Math.abs(target.y - current.y) > 0.002) {
        frameRef.current = requestAnimationFrame(advance);
      } else {
        current.x = target.x;
        current.y = target.y;
        frameRef.current = null;
      }
    };

    frameRef.current = requestAnimationFrame(advance);
  };

  return {
    onPointerMove(event) {
      if (!enabled) {
        return;
      }
      const element = event.currentTarget;
      const bounds = element.getBoundingClientRect();
      elementRef.current = element;
      targetRef.current.x = ((event.clientX - bounds.left) / Math.max(bounds.width, 1) - 0.5) * 2;
      targetRef.current.y = ((event.clientY - bounds.top) / Math.max(bounds.height, 1) - 0.5) * 2;
      schedule();
    },
    onPointerLeave(event) {
      elementRef.current = event.currentTarget;
      targetRef.current.x = 0;
      targetRef.current.y = 0;
      event.currentTarget.style.setProperty("--prism-press", "0");
      schedule();
    },
    onPointerDown(event) {
      if (enabled) {
        event.currentTarget.style.setProperty("--prism-press", "1");
      }
    },
    onPointerUp(event) {
      event.currentTarget.style.setProperty("--prism-press", "0");
    },
    onPointerCancel(event) {
      event.currentTarget.style.setProperty("--prism-press", "0");
    },
  };
}
