/*
<MODULE_CONTRACT>
<purpose>Provide exhaustive fail-closed transition policies for canonical Projektarchiv lifecycle state machines.</purpose>
<non-goals>
  <item>Do not persist transitions, emit events, or perform workflow orchestration.</item>
</non-goals>
</MODULE_CONTRACT>
<CHANGE_SUMMARY>
  <item>RFC-1001: add pure CaptureRun, reservation, fact, project, and LegalHold transition laws.</item>
</CHANGE_SUMMARY>
*/

import type {
  CaptureRunState,
  FactRevisionState,
  Project,
  RevisionReservationState,
} from "../schemas/index.ts";
import { failure, success, type DomainResult } from "../result.ts";

export type ProjectState = Project["status"];
export type LegalHoldLifecycleState = "proposed" | "active" | "released" | "expired";

type TransitionMap<State extends string> = Readonly<Record<State, readonly State[]>>;

const captureRunTransitions: TransitionMap<CaptureRunState> = {
  requested: ["scanning", "retryable_failed", "terminal_failed"],
  scanning: ["capturing", "retryable_failed", "terminal_failed"],
  capturing: ["reconciling_changes", "retryable_failed", "terminal_failed"],
  reconciling_changes: ["capturing", "committing", "retryable_failed"],
  committing: ["committed", "retryable_failed", "terminal_failed"],
  committed: [],
  retryable_failed: ["scanning"],
  terminal_failed: [],
};

const reservationTransitions: TransitionMap<RevisionReservationState> = {
  reserved: ["uploading", "abandoned"],
  uploading: ["uploaded", "abandoned", "quarantined"],
  uploaded: ["committing", "orphaned", "quarantined"],
  committing: ["committed", "orphaned", "quarantined"],
  committed: [],
  abandoned: [],
  orphaned: [],
  quarantined: [],
};

const factRevisionTransitions: TransitionMap<FactRevisionState> = {
  extracted: ["reviewed", "rejected"],
  proposed_inherited: ["reviewed", "rejected"],
  reviewed: ["accepted", "rejected"],
  accepted: ["superseded"],
  rejected: [],
  superseded: [],
};

const projectTransitions: TransitionMap<ProjectState> = {
  active: ["closing"],
  closing: ["retention"],
  retention: ["erased"],
  erased: [],
};

const legalHoldTransitions: TransitionMap<LegalHoldLifecycleState> = {
  proposed: ["active"],
  active: ["released", "expired"],
  released: [],
  expired: [],
};

function transition<State extends string>(
  transitions: TransitionMap<State>,
  from: State,
  to: State,
): DomainResult<State, "PA_INVALID_STATE_TRANSITION"> {
  return transitions[from].includes(to)
    ? success(to)
    : failure("PA_INVALID_STATE_TRANSITION", `transition ${from} -> ${to} is not allowed`);
}

export const transitionCaptureRun = (from: CaptureRunState, to: CaptureRunState) =>
  transition(captureRunTransitions, from, to);

export const transitionRevisionReservation = (
  from: RevisionReservationState,
  to: RevisionReservationState,
) => transition(reservationTransitions, from, to);

export const transitionFactRevision = (from: FactRevisionState, to: FactRevisionState) =>
  transition(factRevisionTransitions, from, to);

export const transitionProject = (from: ProjectState, to: ProjectState) =>
  transition(projectTransitions, from, to);

export const transitionLegalHold = (
  from: LegalHoldLifecycleState,
  to: LegalHoldLifecycleState,
) => transition(legalHoldTransitions, from, to);

export const STATE_VALUES = {
  captureRun: Object.freeze(Object.keys(captureRunTransitions) as CaptureRunState[]),
  reservation: Object.freeze(
    Object.keys(reservationTransitions) as RevisionReservationState[],
  ),
  factRevision: Object.freeze(Object.keys(factRevisionTransitions) as FactRevisionState[]),
  project: Object.freeze(Object.keys(projectTransitions) as ProjectState[]),
  legalHold: Object.freeze(
    Object.keys(legalHoldTransitions) as LegalHoldLifecycleState[],
  ),
} as const;
