import Sharp from 'sharp';
import { ConversionSettings } from '@shared/schema';

export interface ProcessedTextures {
  baseColor: Buffer;
  normal: Buffer;
  specular: Buffer;
  height: Buffer;
  ao: Buffer;
}

export class TextureProcessor {
  async processImage(imageBuffer: Buffer, settings: ConversionSettings): Promise<ProcessedTextures> {
    const image = Sharp(imageBuffer);
    const metadata = await image.metadata();
    
    if (!metadata.width || !metadata.height) {
      throw new Error('Invalid image dimensions');
    }

    const results: ProcessedTextures = {
      baseColor: Buffer.alloc(0),
      normal: Buffer.alloc(0),
      specular: Buffer.alloc(0),
      height: Buffer.alloc(0),
      ao: Buffer.alloc(0)
    };

    // Generate base color
    if (settings.generateBaseColor) {
      results.baseColor = await this.generateBaseColor(image, settings);
    }

    // Generate roughness map
    if (settings.generateRoughness) {
      const roughnessMap = await this.generateRoughnessMap(image, settings);
      results.specular = await this.combineSpecularChannels(roughnessMap, null, null, null);
    }

    // Generate normal map
    if (settings.generateNormal) {
      results.normal = await this.generateNormalMap(image, settings);
    }

    // Generate height map
    if (settings.generateHeight) {
      results.height = await this.generateHeightMap(image, settings);
    }

    // Generate AO
    if (settings.generateAO) {
      results.ao = await this.generateAOMap(image, settings);
    }

    return results;
  }

  private async generateBaseColor(image: Sharp.Sharp, settings: ConversionSettings): Promise<Buffer> {
    // Apply contrast adjustment
    const contrast = settings.baseColorContrast;
    return await image
      .modulate({ brightness: 1, saturation: 1 })
      .linear(contrast, -(128 * contrast) + 128)
      .png()
      .toBuffer();
  }

  private async generateRoughnessMap(image: Sharp.Sharp, settings: ConversionSettings): Promise<Buffer> {
    // Convert to grayscale and apply roughness settings
    let roughness = image.clone().grayscale();
    
    if (settings.roughnessInvert) {
      roughness = roughness.negate();
    }

    // Apply intensity
    const intensity = settings.roughnessIntensity;
    
    return await roughness
      .linear(intensity, 0)
      .png()
      .toBuffer();
  }

  private async generateNormalMap(image: Sharp.Sharp, settings: ConversionSettings): Promise<Buffer> {
    // Generate normal map using edge detection
    const grayscale = await image.clone().grayscale().raw().toBuffer();
    const { width, height } = await image.metadata();
    
    if (!width || !height) {
      throw new Error('Invalid image dimensions for normal map generation');
    }

    const normalBuffer = Buffer.alloc(width * height * 3);
    const strength = settings.normalStrength;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const rgbIdx = idx * 3;

        // Sample neighboring pixels
        const tl = this.getPixelSafe(grayscale, x - 1, y - 1, width, height);
        const tm = this.getPixelSafe(grayscale, x, y - 1, width, height);
        const tr = this.getPixelSafe(grayscale, x + 1, y - 1, width, height);
        const ml = this.getPixelSafe(grayscale, x - 1, y, width, height);
        const mr = this.getPixelSafe(grayscale, x + 1, y, width, height);
        const bl = this.getPixelSafe(grayscale, x - 1, y + 1, width, height);
        const bm = this.getPixelSafe(grayscale, x, y + 1, width, height);
        const br = this.getPixelSafe(grayscale, x + 1, y + 1, width, height);

        // Calculate gradients
        const dx = (tr + 2 * mr + br) - (tl + 2 * ml + bl);
        const dy = (bl + 2 * bm + br) - (tl + 2 * tm + tr);

        // Convert to normal
        const nx = dx * strength / 255;
        const ny = -dy * strength / 255; // DirectX format (Y-)
        const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));

        // Store as RGB (DirectX format)
        normalBuffer[rgbIdx] = Math.round((nx + 1) * 127.5);     // R
        normalBuffer[rgbIdx + 1] = Math.round((ny + 1) * 127.5); // G
        normalBuffer[rgbIdx + 2] = Math.round(nz * 255);         // B
      }
    }

    return await Sharp(normalBuffer, { raw: { width, height, channels: 3 } })
      .png()
      .toBuffer();
  }

  private async generateHeightMap(image: Sharp.Sharp, settings: ConversionSettings): Promise<Buffer> {
    // Convert to grayscale and apply depth scaling
    const depth = settings.heightDepth;
    
    return await image
      .clone()
      .grayscale()
      .linear(depth, 0)
      .png()
      .toBuffer();
  }

  private async generateAOMap(image: Sharp.Sharp, settings: ConversionSettings): Promise<Buffer> {
    // Generate ambient occlusion using blur and darken
    const radius = Math.max(1, Math.round(settings.aoRadius * 10));
    
    return await image
      .clone()
      .grayscale()
      .blur(radius)
      .modulate({ brightness: 0.7 })
      .png()
      .toBuffer();
  }

  private async combineSpecularChannels(
    roughness: Buffer | null,
    f0: Buffer | null,
    porosity: Buffer | null,
    emission: Buffer | null
  ): Promise<Buffer> {
    // Combine channels into LabPBR specular format
    // R: Roughness, G: F0, B: Porosity/SSS, A: Emission
    
    if (!roughness) {
      throw new Error('Roughness map is required for specular texture');
    }

    const roughnessImage = Sharp(roughness);
    const { width, height } = await roughnessImage.metadata();

    if (!width || !height) {
      throw new Error('Invalid specular texture dimensions');
    }

    // For now, just use the roughness map as red channel
    // In a full implementation, you'd combine all channels properly
    return await roughnessImage
      .ensureAlpha()
      .png()
      .toBuffer();
  }

  private getPixelSafe(buffer: Buffer, x: number, y: number, width: number, height: number): number {
    if (x < 0 || x >= width || y < 0 || y >= height) {
      return 0;
    }
    return buffer[y * width + x];
  }
}
