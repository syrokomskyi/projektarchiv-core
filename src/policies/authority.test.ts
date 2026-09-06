// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
  authorizeFactAcceptance,
  authorizeLegalHoldActivation,
  type AuthorityActor,
} from "./authority.ts";

const humanStudio: AuthorityActor = {
  actorId: "actor-1",
  kind: "human",
  role: "studio",
};

const humanLegalAuthority: AuthorityActor = {
  actorId: "actor-2",
  kind: "human",
  role: "legal_authority",
};

describe("authorizeFactAcceptance", () => {
  it("approves when human studio reviewed and customer confirmed", () => {
    const result = authorizeFactAcceptance({
      studioReviewed: true,
      customerConfirmed: true,
      actor: humanStudio,
    });
    expect(result.ok).toBe(true);
  });

  it("denies when actor is AI", () => {
    const result = authorizeFactAcceptance({
      studioReviewed: true,
      customerConfirmed: true,
      actor: { ...humanStudio, kind: "ai" },
    });
    expect(result.ok).toBe(false);
  });

  it("denies when studioReviewed is false", () => {
    const result = authorizeFactAcceptance({
      studioReviewed: false,
      customerConfirmed: true,
      actor: humanStudio,
    });
    expect(result.ok).toBe(false);
  });

  it("denies when customerConfirmed is false", () => {
    const result = authorizeFactAcceptance({
      studioReviewed: true,
      customerConfirmed: false,
      actor: humanStudio,
    });
    expect(result.ok).toBe(false);
  });
});

describe("authorizeLegalHoldActivation", () => {
  it("approves when actor is human legal_authority", () => {
    const result = authorizeLegalHoldActivation(humanLegalAuthority);
    expect(result.ok).toBe(true);
  });

  it("denies when actor is AI", () => {
    const result = authorizeLegalHoldActivation({
      ...humanLegalAuthority,
      kind: "ai",
    });
    expect(result.ok).toBe(false);
  });

  it("denies when actor role is studio", () => {
    const result = authorizeLegalHoldActivation(humanStudio);
    expect(result.ok).toBe(false);
  });
});
