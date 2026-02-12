import { Loader2, Sparkles } from "lucide-react";
import { ImagePickerGrid } from "./ImagePickerGrid";
import { CountSelector } from "./CountSelector";
import type { GeneratedImage } from "@/lib/gemini";
import type { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  description: string;
  icon: LucideIcon;
  images: GeneratedImage[];
  selected: string | null;
  generating: boolean;
  generateCount: number;
  onCountChange: (n: number) => void;
  onGenerate: () => void;
  onSelect: (id: string) => void;
  onOpenLightbox: (img: GeneratedImage) => void;
  onDownload: (img: GeneratedImage) => void;
}

export function AngleCard({
  title,
  description,
  icon: Icon,
  images,
  selected,
  generating,
  generateCount,
  onCountChange,
  onGenerate,
  onSelect,
  onOpenLightbox,
  onDownload,
}: Props) {
  return (
    <div className="rounded-lg border border-gold/20 bg-surface-elevated p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-gold" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CountSelector value={generateCount} onChange={onCountChange} />
          <button
            onClick={onGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gold/30 text-sm text-gold hover:bg-gold/10 transition-colors disabled:opacity-50"
          >
            {generating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {generating ? "Generating..." : images.length > 0 ? "Regenerate" : `Generate ${generateCount}`}
          </button>
        </div>
      </div>

      <ImagePickerGrid
        images={images}
        selected={selected}
        onSelect={onSelect}
        onOpenLightbox={onOpenLightbox}
        onDownload={onDownload}
        generating={generating}
        skeletonCount={generateCount}
      />
    </div>
  );
}
