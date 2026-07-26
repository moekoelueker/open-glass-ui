import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const ENV_PATH = resolve(ROOT, ".env.local");
const LEDGER_PATH = resolve(ROOT, "docs/naming/naming-signal-ledger.json");
const API_ROOT = "https://namingsignal.com/api/v1";

function readLocalEnv(path) {
  if (!existsSync(path)) {
    return {};
  }

  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const separator = line.indexOf("=");
        const key = separator >= 0 ? line.slice(0, separator).trim() : line;
        const rawValue = separator >= 0 ? line.slice(separator + 1).trim() : "";
        const value = rawValue.replace(/^(['"])(.*)\1$/, "$2");
        return [key, value];
      }),
  );
}

const apiKey = process.env.NAMING_SIGNAL_API_KEY || readLocalEnv(ENV_PATH).NAMING_SIGNAL_API_KEY;

if (!apiKey) {
  throw new Error(
    "NAMING_SIGNAL_API_KEY is missing. Add it to .env.local; never paste the key into chat.",
  );
}

const PRODUCT_CONTEXT = `
We are naming an open-source, production-grade React design system for premium glass-like
web interfaces. It is CSS-first and progressively enhances selected surfaces with SVG/SDF
refraction; WebGL is explicitly opt-in and lazy-loaded for controlled media. The system
contains around forty accessible components, neutral light/dark tokens, adaptive rendering,
high-contrast color derivation, reduced-motion/transparency fallbacks, and extensive human
and AI-agent documentation.

Primary users are frontend developers, product designers, design engineers, and AI coding
agents. OpenGlass UI is the owner-selected identity. If this research is rerun, treat it as
a contingency-name and confusing-similarity exercise rather than an invitation to silently
rename the project. Backups may use search-relevant glass, refraction, open-source, design
system, or UI language when the result remains distinctive and does not imply Apple
affiliation.

Avoid Apple, iOS, exact Liquid Glass branding, close imitations of active design-system
brands, awkward spelling, and strongly occupied software names. Exact npm and GitHub
namespace clarity matters more than an unmodified .com at the prototype stage.
`.trim();

const SEARCH_LED_BRIEF = {
  product:
    "A free, open-source React and web-native Liquid Glass UI design system with about forty accessible components, CSS-first adaptive rendering, optional SVG refraction, opt-in WebGL media effects, neutral themes, and detailed documentation.",
  primaryUser:
    "Frontend developers, designers, design engineers, and AI coding agents searching for liquid glass UI, glass UI components, refraction UI, React glass components, and glass CSS.",
  pain: "Existing liquid-glass examples are isolated effects, inconsistent across browsers, difficult to theme, incomplete as component systems, or too expensive to run everywhere.",
  outcome:
    "Install one package and turn a React product into a polished, accessible, customizable glass interface with resilient fallbacks.",
  mechanism:
    "Native semantic DOM and CSS by default, automatic capability and accessibility policy, optional SVG/SDF refraction, and explicitly imported WebGL for controlled media.",
  platform: ["React", "web", "CSS", "Vite", "Next.js"],
  acquisitionChannels: [
    "npm search",
    "GitHub search",
    "Google search",
    "AI coding agents",
    "creator video",
  ],
  brandTone: [
    "premium",
    "technical",
    "open-source",
    "approachable",
    "visually precise",
    "searchable",
  ],
  futureExpansion:
    "May expand beyond React into framework adapters, copy-paste recipes, design tokens, and advanced rendering tools.",
  domainRequirements: [
    "A .com is optional.",
    "Exact npm clarity matters most.",
    "A descriptive GitHub repository slug is acceptable.",
  ],
  avoid: [
    "Apple or iOS affiliation",
    "a name identical to an active competing liquid-glass component library",
    "abstract invented words with no glass, refraction, fluid, optical, or UI signal",
    "claims of trademark clearance",
  ],
  uncertainties: [
    "Final founder preference is not selected.",
    "A qualified trademark search is still required before launch.",
  ],
};

function createLedger() {
  return {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sprintId: `glass-system-${randomUUID()}`,
    disclaimer:
      "Preliminary naming research only. Registry absence is not guaranteed availability, and this ledger is not trademark clearance or legal advice.",
    context: PRODUCT_CONTEXT,
    idempotency: {
      brief: `brief-${randomUUID()}`,
      generateOne: `generate-one-${randomUUID()}`,
      generateTwo: `generate-two-${randomUUID()}`,
      check: `check-${randomUUID()}`,
      curatedCheck: `curated-check-${randomUUID()}`,
      rank: `rank-${randomUUID()}`,
      research: `research-${randomUUID()}`,
    },
  };
}

const ledger = existsSync(LEDGER_PATH)
  ? JSON.parse(readFileSync(LEDGER_PATH, "utf8"))
  : createLedger();

function persist() {
  ledger.updatedAt = new Date().toISOString();
  mkdirSync(dirname(LEDGER_PATH), { recursive: true });
  writeFileSync(LEDGER_PATH, `${JSON.stringify(ledger, null, 2)}\n`);
}

async function request(path, body, idempotencyKey) {
  const response = await fetch(`${API_ROOT}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
      "X-Name-Ledger-Sprint": ledger.sprintId,
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json();
  if (!response.ok) {
    const code = payload?.code ? ` (${payload.code})` : "";
    throw new Error(`NamingSignal ${path} failed with ${response.status}${code}`);
  }
  return payload;
}

if (!ledger.briefResponse) {
  ledger.briefResponse = await request(
    "brief",
    { text: PRODUCT_CONTEXT, source: "OpenGlass UI release-candidate brief" },
    ledger.idempotency.brief,
  );
  persist();
}

const brief = ledger.briefResponse.brief;

if (!ledger.generationOne) {
  ledger.generationOne = await request(
    "generate",
    {
      brief,
      count: 50,
      tlds: ["com"],
      checkPrimaryDomain: true,
    },
    ledger.idempotency.generateOne,
  );
  persist();
}

const firstNames = ledger.generationOne.candidates.map((candidate) => candidate.name);

if (!ledger.generationTwo) {
  ledger.generationTwo = await request(
    "generate",
    {
      brief,
      count: 50,
      tlds: ["com"],
      checkPrimaryDomain: true,
      excludedNames: firstNames,
      iteration: {
        feedback:
          "Push further toward ownable, elegant coined words with a sense of light, material, depth, or transformation. Avoid generic glass terminology and do not repeat the first field.",
        likedNames: [],
        dislikedNames: [],
      },
    },
    ledger.idempotency.generateTwo,
  );
  persist();
}

const generatedCandidates = [
  ...ledger.generationOne.candidates,
  ...ledger.generationTwo.candidates,
];

function candidateScore(candidate) {
  return Number(candidate.score?.overall ?? 0);
}

function hasLikelyDomain(candidate) {
  return candidate.domains?.some((domain) => domain.status === "likely_available") ?? false;
}

const survivorPool = [...generatedCandidates].sort((left, right) => {
  const availabilityDelta = Number(hasLikelyDomain(right)) - Number(hasLikelyDomain(left));
  return availabilityDelta || candidateScore(right) - candidateScore(left);
});
const survivorNames = survivorPool.slice(0, 24).map((candidate) => candidate.name);

if (!ledger.checkResponse) {
  ledger.checkResponse = await request(
    "check",
    {
      names: survivorNames,
      tlds: ["com", "dev", "design"],
      includeNamespaces: true,
      context: {
        brief,
        category: "open-source React design system and rendering library",
        channels: ["npm", "GitHub", "documentation website", "launch video"],
        preferredTld: "com",
        competitorNames: [
          "Liquid Glass React",
          "Avenra",
          "AuraGlass",
          "Magic UI",
          "Aceternity",
          "Framer Motion",
        ],
        saturatedRoots: ["liquid", "glass", "crystal", "prism", "lens", "aqua"],
      },
    },
    ledger.idempotency.check,
  );
  persist();
}

const checkedCandidates = ledger.checkResponse.results;

if (!ledger.rankResponse) {
  ledger.rankResponse = await request(
    "rank",
    {
      brief,
      candidates: checkedCandidates.map((candidate) => ({
        name: candidate.name,
        rationale: candidate.rationale,
        score: candidate.score,
        domains: candidate.domains,
      })),
    },
    ledger.idempotency.rank,
  );
  persist();
}

const finalistNames = ledger.rankResponse.ranking
  .toSorted((left, right) => left.rank - right.rank)
  .slice(0, 3)
  .map((candidate) => candidate.name);

if (!ledger.researchResponse) {
  ledger.researchResponse = await request(
    "research",
    {
      names: finalistNames,
      brief,
      tlds: ["com", "dev", "design", "io"],
    },
    ledger.idempotency.research,
  );
  persist();
}

const curatedNames = [
  "Nimbrate",
  "Sculptlume",
  "Virelo",
  "Caldris",
  "Meldra",
  "Velaire",
  "Albeo",
  "Volucent",
  "Lumifold",
  "Formera",
  "Orison",
  "Nacre",
];

if (!ledger.curatedCheckResponse) {
  ledger.idempotency.curatedCheck ??= `curated-check-${randomUUID()}`;
  ledger.curatedCheckResponse = await request(
    "check",
    {
      names: curatedNames,
      tlds: ["com", "dev"],
      includeNamespaces: true,
      context: {
        brief,
        category: "open-source design system and web rendering library",
        channels: ["npm", "GitHub", "documentation website", "launch video"],
        preferredTld: "com",
        competitorNames: [
          "Liquid Glass React",
          "Avenra",
          "AuraGlass",
          "Magic UI",
          "Aceternity",
          "Framer Motion",
        ],
        saturatedRoots: ["liquid", "glass", "crystal", "prism", "lens", "aqua"],
      },
    },
    ledger.idempotency.curatedCheck,
  );
  persist();
}

if (!ledger.secondarySearchSprint) {
  ledger.secondarySearchSprint = {
    sprintId: `glass-search-${randomUUID()}`,
    idempotencyKey: `search-generate-${randomUUID()}`,
    brief: SEARCH_LED_BRIEF,
    requestedAt: new Date().toISOString(),
  };
  persist();
}

if (!ledger.secondarySearchSprint.generation) {
  const originalSprintId = ledger.sprintId;
  ledger.sprintId = ledger.secondarySearchSprint.sprintId;
  ledger.secondarySearchSprint.generation = await request(
    "generate",
    {
      brief: SEARCH_LED_BRIEF,
      count: 50,
      tlds: ["dev"],
      checkPrimaryDomain: false,
      excludedNames: generatedCandidates.map((candidate) => candidate.name),
      iteration: {
        feedback:
          "Discoverability is now a core requirement. Generate names and package-style slugs clearly related to liquid glass UI, refraction, optical glass, fluid interfaces, glass CSS, or glass components. Hyphens and descriptive two-word names are welcome. A .com is not required. Avoid names identical to known active competitors.",
        likedNames: ["Refract UI", "Refractive UI", "Liquid Glass Kit", "Glasscraft UI"],
        dislikedNames: ["SecondPrimary", "Nimbrate", "Sculptlume"],
      },
    },
    ledger.secondarySearchSprint.idempotencyKey,
  );
  ledger.sprintId = originalSprintId;
  persist();
}

const searchRoots = [
  "refract",
  "refraction",
  "refractive",
  "liquid-glass",
  "liquid",
  "fluid-glass",
  "glass",
  "glaze",
  "vitre",
  "optic",
  "caustic",
  "lucent",
  "glasscraft",
  "glassforge",
  "glassframe",
];
const searchSuffixes = [
  "ui",
  "web",
  "css",
  "react",
  "system",
  "design",
  "kit",
  "lab",
  "components",
  "motion",
];
ledger.secondarySearchSprint.localKeywordField ??= searchRoots.flatMap((root) =>
  searchSuffixes.map((suffix) => `${root}-${suffix}`),
);
persist();

const searchLedFinalists = [
  "Refract UI",
  "RefractUI",
  "Refractive UI",
  "Refraction UI",
  "Refract Kit",
  "Refract CSS",
  "Liquid Glass Kit",
  "Liquid Glass Web",
  "Open Liquid Glass",
  "Fluid Glass UI",
  "Glasscraft UI",
  "Glassforge UI",
  "Glassframe UI",
  "Glass CSS Kit",
  "Refractbox",
  "Vitreform",
  "Refraxion",
  "Focalume",
  "Glasscap",
  "Sheenstack",
];

if (!ledger.secondarySearchSprint.curatedCheck) {
  ledger.secondarySearchSprint.checkIdempotencyKey ??= `search-check-${randomUUID()}`;
  const originalSprintId = ledger.sprintId;
  ledger.sprintId = ledger.secondarySearchSprint.sprintId;
  ledger.secondarySearchSprint.curatedCheck = await request(
    "check",
    {
      names: searchLedFinalists,
      tlds: ["dev"],
      includeNamespaces: true,
      context: {
        brief: SEARCH_LED_BRIEF,
        category: "open-source liquid glass UI design system for React and the web",
        channels: ["npm", "GitHub", "Google search", "AI coding agents", "creator video"],
        preferredTld: "dev",
        competitorNames: [
          "liquid-glass-ui",
          "liquid-glass-react",
          "react-glass-ui",
          "react-magic-ui",
          "AuraGlass",
          "Avenra",
        ],
        saturatedRoots: ["liquid-glass", "glass-ui", "react-glass"],
      },
    },
    ledger.secondarySearchSprint.checkIdempotencyKey,
  );
  ledger.sprintId = originalSprintId;
  persist();
}

if (!ledger.tertiarySearchSprint) {
  ledger.tertiarySearchSprint = {
    sprintId: `glass-category-${randomUUID()}`,
    generateOneKey: `category-generate-one-${randomUUID()}`,
    generateTwoKey: `category-generate-two-${randomUUID()}`,
    brief: SEARCH_LED_BRIEF,
    requestedAt: new Date().toISOString(),
    direction:
      "A final search-led sprint after founder feedback. Favor names that immediately suggest open Liquid Glass UI, refraction, optical material, or a web component system while retaining enough distinctiveness to brand.",
  };
  persist();
}

const priorSearchNames = [
  ...generatedCandidates.map((candidate) => candidate.name),
  ...ledger.secondarySearchSprint.generation.candidates.map((candidate) => candidate.name),
];

if (!ledger.tertiarySearchSprint.generationOne) {
  const originalSprintId = ledger.sprintId;
  ledger.sprintId = ledger.tertiarySearchSprint.sprintId;
  ledger.tertiarySearchSprint.generationOne = await request(
    "generate",
    {
      brief: SEARCH_LED_BRIEF,
      count: 50,
      tlds: ["dev"],
      checkPrimaryDomain: false,
      excludedNames: priorSearchNames,
      iteration: {
        feedback:
          "Generate memorable package and library names that a developer can understand after hearing once. Half of the evaluation weight is discoverability for liquid glass UI, glass UI React, refraction UI, or glass CSS. The other half is premium brand quality and plausible distinctiveness. Two-word names, compounds, and package-friendly hyphens are welcome. The public tagline will explicitly say 'Open-source Liquid Glass UI for React and the web', so the brand may use glass, refract, fluid, vitreous, optical, caustic, or surface language without repeating that whole phrase. Do not generate an abstract fantasy word with no category clue.",
        likedNames: [
          "Open Glass UI",
          "Fluid Glass UI",
          "Refract Kit",
          "GlassFrame UI",
          "Vitreform",
        ],
        dislikedNames: [
          "GlassForge",
          "Refraction UI",
          "Refractive UI",
          "Liquid Glass Kit",
          "Nimbrate",
          "Sculptlume",
        ],
      },
    },
    ledger.tertiarySearchSprint.generateOneKey,
  );
  ledger.sprintId = originalSprintId;
  persist();
}

if (!ledger.tertiarySearchSprint.generationTwo) {
  const originalSprintId = ledger.sprintId;
  ledger.sprintId = ledger.tertiarySearchSprint.sprintId;
  ledger.tertiarySearchSprint.generateTwoRetryKey ??= `category-generate-two-retry-${randomUUID()}`;
  ledger.tertiarySearchSprint.generationTwo = await request(
    "generate",
    {
      brief: SEARCH_LED_BRIEF,
      count: 50,
      tlds: ["dev"],
      checkPrimaryDomain: false,
      excludedNames: [
        ...ledger.tertiarySearchSprint.generationOne.candidates.map((candidate) => candidate.name),
        ...priorSearchNames,
      ].slice(0, 150),
      iteration: {
        feedback:
          "Explore a second, non-overlapping field. Prioritize compact compounds that include or strongly evoke glass, refraction, light bending, fluid surfaces, or open UI infrastructure. Make the spelling obvious enough for npm and GitHub search. Avoid existing product-like names, Apple affiliation, vague agency names, and cosmetic single-effect names.",
        likedNames: [
          "Open Glass UI",
          "Fluid Glass UI",
          "Refract Kit",
          "GlassFrame UI",
          "Vitreform",
        ],
        dislikedNames: ledger.tertiarySearchSprint.generationOne.candidates
          .slice(0, 10)
          .map((candidate) => candidate.name),
      },
    },
    ledger.tertiarySearchSprint.generateTwoRetryKey,
  );
  ledger.sprintId = originalSprintId;
  persist();
}

const finalCategoryCandidates = [
  "Open Glass UI",
  "Fluid Glass UI",
  "Refract Kit",
  "GlassFrame UI",
  "Vitreform",
  "Refractis",
  "Refractance",
  "Bendframe",
  "Vitreline",
  "Hyalux",
  "Open Liquid Glass",
  "Liquid Glass System",
];

if (!ledger.tertiarySearchSprint.finalCheck) {
  ledger.tertiarySearchSprint.finalCheckKey ??= `category-check-${randomUUID()}`;
  const originalSprintId = ledger.sprintId;
  ledger.sprintId = ledger.tertiarySearchSprint.sprintId;
  ledger.tertiarySearchSprint.finalCheck = await request(
    "check",
    {
      names: finalCategoryCandidates,
      tlds: ["dev", "design"],
      includeNamespaces: true,
      context: {
        brief: SEARCH_LED_BRIEF,
        category: "open-source Liquid Glass React and web UI component system",
        channels: ["npm", "GitHub", "Google search", "AI coding agents", "creator video"],
        preferredTld: "dev",
        competitorNames: [
          "AuraGlass",
          "Ein UI",
          "Glin UI",
          "Liquid Glass UI",
          "Liquid Glass React",
          "React Glass UI",
          "Refraction UI",
          "Refractive",
          "Refract UI",
          "GlassForge",
        ],
        saturatedRoots: ["liquid-glass", "glass-ui", "react-glass", "refraction-ui"],
      },
    },
    ledger.tertiarySearchSprint.finalCheckKey,
  );
  ledger.sprintId = originalSprintId;
  persist();
}

if (!ledger.tertiarySearchSprint.finalRank) {
  ledger.tertiarySearchSprint.finalRankKey ??= `category-rank-${randomUUID()}`;
  const originalSprintId = ledger.sprintId;
  ledger.sprintId = ledger.tertiarySearchSprint.sprintId;
  ledger.tertiarySearchSprint.finalRank = await request(
    "rank",
    {
      brief: SEARCH_LED_BRIEF,
      candidates: ledger.tertiarySearchSprint.finalCheck.results.map((candidate) => ({
        name: candidate.name,
        rationale: candidate.rationale,
        score: candidate.score,
        domains: candidate.domains,
      })),
    },
    ledger.tertiarySearchSprint.finalRankKey,
  );
  ledger.sprintId = originalSprintId;
  persist();
}

const finalResearchNames = ledger.tertiarySearchSprint.finalRank.ranking
  .toSorted((left, right) => left.rank - right.rank)
  .slice(0, 3)
  .map((candidate) => candidate.name);

if (!ledger.tertiarySearchSprint.finalResearch) {
  if (!ledger.tertiarySearchSprint.researchSprintId) {
    ledger.tertiarySearchSprint.researchSprintId = `glass-category-research-${randomUUID()}`;
    persist();
  }
  ledger.tertiarySearchSprint.finalResearchSecondRetryKey ??= `category-research-second-retry-${randomUUID()}`;
  const originalSprintId = ledger.sprintId;
  ledger.sprintId = ledger.tertiarySearchSprint.researchSprintId;
  ledger.tertiarySearchSprint.finalResearch = await request(
    "research",
    {
      names: finalResearchNames,
      brief: SEARCH_LED_BRIEF,
      tlds: ["dev", "design", "com"],
    },
    ledger.tertiarySearchSprint.finalResearchSecondRetryKey,
  );
  ledger.sprintId = originalSprintId;
  persist();
}

const quota =
  ledger.tertiarySearchSprint.finalResearch.quota ??
  ledger.tertiarySearchSprint.finalRank.quota ??
  ledger.tertiarySearchSprint.finalCheck.quota ??
  ledger.tertiarySearchSprint.generationTwo.quota ??
  ledger.tertiarySearchSprint.generationOne.quota ??
  ledger.secondarySearchSprint.curatedCheck.quota ??
  ledger.secondarySearchSprint.generation.quota ??
  ledger.curatedCheckResponse.quota ??
  ledger.researchResponse.quota ??
  ledger.rankResponse.quota ??
  ledger.checkResponse.quota ??
  ledger.generationTwo.quota;

console.log(
  JSON.stringify(
    {
      ledger: LEDGER_PATH,
      generated: generatedCandidates.length,
      checked: checkedCandidates.length,
      finalists: finalistNames,
      curated: curatedNames,
      secondaryGenerated: ledger.secondarySearchSprint.generation.candidates.length,
      localKeywordField: ledger.secondarySearchSprint.localKeywordField.length,
      secondaryChecked: ledger.secondarySearchSprint.curatedCheck.results.length,
      tertiaryGenerated:
        ledger.tertiarySearchSprint.generationOne.candidates.length +
        ledger.tertiarySearchSprint.generationTwo.candidates.length,
      finalCategoryRanking: ledger.tertiarySearchSprint.finalRank.ranking
        .toSorted((left, right) => left.rank - right.rank)
        .slice(0, 7)
        .map((candidate) => candidate.name),
      creditsRemaining: quota?.remaining ?? quota?.creditsRemaining ?? "unknown",
    },
    null,
    2,
  ),
);
