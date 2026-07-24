import { createOpticsCacheKey, generateDisplacementMap } from "./displacement";
import { clamp, finite } from "./math";
import { applyQualityToMapInput, type OpticsQuality } from "./quality";
import type { DisplacementMap, DisplacementMapInput } from "./types";

interface CacheEntry {
  map: DisplacementMap;
  bytes: number;
}

export interface OpticsCacheStats {
  entries: number;
  bytes: number;
  maximumBytes: number;
  hits: number;
  misses: number;
}

export interface AsyncMapOptions {
  quality?: OpticsQuality;
  signal?: AbortSignal;
}

function abortError() {
  const error = new Error("Optics map generation was aborted.");
  error.name = "AbortError";
  return error;
}

export async function generateDisplacementMapAsync(
  input: DisplacementMapInput,
  options: AsyncMapOptions = {},
): Promise<DisplacementMap> {
  if (options.signal?.aborted) {
    throw abortError();
  }

  await new Promise<void>((resolve) => queueMicrotask(resolve));

  if (options.signal?.aborted) {
    throw abortError();
  }

  return generateDisplacementMap(applyQualityToMapInput(input, options.quality ?? "high"));
}

export class OpticsMapCache {
  readonly #entries = new Map<string, CacheEntry>();
  readonly #maximumBytes: number;
  #bytes = 0;
  #hits = 0;
  #misses = 0;

  constructor(maximumBytes = 8 * 1024 * 1024) {
    this.#maximumBytes = Math.round(
      clamp(finite(maximumBytes, 8 * 1024 * 1024), 1024, 64 * 1024 * 1024),
    );
  }

  getOrCreate(input: DisplacementMapInput, quality: OpticsQuality = "high") {
    const resolvedInput = applyQualityToMapInput(input, quality);
    const cacheKey = createOpticsCacheKey(resolvedInput);
    const cached = this.#entries.get(cacheKey);

    if (cached) {
      this.#hits += 1;
      this.#entries.delete(cacheKey);
      this.#entries.set(cacheKey, cached);
      return cached.map;
    }

    this.#misses += 1;
    const generated = generateDisplacementMap(resolvedInput);
    this.#store(generated);
    return generated;
  }

  clear() {
    this.#entries.clear();
    this.#bytes = 0;
  }

  stats(): OpticsCacheStats {
    return {
      entries: this.#entries.size,
      bytes: this.#bytes,
      maximumBytes: this.#maximumBytes,
      hits: this.#hits,
      misses: this.#misses,
    };
  }

  #store(map: DisplacementMap) {
    const bytes = map.data.byteLength;

    if (bytes > this.#maximumBytes) {
      return;
    }

    while (this.#bytes + bytes > this.#maximumBytes && this.#entries.size > 0) {
      const oldestKey = this.#entries.keys().next().value;

      if (typeof oldestKey !== "string") {
        break;
      }

      const oldest = this.#entries.get(oldestKey);
      this.#entries.delete(oldestKey);
      this.#bytes -= oldest?.bytes ?? 0;
    }

    this.#entries.set(map.cacheKey, { map, bytes });
    this.#bytes += bytes;
  }
}
