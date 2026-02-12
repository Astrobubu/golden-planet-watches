import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, ArrowRight, ArrowLeft, ZoomIn, ZoomOut } from "lucide-react";
import { ImagePickerGrid } from "./ImagePickerGrid";
import { CountSelector } from "./CountSelector";
import { generateImages, getRemoveHandsPrompt, type WatchAnalysis, type GeneratedImage } from "@/lib/gemini";
import { LiveWatchFace, type WatchHandsConfig, type ExtractedHand } from "@/components/LiveWatchFace";
import type { ProcessedHand } from "@/lib/hand-processing";
import type { SourceImage, AngleKey, WatchEditorAction } from "@/lib/watch-editor-types";

interface Props {
  source: SourceImage;
  analysis: WatchAnalysis | null;
  angleSelections: Record<AngleKey, string | null>;
  angleResults: Record<AngleKey, GeneratedImage[]>;
  cleanDialResults: GeneratedImage[];
  cleanDialSelection: string | null;
  generatingCleanDial: boolean;
  extractedHands: (ProcessedHand | null)[];
  handConfigs: import("@/lib/hand-processing").HandConfig[];
  watchHandsConfig: WatchHandsConfig;
  cleanDialGenerateCount: number;
  dispatch: React.Dispatch<WatchEditorAction>;
  onOpenLightbox: (img: GeneratedImage) => void;
  onDownload: (img: GeneratedImage) => void;
  onContinue: () => void;
  onBack: () => void;
}

function processedToExtracted(
  hand: ProcessedHand | null,
  cfg: import("@/lib/hand-processing").HandConfig
): ExtractedHand | null {
  if (!hand) return null;
  return {
    dataUrl: hand.dataUrl,
    naturalWidth: hand.width,
    naturalHeight: hand.height,
    pivotX: cfg.pivotX,
    pivotY: cfg.pivotY,
  };
}

export function StepCleanDial({
  source,
  analysis,
  angleSelections,
  angleResults,
  cleanDialResults,
  cleanDialSelection,
  generatingCleanDial,
  extractedHands,
  handConfigs,
  watchHandsConfig,
  cleanDialGenerateCount,
  dispatch,
  onOpenLightbox,
  onDownload,
  onContinue,
  onBack,
}: Props) {
  const [sourceType, setSourceType] = useState<"original" | "catalog">("original");
  const [showGuides, setShowGuides] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(1);

  const catalogSel = angleSelections.catalog;
  const catalogImg = catalogSel ? angleResults.catalog.find((i) => i.id === catalogSel) : null;

  const handleGenerate = useCallback(async () => {
    const useImg = sourceType === "catalog" && catalogImg ? catalogImg : null;
    const base64 = useImg ? useImg.base64 : source.base64;
    const mimeType = useImg ? useImg.mimeType : source.mimeType;

    dispatch({ type: "SET_GENERATING_CLEAN_DIAL", generating: true });
    try {
      const prompt = getRemoveHandsPrompt(analysis);
      const images = await generateImages(base64, mimeType, prompt, cleanDialGenerateCount);
      dispatch({ type: "SET_CLEAN_DIAL_RESULTS", images });
    } catch {
      // silent
    } finally {
      dispatch({ type: "SET_GENERATING_CLEAN_DIAL", generating: false });
    }
  }, [source, analysis, sourceType, catalogImg, cleanDialGenerateCount, dispatch]);

  const selectedImg = cleanDialSelection
    ? cleanDialResults.find((i) => i.id === cleanDialSelection)
    : null;

  const cleanDialDataUrl = selectedImg
    ? `data:${selectedImg.mimeType};base64,${selectedImg.base64}`
    : undefined;

  const extractedHandsForPreview = {
    hour: processedToExtracted(extractedHands[0], handConfigs[0]),
    minute: processedToExtracted(extractedHands[1], handConfigs[1]),
    second: processedToExtracted(extractedHands[2], handConfigs[2]),
  };

  // Reference image: use catalog shot if available, otherwise source
  const referenceImgUrl = catalogImg
    ? `data:${catalogImg.mimeType};base64,${catalogImg.base64}`
    : source.previewUrl;

  const updateConfig = useCallback(
    (field: keyof WatchHandsConfig, value: number) => {
      dispatch({
        type: "SET_WATCH_CONFIG",
        config: { ...watchHandsConfig, [field]: value },
      });
    },
    [watchHandsConfig, dispatch]
  );

  const handleImageClick = useCallback(
    (xPct: number, yPct: number) => {
      dispatch({
        type: "SET_WATCH_CONFIG",
        config: {
          ...watchHandsConfig,
          cx: Math.round(xPct * 10) / 10,
          cy: Math.round(yPct * 10) / 10,
        },
      });
    },
    [watchHandsConfig, dispatch]
  );

  return (
    <div className="space-y-6">
      {/* Section A — Generate clean dial */}
      <div className="rounded-lg border border-gold/20 bg-surface-elevated p-4 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">Generate Clean Dial</p>
            <p className="text-xs text-muted-foreground">Remove all hands from the watch face</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Source selector */}
            <div className="flex gap-1">
              <button
                onClick={() => setSourceType("original")}
                className={`px-3 py-1.5 rounded text-xs transition-all ${
                  sourceType === "original"
                    ? "bg-gold/20 text-gold border border-gold/40"
                    : "bg-surface text-muted-foreground border border-gold/10"
                }`}
              >
                Original
              </button>
              {catalogImg && (
                <button
                  onClick={() => setSourceType("catalog")}
                  className={`px-3 py-1.5 rounded text-xs transition-all ${
                    sourceType === "catalog"
                      ? "bg-gold/20 text-gold border border-gold/40"
                      : "bg-surface text-muted-foreground border border-gold/10"
                  }`}
                >
                  Catalog Shot
                </button>
              )}
            </div>

            <CountSelector value={cleanDialGenerateCount} onChange={(n) => dispatch({ type: "SET_CLEAN_DIAL_GENERATE_COUNT", count: n })} />

            <button
              onClick={handleGenerate}
              disabled={generatingCleanDial}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gold/30 text-sm text-gold hover:bg-gold/10 transition-colors disabled:opacity-50"
            >
              {generatingCleanDial ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generatingCleanDial ? "Generating..." : `Generate ${cleanDialGenerateCount}`}
            </button>
          </div>
        </div>

        <ImagePickerGrid
          images={cleanDialResults}
          selected={cleanDialSelection}
          onSelect={(id) => dispatch({ type: "SELECT_CLEAN_DIAL", imageId: id })}
          onOpenLightbox={onOpenLightbox}
          onDownload={onDownload}
          generating={generatingCleanDial}
          skeletonCount={cleanDialGenerateCount}
        />
      </div>

      {/* Section B — Live Preview with Reference Image */}
      {selectedImg && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-gold/20 bg-surface-elevated p-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] tracking-[0.2em] uppercase text-gold/60">
              Calibrate Live Preview
            </p>
            <div className="flex items-center gap-3">
              {/* Zoom controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewZoom((z) => Math.max(0.5, z - 0.25))}
                  className="p-1 rounded border border-gold/10 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] text-muted-foreground w-10 text-center">{Math.round(previewZoom * 100)}%</span>
                <button
                  onClick={() => setPreviewZoom((z) => Math.min(4, z + 0.25))}
                  className="p-1 rounded border border-gold/10 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                {previewZoom !== 1 && (
                  <button
                    onClick={() => setPreviewZoom(1)}
                    className="text-[10px] text-muted-foreground hover:text-gold transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowGuides(!showGuides)}
                className="text-xs text-muted-foreground hover:text-gold transition-colors"
              >
                {showGuides ? "Hide Guides" : "Show Guides"}
              </button>
            </div>
          </div>

          {/* Reference + Live side by side */}
          <div className="overflow-auto max-h-[700px]">
            <div className="grid grid-cols-2 gap-4" style={{ width: `${previewZoom * 100}%`, maxWidth: `${previewZoom * 100}%` }}>
              {/* Reference image */}
              <div className="space-y-2">
                <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground text-center">
                  Reference (match hands to this)
                </p>
                <div className="rounded-lg border border-gold/10 overflow-hidden bg-black/20">
                  <img
                    src={referenceImgUrl}
                    alt="Reference"
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>

              {/* Live face preview */}
              <div className="space-y-2">
                <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground text-center">
                  Live Preview (click to set center)
                </p>
                <div className="rounded-lg border border-gold/10 overflow-hidden">
                  <LiveWatchFace
                    imageSrc={cleanDialDataUrl}
                    config={watchHandsConfig}
                    extractedHands={extractedHandsForPreview}
                    showGuides={showGuides}
                    onImageClick={handleImageClick}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Config controls */}
          <div className="max-w-2xl mx-auto space-y-3">
            <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
              Hand Configuration
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
              <ConfigSlider label="Center X" value={watchHandsConfig.cx} min={0} max={100} step={0.1} onChange={(v) => updateConfig("cx", v)} />
              <ConfigSlider label="Center Y" value={watchHandsConfig.cy} min={0} max={100} step={0.1} onChange={(v) => updateConfig("cy", v)} />
              <ConfigSlider label="Radius" value={watchHandsConfig.radius} min={5} max={50} step={0.5} onChange={(v) => updateConfig("radius", v)} />
            </div>
            <div className="border-t border-gold/10 pt-3 mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
              <ConfigSlider label="Hour Len" value={watchHandsConfig.hourLen} min={20} max={100} onChange={(v) => updateConfig("hourLen", v)} />
              <ConfigSlider label="Min Len" value={watchHandsConfig.minLen} min={20} max={100} onChange={(v) => updateConfig("minLen", v)} />
              <ConfigSlider label="Sec Len" value={watchHandsConfig.secLen} min={20} max={100} onChange={(v) => updateConfig("secLen", v)} />
              <ConfigSlider label="Sec Tail" value={watchHandsConfig.secTail} min={0} max={50} onChange={(v) => updateConfig("secTail", v)} />
            </div>
            <div className="border-t border-gold/10 pt-3 mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
              <ConfigSlider label="Hour W" value={watchHandsConfig.hourW} min={1} max={20} step={0.5} onChange={(v) => updateConfig("hourW", v)} />
              <ConfigSlider label="Min W" value={watchHandsConfig.minW} min={1} max={15} step={0.5} onChange={(v) => updateConfig("minW", v)} />
              <ConfigSlider label="Sec W" value={watchHandsConfig.secW} min={0.5} max={5} step={0.25} onChange={(v) => updateConfig("secW", v)} />
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
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all bg-gradient-to-r from-gold-dark via-gold to-gold-light text-background hover:opacity-90"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function ConfigSlider({
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
      <span className="text-[10px] text-muted-foreground w-10 text-right">
        {typeof value === "number" ? (step < 1 ? value.toFixed(1) : value) : value}
      </span>
    </div>
  );
}
