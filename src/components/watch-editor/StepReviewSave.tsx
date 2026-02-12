import { useCallback, useState } from "react";
import { ArrowLeft, Save, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LiveWatchFace, type WatchHandsConfig, type ExtractedHand } from "@/components/LiveWatchFace";
import { type Watch, formatPrice, getDisplayPrice } from "@/lib/mock-watches";
import { DirhamSign } from "@/components/DirhamSign";
import { saveWatch, clearDraft, saveEditorData } from "@/lib/watch-editor-storage";
import type { ProcessedHand, HandConfig } from "@/lib/hand-processing";
import type { GeneratedImage } from "@/lib/gemini";
import type { AngleKey, SourceImage, WatchEditorAction, WatchEditorState, LiveFaceData } from "@/lib/watch-editor-types";

interface Props {
  source: SourceImage;
  watchDetails: Partial<Watch>;
  angleSelections: Record<AngleKey, string | null>;
  angleResults: Record<AngleKey, GeneratedImage[]>;
  cleanDialSelection: string | null;
  cleanDialResults: GeneratedImage[];
  extractedHands: (ProcessedHand | null)[];
  handConfigs: HandConfig[];
  watchHandsConfig: WatchHandsConfig;
  editingWatchId: string | null;
  fullState: WatchEditorState;
  dispatch: React.Dispatch<WatchEditorAction>;
  onBack: () => void;
}

function processedToExtracted(
  hand: ProcessedHand | null,
  cfg: HandConfig
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

export function StepReviewSave({
  source,
  watchDetails,
  angleSelections,
  angleResults,
  cleanDialSelection,
  cleanDialResults,
  extractedHands,
  handConfigs,
  watchHandsConfig,
  editingWatchId,
  fullState,
  dispatch,
  onBack,
}: Props) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  // Build gallery images from selected angles only
  const galleryImages: string[] = [];
  const angleKeys: AngleKey[] = ["catalog", "table", "emirati", "suit"];
  for (const key of angleKeys) {
    const selId = angleSelections[key];
    if (selId) {
      const img = angleResults[key].find((i) => i.id === selId);
      if (img) galleryImages.push(`data:${img.mimeType};base64,${img.base64}`);
    }
  }

  // Clean dial
  const cleanDialImg = cleanDialSelection
    ? cleanDialResults.find((i) => i.id === cleanDialSelection)
    : null;
  const cleanDialDataUrl = cleanDialImg
    ? `data:${cleanDialImg.mimeType};base64,${cleanDialImg.base64}`
    : undefined;

  // Live preview hands
  const extractedHandsForPreview = {
    hour: processedToExtracted(extractedHands[0], handConfigs[0]),
    minute: processedToExtracted(extractedHands[1], handConfigs[1]),
    second: processedToExtracted(extractedHands[2], handConfigs[2]),
  };

  const handleSave = useCallback(
    async (thenNavigate: boolean) => {
      setSaving(true);

      // Build LiveFaceData
      let liveFaceData: LiveFaceData | undefined;
      if (cleanDialDataUrl) {
        liveFaceData = {
          clean_dial_url: cleanDialDataUrl,
          extracted_hands: {
            hour: extractedHands[0]
              ? { dataUrl: extractedHands[0].dataUrl, pivotX: handConfigs[0].pivotX, pivotY: handConfigs[0].pivotY, width: extractedHands[0].width, height: extractedHands[0].height }
              : null,
            minute: extractedHands[1]
              ? { dataUrl: extractedHands[1].dataUrl, pivotX: handConfigs[1].pivotX, pivotY: handConfigs[1].pivotY, width: extractedHands[1].width, height: extractedHands[1].height }
              : null,
            second: extractedHands[2]
              ? { dataUrl: extractedHands[2].dataUrl, pivotX: handConfigs[2].pivotX, pivotY: handConfigs[2].pivotY, width: extractedHands[2].width, height: extractedHands[2].height }
              : null,
          },
          config: watchHandsConfig,
        };
      }

      // Build the source data URL for persistence (not a blob URL)
      const sourceDataUrl = source.base64
        ? `data:${source.mimeType};base64,${source.base64}`
        : source.previewUrl; // fallback to whatever we have

      // Reuse existing watch ID when editing, otherwise create new
      const watchId = editingWatchId || `custom-${Date.now()}`;

      const watch: Watch = {
        id: watchId,
        brand: watchDetails.brand || "Unknown",
        model: watchDetails.model || "Unknown",
        reference_number: watchDetails.reference_number || "",
        description: watchDetails.description || "",
        base_price: watchDetails.base_price || 0,
        margin_percent: watchDetails.margin_percent ?? 10,
        condition_rating: watchDetails.condition_rating || "A",
        year: watchDetails.year || new Date().getFullYear(),
        dial_color: watchDetails.dial_color || "",
        case_material: watchDetails.case_material || "",
        case_size_mm: watchDetails.case_size_mm || 40,
        movement_type: watchDetails.movement_type || "Automatic",
        source_image_url: sourceDataUrl,
        original_image_url: galleryImages[0] || sourceDataUrl,
        ai_generated_images: galleryImages.slice(1),
        is_featured: false,
        is_hero: false,
        live_face_data: liveFaceData,
      };

      try {
        await saveWatch(watch);
        await saveEditorData(watch.id, fullState);
      } catch (e) {
        console.warn("Failed to save watch data:", e);
      }

      dispatch({ type: "MARK_SAVED", watchId: watch.id });
      dispatch({ type: "SET_EDITING_WATCH_ID", watchId: watch.id });
      clearDraft();

      toast.success("Watch saved successfully!");
      setSaving(false);

      if (thenNavigate) navigate(`/watch/${watch.id}`);
    },
    [
      watchDetails,
      source,
      galleryImages,
      cleanDialDataUrl,
      extractedHands,
      handConfigs,
      watchHandsConfig,
      editingWatchId,
      fullState,
      dispatch,
      navigate,
    ]
  );

  const details = watchDetails;
  const price = getDisplayPrice({
    base_price: details.base_price || 0,
    margin_percent: details.margin_percent ?? 10,
  } as Watch);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Watch details summary */}
        <div className="rounded-lg border border-gold/20 bg-surface-elevated p-5 space-y-4">
          <p className="text-[10px] tracking-[0.2em] uppercase text-gold/60">Watch Details</p>
          <div className="space-y-2 text-sm">
            {([
              ["Brand", details.brand],
              ["Model", details.model],
              ["Reference", details.reference_number],
              ["Year", details.year],
              ["Case Material", details.case_material],
              ["Case Size", details.case_size_mm ? `${details.case_size_mm}mm` : ""],
              ["Dial Color", details.dial_color],
              ["Movement", details.movement_type],
              ["Condition", details.condition_rating],
            ] as [string, string | number | undefined][]).map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span className="text-muted-foreground">{label}</span>
                <span className="text-foreground font-medium">{value || "—"}</span>
              </div>
            ))}
            <div className="border-t border-gold/10 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="text-gold font-serif text-lg flex items-center gap-1"><DirhamSign className="w-4 h-4" />{formatPrice(price)}</span>
              </div>
            </div>
          </div>
          {details.description && (
            <p className="text-xs text-muted-foreground italic">{details.description}</p>
          )}
        </div>

        {/* Live face preview */}
        <div className="rounded-lg border border-gold/20 bg-surface-elevated p-5 space-y-4">
          <p className="text-[10px] tracking-[0.2em] uppercase text-gold/60">Live Preview</p>
          {cleanDialDataUrl ? (
            <div className="max-w-[250px] mx-auto">
              <LiveWatchFace
                imageSrc={cleanDialDataUrl}
                config={watchHandsConfig}
                extractedHands={extractedHandsForPreview}
              />
            </div>
          ) : (
            <div className="aspect-square flex items-center justify-center text-muted-foreground/30 text-sm">
              No clean dial selected
            </div>
          )}
        </div>
      </div>

      {/* Image gallery preview */}
      <div className="rounded-lg border border-gold/20 bg-surface-elevated p-5 space-y-4">
        <p className="text-[10px] tracking-[0.2em] uppercase text-gold/60">
          Gallery Images ({galleryImages.length})
        </p>
        <div className="grid grid-cols-4 gap-3">
          {galleryImages.map((url, i) => (
            <div key={i} className="aspect-square rounded-lg border border-gold/10 overflow-hidden">
              <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-contain bg-black/20" />
            </div>
          ))}
          {galleryImages.length === 0 && (
            <div className="col-span-4 text-center text-muted-foreground/40 text-sm py-8">
              No angle shots selected. Go back to Step 2 to generate images.
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gold/20 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm border border-gold/40 text-gold hover:bg-gold/10 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Watch"}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all bg-gradient-to-r from-gold-dark via-gold to-gold-light text-background hover:opacity-90 disabled:opacity-50"
          >
            <ExternalLink className="w-4 h-4" />
            {saving ? "Saving..." : "Save & View Listing"}
          </button>
        </div>
      </div>
    </div>
  );
}
