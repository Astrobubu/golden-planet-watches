import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut, RotateCcw, Download } from "lucide-react";
import type { GeneratedImage } from "@/lib/gemini";

interface Props {
  image: GeneratedImage | null;
  onClose: () => void;
  onDownload: (img: GeneratedImage) => void;
  zoom: number;
  onZoom: (z: number) => void;
  pan: { x: number; y: number };
  onPan: (p: { x: number; y: number }) => void;
}

export function EditorLightbox({ image, onClose, onDownload, zoom, onZoom, pan, onPan }: Props) {
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });

  if (!image) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/90 flex flex-col"
        onClick={onClose}
      >
        {/* Toolbar */}
        <div
          className="flex items-center justify-between px-6 py-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => onZoom(Math.min(zoom + 0.5, 5))}
              className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => onZoom(Math.max(zoom - 0.5, 0.5))}
              className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => { onZoom(1); onPan({ x: 0, y: 0 }); }}
              className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <span className="text-xs text-white/50 ml-2">{Math.round(zoom * 100)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDownload(image)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 text-white text-xs hover:bg-white/20 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
            <button
              onClick={onClose}
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
              onPan({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y });
            }
          }}
          onMouseUp={() => { isPanning.current = false; }}
          onMouseLeave={() => { isPanning.current = false; }}
          onWheel={(e) => {
            e.preventDefault();
            onZoom(Math.min(Math.max(zoom + (e.deltaY > 0 ? -0.25 : 0.25), 0.5), 5));
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
              src={`data:${image.mimeType};base64,${image.base64}`}
              alt="Zoomed view"
              className="max-w-[90vw] max-h-[85vh] object-contain select-none"
              draggable={false}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
