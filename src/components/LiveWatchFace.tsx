import { useEffect, useRef, useState } from "react";

export interface WatchHandsConfig {
  cx: number;
  cy: number;
  radius: number;
  hourLen: number;
  minLen: number;
  secLen: number;
  secTail: number;
  hourW: number;
  minW: number;
  secW: number;
}

export const DEFAULT_CONFIG: WatchHandsConfig = {
  cx: 49.6,
  cy: 37.8,
  radius: 21,
  hourLen: 55,
  minLen: 75,
  secLen: 85,
  secTail: 22,
  hourW: 9,
  minW: 6,
  secW: 1.5,
};

export interface ExtractedHand {
  dataUrl: string;
  naturalWidth: number;
  naturalHeight: number;
  pivotX: number; // 0-100
  pivotY: number; // 0-100
}

interface Props {
  className?: string;
  config?: WatchHandsConfig;
  showGuides?: boolean;
  onImageClick?: (xPct: number, yPct: number) => void;
  imageSrc?: string;
  extractedHands?: {
    hour: ExtractedHand | null;
    minute: ExtractedHand | null;
    second: ExtractedHand | null;
  };
  /** When true, zooms SVG viewBox to center on the watch face */
  centerOnFace?: boolean;
}

export const LiveWatchFace = ({
  className = "",
  config = DEFAULT_CONFIG,
  showGuides = false,
  onImageClick,
  imageSrc = "/watchnohands.png",
  extractedHands,
  centerOnFace = false,
}: Props) => {
  const hourRef = useRef<SVGGElement>(null);
  const minuteRef = useRef<SVGGElement>(null);
  const secondRef = useRef<SVGGElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [vb, setVb] = useState({ w: 474, h: 842 });

  // Preload image dimensions
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.onload = () => setVb({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = imageSrc;
  }, [imageSrc]);

  const cx = (config.cx / 100) * vb.w;
  const cy = (config.cy / 100) * vb.h;
  const r = (config.radius / 100) * vb.w;

  const hLen = (config.hourLen / 100) * r;
  const mLen = (config.minLen / 100) * r;
  const sLen = (config.secLen / 100) * r;
  const sTail = (config.secTail / 100) * r;
  const hW = (config.hourW / 100) * r;
  const mW = (config.minW / 100) * r;
  const sW = (config.secW / 100) * r;

  useEffect(() => {
    let frameId: number;
    const tick = () => {
      const now = new Date();
      const sec = now.getSeconds() + now.getMilliseconds() / 1000;
      const min = now.getMinutes() + sec / 60;
      const hr = (now.getHours() % 12) + min / 60;

      hourRef.current?.setAttribute("transform", `translate(${cx},${cy}) rotate(${hr * 30})`);
      minuteRef.current?.setAttribute("transform", `translate(${cx},${cy}) rotate(${min * 6})`);
      secondRef.current?.setAttribute("transform", `translate(${cx},${cy}) rotate(${sec * 6})`);
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [cx, cy]);

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onImageClick || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    onImageClick(
      ((e.clientX - rect.left) / rect.width) * 100,
      ((e.clientY - rect.top) / rect.height) * 100
    );
  };

  /** Render a bitmap hand as an <image>, scaled so pivot-to-tip = `length` SVG units */
  const renderBitmap = (hand: ExtractedHand, length: number) => {
    const pivotFrac = Math.max(hand.pivotY / 100, 0.01);
    const displayH = length / pivotFrac;
    const displayW = displayH * (hand.naturalWidth / hand.naturalHeight);
    return (
      <image
        href={hand.dataUrl}
        x={-(hand.pivotX / 100) * displayW}
        y={-length}
        width={displayW}
        height={displayH}
      />
    );
  };

  const hasExtracted = extractedHands && (extractedHands.hour || extractedHands.minute || extractedHands.second);

  // Compute viewBox — centered on face or full image
  // For centerOnFace: show the full watch in a square with white bg
  // Use the larger of width/height so the entire image fits in the square
  const side = Math.max(vb.w, vb.h);
  const viewBox = centerOnFace
    ? `${(vb.w - side) / 2} ${(vb.h - side) / 2} ${side} ${side}`
    : `0 0 ${vb.w} ${vb.h}`;

  // Shared SVG content (hands, guides, defs)
  const svgContent = (
    <>
      <defs>
        <linearGradient id="wSteel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6e6e72" />
          <stop offset="25%" stopColor="#b8b8bc" />
          <stop offset="50%" stopColor="#dcdce0" />
          <stop offset="78%" stopColor="#b0b0b4" />
          <stop offset="100%" stopColor="#6e6e72" />
        </linearGradient>
        <linearGradient id="wLume" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e6ead6" />
          <stop offset="100%" stopColor="#cdd4b8" />
        </linearGradient>
        <linearGradient id="wSec" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#888890" />
          <stop offset="50%" stopColor="#d0d0d8" />
          <stop offset="100%" stopColor="#888890" />
        </linearGradient>
      </defs>

      {/* Calibration guides */}
      {showGuides && (
        <g pointerEvents="none">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(0,200,255,0.5)" strokeWidth="2" strokeDasharray="10,5" />
          <circle cx={cx} cy={cy} r={hLen} fill="none" stroke="rgba(255,200,0,0.25)" strokeWidth="1" strokeDasharray="4,4" />
          <circle cx={cx} cy={cy} r={mLen} fill="none" stroke="rgba(0,255,100,0.25)" strokeWidth="1" strokeDasharray="4,4" />
          <line x1={cx - r * 0.2} y1={cy} x2={cx + r * 0.2} y2={cy} stroke="rgba(255,50,50,0.7)" strokeWidth="1.5" />
          <line x1={cx} y1={cy - r * 0.2} x2={cx} y2={cy + r * 0.2} stroke="rgba(255,50,50,0.7)" strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r="3" fill="rgba(255,50,50,0.9)" />
        </g>
      )}

      {/* Hour hand */}
      <g ref={hourRef} transform={`translate(${cx},${cy}) rotate(0)`} style={{ filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.35))" }}>
        {extractedHands?.hour ? renderBitmap(extractedHands.hour, hLen) : !hasExtracted && (
          <>
            <rect x={-hW / 2} y={-hLen} width={hW} height={hLen * 0.78} rx={hW * 0.06} fill="url(#wSteel)" />
            <rect x={-hW * 0.35} y={-hLen + hLen * 0.07} width={hW * 0.7} height={hLen * 0.36} rx={hW * 0.04} fill="url(#wLume)" />
            <path d={`M${-hW / 2},${-hLen * 0.22} L${-hW * 0.72},${-hLen * 0.08} Q${-hW * 0.72},${hW * 0.35} 0,${hW * 0.85} Q${hW * 0.72},${hW * 0.35} ${hW * 0.72},${-hLen * 0.08} L${hW / 2},${-hLen * 0.22} Z`} fill="url(#wSteel)" />
            <circle cx={0} cy={0} r={hW * 0.65} fill="url(#wSteel)" stroke="#7a7a7e" strokeWidth="0.5" />
            <circle cx={0} cy={0} r={hW * 0.28} fill="#111114" />
          </>
        )}
      </g>

      {/* Minute hand */}
      <g ref={minuteRef} transform={`translate(${cx},${cy}) rotate(0)`} style={{ filter: "drop-shadow(0.5px 1px 1.5px rgba(0,0,0,0.3))" }}>
        {extractedHands?.minute ? renderBitmap(extractedHands.minute, mLen) : !hasExtracted && (
          <>
            <rect x={-mW / 2} y={-mLen} width={mW} height={mLen * 0.82} rx={mW * 0.06} fill="url(#wSteel)" />
            <rect x={-mW * 0.35} y={-mLen + mLen * 0.05} width={mW * 0.7} height={mLen * 0.30} rx={mW * 0.04} fill="url(#wLume)" />
            <path d={`M${-mW / 2},${-mLen * 0.18} L${-mW * 0.65},${-mLen * 0.06} Q${-mW * 0.65},${mW * 0.35} 0,${mW * 0.8} Q${mW * 0.65},${mW * 0.35} ${mW * 0.65},${-mLen * 0.06} L${mW / 2},${-mLen * 0.18} Z`} fill="url(#wSteel)" />
            <circle cx={0} cy={0} r={mW * 0.6} fill="url(#wSteel)" stroke="#7a7a7e" strokeWidth="0.4" />
            <circle cx={0} cy={0} r={mW * 0.22} fill="#111114" />
          </>
        )}
      </g>

      {/* Second hand */}
      <g ref={secondRef} transform={`translate(${cx},${cy}) rotate(0)`} style={{ filter: "drop-shadow(0.3px 0.5px 1px rgba(0,0,0,0.2))" }}>
        {extractedHands?.second ? renderBitmap(extractedHands.second, sLen) : !hasExtracted && (
          <>
            <polygon points={`0,${-sLen} ${-sW * 0.7},${-sLen + sW * 4} ${sW * 0.7},${-sLen + sW * 4}`} fill="url(#wSec)" />
            <rect x={-sW / 2} y={-sLen + sW * 3} width={sW} height={sLen - sW * 3} fill="url(#wSec)" />
            <circle cx={0} cy={0} r={sW * 2.8} fill="url(#wSec)" stroke="#6a6a6e" strokeWidth="0.3" />
            <circle cx={0} cy={0} r={sW * 1.1} fill="#1a1a1e" />
            <path d={`M${-sW / 2},0 L${-sW * 1.8},${sTail * 0.55} Q${-sW * 1.8},${sTail} 0,${sTail} Q${sW * 1.8},${sTail} ${sW * 1.8},${sTail * 0.55} L${sW / 2},0 Z`} fill="url(#wSec)" />
          </>
        )}
      </g>

      {/* Center cap */}
      <circle cx={cx} cy={cy} r={Math.max(hW * 0.2, 2)} fill="url(#wSteel)" stroke="#9a9a9e" strokeWidth="0.5" />
    </>
  );

  // Centered-on-face mode: full watch in a square SVG with white background
  if (centerOnFace) {
    const s = Math.max(vb.w, vb.h);
    const bgX = (vb.w - s) / 2;
    const bgY = (vb.h - s) / 2;
    return (
      <div className={`select-none bg-white ${className}`}>
        <svg
          ref={svgRef}
          viewBox={viewBox}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* White background fill */}
          <rect x={bgX} y={bgY} width={s} height={s} fill="white" />
          <image href={imageSrc} x="0" y="0" width={vb.w} height={vb.h} />
          {svgContent}
        </svg>
      </div>
    );
  }

  // Normal mode: img + SVG overlay (for editor calibration)
  return (
    <div className={`relative select-none ${className}`}>
      <img src={imageSrc} alt="Watch face" className="w-full h-auto block" draggable={false} />
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        viewBox={viewBox}
        onClick={handleClick}
        style={{ cursor: onImageClick ? "crosshair" : "default" }}
      >
        {svgContent}
      </svg>
    </div>
  );
};
