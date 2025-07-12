import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const conversionJobs = pgTable("conversion_jobs", {
  id: serial("id").primaryKey(),
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

export const insertConversionJobSchema = createInsertSchema(conversionJobs).pick({
  filename: true,
  status: true,
  settings: true,
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
