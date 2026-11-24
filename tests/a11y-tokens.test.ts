import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const css = readFileSync("src/app/globals.css", "utf8");
const token: Record<string, string> = Object.fromEntries(
  [...css.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9A-Fa-f]{6});/g)].map((m) => [m[1], m[2]]),
);
const tsx = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? tsx(path) : path.endsWith(".tsx") ? [path] : [];
  });
const files = tsx("src");
const source = (path: string) => readFileSync(path, "utf8");

/** WCAG 2.x contrast ratio of two #RRGGBB colours. */
function contrast(a: string, b: string): number {
  const luminance = (hex: string) => {
    const [r, g, bl] = [1, 3, 5]
      .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

test("components use colour tokens, not hard-coded hex", () => {
  assert.deepEqual(files.filter((f) => /#[0-9A-Fa-f]{6}\b/.test(source(f))), []);
});

test("token pairs meet WCAG contrast: text 4.5:1, borders and focus rings 3:1", () => {
  const WHITE = "#FFFFFF";
  // [foreground, background, where it is used, minimum]
  const pairs: [string, string, string, number][] = [
    ["text-2", "page", "secondary text on the page background", 7],
    ["text-3", WHITE, "meta text and placeholders (white only)", 4.5],
    ["link", "page", "links and info icons", 4.5],
    ["ok", WHITE, "licensed / success icons", 4.5],
    ["ok", "mint-tint", "licensing timeline duration chip", 4.5],
    ["error", "error-soft", "error messages", 4.5],
    ["field", WHITE, "form control borders", 3],
    ["focus", "page", "focus ring", 3],
    ["sky-soft", "ink", "text and focus ring on ink sections", 4.5],
    ["mint-soft", "ink", "city chip counts on ink", 4.5],
    ["ink", "sky", "nav text and focus ring on the header/footer gradient", 4.5],
    ["ink-hover", "sky", "nav hover", 4.5],
    ["ink", "sun", "sun buttons", 4.5],
    ["amber", "sun-soft", "icon on the sun tile", 4.5],
    [WHITE, "error", "danger buttons", 4.5],
    [WHITE, "link", "button hover", 4.5],
  ];
  for (const [fg, bg, use, min] of pairs) {
    const ratio = contrast(token[fg] ?? fg, token[bg] ?? bg);
    assert.ok(ratio >= min, `${fg} on ${bg} (${use}) is ${ratio.toFixed(2)}:1, needs ${min}:1`);
  }
});

test("one global focus ring: light on ink sections, ink on the header/footer gradient", () => {
  assert.ok(!css.includes("outline-ring/50"), "the 50% grey outline colour is gone");
  assert.match(css, /:where\(a, button, input, select, textarea, summary, \[tabindex\]\):focus-visible \{\s*outline: 3px solid var\(--color-focus\);/);
  assert.match(source("src/components/layout/Header.tsx"), /<header className="focus-on-sky /);
  assert.match(source("src/components/layout/Footer.tsx"), /<footer className="focus-on-sky /);
  assert.equal(source("src/components/home/HomeContent.tsx").match(/className="focus-on-dark /g)?.length, 2);
  assert.match(source("src/components/providers/ProvidersHub.tsx"), /id="grow"[^>]*className="focus-on-dark /);
  for (const ui of ["button", "input", "textarea"]) {
    const src = source(`src/components/ui/${ui}.tsx`);
    assert.ok(!src.includes("outline-none") && !src.includes("ring-ring/50"), `${ui} keeps the global ring`);
  }
});

test("every lucide icon is aria-hidden or has a label", () => {
  for (const f of files) {
    const src = source(f);
    const imported = src.match(/import\s*\{([^}]*)\}\s*from\s*"lucide-react"/)?.[1];
    if (!imported) continue;
    const names = imported.split(",").map((s) => s.trim().split(/\s+as\s+/).pop()).filter(Boolean);
    for (const tag of src.match(new RegExp(`<(${names.join("|")})\\b[^>]*>`, "g")) ?? []) {
      assert.match(tag, /aria-hidden="true"|aria-label=/, `${f}: ${tag}`);
    }
  }
});

test("date slots: arrows wrap, Home/End jump to the first/last date", () => {
  const step = source("src/components/booking/TourDetailsStep.tsx");
  assert.ok(step.includes('event.key === "Home"') && step.includes('event.key === "End"'));
  assert.match(step, /role="radio"\s+aria-checked=\{checked\}/);
});
