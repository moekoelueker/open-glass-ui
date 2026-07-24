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

interface MotionVideoProps {
  className?: string;
  animate?: boolean;
}

const MotionVideo = forwardRef<HTMLVideoElement, MotionVideoProps>(function MotionVideo(
  { className, animate = true },
  forwardedRef,
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useImperativeHandle(forwardedRef, () => videoRef.current as HTMLVideoElement, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (animate) {
      void video.play().catch(() => {
        // Muted autoplay is broadly supported. A blocked play promise simply
        // leaves a valid first frame for the static/reduced-motion experience.
      });
    } else {
      video.pause();
      video.currentTime = 0;
    }

    return () => video.pause();
  }, [animate]);

  return (
    <video
      ref={videoRef}
      className={className}
      src="/assets/motion-source.mp4"
      poster="/assets/architectural-contrast.jpg"
      muted
      autoPlay={animate}
      loop
      playsInline
      preload="auto"
    />
  );
});

export function EnvironmentBackdrop({
  environment,
  children,
  className,
}: {
  environment: EnvironmentId;
  children?: ReactNode;
  className?: string;
}) {
  const runtime = useGlassRuntime();

  return (
    <div className={`environment environment--${environment} ${className ?? ""}`}>
      {environment === "motion" ? (
        <MotionVideo className="environment__video" animate={runtime.motion === "on"} />
      ) : null}
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
      <MotionVideo
        ref={sourceRef as RefObject<HTMLVideoElement>}
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
