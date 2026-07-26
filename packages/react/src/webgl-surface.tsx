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

export interface WebGLGlassSurfaceProps
  extends Omit<CanvasHTMLAttributes<HTMLCanvasElement>, "children"> {
  sourceRef: RefObject<WebGLSource | null>;
  lenses: readonly WebGLLens[];
  continuous?: boolean;
  renderKey?: string | number;
  maxDevicePixelRatio?: number;
  onStatusChange?: (status: WebGLSurfaceStatus) => void;
  onRendererError?: (error: Error) => void;
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
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const lensesRef = useRef(lenses);
    const drawRef = useRef<() => void>(() => undefined);
    const callbacksRef = useRef({ onStatusChange, onRendererError });
    const [status, setStatus] = useState<WebGLSurfaceStatus>("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    lensesRef.current = lenses;
    callbacksRef.current = { onStatusChange, onRendererError };
    useImperativeHandle(forwardedRef, () => canvasRef.current as HTMLCanvasElement, []);

    useEffect(() => {
      const canvas = canvasRef.current;

      if (!canvas || !runtime.capabilities.webgl2) {
        const nextStatus = runtime.hydrated ? "unavailable" : "idle";
        setStatus(nextStatus);
        callbacksRef.current.onStatusChange?.(nextStatus);
        return;
      }

      let renderer: WebGLGlassRenderer;
      let animationFrame = 0;
      let videoFrame = 0;
      let stopped = false;
      let dpr = 1;

      const reportStatus = (nextStatus: WebGLSurfaceStatus) => {
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

      const draw = () => {
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
        } catch (cause) {
          const error = cause instanceof Error ? cause : new Error(String(cause));
          setErrorMessage(error.message);
          reportStatus("error");
          callbacksRef.current.onRendererError?.(error);
        }
      };
      drawRef.current = draw;

      const schedule = () => {
        if (stopped) {
          return;
        }

        const source = sourceRef.current;
        if (
          source &&
          isVideoSource(source) &&
          typeof source.requestVideoFrameCallback === "function"
        ) {
          videoFrame = source.requestVideoFrameCallback(() => {
            draw();
            schedule();
          });
          return;
        }

        if (continuous) {
          animationFrame = requestAnimationFrame(() => {
            draw();
            schedule();
          });
        }
      };

      resize();
      draw();
      schedule();

      const source = sourceRef.current;
      const handleSourceReady = () => draw();
      if (source && "addEventListener" in source) {
        source.addEventListener("load", handleSourceReady);
        source.addEventListener("loadeddata", handleSourceReady);
      }

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
        cancelAnimationFrame(animationFrame);
        if (
          source &&
          isVideoSource(source) &&
          typeof source.cancelVideoFrameCallback === "function"
        ) {
          source.cancelVideoFrameCallback(videoFrame);
        }
        if (source && "removeEventListener" in source) {
          source.removeEventListener("load", handleSourceReady);
          source.removeEventListener("loadeddata", handleSourceReady);
        }
        resizeObserver?.disconnect();
        window.removeEventListener("resize", resize);
        document.removeEventListener("visibilitychange", handleVisibility);
        renderer.dispose();
      };
    }, [continuous, maxDevicePixelRatio, runtime.capabilities.webgl2, runtime.hydrated, sourceRef]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || status === "idle") {
        return;
      }
      canvas.dataset.oguiRenderKey = String(renderKey ?? "");
      drawRef.current();
    }, [renderKey, status]);

    return (
      <canvas
        {...rest}
        ref={canvasRef}
        aria-hidden={rest["aria-label"] ? undefined : true}
        className={className}
        style={style}
        data-ogui-webgl-surface=""
        data-ogui-webgl-status={status}
        data-ogui-webgl-error={errorMessage ?? undefined}
      />
    );
  },
);
