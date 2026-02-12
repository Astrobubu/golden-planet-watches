import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, ZoomIn, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { GeneratedImage } from "@/lib/gemini";

interface Props {
  images: GeneratedImage[];
  selected: string | null;
  onSelect: (id: string) => void;
  onOpenLightbox: (img: GeneratedImage) => void;
  onDownload: (img: GeneratedImage) => void;
  generating: boolean;
  skeletonCount: number;
}

export function ImagePickerGrid({
  images,
  selected,
  onSelect,
  onOpenLightbox,
  onDownload,
  generating,
  skeletonCount,
}: Props) {
  const [focusIndex, setFocusIndex] = useState(0);

  // Reset focus when images change
  useEffect(() => {
    setFocusIndex(0);
  }, [images.length]);

  if (generating) {
    return (
      <div className="space-y-3">
        <Skeleton className="aspect-square rounded-lg bg-surface-elevated max-w-md mx-auto" />
        <div className="flex gap-2 justify-center">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <Skeleton key={i} className="w-16 h-16 rounded bg-surface-elevated" />
          ))}
        </div>
      </div>
    );
  }

  if (images.length === 0) return null;

  const focused = images[focusIndex];
  const isSelected = selected === focused?.id;

  const goPrev = () => setFocusIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  const goNext = () => setFocusIndex((i) => (i < images.length - 1 ? i + 1 : 0));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
      {/* Main carousel image */}
      <div
        className={cn(
          "relative aspect-square rounded-lg overflow-hidden max-w-md mx-auto border-2 transition-all",
          isSelected ? "border-gold shadow-gold" : "border-gold/10"
        )}
      >
        <img
          src={`data:${focused.mimeType};base64,${focused.base64}`}
          alt={`Generated ${focusIndex + 1}`}
          className="w-full h-full object-contain bg-black/30"
        />

        {/* Selected badge */}
        {isSelected && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold text-[10px] font-medium tracking-wider uppercase text-background">
            <Check className="w-3 h-3" />
            Selected
          </div>
        )}

        {/* Counter */}
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 text-[10px] text-white/70">
          {focusIndex + 1} / {images.length}
        </div>

        {/* Left/Right arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white/80 flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white/80 flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Action buttons */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          <button
            onClick={() => onSelect(focused.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              isSelected
                ? "bg-gold text-background"
                : "bg-black/60 text-white hover:bg-gold/80 hover:text-background"
            )}
          >
            <Check className="w-3 h-3" />
            {isSelected ? "Selected" : "Select"}
          </button>
          <button
            onClick={() => onOpenLightbox(focused)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs hover:bg-black/80 transition-colors"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDownload(focused)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs hover:bg-black/80 transition-colors"
          >
            <Download className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 justify-center">
          {images.map((img, i) => {
            const thumbSelected = selected === img.id;
            return (
              <button
                key={img.id}
                onClick={() => setFocusIndex(i)}
                className={cn(
                  "w-16 h-16 rounded border-2 overflow-hidden transition-all",
                  i === focusIndex
                    ? "border-gold"
                    : "border-gold/10 hover:border-gold/30",
                  thumbSelected && "ring-2 ring-gold ring-offset-1 ring-offset-background"
                )}
              >
                <img
                  src={`data:${img.mimeType};base64,${img.base64}`}
                  alt={`Thumb ${i + 1}`}
                  className="w-full h-full object-contain bg-black/20"
                />
              </button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
