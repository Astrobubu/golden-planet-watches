import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import {
  LiveWatchFace,
  DEFAULT_CONFIG,
  type WatchHandsConfig,
  type ExtractedHand,
} from "@/components/LiveWatchFace";
import {
  type HandConfig,
  type ProcessedHand,
  DEFAULT_HANDS,
  processHand,
  drawPreview,
  paintBrushStroke,
  getCropDims,
} from "@/lib/hand-processing";
import {
  RotateCcw, Eye, EyeOff, MousePointer2, Copy, Check,
  Shield, Eraser, Crosshair, Paintbrush, Undo2,
} from "lucide-react";

/* ══════════════════════════════════════════════ */

const HAND_LABELS = ["Hour Hand", "Minute Hand", "Second Hand"] as const;
const HAND_COLORS = ["#ff6b6b", "#51cf66", "#339af0"] as const;

type InteractionMode = "pivot" | "protect" | "remove";

/* ══════════════════════════════════════════════
   Main Component
   ══════════════════════════════════════════════ */

const DatejustShowcase = () => {
  const [hands, setHands] = useState<HandConfig[]>(DEFAULT_HANDS);
  const [active, setActive] = useState(0);
  const [showMask, setShowMask] = useState(false);
  const [showOverrides, setShowOverrides] = useState(true);
  const [mode, setMode] = useState<InteractionMode>("pivot");
  const [brushSize, setBrushSize] = useState(8);
  const [sourceReady, setSourceReady] = useState(false);
  const [srcDims, setSrcDims] = useState({ w: 1024, h: 350 });
  const [extracted, setExtracted] = useState<(ProcessedHand | null)[]>([null, null, null]);

  // watch config
  const [watchCfg, setWatchCfg] = useState<WatchHandsConfig>(DEFAULT_CONFIG);
  const [showGuides, setShowGuides] = useState(true);
  const [pickingCenter, setPickingCenter] = useState(false);
  const [copied, setCopied] = useState(false);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const paintingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  // override masks — one Uint8Array per hand (0=auto, 1=protect, 2=remove)
  const masksRef = useRef<(Uint8Array | null)[]>([null, null, null]);
  const maskDimsRef = useRef<{ w: number; h: number }[]>([
    { w: 0, h: 0 }, { w: 0, h: 0 }, { w: 0, h: 0 },
  ]);

  // undo stacks per hand
  const undoStacksRef = useRef<Uint8Array[][]>([[], [], []]);

  /* ─── load source image ─── */
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setSrcDims({ w: img.naturalWidth, h: img.naturalHeight });
      setSourceReady(true);
    };
    img.src = "/hands.jpg";
  }, []);

  /* ─── ensure mask exists & matches crop dims ─── */
  const ensureMask = useCallback((idx: number) => {
    if (!imgRef.current) return null;
    const dims = getCropDims(imgRef.current, hands[idx]);
    const cur = maskDimsRef.current[idx];
    if (!masksRef.current[idx] || cur.w !== dims.w || cur.h !== dims.h) {
      masksRef.current[idx] = new Uint8Array(dims.w * dims.h);
      maskDimsRef.current[idx] = dims;
      undoStacksRef.current[idx] = [];
    }
    return masksRef.current[idx];
  }, [hands]);

  /* ─── process preview for active hand ─── */
  useEffect(() => {
    if (!sourceReady || !imgRef.current || !previewRef.current) return;
    const mask = ensureMask(active);
    drawPreview(previewRef.current, imgRef.current, hands[active], mask, showMask, showOverrides);
  }, [hands, active, showMask, showOverrides, sourceReady, ensureMask]);

  /* ─── process all hands for watch preview ─── */
  useEffect(() => {
    if (!sourceReady || !imgRef.current) return;
    const results = hands.map((h, i) => {
      const mask = ensureMask(i);
      return processHand(imgRef.current!, h, mask);
    });
    setExtracted(results);
  }, [hands, sourceReady, ensureMask]);

  const updateHand = useCallback((idx: number, patch: Partial<HandConfig>) => {
    setHands((prev) => prev.map((h, i) => (i === idx ? { ...h, ...patch } : h)));
  }, []);

  /* ─── canvas interaction: pivot / protect / remove ─── */
  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = e.currentTarget;
    const r = c.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * c.width,
      y: ((e.clientY - r.top) / r.height) * c.height,
    };
  };

  const handleCanvasDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode === "pivot") {
      const r = e.currentTarget.getBoundingClientRect();
      const xPct = ((e.clientX - r.left) / r.width) * 100;
      const yPct = ((e.clientY - r.top) / r.height) * 100;
      updateHand(active, {
        pivotX: Math.round(xPct * 10) / 10,
        pivotY: Math.round(yPct * 10) / 10,
      });
      return;
    }

    // brush modes
    const mask = ensureMask(active);
    if (!mask) return;

    // save undo snapshot
    const stack = undoStacksRef.current[active];
    stack.push(new Uint8Array(mask));
    if (stack.length > 20) stack.shift();

    paintingRef.current = true;
    const pos = getCanvasPos(e);
    lastPosRef.current = pos;
    const dims = maskDimsRef.current[active];
    paintBrushStroke(mask, dims.w, dims.h, pos.x, pos.y, pos.x, pos.y, brushSize, mode === "protect" ? 1 : 2);
    triggerRedraw();
  };

  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!paintingRef.current || mode === "pivot") return;
    const mask = ensureMask(active);
    if (!mask) return;
    const pos = getCanvasPos(e);
    const last = lastPosRef.current || pos;
    const dims = maskDimsRef.current[active];
    paintBrushStroke(mask, dims.w, dims.h, last.x, last.y, pos.x, pos.y, brushSize, mode === "protect" ? 1 : 2);
    lastPosRef.current = pos;
    triggerRedraw();
  };

  const handleCanvasUp = () => {
    paintingRef.current = false;
    lastPosRef.current = null;
    // trigger full re‑process for watch preview
    setHands((h) => [...h]);
  };

  const triggerRedraw = () => {
    if (!previewRef.current || !imgRef.current) return;
    const mask = masksRef.current[active];
    drawPreview(previewRef.current, imgRef.current, hands[active], mask, showMask, showOverrides);
  };

  const undoBrush = () => {
    const stack = undoStacksRef.current[active];
    if (stack.length === 0) return;
    const prev = stack.pop()!;
    masksRef.current[active] = prev;
    triggerRedraw();
    setHands((h) => [...h]); // trigger watch re‑process
  };

  const clearBrush = () => {
    const mask = ensureMask(active);
    if (mask) mask.fill(0);
    undoStacksRef.current[active] = [];
    setHands((h) => [...h]);
  };

  const handleWatchClick = useCallback(
    (xPct: number, yPct: number) => {
      if (!pickingCenter) return;
      setWatchCfg((p) => ({ ...p, cx: Math.round(xPct * 10) / 10, cy: Math.round(yPct * 10) / 10 }));
    },
    [pickingCenter]
  );

  const extractedForWatch = {
    hour: extracted[0] ? { ...extracted[0], naturalWidth: extracted[0].width, naturalHeight: extracted[0].height, pivotX: hands[0].pivotX, pivotY: hands[0].pivotY } as ExtractedHand : null,
    minute: extracted[1] ? { ...extracted[1], naturalWidth: extracted[1].width, naturalHeight: extracted[1].height, pivotX: hands[1].pivotX, pivotY: hands[1].pivotY } as ExtractedHand : null,
    second: extracted[2] ? { ...extracted[2], naturalWidth: extracted[2].width, naturalHeight: extracted[2].height, pivotX: hands[2].pivotX, pivotY: hands[2].pivotY } as ExtractedHand : null,
  };

  const copyConfig = () => {
    navigator.clipboard.writeText(JSON.stringify({ hands, watchCfg }, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const cfg = hands[active];

  /* ══════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container max-w-7xl">

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-10">
            <h1 className="font-serif text-3xl md:text-4xl text-foreground">Watch Hand Extractor</h1>
            <p className="font-sans text-sm text-muted-foreground mt-2">
              Flood‑fill removes connected background &middot; Brush to protect or remove specific areas
            </p>
          </motion.div>

          {/* ═══ Top row: Source + Watch Preview ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* Source image with crop overlays */}
            <div>
              <Label>Source — Crop Regions</Label>
              <div className="relative border border-border rounded-sm overflow-hidden bg-surface-elevated">
                <img src="/hands.jpg" alt="Source hands" className="w-full h-auto block" />
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${srcDims.w} ${srcDims.h}`}>
                  {hands.map((h, i) => (
                    <g key={i}>
                      <rect
                        x={(h.cropX / 100) * srcDims.w} y={(h.cropY / 100) * srcDims.h}
                        width={(h.cropW / 100) * srcDims.w} height={(h.cropH / 100) * srcDims.h}
                        fill="none" stroke={HAND_COLORS[i]}
                        strokeWidth={i === active ? 3 : 1.5}
                        strokeDasharray={i === active ? "none" : "6,4"}
                        opacity={i === active ? 1 : 0.4}
                      />
                      <text x={(h.cropX / 100) * srcDims.w + 4} y={(h.cropY / 100) * srcDims.h + 14}
                        fill={HAND_COLORS[i]} fontSize="12" fontFamily="sans-serif"
                        fontWeight={i === active ? 700 : 400} opacity={i === active ? 1 : 0.6}
                      >
                        {HAND_LABELS[i]}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* Watch preview */}
            <div>
              <Label>Live Watch Preview</Label>
              <div className={`border rounded-sm overflow-hidden ${pickingCenter ? "border-red-500/50" : "border-border"}`}>
                <LiveWatchFace config={watchCfg} showGuides={showGuides}
                  onImageClick={pickingCenter ? handleWatchClick : undefined}
                  extractedHands={extractedForWatch}
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <SmallBtn onClick={() => setShowGuides((g) => !g)}>
                  {showGuides ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} Guides
                </SmallBtn>
                <SmallBtn onClick={() => setPickingCenter((p) => !p)} active={pickingCenter}>
                  <MousePointer2 className="w-3 h-3" /> Center
                </SmallBtn>
                <MiniSlider label="CX" value={watchCfg.cx} min={0} max={100} step={0.1} onChange={(v) => setWatchCfg((p) => ({ ...p, cx: v }))} />
                <MiniSlider label="CY" value={watchCfg.cy} min={0} max={100} step={0.1} onChange={(v) => setWatchCfg((p) => ({ ...p, cy: v }))} />
                <MiniSlider label="R" value={watchCfg.radius} min={1} max={50} step={0.1} onChange={(v) => setWatchCfg((p) => ({ ...p, radius: v }))} />
                <MiniSlider label="H%" value={watchCfg.hourLen} min={10} max={100} step={1} onChange={(v) => setWatchCfg((p) => ({ ...p, hourLen: v }))} />
                <MiniSlider label="M%" value={watchCfg.minLen} min={10} max={100} step={1} onChange={(v) => setWatchCfg((p) => ({ ...p, minLen: v }))} />
                <MiniSlider label="S%" value={watchCfg.secLen} min={10} max={100} step={1} onChange={(v) => setWatchCfg((p) => ({ ...p, secLen: v }))} />
              </div>
            </div>
          </div>

          {/* ═══ Hand Tabs ═══ */}
          <div className="flex gap-2 mb-4">
            {HAND_LABELS.map((label, i) => (
              <button key={i} onClick={() => setActive(i)}
                className={`px-4 py-2 rounded-sm font-sans text-xs tracking-wider border transition-all ${
                  active === i ? "bg-surface-elevated text-foreground" : "border-border text-muted-foreground hover:border-border/80"
                }`}
                style={active === i ? { borderColor: HAND_COLORS[i], boxShadow: `0 0 8px ${HAND_COLORS[i]}20` } : { borderColor: undefined }}
              >
                <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: HAND_COLORS[i] }} />
                {label}
              </button>
            ))}
          </div>

          {/* ═══ Active Hand Panel ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">

            {/* Preview + interaction mode */}
            <div>
              <Label>
                Preview
                <span className="text-[9px] text-muted-foreground/50 ml-2">
                  {mode === "pivot" ? "click = set pivot" : mode === "protect" ? "paint = protect areas" : "paint = remove areas"}
                </span>
              </Label>
              <div className="border border-border rounded-sm overflow-hidden bg-[#3a3a3a] relative">
                <canvas
                  ref={previewRef}
                  className="w-full h-auto block"
                  style={{ cursor: mode === "pivot" ? "crosshair" : `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='${brushSize * 2}' height='${brushSize * 2}'><circle cx='${brushSize}' cy='${brushSize}' r='${brushSize - 1}' fill='none' stroke='${mode === "protect" ? "%2300cc55" : "%23ff4444"}' stroke-width='1.5'/></svg>") ${brushSize} ${brushSize}, crosshair` }}
                  onMouseDown={handleCanvasDown}
                  onMouseMove={handleCanvasMove}
                  onMouseUp={handleCanvasUp}
                  onMouseLeave={handleCanvasUp}
                />
              </div>

              {/* Interaction mode bar */}
              <div className="flex gap-1 mt-2">
                <ModeBtn active={mode === "pivot"} onClick={() => setMode("pivot")} color="#fbbf24">
                  <Crosshair className="w-3 h-3" /> Pivot
                </ModeBtn>
                <ModeBtn active={mode === "protect"} onClick={() => setMode("protect")} color="#22c55e">
                  <Shield className="w-3 h-3" /> Protect
                </ModeBtn>
                <ModeBtn active={mode === "remove"} onClick={() => setMode("remove")} color="#ef4444">
                  <Eraser className="w-3 h-3" /> Remove
                </ModeBtn>
              </div>

              {/* Brush controls */}
              {mode !== "pivot" && (
                <div className="mt-2 p-3 bg-surface border border-border rounded-sm space-y-2">
                  <Slider label="Brush Size" value={brushSize} min={1} max={40} step={1} unit="px"
                    onChange={setBrushSize} />
                  <div className="flex gap-2">
                    <SmallBtn onClick={undoBrush}><Undo2 className="w-3 h-3" /> Undo</SmallBtn>
                    <SmallBtn onClick={clearBrush}><RotateCcw className="w-3 h-3" /> Clear Brush</SmallBtn>
                  </div>
                </div>
              )}

              {/* View toggles */}
              <div className="flex gap-2 mt-2">
                <SmallBtn onClick={() => setShowMask((m) => !m)} active={showMask}>
                  {showMask ? "Mask View" : "Show Mask"}
                </SmallBtn>
                <SmallBtn onClick={() => setShowOverrides((o) => !o)} active={showOverrides}>
                  <Paintbrush className="w-3 h-3" /> {showOverrides ? "Brush Overlay" : "Hide Brush"}
                </SmallBtn>
              </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">

              {/* Crop */}
              <CtrlGroup title="Crop Region" color={HAND_COLORS[active]}>
                <Slider label="X" value={cfg.cropX} min={0} max={90} step={0.5} unit="%" onChange={(v) => updateHand(active, { cropX: v })} />
                <Slider label="Y" value={cfg.cropY} min={0} max={90} step={0.5} unit="%" onChange={(v) => updateHand(active, { cropY: v })} />
                <Slider label="Width" value={cfg.cropW} min={2} max={60} step={0.5} unit="%" onChange={(v) => updateHand(active, { cropW: v })} />
                <Slider label="Height" value={cfg.cropH} min={10} max={100} step={0.5} unit="%" onChange={(v) => updateHand(active, { cropH: v })} />
              </CtrlGroup>

              {/* Method selection + params */}
              <CtrlGroup title="Background Removal" color={HAND_COLORS[active]}>
                <div className="flex gap-2 mb-3">
                  <MethodBtn active={cfg.method === "floodfill"} onClick={() => updateHand(active, { method: "floodfill" })}>
                    Flood Fill
                    <span className="text-[8px] opacity-50 block">connected BG</span>
                  </MethodBtn>
                  <MethodBtn active={cfg.method === "threshold"} onClick={() => updateHand(active, { method: "threshold" })}>
                    Threshold
                    <span className="text-[8px] opacity-50 block">luminance</span>
                  </MethodBtn>
                </div>

                {cfg.method === "floodfill" ? (
                  <Slider label="Tolerance" value={cfg.tolerance} min={1} max={200} step={1} unit=""
                    onChange={(v) => updateHand(active, { tolerance: v })} />
                ) : (
                  <>
                    <Slider label="Threshold" value={cfg.thresholdVal} min={0} max={255} step={1} unit=""
                      onChange={(v) => updateHand(active, { thresholdVal: v })} />
                    <Slider label="Softness" value={cfg.softness} min={0} max={80} step={1} unit=""
                      onChange={(v) => updateHand(active, { softness: v })} />
                    <Slider label="Contrast" value={cfg.contrast} min={-100} max={100} step={1} unit=""
                      onChange={(v) => updateHand(active, { contrast: v })} />
                    <Slider label="Brightness" value={cfg.brightness} min={-100} max={100} step={1} unit=""
                      onChange={(v) => updateHand(active, { brightness: v })} />
                  </>
                )}

                <Slider label="Feather" value={cfg.feather} min={0} max={20} step={1} unit="px"
                  onChange={(v) => updateHand(active, { feather: v })} />

                <div className="flex items-center gap-2 mt-1">
                  <input type="checkbox" id="inv" checked={cfg.invertMask}
                    onChange={(e) => updateHand(active, { invertMask: e.target.checked })}
                    className="accent-gold" />
                  <label htmlFor="inv" className="font-sans text-[11px] text-muted-foreground cursor-pointer">Invert Mask</label>
                </div>
              </CtrlGroup>

              {/* Pivot */}
              <CtrlGroup title="Rotation Axis" color={HAND_COLORS[active]}>
                <Slider label="Pivot X" value={cfg.pivotX} min={0} max={100} step={0.5} unit="%" onChange={(v) => updateHand(active, { pivotX: v })} />
                <Slider label="Pivot Y" value={cfg.pivotY} min={0} max={100} step={0.5} unit="%" onChange={(v) => updateHand(active, { pivotY: v })} />
                <p className="font-sans text-[10px] text-muted-foreground/40 mt-1">
                  Or switch to Pivot mode and click the preview.
                </p>
              </CtrlGroup>

              {/* Actions */}
              <CtrlGroup title="Actions">
                <div className="flex gap-2 flex-wrap">
                  <SmallBtn onClick={() => { setHands((p) => p.map((h, i) => i === active ? DEFAULT_HANDS[active] : h)); clearBrush(); }}>
                    <RotateCcw className="w-3 h-3" /> Reset Hand
                  </SmallBtn>
                  <SmallBtn onClick={() => { setHands(DEFAULT_HANDS); setWatchCfg(DEFAULT_CONFIG); masksRef.current = [null, null, null]; }}>
                    <RotateCcw className="w-3 h-3" /> Reset All
                  </SmallBtn>
                  <SmallBtn onClick={copyConfig}>
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? "Copied!" : "Copy Config"}
                  </SmallBtn>
                </div>
              </CtrlGroup>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   Sub‑components
   ══════════════════════════════════════════════ */

const Label = ({ children }: { children: React.ReactNode }) => (
  <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-gold/60 mb-2 font-medium">{children}</p>
);

const CtrlGroup = ({ title, color, children }: { title: string; color?: string; children: React.ReactNode }) => (
  <div className="bg-surface border border-border rounded-sm p-4 mb-4">
    <p className="font-sans text-[10px] tracking-[0.2em] uppercase font-medium mb-3" style={{ color: color || "hsl(var(--gold))" }}>{title}</p>
    {children}
  </div>
);

const Slider = ({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void;
}) => (
  <div className="mb-2">
    <div className="flex items-center justify-between mb-0.5">
      <span className="font-sans text-[11px] text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        <input type="number" value={value} step={step} min={min} max={max}
          onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v))); }}
          className="w-16 bg-surface-elevated border border-border rounded-sm px-1.5 py-0.5 font-mono text-[11px] text-foreground text-right focus:outline-none focus:border-gold/40" />
        {unit && <span className="font-sans text-[9px] text-muted-foreground/50 w-4">{unit}</span>}
      </div>
    </div>
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer
        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:cursor-pointer
        [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-gold-dark
        [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3
        [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gold [&::-moz-range-thumb]:cursor-pointer
        [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-gold-dark" />
  </div>
);

const MiniSlider = ({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void;
}) => (
  <div className="flex items-center gap-1.5 bg-surface-elevated border border-border rounded-sm px-2 py-1">
    <span className="font-sans text-[9px] text-muted-foreground/60 font-medium">{label}</span>
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-16 h-1 bg-border rounded-full appearance-none cursor-pointer
        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5
        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:cursor-pointer
        [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:h-2.5
        [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gold [&::-moz-range-thumb]:cursor-pointer" />
    <span className="font-mono text-[9px] text-foreground/60 w-8 text-right">{value}</span>
  </div>
);

const SmallBtn = ({ children, onClick, active = false }: { children: React.ReactNode; onClick: () => void; active?: boolean }) => (
  <button onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border font-sans text-[11px] tracking-wider transition-colors ${
      active ? "bg-gold/10 border-gold/40 text-gold" : "bg-surface-elevated border-border text-muted-foreground hover:border-gold/30"
    }`}>{children}</button>
);

const ModeBtn = ({ children, onClick, active, color }: { children: React.ReactNode; onClick: () => void; active: boolean; color: string }) => (
  <button onClick={onClick}
    className={`flex-1 flex flex-col items-center gap-0.5 px-2 py-2 rounded-sm border font-sans text-[11px] tracking-wider transition-all ${
      active ? "text-foreground" : "border-border text-muted-foreground/60 hover:border-border/80"
    }`}
    style={active ? { borderColor: color, backgroundColor: `${color}15`, boxShadow: `0 0 8px ${color}20` } : {}}
  >{children}</button>
);

const MethodBtn = ({ children, onClick, active }: { children: React.ReactNode; onClick: () => void; active: boolean }) => (
  <button onClick={onClick}
    className={`flex-1 text-center px-3 py-2 rounded-sm border font-sans text-[11px] tracking-wider transition-all ${
      active ? "bg-gold/10 border-gold/40 text-gold" : "border-border text-muted-foreground hover:border-gold/20"
    }`}>{children}</button>
);

export default DatejustShowcase;
