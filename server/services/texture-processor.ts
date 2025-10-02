import Sharp from "sharp";
import { ConversionSettings } from "@shared/schema";
import { HuggingFaceClient, huggingFaceClient } from "./huggingface-client";

export interface ProcessedTextures {
  baseColor: Buffer;
  normal: Buffer;
  specular: Buffer;
  height: Buffer;
  ao: Buffer;
}

export class TextureProcessor {
  constructor(private readonly hfClient: HuggingFaceClient = huggingFaceClient) {}

  async processImage(imageBuffer: Buffer, settings: ConversionSettings): Promise<ProcessedTextures> {
    const image = Sharp(imageBuffer);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error("Invalid image dimensions");
    }

    const pngForInference = await image.clone().ensureAlpha().png().toBuffer();

    const results: ProcessedTextures = {
      baseColor: Buffer.alloc(0),
      normal: Buffer.alloc(0),
      specular: Buffer.alloc(0),
      height: Buffer.alloc(0),
      ao: Buffer.alloc(0),
    };

    if (settings.generateBaseColor) {
      results.baseColor = await this.generateBaseColor(image.clone(), settings);
    }

    let depthBuffer: Buffer | null = null;
    if (settings.generateHeight || settings.generateNormal) {
      depthBuffer = await this.hfClient.generateDepthMap(pngForInference);

      if (settings.generateHeight) {
        results.height = depthBuffer;
      }
    }

    if (settings.generateNormal && depthBuffer) {
      results.normal = await this.generateNormalFromDepth(depthBuffer, settings.normalStrength ?? 1);
    }

    if (settings.generateAO) {
      results.ao = await this.generateAOMap(image.clone(), settings);
    }

    return results;
  }

  private async generateBaseColor(image: Sharp.Sharp, settings: ConversionSettings): Promise<Buffer> {
    const contrast = settings.baseColorContrast ?? 1;
    return image
      .modulate({ brightness: 1, saturation: 1 })
      .linear(contrast, -(128 * contrast) + 128)
      .png()
      .toBuffer();
  }

  private async generateNormalFromDepth(depthBuffer: Buffer, strength: number): Promise<Buffer> {
    const depthImage = Sharp(depthBuffer);
    const metadata = await depthImage.metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error("Depth map returned without dimensions");
    }

    const grayscaleDepth = await depthImage
      .clone()
      .ensureAlpha()
      .removeAlpha()
      .greyscale()
      .raw()
      .toBuffer();

    const width = metadata.width;
    const height = metadata.height;
    const normalBuffer = Buffer.alloc(width * height * 3);

    const intensity = Math.max(0.1, strength || 1);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const rgbIdx = (y * width + x) * 3;

        const left = this.getPixel(grayscaleDepth, x - 1, y, width, height);
        const right = this.getPixel(grayscaleDepth, x + 1, y, width, height);
        const top = this.getPixel(grayscaleDepth, x, y - 1, width, height);
        const bottom = this.getPixel(grayscaleDepth, x, y + 1, width, height);

        const dx = ((right - left) / 255) * intensity;
        const dy = ((bottom - top) / 255) * intensity;

        const nx = -dx;
        const ny = -dy;
        const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));

        normalBuffer[rgbIdx] = Math.round((nx + 1) * 127.5);
        normalBuffer[rgbIdx + 1] = Math.round((ny + 1) * 127.5);
        normalBuffer[rgbIdx + 2] = Math.round(nz * 255);
      }
    }

    return Sharp(normalBuffer, { raw: { width, height, channels: 3 } })
      .png()
      .toBuffer();
  }

  private async generateAOMap(image: Sharp.Sharp, settings: ConversionSettings): Promise<Buffer> {
    const radius = Math.max(1, Math.round((settings.aoRadius ?? 0.5) * 10));

    return image
      .clone()
      .greyscale()
      .blur(radius)
      .modulate({ brightness: 0.7 })
      .png()
      .toBuffer();
  }

  private getPixel(buffer: Buffer, x: number, y: number, width: number, height: number): number {
    const clampedX = Math.min(Math.max(x, 0), width - 1);
    const clampedY = Math.min(Math.max(y, 0), height - 1);
    return buffer[clampedY * width + clampedX];
  }
}
