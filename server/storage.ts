import { projects, conversionJobs, textureFiles, users, type Project, type InsertProject, type ConversionJob, type InsertConversionJob, type TextureFile, type InsertTextureFile, type ValidationIssue, type ProcessingStatus, type User, type UpsertUser } from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByDiscordId(discordId: string): Promise<User | undefined>;
  upsertUserByDiscordId(userData: Omit<UpsertUser, 'id'>): Promise<User>;
  
  // Projects
  createProject(project: InsertProject): Promise<Project>;
  getProject(id: number): Promise<Project | undefined>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  getAllProjects(userId?: string): Promise<Project[]>;
  
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
  private users: Map<string, User>;
  private projects: Map<number, Project>;
  private conversionJobs: Map<number, ConversionJob>;
  private textureFiles: Map<number, TextureFile>;
  private processingStatus: Map<number, ProcessingStatus>;
  private currentProjectId: number;
  private currentJobId: number;
  private currentFileId: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.conversionJobs = new Map();
    this.textureFiles = new Map();
    this.processingStatus = new Map();
    this.currentProjectId = 1;
    this.currentJobId = 1;
    this.currentFileId = 1;
  }

  clearAllJobs() {
    this.conversionJobs.clear();
    this.textureFiles.clear();
    this.processingStatus.clear();
    this.currentJobId = 1;
    this.currentFileId = 1;
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.discordId === discordId) {
        return user;
      }
    }
    return undefined;
  }

  async upsertUserByDiscordId(userData: Omit<UpsertUser, 'id'>): Promise<User> {
    const existingUser = await this.getUserByDiscordId(userData.discordId!);
    
    if (existingUser) {
      const updatedUser = {
        ...existingUser,
        ...userData,
        updatedAt: new Date(),
      };
      this.users.set(existingUser.id, updatedUser);
      return updatedUser;
    }
    
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newUser: User = {
      id,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
    
    this.users.set(id, newUser);
    return newUser;
  }

  // Project methods
  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const project: Project = {
      id,
      name: insertProject.name,
      description: insertProject.description || null,
      status: insertProject.status || 'active',
      textureCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.set(id, project);
    return project;
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = { 
      ...project, 
      ...updates,
      updatedAt: new Date() 
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  async getAllProjects(userId?: string): Promise<Project[]> {
    let projectList = Array.from(this.projects.values());
    
    if (userId) {
      projectList = projectList.filter(p => p.userId === userId);
    }
    
    return projectList.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  async createConversionJob(insertJob: InsertConversionJob): Promise<ConversionJob> {
    const id = this.currentJobId++;
    const job: ConversionJob = {
      id,
      projectId: insertJob.projectId || null,
      filename: insertJob.filename,
      status: insertJob.status,
      settings: insertJob.settings,
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
      id,
      jobId: insertFile.jobId || null,
      originalPath: insertFile.originalPath,
      textureType: insertFile.textureType,
      validationStatus: insertFile.validationStatus,
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
