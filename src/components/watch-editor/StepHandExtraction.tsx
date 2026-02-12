import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, ArrowRight, ArrowLeft, Crosshair, Shield, Eraser, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImagePickerGrid } from "./ImagePickerGrid";
import { CountSelector } from "./CountSelector";
import { generateImages, getExtractHandsPrompt, type WatchAnalysis, type GeneratedImage } from "@/lib/gemini";
import {
  processHand,
  drawPreview,
  paintBrushStroke,
  getCropDims,
  DEFAULT_HANDS,
  type HandConfig,
  type ProcessedHand,
} from "@/lib/hand-processing";
import type { SourceImage, WatchEditorAction } from "@/lib/watch-editor-types";

const HAND_LABELS = ["Hour", "Minute", "Second"] as const;
type BrushMode = "pivot" | "protect" | "remove";

interface Props {
  source: SourceImage;
  analysis: WatchAnalysis | null;
  handSheetResults: GeneratedImage[];
  handSheetSelection: string | null;
  generatingHandSheet: boolean;
  handConfigs: HandConfig[];
  extractedHands: (ProcessedHand | null)[];
  handSheetGenerateCount: number;
  dispatch: React.Dispatch<WatchEditorAction>;
  overrideMasks: React.MutableRefObject<(Uint8Array | null)[]>;
  onOpenLightbox: (img: GeneratedImage) => void;
  onDownload: (img: GeneratedImage) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function StepHandExtraction({
  source,
  analysis,
  handSheetResults,
  handSheetSelection,
  generatingHandSheet,
  handConfigs,
  extractedHands,
  handSheetGenerateCount,
  dispatch,
  overrideMasks,
  onOpenLightbox,
  onDownload,
  onContinue,
  onBack,
}: Props) {
  const [activeHand, setActiveHand] = useState(0);
  const [brushMode, setBrushMode] = useState<BrushMode>("pivot");
  const [brushSize, setBrushSize] = useState(5);
  const [showMask, setShowMask] = useState(false);
  const [canvasZoom, setCanvasZoom] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sheetImgRef = useRef<HTMLImageElement | null>(null);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const selectedImg = handSheetSelection
    ? handSheetResults.find((i) => i.id === handSheetSelection)
    : null;

  // Generate hand sheets
  const handleGenerate = useCallback(async () => {
    dispatch({ type: "SET_GENERATING_HAND_SHEET", generating: true });
    try {
      const prompt = getExtractHandsPrompt(analysis);
      const images = await generateImages(source.base64, source.mimeType, prompt, handSheetGenerateCount);
      dispatch({ type: "SET_HAND_SHEET_RESULTS", images });
    } catch {
      // silent
    } finally {
      dispatch({ type: "SET_GENERATING_HAND_SHEET", generating: false });
    }
  }, [source, analysis, handSheetGenerateCount, dispatch]);

  // Load sheet image when selection changes
  useEffect(() => {
    if (!selectedImg) {
      sheetImgRef.current = null;
      return;
    }
    const img = new Image();
    img.onload = () => {
      sheetImgRef.current = img;
      // Initialize override masks
      for (let i = 0; i < 3; i++) {
        if (!overrideMasks.current[i]) {
          const dims = getCropDims(img, handConfigs[i]);
          overrideMasks.current[i] = new Uint8Array(dims.w * dims.h);
        }
      }
      redraw();
    };
    img.src = `data:${selectedImg.mimeType};base64,${selectedImg.base64}`;
  }, [selectedImg?.id]);

  // Redraw canvas preview
  const redraw = useCallback(() => {
    if (!canvasRef.current || !sheetImgRef.current) return;
    drawPreview(
      canvasRef.current,
      sheetImgRef.current,
      handConfigs[activeHand],
      overrideMasks.current[activeHand],
      showMask,
      true
    );
  }, [handConfigs, activeHand, showMask]);

  useEffect(() => { redraw(); }, [redraw]);

  // Update a config field
  const updateConfig = useCallback(
    (field: keyof HandConfig, value: number | boolean | string) => {
      const newConfigs = [...handConfigs];
      newConfigs[activeHand] = { ...newConfigs[activeHand], [field]: value };
      dispatch({ type: "SET_HAND_CONFIGS", configs: newConfigs });

      // Resize override mask if crop changed
      if (sheetImgRef.current && (field === "cropW" || field === "cropH" || field === "cropX" || field === "cropY")) {
        const dims = getCropDims(sheetImgRef.current, newConfigs[activeHand]);
        overrideMasks.current[activeHand] = new Uint8Array(dims.w * dims.h);
      }
    },
    [handConfigs, activeHand, dispatch]
  );

  // Canvas mouse handlers for brush
  const getCanvasCoords = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    []
  );

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const pos = getCanvasCoords(e);
      if (!pos || !canvasRef.current) return;

      if (brushMode === "pivot") {
        // Set pivot from click position — single dispatch for both axes
        const canvas = canvasRef.current;
        const px = Math.round((pos.x / canvas.width) * 1000) / 10;
        const py = Math.round((pos.y / canvas.height) * 1000) / 10;
        const newConfigs = [...handConfigs];
        newConfigs[activeHand] = { ...newConfigs[activeHand], pivotX: px, pivotY: py };
        dispatch({ type: "SET_HAND_CONFIGS", configs: newConfigs });
        return;
      }

      lastPosRef.current = pos;
      const mask = overrideMasks.current[activeHand];
      if (!mask || !sheetImgRef.current) return;

      const dims = getCropDims(sheetImgRef.current, handConfigs[activeHand]);
      paintBrushStroke(
        mask, dims.w, dims.h,
        pos.x, pos.y, pos.x, pos.y,
        brushSize,
        brushMode === "protect" ? 1 : 2
      );
      redraw();
    },
    [brushMode, brushSize, activeHand, handConfigs, getCanvasCoords, redraw, dispatch]
  );

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (brushMode === "pivot" || !lastPosRef.current) return;
      const pos = getCanvasCoords(e);
      if (!pos) return;

      const mask = overrideMasks.current[activeHand];
      if (!mask || !sheetImgRef.current) return;

      const dims = getCropDims(sheetImgRef.current, handConfigs[activeHand]);
      paintBrushStroke(
        mask, dims.w, dims.h,
        lastPosRef.current.x, lastPosRef.current.y, pos.x, pos.y,
        brushSize,
        brushMode === "protect" ? 1 : 2
      );
      lastPosRef.current = pos;
      redraw();
    },
    [brushMode, brushSize, activeHand, handConfigs, getCanvasCoords, redraw]
  );

  const handleCanvasMouseUp = useCallback(() => {
    lastPosRef.current = null;
  }, []);

  // Extract all hands
  const extractAll = useCallback(() => {
    if (!sheetImgRef.current) return;
    const results: (ProcessedHand | null)[] = [];
    for (let i = 0; i < 3; i++) {
      results.push(processHand(sheetImgRef.current, handConfigs[i], overrideMasks.current[i]));
    }
    dispatch({ type: "SET_EXTRACTED_HANDS", hands: results });
  }, [handConfigs, dispatch]);

  // Auto-extract on config changes
  useEffect(() => {
    if (sheetImgRef.current) extractAll();
  }, [handConfigs]);

  // Clear current mask
  const clearMask = useCallback(() => {
    if (!sheetImgRef.current) return;
    const dims = getCropDims(sheetImgRef.current, handConfigs[activeHand]);
    overrideMasks.current[activeHand] = new Uint8Array(dims.w * dims.h);
    redraw();
    extractAll();
  }, [activeHand, handConfigs, redraw, extractAll]);

  const cfg = handConfigs[activeHand];
  const canContinue = !!(extractedHands[0] && extractedHands[1]);

  return (
    <div className="space-y-6">
      {/* Phase A — Generate hand sheets */}
      <div className="rounded-lg border border-gold/20 bg-surface-elevated p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Generate Clock Hands Sheet</p>
            <p className="text-xs text-muted-foreground">AI will create a component sheet with isolated hands</p>
          </div>
          <div className="flex items-center gap-3">
            <CountSelector value={handSheetGenerateCount} onChange={(n) => dispatch({ type: "SET_HAND_SHEET_GENERATE_COUNT", count: n })} />
            <button
              onClick={handleGenerate}
              disabled={generatingHandSheet}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gold/30 text-sm text-gold hover:bg-gold/10 transition-colors disabled:opacity-50"
            >
              {generatingHandSheet ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generatingHandSheet ? "Generating..." : `Generate ${handSheetGenerateCount}`}
            </button>
          </div>
        </div>

        <ImagePickerGrid
          images={handSheetResults}
          selected={handSheetSelection}
          onSelect={(id) => dispatch({ type: "SELECT_HAND_SHEET", imageId: id })}
          onOpenLightbox={onOpenLightbox}
          onDownload={onDownload}
          generating={generatingHandSheet}
          skeletonCount={3}
        />
      </div>

      {/* Phase B — Canvas Extraction (shown after selection) */}
      {selectedImg && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-gold/20 bg-surface-elevated p-4 space-y-4"
        >
          <p className="text-[10px] tracking-[0.2em] uppercase text-gold/60">
            Extract Individual Hands
          </p>

          {/* Hand tabs */}
          <div className="flex gap-2">
            {HAND_LABELS.map((label, i) => {
              const hand = extractedHands[i];
              return (
                <button
                  key={label}
                  onClick={() => setActiveHand(i)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    activeHand === i
                      ? "bg-gold/20 text-gold border border-gold/40"
                      : "bg-surface text-muted-foreground border border-gold/10 hover:border-gold/30"
                  )}
                >
                  {/* Color swatch */}
                  {hand && (
                    <span
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: hand.dominantColor }}
                    />
                  )}
                  {label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Controls */}
            <div className="space-y-4">
              {/* Hand details */}
              <div className="space-y-2">
                <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Hand Details</p>
                <div className="flex items-center gap-3">
                  {extractedHands[activeHand] && (
                    <span
                      className="w-5 h-5 rounded border border-gold/20"
                      style={{ backgroundColor: extractedHands[activeHand]!.dominantColor }}
                      title={`Detected: ${extractedHands[activeHand]!.dominantColor}`}
                    />
                  )}
                  <input
                    type="text"
                    value={cfg.colorName || ""}
                    onChange={(e) => updateConfig("colorName", e.target.value)}
                    placeholder="e.g. Silver, Blue Steel..."
                    className="flex-1 px-2 py-1 rounded text-xs bg-surface border border-gold/10 text-foreground placeholder:text-muted-foreground/40 focus:border-gold/30 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={cfg.hasLume ?? false}
                    onChange={(e) => updateConfig("hasLume", e.target.checked)}
                    className="accent-gold"
                  />
                  <span className="text-xs text-muted-foreground">Has luminous / fluorescent coating</span>
                </div>
              </div>

              {/* Crop sliders */}
              <div className="space-y-2">
                <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Crop Region</p>
                <SliderRow label="X" value={cfg.cropX} min={0} max={90} onChange={(v) => updateConfig("cropX", v)} />
                <SliderRow label="Y" value={cfg.cropY} min={0} max={90} onChange={(v) => updateConfig("cropY", v)} />
                <SliderRow label="W" value={cfg.cropW} min={5} max={100} onChange={(v) => updateConfig("cropW", v)} />
                <SliderRow label="H" value={cfg.cropH} min={5} max={100} onChange={(v) => updateConfig("cropH", v)} />
              </div>

              {/* Method toggle */}
              <div className="space-y-2">
                <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Method</p>
                <div className="flex gap-2">
                  {(["floodfill", "threshold"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => updateConfig("method", m)}
                      className={cn(
                        "px-3 py-1.5 rounded text-xs transition-all",
                        cfg.method === m
                          ? "bg-gold/20 text-gold border border-gold/40"
                          : "bg-surface text-muted-foreground border border-gold/10"
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Method-specific sliders */}
              {cfg.method === "floodfill" ? (
                <SliderRow label="Tolerance" value={cfg.tolerance} min={1} max={200} onChange={(v) => updateConfig("tolerance", v)} />
              ) : (
                <div className="space-y-2">
                  <SliderRow label="Threshold" value={cfg.thresholdVal} min={0} max={255} onChange={(v) => updateConfig("thresholdVal", v)} />
                  <SliderRow label="Softness" value={cfg.softness} min={0} max={50} onChange={(v) => updateConfig("softness", v)} />
                  <SliderRow label="Contrast" value={cfg.contrast} min={-100} max={100} onChange={(v) => updateConfig("contrast", v)} />
                  <SliderRow label="Brightness" value={cfg.brightness} min={-100} max={100} onChange={(v) => updateConfig("brightness", v)} />
                </div>
              )}

              <SliderRow label="Feather" value={cfg.feather} min={0} max={10} step={0.5} onChange={(v) => updateConfig("feather", v)} />
              <SliderRow label="Edge Shift" value={cfg.edgeShift ?? 0} min={-5} max={5} step={1} onChange={(v) => updateConfig("edgeShift", v)} />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={cfg.invertMask}
                  onChange={(e) => updateConfig("invertMask", e.target.checked)}
                  className="accent-gold"
                />
                <span className="text-xs text-muted-foreground">Invert mask</span>
              </div>

              {/* Pivot */}
              <div className="space-y-2">
                <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Pivot</p>
                <SliderRow label="X" value={cfg.pivotX} min={0} max={100} step={0.1} onChange={(v) => updateConfig("pivotX", v)} />
                <SliderRow label="Y" value={cfg.pivotY} min={0} max={100} step={0.1} onChange={(v) => updateConfig("pivotY", v)} />
              </div>

              {/* Brush tools */}
              <div className="space-y-2">
                <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Brush Tools</p>
                <div className="flex gap-1.5 flex-wrap">
                  {([
                    { mode: "pivot" as BrushMode, icon: Crosshair, label: "Pivot" },
                    { mode: "protect" as BrushMode, icon: Shield, label: "Protect" },
                    { mode: "remove" as BrushMode, icon: Eraser, label: "Remove" },
                  ]).map(({ mode, icon: Icon, label }) => (
                    <button
                      key={mode}
                      onClick={() => setBrushMode(mode)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-all",
                        brushMode === mode
                          ? "bg-gold/20 text-gold border border-gold/40"
                          : "bg-surface text-muted-foreground border border-gold/10"
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      {label}
                    </button>
                  ))}
                </div>
                <SliderRow label="Brush Size" value={brushSize} min={1} max={30} onChange={setBrushSize} />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={clearMask}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs border border-gold/10 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear Mask
                </button>
                <button
                  onClick={() => setShowMask(!showMask)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs border border-gold/10 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showMask ? "Show Result" : "Show Mask"}
                </button>
              </div>
            </div>

            {/* Canvas preview with zoom */}
            <div className="space-y-2">
              {/* Zoom controls */}
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => setCanvasZoom((z) => Math.max(0.5, z - 0.25))}
                  className="p-1 rounded border border-gold/10 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] text-muted-foreground w-10 text-center">{Math.round(canvasZoom * 100)}%</span>
                <button
                  onClick={() => setCanvasZoom((z) => Math.min(4, z + 0.25))}
                  className="p-1 rounded border border-gold/10 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                {canvasZoom !== 1 && (
                  <button
                    onClick={() => setCanvasZoom(1)}
                    className="text-[10px] text-muted-foreground hover:text-gold transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="overflow-auto max-h-[600px] rounded-lg border border-gold/10">
                <canvas
                  ref={canvasRef}
                  className="cursor-crosshair"
                  style={{ width: `${canvasZoom * 100}%`, imageRendering: "pixelated" }}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                />
              </div>
            </div>
          </div>

          {/* Extraction results */}
          <div className="space-y-2">
            <p className="text-[10px] tracking-[0.2em] uppercase text-gold/60">Extracted Hands</p>
            <div className="grid grid-cols-3 gap-4">
              {HAND_LABELS.map((label, i) => {
                const hand = extractedHands[i];
                const hcfg = handConfigs[i];
                return (
                  <div key={label} className="space-y-1">
                    <div
                      className="aspect-[1/3] bg-black/20 rounded-lg border border-gold/10 flex items-center justify-center overflow-hidden"
                    >
                      {hand ? (
                        <img src={hand.dataUrl} alt={`${label} hand`} className="max-h-full object-contain" />
                      ) : (
                        <span className="text-xs text-muted-foreground/30">{label}</span>
                      )}
                    </div>
                    {/* Hand info */}
                    {hand && (
                      <div className="flex items-center gap-1.5 px-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-white/10 shrink-0"
                          style={{ backgroundColor: hand.dominantColor }}
                        />
                        <span className="text-[9px] text-muted-foreground truncate">
                          {hcfg.colorName || hand.dominantColor}
                          {hcfg.hasLume && " · Lume"}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gold/20 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all bg-gradient-to-r from-gold-dark via-gold to-gold-light text-background hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ── Slider Row ── */

function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] text-muted-foreground w-16 shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-gold h-1"
      />
      <span className="text-[10px] text-muted-foreground w-10 text-right">{step < 1 ? value.toFixed(1) : value}</span>
    </div>
  );
}
