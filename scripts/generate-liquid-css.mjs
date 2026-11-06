#!/usr/bin/env node
/**
 * Generates packages/recipes/src/liquid.css from liquid.source.css.
 *
 * Every rule in the source is written as `:where([data-ogui-design="liquid"]) X`.
 * On its own that matches X anywhere below a liquid scope, including inside a
 * nested `design="classic"` island. The generator appends a zero-specificity
 * guard to the subject compound of X (its last compound, before any
 * pseudo-element) so the nearest design scope above the subject wins:
 *
 *   X:not(:where(C *):not(:where(C L *):not(:where(C L C *):not(:where(C L C L *)))))
 *
 * with C = [data-ogui-design="classic"] and L = [data-ogui-design="liquid"].
 * Read inside out: the subject is styled liquid unless it sits in a classic
 * scope, except when a liquid scope re-opens inside that classic scope, except
 * when a classic scope re-opens inside that one, and so on. The chain is
 * bounded at GUARD_DEPTH alternating scopes counted from the outermost classic
 * one (classic > liquid > classic > liquid); deeper alternation resolves as if
 * it stopped there. Every part of the guard sits inside `:where()`, so
 * specificity is unchanged and each liquid rule keeps the specificity of the
 * classic rule it replaces.
 *
 * Usage: node scripts/generate-liquid-css.mjs [--check]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SCOPE = ':where([data-ogui-design="liquid"])';
const CLASSIC = '[data-ogui-design="classic"]';
const LIQUID = '[data-ogui-design="liquid"]';

export const GUARD_DEPTH = 4;

function nearestScopeGuard(depth) {
  let guard = "";
  for (let level = depth; level >= 1; level -= 1) {
    const chain = Array.from({ length: level }, (_, index) =>
      index % 2 === 0 ? CLASSIC : LIQUID,
    ).join(" ");
    guard = `:not(:where(${chain} *)${guard})`;
  }
  return guard;
}

export const LIQUID_GUARD = nearestScopeGuard(GUARD_DEPTH);

/**
 * Calls `visit(index)` for every character of `text` that is outside
 * parentheses, brackets and quoted strings. Returning true stops the scan.
 */
function scanTopLevel(text, visit, from = 0) {
  let depth = 0;
  let quote = "";
  for (let index = from; index < text.length; index += 1) {
    const character = text[index];
    if (quote) {
      if (character === "\\") index += 1;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === "\\") {
      index += 1;
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === "(" || character === "[") {
      depth += 1;
    } else if (character === ")" || character === "]") {
      depth -= 1;
    } else if (depth === 0 && visit(index)) {
      return;
    }
  }
}

function splitTopLevel(text) {
  const parts = [];
  let start = 0;
  scanTopLevel(text, (index) => {
    if (text[index] === ",") {
      parts.push(text.slice(start, index));
      start = index + 1;
    }
    return false;
  });
  parts.push(text.slice(start));
  return parts;
}

const LEGACY_PSEUDO_ELEMENT = /^:(?:before|after|first-line|first-letter)(?![\w-])/;

/** Where the guard goes: the end of the subject compound, before any pseudo-element. */
function subjectGuardIndex(selector) {
  let subjectStart = 0;
  scanTopLevel(selector, (index) => {
    if (/\s/.test(selector[index]) || ">~+".includes(selector[index])) subjectStart = index + 1;
    return false;
  });
  let insertAt = selector.length;
  scanTopLevel(
    selector,
    (index) => {
      const tail = selector.slice(index);
      if (tail.startsWith("::") || LEGACY_PSEUDO_ELEMENT.test(tail)) {
        insertAt = index;
        return true;
      }
      return false;
    },
    subjectStart,
  );
  return insertAt;
}

function guardSelector(selector) {
  const leading = selector.slice(0, selector.length - selector.trimStart().length);
  const body = selector.trim();
  if (!body.startsWith(SCOPE)) return selector;
  const afterScope = body.slice(SCOPE.length);
  if (!/^\s/.test(afterScope)) return selector;
  const rest = afterScope.trimStart();
  if (!rest) return selector;
  // Token definitions cascade through inheritance, where nearest already wins.
  if (rest.startsWith(":where([data-ogui-tone")) return selector;

  const index = subjectGuardIndex(rest);
  return `${leading}${SCOPE} ${rest.slice(0, index)}${LIQUID_GUARD}${rest.slice(index)}`;
}

export function generateLiquidCss(source) {
  let output = "";
  let position = 0;
  const prelude = /([^{}]*)\{/g;
  for (let match = prelude.exec(source); match; match = prelude.exec(source)) {
    const text = match[1];
    const trimmed = text.replace(/^\s*(?:\/\*[\s\S]*?\*\/\s*)*/, "");
    const head = text.slice(0, text.length - trimmed.length);
    if (text.includes(SCOPE) && !trimmed.startsWith("@")) {
      output += source.slice(position, match.index);
      output += `${head}${splitTopLevel(trimmed).map(guardSelector).join(",")}{`;
    } else {
      output += source.slice(position, match.index + match[0].length);
    }
    position = match.index + match[0].length;
  }
  output += source.slice(position);
  return `/* Generated from liquid.source.css by scripts/generate-liquid-css.mjs. Do not edit. */\n${output}`;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const sourcePath = fileURLToPath(
    new URL("../packages/recipes/src/liquid.source.css", import.meta.url),
  );
  const outputPath = fileURLToPath(new URL("../packages/recipes/src/liquid.css", import.meta.url));
  const generated = generateLiquidCss(readFileSync(sourcePath, "utf8"));
  if (process.argv.includes("--check")) {
    if (readFileSync(outputPath, "utf8") !== generated) {
      console.error("liquid.css is stale. Run `pnpm generate:liquid`.");
      process.exit(1);
    }
    console.log("liquid.css is up to date.");
  } else {
    writeFileSync(outputPath, generated);
    console.log("Wrote packages/recipes/src/liquid.css");
  }
}
