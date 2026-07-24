import {
  applyQualityToMapInput,
  generateDisplacementMap,
  getMaterialPreset,
} from "../packages/core/dist/index.js";

const iterations = 30;
const shapes = [
  { kind: "circle", width: 240, height: 240 },
  { kind: "capsule", width: 320, height: 128 },
  { kind: "rounded-rect", width: 320, height: 208, cornerRadius: 52 },
  { kind: "superellipse", width: 300, height: 208, exponent: 4.5 },
];
const qualities = ["low", "medium", "high"];

function percentile(values, percentileValue) {
  const sorted = values.toSorted((a, b) => a - b);
  const index = Math.min(Math.floor(sorted.length * percentileValue), sorted.length - 1);
  return sorted[index];
}

const results = [];

for (const geometry of shapes) {
  for (const quality of qualities) {
    const input = applyQualityToMapInput(
      {
        width: geometry.width,
        height: geometry.height,
        geometry,
        material: getMaterialPreset("regular"),
      },
      quality,
    );
    const samples = [];
    let output;

    generateDisplacementMap(input);

    for (let index = 0; index < iterations; index += 1) {
      const start = performance.now();
      output = generateDisplacementMap(input);
      samples.push(performance.now() - start);
    }

    results.push({
      shape: geometry.kind,
      quality,
      resolution: `${output.width}x${output.height}`,
      bytes: output.data.byteLength,
      medianMs: Number(percentile(samples, 0.5).toFixed(3)),
      p95Ms: Number(percentile(samples, 0.95).toFixed(3)),
    });
  }
}

const environment = {
  node: process.version,
  platform: process.platform,
  architecture: process.arch,
  iterations,
  measuredAt: new Date().toISOString(),
};

console.log(JSON.stringify({ environment, results }, null, 2));
