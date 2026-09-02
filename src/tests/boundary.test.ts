// @vitest-environment node

import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import fc from "fast-check";
import { describe, expect, it } from "vitest";

import {
  classifyModuleSpecifier,
  classifyRelativeEscape,
  collectModuleSpecifiers,
  inspectRuntimeDependencies,
  inspectSourceText,
  scanPackageBoundary,
} from "../testing/boundary-policy.ts";

const packageRoot = resolve(fileURLToPath(new URL("../../", import.meta.url)));

describe("Projektarchiv portable-core boundary", () => {
  it("keeps the real production package free of forbidden dependencies", async () => {
    await expect(scanPackageBoundary(packageRoot)).resolves.toEqual([]);
  });

  it.each([
    ['import value from "@warpgogol/forge";', "@warpgogol/forge"],
    ['export { value } from "@google-cloud/storage";', "@google-cloud/storage"],
    ['const value = import("@cloudflare/workers-types");', "@cloudflare/workers-types"],
    ['const value = require("googleapis");', "googleapis"],
    ['import value from "cloudflare:workers";', "cloudflare:workers"],
    ['import value from "astro";', "astro"],
    ['import value from "astro:content";', "astro:content"],
    ['import value from "astro/config";', "astro/config"],
    [
      'import forge = require("@warpgogol/forge");',
      "@warpgogol/forge",
    ],
  ])("extracts and rejects %s", (sourceText, specifier) => {
    expect(collectModuleSpecifiers(sourceText)).toContain(specifier);
    expect(inspectSourceText(sourceText, "/repo/core/src/file.ts", "/repo/core")).toEqual([
      expect.objectContaining({
        specifier,
        reason: expect.stringContaining("forbidden"),
      }),
    ]);
  });

  it("rejects relative paths that escape the package", () => {
    expect(
      classifyRelativeEscape("../../outside.ts", "/repo/core/src/file.ts", "/repo/core"),
    ).toContain("escapes");
  });

  it.each(["dependencies", "peerDependencies", "optionalDependencies"])(
    "rejects forbidden %s entries",
    (section) => {
      const violations = inspectRuntimeDependencies(
        { [section]: { "@warpgogol/forge": "workspace:*" } },
        "/repo/core/package.json",
      );
      expect(violations).toEqual([
        expect.objectContaining({
          source: `/repo/core/package.json#${section}`,
          specifier: "@warpgogol/forge",
        }),
      ]);
    },
  );

  it("rejects every Warpgogol workspace package name", () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-z][a-z0-9-]{0,30}$/),
        (name) => classifyModuleSpecifier(`@warpgogol/${name}`) !== undefined,
      ),
    );
  });

  it("accepts arbitrary relative in-package module names", () => {
    fc.assert(
      fc.property(fc.stringMatching(/^[a-z][a-z0-9-]{0,30}$/), (name) => {
        expect(classifyModuleSpecifier(`./${name}.ts`)).toBeUndefined();
        expect(
          classifyRelativeEscape(`./${name}.ts`, "/repo/core/src/file.ts", "/repo/core"),
        ).toBeUndefined();
      }),
    );
  });
});
