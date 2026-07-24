export type {
  CapabilityProbe,
  ConcreteRenderer,
  RendererCapabilities,
  RendererDecision,
  RendererPreference,
  RendererRequest,
  RendererSource,
} from "./capabilities";
export { detectRendererCapabilities, selectRenderer } from "./capabilities";
export type {
  Canvas2DLike,
  CanvasFactory,
  SvgDisplacementFilterSpec,
} from "./svg";
export {
  createStableFilterId,
  createSvgDisplacementFilterSpec,
  encodeDisplacementMap,
} from "./svg";
