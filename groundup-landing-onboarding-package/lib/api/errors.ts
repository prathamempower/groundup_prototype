/**
 * GroundUp AI API Error Definitions & User-Facing Error Mappings
 * Matches error envelopes and standard codes in api_spec.md
 */

export type ApiErrorCode =
  | "INTERNAL_ERROR"
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "PERMISSION_DENIED"
  | "NOT_FOUND"
  | "VERSION_CONFLICT"
  | "RATE_LIMIT_EXCEEDED"
  | "CONTINGENCY_EXCEEDED"
  | "DRAW_NOT_FUNDABLE"
  | "PERIOD_LOCKED"
  | "DUPLICATE_RESOURCE"
  | "IMMUTABLE_RECORD"
  | "UNBALANCED_ALLOCATION"
  | "GATE_NOT_SATISFIED";

export interface ErrorDescriptor {
  title: string;
  message: string;
  actionHint?: string;
  isRetryable: boolean;
}

export const ERROR_MAPPINGS: Record<ApiErrorCode | string, ErrorDescriptor> = {
  VALIDATION_FAILED: {
    title: "Validation Failed",
    message: "One or more input fields failed schema or business rule validation.",
    actionHint: "Check the form values and try again.",
    isRetryable: false,
  },
  ALLOCATION_NOT_BALANCED: {
    title: "Unbalanced Allocation",
    message: "The sum of allocation line splits does not equal the transaction or draw total.",
    actionHint: "Verify individual line item amounts to ensure exact penny balance.",
    isRetryable: false,
  },
  INVALID_STATE_TRANSITION: {
    title: "Invalid Status Transition",
    message: "The requested state transition is not permitted from the current lifecycle state.",
    actionHint: "Review required prerequisite steps before updating status.",
    isRetryable: false,
  },
  UNAUTHENTICATED: {
    title: "Authentication Required",
    message: "Your session has expired or you are not signed in.",
    actionHint: "Sign in with your email and password to proceed.",
    isRetryable: true,
  },
  MFA_REQUIRED: {
    title: "Two-Factor Authentication Required",
    message: "Two-factor verification is required to complete this action.",
    actionHint: "Enter your 6-digit MFA verification code.",
    isRetryable: true,
  },
  STEP_UP_REQUIRED: {
    title: "Elevated Security Verification",
    message: "This sensitive financial action requires elevated credentials.",
    actionHint: "Re-authenticate to confirm this operation.",
    isRetryable: true,
  },
  FORBIDDEN: {
    title: "Permission Denied",
    message: "Your current role does not have authorization to perform this operation.",
    actionHint: "Contact an organization Owner to request elevated access.",
    isRetryable: false,
  },
  PROJECT_SCOPE_DENIED: {
    title: "Project Scope Restricted",
    message: "You are not a member of this project or your role does not grant project access.",
    actionHint: "Request project membership from the project Owner.",
    isRetryable: false,
  },
  READINESS_GATE_BLOCKED: {
    title: "Readiness Gate Blocked",
    message: "Outstanding prerequisite questions or delegated tasks remain unresolved.",
    actionHint: "Review and complete pending items in the Readiness workspace.",
    isRetryable: false,
  },
  NOT_FOUND: {
    title: "Resource Not Found",
    message: "The requested entity does not exist or is outside your organization scope.",
    actionHint: "Check the URL or return to the project dashboard.",
    isRetryable: false,
  },
  VERSION_CONFLICT: {
    title: "Concurrent Modification Conflict",
    message: "This record was updated by another team member while you were editing.",
    actionHint: "Refresh the page to retrieve the latest verified version.",
    isRetryable: true,
  },
  DUPLICATE_DOCUMENT: {
    title: "Duplicate Document",
    message: "A document with an identical SHA-256 fingerprint has already been uploaded.",
    actionHint: "View the existing document in the Documents register.",
    isRetryable: false,
  },
  ALREADY_APPROVED: {
    title: "Already Approved",
    message: "This record has already been approved and is locked against modification.",
    actionHint: "Submit a Change Order or adjustment to propose revisions.",
    isRetryable: false,
  },
  PERIOD_ALREADY_RECONCILED: {
    title: "Period Certified & Reconciled",
    message: "This statement period has already received sign-off and cannot be re-opened.",
    actionHint: "Contact the CFO to request a formal audit waiver.",
    isRetryable: false,
  },
  ACCOUNT_NOT_MAPPED: {
    title: "Account Not Mapped",
    message: "The financial account has not been approved or mapped to an active project.",
    actionHint: "Obtain Owner approval for the account mapping.",
    isRetryable: false,
  },
  COVERAGE_GAP: {
    title: "Statement Coverage Gap",
    message: "A date or balance gap exists between statement periods without an approved waiver.",
    actionHint: "Upload missing interim statements or request a CFO waiver.",
    isRetryable: false,
  },
  CONTINGENCY_EXCEEDED: {
    title: "Contingency Reserve Exceeded",
    message: "The requested contingency transfer exceeds available funds on Line 20-000.",
    actionHint: "Adjust the transfer amount or submit a Sponsor Equity change order.",
    isRetryable: false,
  },
  DRAW_NOT_FUNDABLE: {
    title: "Ineligible Draw Funding",
    message: "Draw funding can only be allocated from verified CLEARED bank transactions.",
    actionHint: "Ensure the bank deposit wire has cleared before allocating to draw lines.",
    isRetryable: false,
  },
  RATE_LIMITED: {
    title: "Rate Limit Reached",
    message: "Too many requests submitted. Please slow down.",
    actionHint: "Wait a moment before submitting again.",
    isRetryable: true,
  },
  INTERNAL_ERROR: {
    title: "System Exception",
    message: "An unexpected error occurred while processing your request.",
    actionHint: "Please try again or contact support if the issue persists.",
    isRetryable: true,
  },
  PROVIDER_UNAVAILABLE: {
    title: "Service Temporarily Unavailable",
    message: "An external provider or service dependency is currently unreachable.",
    actionHint: "Please retry in a few moments.",
    isRetryable: true,
  },
  // Aliases for backwards compatibility with test assertions
  VALIDATION_ERROR: {
    title: "Validation Failed",
    message: "One or more input fields failed schema or business rule validation.",
    actionHint: "Check the form values and try again.",
    isRetryable: false,
  },
  UNBALANCED_ALLOCATION: {
    title: "Unbalanced Allocation",
    message: "The sum of allocation line splits does not equal the transaction or draw total.",
    actionHint: "Verify individual line item amounts to ensure exact penny balance.",
    isRetryable: false,
  },
  UNAUTHORIZED: {
    title: "Authentication Required",
    message: "Your session has expired or you are not signed in.",
    actionHint: "Sign in with your email and password to proceed.",
    isRetryable: true,
  },
  PERMISSION_DENIED: {
    title: "Access Forbidden",
    message: "You do not have authorization to view or execute actions on this resource.",
    actionHint: "Switch to an authorized role or ask your administrator for access.",
    isRetryable: false,
  },
  RATE_LIMIT_EXCEEDED: {
    title: "Rate Limit Reached",
    message: "Too many requests submitted. Please slow down.",
    actionHint: "Wait a moment before submitting again.",
    isRetryable: true,
  },
  PERIOD_LOCKED: {
    title: "Statement Period Reconciled",
    message: "This statement period has already been reconciled and locked.",
    actionHint: "Post-closeout and reconciled items cannot be modified.",
    isRetryable: false,
  },
  GATE_NOT_SATISFIED: {
    title: "Readiness Gate Blocked",
    message: "Project setup prerequisites are incomplete. This action cannot proceed until gates pass.",
    actionHint: "Complete required onboarding questions and configuration sign-offs.",
    isRetryable: false,
  },
  IMMUTABLE_RECORD: {
    title: "Record Already Approved",
    message: "This record has already been approved and is immutable.",
    actionHint: "Approved baselines and change orders cannot be re-approved.",
    isRetryable: false,
  },
  DUPLICATE_RESOURCE: {
    title: "Duplicate Document Detected",
    message: "A file with matching contents (SHA-256) already exists in this project.",
    actionHint: "Verify if this file was previously uploaded.",
    isRetryable: false,
  },
};

export function getErrorDescriptor(code?: string, defaultMessage?: string): ErrorDescriptor {
  if (code && ERROR_MAPPINGS[code]) {
    return ERROR_MAPPINGS[code];
  }
  return {
    title: "Operation Failed",
    message: defaultMessage || "An error occurred while executing the requested action.",
    isRetryable: false,
  };
}
