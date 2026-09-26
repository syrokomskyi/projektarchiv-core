/*
<MODULE_CONTRACT>
<purpose>Run reusable behavioral conformance laws against implementations of the public Projektarchiv port interfaces.</purpose>
<non-goals>
  <item>Do not depend on Vitest or grant production authority to memory adapters.</item>
</non-goals>
</MODULE_CONTRACT>
<CHANGE_SUMMARY>
  <item>RFC-1001: add source and storage port conformance harnesses.</item>
</CHANGE_SUMMARY>
*/

import {
  artifactIdSchema,
  reservationIdSchema,
  snapshotIdSchema,
  workspaceIdSchema,
} from "../identities.ts";
import type { ArtifactStore } from "../ports/artifact-store.ts";
import type { CatalogStore } from "../ports/catalog-store.ts";
import type { RevisionCoordinator } from "../ports/revision-coordinator.ts";
import type { WorkspaceSourceAdapter } from "../ports/workspace-source.ts";
import { workspaceSnapshotSchema } from "../schemas/index.ts";
import { foreignScope, ids, scope, sha256, timestamp } from "./fixtures.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Conformance failure: ${message}`);
}

export async function runWorkspaceSourceAdapterContract(
  adapter: WorkspaceSourceAdapter,
): Promise<void> {
  assert(adapter.provider === "memory", "test adapter must identify as memory");
  const request = { scope, workspaceId: workspaceIdSchema.parse(ids.workspace) };
  const cursor = await adapter.establishCursor(request);
  assert(cursor.ok, "cursor establishment must succeed");
  const listed = await adapter.listItems(request);
  assert(listed.ok && listed.value.length === 1, "one source item must be listed");
  const item = listed.ok ? listed.value[0] : undefined;
  assert(item, "listed source item must exist");
  const captured = await adapter.readItem({
    ...request,
    providerItemId: item.providerItemId,
    expectedProviderVersion: item.providerVersion,
  });
  assert(captured.ok, "listed item capture representation must be readable");
  const reconciled = await adapter.reconcileChanges({
    ...request,
    after: cursor.ok ? cursor.value : { value: null },
  });
  assert(reconciled.ok, "source reconciliation must succeed");
  const foreign = await adapter.listItems({ ...request, scope: foreignScope });
  assert(!foreign.ok && foreign.code === "PA_SCOPE_MISMATCH", "foreign scope must fail");
}

export interface StorageContractAdapters {
  readonly artifactStore: ArtifactStore;
  readonly catalogStore: CatalogStore;
  readonly revisionCoordinator: RevisionCoordinator;
}

export async function runStoragePortsContract(adapters: StorageContractAdapters): Promise<void> {
  const object = {
    scope,
    objectKey: "artifacts/example/1/original",
    contentSha256: sha256,
    byteSize: 3,
    mediaType: "text/plain",
    bytes: new Uint8Array([1, 2, 3]),
  };
  assert((await adapters.artifactStore.create(object)).ok, "first create must succeed");
  const duplicate = await adapters.artifactStore.create(object);
  assert(!duplicate.ok && duplicate.code === "PA_ALREADY_EXISTS", "second create must conflict");
  const foreignRead = await adapters.artifactStore.read({
    scope: foreignScope,
    objectKey: object.objectKey,
  });
  assert(
    !foreignRead.ok && foreignRead.code === "PA_SCOPE_MISMATCH",
    "foreign artifact scope must fail",
  );

  const firstCommit = {
    scope,
    commitId: "commit-1",
    previousCommitId: null,
    records: [{ table: "projects", value: { projectId: ids.project } }],
  };
  assert((await adapters.catalogStore.appendCommit(firstCommit)).ok, "commit must append");
  assert(
    (await adapters.catalogStore.appendCommit(firstCommit)).ok,
    "same commit id must be idempotent",
  );
  const reusedCommitId = await adapters.catalogStore.appendCommit({
    ...firstCommit,
    records: [{ table: "projects", value: { projectId: ids.projectB } }],
  });
  assert(
    !reusedCommitId.ok && reusedCommitId.code === "PA_REVISION_CONFLICT",
    "same commit id with different content must conflict",
  );
  const conflictingCommit = await adapters.catalogStore.appendCommit({
    ...firstCommit,
    commitId: "commit-2",
    previousCommitId: null,
  });
  assert(
    !conflictingCommit.ok && conflictingCommit.code === "PA_REVISION_CONFLICT",
    "stale catalog predecessor must conflict",
  );
  const foreignCatalog = await adapters.catalogStore.getCurrentCommit(foreignScope);
  assert(
    !foreignCatalog.ok && foreignCatalog.code === "PA_SCOPE_MISMATCH",
    "foreign catalog scope must fail",
  );

  const firstReservation = await adapters.revisionCoordinator.reserveRevision({
    scope,
    artifactId: artifactIdSchema.parse(ids.artifact),
    reservationId: reservationIdSchema.parse(ids.reservation),
    operationId: "operation-1",
    createdAt: timestamp,
  });
  assert(firstReservation.ok && firstReservation.value.revision === 1, "revision 1 reserved");
  const abandoned = await adapters.revisionCoordinator.advanceReservation({
    scope,
    reservationId: reservationIdSchema.parse(ids.reservation),
    expectedState: "reserved",
    nextState: "abandoned",
    updatedAt: timestamp,
  });
  assert(abandoned.ok, "first reservation must become abandoned");
  const secondReservation = await adapters.revisionCoordinator.reserveRevision({
    scope,
    artifactId: artifactIdSchema.parse(ids.artifact),
    reservationId: reservationIdSchema.parse("01890f7e-7b2c-7a01-8a01-000000000013"),
    operationId: "operation-2",
    createdAt: timestamp,
  });
  assert(
    secondReservation.ok && secondReservation.value.revision === 2,
    "abandoned revision must never be reused",
  );
  const idempotent = await adapters.revisionCoordinator.reserveRevision({
    scope,
    artifactId: artifactIdSchema.parse(ids.artifact),
    reservationId: reservationIdSchema.parse("01890f7e-7b2c-7a01-8a01-000000000014"),
    operationId: "operation-2",
    createdAt: timestamp,
  });
  assert(
    idempotent.ok && idempotent.value.reservationId === secondReservation.value.reservationId,
    "operation id must return its original reservation",
  );
  const reusedOperation = await adapters.revisionCoordinator.reserveRevision({
    scope,
    artifactId: artifactIdSchema.parse("01890f7e-7b2c-7a01-8a01-000000000016"),
    reservationId: reservationIdSchema.parse("01890f7e-7b2c-7a01-8a01-000000000014"),
    operationId: "operation-2",
    createdAt: timestamp,
  });
  assert(
    !reusedOperation.ok && reusedOperation.code === "PA_REVISION_CONFLICT",
    "operation id reuse for another artifact must conflict",
  );
  const foreignCoordinator = await adapters.revisionCoordinator.getCurrentSnapshot(foreignScope);
  assert(
    !foreignCoordinator.ok && foreignCoordinator.code === "PA_SCOPE_MISMATCH",
    "foreign coordinator scope must fail",
  );

  const snapshot = workspaceSnapshotSchema.parse({
    schema: "projektarchiv.workspace-snapshot@1",
    snapshotId: ids.snapshot,
    ...scope,
    workspaceId: ids.workspace,
    captureRunId: ids.captureRun,
    sequence: 1,
    capturedAt: timestamp,
    status: "committed",
    counts: { total: 0, added: 0, modified: 0, deleted: 0, unchanged: 0 },
    integritySha256: sha256,
  });
  assert(
    (
      await adapters.revisionCoordinator.publishSnapshot({
        scope,
        expectedPreviousSnapshotId: null,
        snapshot,
      })
    ).ok,
    "first snapshot publish must succeed",
  );
  const competing = await adapters.revisionCoordinator.publishSnapshot({
    scope,
    expectedPreviousSnapshotId: null,
    snapshot: {
      ...snapshot,
      snapshotId: snapshotIdSchema.parse("01890f7e-7b2c-7a01-8a01-000000000015"),
      sequence: 2,
    },
  });
  assert(
    !competing.ok && competing.code === "PA_REVISION_CONFLICT",
    "competing snapshot CAS must conflict",
  );
}
