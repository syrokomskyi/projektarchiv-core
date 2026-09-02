/*
<MODULE_CONTRACT>
<purpose>Test-only pure scanner for the Projektarchiv portable-core dependency boundary.</purpose>
<non-goals>
  <item>Do not expose this helper from the production package entrypoint.</item>
  <item>Do not encode provider adapter behavior.</item>
</non-goals>
</MODULE_CONTRACT>
<CHANGE_SUMMARY>
  <item>RFC-1000: add executable source and manifest boundary classification.</item>
</CHANGE_SUMMARY>
*/

import { readFile, readdir } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";

import ts from "typescript";

export interface BoundaryViolation {
  readonly source: string;
  readonly specifier: string;
  readonly reason: string;
}

const FORBIDDEN_PACKAGE_PREFIXES = [
  "@warpgogol/",
  "@cloudflare/",
  "@google-cloud/",
] as const;

const FORBIDDEN_EXACT_PACKAGES = new Set([
  "astro",
  "cloudflare",
  "googleapis",
  "wrangler",
]);

export function classifyModuleSpecifier(specifier: string): string | undefined {
  if (specifier.startsWith("@warpgogol/")) {
    return "workspace dependency is forbidden in the portable core";
  }
  if (
    specifier.startsWith("cloudflare:") ||
    FORBIDDEN_PACKAGE_PREFIXES.slice(1).some((prefix) => specifier.startsWith(prefix)) ||
    FORBIDDEN_EXACT_PACKAGES.has(specifier.split("/")[0] ?? specifier)
  ) {
    return "provider or deployment-runtime dependency is forbidden in the portable core";
  }
  return undefined;
}

export function collectModuleSpecifiers(sourceText: string): readonly string[] {
  const sourceFile = ts.createSourceFile(
    "boundary-fixture.ts",
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const specifiers: string[] = [];

  const addStringLiteral = (node: ts.Node | undefined): void => {
    if (node && ts.isStringLiteralLike(node)) specifiers.push(node.text);
  };

  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      addStringLiteral(node.moduleSpecifier);
    } else if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === "require"))
    ) {
      addStringLiteral(node.arguments[0]);
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return specifiers;
}

export function classifyRelativeEscape(
  specifier: string,
  sourceFile: string,
  packageRoot: string,
): string | undefined {
  if (!specifier.startsWith(".")) return undefined;
  const target = resolve(dirname(sourceFile), specifier);
  const relativeTarget = relative(packageRoot, target);
  if (relativeTarget === ".." || relativeTarget.startsWith("../")) {
    return "relative import escapes the portable core package";
  }
  return undefined;
}

export function inspectSourceText(
  sourceText: string,
  sourceFile: string,
  packageRoot: string,
): readonly BoundaryViolation[] {
  return collectModuleSpecifiers(sourceText).flatMap((specifier) => {
    const reason =
      classifyModuleSpecifier(specifier) ??
      classifyRelativeEscape(specifier, sourceFile, packageRoot);
    return reason ? [{ source: sourceFile, specifier, reason }] : [];
  });
}

export function inspectRuntimeDependencies(
  manifest: Record<string, unknown>,
  manifestPath: string,
): readonly BoundaryViolation[] {
  const sections = ["dependencies", "peerDependencies", "optionalDependencies"] as const;
  return sections.flatMap((section) => {
    const value = manifest[section];
    if (!value || typeof value !== "object" || Array.isArray(value)) return [];
    return Object.keys(value).flatMap((specifier) => {
      const reason = classifyModuleSpecifier(specifier);
      return reason
        ? [{ source: `${manifestPath}#${section}`, specifier, reason }]
        : [];
    });
  });
}

async function collectProductionFiles(directory: string): Promise<readonly string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "tests" || entry.name === "testing") return [];
        return collectProductionFiles(path);
      }
      return /\.[cm]?[jt]sx?$/.test(entry.name) ? [path] : [];
    }),
  );
  return files.flat();
}

export async function scanPackageBoundary(
  packageRoot: string,
): Promise<readonly BoundaryViolation[]> {
  const manifestPath = resolve(packageRoot, "package.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Record<string, unknown>;
  const sourceFiles = await collectProductionFiles(resolve(packageRoot, "src"));
  const sourceViolations = await Promise.all(
    sourceFiles.map(async (sourceFile) =>
      inspectSourceText(await readFile(sourceFile, "utf8"), sourceFile, packageRoot),
    ),
  );
  return [...inspectRuntimeDependencies(manifest, manifestPath), ...sourceViolations.flat()];
}
