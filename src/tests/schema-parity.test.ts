// @vitest-environment node

import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { Ajv2020 } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { describe, expect, it } from "vitest";

import { schemaExamples } from "../testing/fixtures.ts";

const packageRoot = resolve(fileURLToPath(new URL("../../", import.meta.url)));
const packagedSchemas = resolve(packageRoot, "schemas");
const vendoredSchemas = resolve(
  packageRoot,
  "../../docs/specs/warpgogol-client-onboarding/projektarchiv/schemas",
);

describe("JSON Schema ownership and parity", () => {
  it("validates every public JSON Schema against draft 2020-12", async () => {
    const ajv = new Ajv2020({ strict: true, validateFormats: true });
    addFormats(ajv);
    const files = (await readdir(packagedSchemas)).sort();
    expect(files).toHaveLength(16);
    for (const file of files) {
      const schema = JSON.parse(await readFile(resolve(packagedSchemas, file), "utf8"));
      expect(ajv.validateSchema(schema), `${file}: ${ajv.errorsText()}`).toBe(true);
    }
  });

  it("keeps all packaged schemas byte-equal to the immutable vendored snapshot", async () => {
    const files = (await readdir(packagedSchemas)).sort();
    for (const file of files) {
      const [packaged, vendored] = await Promise.all([
        readFile(resolve(packagedSchemas, file)),
        readFile(resolve(vendoredSchemas, file)),
      ]);
      expect(packaged.equals(vendored), file).toBe(true);
    }
  });

  it("accepts the complete canonical example corpus with packaged JSON Schemas", async () => {
    const ajv = new Ajv2020({ strict: true, validateFormats: true });
    addFormats(ajv);
    const files = (await readdir(packagedSchemas))
      .filter((file) => file !== "ids.schema.json")
      .sort();
    const examplesBySchema = new Map(schemaExamples.map((example) => [example.schema, example]));
    for (const file of files) {
      const document = JSON.parse(await readFile(resolve(packagedSchemas, file), "utf8"));
      const schemaTag = document.properties.schema.const as string;
      const validate = ajv.compile(document);
      const valid = validate(examplesBySchema.get(schemaTag));
      expect(valid, `${file}: ${ajv.errorsText(validate.errors)}`).toBe(true);
    }
  });
});
