/*
<MODULE_CONTRACT>
<purpose>Enforce human authority requirements for legal fact acceptance and LegalHold activation decisions.</purpose>
<non-goals>
  <item>Do not authenticate actors or persist confirmation and legal-hold records.</item>
</non-goals>
</MODULE_CONTRACT>
<CHANGE_SUMMARY>
  <item>RFC-1001: add pure fail-closed authority decisions for protected transitions.</item>
</CHANGE_SUMMARY>
*/

import { failure, success, type DomainResult } from "../result.ts";

export type ActorKind = "human" | "ai";
export type AuthorityRole = "studio" | "customer" | "legal_authority";

export interface AuthorityActor {
  readonly actorId: string;
  readonly kind: ActorKind;
  readonly role: AuthorityRole;
}

export interface FactAcceptanceAuthority {
  readonly studioReviewed: boolean;
  readonly customerConfirmed: boolean;
  readonly actor: AuthorityActor;
}

export function authorizeFactAcceptance(
  authority: FactAcceptanceAuthority,
): DomainResult<true, "PA_AUTHORITY_DENIED"> {
  if (
    authority.actor.kind !== "human" ||
    authority.actor.role !== "studio" ||
    !authority.studioReviewed ||
    !authority.customerConfirmed
  ) {
    return failure(
      "PA_AUTHORITY_DENIED",
      "fact acceptance requires human Studio review and Customer confirmation",
    );
  }
  return success(true);
}

export function authorizeLegalHoldActivation(
  actor: AuthorityActor,
): DomainResult<true, "PA_AUTHORITY_DENIED"> {
  if (actor.kind !== "human" || actor.role !== "legal_authority") {
    return failure(
      "PA_AUTHORITY_DENIED",
      "LegalHold activation requires an authorized human legal authority",
    );
  }
  return success(true);
}
