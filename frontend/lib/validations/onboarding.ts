import { z } from "zod";

// Special response tokens for fields where users lack immediate data
export const SPECIAL_RESPONSE_VALUES = [
  "UNKNOWN",
  "NOT_YET_AVAILABLE",
  "NOT_APPLICABLE",
] as const;

export type SpecialResponseValue = (typeof SPECIAL_RESPONSE_VALUES)[number];

export const specialResponseSchema = z.enum(SPECIAL_RESPONSE_VALUES);

// Helper for strings that can either be valid or a special response type
export const stringOrSpecial = (baseSchema: z.ZodString) =>
  z.union([baseSchema, specialResponseSchema]);

export const optionalStringOrSpecial = (baseSchema: z.ZodString) =>
  z.union([baseSchema, specialResponseSchema, z.literal(""), z.undefined()]);

// Canonical roles supported across GroundUp onboarding
export const ONBOARDING_ROLES = [
  "OWNER",
  "CFO",
  "PROJECT_MANAGER",
  "INVESTOR",
  "GC_FIXED",
  "GC_DAILY",
] as const;

export const onboardingRoleSchema = z.enum(ONBOARDING_ROLES);
export type OnboardingRole = z.infer<typeof onboardingRoleSchema>;

// Step 1: Work Email & Verification
export const step1EmailSchema = z.object({
  workEmail: z
    .string()
    .min(1, "Please enter a valid work email address")
    .email("Please enter a valid work email address"),
  isEmailVerified: z.boolean().default(false),
  emailOtpCode: z.array(z.string()).optional(),
});

export type Step1EmailInput = z.infer<typeof step1EmailSchema>;

// Step 2: Account Setup & Credentials
export const step2AccountSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  username: z
    .string()
    .trim()
    .refine(
      (val: string) => val === "" || val.replace(/^@/, "").length >= 3,
      "Username must be at least 3 characters"
    )
    .optional(),
  dob: z
    .union([
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
      z.literal(""),
      specialResponseSchema,
    ])
    .optional(),
  countryCode: z.string().default("+1"),
  phoneNumber: z
    .union([z.string(), specialResponseSchema, z.literal("")])
    .optional(),
  isPhoneVerified: z.boolean().default(false),
});

export type Step2AccountInput = z.infer<typeof step2AccountSchema>;

// Step 3: Challenges & Strategic Focus
export const step3ChallengeSchema = z.object({
  projectStatus: z.enum(["active", "new"]).default("active"),
  primaryFocus: z.string().min(1, "Please select your primary operational focus"),
  secondaryFocuses: z.array(z.string()).default([]),
});

export type Step3ChallengeInput = z.infer<typeof step3ChallengeSchema>;

// Step 4: Organization Details
export const step4OrganizationSchema = z.object({
  orgName: z.union([
    z.string().trim().min(1, "Please enter your organization name"),
    specialResponseSchema,
  ]),
  orgSize: z.union([
    z.enum(["Small", "Medium", "Large"]),
    specialResponseSchema,
  ]).default("Small"),
  teamSizeChoice: z.string().default("1-5"),
  employeeCount: z.union([z.number().int().nonnegative(), specialResponseSchema]).default(3),
  website: z.union([z.string().trim(), specialResponseSchema, z.literal("")]).optional(),
});

export type Step4OrganizationInput = z.infer<typeof step4OrganizationSchema>;

// Step 5: First Project Setup
export const step5ProjectSchema = z.object({
  skippedProject: z.boolean().default(false),
  projectName: z.union([
    z.string().trim().min(1, "Please enter a project name"),
    specialResponseSchema,
  ]),
  projectEntity: z.union([
    z.string().trim().min(1, "Legal ownership entity is required"),
    specialResponseSchema,
    z.literal(""),
  ]).optional(),
  assetType: z.enum(["SINGLE_FAMILY", "TWO_FAMILY", "MULTIFAMILY", "MIXED_USE", "SUBDIVISION"]).default("SINGLE_FAMILY"),
  projectAddress: z.union([
    z.string().trim(),
    specialResponseSchema,
    z.literal(""),
  ]).optional(),
  projectStage: z.union([
    z.string().min(1, "Project stage is required"),
    specialResponseSchema,
  ]).default("Under construction"),
  startedAt: z.union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    z.literal(""),
    specialResponseSchema,
  ]).optional(),
  targetDate: z.union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    z.literal(""),
    specialResponseSchema,
  ]).optional(),
  targetBudget: z.union([
    z.number().nonnegative(),
    z.string(),
    specialResponseSchema,
  ]).optional(),
  isAcquired: z.enum(["true", "false"]).default("true"),
  acquisitionFunding: z.enum(["CASH_EQUITY", "ACQUISITION_LOAN", "BANK_LOAN", "SELF_FUNDED", "EQUITY", "SELLER_FINANCING", "OTHER"]).default("ACQUISITION_LOAN"),
  acquisitionDate: z.union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    z.literal(""),
    specialResponseSchema,
  ]).optional(),
  hasConstructionLoan: z.enum(["true", "false"]).default("true"),
  lenderName: z.string().optional(),
  contractModel: z.enum(["FIXED", "DAILY", "COST_PLUS", "GMP", "FIXED_PRICE", "MILESTONE_BASED", "OPEN_BOOK", "HYBRID"]).default("FIXED"),
  hybridCustomDetails: z.string().optional(),
  operatingAccountModel: z.enum(["DEDICATED", "SHARED"]).default("DEDICATED"),
  phase: z.enum([
    "PRE_ACQUISITION",
    "ACQUISITION",
    "PERMITTING",
    "ACTIVE_CONSTRUCTION",
    "POST_CONSTRUCTION",
  ]).optional(),
  permitStatus: z.enum(["PERMIT_APPROVED", "PERMIT_PENDING", "NOT_YET_APPLIED"]).optional(),
  budgetSheetStatus: z.enum(["BUDGET_READY", "BUDGET_IN_PROGRESS"]).optional(),
  dueDiligenceStatus: z.enum(["LOI_NEGOTIATION", "PSA_SIGNED", "FEASIBILITY_STUDY"]).optional(),
  targetPurchasePrice: z.union([z.string(), z.number()]).optional(),
  postConstructionStatus: z.enum(["COMMISSIONING", "HANDOVER_WARRANTY"]).optional(),
  unitPriceDecided: z.enum(["YES", "NO"]).optional(),
  totalUnits: z.union([z.number(), z.string()]).optional(),
  total_units: z.union([z.number(), z.string()]).optional(),
  unitPrices: z.record(z.string()).optional(),
  unit_prices: z.record(z.string()).optional(),
  targetUnitPrice: z.string().optional(),
});

export type Step5ProjectInput = z.infer<typeof step5ProjectSchema>;

// Step 6: Project Records & Document Types
export const intakeDocumentSchema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.number(),
  type: z.string(),
  status: z.enum(["uploading", "processing", "ready", "verified"]),
  category: z.string().optional(),
});

export const step6RecordsSchema = z.object({
  selectedDocTypes: z.array(z.string()).min(1, "Please select at least one document type or choose 'Not ready yet'"),
  documentsList: z.array(intakeDocumentSchema).default([]),
});

export type Step6RecordsInput = z.infer<typeof step6RecordsSchema>;

// Step 7: Team Collaborator Invitations
export const teamMemberInviteSchema = z.object({
  email: z.string().email("Invalid team member email"),
  role: z.string().min(1, "Role is required"),
});

export const step7TeamSchema = z.object({
  teamList: z.array(teamMemberInviteSchema).default([]),
});

export type Step7TeamInput = z.infer<typeof step7TeamSchema>;

// Full Master Onboarding Submission Schema
export const onboardingSubmissionSchema = z.object({
  userId: z.string(),
  step: z.number().int().min(1).max(8).default(8),
  answers: z.object({
    workEmail: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    username: z.string().optional(),
    dob: z.string().optional(),
    emailVerified: z.boolean().default(false),
    phoneNumber: z.string().optional(),
    phoneVerified: z.boolean().default(false),
    projectStatus: z.enum(["active", "new"]).default("active"),
    primaryFocus: z.string().min(1),
    primaryChallenge: z.string().optional(),
    secondaryFocuses: z.array(z.string()).default([]),
    secondaryChallenges: z.array(z.string()).default([]),
    organizationName: z.string().min(1),
    organizationSize: z.string().default("Small"),
    employeeCount: z.number().default(3),
    website: z.string().optional(),
    projectName: z.string().min(1),
    projectEntity: z.string().optional(),
    assetType: z.string().optional(),
    startedAt: z.string().optional(),
    isAcquired: z.string().optional(),
    acquisitionFunding: z.string().optional(),
    acquisitionDate: z.string().optional(),
    hasConstructionLoan: z.string().optional(),
    lenderName: z.string().optional(),
    contractModel: z.string().optional(),
    hybridCustomDetails: z.string().optional(),
    operatingAccountModel: z.string().optional(),
    phase: z.string().optional(),
    permitStatus: z.string().optional(),
    budgetSheetStatus: z.string().optional(),
    dueDiligenceStatus: z.string().optional(),
    targetPurchasePrice: z.union([z.string(), z.number()]).optional(),
    postConstructionStatus: z.string().optional(),
    unitPriceDecided: z.string().optional(),
    totalUnits: z.union([z.number(), z.string()]).optional(),
    total_units: z.union([z.number(), z.string()]).optional(),
    unitPrices: z.record(z.string()).optional(),
    unit_prices: z.record(z.string()).optional(),
    targetUnitPrice: z.string().optional(),
    projectAddress: z.string().optional(),
    projectStage: z.string().default("Under construction"),
    targetCompletionDate: z.string().optional(),
    targetBudget: z.union([z.number(), z.string()]).optional(),
    selectedDocumentTypes: z.array(z.string()).default([]),
    uploadedDocuments: z.array(intakeDocumentSchema).default([]),
    teamInvitations: z.array(teamMemberInviteSchema).default([]),
  }),
});

export type OnboardingSubmissionPayload = z.infer<typeof onboardingSubmissionSchema>;

// Map of Step Number to Validation Schema
export const STEP_SCHEMAS = {
  1: step1EmailSchema,
  2: step2AccountSchema,
  3: step3ChallengeSchema,
  4: step4OrganizationSchema,
  5: step5ProjectSchema,
  6: step6RecordsSchema,
  7: step7TeamSchema,
} as const;
