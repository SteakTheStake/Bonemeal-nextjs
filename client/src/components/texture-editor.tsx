import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brush, 
  Eraser, 
  Pipette, 
  Square, 
  Circle, 
  Download, 
  Upload,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Grid3x3,
  Layers,
  Palette
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TextureEditorProps {
  initialImage?: string;
  onSave?: (imageData: Blob) => void;
}

export default function TextureEditor({ initialImage, onSave }: TextureEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<'brush' | 'eraser' | 'picker' | 'rect' | 'circle'>('brush');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [opacity, setOpacity] = useState(100);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const { toast } = useToast();

  // Minecraft color palette
  const minecraftColors = [
    '#000000', '#1D1D21', '#3C3C3C', '#593D29',
    '#B4684D', '#FF0000', '#FF5500', '#FFAA00',
    '#FFFF00', '#00FF00', '#00FFAA', '#00AAFF',
    '#0000FF', '#AA00FF', '#FF00FF', '#FFFFFF'
  ];

  useEffect(() => {
    if (initialImage && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      const img = new Image();
      img.onload = () => {
        if (ctx && canvasRef.current) {
          canvasRef.current.width = img.width;
          canvasRef.current.height = img.height;
          ctx.drawImage(img, 0, 0);
          saveToHistory();
        }
      };
      img.src = initialImage;
    }
  }, [initialImage]);

  const saveToHistory = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(imageData);
    
    if (newHistory.length > 50) newHistory.shift(); // Limit history
    
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
    if (historyStep > 0) {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx && history[historyStep - 1]) {
        ctx.putImageData(history[historyStep - 1], 0, 0);
        setHistoryStep(historyStep - 1);
      }
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx && history[historyStep + 1]) {
        ctx.putImageData(history[historyStep + 1], 0, 0);
        setHistoryStep(historyStep + 1);
      }
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    ctx.globalAlpha = opacity / 100;

    if (tool === 'brush') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (tool === 'picker') {
      const imageData = ctx.getImageData(x, y, 1, 1);
      const [r, g, b] = imageData.data;
      const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
      setColor(hex);
      setTool('brush');
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  const handleSave = () => {
    if (!canvasRef.current) return;
    
    canvasRef.current.toBlob((blob) => {
      if (blob) {
        onSave?.(blob);
        toast({ title: "Texture saved successfully" });
      }
    }, 'image/png');
  };

  const handleExport = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = 'texture.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <Card className="p-6 moss-card">
      <div className="flex gap-4">
        {/* Toolbar */}
        <div className="w-64 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={tool === 'brush' ? 'default' : 'outline'}
              onClick={() => setTool('brush')}
              className="grow-button"
            >
              <Brush className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={tool === 'eraser' ? 'default' : 'outline'}
              onClick={() => setTool('eraser')}
              className="grow-button"
            >
              <Eraser className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={tool === 'picker' ? 'default' : 'outline'}
              onClick={() => setTool('picker')}
              className="grow-button"
            >
              <Pipette className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={tool === 'rect' ? 'default' : 'outline'}
              onClick={() => setTool('rect')}
              className="grow-button"
            >
              <Square className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={tool === 'circle' ? 'default' : 'outline'}
              onClick={() => setTool('circle')}
              className="grow-button"
            >
              <Circle className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-12 rounded cursor-pointer"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 px-2 py-1 rounded border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Minecraft Palette</Label>
            <div className="grid grid-cols-4 gap-1">
              {minecraftColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-10 h-10 rounded border-2 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c, borderColor: color === c ? '#fff' : 'transparent' }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Brush Size: {brushSize}px</Label>
            <Slider
              value={[brushSize]}
              onValueChange={([v]) => setBrushSize(v)}
              min={1}
              max={50}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label>Opacity: {opacity}%</Label>
            <Slider
              value={[opacity]}
              onValueChange={([v]) => setOpacity(v)}
              min={0}
              max={100}
              step={5}
            />
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={undo} className="grow-button">
              <Undo className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={redo} className="grow-button">
              <Redo className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              onClick={() => setShowGrid(!showGrid)}
              variant={showGrid ? 'default' : 'outline'}
              className="grow-button"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={() => setZoom(Math.min(zoom * 1.2, 10))} className="grow-button">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={() => setZoom(Math.max(zoom / 1.2, 0.1))} className="grow-button">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm">Zoom: {Math.round(zoom * 100)}%</span>
          </div>

          <div className="space-y-2">
            <Button onClick={handleSave} className="w-full grow-button moss-texture">
              Save Texture
            </Button>
            <Button onClick={handleExport} variant="outline" className="w-full grow-button">
              <Download className="h-4 w-4 mr-2" />
              Export PNG
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto border rounded-lg bg-gray-100 dark:bg-gray-900">
          <div
            className="relative inline-block"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              backgroundImage: showGrid ? 
                'repeating-linear-gradient(0deg, #ccc 0px, transparent 1px, transparent 15px, #ccc 16px), repeating-linear-gradient(90deg, #ccc 0px, transparent 1px, transparent 15px, #ccc 16px)' : 
                'none'
            }}
          >
            <canvas
              ref={canvasRef}
              width={256}
              height={256}
              className="border cursor-crosshair"
              style={{ imageRendering: zoom > 2 ? 'pixelated' : 'auto' }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}