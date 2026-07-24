export const EPSILON = 1e-6;

export function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function finite(value: number, fallback: number) {
  return Number.isFinite(value) ? value : fallback;
}

export function positive(value: number, fallback: number) {
  return Math.max(Math.abs(finite(value, fallback)), EPSILON);
}

export function smoothstep(edge0: number, edge1: number, value: number) {
  const t = clamp((value - edge0) / Math.max(edge1 - edge0, EPSILON), 0, 1);
  return t * t * (3 - 2 * t);
}

export function normalize3(x: number, y: number, z: number) {
  const length = Math.max(Math.hypot(x, y, z), EPSILON);

  return {
    x: x / length,
    y: y / length,
    z: z / length,
  };
}
