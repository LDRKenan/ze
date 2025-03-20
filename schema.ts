import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["student", "teacher", "mentor"] }).notNull().default("student"),
  age: integer("age"),
  points: integer("points").notNull().default(0),
  hasParentalConsent: boolean("has_parental_consent"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  instructorId: integer("instructor_id")
    .notNull()
    .references(() => users.id),
  difficulty: text("difficulty", { enum: ["beginner", "intermediate", "advanced"] }).notNull(),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  creatorId: integer("creator_id")
    .notNull()
    .references(() => users.id),
  coverImage: text("cover_image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id")
    .notNull()
    .references(() => communities.id),
  authorId: integer("author_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const competitions = pgTable("competitions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  rules: text("rules").notNull(),
  prizes: jsonb("prizes").notNull(),
  creatorId: integer("creator_id")
    .notNull()
    .references(() => users.id),
  ageGroupMin: integer("age_group_min").notNull(),
  ageGroupMax: integer("age_group_max").notNull(),
  scope: text("scope", { enum: ["national", "global"] }).notNull(),
});

export const competitionEntries = pgTable("competition_entries", {
  id: serial("id").primaryKey(),
  competitionId: integer("competition_id")
    .notNull()
    .references(() => competitions.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  submission: text("submission").notNull(),
  score: integer("score"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id),
  completed: boolean("completed").notNull().default(false),
  lastAccessed: timestamp("last_accessed").notNull().defaultNow(),
  aiRecommendations: jsonb("ai_recommendations"),
});

// Modify the insertUserSchema to handle age validation properly
export const insertUserSchema = createInsertSchema(users).extend({
  age: z.number().nullable().optional(),
  hasParentalConsent: z.boolean().nullable().optional(),
});

// Create a separate schema for student registration with age validation
export const studentRegistrationSchema = insertUserSchema.extend({
  role: z.literal("student"),
  age: z.number()
    .int()
    .min(1, "Age is required")
    .max(150, "Invalid age"),
  hasParentalConsent: z.boolean()
    .nullable()
    .optional()
    .default(false),
});

export const insertCourseSchema = createInsertSchema(courses).pick({
  title: true,
  description: true,
  instructorId: true,
  difficulty: true,
  tags: true,
});

export const insertCommunitySchema = createInsertSchema(communities).pick({
  name: true,
  description: true,
  creatorId: true,
  coverImage: true,
});

export const insertPostSchema = createInsertSchema(posts).pick({
  communityId: true,
  title: true,
  content: true,
});

export const insertCompetitionSchema = createInsertSchema(competitions).pick({
  title: true,
  description: true,
  startDate: true,
  endDate: true,
  rules: true,
  prizes: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Community = typeof communities.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Competition = typeof competitions.$inferSelect;
export type CompetitionEntry = typeof competitionEntries.$inferSelect;
export type Progress = typeof progress.$inferSelect;
export type StudentRegistration = z.infer<typeof studentRegistrationSchema>;