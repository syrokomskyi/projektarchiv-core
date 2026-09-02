/*
<MODULE_CONTRACT>
<purpose>Provide deterministic in-memory non-provider adapters for exercising the exact Projektarchiv public port contracts.</purpose>
<non-goals>
  <item>Do not export these adapters as production implementations or emulate vendor-specific behavior.</item>
</non-goals>
</MODULE_CONTRACT>
<CHANGE_SUMMARY>
  <item>RFC-1001: add memory source, artifact, catalog, and revision-coordinator adapters.</item>
</CHANGE_SUMMARY>
*/

import type { TenantScope, WorkspaceId } from "../identities.ts";
import { assertTenantScope } from "../policies/scope.ts";
import { transitionRevisionReservation } from "../policies/state.ts";
import type {
  ArtifactObjectMetadata,
  ArtifactObjectRef,
  ArtifactStore,
} from "../ports/artifact-store.ts";
import type { CatalogCommit, CatalogStore } from "../ports/catalog-store.ts";
import type {
  AdvanceReservationRequest,
  PublishSnapshotRequest,
  ReserveRevisionRequest,
  RevisionCoordinator,
} from "../ports/revision-coordinator.ts";
import type {
  SourceCaptureRepresentation,
  SourceChangeSet,
  SourceCursor,
  SourceItemDescriptor,
  WorkspaceSourceAdapter,
  WorkspaceSourceRequest,
} from "../ports/workspace-source.ts";
import { failure, success } from "../result.ts";
import type { RevisionReservation, WorkspaceSnapshot } from "../schemas/index.ts";

function scopedKey(scope: TenantScope, suffix: string): string {
  return `${scope.tenantId}/${scope.clientId}/${scope.projectId}/${suffix}`;
}

function verifyScope(expected: TenantScope, actual: TenantScope) {
  return assertTenantScope(expected, actual);
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entryValue]) => `${JSON.stringify(key)}:${canonicalJson(entryValue)}`);
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value);
}

export interface MemorySourceItem {
  readonly descriptor: SourceItemDescriptor;
  readonly capture: SourceCaptureRepresentation;
}

export class MemoryWorkspaceSourceAdapter implements WorkspaceSourceAdapter {
  readonly provider = "memory";

  constructor(
    private readonly authoritativeScope: TenantScope,
    private readonly workspaceId: WorkspaceId,
    private readonly items: readonly MemorySourceItem[],
  ) {}

  async establishCursor(request: WorkspaceSourceRequest) {
    const checked = this.checkRequest(request);
    return checked ?? success({ value: "memory:0" } satisfies SourceCursor);
  }

  async listItems(request: WorkspaceSourceRequest) {
    const checked = this.checkRequest(request);
    return checked ?? success(this.items.map((item) => item.descriptor));
  }

  async readItem(
    request: WorkspaceSourceRequest & {
      readonly providerItemId: string;
      readonly expectedProviderVersion: string | null;
    },
  ) {
    const checked = this.checkRequest(request);
    if (checked) return checked;
    const item = this.items.find(
      (candidate) => candidate.descriptor.providerItemId === request.providerItemId,
    );
    if (!item || item.descriptor.providerVersion !== request.expectedProviderVersion) {
      return failure("PA_NOT_FOUND", "source item or expected provider version not found");
    }
    return success(item.capture);
  }

  async reconcileChanges(
    request: WorkspaceSourceRequest & { readonly after: SourceCursor },
  ) {
    const checked = this.checkRequest(request);
    return (
      checked ??
      success({
        cursor: { value: request.after.value === "memory:0" ? "memory:1" : request.after.value },
        changedProviderItemIds: [],
      } satisfies SourceChangeSet)
    );
  }

  private checkRequest(request: WorkspaceSourceRequest) {
    const scopeResult = verifyScope(this.authoritativeScope, request.scope);
    if (!scopeResult.ok) return scopeResult;
    return request.workspaceId === this.workspaceId
      ? undefined
      : failure("PA_NOT_FOUND", "workspace identity not found in authoritative scope");
  }
}

interface StoredArtifact {
  readonly bytes: Uint8Array;
  readonly metadata: ArtifactObjectMetadata;
  readonly quarantinedReason?: string;
}

export class MemoryArtifactStore implements ArtifactStore {
  private readonly objects = new Map<string, StoredArtifact>();

  constructor(private readonly authoritativeScope: TenantScope) {}

  async create(
    request: ArtifactObjectRef &
      ArtifactObjectMetadata & { readonly bytes: Uint8Array },
  ) {
    const checked = verifyScope(this.authoritativeScope, request.scope);
    if (!checked.ok) return checked;
    const key = scopedKey(request.scope, request.objectKey);
    if (this.objects.has(key)) {
      return failure("PA_ALREADY_EXISTS", "artifact object key is create-only");
    }
    const metadata = {
      contentSha256: request.contentSha256,
      byteSize: request.byteSize,
      mediaType: request.mediaType,
    };
    this.objects.set(key, { bytes: request.bytes.slice(), metadata });
    return success(metadata);
  }

  async head(request: ArtifactObjectRef) {
    const result = this.lookup(request);
    return result.ok ? success(result.value.metadata) : result;
  }

  async read(request: ArtifactObjectRef) {
    const result = this.lookup(request);
    return result.ok ? success(result.value.bytes.slice()) : result;
  }

  async quarantine(request: ArtifactObjectRef & { readonly reason: string }) {
    const result = this.lookup(request);
    if (!result.ok) return result;
    const key = scopedKey(request.scope, request.objectKey);
    this.objects.set(key, { ...result.value, quarantinedReason: request.reason });
    return success({ scope: request.scope, objectKey: request.objectKey });
  }

  private lookup(request: ArtifactObjectRef) {
    const checked = verifyScope(this.authoritativeScope, request.scope);
    if (!checked.ok) return checked;
    const stored = this.objects.get(scopedKey(request.scope, request.objectKey));
    return stored
      ? success(stored)
      : failure("PA_NOT_FOUND", "artifact object not found in authoritative scope");
  }
}

export class MemoryCatalogStore implements CatalogStore {
  private readonly commits = new Map<string, CatalogCommit>();
  private current: CatalogCommit | null = null;

  constructor(private readonly authoritativeScope: TenantScope) {}

  async appendCommit(commit: CatalogCommit) {
    const checked = verifyScope(this.authoritativeScope, commit.scope);
    if (!checked.ok) return checked;
    const existing = this.commits.get(commit.commitId);
    if (existing) {
      return canonicalJson(existing) === canonicalJson(commit)
        ? success(existing)
        : failure("PA_REVISION_CONFLICT", "commit id is already bound to other content");
    }
    if (commit.previousCommitId !== (this.current?.commitId ?? null)) {
      return failure("PA_REVISION_CONFLICT", "catalog predecessor is no longer current");
    }
    this.commits.set(commit.commitId, commit);
    this.current = commit;
    return success(commit);
  }

  async getCommit(request: TenantScope & { readonly commitId: string }) {
    const checked = verifyScope(this.authoritativeScope, request);
    if (!checked.ok) return checked;
    const commit = this.commits.get(request.commitId);
    return commit
      ? success(commit)
      : failure("PA_NOT_FOUND", "catalog commit not found in authoritative scope");
  }

  async getCurrentCommit(scope: TenantScope) {
    const checked = verifyScope(this.authoritativeScope, scope);
    return checked.ok ? success(this.current) : checked;
  }
}

export class MemoryRevisionCoordinator implements RevisionCoordinator {
  private readonly nextRevisionByArtifact = new Map<string, number>();
  private readonly reservationsById = new Map<string, RevisionReservation>();
  private readonly reservationsByOperation = new Map<string, RevisionReservation>();
  private currentSnapshot: WorkspaceSnapshot | null = null;

  constructor(private readonly authoritativeScope: TenantScope) {}

  async reserveRevision(request: ReserveRevisionRequest) {
    const checked = verifyScope(this.authoritativeScope, request.scope);
    if (!checked.ok) return checked;
    const operationKey = scopedKey(request.scope, `operation/${request.operationId}`);
    const existing = this.reservationsByOperation.get(operationKey);
    if (existing) {
      return existing.artifactId === request.artifactId
        ? success(existing)
        : failure("PA_REVISION_CONFLICT", "operation id is bound to another artifact");
    }
    const artifactKey = scopedKey(request.scope, `artifact/${request.artifactId}`);
    const revision = this.nextRevisionByArtifact.get(artifactKey) ?? 1;
    this.nextRevisionByArtifact.set(artifactKey, revision + 1);
    const reservation: RevisionReservation = {
      schema: "projektarchiv.revision-reservation@1",
      reservationId: request.reservationId,
      operationId: request.operationId,
      ...request.scope,
      artifactId: request.artifactId,
      revision,
      state: "reserved",
      createdAt: request.createdAt,
    };
    this.reservationsById.set(
      scopedKey(request.scope, `reservation/${request.reservationId}`),
      reservation,
    );
    this.reservationsByOperation.set(operationKey, reservation);
    return success(reservation);
  }

  async getReservationByOperation(
    request: TenantScope & { readonly operationId: string },
  ) {
    const checked = verifyScope(this.authoritativeScope, request);
    if (!checked.ok) return checked;
    return success(
      this.reservationsByOperation.get(
        scopedKey(request, `operation/${request.operationId}`),
      ) ?? null,
    );
  }

  async advanceReservation(request: AdvanceReservationRequest) {
    const checked = verifyScope(this.authoritativeScope, request.scope);
    if (!checked.ok) return checked;
    const key = scopedKey(request.scope, `reservation/${request.reservationId}`);
    const current = this.reservationsById.get(key);
    if (!current) return failure("PA_NOT_FOUND", "revision reservation not found");
    if (current.state !== request.expectedState) {
      return failure("PA_REVISION_CONFLICT", "reservation state changed concurrently");
    }
    const transitioned = transitionRevisionReservation(current.state, request.nextState);
    if (!transitioned.ok) return transitioned;
    const next: RevisionReservation = {
      ...current,
      state: request.nextState,
      updatedAt: request.updatedAt,
      contentSha256: request.contentSha256,
    };
    this.reservationsById.set(key, next);
    this.reservationsByOperation.set(
      scopedKey(request.scope, `operation/${current.operationId}`),
      next,
    );
    return success(next);
  }

  async publishSnapshot(request: PublishSnapshotRequest) {
    const checked = verifyScope(this.authoritativeScope, request.scope);
    if (!checked.ok) return checked;
    const snapshotScope = verifyScope(this.authoritativeScope, request.snapshot);
    if (!snapshotScope.ok) return snapshotScope;
    const currentId = this.currentSnapshot?.snapshotId ?? null;
    if (request.expectedPreviousSnapshotId !== currentId) {
      return failure("PA_REVISION_CONFLICT", "snapshot predecessor is no longer current");
    }
    this.currentSnapshot = request.snapshot;
    return success(request.snapshot);
  }

  async getCurrentSnapshot(scope: TenantScope) {
    const checked = verifyScope(this.authoritativeScope, scope);
    return checked.ok ? success(this.currentSnapshot) : checked;
  }
}
