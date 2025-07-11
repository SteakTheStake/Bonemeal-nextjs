import { conversionJobs, textureFiles, type ConversionJob, type InsertConversionJob, type TextureFile, type InsertTextureFile, type ValidationIssue, type ProcessingStatus } from "@shared/schema";

export interface IStorage {
  // Conversion jobs
  createConversionJob(job: InsertConversionJob): Promise<ConversionJob>;
  getConversionJob(id: number): Promise<ConversionJob | undefined>;
  updateConversionJob(id: number, updates: Partial<ConversionJob>): Promise<ConversionJob>;
  getAllConversionJobs(): Promise<ConversionJob[]>;
  
  // Texture files
  createTextureFile(file: InsertTextureFile): Promise<TextureFile>;
  getTextureFilesByJobId(jobId: number): Promise<TextureFile[]>;
  updateTextureFile(id: number, updates: Partial<TextureFile>): Promise<TextureFile>;
  
  // Processing status
  getProcessingStatus(jobId: number): Promise<ProcessingStatus | undefined>;
  updateProcessingStatus(jobId: number, status: ProcessingStatus): Promise<void>;
}

export class MemStorage implements IStorage {
  private conversionJobs: Map<number, ConversionJob>;
  private textureFiles: Map<number, TextureFile>;
  private processingStatus: Map<number, ProcessingStatus>;
  private currentJobId: number;
  private currentFileId: number;

  constructor() {
    this.conversionJobs = new Map();
    this.textureFiles = new Map();
    this.processingStatus = new Map();
    this.currentJobId = 1;
    this.currentFileId = 1;
  }

  async createConversionJob(insertJob: InsertConversionJob): Promise<ConversionJob> {
    const id = this.currentJobId++;
    const job: ConversionJob = {
      ...insertJob,
      id,
      progress: 0,
      errors: [],
      warnings: [],
      createdAt: new Date(),
      completedAt: null,
    };
    this.conversionJobs.set(id, job);
    return job;
  }

  async getConversionJob(id: number): Promise<ConversionJob | undefined> {
    return this.conversionJobs.get(id);
  }

  async updateConversionJob(id: number, updates: Partial<ConversionJob>): Promise<ConversionJob> {
    const job = this.conversionJobs.get(id);
    if (!job) {
      throw new Error(`Conversion job ${id} not found`);
    }
    const updatedJob = { ...job, ...updates };
    this.conversionJobs.set(id, updatedJob);
    return updatedJob;
  }

  async getAllConversionJobs(): Promise<ConversionJob[]> {
    return Array.from(this.conversionJobs.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async createTextureFile(insertFile: InsertTextureFile): Promise<TextureFile> {
    const id = this.currentFileId++;
    const file: TextureFile = {
      ...insertFile,
      id,
      convertedPath: null,
      validationIssues: [],
    };
    this.textureFiles.set(id, file);
    return file;
  }

  async getTextureFilesByJobId(jobId: number): Promise<TextureFile[]> {
    return Array.from(this.textureFiles.values()).filter(file => file.jobId === jobId);
  }

  async updateTextureFile(id: number, updates: Partial<TextureFile>): Promise<TextureFile> {
    const file = this.textureFiles.get(id);
    if (!file) {
      throw new Error(`Texture file ${id} not found`);
    }
    const updatedFile = { ...file, ...updates };
    this.textureFiles.set(id, updatedFile);
    return updatedFile;
  }

  async getProcessingStatus(jobId: number): Promise<ProcessingStatus | undefined> {
    return this.processingStatus.get(jobId);
  }

  async updateProcessingStatus(jobId: number, status: ProcessingStatus): Promise<void> {
    this.processingStatus.set(jobId, status);
  }
}

export const storage = new MemStorage();
