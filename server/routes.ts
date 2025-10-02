import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import multer from "multer";
import { nanoid } from 'nanoid';
import { storage } from "./storage";
import { TextureProcessor } from "./services/texture-processor";
import { LabPBRConverter } from "./services/labpbr-converter";
import { ZipHandler } from "./services/zip-handler";
import { insertConversionJobSchema, type ConversionSettings, type ProcessingStatus } from "@shared/schema";
import { setupDiscordAuth, isAuthenticated, isOptionallyAuthenticated } from "./discordAuth";

const upload = multer({ storage: multer.memoryStorage() });
const textureProcessor = new TextureProcessor();
const labpbrConverter = new LabPBRConverter();
const zipHandler = new ZipHandler();

async function processFileAsync(jobId: number, fileBuffer: Buffer, settings: ConversionSettings) {
  const updateStatus = async (updates: Partial<ProcessingStatus>) => {
    const currentStatus = await storage.getProcessingStatus(jobId);
    if (!currentStatus) return;

    const mergedLogs = updates.logs
      ? [...(currentStatus.logs ?? []), ...updates.logs]
      : currentStatus.logs;

    await storage.updateProcessingStatus(jobId, {
      ...currentStatus,
      ...updates,
      logs: mergedLogs,
      elapsedTime: (currentStatus.elapsedTime ?? 0) + 1000
    });
  };

  try {
    const job = await storage.getConversionJob(jobId);
    if (!job) throw new Error(`Job ${jobId} not found`);

    // Check if it's a resource pack or single file
    const isZipFile = job.filename.toLowerCase().endsWith('.zip');
    
    if (isZipFile) {
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup auth first
  await setupDiscordAuth(app);

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

  // User info endpoint (already provided by discordAuth.ts)
  // app.get('/api/auth/user') is handled by Discord auth setup
  
  // Discord integration routes
  app.get('/api/discord/friends', isAuthenticated, async (req: any, res) => {
    try {
      // Mock Discord friends data for demo
      const mockFriends = [
        {
          id: '123456789',
          username: 'TextureArtist',
          discriminator: '1234',
          avatar: null,
          status: 'online'
        },
        {
          id: '987654321',
          username: 'MinecraftBuilder',
          discriminator: '5678',
          avatar: null,
          status: 'idle'
        },
        {
          id: '456789123',
          username: 'PixelMaster',
          discriminator: '9999',
          avatar: null,
          status: 'offline'
        }
      ];
      
      res.json(mockFriends);
    } catch (error) {
      console.error("Error fetching Discord friends:", error);
      res.status(500).json({ message: "Failed to fetch Discord friends" });
    }
  });

  // Project sharing routes
  app.post('/api/projects/share', isAuthenticated, async (req: any, res) => {
    try {
      const { projectId, userIds, permission, message } = req.body;
      const currentUserId = req.user.id;

      // Validate project ownership
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== currentUserId) {
        return res.status(403).json({ message: "Not authorized to share this project" });
      }

      const shares = [];
      for (const userId of userIds) {
        const share = await storage.shareProject(projectId, currentUserId, userId, permission);
        shares.push(share);
      }

      res.json({ message: "Project shared successfully", shares });
    } catch (error) {
      console.error("Error sharing project:", error);
      res.status(500).json({ message: "Failed to share project" });
    }
  });

  app.get('/api/projects/:id/shares', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const shares = await storage.getProjectShares(projectId);
      res.json(shares);
    } catch (error) {
      console.error("Error fetching project shares:", error);
      res.status(500).json({ message: "Failed to fetch project shares" });
    }
  });

  app.post('/api/projects/invite', isAuthenticated, async (req: any, res) => {
    try {
      const { projectId, expiresInHours = 168 } = req.body;
      const currentUserId = req.user.id;

      // Validate project ownership
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== currentUserId) {
        return res.status(403).json({ message: "Not authorized to create invite for this project" });
      }

      const inviteCode = await storage.generateProjectInvite(projectId, expiresInHours);
      const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

      res.json({
        inviteCode,
        expiresAt: expiresAt.toISOString(),
        usedCount: 0
      });
    } catch (error) {
      console.error("Error generating project invite:", error);
      res.status(500).json({ message: "Failed to generate project invite" });
    }
  });

  app.get('/api/projects/:id/invite', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project || !project.inviteCode) {
        return res.status(404).json(null);
      }

      res.json({
        inviteCode: project.inviteCode,
        expiresAt: project.inviteExpiresAt,
        usedCount: 0 // Mock for now
      });
    } catch (error) {
      console.error("Error fetching project invite:", error);
      res.status(500).json({ message: "Failed to fetch project invite" });
    }
  });

  app.post('/api/join/:inviteCode', isOptionallyAuthenticated, async (req: any, res) => {
    try {
      const { inviteCode } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ 
          message: "Authentication required to join project",
          loginUrl: "/api/auth/discord"
        });
      }

      const project = await storage.joinProjectByInvite(inviteCode, userId);
      if (!project) {
        return res.status(404).json({ message: "Invalid or expired invite code" });
      }

      res.json({ message: "Successfully joined project", project });
    } catch (error) {
      console.error("Error joining project:", error);
      res.status(500).json({ message: "Failed to join project" });
    }
  });

  app.delete('/api/projects/shares/:shareId', isAuthenticated, async (req: any, res) => {
    try {
      const shareId = parseInt(req.params.shareId);
      const currentUserId = req.user.id;

      // Get the share to verify ownership
      const shares = await storage.getAllProjects(currentUserId);
      const projectIds = shares.map(p => p.id);
      
      // Mock removal for now - in real implementation, verify the user owns the project
      const removed = await storage.removeProjectShare(0, currentUserId); // Mock project ID
      
      if (!removed) {
        return res.status(404).json({ message: "Share not found or not authorized" });
      }

      res.json({ message: "Share removed successfully" });
    } catch (error) {
      console.error("Error removing project share:", error);
      res.status(500).json({ message: "Failed to remove project share" });
    }
  });

  // Protected routes example
  app.get('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Projects routes
  app.get("/api/projects", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const projects = await storage.getAllProjects(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
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
      const userId = (req.user as any)?.id;
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
      const userId = (req.user as any)?.id;
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
      const userId = (req.user as any)?.id;
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

  // User presets routes
  app.get("/api/presets", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
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
      const userId = (req.user as any)?.id;
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
      const userId = (req.user as any)?.id;
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
      const userId = (req.user as any)?.id;
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
      const userId = (req.user as any)?.id;
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
      const userId = (req.user as any)?.id;
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
      const userId = (req.user as any)?.id;
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
      const userId = (req.user as any)?.id;
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
        const allIssues: any[] = [];
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
              validation.issues.forEach((issue: any) => {
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
          isValid: allIssues.filter((i: any) => i.level === 'error').length === 0,
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
          errors: results.issues.filter((i: any) => i.level === 'error').length,
          warnings: results.issues.filter((i: any) => i.level === 'warning').length
        });

        res.json(results);
      } else {
        console.log('Validating single texture file');
        
        // Validate single texture
        const validation = await labpbrConverter.validateTexture(req.file.buffer);
        
        const results = {
          isValid: validation.isValid,
          issues: validation.issues.map((issue: any) => ({
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

  // Uploaded content routes
  app.get("/api/uploaded-content", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const content = await storage.getUploadedContent(userId);
      res.json(content);
    } catch (error) {
      console.error("Error fetching uploaded content:", error);
      res.status(500).json({ message: "Failed to fetch uploaded content" });
    }
  });

  app.post("/api/uploaded-content", isAuthenticated, upload.single("file"), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = req.user.claims.sub;
      
      // Save file reference to database
      const content = await storage.createUploadedContent({
        userId,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        fileUrl: `/uploads/${req.file.originalname}`, // This would normally be a proper file storage URL
        thumbnailUrl: req.file.mimetype.startsWith('image/') ? `/uploads/thumb_${req.file.originalname}` : null,
        metadata: {
          uploadedAt: new Date().toISOString()
        }
      });

      // Also save to uploaded content when processing files
      if (req.body.saveToLibrary === 'true') {
        // Save the actual file buffer somewhere (normally to cloud storage)
        // For now we'll just track the metadata
      }

      res.json(content);
    } catch (error) {
      console.error("Error saving uploaded content:", error);
      res.status(500).json({ message: "Failed to save uploaded content" });
    }
  });

  app.delete("/api/uploaded-content/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contentId = parseInt(req.params.id);
      
      const success = await storage.deleteUploadedContent(contentId, userId);
      
      if (!success) {
        return res.status(404).json({ message: "Content not found or unauthorized" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting uploaded content:", error);
      res.status(500).json({ message: "Failed to delete uploaded content" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}