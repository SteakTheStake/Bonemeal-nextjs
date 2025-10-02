import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import JSZip from "jszip";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Eraser,
  FolderOpen,
  Leaf,
  Pencil,
  Plus,
  RefreshCw,
  Sparkles,
  Upload,
  Wand2,
  Wrench,
} from "lucide-react";
import type { CheckedState } from "@radix-ui/react-checkbox";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { analyzeLabPBRImageData, type LabPBRReport } from "@/lib/labpbr-analyzer";
import type { Project } from "@shared/schema";
import bonemeaLogo from "@assets/SkyBlock_items_enchanted_bonemeal_1752287919002.gif";

interface LoadedTexture {
  id: string;
  path: string;
  imageData: ImageData;
  dataUrl: string;
  width: number;
  height: number;
}

interface ChannelAdjustments {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface PixelEditForm {
  x: string;
  y: string;
  r: string;
  g: string;
  b: string;
  a: string;
}

const clamp255 = (value: number) => Math.max(0, Math.min(255, Math.round(value)));

const imageDataToDataUrl = (imageData: ImageData) => {
  if (typeof document === "undefined") return "";
  const canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
};

const mutateTexture = (texture: LoadedTexture, mutator: (imageData: ImageData) => void): LoadedTexture => {
  if (typeof ImageData === "undefined") {
    return texture;
  }
  const clone = new ImageData(new Uint8ClampedArray(texture.imageData.data), texture.width, texture.height);
  mutator(clone);
  return {
    ...texture,
    imageData: clone,
    dataUrl: imageDataToDataUrl(clone),
    width: clone.width,
    height: clone.height,
  };
};

const readImageDataFromBlob = async (blob: Blob): Promise<LoadedTexture> => {
  if (typeof window === "undefined") {
    throw new Error("Image decoding is only available in the browser");
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

  return await new Promise<LoadedTexture>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Unable to read canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      resolve({
        id: crypto.randomUUID(),
        path: "",
        dataUrl,
        imageData,
        width: img.width,
        height: img.height,
      });
    };
    img.onerror = () => reject(new Error("Unable to decode image"));
    img.src = dataUrl;
  });
};

const loadTexturesFromZip = async (file: File) => {
  const zip = await JSZip.loadAsync(file);
  const entries = Object.values(zip.files).filter((entry) => !entry.dir && /\.png$/i.test(entry.name));

  const textures: LoadedTexture[] = [];

  for (const entry of entries) {
    try {
      const blob = await entry.async("blob");
      const texture = await readImageDataFromBlob(blob);
      textures.push({
        ...texture,
        id: entry.name,
        path: entry.name,
      });
    } catch (error) {
      console.error(`Failed to read texture ${entry.name}`, error);
    }
  }

  return textures;
};
export default function Greenhouse() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", description: "" });
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const [textures, setTextures] = useState<LoadedTexture[]>([]);
  const [packName, setPackName] = useState<string | null>(null);
  const [packLoading, setPackLoading] = useState(false);
  const [packError, setPackError] = useState<string | null>(null);
  const [selectedTextureIds, setSelectedTextureIds] = useState<string[]>([]);
  const [activeTextureId, setActiveTextureId] = useState<string | null>(null);
  const [labReports, setLabReports] = useState<Record<string, LabPBRReport>>({});
  const [channelAdjustments, setChannelAdjustments] = useState<ChannelAdjustments>({ r: 0, g: 0, b: 0, a: 0 });
  const [pixelEdit, setPixelEdit] = useState<PixelEditForm>({ x: "", y: "", r: "0", g: "0", b: "0", a: "255" });

  const { data: projects, isLoading: isProjectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  useEffect(() => {
    if (!projects || projects.length === 0) return;
    if (selectedProjectId === null) {
      setSelectedProjectId(projects[0].id);
      return;
    }
    const exists = projects.some((project) => project.id === selectedProjectId);
    if (!exists) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const createProjectMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const response = await apiRequest("POST", "/api/projects", data);
      if (!response.ok) throw new Error("Failed to create project");
      return response.json() as Promise<Project>;
    },
    onSuccess: (project) => {
      toast({ title: "Project created" });
      setIsCreateOpen(false);
      setCreateForm({ name: "", description: "" });
      setSelectedProjectId(project.id);
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
    onError: () => {
      toast({ title: "Failed to create project", variant: "destructive" });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, name, description }: { id: number; name: string; description: string }) => {
      const response = await apiRequest("PATCH", `/api/projects/${id}`, { name, description });
      if (!response.ok) throw new Error("Failed to update project");
      return response.json() as Promise<Project>;
    },
    onSuccess: (project) => {
      toast({ title: "Project updated" });
      setIsEditOpen(false);
      setProjectToEdit(null);
      setEditForm({ name: "", description: "" });
      setSelectedProjectId(project.id);
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
    onError: () => {
      toast({ title: "Failed to update project", variant: "destructive" });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/projects/${id}`);
      if (!response.ok) throw new Error("Failed to delete project");
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({ title: "Project deleted" });
      setIsDeleteOpen(false);
      setProjectToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      if (selectedProjectId === variables) {
        setSelectedProjectId(null);
      }
    },
    onError: () => {
      toast({ title: "Failed to delete project", variant: "destructive" });
    },
  });

  const onDropPack = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];
      if (!file.name.toLowerCase().endsWith(".zip")) {
        toast({ title: "Unsupported file", description: "Please drop a .zip resource pack", variant: "destructive" });
        return;
      }

      try {
        setPackLoading(true);
        setPackError(null);
        const loadedTextures = await loadTexturesFromZip(file);
        if (loadedTextures.length === 0) {
          setTextures([]);
          setSelectedTextureIds([]);
          setActiveTextureId(null);
          setPackName(file.name);
          setLabReports({});
          toast({ title: "Pack loaded", description: "No PNG textures found in the archive." });
        } else {
          setTextures(loadedTextures);
          setSelectedTextureIds(loadedTextures.map((texture) => texture.id));
          setActiveTextureId(loadedTextures[0]?.id ?? null);
          setPackName(file.name);
          setLabReports({});
          toast({ title: "Pack ready", description: `Loaded ${loadedTextures.length} textures from ${file.name}.` });
        }
      } catch (error) {
        console.error("Failed to load resource pack", error);
        setPackError(error instanceof Error ? error.message : "Unable to load resource pack");
        toast({
          title: "Failed to load resource pack",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
      } finally {
        setPackLoading(false);
      }
    },
    [toast],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropPack,
    multiple: false,
    accept: { "application/zip": [".zip"] },
  });

  const activeTexture = useMemo(
    () => textures.find((texture) => texture.id === activeTextureId) ?? null,
    [textures, activeTextureId],
  );

  const activeReport = activeTextureId ? labReports[activeTextureId] : undefined;
  const selectedProject = projects?.find((project) => project.id === selectedProjectId) ?? null;
  const hasSelection = selectedTextureIds.length > 0;

  const toggleTextureSelection = (id: string, checked: CheckedState) => {
    setSelectedTextureIds((prev) => {
      if (checked) {
        if (prev.includes(id)) return prev;
        return [...prev, id];
      }
      return prev.filter((textureId) => textureId !== id);
    });
  };
  const applyChannelAdjustments = () => {
    if (!activeTextureId) return;
    const { r, g, b, a } = channelAdjustments;
    if (r === 0 && g === 0 && b === 0 && a === 0) return;

    setTextures((prev) =>
      prev.map((texture) => {
        if (texture.id !== activeTextureId) return texture;
        return mutateTexture(texture, (imageData) => {
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            data[i] = clamp255(data[i] + r);
            data[i + 1] = clamp255(data[i + 1] + g);
            data[i + 2] = clamp255(data[i + 2] + b);
            data[i + 3] = clamp255(data[i + 3] + a);
          }
        });
      }),
    );

    setLabReports((prev) => {
      if (!activeTextureId) return prev;
      const next = { ...prev };
      delete next[activeTextureId];
      return next;
    });

    toast({ title: "Channel adjustments applied" });
    setChannelAdjustments({ r: 0, g: 0, b: 0, a: 0 });
  };

  const applyPixelEdit = () => {
    if (!activeTexture) return;
    const x = parseInt(pixelEdit.x, 10);
    const y = parseInt(pixelEdit.y, 10);
    if (Number.isNaN(x) || Number.isNaN(y)) {
      toast({ title: "Pixel coordinates required", variant: "destructive" });
      return;
    }
    if (x < 0 || y < 0 || x >= activeTexture.width || y >= activeTexture.height) {
      toast({ title: "Pixel out of bounds", variant: "destructive" });
      return;
    }

    const r = clamp255(parseInt(pixelEdit.r, 10) || 0);
    const g = clamp255(parseInt(pixelEdit.g, 10) || 0);
    const b = clamp255(parseInt(pixelEdit.b, 10) || 0);
    const a = clamp255(parseInt(pixelEdit.a, 10) || 0);

    setTextures((prev) =>
      prev.map((texture) => {
        if (texture.id !== activeTexture.id) return texture;
        return mutateTexture(texture, (imageData) => {
          const { data, width } = imageData;
          const index = (y * width + x) * 4;
          data[index] = r;
          data[index + 1] = g;
          data[index + 2] = b;
          data[index + 3] = a;
        });
      }),
    );

    setLabReports((prev) => {
      const next = { ...prev };
      delete next[activeTexture.id];
      return next;
    });

    toast({ title: "Pixel updated" });
  };

  const handleFixTransparentEdges = () => {
    if (!hasSelection) return;
    setTextures((prev) =>
      prev.map((texture) => {
        if (!selectedTextureIds.includes(texture.id)) return texture;
        return mutateTexture(texture, (imageData) => {
          const { data, width, height } = imageData;
          if (width === 0 || height === 0) return;

          let sumR = 0;
          let sumG = 0;
          let sumB = 0;
          let count = 0;

          const isInterior = (x: number, y: number) => x > 0 && x < width - 1 && y > 0 && y < height - 1;

          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              const idx = (y * width + x) * 4;
              const alpha = data[idx + 3];
              if (isInterior(x, y) && alpha > 0) {
                sumR += data[idx];
                sumG += data[idx + 1];
                sumB += data[idx + 2];
                count++;
              }
            }
          }

          if (count === 0) {
            for (let i = 0; i < data.length; i += 4) {
              sumR += data[i];
              sumG += data[i + 1];
              sumB += data[i + 2];
              count++;
            }
          }

          const avgR = count > 0 ? clamp255(sumR / count) : 0;
          const avgG = count > 0 ? clamp255(sumG / count) : 0;
          const avgB = count > 0 ? clamp255(sumB / count) : 0;

          const applyEdge = (x: number, y: number) => {
            const idx = (y * width + x) * 4;
            data[idx] = avgR;
            data[idx + 1] = avgG;
            data[idx + 2] = avgB;
            data[idx + 3] = 255;
          };

          for (let x = 0; x < width; x++) {
            applyEdge(x, 0);
            applyEdge(x, height - 1);
          }
          for (let y = 0; y < height; y++) {
            applyEdge(0, y);
            applyEdge(width - 1, y);
          }
        });
      }),
    );

    setLabReports((prev) => {
      const next = { ...prev };
      selectedTextureIds.forEach((id) => {
        delete next[id];
      });
      return next;
    });

    toast({
      title: "Edges solidified",
      description: `Updated ${selectedTextureIds.length} textures to remove transparent fringes.`,
    });
  };

  const handleAnalyzeSelection = () => {
    if (!hasSelection) return;
    const nextReports: Record<string, LabPBRReport> = {};
    selectedTextureIds.forEach((id) => {
      const texture = textures.find((item) => item.id === id);
      if (!texture) return;
      nextReports[id] = analyzeLabPBRImageData(texture.imageData);
    });
    setLabReports((prev) => ({ ...prev, ...nextReports }));
    toast({
      title: "LabPBR analysis complete",
      description: `Analyzed ${Object.keys(nextReports).length} texture(s).`,
    });
  };

  const handleAutoBalanceF0 = () => {
    if (!hasSelection) return;
    setTextures((prev) =>
      prev.map((texture) => {
        if (!selectedTextureIds.includes(texture.id)) return texture;
        const report = analyzeLabPBRImageData(texture.imageData);
        const target = report.closestMaterial?.f0 ?? (report.avgF0Encoded !== null ? Math.round(report.avgF0Encoded) : null);
        if (target === null) return texture;
        return mutateTexture(texture, (imageData) => {
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            if (data[i + 1] <= 229) {
              data[i + 1] = clamp255(target);
            }
          }
        });
      }),
    );

    setLabReports((prev) => {
      const next = { ...prev };
      selectedTextureIds.forEach((id) => delete next[id]);
      return next;
    });

    toast({
      title: "Dielectric F0 balanced",
      description: "Aligned dielectric regions with the closest catalog material.",
    });
  };

  const handleClampMetalCodes = () => {
    if (!hasSelection) return;
    setTextures((prev) =>
      prev.map((texture) => {
        if (!selectedTextureIds.includes(texture.id)) return texture;
        return mutateTexture(texture, (imageData) => {
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            if (data[i + 1] > 237) {
              data[i + 1] = 237;
            }
            if (data[i + 1] < 0) {
              data[i + 1] = 0;
            }
          }
        });
      }),
    );

    setLabReports((prev) => {
      const next = { ...prev };
      selectedTextureIds.forEach((id) => delete next[id]);
      return next;
    });

    toast({ title: "LabPBR ranges clamped" });
  };

  const resetWorkspace = () => {
    setTextures([]);
    setSelectedTextureIds([]);
    setActiveTextureId(null);
    setPackName(null);
    setPackError(null);
    setLabReports({});
    toast({ title: "Workspace cleared" });
  };

  const handleOpenEdit = (project: Project) => {
    setProjectToEdit(project);
    setEditForm({ name: project.name, description: project.description ?? "" });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const selectedReports = useMemo(
    () =>
      selectedTextureIds.map((id) => ({
        id,
        texture: textures.find((texture) => texture.id === id) ?? null,
        report: labReports[id],
      })),
    [selectedTextureIds, labReports, textures],
  );
  return (
    <div className="min-h-screen bg-background text-foreground organic-bg">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <img src={bonemeaLogo} alt="Bonemeal" className="h-10 w-10" style={{ imageRendering: "pixelated" }} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-primary">Greenhouse Workspace</h1>
                <Leaf className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Manage projects, edit textures, and keep LabPBR assets healthy.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/projects">
              <Button variant="outline" size="sm">
                <FolderOpen className="mr-2 h-4 w-4" />
                Projects
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto space-y-6 px-4 py-6">
        <div className="grid gap-6 xl:grid-cols-[360px_1fr_320px]">
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  <span>Projects</span>
                  <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New
                  </Button>
                </CardTitle>
                <CardDescription>Pick a project to associate with this editing session.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="h-64 rounded border">
                  <div className="divide-y">
                    {isProjectsLoading && <div className="p-4 text-sm text-muted-foreground">Loading projects…</div>}
                    {!isProjectsLoading && (!projects || projects.length === 0) && (
                      <div className="p-4 text-sm text-muted-foreground">No projects yet. Create one to get started.</div>
                    )}
                    {projects?.map((project) => {
                      const isActive = project.id === selectedProjectId;
                      return (
                        <div
                          key={project.id}
                          className={`flex flex-col gap-2 p-4 transition ${
                            isActive ? "bg-primary/10" : "hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <button
                                type="button"
                                onClick={() => setSelectedProjectId(project.id)}
                                className="text-left"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{project.name}</span>
                                  {isActive && <Badge>Active</Badge>}
                                </div>
                                <p className="text-xs text-muted-foreground">Updated {formatDate(project.updatedAt)}</p>
                              </button>
                              {project.description && (
                                <p className="mt-2 text-xs text-muted-foreground">{project.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEdit(project)}
                                className="h-8 w-8"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDelete(project)}
                                className="h-8 w-8"
                              >
                                <Eraser className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <Badge variant="secondary">Textures: {project.textureCount ?? 0}</Badge>
                            <Badge variant="outline">Status: {project.status}</Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>

                {selectedProject && (
                  <div className="rounded border p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Selected: {selectedProject.name}</span>
                      <Link href={`/projects/${selectedProject.id}`}>
                        <Button size="sm" variant="outline">
                          <FolderOpen className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </Link>
                    </div>
                    {selectedProject.description && (
                      <p className="mt-2 text-muted-foreground">{selectedProject.description}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Resource Pack</CardTitle>
                <CardDescription>Drop a ZIP to inspect and edit its PNG textures.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  {...getRootProps()}
                  className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded border-2 border-dashed p-6 text-center transition ${
                    isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:border-primary/50"
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium">
                      {packLoading ? "Loading…" : isDragActive ? "Release to import" : "Upload resource pack ZIP"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      We read PNG textures directly in the browser. No upload required.
                    </p>
                  </div>
                </div>

                {packName && (
                  <div className="rounded border p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{packName}</span>
                      <Button variant="ghost" size="sm" onClick={resetWorkspace}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reset
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {textures.length} texture{textures.length === 1 ? "" : "s"} loaded
                    </p>
                    {packError && <p className="mt-1 text-xs text-destructive">{packError}</p>}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedTextureIds(textures.map((texture) => texture.id))}
                    disabled={textures.length === 0}
                  >
                    Select All
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedTextureIds([])}
                    disabled={textures.length === 0}
                  >
                    Clear
                  </Button>
                  <span className="text-muted-foreground">{selectedTextureIds.length} selected</span>
                </div>

                <ScrollArea className="h-72 rounded border">
                  <div className="divide-y">
                    {textures.length === 0 && (
                      <div className="p-4 text-sm text-muted-foreground">No textures loaded yet.</div>
                    )}
                    {textures.map((texture) => {
                      const isChecked = selectedTextureIds.includes(texture.id);
                      const analyzed = labReports[texture.id];
                      const hasWarnings = analyzed && analyzed.warnings.length > 0;
                      return (
                        <div key={texture.id} className="flex items-center gap-3 p-3">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => toggleTextureSelection(texture.id, checked)}
                          />
                          <button
                            type="button"
                            onClick={() => setActiveTextureId(texture.id)}
                            className={`flex flex-1 items-center gap-3 rounded p-2 text-left transition ${
                              activeTextureId === texture.id ? "bg-primary/10" : "hover:bg-muted"
                            }`}
                          >
                            <img
                              src={texture.dataUrl}
                              alt={texture.path}
                              className="h-12 w-12 rounded border object-cover"
                              style={{ imageRendering: "pixelated" }}
                            />
                            <div className="flex-1">
                              <p className="truncate text-sm font-medium" title={texture.path}>
                                {texture.path || "Texture"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {texture.width}×{texture.height}
                              </p>
                            </div>
                            {analyzed ? (
                              hasWarnings ? (
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              )
                            ) : null}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Texture Editor</CardTitle>
              <CardDescription>
                Simple per-channel adjustments and per-pixel tweaks. Use quick actions for batch fixes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {activeTexture ? (
                <>
                  <div className="flex flex-col gap-4 lg:flex-row">
                    <div className="flex-1">
                      <div className="rounded border bg-muted/20 p-3">
                        <img
                          src={activeTexture.dataUrl}
                          alt={activeTexture.path}
                          className="mx-auto max-h-96 w-full rounded border object-contain"
                          style={{ imageRendering: "pixelated" }}
                        />
                      </div>
                    </div>
                    <div className="w-full max-w-xs space-y-3 text-sm">
                      <div className="rounded border p-3">
                        <h3 className="text-sm font-semibold">Details</h3>
                        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                          <p>Path: {activeTexture.path || "(unnamed)"}</p>
                          <p>Size: {activeTexture.width}×{activeTexture.height}</p>
                          <p>Selection: {selectedTextureIds.length} file(s)</p>
                        </div>
                      </div>
                      {activeReport && (
                        <div className="rounded border p-3">
                          <h3 className="text-sm font-semibold">Last LabPBR Analysis</h3>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                            <Badge variant="secondary">F0: {activeReport.greenF0CoveragePct.toFixed(1)}%</Badge>
                            <Badge variant="secondary">Metals: {activeReport.greenMetalCoveragePct.toFixed(1)}%</Badge>
                            <Badge variant="outline">Smoothness avg: {activeReport.avgRed.toFixed(1)}</Badge>
                            <Badge variant="outline">Emission avg: {activeReport.avgEmissionPct.toFixed(1)}%</Badge>
                          </div>
                          {activeReport.closestMaterial && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              Closest dielectric: {activeReport.closestMaterial.name} ({activeReport.closestMaterial.category})
                            </p>
                          )}
                          {activeReport.warnings.length > 0 && (
                            <ul className="mt-2 space-y-1 text-xs text-destructive">
                              {activeReport.warnings.slice(0, 3).map((warning, index) => (
                                <li key={index}>• {warning}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <section className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold">RGBA Channel Adjustments</h3>
                      <p className="text-xs text-muted-foreground">
                        Apply additive adjustments (-255 to 255) to the entire active texture.
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-4">
                      {(["r", "g", "b", "a"] as const).map((channel) => (
                        <div key={channel} className="space-y-1">
                          <Label htmlFor={`${channel}-adjust`} className="text-xs uppercase">
                            {channel.toUpperCase()}
                          </Label>
                          <Input
                            id={`${channel}-adjust`}
                            type="number"
                            min={-255}
                            max={255}
                            value={channelAdjustments[channel]}
                            onChange={(event) =>
                              setChannelAdjustments((prev) => ({
                                ...prev,
                                [channel]: Number(event.target.value || 0),
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button onClick={applyChannelAdjustments} disabled={!activeTextureId}>
                        <Wrench className="mr-2 h-4 w-4" />
                        Apply adjustments
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setChannelAdjustments({ r: 0, g: 0, b: 0, a: 0 })}
                      >
                        Reset sliders
                      </Button>
                    </div>
                  </section>

                  <Separator />

                  <section className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold">Single Pixel Editor</h3>
                      <p className="text-xs text-muted-foreground">
                        Target a specific pixel (x, y) in the active texture and overwrite its RGBA values.
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-6">
                      <div className="sm:col-span-1 space-y-1">
                        <Label htmlFor="pixel-x" className="text-xs uppercase">
                          X
                        </Label>
                        <Input
                          id="pixel-x"
                          type="number"
                          min={0}
                          max={activeTexture.width - 1}
                          value={pixelEdit.x}
                          onChange={(event) => setPixelEdit((prev) => ({ ...prev, x: event.target.value }))}
                        />
                      </div>
                      <div className="sm:col-span-1 space-y-1">
                        <Label htmlFor="pixel-y" className="text-xs uppercase">
                          Y
                        </Label>
                        <Input
                          id="pixel-y"
                          type="number"
                          min={0}
                          max={activeTexture.height - 1}
                          value={pixelEdit.y}
                          onChange={(event) => setPixelEdit((prev) => ({ ...prev, y: event.target.value }))}
                        />
                      </div>
                      {(["r", "g", "b", "a"] as const).map((channel) => (
                        <div key={channel} className="space-y-1">
                          <Label htmlFor={`pixel-${channel}`} className="text-xs uppercase">
                            {channel.toUpperCase()}
                          </Label>
                          <Input
                            id={`pixel-${channel}`}
                            type="number"
                            min={0}
                            max={255}
                            value={pixelEdit[channel]}
                            onChange={(event) =>
                              setPixelEdit((prev) => ({ ...prev, [channel]: event.target.value }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button onClick={applyPixelEdit}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Update pixel
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setPixelEdit({ x: "", y: "", r: "0", g: "0", b: "0", a: "255" })}
                      >
                        Clear form
                      </Button>
                    </div>
                  </section>
                </>
              ) : (
                <div className="rounded border border-dashed p-12 text-center text-sm text-muted-foreground">
                  Load a resource pack and select a texture to begin editing.
                </div>
              )}
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Quick LabPBR Actions</CardTitle>
                <CardDescription>Run consistent fixes across all selected textures.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start"
                  variant="secondary"
                  onClick={handleFixTransparentEdges}
                  disabled={!hasSelection}
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  Fix transparent edges
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="secondary"
                  onClick={handleAnalyzeSelection}
                  disabled={!hasSelection}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze LabPBR channels
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="secondary"
                  onClick={handleAutoBalanceF0}
                  disabled={!hasSelection}
                >
                  <Wrench className="mr-2 h-4 w-4" />
                  Balance dielectric F0
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="secondary"
                  onClick={handleClampMetalCodes}
                  disabled={!hasSelection}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Clamp metal code range
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="ghost"
                  onClick={() => setLabReports({})}
                  disabled={Object.keys(labReports).length === 0}
                >
                  <Eraser className="mr-2 h-4 w-4" />
                  Clear cached analysis
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>LabPBR Status</CardTitle>
                <CardDescription>Summary for the currently selected textures.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="rounded border p-3">
                  <p className="font-medium">Selection</p>
                  <p className="text-xs text-muted-foreground">{selectedTextureIds.length} texture(s) highlighted</p>
                </div>
                <ScrollArea className="h-64 rounded border">
                  <div className="divide-y">
                    {selectedReports.length === 0 && (
                      <div className="p-4 text-xs text-muted-foreground">Select textures and run the analyzer to view compliance.</div>
                    )}
                    {selectedReports.map(({ id, texture, report }) => (
                      <div key={id} className="space-y-2 p-4 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{texture?.path ?? id}</span>
                          {report ? (
                            report.warnings.length > 0 ? (
                              <Badge variant="destructive">{report.warnings.length} warnings</Badge>
                            ) : (
                              <Badge variant="secondary">Pass</Badge>
                            )
                          ) : (
                            <Badge variant="outline">Not analyzed</Badge>
                          )}
                        </div>
                        {report && (
                          <div className="space-y-1 text-muted-foreground">
                            <p>F0 coverage: {report.greenF0CoveragePct.toFixed(1)}%</p>
                            <p>Metal coverage: {report.greenMetalCoveragePct.toFixed(1)}%</p>
                            <p>Emission avg: {report.avgEmissionPct.toFixed(1)}%</p>
                            {report.closestMaterial && (
                              <p>Closest: {report.closestMaterial.name}</p>
                            )}
                            {report.warnings.length > 0 && (
                              <ul className="space-y-1 text-destructive">
                                {report.warnings.slice(0, 2).map((warning, index) => (
                                  <li key={index}>• {warning}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create project</DialogTitle>
            <DialogDescription>Organize conversions and texture edits by project.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-project-name">Name</Label>
              <Input
                id="new-project-name"
                value={createForm.name}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-project-description">Description</Label>
              <Textarea
                id="new-project-description"
                value={createForm.description}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (!createForm.name.trim()) {
                  toast({ title: "Project name required", variant: "destructive" });
                  return;
                }
                createProjectMutation.mutate(createForm);
              }}
              disabled={createProjectMutation.isPending}
            >
              {createProjectMutation.isPending ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit project</DialogTitle>
            <DialogDescription>Update the name or description of your project.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-project-name">Name</Label>
              <Input
                id="edit-project-name"
                value={editForm.name}
                onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-project-description">Description</Label>
              <Textarea
                id="edit-project-description"
                value={editForm.description}
                onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (!projectToEdit) return;
                if (!editForm.name.trim()) {
                  toast({ title: "Project name required", variant: "destructive" });
                  return;
                }
                updateProjectMutation.mutate({
                  id: projectToEdit.id,
                  name: editForm.name,
                  description: editForm.description,
                });
              }}
              disabled={updateProjectMutation.isPending}
            >
              {updateProjectMutation.isPending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete project</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Conversions associated with this project will be orphaned.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!projectToDelete) return;
                deleteProjectMutation.mutate(projectToDelete.id);
              }}
              disabled={deleteProjectMutation.isPending}
            >
              {deleteProjectMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}