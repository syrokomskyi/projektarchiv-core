// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
  transitionCaptureRun,
  transitionFactRevision,
  transitionLegalHold,
  transitionProject,
  transitionRevisionReservation,
  STATE_VALUES,
} from "./state.ts";

describe("transitionCaptureRun", () => {
  it("allows requested -> scanning", () => {
    expect(transitionCaptureRun("requested", "scanning").ok).toBe(true);
  });

  it("blocks committed -> requested (terminal state)", () => {
    expect(transitionCaptureRun("committed", "requested").ok).toBe(false);
  });

  it("blocks terminal_failed -> requested (terminal state)", () => {
    expect(transitionCaptureRun("terminal_failed", "requested").ok).toBe(false);
  });

  it("allows retryable_failed -> scanning (retry)", () => {
    expect(transitionCaptureRun("retryable_failed", "scanning").ok).toBe(true);
  });
});

describe("transitionRevisionReservation", () => {
  it("allows reserved -> uploading", () => {
    expect(transitionRevisionReservation("reserved", "uploading").ok).toBe(true);
  });

  it("blocks committed -> uploading (terminal)", () => {
    expect(transitionRevisionReservation("committed", "uploading").ok).toBe(false);
  });
});

describe("transitionFactRevision", () => {
  it("allows extracted -> reviewed", () => {
    expect(transitionFactRevision("extracted", "reviewed").ok).toBe(true);
  });

  it("blocks rejected -> reviewed (terminal)", () => {
    expect(transitionFactRevision("rejected", "reviewed").ok).toBe(false);
  });
});

describe("transitionProject", () => {
  it("allows active -> closing", () => {
    expect(transitionProject("active", "closing").ok).toBe(true);
  });

  it("blocks erased -> active (terminal)", () => {
    expect(transitionProject("erased", "active").ok).toBe(false);
  });
});

describe("transitionLegalHold", () => {
  it("allows proposed -> active", () => {
    expect(transitionLegalHold("proposed", "active").ok).toBe(true);
  });

  it("blocks released -> active (terminal)", () => {
    expect(transitionLegalHold("released", "active").ok).toBe(false);
  });
});

describe("STATE_VALUES", () => {
  it("exposes all capture run states", () => {
    expect(STATE_VALUES.captureRun).toContain("requested");
    expect(STATE_VALUES.captureRun).toContain("committed");
  });

  it("exposes all project states", () => {
    expect(STATE_VALUES.project).toContain("active");
    expect(STATE_VALUES.project).toContain("erased");
  });
});
