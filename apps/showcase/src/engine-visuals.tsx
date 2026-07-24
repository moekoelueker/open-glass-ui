import { getMaterialPreset, type MaterialPresetName } from "@prism-lab/core";
import {
  OrganicFilterDefinition,
  SdfFilterDefinition,
  useGlassRuntime,
  useSdfFilter,
  WebGLGlassSurface,
  type WebGLSource,
} from "@prism-lab/react";
import {
  type CSSProperties,
  forwardRef,
  type ReactNode,
  type RefObject,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type { EngineId, EnvironmentId } from "./data";

interface ProceduralCanvasProps {
  className?: string;
  animate?: boolean;
}

export const ProceduralMotionCanvas = forwardRef<HTMLCanvasElement, ProceduralCanvasProps>(
  function ProceduralMotionCanvas({ className, animate = true }, forwardedRef) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useImperativeHandle(forwardedRef, () => canvasRef.current as HTMLCanvasElement, []);

    useEffect(() => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d", { alpha: false });
      if (!canvas || !context) {
        return;
      }

      let frame = 0;
      let stopped = false;
      let width = 1;
      let height = 1;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const resize = () => {
        const rectangle = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = Math.max(Math.round(rectangle.width), 1);
        height = Math.max(Math.round(rectangle.height), 1);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
      };

      const draw = (time: number) => {
        const phase = animate && !reduceMotion ? time * 0.00012 : 0.4;
        const background = context.createLinearGradient(0, 0, width, height);
        background.addColorStop(0, "#16191b");
        background.addColorStop(0.48, "#343027");
        background.addColorStop(1, "#090b0c");
        context.fillStyle = background;
        context.fillRect(0, 0, width, height);

        const orbs = [
          {
            x: width * (0.28 + Math.sin(phase) * 0.12),
            y: height * (0.28 + Math.cos(phase * 1.3) * 0.11),
            radius: Math.max(width, height) * 0.36,
            color: "rgba(239, 87, 52, 0.7)",
          },
          {
            x: width * (0.72 + Math.cos(phase * 0.8) * 0.13),
            y: height * (0.57 + Math.sin(phase * 1.1) * 0.14),
            radius: Math.max(width, height) * 0.42,
            color: "rgba(218, 177, 78, 0.46)",
          },
          {
            x: width * (0.5 + Math.sin(phase * 0.6) * 0.22),
            y: height * (0.9 + Math.cos(phase) * 0.08),
            radius: Math.max(width, height) * 0.44,
            color: "rgba(47, 85, 84, 0.58)",
          },
        ];

        for (const orb of orbs) {
          const gradient = context.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
          gradient.addColorStop(0, orb.color);
          gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
          context.fillStyle = gradient;
          context.fillRect(0, 0, width, height);
        }

        context.strokeStyle = "rgba(255, 255, 255, 0.075)";
        context.lineWidth = 1;
        const grid = 48;
        for (let x = -(time * 0.008) % grid; x < width + grid; x += grid) {
          context.beginPath();
          context.moveTo(x, 0);
          context.lineTo(x, height);
          context.stroke();
        }
        for (let y = 0; y < height; y += grid) {
          context.beginPath();
          context.moveTo(0, y);
          context.lineTo(width, y);
          context.stroke();
        }

        if (!stopped && animate && !reduceMotion) {
          frame = requestAnimationFrame(draw);
        }
      };

      resize();
      draw(0);
      const observer = new ResizeObserver(() => {
        resize();
        draw(0);
      });
      observer.observe(canvas);

      return () => {
        stopped = true;
        cancelAnimationFrame(frame);
        observer.disconnect();
      };
    }, [animate]);

    return (
      <canvas
        ref={canvasRef}
        className={className}
        role="img"
        aria-label="Animated abstract color field"
      />
    );
  },
);

export function EnvironmentBackdrop({
  environment,
  children,
  className,
}: {
  environment: EnvironmentId;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`environment environment--${environment} ${className ?? ""}`}>
      {environment === "motion" ? <ProceduralMotionCanvas className="environment__canvas" /> : null}
      <span className="environment__geometry" aria-hidden="true" />
      {children}
    </div>
  );
}

function SdfDefinitions({
  intensity,
  dispersion,
  material,
  children,
}: {
  intensity: number;
  dispersion: boolean;
  material: MaterialPresetName;
  children: (filterId: string | undefined, ready: boolean) => ReactNode;
}) {
  const runtime = useGlassRuntime();
  const preset = getMaterialPreset(material);
  const optics = useMemo(
    () => ({
      ...preset,
      thickness: Math.min(1.4, preset.thickness * (0.65 + intensity * 0.7)),
      dispersion: dispersion ? preset.dispersion : 0,
      edgeStrength: Math.min(1, preset.edgeStrength * (0.7 + intensity * 0.55)),
    }),
    [dispersion, intensity, preset],
  );
  const filter = useSdfFilter({
    id: "showcase-sdf",
    width: 480,
    height: 272,
    geometry: {
      kind: "superellipse",
      width: 440,
      height: 232,
      cornerRadius: 52,
      exponent: 4.4,
    },
    material: optics,
    quality: runtime.quality,
  });

  return (
    <>
      <SdfFilterDefinition filter={filter} />
      {children(filter.ready ? filter.filterId : undefined, filter.ready)}
    </>
  );
}

export function EngineDefinitions({
  engine,
  intensity,
  dispersion,
  material,
  motion,
  children,
}: {
  engine: EngineId;
  intensity: number;
  dispersion: boolean;
  material: MaterialPresetName;
  motion: boolean;
  children: (filterId: string | undefined, ready: boolean) => ReactNode;
}) {
  const runtime = useGlassRuntime();
  const effectiveMotion = motion && runtime.motion === "on";

  if (engine === "organic") {
    const filterId = "showcase-organic";
    return (
      <>
        <OrganicFilterDefinition
          id={filterId}
          frequency={0.008 + intensity * 0.009}
          turbulence={3}
          scale={10 + intensity * 24}
          animate={effectiveMotion}
        />
        {children(filterId, true)}
      </>
    );
  }

  if (engine === "sdf" || engine === "hybrid") {
    return (
      <SdfDefinitions intensity={intensity} dispersion={dispersion} material={material}>
        {children}
      </SdfDefinitions>
    );
  }

  return children(undefined, true);
}

function useObservedSize(ref: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ width: 960, height: 560 });

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const update = () => {
      const rectangle = element.getBoundingClientRect();
      setSize({ width: rectangle.width, height: rectangle.height });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}

export function WebGLBackdrop({
  intensity,
  dispersion,
  material,
  motion,
}: {
  intensity: number;
  dispersion: boolean;
  material: MaterialPresetName;
  motion: boolean;
}) {
  const runtime = useGlassRuntime();
  const effectiveMotion = motion && runtime.motion === "on";
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<WebGLSource | null>(null);
  const size = useObservedSize(wrapperRef);
  const optics = getMaterialPreset(material);
  const lenses = useMemo(
    () => [
      {
        x: size.width * 0.66,
        y: size.height * 0.35,
        width: size.width * 0.5,
        height: Math.min(size.height * 0.38, 220),
        radius: 0.28,
        material: {
          ...optics,
          thickness: optics.thickness * (0.68 + intensity * 0.75),
          dispersion: dispersion ? optics.dispersion : 0,
        },
      },
      {
        x: size.width * 0.25,
        y: size.height * 0.78,
        width: Math.min(size.width * 0.28, 300),
        height: 72,
        radius: 0.5,
        material: {
          ...optics,
          thickness: optics.thickness * 0.82,
          dispersion: dispersion ? optics.dispersion * 0.7 : 0,
        },
      },
    ],
    [dispersion, intensity, optics, size.height, size.width],
  );

  return (
    <div ref={wrapperRef} className="webgl-backdrop" aria-hidden="true">
      <ProceduralMotionCanvas
        ref={sourceRef as RefObject<HTMLCanvasElement>}
        className="webgl-backdrop__source"
        animate={effectiveMotion}
      />
      <WebGLGlassSurface
        sourceRef={sourceRef}
        lenses={lenses}
        continuous={effectiveMotion}
        maxDevicePixelRatio={2}
        className="webgl-backdrop__output"
      />
    </div>
  );
}

export function engineStyle(
  filterId: string | undefined,
  intensity: number,
  accent: string,
): CSSProperties {
  return {
    "--engine-filter": filterId ? `url(#${filterId})` : "none",
    "--engine-intensity": intensity,
    "--experiment-accent": accent,
  } as CSSProperties;
}
