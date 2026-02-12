/* ═══════════════════════════════════════════════
   Hand‑image processing utilities
   ═══════════════════════════════════════════════ */

export interface HandConfig {
  cropX: number;
  cropY: number;
  cropW: number;
  cropH: number;
  method: "floodfill" | "threshold";
  // flood fill
  tolerance: number;
  // threshold
  thresholdVal: number;
  softness: number;
  contrast: number;
  brightness: number;
  // shared
  feather: number;
  invertMask: boolean;
  edgeShift: number; // -5 to +5 — negative = dilate (expand), positive = erode (shrink)
  // pivot
  pivotX: number;
  pivotY: number;
  // metadata
  colorName: string;
  hasLume: boolean;
}

export interface ProcessedHand {
  dataUrl: string;
  width: number;
  height: number;
  dominantColor: string; // hex color sampled from opaque pixels
}

export const DEFAULT_HANDS: HandConfig[] = [
  { cropX: 4, cropY: 2, cropW: 28, cropH: 96, method: "floodfill", tolerance: 45, thresholdVal: 195, softness: 12, contrast: 30, brightness: 0, feather: 1, invertMask: false, edgeShift: 0, pivotX: 50, pivotY: 78, colorName: "", hasLume: false },
  { cropX: 37, cropY: 2, cropW: 27, cropH: 96, method: "floodfill", tolerance: 45, thresholdVal: 195, softness: 12, contrast: 30, brightness: 0, feather: 1, invertMask: false, edgeShift: 0, pivotX: 50, pivotY: 80, colorName: "", hasLume: false },
  { cropX: 68, cropY: 2, cropW: 28, cropH: 96, method: "floodfill", tolerance: 45, thresholdVal: 195, softness: 12, contrast: 30, brightness: 0, feather: 1, invertMask: false, edgeShift: 0, pivotX: 50, pivotY: 80, colorName: "", hasLume: false },
];

/* ──────── helpers ──────── */

function clamp(v: number) {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

function cropRegion(img: HTMLImageElement, cfg: HandConfig) {
  const srcW = img.naturalWidth, srcH = img.naturalHeight;
  const sx = Math.round((cfg.cropX / 100) * srcW);
  const sy = Math.round((cfg.cropY / 100) * srcH);
  const sw = Math.max(1, Math.round((cfg.cropW / 100) * srcW));
  const sh = Math.max(1, Math.round((cfg.cropH / 100) * srcH));
  const c = document.createElement("canvas");
  c.width = sw; c.height = sh;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
  return { canvas: c, ctx, sw, sh };
}

/* ──────── flood fill from borders ──────── */

function floodFillBorders(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  tolerance: number,
  overrideMask: Uint8Array | null // 0=auto, 1=protect, 2=remove
) {
  const len = w * h;
  const visited = new Uint8Array(len);

  // sample background color from the 4 corners
  const sample = (idx: number) => [data[idx * 4], data[idx * 4 + 1], data[idx * 4 + 2]];
  const corners = [0, w - 1, (h - 1) * w, (h - 1) * w + w - 1];
  let br = 0, bg = 0, bb = 0;
  for (const c of corners) { const s = sample(c); br += s[0]; bg += s[1]; bb += s[2]; }
  br /= 4; bg /= 4; bb /= 4;

  const tolSq = tolerance * tolerance * 3; // squared euclidean tolerance

  // fast queue using typed array
  const queue = new Int32Array(len);
  let head = 0, tail = 0;

  const enqueue = (idx: number) => {
    if (idx >= 0 && idx < len && !visited[idx]) {
      visited[idx] = 1;
      queue[tail++] = idx;
    }
  };

  // seed all border pixels
  for (let x = 0; x < w; x++) { enqueue(x); enqueue((h - 1) * w + x); }
  for (let y = 1; y < h - 1; y++) { enqueue(y * w); enqueue(y * w + w - 1); }

  while (head < tail) {
    const idx = queue[head++];

    // respect overrides
    if (overrideMask && overrideMask[idx] === 1) continue; // protected → stop

    const r = data[idx * 4], g = data[idx * 4 + 1], b = data[idx * 4 + 2];
    const distSq = (r - br) * (r - br) + (g - bg) * (g - bg) + (b - bb) * (b - bb);

    if (distSq <= tolSq) {
      data[idx * 4 + 3] = 0; // transparent

      const x = idx % w, y = (idx - x) / w;
      if (x > 0) enqueue(idx - 1);
      if (x < w - 1) enqueue(idx + 1);
      if (y > 0) enqueue(idx - w);
      if (y < h - 1) enqueue(idx + w);
    }
  }

  // apply force‑remove overrides
  if (overrideMask) {
    for (let i = 0; i < len; i++) {
      if (overrideMask[i] === 2) data[i * 4 + 3] = 0;
    }
  }
}

/* ──────── threshold masking (legacy) ──────── */

function thresholdMask(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  cfg: HandConfig,
  overrideMask: Uint8Array | null
) {
  const cf = (259 * (cfg.contrast + 255)) / (255 * (259 - cfg.contrast));
  const soft = Math.max(cfg.softness, 0.1);
  const len = w * h;

  for (let i = 0; i < len; i++) {
    const pi = i * 4;
    // overrides first
    if (overrideMask) {
      if (overrideMask[i] === 1) { data[pi + 3] = 255; continue; }
      if (overrideMask[i] === 2) { data[pi + 3] = 0; continue; }
    }

    const r = data[pi], g = data[pi + 1], b = data[pi + 2];
    const ar = clamp(cf * (r - 128) + 128 + cfg.brightness);
    const ag = clamp(cf * (g - 128) + 128 + cfg.brightness);
    const ab = clamp(cf * (b - 128) + 128 + cfg.brightness);
    const lum = 0.299 * ar + 0.587 * ag + 0.114 * ab;
    let alpha = clamp(255 * (cfg.thresholdVal - lum + soft) / (2 * soft));
    if (cfg.invertMask) alpha = 255 - alpha;
    data[pi + 3] = Math.round(alpha);
  }
}

/* ──────── edge shift (erosion / dilation on alpha) ──────── */

function applyEdgeShift(data: Uint8ClampedArray, w: number, h: number, shift: number) {
  if (shift === 0) return;
  const radius = Math.abs(Math.round(shift));
  const erode = shift > 0; // positive = shrink opaque area

  // Extract alpha channel
  const src = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) src[i] = data[i * 4 + 3];

  // Horizontal pass — min (erode) or max (dilate)
  const tmp = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let val = src[y * w + x];
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = x + dx;
        if (nx >= 0 && nx < w) {
          const s = src[y * w + nx];
          val = erode ? Math.min(val, s) : Math.max(val, s);
        }
      }
      tmp[y * w + x] = val;
    }
  }

  // Vertical pass
  const dst = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let val = tmp[y * w + x];
      for (let dy = -radius; dy <= radius; dy++) {
        const ny = y + dy;
        if (ny >= 0 && ny < h) {
          const s = tmp[ny * w + x];
          val = erode ? Math.min(val, s) : Math.max(val, s);
        }
      }
      dst[y * w + x] = val;
    }
  }

  // Write back
  for (let i = 0; i < w * h; i++) data[i * 4 + 3] = dst[i];
}

/* ──────── feather (box blur on alpha) ──────── */

function blurAlpha(d: Uint8ClampedArray, w: number, h: number, radius: number) {
  if (radius <= 0) return;
  const len = w * h;
  let cur = new Float32Array(len);
  let nxt = new Float32Array(len);
  for (let i = 0; i < len; i++) cur[i] = d[i * 4 + 3];

  for (let pass = 0; pass < 2; pass++) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let s = 0, c = 0;
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          if (nx >= 0 && nx < w) { s += cur[y * w + nx]; c++; }
        }
        nxt[y * w + x] = s / c;
      }
    }
    [cur, nxt] = [nxt, cur];
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        let s = 0, c = 0;
        for (let dy = -radius; dy <= radius; dy++) {
          const ny = y + dy;
          if (ny >= 0 && ny < h) { s += cur[ny * w + x]; c++; }
        }
        nxt[y * w + x] = s / c;
      }
    }
    [cur, nxt] = [nxt, cur];
  }
  for (let i = 0; i < len; i++) d[i * 4 + 3] = Math.round(cur[i]);
}

/* ──────── dominant color sampling ──────── */

function sampleDominantColor(data: Uint8ClampedArray): string {
  let rSum = 0, gSum = 0, bSum = 0, count = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 128) {
      rSum += data[i];
      gSum += data[i + 1];
      bSum += data[i + 2];
      count++;
    }
  }
  if (count === 0) return "#808080";
  const r = Math.round(rSum / count);
  const g = Math.round(gSum / count);
  const b = Math.round(bSum / count);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/* ──────── core mask pipeline ──────── */

function applyMaskPipeline(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  cfg: HandConfig,
  overrideMask: Uint8Array | null
) {
  if (cfg.method === "floodfill") {
    floodFillBorders(data, w, h, cfg.tolerance, overrideMask);
    if (cfg.invertMask) {
      for (let i = 0; i < data.length; i += 4) data[i + 3] = 255 - data[i + 3];
    }
  } else {
    thresholdMask(data, w, h, cfg, overrideMask);
  }

  // Edge shift (erosion/dilation) — after mask, before feather
  if (cfg.edgeShift !== undefined && cfg.edgeShift !== 0) {
    applyEdgeShift(data, w, h, cfg.edgeShift);
  }

  if (cfg.feather > 0) blurAlpha(data, w, h, Math.round(cfg.feather));
}

/* ──────── PUBLIC: process one hand ──────── */

export function processHand(
  sourceImg: HTMLImageElement,
  cfg: HandConfig,
  overrideMask: Uint8Array | null
): ProcessedHand | null {
  const { canvas, ctx, sw, sh } = cropRegion(sourceImg, cfg);
  const imgData = ctx.getImageData(0, 0, sw, sh);

  applyMaskPipeline(imgData.data, sw, sh, cfg, overrideMask);

  const dominantColor = sampleDominantColor(imgData.data);

  ctx.putImageData(imgData, 0, 0);
  return { dataUrl: canvas.toDataURL("image/png"), width: sw, height: sh, dominantColor };
}

/* ──────── PUBLIC: draw preview onto visible canvas ──────── */

export function drawPreview(
  canvas: HTMLCanvasElement,
  sourceImg: HTMLImageElement,
  cfg: HandConfig,
  overrideMask: Uint8Array | null,
  showMask: boolean,
  showOverrides: boolean
) {
  const { sw, sh } = (() => {
    const srcW = sourceImg.naturalWidth, srcH = sourceImg.naturalHeight;
    return {
      sw: Math.max(1, Math.round((cfg.cropW / 100) * srcW)),
      sh: Math.max(1, Math.round((cfg.cropH / 100) * srcH)),
    };
  })();

  // Process into temp canvas
  const { canvas: pCanvas, ctx: pCtx } = cropRegion(sourceImg, cfg);
  const pData = pCtx.getImageData(0, 0, sw, sh);

  applyMaskPipeline(pData.data, sw, sh, cfg, overrideMask);

  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d")!;

  if (showMask) {
    // grayscale mask view
    for (let i = 0; i < pData.data.length; i += 4) {
      const a = pData.data[i + 3];
      pData.data[i] = a; pData.data[i + 1] = a; pData.data[i + 2] = a; pData.data[i + 3] = 255;
    }
    pCtx.putImageData(pData, 0, 0);
    ctx.drawImage(pCanvas, 0, 0);
  } else {
    // checkerboard + composited result
    const sz = 8;
    for (let y = 0; y < sh; y += sz) {
      for (let x = 0; x < sw; x += sz) {
        ctx.fillStyle = ((Math.floor(x / sz) + Math.floor(y / sz)) % 2 === 0) ? "#3a3a3a" : "#4a4a4a";
        ctx.fillRect(x, y, sz, sz);
      }
    }
    pCtx.putImageData(pData, 0, 0);
    ctx.drawImage(pCanvas, 0, 0);
  }

  // draw override brush strokes overlay
  if (showOverrides && overrideMask) {
    for (let i = 0; i < sw * sh; i++) {
      if (overrideMask[i] === 1) {
        const x = i % sw, y = (i - x) / sw;
        ctx.fillStyle = "rgba(0,220,80,0.25)";
        ctx.fillRect(x, y, 1, 1);
      } else if (overrideMask[i] === 2) {
        const x = i % sw, y = (i - x) / sw;
        ctx.fillStyle = "rgba(255,60,60,0.25)";
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  // pivot crosshair
  const px = (cfg.pivotX / 100) * sw;
  const py = (cfg.pivotY / 100) * sh;
  ctx.strokeStyle = "#ff3333";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(px - 14, py); ctx.lineTo(px + 14, py);
  ctx.moveTo(px, py - 14); ctx.lineTo(px, py + 14);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(px, py, 7, 0, Math.PI * 2);
  ctx.stroke();
}

/* ──────── PUBLIC: paint brush stroke ──────── */

export function paintBrushStroke(
  mask: Uint8Array,
  w: number,
  h: number,
  x0: number, y0: number,
  x1: number, y1: number,
  radius: number,
  value: 1 | 2 // 1=protect, 2=remove
) {
  const stamp = (cx: number, cy: number) => {
    const r = Math.round(radius);
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy <= r * r) {
          const px = Math.round(cx) + dx;
          const py = Math.round(cy) + dy;
          if (px >= 0 && px < w && py >= 0 && py < h) {
            mask[py * w + px] = value;
          }
        }
      }
    }
  };

  const dx = x1 - x0, dy = y1 - y0;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const steps = Math.max(1, Math.ceil(dist / Math.max(radius * 0.4, 1)));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    stamp(x0 + dx * t, y0 + dy * t);
  }
}

export function getCropDims(img: HTMLImageElement, cfg: HandConfig) {
  const srcW = img.naturalWidth, srcH = img.naturalHeight;
  return {
    w: Math.max(1, Math.round((cfg.cropW / 100) * srcW)),
    h: Math.max(1, Math.round((cfg.cropH / 100) * srcH)),
  };
}
