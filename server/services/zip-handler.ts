import JSZip from 'jszip';
import { storage } from '../storage';
import path from 'path';

export interface ExtractedFile {
  name: string;
  path: string;
  buffer: Buffer;
  isTexture: boolean;
}

export class ZipHandler {
  private textureExtensions = ['.png', '.jpg', '.jpeg', '.tiff', '.tga'];
  private labpbrSuffixes = ['_n', '_s'];

  async extractResourcePack(zipBuffer: Buffer): Promise<ExtractedFile[]> {
    const zip = new JSZip();
    const zipData = await zip.loadAsync(zipBuffer);
    const files: ExtractedFile[] = [];

    for (const [relativePath, file] of Object.entries(zipData.files)) {
      if (file.dir) continue;

      const ext = path.extname(relativePath).toLowerCase();
      const isTexture = this.textureExtensions.includes(ext);

      if (isTexture) {
        const buffer = await file.async('nodebuffer');
        files.push({
          name: path.basename(relativePath),
          path: relativePath,
          buffer,
          isTexture
        });
      }
    }

    return files;
  }

  async createConvertedResourcePack(jobId: number): Promise<Buffer> {
    const zip = new JSZip();
    const job = await storage.getConversionJob(jobId);
    const textureFiles = await storage.getTextureFilesByJobId(jobId);

    if (!job) {
      throw new Error('Job not found');
    }

    // Add pack.mcmeta if it's a resource pack
    if (job.filename.endsWith('.zip')) {
      const packMcmeta = {
        pack: {
          pack_format: 15,
          description: "LabPBR converted resource pack"
        }
      };
      zip.file('pack.mcmeta', JSON.stringify(packMcmeta, null, 2));
    }

    // Add converted texture files
    for (const textureFile of textureFiles) {
      if (!textureFile.convertedPath) continue;

      const [header, data] = textureFile.convertedPath.split(',');
      if (!header?.startsWith('data:image') || !data) {
        continue;
      }

      const buffer = Buffer.from(data, 'base64');
      zip.file(textureFile.originalPath, buffer);
    }

    return await zip.generateAsync({ type: 'nodebuffer' });
  }

  detectTextureType(filename: string): 'base' | 'normal' | 'specular' | 'unknown' {
    const name = path.basename(filename, path.extname(filename));
    
    if (name.endsWith('_n')) {
      return 'normal';
    } else if (name.endsWith('_s')) {
      return 'specular';
    } else if (this.labpbrSuffixes.some(suffix => name.endsWith(suffix))) {
      return 'unknown';
    } else {
      return 'base';
    }
  }

  generateLabPBRFilename(originalPath: string, type: 'normal' | 'specular'): string {
    const ext = path.extname(originalPath);
    const baseName = path.basename(originalPath, ext);
    const dir = path.dirname(originalPath);
    
    const suffix = type === 'normal' ? '_n' : '_s';
    return path.join(dir, `${baseName}${suffix}${ext}`);
  }
}
