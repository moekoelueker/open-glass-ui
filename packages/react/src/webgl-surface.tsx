import type { RendererCapabilities } from "@open-glass-ui/renderers";
import type { WebGLLens, WebGLRendererStatus } from "@open-glass-ui/renderers/webgl";
import { WebGLGlassRenderer } from "@open-glass-ui/renderers/webgl";
import {
  type CanvasHTMLAttributes,
  forwardRef,
  type RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useGlassRuntime } from "./provider";

export type WebGLSource =
  | HTMLCanvasElement
  | HTMLImageElement
  | HTMLVideoElement
  | ImageBitmap
  | ImageData
  | OffscreenCanvas;

export type WebGLSurfaceStatus = WebGLRendererStatus | "idle" | "unavailable" | "error";

/**
 * Why a hydrated surface reports `unavailable`: the browser has no WebGL2, or
 * the user asked for forced colors or reduced transparency, where a refracting
 * canvas is the wrong rendering.
 */
export type WebGLSurfaceUnavailableReason =
  | "webgl2-unavailable"
  | "forced-colors"
  | "reduced-transparency";

export interface WebGLGlassSurfaceProps
  extends Omit<CanvasHTMLAttributes<HTMLCanvasElement>, "children"> {
  sourceRef: RefObject<WebGLSource | null>;
  /** Lens rectangles in CSS pixels. A changed lens set redraws once, even when not continuous. */
  lenses: readonly WebGLLens[];
  continuous?: boolean;
  renderKey?: string | number;
  maxDevicePixelRatio?: number;
  /** Status changes; while `unavailable` after hydration, the second argument says why. */
  onStatusChange?: (status: WebGLSurfaceStatus, reason?: WebGLSurfaceUnavailableReason) => void;
  onRendererError?: (error: Error) => void;
}

function unavailableReason(
  capabilities: Pick<RendererCapabilities, "webgl2" | "forcedColors" | "reducedTransparency">,
): WebGLSurfaceUnavailableReason | null {
  if (!capabilities.webgl2) {
    return "webgl2-unavailable";
  }
  if (capabilities.forcedColors) {
    return "forced-colors";
  }
  if (capabilities.reducedTransparency) {
    return "reduced-transparency";
  }
  return null;
}

function isRendering(status: WebGLSurfaceStatus) {
  return status === "ready" || status === "restored";
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function scaleWebGLLenses(
  lenses: readonly WebGLLens[],
  devicePixelRatio: number,
): WebGLLens[] {
  const scale = clamp(Number.isFinite(devicePixelRatio) ? Math.abs(devicePixelRatio) : 1, 1, 3);

  return lenses.map((lens) => ({
    ...lens,
    x: lens.x * scale,
    y: lens.y * scale,
    width: lens.width * scale,
    height: lens.height * scale,
  }));
}

function canRenderSource(source: WebGLSource): boolean {
  if (typeof HTMLVideoElement !== "undefined" && source instanceof HTMLVideoElement) {
    return source.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
  }

  if (typeof HTMLImageElement !== "undefined" && source instanceof HTMLImageElement) {
    return source.complete && source.naturalWidth > 0;
  }

  if (typeof HTMLCanvasElement !== "undefined" && source instanceof HTMLCanvasElement) {
    return source.width > 0 && source.height > 0;
  }

  return true;
}

function isVideoSource(source: WebGLSource): source is HTMLVideoElement {
  return typeof HTMLVideoElement !== "undefined" && source instanceof HTMLVideoElement;
}

export const WebGLGlassSurface = forwardRef<HTMLCanvasElement, WebGLGlassSurfaceProps>(
  function WebGLGlassSurface(
    {
      sourceRef,
      lenses,
      continuous = false,
      renderKey,
      maxDevicePixelRatio = 2,
      onStatusChange,
      onRendererError,
      className,
      style,
      ...rest
    },
    forwardedRef,
  ) {
    const runtime = useGlassRuntime();
    const { webgl2, forcedColors, reducedTransparency } = runtime.capabilities;
    const gateReason = unavailableReason({ webgl2, forcedColors, reducedTransparency });
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const lensesRef = useRef(lenses);
    const drawRef = useRef<() => void>(() => undefined);
    const scheduleRef = useRef<() => void>(() => undefined);
    const followSourceRef = useRef<() => void>(() => undefined);
    const callbacksRef = useRef({ onStatusChange, onRendererError });
    const statusRef = useRef<WebGLSurfaceStatus>("idle");
    const gatedRef = useRef(gateReason !== null);
    // The lens set last painted, so a changed one can request exactly one draw.
    const lensSignature = JSON.stringify(lenses);
    const lensSignatureRef = useRef(lensSignature);
    const drawnSignatureRef = useRef<string | null>(null);
    const [status, setStatus] = useState<WebGLSurfaceStatus>("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    lensesRef.current = lenses;
    lensSignatureRef.current = lensSignature;
    gatedRef.current = gateReason !== null;
    callbacksRef.current = { onStatusChange, onRendererError };
    useImperativeHandle(forwardedRef, () => canvasRef.current as HTMLCanvasElement, []);

    useEffect(() => {
      const canvas = canvasRef.current;
      const reason = unavailableReason({ webgl2, forcedColors, reducedTransparency });

      if (!canvas || reason) {
        const nextStatus = runtime.hydrated ? "unavailable" : "idle";
        statusRef.current = nextStatus;
        setStatus(nextStatus);
        if (nextStatus === "unavailable" && reason) {
          callbacksRef.current.onStatusChange?.(nextStatus, reason);
        } else {
          callbacksRef.current.onStatusChange?.(nextStatus);
        }
        return;
      }

      let renderer: WebGLGlassRenderer;
      let animationFrame = 0;
      let videoFrame = 0;
      let videoFrameSource: HTMLVideoElement | null = null;
      let stopped = false;
      let dpr = 1;

      const reportStatus = (nextStatus: WebGLSurfaceStatus) => {
        statusRef.current = nextStatus;
        setStatus(nextStatus);
        callbacksRef.current.onStatusChange?.(nextStatus);
      };

      try {
        renderer = new WebGLGlassRenderer(canvas, { onStatusChange: reportStatus });
      } catch (cause) {
        const error = cause instanceof Error ? cause : new Error(String(cause));
        setErrorMessage(error.message);
        reportStatus("error");
        callbacksRef.current.onRendererError?.(error);
        return;
      }

      const resize = () => {
        const rectangle = canvas.getBoundingClientRect();
        const dprLimit = clamp(maxDevicePixelRatio, 1, 3);
        dpr = clamp(window.devicePixelRatio || 1, 1, dprLimit);
        renderer.resize(rectangle.width, rectangle.height, dpr);
      };

      // Readiness listeners follow whatever element the ref holds now, so a
      // swapped <img> or <video> still triggers its first paint.
      let boundSource: WebGLSource | null = null;
      const handleSourceReady = () => draw();
      const syncSource = () => {
        const next = sourceRef.current;
        if (next === boundSource) {
          return false;
        }
        if (boundSource && "removeEventListener" in boundSource) {
          boundSource.removeEventListener("load", handleSourceReady);
          boundSource.removeEventListener("loadeddata", handleSourceReady);
        }
        boundSource = next;
        if (next && "addEventListener" in next) {
          next.addEventListener("load", handleSourceReady);
          next.addEventListener("loadeddata", handleSourceReady);
        }
        return true;
      };

      const draw = () => {
        if (!stopped) {
          syncSource();
        }
        const source = sourceRef.current;

        if (
          stopped ||
          document.visibilityState === "hidden" ||
          !source ||
          !canRenderSource(source)
        ) {
          return;
        }

        try {
          renderer.render(source, scaleWebGLLenses(lensesRef.current, dpr));
          drawnSignatureRef.current = lensSignatureRef.current;
        } catch (cause) {
          const error = cause instanceof Error ? cause : new Error(String(cause));
          setErrorMessage(error.message);
          reportStatus("error");
          callbacksRef.current.onRendererError?.(error);
        }
      };
      drawRef.current = draw;

      const motionEnabled = runtime.motion !== "off";
      // The source the frame loop was last armed for, tracked apart from the
      // readiness listeners: any draw() (the lens effect runs first) may
      // already have moved those to a new element, and that must not hide the
      // switch from the loop, which would keep waiting on the old video.
      let scheduledSource: WebGLSource | null = null;
      const cancelPending = () => {
        cancelAnimationFrame(animationFrame);
        if (videoFrameSource && typeof videoFrameSource.cancelVideoFrameCallback === "function") {
          videoFrameSource.cancelVideoFrameCallback(videoFrame);
        }
        videoFrameSource = null;
      };
      // Hot per-frame path: registration only. Cancellation lives in rearm()
      // so the steady-state loop stays as cheap as a bare rVFC/rAF chain.
      const schedule = () => {
        if (stopped) {
          return;
        }

        const source = sourceRef.current;
        scheduledSource = source;
        if (
          source &&
          isVideoSource(source) &&
          typeof source.requestVideoFrameCallback === "function"
        ) {
          videoFrameSource = source;
          videoFrame = source.requestVideoFrameCallback(() => {
            draw();
            schedule();
          });
          return;
        }

        if (continuous && motionEnabled) {
          animationFrame = requestAnimationFrame(() => {
            draw();
            schedule();
          });
        }
      };
      // Re-arming out of band (a source appeared or was swapped via renderKey)
      // must not stack callbacks: drop anything pending, then schedule.
      scheduleRef.current = () => {
        cancelPending();
        schedule();
      };

      // Catches up with whatever element the ref holds now: a source the
      // listeners have not seen yet paints once, and a source the frame loop
      // is not armed for re-arms it, which also drops the old video's pending
      // callback.
      followSourceRef.current = () => {
        const listenersMoved = syncSource();
        if (listenersMoved) {
          draw();
        }
        if (listenersMoved || scheduledSource !== sourceRef.current) {
          cancelPending();
          schedule();
        }
      };

      resize();
      draw();
      schedule();

      const handleVisibility = () => {
        if (document.visibilityState === "visible") {
          draw();
        }
      };
      document.addEventListener("visibilitychange", handleVisibility);

      const resizeObserver =
        typeof ResizeObserver === "undefined"
          ? null
          : new ResizeObserver(() => {
              resize();
              draw();
            });
      resizeObserver?.observe(canvas);
      window.addEventListener("resize", resize);

      return () => {
        stopped = true;
        drawRef.current = () => undefined;
        scheduleRef.current = () => undefined;
        followSourceRef.current = () => undefined;
        drawnSignatureRef.current = null;
        cancelPending();
        if (boundSource && "removeEventListener" in boundSource) {
          boundSource.removeEventListener("load", handleSourceReady);
          boundSource.removeEventListener("loadeddata", handleSourceReady);
        }
        boundSource = null;
        resizeObserver?.disconnect();
        window.removeEventListener("resize", resize);
        document.removeEventListener("visibilitychange", handleVisibility);
        // Forced colors or reduced transparency arrived: leave no refracted
        // frame behind on the canvas.
        if (gatedRef.current) {
          renderer.clear();
        }
        renderer.dispose();
      };
    }, [
      continuous,
      forcedColors,
      maxDevicePixelRatio,
      reducedTransparency,
      runtime.hydrated,
      runtime.motion,
      sourceRef,
      webgl2,
    ]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || status === "idle") {
        return;
      }
      canvas.dataset.oguiRenderKey = String(renderKey ?? "");
      drawRef.current();
      // A renderKey bump is the documented signal that the source changed;
      // re-arm the frame loop so a late or swapped video source starts playing
      // through the glass instead of freezing on one painted frame.
      scheduleRef.current();
    }, [renderKey, status]);

    // A new lens set paints once even when nothing else would draw: a static
    // image, a paused video, or motion turned off.
    useEffect(() => {
      if (isRendering(statusRef.current) && drawnSignatureRef.current !== lensSignature) {
        drawRef.current();
      }
    }, [lensSignature]);

    // The ref may now point at another element without a renderKey bump.
    useEffect(() => {
      followSourceRef.current();
    });

    const unavailable = status === "unavailable";

    return (
      <canvas
        {...rest}
        ref={canvasRef}
        aria-hidden={rest["aria-label"] ? undefined : true}
        className={className}
        style={unavailable ? { visibility: "hidden", ...style } : style}
        data-ogui-webgl-surface=""
        data-ogui-webgl-status={status}
        data-ogui-webgl-reason={unavailable ? (gateReason ?? undefined) : undefined}
        data-ogui-webgl-error={errorMessage ?? undefined}
      />
    );
  },
);
