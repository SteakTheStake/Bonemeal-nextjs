import Sharp from 'sharp';
import { ValidationIssue } from '@shared/schema';

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  version: string;
}

export class LabPBRConverter {
  async validateTexture(textureBuffer: Buffer): Promise<ValidationResult> {
    try {
      const image = Sharp(textureBuffer);
      const metadata = await image.metadata();
      const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
      
      const issues: ValidationIssue[] = [];
      
      // Check image format
      if (metadata.format !== 'png') {
        issues.push({
          level: 'warning',
          message: 'Texture should be in PNG format for best compatibility',
          suggestion: 'Convert to PNG format'
        });
      }

      // Check dimensions (should be power of 2)
      if (metadata.width && metadata.height) {
        if (!this.isPowerOfTwo(metadata.width) || !this.isPowerOfTwo(metadata.height)) {
          issues.push({
            level: 'warning',
            message: 'Texture dimensions should be power of 2 for optimal performance',
            suggestion: `Consider resizing to nearest power of 2 dimensions`
          });
        }
      }

      // If this is a specular texture, validate LabPBR channels
      if (info.channels >= 3) {
        this.validateSpecularChannels(data, info, issues);
      }

      // If this is a normal texture, validate DirectX format
      if (this.isNormalTexture(textureBuffer)) {
        this.validateNormalFormat(data, info, issues);
      }

      return {
        isValid: issues.filter(i => i.level === 'error').length === 0,
        issues,
        version: '1.3'
      };
    } catch (error) {
      return {
        isValid: false,
        issues: [{
          level: 'error',
          message: `Failed to validate texture: ${error instanceof Error ? error.message : 'Unknown error'}`,
          suggestion: 'Check if the file is a valid image'
        }],
        version: '1.3'
      };
    }
  }

  private validateSpecularChannels(data: Buffer, info: any, issues: ValidationIssue[]) {
    const { width, height, channels } = info;
    const pixelCount = width * height;

    // Check red channel (smoothness)
    for (let i = 0; i < pixelCount; i++) {
      const pixelOffset = i * channels;
      const smoothness = data[pixelOffset]; // Red channel
      
      // Convert to roughness and validate
      const roughness = Math.pow(1.0 - smoothness / 255, 2.0);
      
      if (roughness < 0 || roughness > 1) {
        issues.push({
          level: 'error',
          message: 'Invalid roughness value detected',
          suggestion: 'Ensure smoothness values are in valid range (0-255)',
          channel: 'red',
          value: smoothness
        });
        break; // Don't spam with too many errors
      }
    }

    // Check green channel (F0 / metalness)
    for (let i = 0; i < pixelCount; i++) {
      const pixelOffset = i * channels;
      const f0Value = data[pixelOffset + 1]; // Green channel
      
      if (f0Value >= 230 && f0Value <= 254) {
        // Predefined metal
        const metalTypes = {
          230: 'Iron', 231: 'Gold', 232: 'Aluminum', 233: 'Chrome',
          234: 'Copper', 235: 'Lead', 236: 'Platinum', 237: 'Silver'
        };
        
        // Valid metal value
        continue;
      } else if (f0Value === 255) {
        // Custom metal using albedo as F0
        continue;
      } else if (f0Value > 229) {
        issues.push({
          level: 'error',
          message: 'Invalid F0 value range detected',
          suggestion: 'F0 values should be 0-229 for dielectrics or 230-255 for metals',
          channel: 'green',
          value: f0Value
        });
        break;
      }
    }

    // Check blue channel (porosity/SSS)
    for (let i = 0; i < pixelCount; i++) {
      const pixelOffset = i * channels;
      const blueValue = data[pixelOffset + 2]; // Blue channel
      const greenValue = data[pixelOffset + 1]; // Green channel for metal check
      
      if (greenValue < 230) { // Dielectric
        if (blueValue <= 64) {
          // Porosity range is valid
        } else if (blueValue <= 255) {
          // SSS range is valid
        }
      } else {
        // Metal - blue channel reserved for future use
        if (blueValue !== 0) {
          issues.push({
            level: 'warning',
            message: 'Blue channel should be 0 for metals in LabPBR v1.3',
            suggestion: 'Set blue channel to 0 for metal materials',
            channel: 'blue',
            value: blueValue
          });
          break;
        }
      }
    }

    // Check alpha channel (emission)
    if (channels >= 4) {
      for (let i = 0; i < pixelCount; i++) {
        const pixelOffset = i * channels;
        const emission = data[pixelOffset + 3]; // Alpha channel
        
        if (emission === 255) {
          issues.push({
            level: 'error',
            message: 'Emission value of 255 will be ignored',
            suggestion: 'Use emission values 0-254, where 254 is 100% emissive',
            channel: 'alpha',
            value: emission
          });
          break;
        }
      }
    }
  }

  private validateNormalFormat(data: Buffer, info: any, issues: ValidationIssue[]) {
    const { width, height, channels } = info;
    
    // Check if this follows DirectX format (Y-)
    // Sample a few pixels to check normal vector validity
    const sampleCount = Math.min(100, width * height);
    
    for (let i = 0; i < sampleCount; i++) {
      const pixelOffset = i * channels;
      const nx = (data[pixelOffset] / 255) * 2 - 1;       // Red
      const ny = (data[pixelOffset + 1] / 255) * 2 - 1;   // Green
      const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
      
      // Check if normal vector is reasonable
      const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
      if (Math.abs(length - 1.0) > 0.1) {
        issues.push({
          level: 'warning',
          message: 'Normal vectors may not be properly normalized',
          suggestion: 'Ensure normal map is generated correctly'
        });
        break;
      }
    }

    // Check blue channel usage (should contain AO)
    if (channels >= 3) {
      let hasVariation = false;
      const firstBlue = data[2];
      
      for (let i = 1; i < Math.min(100, width * height); i++) {
        const pixelOffset = i * channels;
        if (data[pixelOffset + 2] !== firstBlue) {
          hasVariation = true;
          break;
        }
      }
      
      if (!hasVariation) {
        issues.push({
          level: 'info',
          message: 'Blue channel appears to be unused',
          suggestion: 'Consider storing ambient occlusion in the blue channel'
        });
      }
    }

    // Check alpha channel (height map)
    if (channels >= 4) {
      for (let i = 0; i < Math.min(100, width * height); i++) {
        const pixelOffset = i * channels;
        const height = data[pixelOffset + 3];
        
        if (height === 0) {
          issues.push({
            level: 'warning',
            message: 'Height map contains value 0 which may cause POM issues',
            suggestion: 'Use minimum value of 1 instead of 0 for height maps'
          });
          break;
        }
      }
    }
  }

  private isPowerOfTwo(n: number): boolean {
    return n > 0 && (n & (n - 1)) === 0;
  }

  private isNormalTexture(buffer: Buffer): boolean {
    // Simple heuristic: check if the buffer looks like a normal map
    // This is a placeholder - in practice you'd use filename or other metadata
    return false;
  }
}
