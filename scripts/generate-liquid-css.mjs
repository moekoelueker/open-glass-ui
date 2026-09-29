#!/usr/bin/env node
/**
 * Generates packages/recipes/src/liquid.css from liquid.source.css.
 *
 * Every rule in the source is written as `:where([data-ogui-design="liquid"]) X`.
 * On its own that matches X anywhere below a liquid scope, including inside a
 * nested `design="classic"` island. The generator appends a zero-specificity
 * guard to the subject compound of X so the nearest design scope wins:
 *
 *   X:not(:where(classic *):not(:where(classic liquid *)))
 *
 * i.e. "not inside a classic scope, unless a liquid scope re-opens inside it".
 * Specificity is unchanged, so the promise that each liquid rule shares the
 * specificity of the classic rule it replaces still holds.
 *
 * Usage: node scripts/generate-liquid-css.mjs [--check]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SCOPE = ':where([data-ogui-design="liquid"])';
const GUARD =
  ':not(:where([data-ogui-design="classic"] *):not(:where([data-ogui-design="classic"] [data-ogui-design="liquid"] *)))';

function splitTopLevel(text) {
  const parts = [];
  let depth = 0;
  let current = "";
  for (const character of text) {
    if (character === "(" || character === "[") depth += 1;
    if (character === ")" || character === "]") depth -= 1;
    if (character === "," && depth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += character;
    }
  }
  parts.push(current);
  return parts;
}

function guardSelector(selector) {
  const leading = selector.slice(0, selector.length - selector.trimStart().length);
  const body = selector.trim();
  if (!body.startsWith(SCOPE)) return selector;
  const afterScope = body.slice(SCOPE.length);
  if (!/^\s/.test(afterScope)) return selector;
  const rest = afterScope.trimStart();
  // Token definitions cascade through inheritance, where nearest already wins.
  if (rest.startsWith(":where([data-ogui-tone")) return selector;

  let depth = 0;
  let index = 0;
  for (; index < rest.length; index += 1) {
    const character = rest[index];
    if (character === "(" || character === "[") depth += 1;
    else if (character === ")" || character === "]") depth -= 1;
    else if (
      depth === 0 &&
      (/\s/.test(character) || ">~+".includes(character) || rest.startsWith("::", index))
    ) {
      break;
    }
  }
  return `${leading}${SCOPE} ${rest.slice(0, index)}${GUARD}${rest.slice(index)}`;
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
