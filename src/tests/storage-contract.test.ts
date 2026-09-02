// @vitest-environment node

import { describe, it } from "vitest";

import { runStoragePortsContract } from "../testing/conformance.ts";
import { scope } from "../testing/fixtures.ts";
import {
  MemoryArtifactStore,
  MemoryCatalogStore,
  MemoryRevisionCoordinator,
} from "../testing/memory-adapters.ts";

describe("Storage portability", () => {
  it("runs core conformance against memory non-Cloudflare stores", async () => {
    await runStoragePortsContract({
      artifactStore: new MemoryArtifactStore(scope),
      catalogStore: new MemoryCatalogStore(scope),
      revisionCoordinator: new MemoryRevisionCoordinator(scope),
    });
  });
});
