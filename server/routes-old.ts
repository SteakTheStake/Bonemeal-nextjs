import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { z } from "zod";
import { insertConversionJobSchema, type ConversionSettings, type ProcessingStatus } from "@shared/schema";
import { setupDiscordAuth, isAuthenticated, isOptionallyAuthenticated } from "./discordAuth";

// Extend Express Request interface for multer
interface MulterRequest extends Request {
  file?: Express.Multer.File;
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
}
import { TextureProcessor } from "./services/texture-processor";
import { LabPBRConverter } from "./services/labpbr-converter";
import { ZipHandler } from "./services/zip-handler";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 } // 200MB limit
});

const textureProcessor = new TextureProcessor();
const labpbrConverter = new LabPBRConverter();
const zipHandler = new ZipHandler();

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupDiscordAuth(app);
  
  // Project routes (protected)
  app.get("/api/projects", isOptionallyAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const projects = await storage.getAllProjects(userId);
      res.json(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", isOptionallyAuthenticated, async (req: any, res) => {
    try {
      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Project name is required" });
      }
      const userId = req.user?.id;
      const project = await storage.createProject({ 
        name, 
        description, 
        status: 'active',
        userId 
      });
      res.json(project);
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, description } = req.body;
      const project = await storage.updateProject(id, { name, description });
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProject(id);
      if (!success) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Project sharing routes
  app.post("/api/projects/:id/invite", isOptionallyAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = req.user?.id;
      const { expiresInHours = 24 } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Check if user owns the project
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      if (project.userId !== userId) {
        return res.status(403).json({ message: "Only project owners can generate invites" });
      }

      const inviteCode = await storage.generateProjectInvite(projectId, expiresInHours);
      res.json({ 
        inviteCode,
        inviteUrl: `${req.protocol}://${req.get('host')}/join/${inviteCode}`,
        expiresAt: new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
      });
    } catch (error) {
      console.error("Error generating project invite:", error);
      res.status(500).json({ message: "Failed to generate invite" });
    }
  });

  app.post("/api/projects/join/:inviteCode", isOptionallyAuthenticated, async (req: any, res) => {
    try {
      const { inviteCode } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Authentication required to join projects" });
      }

      const project = await storage.joinProjectByInvite(inviteCode, userId);
      if (!project) {
        return res.status(404).json({ message: "Invalid or expired invite" });
      }

      res.json({ project, message: "Successfully joined project" });
    } catch (error) {
      console.error("Error joining project:", error);
      res.status(500).json({ message: "Failed to join project" });
    }
  });

  // Get all conversion jobs
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getAllConversionJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversion jobs" });
    }
  });

  // Get specific conversion job
  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getConversionJob(id);
      if (!job) {
        return res.status(404).json({ message: "Conversion job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversion job" });
    }
  });

  // Get processing status
  app.get("/api/jobs/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const status = await storage.getProcessingStatus(id);
      if (!status) {
        return res.status(404).json({ message: "Processing status not found" });
      }
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch processing status" });
    }
  });

  // Get texture files for a job
  app.get("/api/jobs/:id/files", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const files = await storage.getTextureFilesByJobId(jobId);
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch texture files" });
    }
  });

  // Upload and process files
  app.post("/api/upload", upload.single("file"), async (req: any, res) => {
    try {
      console.log('Upload request received');
      console.log('File:', req.file ? {
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        bufferSize: req.file.buffer?.length || 0
      } : 'No file');
      console.log('Settings:', req.body.settings || 'No settings');
      
      if (!req.file) {
        console.log('No file uploaded');
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      if (!req.file.buffer || req.file.buffer.length === 0) {
        console.log('Empty file buffer');
        return res.status(400).json({ message: "Empty file uploaded" });
      }

      const settingsSchema = z.object({
        generateBaseColor: z.boolean().default(true),
        generateRoughness: z.boolean().default(true),
        generateNormal: z.boolean().default(true),
        generateHeight: z.boolean().default(true),
        generateAO: z.boolean().default(true),
        baseColorContrast: z.number().min(0).max(2).default(1.2),
        roughnessIntensity: z.number().min(0).max(1).default(0.8),
        roughnessInvert: z.boolean().default(false),
        normalStrength: z.number().min(0).max(3).default(1.0),
        heightDepth: z.number().min(0).max(1).default(0.25),
        aoRadius: z.number().min(0).max(1).default(0.5),
        inputType: z.enum(['single', 'sequence', 'resourcepack']).default('single'),
        advancedProcessing: z.object({
          enableBulkResize: z.boolean().default(false),
          baseColorResolution: z.number().default(256),
          specularResolution: z.number().default(256),
          normalResolution: z.number().default(256),
          baseColorInterpolation: z.enum(['nearest', 'linear', 'cubic', 'lanczos']).default('cubic'),
          specularInterpolation: z.enum(['nearest', 'linear', 'cubic', 'lanczos']).default('linear'),
          normalInterpolation: z.enum(['nearest', 'linear', 'cubic', 'lanczos']).default('lanczos'),
          enableCompression: z.boolean().default(false),
          compressionQuality: z.number().min(30).max(100).default(85),
          enableDithering: z.boolean().default(false),
          enableCTMSplit: z.boolean().default(false),
          ctmVariations: z.number().min(1).max(47).default(47),
        }).default({}),
      });

      const settings = settingsSchema.parse(JSON.parse(req.body.settings || '{}'));

      // Create conversion job
      const job = await storage.createConversionJob({
        filename: req.file.originalname,
        status: 'pending',
        settings,
      });

      // Initialize processing status
      const initialStatus: ProcessingStatus = {
        currentTask: 'Initializing...',
        progress: 0,
        totalSteps: 5,
        currentStep: 0,
        imagesProcessed: 0,
        totalImages: 0,
        texturesGenerated: 0,
        elapsedTime: 0,
        logs: [{
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Processing started'
        }]
      };

      await storage.updateProcessingStatus(job.id, initialStatus);

      // Start processing asynchronously
      processFileAsync(job.id, req.file.buffer, settings);

      res.json({ jobId: job.id });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Failed to process upload" });
    }
  });

  // Download converted resource pack
  app.get("/api/jobs/:id/download", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getConversionJob(id);
      
      if (!job) {
        return res.status(404).json({ message: "Conversion job not found" });
      }

      if (job.status !== 'completed') {
        return res.status(400).json({ message: "Conversion not completed" });
      }

      // Generate download zip
      const zipBuffer = await zipHandler.createConvertedResourcePack(id);
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${job.filename.replace('.zip', '')}_labpbr.zip"`);
      res.send(zipBuffer);
    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({ message: "Failed to generate download" });
    }
  });

  // Validate textures
  app.post("/api/validate", upload.single("file"), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      console.log('Validating file:', req.file.originalname, 'size:', req.file.size);

      // Check if it's a ZIP file (resource pack)
      if (req.file.originalname.toLowerCase().endsWith('.zip')) {
        console.log('Validating ZIP resource pack');
        
        // Extract files from ZIP
        const extractedFiles = await zipHandler.extractResourcePack(req.file.buffer);
        console.log('Extracted files:', extractedFiles.length);
        
        const validationResults: any = {
          isValid: true,
          issues: [] as any[],
          version: "1.0.0",
          totalFiles: extractedFiles.length,
          textureFiles: extractedFiles.filter(f => f.isTexture).length,
          fileDetails: [] as any[]
        };

        // Validate each texture file
        for (const file of extractedFiles) {
          if (file.isTexture) {
            try {
              const validation = await labpbrConverter.validateTexture(file.buffer);
              validationResults.fileDetails.push({
                filename: file.name,
                path: file.path,
                validation: validation,
                size: file.buffer.length
              });
              
              // Collect all issues
              if (validation.issues) {
                validationResults.issues.push(...validation.issues.map(issue => ({
                  ...issue,
                  filename: file.name,
                  path: file.path
                })));
              }
              
              if (!validation.isValid) {
                validationResults.isValid = false;
              }
            } catch (error: any) {
              console.error('Error validating texture:', file.name, error);
              validationResults.issues.push({
                level: 'error',
                message: `Failed to validate texture: ${error?.message || 'Unknown error'}`,
                filename: file.name,
                path: file.path
              });
              validationResults.isValid = false;
            }
          }
        }

        res.json(validationResults);
      } else {
        // Single texture file validation
        console.log('Validating single texture file');
        const validation = await labpbrConverter.validateTexture(req.file.buffer);
        res.json({
          ...validation,
          totalFiles: 1,
          textureFiles: 1,
          fileDetails: [{
            filename: req.file.originalname,
            path: req.file.originalname,
            validation: validation,
            size: req.file.size
          }]
        });
      }
    } catch (error) {
      console.error('Validation error:', error);
      res.status(500).json({ message: "Failed to validate texture" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function processFileAsync(jobId: number, fileBuffer: Buffer, settings: ConversionSettings) {
  const startTime = Date.now();
  
  try {
    await storage.updateConversionJob(jobId, { status: 'processing' });

    // Update status
    const updateStatus = async (update: Partial<ProcessingStatus>) => {
      const currentStatus = await storage.getProcessingStatus(jobId);
      if (currentStatus) {
        const newStatus = { 
          ...currentStatus, 
          ...update,
          elapsedTime: Date.now() - startTime
        };
        await storage.updateProcessingStatus(jobId, newStatus);
      }
    };

    // Determine file type and process accordingly
    const job = await storage.getConversionJob(jobId);
    if (!job) return;

    if (job.filename.endsWith('.zip')) {
      // Process resource pack
      await updateStatus({ 
        currentTask: 'Extracting resource pack...',
        currentStep: 1,
        logs: [{ timestamp: new Date().toISOString(), level: 'info', message: 'Extracting resource pack...' }]
      });

      const extractedFiles = await zipHandler.extractResourcePack(fileBuffer);
      
      await updateStatus({
        currentTask: 'Processing textures...',
        currentStep: 2,
        totalImages: extractedFiles.length,
        logs: [{ timestamp: new Date().toISOString(), level: 'success', message: `Found ${extractedFiles.length} texture files` }]
      });

      // Process each texture file
      for (let i = 0; i < extractedFiles.length; i++) {
        const file = extractedFiles[i];
        
        await updateStatus({
          currentTask: `Processing ${file.name}...`,
          imagesProcessed: i,
          logs: [{ timestamp: new Date().toISOString(), level: 'info', message: `Processing ${file.name}...` }]
        });

        // Create texture file record
        const textureFile = await storage.createTextureFile({
          jobId,
          originalPath: file.path,
          textureType: 'base',
          validationStatus: 'valid',
        });

        // Process texture
        const processedTextures = await textureProcessor.processImage(file.buffer, settings);
        
        // Validate against LabPBR
        const validation = await labpbrConverter.validateTexture(processedTextures.specular);
        
        await storage.updateTextureFile(textureFile.id, {
          validationStatus: validation.issues.some(i => i.level === 'error') ? 'error' : 
                           validation.issues.some(i => i.level === 'warning') ? 'warning' : 'valid',
          validationIssues: validation.issues,
        });

        await updateStatus({
          texturesGenerated: (i + 1) * 4, // 4 textures per input
        });
      }

      await updateStatus({
        currentTask: 'Creating output package...',
        currentStep: 4,
        progress: 90,
        logs: [{ timestamp: new Date().toISOString(), level: 'info', message: 'Creating output package...' }]
      });

      // Create output zip
      await zipHandler.createConvertedResourcePack(jobId);

    } else {
      // Process single image
      await updateStatus({
        currentTask: 'Processing single image...',
        currentStep: 1,
        totalImages: 1,
        logs: [{ timestamp: new Date().toISOString(), level: 'info', message: 'Processing single image...' }]
      });

      const processedTextures = await textureProcessor.processImage(fileBuffer, settings);
      
      await updateStatus({
        currentTask: 'Validating textures...',
        currentStep: 3,
        texturesGenerated: 4,
        logs: [{ timestamp: new Date().toISOString(), level: 'success', message: 'Generated 4 texture maps' }]
      });

      // Validate
      const validation = await labpbrConverter.validateTexture(processedTextures.specular);
      
      await storage.createTextureFile({
        jobId,
        originalPath: job.filename,
        textureType: 'base',
        validationStatus: validation.issues.some(i => i.level === 'error') ? 'error' : 
                         validation.issues.some(i => i.level === 'warning') ? 'warning' : 'valid',
      });
    }

    await updateStatus({
      currentTask: 'Complete!',
      currentStep: 5,
      progress: 100,
      logs: [{ timestamp: new Date().toISOString(), level: 'success', message: 'Processing completed successfully' }]
    });

    await storage.updateConversionJob(jobId, { 
      status: 'completed', 
      progress: 100,
      completedAt: new Date()
    });

  } catch (error) {
    console.error('Processing error:', error);
    
    await storage.updateConversionJob(jobId, { 
      status: 'failed',
      errors: [{ message: error instanceof Error ? error.message : 'Unknown error' }]
    });

    const currentStatus = await storage.getProcessingStatus(jobId);
    if (currentStatus) {
      await storage.updateProcessingStatus(jobId, {
        ...currentStatus,
        logs: [...currentStatus.logs, { 
          timestamp: new Date().toISOString(), 
          level: 'error', 
          message: `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
        }]
      });
    }
  }
}

// User presets routes
  app.get("/api/presets", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const presets = await storage.getUserPresets(userId);
      res.json(presets);
    } catch (error) {
      console.error("Error fetching presets:", error);
      res.status(500).json({ message: "Failed to fetch presets" });
    }
  });

  app.post("/api/presets", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { name, description, category, settings, isDefault } = req.body;

      // If setting as default, unset other defaults in the same category
      if (isDefault) {
        await storage.unsetDefaultPresets(userId, category);
      }

      const preset = await storage.createUserPreset({
        userId,
        name,
        description,
        category,
        settings,
        isDefault,
      });

      res.json(preset);
    } catch (error) {
      console.error("Error creating preset:", error);
      res.status(500).json({ message: "Failed to create preset" });
    }
  });

  app.delete("/api/presets/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const presetId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      await storage.deleteUserPreset(presetId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting preset:", error);
      res.status(500).json({ message: "Failed to delete preset" });
    }
  });

  app.post("/api/presets/:id/default", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const presetId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      await storage.setDefaultPreset(presetId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error setting default preset:", error);
      res.status(500).json({ message: "Failed to set default preset" });
    }
  });

  // User favorites routes
  app.get("/api/favorites", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { sectionType, sectionId, order } = req.body;

      const favorite = await storage.createUserFavorite({
        userId,
        sectionType,
        sectionId,
        order,
      });

      res.json(favorite);
    } catch (error) {
      console.error("Error creating favorite:", error);
      res.status(500).json({ message: "Failed to create favorite" });
    }
  });

  app.delete("/api/favorites/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const favoriteId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      await storage.deleteUserFavorite(favoriteId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting favorite:", error);
      res.status(500).json({ message: "Failed to delete favorite" });
    }
  });

  app.post("/api/favorites/reorder", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { updates } = req.body;

      for (const update of updates) {
        await storage.updateUserFavoriteOrder(update.id, update.order, userId);
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error reordering favorites:", error);
      res.status(500).json({ message: "Failed to reorder favorites" });
    }
  });

  // Stats endpoint (public)
  app.get('/api/stats/global', async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      const jobs = await storage.getAllConversionJobs();
      
      const stats = {
        totalProjects: projects.length,
        totalConversions: jobs.length,
        completedConversions: jobs.filter(job => job.status === 'completed').length,
        activeUsers: new Set(projects.map(p => p.userId).filter(Boolean)).size,
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching global stats:", error);
      res.status(500).json({ message: "Failed to fetch global stats" });
    }
  });

  // User info endpoint
  app.get('/api/auth/user', isOptionallyAuthenticated, async (req: any, res) => {
    try {
      if (!req.user) {
        return res.status(404).json(null);
      }
      
      const userId = req.user.claims?.sub;
      if (!userId) {
        return res.status(404).json(null);
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json(null);
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Projects routes
  app.get("/api/projects", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const projects = await storage.getProjectsByUserId(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const project = await storage.createProject({
        ...req.body,
        userId,
      });

      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.get("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const projectId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check if user has access to this project
      if (project.userId !== userId) {
        const hasAccess = await storage.hasProjectAccess(projectId, userId);
        if (!hasAccess) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.put("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const projectId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (project.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedProject = await storage.updateProject(projectId, req.body);
      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const projectId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (project.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteProject(projectId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Conversion jobs routes
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getAllConversionJobs();
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getConversionJob(id);
      
      if (!job) {
        return res.status(404).json({ message: "Conversion job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  // Get processing status for a job
  app.get("/api/jobs/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const status = await storage.getProcessingStatus(id);
      
      if (!status) {
        return res.status(404).json({ message: "Processing status not found" });
      }
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch processing status" });
    }
  });

  // Get texture files for a job
  app.get("/api/jobs/:id/files", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const files = await storage.getTextureFilesByJobId(jobId);
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch texture files" });
    }
  });

  // Upload and process files
  app.post("/api/upload", upload.single("file"), async (req: any, res) => {
    try {
      console.log('Upload request received');
      console.log('File:', req.file ? {
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        bufferSize: req.file.buffer?.length || 0
      } : 'No file');
      console.log('Settings:', req.body.settings || 'No settings');
      
      if (!req.file) {
        console.log('No file uploaded');
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      if (!req.file.buffer || req.file.buffer.length === 0) {
        console.log('Empty file buffer');
        return res.status(400).json({ message: "Empty file uploaded" });
      }

      const settingsSchema = z.object({
        generateBaseColor: z.boolean().default(true),
        generateRoughness: z.boolean().default(true),
        generateNormal: z.boolean().default(true),
        generateHeight: z.boolean().default(true),
        generateAO: z.boolean().default(true),
        baseColorContrast: z.number().min(0).max(2).default(1.2),
        roughnessIntensity: z.number().min(0).max(1).default(0.8),
        roughnessInvert: z.boolean().default(false),
        normalStrength: z.number().min(0).max(3).default(1.0),
        heightDepth: z.number().min(0).max(1).default(0.25),
        aoRadius: z.number().min(0).max(1).default(0.5),
        inputType: z.enum(['single', 'sequence', 'resourcepack']).default('single'),
        advancedProcessing: z.object({
          enableBulkResize: z.boolean().default(false),
          baseColorResolution: z.number().default(256),
          specularResolution: z.number().default(256),
          normalResolution: z.number().default(256),
          baseColorInterpolation: z.enum(['nearest', 'linear', 'cubic', 'lanczos']).default('cubic'),
          specularInterpolation: z.enum(['nearest', 'linear', 'cubic', 'lanczos']).default('linear'),
          normalInterpolation: z.enum(['nearest', 'linear', 'cubic', 'lanczos']).default('lanczos'),
          enableCompression: z.boolean().default(false),
          compressionQuality: z.number().min(30).max(100).default(85),
          enableDithering: z.boolean().default(false),
          enableCTMSplit: z.boolean().default(false),
          ctmVariations: z.number().min(1).max(47).default(47),
        }).default({}),
      });

      const settings = settingsSchema.parse(JSON.parse(req.body.settings || '{}'));

      // Create conversion job
      const job = await storage.createConversionJob({
        filename: req.file.originalname,
        status: 'pending',
        settings,
      });

      // Initialize processing status
      const initialStatus: ProcessingStatus = {
        currentTask: 'Initializing...',
        progress: 0,
        totalSteps: 5,
        currentStep: 0,
        imagesProcessed: 0,
        totalImages: 0,
        texturesGenerated: 0,
        elapsedTime: 0,
        logs: [{
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Processing started'
        }]
      };

      await storage.updateProcessingStatus(job.id, initialStatus);

      // Start processing asynchronously
      processFileAsync(job.id, req.file.buffer, settings);

      res.json({ jobId: job.id });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Failed to process upload" });
    }
  });

  // Download converted resource pack
  app.get("/api/jobs/:id/download", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getConversionJob(id);
      
      if (!job) {
        return res.status(404).json({ message: "Conversion job not found" });
      }

      if (job.status !== 'completed') {
        return res.status(400).json({ message: "Conversion not completed" });
      }

      // Generate download zip
      const zipBuffer = await zipHandler.createConvertedResourcePack(id);
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${job.filename.replace('.zip', '')}_labpbr.zip"`);
      res.send(zipBuffer);
    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({ message: "Failed to generate download" });
    }
  });

  // Validate textures
  app.post("/api/validate", upload.single("file"), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      console.log('Validating file:', req.file.originalname, 'size:', req.file.size);

      // Check if it's a ZIP file (resource pack)
      if (req.file.originalname.toLowerCase().endsWith('.zip')) {
        console.log('Validating ZIP resource pack');
        
        // Extract files from ZIP
        const extractedFiles = await zipHandler.extractResourcePack(req.file.buffer);
        console.log('Extracted files:', extractedFiles.length);
        
        let totalFiles = 0;
        let textureFiles = 0;
        const allIssues: ValidationIssue[] = [];
        const fileDetails: any[] = [];

        for (const file of extractedFiles) {
          totalFiles++;
          
          if (file.name.match(/\.(png|jpg|jpeg)$/i)) {
            textureFiles++;
            
            try {
              console.log('Validating texture:', file.name);
              const validation = await labpbrConverter.validateTexture(file.buffer);
              
              fileDetails.push({
                filename: file.name,
                path: file.path,
                validation: validation,
                size: file.buffer.length
              });

              // Add filename to each issue for better tracking
              validation.issues.forEach(issue => {
                allIssues.push({
                  ...issue,
                  filename: file.name,
                  path: file.path
                });
              });
              
            } catch (fileError) {
              console.error('Error validating file:', file.name, fileError);
              allIssues.push({
                level: 'error',
                message: `Failed to validate ${file.name}`,
                suggestion: 'Check if the file is a valid image',
                filename: file.name,
                path: file.path
              });
            }
          }
        }

        const results = {
          isValid: allIssues.filter(i => i.level === 'error').length === 0,
          issues: allIssues,
          version: '1.3',
          totalFiles,
          textureFiles,
          fileDetails
        };

        console.log('Validation complete:', {
          totalFiles: results.totalFiles,
          textureFiles: results.textureFiles,
          totalIssues: results.issues.length,
          errors: results.issues.filter(i => i.level === 'error').length,
          warnings: results.issues.filter(i => i.level === 'warning').length
        });

        res.json(results);
      } else {
        console.log('Validating single texture file');
        
        // Validate single texture
        const validation = await labpbrConverter.validateTexture(req.file.buffer);
        
        const results = {
          isValid: validation.isValid,
          issues: validation.issues.map(issue => ({
            ...issue,
            filename: req.file.originalname
          })),
          version: validation.version,
          totalFiles: 1,
          textureFiles: 1,
          fileDetails: [{
            filename: req.file.originalname,
            path: req.file.originalname,
            validation: validation,
            size: req.file.size
          }]
        };

        console.log('Single file validation complete:', {
          filename: req.file.originalname,
          isValid: validation.isValid,
          issues: validation.issues.length
        });

        res.json(results);
      }
    } catch (error) {
      console.error('Validation error:', error);
      res.status(500).json({ 
        message: "Failed to validate textures",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // User presets routes
  app.get("/api/presets", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const presets = await storage.getUserPresets(userId);
      res.json(presets);
    } catch (error) {
      console.error("Error fetching presets:", error);
      res.status(500).json({ message: "Failed to fetch presets" });
    }
  });

  app.post("/api/presets", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { name, description, category, settings, isDefault } = req.body;

      // If setting as default, unset other defaults in the same category
      if (isDefault) {
        await storage.unsetDefaultPresets(userId, category);
      }

      const preset = await storage.createUserPreset({
        userId,
        name,
        description,
        category,
        settings,
        isDefault,
      });

      res.json(preset);
    } catch (error) {
      console.error("Error creating preset:", error);
      res.status(500).json({ message: "Failed to create preset" });
    }
  });

  app.delete("/api/presets/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const presetId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      await storage.deleteUserPreset(presetId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting preset:", error);
      res.status(500).json({ message: "Failed to delete preset" });
    }
  });

  app.post("/api/presets/:id/default", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const presetId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      await storage.setDefaultPreset(presetId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error setting default preset:", error);
      res.status(500).json({ message: "Failed to set default preset" });
    }
  });

  // User favorites routes
  app.get("/api/favorites", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { sectionType, sectionId, order } = req.body;

      const favorite = await storage.createUserFavorite({
        userId,
        sectionType,
        sectionId,
        order,
      });

      res.json(favorite);
    } catch (error) {
      console.error("Error creating favorite:", error);
      res.status(500).json({ message: "Failed to create favorite" });
    }
  });

  app.delete("/api/favorites/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const favoriteId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      await storage.deleteUserFavorite(favoriteId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting favorite:", error);
      res.status(500).json({ message: "Failed to delete favorite" });
    }
  });

  app.post("/api/favorites/reorder", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { updates } = req.body;

      for (const update of updates) {
        await storage.updateUserFavoriteOrder(update.id, update.order, userId);
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error reordering favorites:", error);
      res.status(500).json({ message: "Failed to reorder favorites" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
