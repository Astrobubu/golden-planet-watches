import { useState, useEffect, useRef } from "react";
import { LiveWatchFace } from "@/components/LiveWatchFace";
import type { LiveFaceData } from "@/lib/watch-editor-types";
import type { ExtractedHand } from "@/components/LiveWatchFace";
import { cn } from "@/lib/utils";

interface Props {
  staticSrc: string;
  liveFaceData?: LiveFaceData;
  className?: string;
  initialLive?: boolean;
}

function toExtractedHand(
  hand: { dataUrl: string; pivotX: number; pivotY: number; width?: number; height?: number } | null
): ExtractedHand | null {
  if (!hand) return null;
  return {
    dataUrl: hand.dataUrl,
    naturalWidth: hand.width ?? 100,
    naturalHeight: hand.height ?? 400,
    pivotX: hand.pivotX,
    pivotY: hand.pivotY,
  };
}

export function LiveWatchToggle({ staticSrc, liveFaceData, className, initialLive = false }: Props) {
  const [live, setLive] = useState(initialLive);
  const initialRef = useRef(initialLive);

  // Sync if initialLive changes (e.g. user clicks Live thumbnail on detail page)
  useEffect(() => {
    if (initialLive !== initialRef.current) {
      setLive(initialLive);
      initialRef.current = initialLive;
    }
  }, [initialLive]);

  if (!liveFaceData) {
    return (
      <img
        src={staticSrc}
        alt="Watch"
        className={cn("w-full h-full object-cover", className)}
      />
    );
  }

  // Use the config's cx/cy to center static images on the watch face
  const faceCenterStyle = {
    objectPosition: `${liveFaceData.config.cx}% ${liveFaceData.config.cy}%`,
  };

  return (
    <div className={cn("relative bg-white", className)}>
      {live ? (
        <LiveWatchFace
          imageSrc={liveFaceData.clean_dial_url}
          config={liveFaceData.config}
          extractedHands={{
            hour: toExtractedHand(liveFaceData.extracted_hands.hour),
            minute: toExtractedHand(liveFaceData.extracted_hands.minute),
            second: toExtractedHand(liveFaceData.extracted_hands.second),
          }}
          centerOnFace
          className="w-full h-full"
        />
      ) : (
        <img
          src={staticSrc}
          alt="Watch"
          className="w-full h-full object-contain"
          style={faceCenterStyle}
        />
      )}

      {/* Toggle button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setLive(!live);
        }}
        className={cn(
          "absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wider uppercase transition-all z-10",
          live
            ? "bg-gold/90 text-background"
            : "bg-black/60 text-white/80 hover:bg-black/80"
        )}
      >
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            live ? "bg-background animate-pulse" : "bg-red-400 animate-pulse"
          )}
        />
        Live
      </button>
    </div>
  );
}
