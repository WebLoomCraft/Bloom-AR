/**
 * Claim status-transition authorization for the *generic* claim update
 * endpoint (PATCH /api/claims/[id]).
 *
 * Review outcomes (approve / rework / paid / closed after review) may only be
 * produced by the dedicated review endpoints (/review, /workflow), which
 * enforce reviewer roles and the no-self-approval rule. Before this module
 * existed, the generic PATCH accepted `status: "approved"` from any user who
 * could touch the claim — including the assignee approving their own work —
 * and stamped `approvedBy` with the caller's id.
 *
 * This module is pure (no DB) so the transition policy is unit-testable.
 */

export const CLAIM_STATUSES = [
  'new',
  'assigned',
  'in_progress',
  'pending',
  'submitted_for_review',
  'approved',
  'rework_required',
  'paid',
  'denied',
  'closed',
  'sent_to_coding',
  'coding_review',
  'coding_corrected',
  'returned_to_billing',
  'resubmitted',
] as const;

export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

/** Statuses that only dedicated review/coding endpoints may produce. */
export const REVIEW_ONLY_STATUSES: ReadonlySet<string> = new Set([
  'approved',
  'rework_required',
  'paid',
  'closed',
  'sent_to_coding',
  'coding_review',
  'coding_corrected',
  'returned_to_billing',
  'resubmitted',
]);

/** Allowed generic-PATCH transitions: from → set of reachable statuses. */
const GENERIC_TRANSITIONS: Record<string, ReadonlySet<string>> = {
  new: new Set(['assigned', 'in_progress', 'pending', 'denied', 'submitted_for_review']),
  assigned: new Set(['in_progress', 'pending', 'denied', 'submitted_for_review']),
  in_progress: new Set(['pending', 'denied', 'submitted_for_review']),
  pending: new Set(['in_progress', 'denied', 'submitted_for_review']),
  submitted_for_review: new Set([]), // review endpoints own this state
  rework_required: new Set(['in_progress', 'submitted_for_review']),
  denied: new Set(['in_progress', 'submitted_for_review']),
  approved: new Set([]),
  paid: new Set([]),
  closed: new Set([]),
  sent_to_coding: new Set([]),
  coding_review: new Set([]),
  coding_corrected: new Set(['resubmitted']),
  returned_to_billing: new Set(['in_progress', 'submitted_for_review']),
  resubmitted: new Set(['in_progress', 'pending']),
};

export type GenericTransitionVerdict =
  | { allowed: true }
  | { allowed: false; status: 400 | 403; error: string };

/**
 * Decide whether a generic claim update may move `from` → `to`.
 * Same-status is a no-op and always allowed (field-only edits).
 */
export function evaluateGenericClaimStatusTransition(
  from: string,
  to: unknown
): GenericTransitionVerdict {
  if (typeof to !== 'string' || !(CLAIM_STATUSES as readonly string[]).includes(to)) {
    return { allowed: false, status: 400, error: 'Invalid claim status.' };
  }
  if (to === from) return { allowed: true };
  if (REVIEW_ONLY_STATUSES.has(to)) {
    return {
      allowed: false,
      status: 403,
      error:
        'This status can only be set through the review workflow by an authorized reviewer. Use the claim review endpoint.',
    };
  }
  const reachable = GENERIC_TRANSITIONS[from];
  if (!reachable || !reachable.has(to)) {
    return {
      allowed: false,
      status: 400,
      error: `Claim status cannot move from "${from}" to "${to}" here.`,
    };
  }
  return { allowed: true };
}

/** Body fields a generic claim update must never accept from the client. */
export const PROTECTED_CLAIM_FIELDS = [
  'approvedBy',
  'approvedAt',
  'reviewedBy',
  'reviewedAt',
  'reviewComments',
  'organizationId',
  'assignedBy',
  'workedBy',
  'workedDate',
  'submittedForApprovalAt',
  'reworkCount',
] as const;

export function findProtectedClaimFields(body: Record<string, unknown>): string[] {
  return PROTECTED_CLAIM_FIELDS.filter((f) => f in body);
}

export const CLAIM_PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const;
