/*
<MODULE_CONTRACT>
<purpose>Define atomic revision reservation and snapshot compare-and-set coordination without transaction callbacks or external I/O.</purpose>
<non-goals>
  <item>Do not expose a broad lock, callback transaction, storage upload, or catalog commit operation.</item>
</non-goals>
</MODULE_CONTRACT>
<CHANGE_SUMMARY>
  <item>RFC-1001: add the provider-neutral RevisionCoordinator port.</item>
</CHANGE_SUMMARY>
*/

import type {
  ArtifactId,
  ReservationId,
  SnapshotId,
  TenantScope,
} from "../identities.ts";
import type { DomainResult } from "../result.ts";
import type {
  RevisionReservation,
  RevisionReservationState,
  WorkspaceSnapshot,
} from "../schemas/index.ts";

type CoordinatorResult<Value> = Promise<
  DomainResult<
    Value,
    | "PA_SCOPE_MISMATCH"
    | "PA_REVISION_CONFLICT"
    | "PA_INVALID_STATE_TRANSITION"
    | "PA_NOT_FOUND"
    | "PA_UNAVAILABLE"
  >
>;

export interface ReserveRevisionRequest {
  readonly scope: TenantScope;
  readonly artifactId: ArtifactId;
  readonly reservationId: ReservationId;
  readonly operationId: string;
  readonly createdAt: string;
}

export interface AdvanceReservationRequest {
  readonly scope: TenantScope;
  readonly reservationId: ReservationId;
  readonly expectedState: RevisionReservationState;
  readonly nextState: RevisionReservationState;
  readonly updatedAt: string;
  readonly contentSha256?: string | null;
}

export interface PublishSnapshotRequest {
  readonly scope: TenantScope;
  readonly expectedPreviousSnapshotId: SnapshotId | null;
  readonly snapshot: WorkspaceSnapshot;
}

export interface RevisionCoordinator {
  reserveRevision(request: ReserveRevisionRequest): CoordinatorResult<RevisionReservation>;
  getReservationByOperation(
    request: TenantScope & { readonly operationId: string },
  ): CoordinatorResult<RevisionReservation | null>;
  advanceReservation(
    request: AdvanceReservationRequest,
  ): CoordinatorResult<RevisionReservation>;
  publishSnapshot(request: PublishSnapshotRequest): CoordinatorResult<WorkspaceSnapshot>;
  getCurrentSnapshot(scope: TenantScope): CoordinatorResult<WorkspaceSnapshot | null>;
}
