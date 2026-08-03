import type { GlassMaterial } from "@open-glass-ui/core";

export const MAX_WEBGL_LENSES = 6;

export interface WebGLLens {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  material: GlassMaterial;
}

export type WebGLRendererStatus = "ready" | "lost" | "restored" | "disposed";

export interface WebGLGlassRendererOptions {
  onStatusChange?: (status: WebGLRendererStatus) => void;
}

export interface PackedLensUniforms {
  count: number;
  rectangles: Float32Array;
  optics: Float32Array;
  surface: Float32Array;
}

const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
out vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

#define MAX_LENSES 6

uniform sampler2D u_source;
uniform vec2 u_resolution;
uniform int u_lensCount;
uniform vec4 u_lensRects[MAX_LENSES];
uniform vec4 u_optics[MAX_LENSES];
uniform vec2 u_surface[MAX_LENSES];

in vec2 v_uv;
out vec4 outColor;

float sdRoundRect(vec2 point, vec2 halfSize, float radius) {
  vec2 q = abs(point) - halfSize + radius;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - radius;
}

vec2 distanceGradient(vec2 point, vec2 halfSize, float radius) {
  const float stepSize = 0.75;
  float left = sdRoundRect(point - vec2(stepSize, 0.0), halfSize, radius);
  float right = sdRoundRect(point + vec2(stepSize, 0.0), halfSize, radius);
  float top = sdRoundRect(point - vec2(0.0, stepSize), halfSize, radius);
  float bottom = sdRoundRect(point + vec2(0.0, stepSize), halfSize, radius);
  vec2 gradient = vec2(right - left, bottom - top);
  float magnitude = max(length(gradient), 0.0001);
  return gradient / magnitude;
}

vec4 sourceSample(vec2 uv, float frost) {
  vec2 pixel = 1.0 / u_resolution;
  vec4 center = texture(u_source, clamp(uv, 0.0, 1.0));

  if (frost < 0.01) {
    return center;
  }

  float radius = mix(0.0, 2.4, frost);
  vec4 taps =
    texture(u_source, clamp(uv + vec2(pixel.x * radius, 0.0), 0.0, 1.0)) +
    texture(u_source, clamp(uv - vec2(pixel.x * radius, 0.0), 0.0, 1.0)) +
    texture(u_source, clamp(uv + vec2(0.0, pixel.y * radius), 0.0, 1.0)) +
    texture(u_source, clamp(uv - vec2(0.0, pixel.y * radius), 0.0, 1.0));

  return mix(center, (center * 2.0 + taps) / 6.0, frost);
}

void main() {
  vec4 color = sourceSample(v_uv, 0.0);
  vec2 pixelPosition = vec2(v_uv.x * u_resolution.x, (1.0 - v_uv.y) * u_resolution.y);

  for (int index = 0; index < MAX_LENSES; index += 1) {
    if (index >= u_lensCount) {
      break;
    }

    vec4 rectangle = u_lensRects[index];
    vec4 optics = u_optics[index];
    vec2 surface = u_surface[index];
    vec2 local = pixelPosition - rectangle.xy;
    vec2 halfSize = max(rectangle.zw, vec2(1.0));
    float minimumHalfSize = max(min(halfSize.x, halfSize.y), 1.0);
    float radius = clamp(optics.w, 0.02, 1.0) * minimumHalfSize;
    float distance = sdRoundRect(local, halfSize, radius);

    if (distance > 2.0) {
      continue;
    }

    float mask = 1.0 - smoothstep(-1.5, 1.5, distance);
    float depth = clamp(-distance / minimumHalfSize, 0.0, 1.0);
    float edgeProfile = pow(1.0 - depth, 1.35);
    vec2 gradient = distanceGradient(local, halfSize, radius);
    float thickness = optics.x;
    float ior = max(optics.y, 1.0);
    float dispersion = optics.z;
    float refractivePower = ((ior - 1.0) / ior) * thickness;
    vec2 displacementPixels = gradient * edgeProfile * refractivePower * minimumHalfSize * 0.48;
    vec2 displacementUv = vec2(
      displacementPixels.x / u_resolution.x,
      -displacementPixels.y / u_resolution.y
    );
    float spectralSpread = dispersion * 7.5;
    float red = sourceSample(v_uv + displacementUv * (1.0 + spectralSpread), surface.y).r;
    float green = sourceSample(v_uv + displacementUv, surface.y).g;
    float blue = sourceSample(v_uv + displacementUv * (1.0 - spectralSpread), surface.y).b;
    float alpha = sourceSample(v_uv + displacementUv, surface.y).a;
    vec4 refracted = vec4(red, green, blue, alpha);
    float edgeBand = exp(-abs(distance) / 2.8);
    float fresnel = pow(clamp(edgeProfile, 0.0, 1.0), 4.0);
    float highlight = clamp((edgeBand * 0.34 + fresnel * 0.16) * surface.x, 0.0, 0.48);
    refracted.rgb += highlight;
    refracted.rgb = mix(refracted.rgb, vec3(dot(refracted.rgb, vec3(0.2126, 0.7152, 0.0722))), surface.y * 0.08);
    color = mix(color, refracted, mask);
  }

  outColor = color;
}`;

function finite(value: number, fallback: number) {
  return Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function packLensUniforms(lenses: readonly WebGLLens[]): PackedLensUniforms {
  const count = Math.min(lenses.length, MAX_WEBGL_LENSES);
  const rectangles = new Float32Array(MAX_WEBGL_LENSES * 4);
  const optics = new Float32Array(MAX_WEBGL_LENSES * 4);
  const surface = new Float32Array(MAX_WEBGL_LENSES * 2);

  for (let index = 0; index < count; index += 1) {
    const lens = lenses[index];

    if (!lens) {
      continue;
    }

    const rectangleOffset = index * 4;
    const surfaceOffset = index * 2;
    rectangles[rectangleOffset] = finite(lens.x, 0);
    rectangles[rectangleOffset + 1] = finite(lens.y, 0);
    rectangles[rectangleOffset + 2] = Math.max(Math.abs(finite(lens.width, 2)) / 2, 1);
    rectangles[rectangleOffset + 3] = Math.max(Math.abs(finite(lens.height, 2)) / 2, 1);
    optics[rectangleOffset] = clamp(finite(lens.material.thickness, 0.62), 0, 1.5);
    optics[rectangleOffset + 1] = clamp(finite(lens.material.ior, 1.46), 1, 2.5);
    optics[rectangleOffset + 2] = clamp(finite(lens.material.dispersion, 0.012), 0, 0.08);
    optics[rectangleOffset + 3] = clamp(finite(lens.radius, 0.25), 0.02, 1);
    surface[surfaceOffset] = clamp(finite(lens.material.edgeStrength, 0.46), 0, 1);
    surface[surfaceOffset + 1] = clamp(finite(lens.material.frost, 0.24), 0, 1);
  }

  return { count, rectangles, optics, surface };
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);

  if (!shader) {
    throw new Error("Unable to allocate a WebGL shader.");
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || "Unknown shader compilation error.";
    gl.deleteShader(shader);
    throw new Error(message);
  }

  return shader;
}

function createProgram(gl: WebGL2RenderingContext) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const program = gl.createProgram();

  if (!program) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    throw new Error("Unable to allocate a WebGL program.");
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) || "Unknown WebGL link error.";
    gl.deleteProgram(program);
    throw new Error(message);
  }

  return program;
}

function requiredUniform(gl: WebGL2RenderingContext, program: WebGLProgram, name: string) {
  const location = gl.getUniformLocation(program, name);

  if (!location) {
    throw new Error(`Missing WebGL uniform: ${name}`);
  }

  return location;
}

export class WebGLGlassRenderer {
  readonly #canvas: HTMLCanvasElement;
  readonly #gl: WebGL2RenderingContext;
  readonly #onStatusChange: ((status: WebGLRendererStatus) => void) | undefined;
  #program: WebGLProgram | null = null;
  #vertexArray: WebGLVertexArrayObject | null = null;
  #positionBuffer: WebGLBuffer | null = null;
  #sourceTexture: WebGLTexture | null = null;
  #uniforms: Record<string, WebGLUniformLocation> = {};
  #lost = false;
  #disposed = false;

  constructor(canvas: HTMLCanvasElement, options: WebGLGlassRendererOptions = {}) {
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      depth: false,
      desynchronized: true,
      failIfMajorPerformanceCaveat: false,
      powerPreference: "high-performance",
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      stencil: false,
    });

    if (!gl) {
      throw new Error("WebGL2 is unavailable for this canvas.");
    }

    this.#canvas = canvas;
    this.#gl = gl;
    this.#onStatusChange = options.onStatusChange;
    this.#canvas.addEventListener("webglcontextlost", this.#handleContextLost);
    this.#canvas.addEventListener("webglcontextrestored", this.#handleContextRestored);
    this.#createResources();
    this.#onStatusChange?.("ready");
  }

  get status(): WebGLRendererStatus {
    if (this.#disposed) {
      return "disposed";
    }
    return this.#lost ? "lost" : "ready";
  }

  resize(cssWidth: number, cssHeight: number, devicePixelRatio = 1) {
    this.#assertUsable();
    const width = Math.max(
      Math.round(Math.abs(finite(cssWidth, 1)) * clamp(devicePixelRatio, 1, 3)),
      1,
    );
    const height = Math.max(
      Math.round(Math.abs(finite(cssHeight, 1)) * clamp(devicePixelRatio, 1, 3)),
      1,
    );

    if (this.#canvas.width !== width || this.#canvas.height !== height) {
      this.#canvas.width = width;
      this.#canvas.height = height;
    }
  }

  render(source: TexImageSource, lenses: readonly WebGLLens[]) {
    this.#assertUsable();

    if (this.#lost || !this.#program || !this.#vertexArray || !this.#sourceTexture) {
      return;
    }

    const gl = this.#gl;
    const packed = packLensUniforms(lenses);
    gl.viewport(0, 0, this.#canvas.width, this.#canvas.height);
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.useProgram(this.#program);
    gl.bindVertexArray(this.#vertexArray);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.#sourceTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.uniform1i(this.#uniforms.source ?? null, 0);
    gl.uniform2f(this.#uniforms.resolution ?? null, this.#canvas.width, this.#canvas.height);
    gl.uniform1i(this.#uniforms.lensCount ?? null, packed.count);
    gl.uniform4fv(this.#uniforms.lensRects ?? null, packed.rectangles);
    gl.uniform4fv(this.#uniforms.optics ?? null, packed.optics);
    gl.uniform2fv(this.#uniforms.surface ?? null, packed.surface);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindVertexArray(null);
  }

  dispose() {
    if (this.#disposed) {
      return;
    }

    this.#canvas.removeEventListener("webglcontextlost", this.#handleContextLost);
    this.#canvas.removeEventListener("webglcontextrestored", this.#handleContextRestored);
    this.#releaseResources();
    // Do NOT force-lose the context here: the canvas belongs to the caller,
    // and a canvas keeps one context for its lifetime. Losing it would leave
    // any remount on the same canvas (React StrictMode, route revisits) with
    // a permanently dead context. GPU resources are freed above; the context
    // itself is reclaimed with the canvas.
    this.#disposed = true;
    this.#onStatusChange?.("disposed");
  }

  #assertUsable() {
    if (this.#disposed) {
      throw new Error("The WebGL glass renderer has been disposed.");
    }
  }

  #createResources() {
    const gl = this.#gl;
    const program = createProgram(gl);
    const vertexArray = gl.createVertexArray();
    const positionBuffer = gl.createBuffer();
    const sourceTexture = gl.createTexture();

    if (!vertexArray || !positionBuffer || !sourceTexture) {
      gl.deleteProgram(program);
      throw new Error("Unable to allocate WebGL glass resources.");
    }

    gl.bindVertexArray(vertexArray);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "a_position");

    if (position < 0) {
      throw new Error("Missing WebGL position attribute.");
    }

    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.bindTexture(gl.TEXTURE_2D, sourceTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindVertexArray(null);

    this.#program = program;
    this.#vertexArray = vertexArray;
    this.#positionBuffer = positionBuffer;
    this.#sourceTexture = sourceTexture;
    this.#uniforms = {
      source: requiredUniform(gl, program, "u_source"),
      resolution: requiredUniform(gl, program, "u_resolution"),
      lensCount: requiredUniform(gl, program, "u_lensCount"),
      lensRects: requiredUniform(gl, program, "u_lensRects[0]"),
      optics: requiredUniform(gl, program, "u_optics[0]"),
      surface: requiredUniform(gl, program, "u_surface[0]"),
    };
  }

  #releaseResources() {
    if (this.#gl.isContextLost()) {
      this.#program = null;
      this.#vertexArray = null;
      this.#positionBuffer = null;
      this.#sourceTexture = null;
      this.#uniforms = {};
      return;
    }

    this.#gl.deleteTexture(this.#sourceTexture);
    this.#gl.deleteBuffer(this.#positionBuffer);
    this.#gl.deleteVertexArray(this.#vertexArray);
    this.#gl.deleteProgram(this.#program);
    this.#program = null;
    this.#vertexArray = null;
    this.#positionBuffer = null;
    this.#sourceTexture = null;
    this.#uniforms = {};
  }

  #handleContextLost = (event: Event) => {
    event.preventDefault();
    this.#lost = true;
    this.#onStatusChange?.("lost");
  };

  #handleContextRestored = () => {
    if (this.#disposed) {
      return;
    }

    try {
      this.#createResources();
    } catch {
      // Shader or resource allocation can fail on a restored context; report
      // the surface as still lost instead of throwing inside a DOM listener.
      this.#onStatusChange?.("lost");
      return;
    }
    this.#lost = false;
    this.#onStatusChange?.("restored");
  };
}
