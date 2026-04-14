import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  decimal,
  pgEnum,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "member", "read_only"]);
export const userStatusEnum = pgEnum("user_status", ["active", "pending", "inactive"]);

export const leadStatusEnum = pgEnum("lead_status", [
  "new_lead",
  "qualified",
  "in_progress",
  "lost",
  "converted",
]);

export const leadSourceEnum = pgEnum("lead_source", [
  "linkedin_ads",
  "direct_referral",
  "conference",
  "webinar",
  "organic_search",
  "cold_outreach",
  "partner",
  "other",
]);

export const dealStageEnum = pgEnum("deal_stage", [
  "lead",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
]);

export const dealPriorityEnum = pgEnum("deal_priority", ["low", "medium", "high"]);

export const taskPriorityEnum = pgEnum("task_priority", ["low", "medium", "high"]);

export const taskStatusEnum = pgEnum("task_status", [
  "to_do",
  "in_progress",
  "completed",
  "cancelled",
]);

export const activityTypeEnum = pgEnum("activity_type", [
  "email_sent",
  "email_received",
  "call_made",
  "call_received",
  "meeting_scheduled",
  "note_added",
  "lead_created",
  "lead_updated",
  "deal_created",
  "deal_stage_changed",
  "task_created",
  "task_completed",
  "inbound_form",
]);

// Tables
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: text("password"),
    avatar: text("avatar"),
    role: userRoleEnum("role").default("member").notNull(),
    status: userStatusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    lastActivity: timestamp("last_activity"),
  },
  (t) => ({
    emailIdx: index("users_email_idx").on(t.email),
  })
);

export const userPreferences = pgTable(
  "user_preferences",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().unique().references(() => users.id),
    emailNotifications: boolean("email_notifications").default(true).notNull(),
    desktopNotifications: boolean("desktop_notifications").default(false).notNull(),
    weeklyDigest: boolean("weekly_digest").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdIdx: index("user_preferences_user_id_idx").on(t.userId),
  })
);

export const leads = pgTable(
  "leads",
  {
    id: serial("id").primaryKey(),
    leadId: varchar("lead_id", { length: 20 }).notNull().unique(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 50 }),
    company: varchar("company", { length: 255 }),
    jobTitle: varchar("job_title", { length: 255 }),
    status: leadStatusEnum("status").default("new_lead").notNull(),
    source: leadSourceEnum("source").default("other").notNull(),
    assignedToId: integer("assigned_to_id").references(() => users.id),
    projectedValue: decimal("projected_value", { precision: 15, scale: 2 }),
    winProbability: integer("win_probability"),
    timezone: varchar("timezone", { length: 50 }),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    statusIdx: index("leads_status_idx").on(t.status),
    assignedToIdx: index("leads_assigned_to_idx").on(t.assignedToId),
    emailIdx: index("leads_email_idx").on(t.email),
    createdAtIdx: index("leads_created_at_idx").on(t.createdAt),
  })
);

export const deals = pgTable(
  "deals",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    company: varchar("company", { length: 255 }),
    value: decimal("value", { precision: 15, scale: 2 }).notNull(),
    stage: dealStageEnum("stage").default("lead").notNull(),
    priority: dealPriorityEnum("priority").default("medium").notNull(),
    assignedToId: integer("assigned_to_id").references(() => users.id),
    leadId: integer("lead_id").references(() => leads.id),
    description: text("description"),
    closingDate: timestamp("closing_date"),
    attachments: text("attachments").array(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    stageIdx: index("deals_stage_idx").on(t.stage),
    assignedToIdx: index("deals_assigned_to_idx").on(t.assignedToId),
    valueIdx: index("deals_value_idx").on(t.value),
  })
);

export const tasks = pgTable(
  "tasks",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    dueDate: timestamp("due_date"),
    priority: taskPriorityEnum("priority").default("medium").notNull(),
    status: taskStatusEnum("status").default("to_do").notNull(),
    assignedToId: integer("assigned_to_id").references(() => users.id),
    leadId: integer("lead_id").references(() => leads.id),
    dealId: integer("deal_id").references(() => deals.id),
    isCompleted: boolean("is_completed").default(false).notNull(),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    statusIdx: index("tasks_status_idx").on(t.status),
    dueDateIdx: index("tasks_due_date_idx").on(t.dueDate),
    assignedToIdx: index("tasks_assigned_to_idx").on(t.assignedToId),
  })
);

export const activities = pgTable(
  "activities",
  {
    id: serial("id").primaryKey(),
    type: activityTypeEnum("type").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    userId: integer("user_id").references(() => users.id),
    leadId: integer("lead_id").references(() => leads.id),
    dealId: integer("deal_id").references(() => deals.id),
    taskId: integer("task_id").references(() => tasks.id),
    metadata: text("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    leadIdx: index("activities_lead_idx").on(t.leadId),
    dealIdx: index("activities_deal_idx").on(t.dealId),
    userIdx: index("activities_user_idx").on(t.userId),
    createdAtIdx: index("activities_created_at_idx").on(t.createdAt),
  })
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  leads: many(leads),
  deals: many(deals),
  tasks: many(tasks),
  activities: many(activities),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  assignedTo: one(users, {
    fields: [leads.assignedToId],
    references: [users.id],
  }),
  deals: many(deals),
  tasks: many(tasks),
  activities: many(activities),
}));

export const dealsRelations = relations(deals, ({ one, many }) => ({
  assignedTo: one(users, {
    fields: [deals.assignedToId],
    references: [users.id],
  }),
  lead: one(leads, {
    fields: [deals.leadId],
    references: [leads.id],
  }),
  tasks: many(tasks),
  activities: many(activities),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  assignedTo: one(users, {
    fields: [tasks.assignedToId],
    references: [users.id],
  }),
  lead: one(leads, {
    fields: [tasks.leadId],
    references: [leads.id],
  }),
  deal: one(deals, {
    fields: [tasks.dealId],
    references: [deals.id],
  }),
  activities: many(activities),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
  lead: one(leads, {
    fields: [activities.leadId],
    references: [leads.id],
  }),
  deal: one(deals, {
    fields: [activities.dealId],
    references: [deals.id],
  }),
  task: one(tasks, {
    fields: [activities.taskId],
    references: [tasks.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserPreference = typeof userPreferences.$inferSelect;
export type NewUserPreference = typeof userPreferences.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type Deal = typeof deals.$inferSelect;
export type NewDeal = typeof deals.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;
