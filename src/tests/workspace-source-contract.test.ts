// @vitest-environment node

import { describe, it } from "vitest";

import { workspaceIdSchema } from "../identities.ts";
import {
  MemoryWorkspaceSourceAdapter,
  type MemorySourceItem,
} from "../testing/memory-adapters.ts";
import { runWorkspaceSourceAdapterContract } from "../testing/conformance.ts";
import { ids, scope } from "../testing/fixtures.ts";

describe("Workspace source portability", () => {
  it("runs the core capture contract with a memory WorkspaceSourceAdapter", async () => {
    const item: MemorySourceItem = {
      descriptor: {
        providerItemId: "item-1",
        providerVersion: "1",
        path: "/brief.txt",
        filename: "brief.txt",
        itemKind: "file",
        metadata: { source: "memory" },
      },
      capture: {
        providerItemId: "item-1",
        providerVersion: "1",
        mediaType: "text/plain",
        captureRepresentation: null,
        bytes: new Uint8Array([1, 2, 3]),
      },
    };
    await runWorkspaceSourceAdapterContract(
      new MemoryWorkspaceSourceAdapter(
        scope,
        workspaceIdSchema.parse(ids.workspace),
        [item],
      ),
    );
  });
});
