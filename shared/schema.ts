import { pgTable, text, serial, integer, boolean, json, timestamp, varchar, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations, sql } from "drizzle-orm";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  discordId: varchar("discord_id").unique(),
  username: varchar("username").notNull(),
  discriminator: varchar("discriminator"),
  email: varchar("email").unique(),
  avatar: varchar("avatar"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default('active'),
  textureCount: integer("texture_count").default(0),
  isPublic: boolean("is_public").default(false),
  inviteCode: varchar("invite_code").unique(),
  inviteExpiresAt: timestamp("invite_expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Project shares table for tracking shared access
export const projectShares = pgTable("project_shares", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  sharedWithUserId: varchar("shared_with_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sharedByUserId: varchar("shared_by_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  permission: text("permission").notNull().default('view'), // 'view' | 'edit'
  joinedAt: timestamp("joined_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const conversionJobs = pgTable("conversion_jobs", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  filename: text("filename").notNull(),
  status: text("status").notNull(), // 'pending', 'processing', 'completed', 'failed'
  progress: integer("progress").default(0),
  settings: json("settings").notNull(),
  errors: json("errors").default([]),
  warnings: json("warnings").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const textureFiles = pgTable("texture_files", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => conversionJobs.id),
  originalPath: text("original_path").notNull(),
  convertedPath: text("converted_path"),
  textureType: text("texture_type").notNull(), // 'base', 'normal', 'specular'
  validationStatus: text("validation_status").notNull(), // 'valid', 'warning', 'error'
  validationIssues: json("validation_issues").default([]),
});

// Project schemas
export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  textureCount: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Project share schemas
export const insertProjectShareSchema = createInsertSchema(projectShares).omit({
  id: true,
  createdAt: true,
  joinedAt: true,
});

export type InsertProjectShare = z.infer<typeof insertProjectShareSchema>;
export type ProjectShare = typeof projectShares.$inferSelect;

// User schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// User presets table for saving configurations
export const userPresets = pgTable("user_presets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  description: varchar("description", { length: 500 }),
  category: varchar("category", { length: 50 }).notNull(), // conversion, processing, ai, etc.
  settings: jsonb("settings").notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User favorites table for pinned sections
export const userFavorites = pgTable("user_favorites", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  sectionType: varchar("section_type", { length: 50 }).notNull(), // greenhouse sections
  sectionId: varchar("section_id", { length: 100 }).notNull(),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export type UserPreset = typeof userPresets.$inferSelect;
export type InsertUserPreset = typeof userPresets.$inferInsert;
export type UserFavorite = typeof userFavorites.$inferSelect;
export type InsertUserFavorite = typeof userFavorites.$inferInsert;

export const insertConversionJobSchema = createInsertSchema(conversionJobs).pick({
  filename: true,
  status: true,
  settings: true,
  projectId: true,
});

export const insertTextureFileSchema = createInsertSchema(textureFiles).pick({
  jobId: true,
  originalPath: true,
  textureType: true,
  validationStatus: true,
});

export type ConversionJob = typeof conversionJobs.$inferSelect;
export type InsertConversionJob = z.infer<typeof insertConversionJobSchema>;
export type TextureFile = typeof textureFiles.$inferSelect;
export type InsertTextureFile = z.infer<typeof insertTextureFileSchema>;

// Validation result types
export interface ValidationIssue {
  level: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
  channel?: string;
  value?: number;
}

export interface ConversionSettings {
  generateBaseColor: boolean;
  generateRoughness: boolean;
  generateNormal: boolean;
  generateHeight: boolean;
  generateAO: boolean;
  baseColorContrast: number;
  roughnessIntensity: number;
  roughnessInvert: boolean;
  normalStrength: number;
  heightDepth: number;
  aoRadius: number;
  inputType: 'single' | 'sequence' | 'resourcepack';
  // Advanced processing options
  advancedProcessing: {
    enableBulkResize: boolean;
    baseColorResolution: number;
    specularResolution: number;
    normalResolution: number;
    baseColorInterpolation: 'nearest' | 'linear' | 'cubic' | 'lanczos';
    specularInterpolation: 'nearest' | 'linear' | 'cubic' | 'lanczos';
    normalInterpolation: 'nearest' | 'linear' | 'cubic' | 'lanczos';
    enableCompression: boolean;
    compressionQuality: number;
    enableDithering: boolean;
    enableCTMSplit: boolean;
    ctmVariations: number;
  };
}

export interface ProcessingStatus {
  currentTask: string;
  progress: number;
  totalSteps: number;
  currentStep: number;
  imagesProcessed: number;
  totalImages: number;
  texturesGenerated: number;
  elapsedTime: number;
  logs: ProcessingLog[];
}

export interface ProcessingLog {
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
}
