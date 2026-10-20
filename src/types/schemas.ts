import { z } from "zod";

import { ROLES, SCOPE_STATUSES, TRADES } from "@/types/domain";

export const newProjectSchema = z.object({
  name: z.string().trim().min(3, "Enter a project name."),
  location: z.string().trim().min(3, "Enter a street address."),
  city: z.string().trim().min(2, "Enter a city."),
  trade: z.enum(TRADES, { errorMap: () => ({ message: "Choose a trade." }) }),
  gcId: z.string().min(1, "Choose a general contractor."),
  bidDueAt: z.string().min(1, "Choose a bid due date."),
  estimatedValue: z
    .number({ invalid_type_error: "Enter a number." })
    .positive("Estimated value must be greater than zero.")
    .nullable(),
  ownerId: z.string().min(1, "Choose an owner."),
});

export const scopeItemSchema = z.object({
  status: z.enum(SCOPE_STATUSES),
  riskNote: z.string().trim().max(500, "Keep the note under 500 characters."),
  aiFinding: z.string().trim().min(8, "Add a finding before saving."),
});

export const takeoffItemSchema = z.object({
  quantity: z
    .number({ invalid_type_error: "Enter a quantity." })
    .positive("Quantity must be greater than zero."),
  assumptions: z.string().trim().min(3, "Note the assumption."),
  exclusions: z.string().trim().min(3, "Note the exclusion, or write None."),
});

export const rfiSchema = z.object({
  question: z.string().trim().min(12, "Write the question the GC needs to answer."),
  reason: z.string().trim().min(8, "Explain why this needs clarification."),
});

export const directorySchema = z.object({
  name: z.string().trim().min(2, "Enter a company name."),
  city: z.string().trim().min(2, "Enter a city."),
  phone: z.string().trim().min(7, "Enter a phone number."),
  email: z.string().trim().email("Enter a valid email."),
  primaryContact: z.string().trim().min(2, "Enter a contact name."),
  notes: z.string().trim().max(600, "Keep notes under 600 characters."),
});

export const companySchema = z.object({
  name: z.string().trim().min(2, "Enter a workspace name."),
  legalName: z.string().trim().min(2, "Enter the legal name."),
  phone: z.string().trim().min(7, "Enter a phone number."),
  email: z.string().trim().email("Enter a valid email."),
});

export const locationSchema = z.object({
  homeBase: z.string().trim().min(3, "Enter the home base."),
  travelRadiusMiles: z
    .number({ invalid_type_error: "Enter a radius." })
    .int()
    .positive("Radius must be greater than zero.")
    .max(500, "Keep the radius under 500 miles."),
});

export const workspaceSchema = z.object({
  name: z.string().trim().min(2, "Enter a workspace name."),
  legalName: z.string().trim().min(2, "Enter the legal name."),
  homeBase: z.string().trim().min(3, "Enter the home base."),
  travelRadiusMiles: z
    .number({ invalid_type_error: "Enter a radius." })
    .int()
    .positive("Radius must be greater than zero.")
    .max(500, "Keep the radius under 500 miles."),
  phone: z.string().trim().min(7, "Enter a phone number."),
  email: z.string().trim().email("Enter a valid email."),
});

export const teamMemberSchema = z.object({
  name: z.string().trim().min(2, "Enter a name."),
  email: z.string().trim().email("Enter a valid email."),
  role: z.enum(ROLES),
  title: z.string().trim().min(2, "Enter a title."),
});

export const bidPriceSchema = z.object({
  bidPrice: z
    .number({ invalid_type_error: "Enter a bid price." })
    .positive("Bid price must be greater than zero."),
});

export type NewProjectFormValues = z.infer<typeof newProjectSchema>;
export type DirectoryFormValues = z.infer<typeof directorySchema>;
export type WorkspaceFormValues = z.infer<typeof workspaceSchema>;
export type CompanyFormValues = z.infer<typeof companySchema>;
export type LocationFormValues = z.infer<typeof locationSchema>;
