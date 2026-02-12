import { GEMINI_API_KEY } from "@/lib/config";

const TEXT_MODEL = "gemini-2.5-pro";
const IMAGE_MODEL = "nano-banana-pro-preview";
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

export interface HandDetail {
  shape: string;
  material: string;
  finish: string;
  color: string;
  length: string;
  width: string;
  lumePosition: string;
  lumeColor: string;
  tipShape: string;
  baseShape: string;
  mountingHole: string;
  distinguishingFeatures: string;
}

export interface WatchAnalysis {
  brand: string;
  model: string;
  reference: string;
  dialColor: string;
  caseMaterial: string;
  caseSizeMm: number | null;
  movementType: string;
  year: number | null;
  description: string;
  hands: {
    hour: HandDetail;
    minute: HandDetail;
    second: HandDetail;
  };
  summary: string;
}

export interface GeneratedImage {
  id: string;
  base64: string;
  mimeType: string;
}

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

interface CallGeminiOptions {
  responseModalities?: string[];
  model?: string;
}

async function callGemini(
  parts: GeminiPart[],
  options: CallGeminiOptions = {}
): Promise<{ text?: string; images: { data: string; mimeType: string }[] }> {
  const { responseModalities = ["TEXT", "IMAGE"], model = IMAGE_MODEL } = options;

  const response = await fetch(
    `${BASE_URL}/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { responseModalities },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  const candidates = data.candidates ?? [];
  const responseParts = candidates[0]?.content?.parts ?? [];

  let text: string | undefined;
  const images: { data: string; mimeType: string }[] = [];

  for (const part of responseParts) {
    if (part.text) {
      text = (text ?? "") + part.text;
    }
    if (part.inlineData) {
      images.push({
        data: part.inlineData.data,
        mimeType: part.inlineData.mimeType,
      });
    }
  }

  return { text, images };
}

export async function analyzeWatch(
  base64: string,
  mimeType: string
): Promise<WatchAnalysis> {
  const result = await callGemini(
    [
      { inlineData: { mimeType, data: base64 } },
      {
        text: `You are a watch expert. Analyze this watch photo in two steps:

STEP 1 — VISUAL IDENTIFICATION: Look at the photo and identify the watch from what you can see (dial text, design cues, hand style, bezel, case shape, etc.).

STEP 2 — KNOWLEDGE LOOKUP: Once you've identified the brand and model, USE YOUR KNOWLEDGE of this watch to fill in the full specifications. Look up the reference number, case size, movement type, typical year range, materials, and write a proper description.

Return a JSON object with ALL these fields filled in as completely as possible:
{
  "brand": "the watch brand",
  "model": "the full model name",
  "reference": "the reference/caliber number from your knowledge of this watch",
  "dialColor": "dial color",
  "caseMaterial": "case material (e.g. Oystersteel, Stainless Steel, 18k Yellow Gold, Titanium)",
  "caseSizeMm": 41,
  "movementType": "Automatic or Manual or Quartz",
  "year": 2023,
  "description": "A 2-3 sentence product description suitable for a luxury watch e-commerce listing",
  "hands": {
    "hour": {
      "shape": "hand style (mercedes, dauphine, baton, sword, leaf, cathedral, snowflake, pencil, alpha, etc.)",
      "material": "steel, gold, blued steel, etc.",
      "finish": "polished, brushed, matte",
      "color": "the color",
      "length": "short/medium — relative to dial radius",
      "width": "thick/medium/thin",
      "lumePosition": "center strip, edges, dot, fill, none",
      "lumeColor": "color of lume, or 'none'",
      "tipShape": "pointed, flat, arrow, rounded",
      "baseShape": "base near center",
      "mountingHole": "center detail, or 'not visible'",
      "distinguishingFeatures": "anything unique, or 'none'"
    },
    "minute": { same fields as hour },
    "second": { same fields — use "not present" for all fields if there is no seconds hand visible }
  },
  "summary": "one sentence summary"
}

RULES:
- For the hand shapes: describe what you actually SEE in the image.
- For specs (reference, case size, movement, year, description): USE YOUR KNOWLEDGE of this watch model. Don't say "unknown" if you can reasonably identify the watch.
- If you truly cannot identify the watch at all, then use "unknown".
- "year" should be a reasonable production year or null if unknown.
- "caseSizeMm" should be a number or null if unknown.

Return ONLY valid JSON, no markdown fences, no extra text.`,
      },
    ],
    { responseModalities: ["TEXT"], model: TEXT_MODEL }
  );

  if (!result.text) {
    throw new Error("No analysis text returned from Gemini");
  }

  const cleaned = result.text.replace(/```json\s?/g, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned) as WatchAnalysis;
}

export async function generateSingleImage(
  base64: string,
  mimeType: string,
  prompt: string
): Promise<GeneratedImage | null> {
  const result = await callGemini([
    { inlineData: { mimeType, data: base64 } },
    { text: prompt },
  ]);

  if (result.images.length === 0) return null;

  const img = result.images[0];
  return {
    id: crypto.randomUUID(),
    base64: img.data,
    mimeType: img.mimeType,
  };
}

export async function generateImages(
  base64: string,
  mimeType: string,
  prompt: string,
  count: number
): Promise<GeneratedImage[]> {
  const promises = Array.from({ length: count }, () =>
    generateSingleImage(base64, mimeType, prompt)
  );

  const results = await Promise.allSettled(promises);
  const images: GeneratedImage[] = [];

  for (const result of results) {
    if (result.status === "fulfilled" && result.value) {
      images.push(result.value);
    }
  }

  return images;
}

export const CATALOG_PROMPT = `Use the supplied phone photo of a wristwatch as the only reference. Recreate the exact same watch (same dial design, markers, hands, case shape, crown placement, strap, materials, colors, and proportions) but convert it into a perfectly front-facing, straight-on, catalog product image.

ANGLE + GEOMETRY CORRECTION (highest priority):

Correct all phone-camera perspective errors.
Remove tilt, yaw, pitch, roll, keystone distortion, and lens warping.
The dial must appear perfectly circular, not oval.
The watch must be centered and vertically aligned.
The case left/right edges should be symmetrical.
The strap should be aligned straight up/down behind the watch, matching a clean e-commerce presentation.
The crown should remain on the correct side (as per the real watch), but the overall view must be fully frontal.

PRODUCT PHOTO LOOK (clean e-commerce cutout):

Isolated watch on a pure white seamless background (true studio cyclorama look).
Create a subtle soft shadow directly beneath the watch (light grey, feathered edges), and optionally a very faint floor contact shadow under the strap tips if visible.
No background texture, no gradient banding, no props, no hands, no dust, no fingerprints, no scratches unless they exist on the original.

LIGHTING (luxury catalog):

Large softbox overhead as key light, plus gentle side fill to reveal the case curvature and strap texture.
Controlled specular highlights on crystal and metal: clean and minimal, not blown out.
Even illumination across the dial; no harsh hotspots; no dramatic shadows.
Whites must be neutral (no yellow/green tint).

MATERIAL ACCURACY:

Crystal/glass must look real with subtle reflections and correct refraction.
Metal case must retain its finish (brushed/polished) with realistic micro-reflections.
Strap must show natural leather grain and stitching if present, without plastic look.

SHARPNESS + QUALITY:

Ultra crisp edges, high micro-contrast, professional product photography sharpness.
Clean noise-free image, no artifacts, no painterly textures.
High resolution, catalog-ready, premium e-commerce aesthetic.

RESTRICTIONS:

Do not add or remove design elements.
Do not invent logos, text, markings, complications, or hands.
Do not change the dial pattern, proportions, or the case thickness.
No stylization, no cinematic mood, no "art" look — strictly commercial product photo.

Final image should look like a luxury brand catalog cutout: front-facing, centered, symmetrical, clean white background, subtle shadow.`;

function describeHand(hand: HandDetail): string {
  if (hand.shape === "not visible" || hand.shape === "not present") return "";
  const parts: string[] = [];
  parts.push(`${hand.shape} ${hand.material}`);
  if (hand.finish) parts.push(hand.finish);
  if (hand.lumePosition && hand.lumePosition !== "none") parts.push(`with ${hand.lumeColor} luminous ${hand.lumePosition}`);
  if (hand.distinguishingFeatures && hand.distinguishingFeatures !== "none") parts.push(hand.distinguishingFeatures);
  if (hand.tipShape) parts.push(`${hand.tipShape} tip`);
  if (hand.baseShape && hand.baseShape.includes("counterweight")) parts.push(`with ${hand.baseShape}`);
  return parts.join(", ");
}

export function getExtractHandsPrompt(analysis?: WatchAnalysis | null): string {
  // Build concise hand descriptions from analysis
  let hourDesc = "hour hand with luminous inlay";
  let minuteDesc = "longer minute hand with luminous inlay";
  let secondDesc = "thin tapered second hand with a circular counterbalance";
  let material = "polished stainless steel";

  if (analysis) {
    const h = analysis.hands;
    if (h.hour.shape !== "not visible" && h.hour.shape !== "not present") {
      hourDesc = `hour hand — ${describeHand(h.hour)}`;
    }
    if (h.minute.shape !== "not visible" && h.minute.shape !== "not present") {
      minuteDesc = `longer minute hand — ${describeHand(h.minute)}`;
    }
    if (h.second.shape !== "not visible" && h.second.shape !== "not present") {
      secondDesc = `thin second hand — ${describeHand(h.second)}`;
    }
    material = `${h.hour.finish} ${h.hour.material}`.trim() || material;
  }

  return `Professional horology component sheet, three isolated watch hands vertically oriented. Left: ${hourDesc}. Center: ${minuteDesc}. Right: ${secondDesc}. All hands are ${material}, 12 o'clock position, perfectly centered pivots. High-resolution macro photography, neutral lighting, no shadows, pure white background.`;
}

export function getRemoveHandsPrompt(analysis?: WatchAnalysis | null): string {
  let handContext = "";
  if (analysis) {
    const hands = analysis.hands;
    handContext = `

HANDS TO REMOVE (identified from analysis):
- Hour hand: ${hands.hour.shape} shape, ${hands.hour.color} ${hands.hour.material} — remove completely
- Minute hand: ${hands.minute.shape} shape, ${hands.minute.color} ${hands.minute.material} — remove completely
- Second hand: ${hands.second.shape !== "not visible" && hands.second.shape !== "not present" ? `${hands.second.shape} shape, ${hands.second.color} ${hands.second.material} — remove completely` : "not present"}
- Also remove the center pinion/cap if visible`;
  }

  return `Remove ONLY the main watch hands (hour, minute, second) from this watch image.

CRITICAL — WHAT TO REMOVE:
- Remove ONLY the main center hour hand, minute hand, and second hand
- Remove the center pinion/cap where the main hands are mounted

CRITICAL — WHAT TO KEEP (DO NOT TOUCH):
- Keep ALL sub-dial hands intact (chronograph sub-dials, power reserve indicators, GMT hands on sub-dials, etc.)
- Keep ALL small complication hands on any subsidiary dials
- Keep all indices, markers, date window, logos, textures, bezel markings
- Keep everything else perfectly identical

Requirements:
- Reconstruct any dial details that were hidden behind the removed main hands
- Maintain the exact same lighting, angle, and composition
- The result should look like the main dial has no hands, but sub-dials still have their hands
- Same professional catalog presentation as the original
- Photorealistic quality — the removal should be seamless and undetectable${handContext}`;
}
