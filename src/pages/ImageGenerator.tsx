import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Loader2,
  Download,
  Check,
  Sparkles,
  Scissors,
  Eraser,
  Image as ImageIcon,
  RefreshCw,
  ArrowRight,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  analyzeWatch,
  generateImages,
  CATALOG_PROMPT,
  getExtractHandsPrompt,
  getRemoveHandsPrompt,
  type WatchAnalysis,
  type GeneratedImage,
} from "@/lib/gemini";

type Mode = "catalog" | "extract" | "remove";

interface SourceImage {
  base64: string;
  mimeType: string;
  previewUrl: string;
}

const MODES: { key: Mode; label: string; icon: typeof ImageIcon }[] = [
  { key: "catalog", label: "Catalog Shot", icon: ImageIcon },
  { key: "extract", label: "Extract Hands", icon: Scissors },
  { key: "remove", label: "Remove Hands", icon: Eraser },
];

const COUNT_OPTIONS = [1, 2, 3, 4, 5, 6];

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1];
      resolve({ base64, mimeType: file.type });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ImageGenerator() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [source, setSource] = useState<SourceImage | null>(null);
  const [analysis, setAnalysis] = useState<WatchAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const [mode, setMode] = useState<Mode>("catalog");
  const [count, setCount] = useState(3);
  const [results, setResults] = useState<Record<Mode, GeneratedImage[]>>({
    catalog: [],
    extract: [],
    remove: [],
  });
  const [selected, setSelected] = useState<Record<Mode, string | null>>({
    catalog: null,
    extract: null,
    remove: null,
  });
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<GeneratedImage | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });

  const handleAnalyze = useCallback(async (base64: string, mimeType: string) => {
    setAnalyzing(true);
    setAnalyzeError(null);
    setAnalysis(null);
    try {
      const result = await analyzeWatch(base64, mimeType);
      setAnalysis(result);
    } catch (e) {
      setAnalyzeError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const { base64, mimeType } = await fileToBase64(file);
      const previewUrl = URL.createObjectURL(file);
      setSource({ base64, mimeType, previewUrl });
      setAnalysis(null);
      setAnalyzeError(null);
      setResults({ catalog: [], extract: [], remove: [] });
      setSelected({ catalog: null, extract: null, remove: null });
      setGenerationError(null);
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const clearSource = useCallback(() => {
    if (source?.previewUrl) URL.revokeObjectURL(source.previewUrl);
    setSource(null);
    setAnalysis(null);
    setAnalyzeError(null);
    setResults({ catalog: [], extract: [], remove: [] });
    setSelected({ catalog: null, extract: null, remove: null });
    setGenerationError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [source]);

  const getPrompt = useCallback(
    (m: Mode, currentAnalysis: WatchAnalysis | null) => {
      switch (m) {
        case "catalog":
          return CATALOG_PROMPT;
        case "extract":
          return getExtractHandsPrompt(currentAnalysis);
        case "remove":
          return getRemoveHandsPrompt(currentAnalysis);
      }
    },
    []
  );

  const handleGenerate = useCallback(async () => {
    if (!source) return;
    setGenerating(true);
    setGenerationError(null);

    try {
      // Auto-analyze first for extract/remove modes if not already done
      let currentAnalysis = analysis;
      if ((mode === "extract" || mode === "remove") && !currentAnalysis) {
        setAnalyzing(true);
        setAnalyzeError(null);
        try {
          currentAnalysis = await analyzeWatch(source.base64, source.mimeType);
          setAnalysis(currentAnalysis);
        } catch (e) {
          setAnalyzeError(e instanceof Error ? e.message : "Analysis failed");
          // Continue with generation anyway, just without analysis data
        } finally {
          setAnalyzing(false);
        }
      }

      const prompt = getPrompt(mode, currentAnalysis);
      const imgs = await generateImages(source.base64, source.mimeType, prompt, count);
      if (imgs.length === 0) {
        setGenerationError("No images were generated. Try again.");
      } else {
        setResults((prev) => ({ ...prev, [mode]: imgs }));
        setSelected((prev) => ({ ...prev, [mode]: null }));
      }
    } catch (e) {
      setGenerationError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }, [source, mode, count, analysis, getPrompt]);

  const toggleSelect = useCallback(
    (id: string) => {
      setSelected((prev) => ({
        ...prev,
        [mode]: prev[mode] === id ? null : id,
      }));
    },
    [mode]
  );

  const downloadImage = useCallback((img: GeneratedImage, filename: string) => {
    const link = document.createElement("a");
    link.href = `data:${img.mimeType};base64,${img.base64}`;
    link.download = filename;
    link.click();
  }, []);

  const handleDownloadSelected = useCallback(() => {
    const selId = selected[mode];
    if (!selId) return;
    const img = results[mode].find((i) => i.id === selId);
    if (img) downloadImage(img, `watch-${mode}-${Date.now()}.png`);
  }, [mode, selected, results, downloadImage]);

  const handleUseAsSource = useCallback(() => {
    const selId = selected[mode];
    if (!selId) return;
    const img = results[mode].find((i) => i.id === selId);
    if (!img) return;

    const previewUrl = `data:${img.mimeType};base64,${img.base64}`;
    setSource({ base64: img.base64, mimeType: img.mimeType, previewUrl });
    setAnalysis(null);
    setAnalyzeError(null);
    setResults({ catalog: [], extract: [], remove: [] });
    setSelected({ catalog: null, extract: null, remove: null });
    setGenerationError(null);
  }, [mode, selected, results]);

  const currentResults = results[mode];
  const currentSelected = selected[mode];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container pt-28 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold/60 mb-2">
            AI-Powered
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-gold-gradient mb-3">
            Watch Image Studio
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Generate catalog-ready product images, extract hands, or create clean dials using Gemini AI.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column — Upload & Analysis */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Upload Zone */}
            <div className="rounded-lg border border-gold/20 bg-surface-elevated overflow-hidden">
              <div className="p-4">
                <p className="text-[10px] tracking-[0.2em] uppercase text-gold/60 mb-3">
                  Source Image
                </p>

                {!source ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    className="relative flex flex-col items-center justify-center gap-3 p-10 border-2 border-dashed border-gold/20 rounded-lg cursor-pointer transition-colors hover:border-gold/40 hover:bg-gold/5"
                  >
                    <Upload className="w-8 h-8 text-gold/40" />
                    <p className="text-sm text-muted-foreground text-center">
                      Drag & drop a watch photo
                      <br />
                      <span className="text-gold/60">or click to browse</span>
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative rounded-lg overflow-hidden aspect-square bg-black/30">
                      <img
                        src={source.previewUrl}
                        alt="Source watch"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <button
                      onClick={clearSource}
                      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-gold transition-colors"
                    >
                      <X className="w-3 h-3" />
                      Clear & Upload New
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Analysis Card */}
            {source && !analysis && !analyzing && !analyzeError && (
              <button
                onClick={() => handleAnalyze(source.base64, source.mimeType)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-gold/30 bg-surface-elevated text-sm text-gold hover:bg-gold/10 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Analyze Watch
              </button>
            )}
            <AnimatePresence mode="wait">
              {(analyzing || analysis || analyzeError) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-lg border border-gold/20 bg-surface-elevated p-4"
                >
                  <p className="text-[10px] tracking-[0.2em] uppercase text-gold/60 mb-3">
                    Watch Analysis
                  </p>

                  {analyzing && (
                    <div className="flex items-center gap-3 py-4">
                      <Loader2 className="w-4 h-4 text-gold animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        Analyzing watch...
                      </span>
                    </div>
                  )}

                  {analyzeError && (
                    <p className="text-sm text-red-400">{analyzeError}</p>
                  )}

                  {analysis && !analyzing && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Brand</span>
                        <span className="text-foreground font-medium">{analysis.brand}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Model</span>
                        <span className="text-foreground font-medium">{analysis.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Reference</span>
                        <span className="text-foreground font-medium">{analysis.reference}</span>
                      </div>
                      <Separator className="my-2 bg-gold/10" />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dial</span>
                        <span className="text-foreground">{analysis.dialColor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Case</span>
                        <span className="text-foreground">{analysis.caseMaterial}</span>
                      </div>
                      <Separator className="my-2 bg-gold/10" />
                      {(["hour", "minute", "second"] as const).map((hand) => {
                        const h = analysis.hands[hand];
                        if (h.shape === "not visible" || h.shape === "not present") return null;
                        return (
                          <div key={hand} className="mb-3">
                            <p className="text-[10px] tracking-[0.2em] uppercase text-gold/60 mt-2 mb-1">
                              {hand} hand
                            </p>
                            <div className="space-y-0.5 text-xs">
                              <div><span className="text-muted-foreground">Shape: </span><span className="text-foreground">{h.shape}</span></div>
                              <div><span className="text-muted-foreground">Material: </span><span className="text-foreground">{h.material}, {h.finish}</span></div>
                              <div><span className="text-muted-foreground">Color: </span><span className="text-foreground">{h.color}</span></div>
                              <div><span className="text-muted-foreground">Tip: </span><span className="text-foreground">{h.tipShape}</span></div>
                              <div><span className="text-muted-foreground">Base: </span><span className="text-foreground">{h.baseShape}</span></div>
                              <div><span className="text-muted-foreground">Lume: </span><span className="text-foreground">{h.lumePosition} ({h.lumeColor})</span></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right Column — Generation */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Mode Tabs */}
            <div className="flex flex-wrap gap-2">
              {MODES.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all",
                    mode === m.key
                      ? "border-gold/50 bg-gold/10 text-gold"
                      : "border-gold/10 bg-surface-elevated text-muted-foreground hover:border-gold/30 hover:text-foreground"
                  )}
                >
                  <m.icon className="w-4 h-4" />
                  {m.label}
                </button>
              ))}
            </div>

            {/* Generation Controls */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-[0.2em] uppercase text-gold/60">
                  Count
                </span>
                <div className="flex gap-1">
                  {COUNT_OPTIONS.map((n) => (
                    <button
                      key={n}
                      onClick={() => setCount(n)}
                      className={cn(
                        "w-8 h-8 rounded text-sm font-medium transition-all",
                        count === n
                          ? "bg-gold/20 text-gold border border-gold/40"
                          : "bg-surface-elevated text-muted-foreground border border-gold/10 hover:border-gold/30"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!source || generating}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all",
                  source && !generating
                    ? "bg-gradient-to-r from-gold-dark via-gold to-gold-light text-background hover:opacity-90"
                    : "bg-surface-elevated text-muted-foreground/40 cursor-not-allowed"
                )}
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {generating ? "Generating..." : "Generate"}
              </button>
            </div>

            {generationError && (
              <p className="text-sm text-red-400">{generationError}</p>
            )}

            {/* Results Grid */}
            <div>
              {generating && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.from({ length: count }).map((_, i) => (
                    <Skeleton
                      key={i}
                      className="aspect-square rounded-lg bg-surface-elevated"
                    />
                  ))}
                </div>
              )}

              {!generating && currentResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 md:grid-cols-3 gap-4"
                >
                  {currentResults.map((img, idx) => {
                    const isSelected = currentSelected === img.id;
                    return (
                      <motion.div
                        key={img.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => toggleSelect(img.id)}
                        className={cn(
                          "group relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all",
                          isSelected
                            ? "border-gold shadow-gold"
                            : "border-transparent hover:border-gold/30"
                        )}
                      >
                        <img
                          src={`data:${img.mimeType};base64,${img.base64}`}
                          alt={`Generated ${mode} ${idx + 1}`}
                          className="w-full h-full object-contain bg-black/30"
                        />

                        {/* Selected check */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gold flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-background" />
                          </div>
                        )}

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setZoom(1);
                              setPan({ x: 0, y: 0 });
                              setLightbox(img);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-elevated/90 text-xs text-foreground hover:bg-gold/20 transition-colors"
                          >
                            <ZoomIn className="w-3 h-3" />
                            Open
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadImage(img, `watch-${mode}-${idx + 1}.png`);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-elevated/90 text-xs text-foreground hover:bg-gold/20 transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            Save
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const previewUrl = `data:${img.mimeType};base64,${img.base64}`;
                              setSource({ base64: img.base64, mimeType: img.mimeType, previewUrl });
                              setAnalysis(null);
                              setAnalyzeError(null);
                              setResults({ catalog: [], extract: [], remove: [] });
                              setSelected({ catalog: null, extract: null, remove: null });
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-elevated/90 text-xs text-foreground hover:bg-gold/20 transition-colors"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Use
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}

              {!generating && currentResults.length === 0 && source && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Sparkles className="w-10 h-10 text-gold/20 mb-4" />
                  <p className="text-muted-foreground text-sm">
                    Select a mode and click Generate to create images
                  </p>
                </div>
              )}

              {!source && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Upload className="w-10 h-10 text-gold/20 mb-4" />
                  <p className="text-muted-foreground text-sm">
                    Upload a watch photo to get started
                  </p>
                </div>
              )}
            </div>

            {/* Selected Actions Bar */}
            <AnimatePresence>
              {currentSelected && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center gap-3 p-4 rounded-lg border border-gold/20 bg-surface-elevated"
                >
                  <span className="text-xs text-muted-foreground mr-auto">
                    1 image selected
                  </span>
                  <button
                    onClick={handleDownloadSelected}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gold/30 text-sm text-foreground hover:bg-gold/10 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Selected
                  </button>
                  <button
                    onClick={handleUseAsSource}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold/15 border border-gold/30 text-sm text-gold hover:bg-gold/25 transition-colors"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    Use as New Source
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex flex-col"
            onClick={() => setLightbox(null)}
          >
            {/* Toolbar */}
            <div
              className="flex items-center justify-between px-6 py-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom((z) => Math.min(z + 0.5, 5))}
                  className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoom((z) => Math.max(z - 0.5, 0.5))}
                  className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                  className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <span className="text-xs text-white/50 ml-2">{Math.round(zoom * 100)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadImage(lightbox, `watch-${mode}-${Date.now()}.png`)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 text-white text-xs hover:bg-white/20 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
                <button
                  onClick={() => setLightbox(null)}
                  className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Image */}
            <div
              className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => {
                if (zoom > 1) {
                  isPanning.current = true;
                  panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
                }
              }}
              onMouseMove={(e) => {
                if (isPanning.current) {
                  setPan({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y });
                }
              }}
              onMouseUp={() => { isPanning.current = false; }}
              onMouseLeave={() => { isPanning.current = false; }}
              onWheel={(e) => {
                e.preventDefault();
                setZoom((z) => Math.min(Math.max(z + (e.deltaY > 0 ? -0.25 : 0.25), 0.5), 5));
              }}
            >
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transition: isPanning.current ? "none" : "transform 0.2s ease",
                }}
              >
                <img
                  src={`data:${lightbox.mimeType};base64,${lightbox.base64}`}
                  alt="Zoomed view"
                  className="max-w-[90vw] max-h-[85vh] object-contain select-none"
                  draggable={false}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
