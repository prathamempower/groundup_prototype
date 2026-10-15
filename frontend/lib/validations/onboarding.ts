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
  "DEVELOPER",
  "FINANCE_LEAD",
  "ACCOUNTANT",
  "PM",
  "GC",
  "INVESTOR",
  "PARTNER",
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
  projectAddress: z.union([
    z.string().trim(),
    specialResponseSchema,
    z.literal(""),
  ]).optional(),
  projectStage: z.union([
    z.string().min(1, "Project stage is required"),
    specialResponseSchema,
  ]).default("Under construction"),
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
