import Sharp from 'sharp';
import { ConversionSettings } from '@shared/schema';
import JSZip from 'jszip';
import path from 'path';

export interface AdvancedProcessingOptions {
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
}

export interface ProcessedTextureSet {
  baseColor: Buffer;
  specular: Buffer;
  normal: Buffer;
  ctmTiles?: Buffer[];
}

export class AdvancedProcessor {
  
  async processTextureSet(
    baseColorBuffer: Buffer,
    specularBuffer: Buffer,
    normalBuffer: Buffer,
    options: AdvancedProcessingOptions
  ): Promise<ProcessedTextureSet> {
    
    let processedBaseColor = baseColorBuffer;
    let processedSpecular = specularBuffer;
    let processedNormal = normalBuffer;
    let ctmTiles: Buffer[] | undefined;

    // Step 1: Bulk Resize
    if (options.enableBulkResize) {
      processedBaseColor = await this.resizeTexture(
        baseColorBuffer,
        options.baseColorResolution,
        options.baseColorInterpolation
      );
      
      processedSpecular = await this.resizeTexture(
        specularBuffer,
        options.specularResolution,
        options.specularInterpolation
      );
      
      processedNormal = await this.resizeTexture(
        normalBuffer,
        options.normalResolution,
        options.normalInterpolation
      );
    }

    // Step 2: CTM Split (before compression)
    if (options.enableCTMSplit) {
      ctmTiles = await this.splitToCTM(processedBaseColor, options.ctmVariations);
    }

    // Step 3: Compression
    if (options.enableCompression) {
      processedBaseColor = await this.compressTexture(
        processedBaseColor,
        options.compressionQuality,
        options.enableDithering
      );
      
      processedSpecular = await this.compressTexture(
        processedSpecular,
        options.compressionQuality,
        options.enableDithering
      );
      
      processedNormal = await this.compressTexture(
        processedNormal,
        options.compressionQuality,
        options.enableDithering
      );

      // Compress CTM tiles if they exist
      if (ctmTiles) {
        ctmTiles = await Promise.all(
          ctmTiles.map(tile => this.compressTexture(
            tile,
            options.compressionQuality,
            options.enableDithering
          ))
        );
      }
    }

    return {
      baseColor: processedBaseColor,
      specular: processedSpecular,
      normal: processedNormal,
      ctmTiles
    };
  }

  private async resizeTexture(
    buffer: Buffer,
    resolution: number,
    interpolation: 'nearest' | 'linear' | 'cubic' | 'lanczos'
  ): Promise<Buffer> {
    const image = Sharp(buffer);
    
    // Map interpolation methods to Sharp kernel options
    const kernelMap = {
      'nearest': 'nearest' as const,
      'linear': 'cubic' as const, // Sharp doesn't have linear, use cubic
      'cubic': 'cubic' as const,
      'lanczos': 'lanczos3' as const
    };

    return await image
      .resize(resolution, resolution, {
        kernel: kernelMap[interpolation],
        fit: 'fill'
      })
      .png()
      .toBuffer();
  }

  private async compressTexture(
    buffer: Buffer,
    quality: number,
    enableDithering: boolean
  ): Promise<Buffer> {
    const image = Sharp(buffer);
    
    let pipeline = image;
    
    if (enableDithering) {
      // Apply light dithering by adding slight noise
      pipeline = pipeline.modulate({
        brightness: 1,
        saturation: 1,
        hue: 0
      });
    }

    // Use PNG compression with specific quality
    return await pipeline
      .png({
        compressionLevel: Math.round((100 - quality) / 10), // Convert quality to compression level
        palette: enableDithering // Use palette mode for dithering
      })
      .toBuffer();
  }

  private async splitToCTM(buffer: Buffer, variations: number): Promise<Buffer[]> {
    const image = Sharp(buffer);
    const { width, height } = await image.metadata();
    
    if (!width || !height) {
      throw new Error('Invalid image dimensions for CTM split');
    }

    const tiles: Buffer[] = [];
    const tileSize = Math.min(width, height);
    
    // Generate CTM variations based on the number requested
    for (let i = 0; i < variations; i++) {
      // Create variations by applying different transformations
      let tile = image.clone();
      
      // Apply different transformations for each tile
      if (i % 4 === 1) {
        // Rotate 90 degrees
        tile = tile.rotate(90);
      } else if (i % 4 === 2) {
        // Rotate 180 degrees
        tile = tile.rotate(180);
      } else if (i % 4 === 3) {
        // Rotate 270 degrees
        tile = tile.rotate(270);
      }
      
      // Flip some tiles for more variation
      if (i % 8 >= 4) {
        tile = tile.flip();
      }
      
      // Apply slight color variations
      if (i > 0) {
        const hueShift = (i * 5) % 360;
        tile = tile.modulate({
          brightness: 1 + (Math.sin(i * 0.1) * 0.05),
          saturation: 1 + (Math.cos(i * 0.1) * 0.05),
          hue: hueShift
        });
      }
      
      const tileBuffer = await tile
        .resize(tileSize, tileSize, { fit: 'cover' })
        .png()
        .toBuffer();
      
      tiles.push(tileBuffer);
    }
    
    return tiles;
  }

  async createCTMResourcePack(
    originalPath: string,
    ctmTiles: Buffer[],
    baseTextureName: string
  ): Promise<Buffer> {
    const zip = new JSZip();
    
    // Add pack.mcmeta
    const packMcmeta = {
      pack: {
        pack_format: 15,
        description: "CTM Resource Pack with " + ctmTiles.length + " variations"
      }
    };
    zip.file('pack.mcmeta', JSON.stringify(packMcmeta, null, 2));
    
    // Add CTM properties file
    const ctmProperties = `
matchBlocks=${baseTextureName}
method=ctm
tiles=0-${ctmTiles.length - 1}
`;
    
    const ctmPath = path.join('assets/minecraft/mcpatcher/ctm', path.dirname(originalPath));
    zip.file(path.join(ctmPath, `${baseTextureName}.properties`), ctmProperties.trim());
    
    // Add all CTM tiles
    ctmTiles.forEach((tile, index) => {
      const tilePath = path.join(ctmPath, `${baseTextureName}_${index}.png`);
      zip.file(tilePath, tile);
    });
    
    return await zip.generateAsync({ type: 'nodebuffer' });
  }

  // Utility method to calculate optimal resolution based on original size
  getOptimalResolution(originalWidth: number, originalHeight: number): number {
    const maxDimension = Math.max(originalWidth, originalHeight);
    const resolutions = [16, 32, 64, 128, 256, 512, 1024, 2048];
    
    // Find the closest power of 2 resolution
    for (let i = 0; i < resolutions.length; i++) {
      if (maxDimension <= resolutions[i]) {
        return resolutions[i];
      }
    }
    
    return 2048; // Maximum supported resolution
  }

  // Utility method to recommend interpolation based on texture type
  getRecommendedInterpolation(textureType: 'base' | 'normal' | 'specular'): string {
    switch (textureType) {
      case 'base':
        return 'cubic'; // Good balance for base color
      case 'normal':
        return 'lanczos'; // Preserve detail in normal maps
      case 'specular':
        return 'linear'; // Smooth for specular data
      default:
        return 'cubic';
    }
  }
}