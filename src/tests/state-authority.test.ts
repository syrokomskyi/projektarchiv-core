// @vitest-environment node

import { describe, expect, it } from "vitest";

import { authorizeFactAcceptance, authorizeLegalHoldActivation } from "../policies/authority.ts";
import {
  STATE_VALUES,
  transitionCaptureRun,
  transitionFactRevision,
  transitionLegalHold,
  transitionProject,
  transitionRevisionReservation,
} from "../policies/state.ts";

describe("state and authority policies", () => {
  it("accepts canonical forward transitions", () => {
    expect(transitionCaptureRun("requested", "scanning").ok).toBe(true);
    expect(transitionRevisionReservation("reserved", "uploading").ok).toBe(true);
    expect(transitionFactRevision("reviewed", "accepted").ok).toBe(true);
    expect(transitionProject("retention", "erased").ok).toBe(true);
    expect(transitionLegalHold("proposed", "active").ok).toBe(true);
  });

  it("fails closed for every self-transition", () => {
    const results = [
      ...STATE_VALUES.captureRun.map((state) => transitionCaptureRun(state, state)),
      ...STATE_VALUES.reservation.map((state) => transitionRevisionReservation(state, state)),
      ...STATE_VALUES.factRevision.map((state) => transitionFactRevision(state, state)),
      ...STATE_VALUES.project.map((state) => transitionProject(state, state)),
      ...STATE_VALUES.legalHold.map((state) => transitionLegalHold(state, state)),
    ];
    expect(results.every((result) => !result.ok)).toBe(true);
  });

  it("rejects unauthorized authority transitions", () => {
    expect(
      authorizeFactAcceptance({
        studioReviewed: true,
        customerConfirmed: true,
        actor: { actorId: "ai-1", kind: "ai", role: "studio" },
      }),
    ).toEqual(expect.objectContaining({ code: "PA_AUTHORITY_DENIED" }));
    expect(
      authorizeLegalHoldActivation({
        actorId: "ai-1",
        kind: "ai",
        role: "legal_authority",
      }),
    ).toEqual(expect.objectContaining({ code: "PA_AUTHORITY_DENIED" }));
  });

  it("permits only complete human authority evidence", () => {
    expect(
      authorizeFactAcceptance({
        studioReviewed: true,
        customerConfirmed: true,
        actor: { actorId: "studio-1", kind: "human", role: "studio" },
      }).ok,
    ).toBe(true);
    expect(
      authorizeLegalHoldActivation({
        actorId: "legal-1",
        kind: "human",
        role: "legal_authority",
      }).ok,
    ).toBe(true);
  });
});
