import { type ValidationIssue } from "@shared/schema";

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
}

export class LabPBRValidator {
  static validateSpecularTexture(imageData: ImageData): ValidationResult {
    const issues: ValidationIssue[] = [];
    const { data, width, height } = imageData;
    
    // Check each pixel
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];     // Smoothness
      const g = data[i + 1]; // F0
      const b = data[i + 2]; // Porosity/SSS
      const a = data[i + 3]; // Emission
      
      // Validate red channel (smoothness)
      if (r < 0 || r > 255) {
        issues.push({
          level: 'error',
          message: 'Invalid smoothness value',
          channel: 'red',
          value: r
        });
      }
      
      // Validate green channel (F0)
      if (g > 229 && g < 230) {
        issues.push({
          level: 'error',
          message: 'Invalid F0 value in reserved range',
          channel: 'green',
          value: g
        });
      }
      
      // Validate alpha channel (emission)
      if (a === 255) {
        issues.push({
          level: 'error',
          message: 'Emission value 255 will be ignored',
          channel: 'alpha',
          value: a
        });
      }
    }
    
    return {
      isValid: issues.filter(i => i.level === 'error').length === 0,
      issues
    };
  }
  
  static validateNormalTexture(imageData: ImageData): ValidationResult {
    const issues: ValidationIssue[] = [];
    const { data, width, height } = imageData;
    
    // Sample some pixels to check normal validity
    const sampleSize = Math.min(100, data.length / 4);
    
    for (let i = 0; i < sampleSize; i++) {
      const idx = i * 4;
      const r = data[idx];     // X component
      const g = data[idx + 1]; // Y component
      const b = data[idx + 2]; // Z component / AO
      const a = data[idx + 3]; // Height
      
      // Convert to normal vector
      const nx = (r / 255) * 2 - 1;
      const ny = (g / 255) * 2 - 1;
      const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
      
      // Check if normal is reasonable
      const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
      if (Math.abs(length - 1.0) > 0.1) {
        issues.push({
          level: 'warning',
          message: 'Normal vector may not be properly normalized',
          suggestion: 'Ensure normal map is generated correctly'
        });
        break; // Don't spam with too many warnings
      }
      
      // Check height map (alpha channel)
      if (a === 0) {
        issues.push({
          level: 'warning',
          message: 'Height map uses value 0 which may cause POM issues',
          suggestion: 'Use minimum value of 1 for height maps'
        });
        break;
      }
    }
    
    return {
      isValid: issues.filter(i => i.level === 'error').length === 0,
      issues
    };
  }
  
  static validateImageFormat(file: File): ValidationResult {
    const issues: ValidationIssue[] = [];
    
    // Check file extension
    const extension = file.name.toLowerCase().split('.').pop();
    if (extension !== 'png') {
      issues.push({
        level: 'warning',
        message: 'Texture should be in PNG format for best compatibility',
        suggestion: 'Convert to PNG format'
      });
    }
    
    return {
      isValid: issues.filter(i => i.level === 'error').length === 0,
      issues
    };
  }
}
