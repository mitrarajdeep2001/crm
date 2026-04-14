import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberDevice: z.boolean().optional(),
});

export const createLeadSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  status: z.enum(["new_lead", "qualified", "in_progress", "lost", "converted"]).default("new_lead"),
  source: z.enum(["linkedin_ads", "direct_referral", "conference", "webinar", "organic_search", "cold_outreach", "partner", "other"]).default("other"),
  assignedToId: z.number().optional(),
  projectedValue: z.string().optional(),
  timezone: z.string().optional(),
  notes: z.string().optional(),
});

export const updateLeadSchema = createLeadSchema.partial();

export const createDealSchema = z.object({
  title: z.string().min(1, "Title is required"),
  company: z.string().optional(),
  value: z.string().min(1, "Value is required"),
  stage: z.enum(["lead", "qualified", "proposal", "negotiation", "won", "lost"]).default("lead"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  assignedToId: z.number().optional(),
  leadId: z.number().optional(),
  description: z.string().optional(),
  closingDate: z.string().optional(),
});

export const updateDealSchema = createDealSchema.partial();

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  status: z.enum(["to_do", "in_progress", "completed", "cancelled"]).default("to_do"),
  assignedToId: z.number().optional(),
  leadId: z.number().optional(),
  dealId: z.number().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type CreateDealInput = z.infer<typeof createDealSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
