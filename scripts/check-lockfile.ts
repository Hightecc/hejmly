#!/usr/bin/env bun
import { existsSync, readFileSync } from "node:fs";

const path = "pnpm-lock.yaml";

if (!existsSync(path)) {
  console.error(`::error::${path} missing — every commit must include it`);
  process.exit(1);
}

const content = readFileSync(path, "utf8");
const lines = content.split("\n");

const exoticInResolution = /resolution:\s*\{[^}]*\b(tarball|repo|directory)\s*:/;
const nonNpmTarball = /tarball:\s*['"]?https?:\/\/(?!registry\.npmjs\.org|registry\.yarnpkg\.com)/i;
const nonNpmRegistry = /^\s*registry:\s*['"]?https?:\/\/(?!registry\.npmjs\.org)/i;

let violations = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i] ?? "";
  const lineNo = i + 1;
  if (exoticInResolution.test(line)) {
    console.error(
      `::error file=${path},line=${lineNo}::exotic resolution (tarball/repo/directory): ${line.trim()}`,
    );
    violations++;
  }
  if (nonNpmTarball.test(line)) {
    console.error(
      `::error file=${path},line=${lineNo}::tarball URL pointing outside the npm registry: ${line.trim()}`,
    );
    violations++;
  }
  if (nonNpmRegistry.test(line)) {
    console.error(`::error file=${path},line=${lineNo}::non-npmjs registry: ${line.trim()}`);
    violations++;
  }
}

if (violations > 0) {
  console.error(`\ncheck-lockfile: ${violations} violation(s) in ${path}`);
  process.exit(1);
}

console.log(`check-lockfile: ok (${lines.length} lines scanned)`);
