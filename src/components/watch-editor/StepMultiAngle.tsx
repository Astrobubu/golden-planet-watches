import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Image as ImageIcon, Coffee, Hand, Shirt, Sparkles, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { AngleCard } from "./AngleCard";
import { generateImages, CATALOG_PROMPT, type WatchAnalysis, type GeneratedImage } from "@/lib/gemini";
import { getTablePrompt, getEmiratiPrompt, getSuitPrompt } from "@/lib/watch-editor-prompts";
import type { AngleKey, SourceImage, WatchEditorAction } from "@/lib/watch-editor-types";
import type { Watch } from "@/lib/mock-watches";

const ANGLES: { key: AngleKey; title: string; description: string; icon: typeof ImageIcon }[] = [
  { key: "catalog", title: "Front-Facing Catalog", description: "Clean product shot on white background", icon: ImageIcon },
  { key: "table", title: "Lifestyle — Table Setting", description: "On warm wood with masculine props", icon: Coffee },
  { key: "emirati", title: "Emirati Wrist", description: "Worn with white kandora", icon: Hand },
  { key: "suit", title: "Suited Wrist", description: "Formal suit wrist shot", icon: Shirt },
];

interface Props {
  source: SourceImage;
  analysis: WatchAnalysis | null;
  watchDetails: Partial<Watch>;
  angleResults: Record<AngleKey, GeneratedImage[]>;
  angleSelections: Record<AngleKey, string | null>;
  generatingAngle: AngleKey | null;
  angleGenerateCounts: Record<AngleKey, number>;
  dispatch: React.Dispatch<WatchEditorAction>;
  onOpenLightbox: (img: GeneratedImage) => void;
  onDownload: (img: GeneratedImage) => void;
  onContinue: () => void;
  onBack: () => void;
}

function getPromptForAngle(
  angle: AngleKey,
  analysis: WatchAnalysis | null,
  details: Partial<Watch>
): string {
  switch (angle) {
    case "catalog": return CATALOG_PROMPT;
    case "table": return getTablePrompt(analysis, details);
    case "emirati": return getEmiratiPrompt(analysis, details);
    case "suit": return getSuitPrompt(analysis, details);
  }
}

export function StepMultiAngle({
  source,
  analysis,
  watchDetails,
  angleResults,
  angleSelections,
  generatingAngle,
  angleGenerateCounts,
  dispatch,
  onOpenLightbox,
  onDownload,
  onContinue,
  onBack,
}: Props) {
  const [generatingAll, setGeneratingAll] = useState(false);
  const [pendingAngles, setPendingAngles] = useState<Set<AngleKey>>(new Set());

  const generateAngle = useCallback(
    async (angle: AngleKey) => {
      dispatch({ type: "SET_GENERATING_ANGLE", angle });
      try {
        const prompt = getPromptForAngle(angle, analysis, watchDetails);
        const images = await generateImages(source.base64, source.mimeType, prompt, angleGenerateCounts[angle]);
        dispatch({ type: "SET_ANGLE_RESULTS", angle, images });
      } catch {
        // silent fail per angle
      } finally {
        dispatch({ type: "SET_GENERATING_ANGLE", angle: null });
      }
    },
    [source, analysis, watchDetails, angleGenerateCounts, dispatch]
  );

  const generateAll = useCallback(async () => {
    setGeneratingAll(true);
    // Mark all angles as pending so they all show skeletons
    const allKeys = new Set(ANGLES.map((a) => a.key));
    setPendingAngles(allKeys);
    for (const { key } of ANGLES) {
      // Remove from pending (it transitions to generating via generatingAngle)
      setPendingAngles((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
      await generateAngle(key);
    }
    setPendingAngles(new Set());
    setGeneratingAll(false);
  }, [generateAngle]);

  const selectedCount = Object.values(angleSelections).filter(Boolean).length;
  const canContinue = selectedCount >= 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Source thumbnail */}
          <div className="w-12 h-12 rounded-lg overflow-hidden border border-gold/20">
            <img src={source.previewUrl} alt="Source" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Multi-Angle Shots</p>
            <p className="text-xs text-muted-foreground">Generate per angle, select 1 each</p>
          </div>
        </div>

        <button
          onClick={generateAll}
          disabled={!!generatingAngle || generatingAll}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold/15 border border-gold/30 text-sm text-gold hover:bg-gold/25 transition-colors disabled:opacity-50"
        >
          {generatingAll ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {generatingAll ? "Generating All..." : "Generate All"}
        </button>
      </div>

      {/* Angle cards */}
      {ANGLES.map(({ key, title, description, icon }) => (
        <AngleCard
          key={key}
          title={title}
          description={description}
          icon={icon}
          images={angleResults[key]}
          selected={angleSelections[key]}
          generating={generatingAngle === key || pendingAngles.has(key)}
          generateCount={angleGenerateCounts[key]}
          onCountChange={(n) => dispatch({ type: "SET_ANGLE_GENERATE_COUNT", angle: key, count: n })}
          onGenerate={() => generateAngle(key)}
          onSelect={(id) => dispatch({ type: "SELECT_ANGLE", angle: key, imageId: id })}
          onOpenLightbox={onOpenLightbox}
          onDownload={onDownload}
        />
      ))}

      {/* Selection summary */}
      <div className="rounded-lg border border-gold/20 bg-surface-elevated p-4">
        <p className="text-[10px] tracking-[0.2em] uppercase text-gold/60 mb-3">
          Selected Images ({selectedCount}/4)
        </p>
        <div className="grid grid-cols-4 gap-3">
          {ANGLES.map(({ key, title }) => {
            const selId = angleSelections[key];
            const img = selId ? angleResults[key].find((i) => i.id === selId) : null;
            return (
              <div
                key={key}
                className={cn(
                  "aspect-square rounded-lg border-2 border-dashed overflow-hidden flex items-center justify-center",
                  img ? "border-gold/40" : "border-gold/10"
                )}
              >
                {img ? (
                  <img
                    src={`data:${img.mimeType};base64,${img.base64}`}
                    alt={title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-[9px] text-muted-foreground/30 text-center px-1">
                    {title.split(" ")[0]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

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
