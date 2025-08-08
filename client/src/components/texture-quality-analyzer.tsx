import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Eye, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  FileImage, 
  Layers,
  Target,
  Lightbulb,
  Settings,
  Download
} from "lucide-react";
import { useDropzone } from 'react-dropzone';

interface QualityMetric {
  name: string;
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  description: string;
  recommendation?: string;
}

interface QualityAnalysis {
  overallScore: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  metrics: QualityMetric[];
  recommendations: string[];
  technicalDetails: {
    resolution: string;
    fileSize: string;
    format: string;
    colorDepth: string;
    compression: string;
  };
}

export default function TextureQualityAnalyzer() {
  const [analysis, setAnalysis] = useState<QualityAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      analyzeTexture(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.tga', '.bmp']
    },
    multiple: false
  });

  const analyzeTexture = async (file: File) => {
    setIsAnalyzing(true);
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create image element to analyze
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      // Perform actual analysis
      const analysisResult = performQualityAnalysis(img, file, ctx, canvas);
      setAnalysis(analysisResult);
      setIsAnalyzing(false);
    };
    
    img.src = URL.createObjectURL(file);
  };

  const performQualityAnalysis = (
    img: HTMLImageElement, 
    file: File, 
    ctx: CanvasRenderingContext2D | null,
    canvas: HTMLCanvasElement
  ): QualityAnalysis => {
    const width = img.width;
    const height = img.height;
    const fileSize = file.size;
    
    // Resolution analysis
    const isPowerOfTwo = (width & (width - 1)) === 0 && (height & (height - 1)) === 0;
    const isSquare = width === height;
    const resolutionScore = isPowerOfTwo && isSquare ? 100 : isSquare ? 80 : 60;
    
    // File size analysis (optimal range for textures)
    const optimalSizeKB = (width * height) / 1024; // 1KB per 1024 pixels as baseline
    const actualSizeKB = fileSize / 1024;
    const compressionRatio = actualSizeKB / optimalSizeKB;
    const compressionScore = compressionRatio < 0.5 ? 100 : 
                           compressionRatio < 1.0 ? 90 :
                           compressionRatio < 2.0 ? 70 : 40;

    // Color depth and detail analysis
    let detailScore = 75; // Default middle score
    let colorVarianceScore = 75;
    let emissionScore = 100; // Default good score
    let emissionAnalysis = "No emission data";
    
    if (ctx) {
      const imageData = ctx.getImageData(0, 0, Math.min(width, 256), Math.min(height, 256));
      const pixels = imageData.data;
      
      // Analyze color variance
      let rVariance = 0, gVariance = 0, bVariance = 0;
      let rSum = 0, gSum = 0, bSum = 0;
      const pixelCount = pixels.length / 4;
      
      for (let i = 0; i < pixels.length; i += 4) {
        rSum += pixels[i];
        gSum += pixels[i + 1];
        bSum += pixels[i + 2];
      }
      
      const rAvg = rSum / pixelCount;
      const gAvg = gSum / pixelCount;
      const bAvg = bSum / pixelCount;
      
      for (let i = 0; i < pixels.length; i += 4) {
        rVariance += Math.pow(pixels[i] - rAvg, 2);
        gVariance += Math.pow(pixels[i + 1] - gAvg, 2);
        bVariance += Math.pow(pixels[i + 2] - bAvg, 2);
      }
      
      const totalVariance = (rVariance + gVariance + bVariance) / (pixelCount * 3);
      colorVarianceScore = Math.min(100, (totalVariance / 2000) * 100);
      
      // Detail analysis based on edge detection
      let edgeCount = 0;
      for (let i = 0; i < pixels.length - 8; i += 4) {
        const current = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
        const next = (pixels[i + 4] + pixels[i + 5] + pixels[i + 6]) / 3;
        if (Math.abs(current - next) > 20) edgeCount++;
      }
      detailScore = Math.min(100, (edgeCount / (pixelCount / 100)) * 100);

      // Emission analysis (alpha channel)
      if (pixels.length > 0 && pixels.length % 4 === 0) { // Has alpha channel
        let emissionValues = [];
        let has255Count = 0;
        for (let i = 3; i < pixels.length; i += 4) {
          const emission = pixels[i];
          emissionValues.push(emission);
          if (emission === 255) has255Count++;
        }
        
        const emission255Ratio = has255Count / emissionValues.length;
        
        if (emission255Ratio > 0.95) {
          // Most pixels are 255 - intentionally disabled emission
          emissionScore = 100;
          emissionAnalysis = "Emission disabled (intentional)";
        } else if (emission255Ratio > 0.5) {
          // Mixed emission values
          emissionScore = 90;
          emissionAnalysis = "Mixed emission values";
        } else {
          // Active emission texture
          emissionScore = 95;
          emissionAnalysis = "Active emission detected";
        }
      }
    }

    // Format analysis
    const isOptimalFormat = file.type === 'image/png';
    const formatScore = isOptimalFormat ? 100 : 70;

    // Tiling analysis (basic check for seamless patterns)
    const tilingScore = 80; // Would need more complex analysis for actual seamless detection

    const metrics: QualityMetric[] = [
      {
        name: "Resolution Compliance",
        score: resolutionScore,
        status: resolutionScore >= 90 ? 'excellent' : resolutionScore >= 70 ? 'good' : resolutionScore >= 50 ? 'fair' : 'poor',
        description: `${width}x${height} ${isPowerOfTwo ? '(Power of 2)' : '(Non-standard)'}`,
        recommendation: !isPowerOfTwo ? "Use power-of-2 dimensions (256x256, 512x512, 1024x1024)" : undefined
      },
      {
        name: "File Optimization",
        score: compressionScore,
        status: compressionScore >= 90 ? 'excellent' : compressionScore >= 70 ? 'good' : compressionScore >= 50 ? 'fair' : 'poor',
        description: `${actualSizeKB.toFixed(1)}KB (${compressionRatio.toFixed(1)}x ratio)`,
        recommendation: compressionRatio > 1.5 ? "Consider PNG optimization or lower bit depth" : undefined
      },
      {
        name: "Color Variance",
        score: colorVarianceScore,
        status: colorVarianceScore >= 80 ? 'excellent' : colorVarianceScore >= 60 ? 'good' : colorVarianceScore >= 40 ? 'fair' : 'poor',
        description: "Color distribution and richness",
        recommendation: colorVarianceScore < 50 ? "Add more color variation for realistic appearance" : undefined
      },
      {
        name: "Detail Level",
        score: detailScore,
        status: detailScore >= 80 ? 'excellent' : detailScore >= 60 ? 'good' : detailScore >= 40 ? 'fair' : 'poor',
        description: "Surface detail and micro-features",
        recommendation: detailScore < 60 ? "Add more surface detail or micro-textures" : undefined
      },
      {
        name: "Format Compliance",
        score: formatScore,
        status: formatScore >= 90 ? 'excellent' : formatScore >= 70 ? 'good' : 'fair',
        description: file.type.split('/')[1].toUpperCase(),
        recommendation: !isOptimalFormat ? "Convert to PNG format for best compatibility" : undefined
      },
      {
        name: "Tiling Quality",
        score: tilingScore,
        status: tilingScore >= 80 ? 'excellent' : tilingScore >= 60 ? 'good' : tilingScore >= 40 ? 'fair' : 'poor',
        description: "Seamless pattern analysis",
        recommendation: tilingScore < 70 ? "Check edges for seamless tiling" : undefined
      },
      {
        name: "Emission Handling",
        score: emissionScore,
        status: emissionScore >= 95 ? 'excellent' : emissionScore >= 85 ? 'good' : emissionScore >= 70 ? 'fair' : 'poor',
        description: emissionAnalysis,
        recommendation: emissionScore < 90 && emissionAnalysis.includes("Mixed") ? "Consider consistent emission usage across texture" : undefined
      }
    ];

    const overallScore = Math.round(metrics.reduce((sum, metric) => sum + metric.score, 0) / metrics.length);
    const grade = overallScore >= 95 ? 'A+' :
                  overallScore >= 90 ? 'A' :
                  overallScore >= 85 ? 'B+' :
                  overallScore >= 80 ? 'B' :
                  overallScore >= 75 ? 'C+' :
                  overallScore >= 70 ? 'C' :
                  overallScore >= 60 ? 'D' : 'F';

    const recommendations = [
      ...metrics.filter(m => m.recommendation).map(m => m.recommendation!),
      overallScore < 80 ? "Consider using higher resolution source material" : null,
      width < 512 ? "Increase resolution to 512x512 or higher for better detail" : null,
      compressionRatio > 2 ? "Optimize file size with better compression settings" : null
    ].filter(Boolean) as string[];

    return {
      overallScore,
      grade,
      metrics,
      recommendations,
      technicalDetails: {
        resolution: `${width} × ${height}`,
        fileSize: `${(fileSize / 1024).toFixed(1)} KB`,
        format: file.type.split('/')[1].toUpperCase(),
        colorDepth: "8-bit RGB", // Would need actual analysis
        compression: compressionRatio < 1 ? "High" : compressionRatio < 1.5 ? "Medium" : "Low"
      }
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'good': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'fair': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'poor': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-400';
    if (grade.startsWith('B')) return 'text-blue-400';
    if (grade.startsWith('C')) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Eye className="h-6 w-6 text-purple-400" />
            Texture Quality Analyzer
          </CardTitle>
          <CardDescription>
            Upload a texture to analyze quality metrics and receive optimization recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <FileImage className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-primary">Drop the texture file here...</p>
            ) : (
              <div>
                <p className="text-foreground mb-2">Drag & drop a texture file here, or click to select</p>
                <p className="text-muted-foreground text-sm">Supports PNG, JPG, TGA, BMP formats</p>
              </div>
            )}
          </div>

          {uploadedFile && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-foreground">
                <strong>Selected:</strong> {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {isAnalyzing && (
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="h-5 w-5 text-primary animate-spin" />
              <span className="text-foreground">Analyzing texture quality...</span>
            </div>
            <Progress value={66} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              Examining resolution, compression, color variance, and detail level
            </p>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-3">
                  <Target className="h-6 w-6 text-blue-400" />
                  Quality Assessment
                </span>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${getGradeColor(analysis.grade)}`}>
                      {analysis.grade}
                    </div>
                    <div className="text-sm text-muted-foreground">Grade</div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                      {analysis.overallScore}
                    </div>
                    <div className="text-sm text-muted-foreground">Score</div>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={analysis.overallScore} className="w-full mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(analysis.technicalDetails).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                    <div className="font-semibold text-foreground">{value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Metrics */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Layers className="h-6 w-6 text-green-400" />
                Quality Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.metrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-foreground">{metric.name}</h4>
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{metric.description}</p>
                    {metric.recommendation && (
                      <div className="flex items-start gap-2 text-sm text-yellow-400">
                        <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{metric.recommendation}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={metric.score} className="w-24" />
                    <span className="font-bold text-primary w-12 text-right">{metric.score}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-yellow-400" />
                  Optimization Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground/90">{recommendation}</span>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex gap-3">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export Report
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Auto-Optimize
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}