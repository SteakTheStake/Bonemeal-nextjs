import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Move, 
  Maximize2, 
  Download,
  Grid,
  Eye,
  EyeOff,
  Info
} from "lucide-react";

interface TexturePreviewProps {
  imageUrl?: string;
  imageName?: string;
  imageType?: 'albedo' | 'specular' | 'normal' | 'emission' | 'height';
  onClose?: () => void;
  className?: string;
}

export function TexturePreview({ 
  imageUrl, 
  imageName = "Texture", 
  imageType = 'albedo',
  onClose,
  className = "" 
}: TexturePreviewProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(false);
  const [channelView, setChannelView] = useState('all');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Channel viewing options for different texture types
  const getChannelOptions = () => {
    const baseOptions = [
      { value: 'all', label: 'All Channels', icon: Eye },
      { value: 'red', label: 'Red Channel', icon: Eye },
      { value: 'green', label: 'Green Channel', icon: Eye },
      { value: 'blue', label: 'Blue Channel', icon: Eye },
      { value: 'alpha', label: 'Alpha Channel', icon: Eye }
    ];

    if (imageType === 'specular') {
      return [
        { value: 'all', label: 'All Channels', icon: Eye },
        { value: 'red', label: 'Smoothness (R)', icon: Eye },
        { value: 'green', label: 'Metallic (G)', icon: Eye },
        { value: 'blue', label: 'Porosity (B)', icon: Eye },
        { value: 'alpha', label: 'SSS Amount (A)', icon: Eye }
      ];
    }

    if (imageType === 'normal') {
      return [
        { value: 'all', label: 'Normal Map', icon: Eye },
        { value: 'red', label: 'X Normal (R)', icon: Eye },
        { value: 'green', label: 'Y Normal (G)', icon: Eye },
        { value: 'blue', label: 'Z Normal (B)', icon: Eye },
        { value: 'alpha', label: 'Height (A)', icon: Eye }
      ];
    }

    return baseOptions;
  };

  // Draw the texture with current settings
  const drawTexture = useCallback(() => {
    if (!imageUrl || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const image = new Image();
    image.crossOrigin = 'anonymous';
    
    image.onload = () => {
      // Set canvas size to match container
      const container = containerRef.current;
      if (!container) return;

      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;

      // Clear canvas
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid if enabled
      if (showGrid) {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        const gridSize = 32 * zoom;
        
        for (let x = (pan.x % gridSize); x < canvas.width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        
        for (let y = (pan.y % gridSize); y < canvas.height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      }

      // Calculate image dimensions and position
      const imgWidth = image.width * zoom;
      const imgHeight = image.height * zoom;
      const x = (canvas.width - imgWidth) / 2 + pan.x;
      const y = (canvas.height - imgHeight) / 2 + pan.y;

      // Apply channel filtering
      ctx.save();
      if (channelView !== 'all') {
        ctx.globalCompositeOperation = 'multiply';
        switch (channelView) {
          case 'red':
            ctx.filter = 'sepia(1) hue-rotate(0deg) saturate(2)';
            break;
          case 'green':
            ctx.filter = 'sepia(1) hue-rotate(90deg) saturate(2)';
            break;
          case 'blue':
            ctx.filter = 'sepia(1) hue-rotate(180deg) saturate(2)';
            break;
          case 'alpha':
            ctx.filter = 'grayscale(1)';
            break;
        }
      }

      // Draw the image
      ctx.drawImage(image, x, y, imgWidth, imgHeight);
      ctx.restore();

      // Draw crosshair at center
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(centerX - 10, centerY);
      ctx.lineTo(centerX + 10, centerY);
      ctx.moveTo(centerX, centerY - 10);
      ctx.lineTo(centerX, centerY + 10);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    image.src = imageUrl;
  }, [imageUrl, zoom, pan, showGrid, channelView]);

  // Redraw when settings change
  useEffect(() => {
    drawTexture();
  }, [drawTexture]);

  // Handle mouse events for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    setPan(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));

    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.1, Math.min(10, prev + delta)));
  };

  // Reset view
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Zoom functions
  const zoomIn = () => setZoom(prev => Math.min(10, prev + 0.25));
  const zoomOut = () => setZoom(prev => Math.max(0.1, prev - 0.25));

  // Get texture type info
  const getTextureTypeInfo = () => {
    switch (imageType) {
      case 'albedo':
        return {
          name: 'Albedo (Diffuse)',
          description: 'Base color information without lighting',
          color: 'bg-blue-500'
        };
      case 'specular':
        return {
          name: 'Specular',
          description: 'Material properties: smoothness, metallic, porosity',
          color: 'bg-purple-500'
        };
      case 'normal':
        return {
          name: 'Normal',
          description: 'Surface detail and bump mapping',
          color: 'bg-green-500'
        };
      case 'emission':
        return {
          name: 'Emission',
          description: 'Self-illumination and glow effects',
          color: 'bg-yellow-500'
        };
      case 'height':
        return {
          name: 'Height',
          description: 'Surface displacement information',
          color: 'bg-orange-500'
        };
      default:
        return {
          name: 'Texture',
          description: 'Texture preview',
          color: 'bg-gray-500'
        };
    }
  };

  const typeInfo = getTextureTypeInfo();
  const channelOptions = getChannelOptions();

  if (!imageUrl) {
    return (
      <Card className={`glass-card moss-texture ${className}`}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No texture selected</p>
            <p className="text-sm">Upload a texture to preview</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`glass-card moss-texture ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${typeInfo.color} p-2 rounded-lg`}>
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{imageName}</CardTitle>
              <p className="text-sm text-muted-foreground">{typeInfo.description}</p>
            </div>
          </div>
          <Badge variant="outline" className={`${typeInfo.color} text-white border-0`}>
            {typeInfo.name}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={zoomOut}
              disabled={zoom <= 0.1}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-2 min-w-32">
              <span className="text-sm text-muted-foreground">Zoom:</span>
              <Slider
                value={[zoom]}
                onValueChange={([value]) => setZoom(value)}
                min={0.1}
                max={10}
                step={0.1}
                className="flex-1"
              />
              <span className="text-sm font-mono w-12">{(zoom * 100).toFixed(0)}%</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={zoomIn}
              disabled={zoom >= 10}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
              className={showGrid ? 'bg-primary/20' : ''}
            >
              <Grid className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={resetView}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            {onClose && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Channel Selection */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">View:</span>
          {channelOptions.map((option) => (
            <Button
              key={option.value}
              variant={channelView === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setChannelView(option.value)}
              className="text-xs"
            >
              <option.icon className="w-3 h-3 mr-1" />
              {option.label}
            </Button>
          ))}
        </div>

        <Separator />

        {/* Preview Canvas */}
        <div 
          ref={containerRef}
          className="relative w-full h-96 bg-zinc-900 rounded-lg border border-border overflow-hidden cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
          />
          
          {isDragging && (
            <div className="absolute inset-0 bg-primary/10 border-2 border-primary/50 border-dashed rounded-lg pointer-events-none flex items-center justify-center">
              <div className="bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                <Move className="w-4 h-4 inline mr-1" />
                Dragging
              </div>
            </div>
          )}

          {/* Zoom indicator */}
          <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-mono">
            {(zoom * 100).toFixed(0)}%
          </div>

          {/* Channel indicator */}
          {channelView !== 'all' && (
            <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
              {channelOptions.find(opt => opt.value === channelView)?.label}
            </div>
          )}

          {/* Instructions */}
          <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white px-3 py-2 rounded text-xs space-y-1">
            <div className="flex items-center gap-4 justify-center flex-wrap">
              <span><Move className="w-3 h-3 inline mr-1" />Drag to pan</span>
              <span><ZoomIn className="w-3 h-3 inline mr-1" />Scroll to zoom</span>
              <span><Grid className="w-3 h-3 inline mr-1" />Grid toggle</span>
            </div>
          </div>
        </div>

        {/* Texture Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Position:</span>
              <span className="font-mono">{pan.x.toFixed(0)}, {pan.y.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Zoom Level:</span>
              <span className="font-mono">{(zoom * 100).toFixed(1)}%</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Channel:</span>
              <span>{channelOptions.find(opt => opt.value === channelView)?.label || 'All'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Grid:</span>
              <span>{showGrid ? 'On' : 'Off'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TexturePreview;