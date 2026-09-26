/*
<MODULE_CONTRACT>
<purpose>Define stable discriminated success and failure results shared by portable Projektarchiv policies and ports.</purpose>
<non-goals>
  <item>Do not expose raw provider exceptions or runtime-specific error objects.</item>
</non-goals>
</MODULE_CONTRACT>
<CHANGE_SUMMARY>
  <item>RFC-1001: add provider-neutral domain result and failure contracts.</item>
</CHANGE_SUMMARY>
*/

export type ProjektarchivErrorCode =
  | "PA_SCOPE_MISMATCH"
  | "PA_IDENTITY_COLLISION"
  | "PA_INVALID_STATE_TRANSITION"
  | "PA_AUTHORITY_DENIED"
  | "PA_ALREADY_EXISTS"
  | "PA_REVISION_CONFLICT"
  | "PA_NOT_FOUND"
  | "PA_UNAVAILABLE";

export interface DomainFailure<Code extends ProjektarchivErrorCode = ProjektarchivErrorCode> {
  readonly ok: false;
  readonly code: Code;
  readonly detail: string;
}

export interface DomainSuccess<Value> {
  readonly ok: true;
  readonly value: Value;
}

export type DomainResult<Value, Code extends ProjektarchivErrorCode = ProjektarchivErrorCode> =
  DomainSuccess<Value> | DomainFailure<Code>;

export function success<Value>(value: Value): DomainSuccess<Value> {
  return { ok: true, value };
}

export function failure<Code extends ProjektarchivErrorCode>(
  code: Code,
  detail: string,
): DomainFailure<Code> {
  return { ok: false, code, detail };
}
