import type { WatchAnalysis } from "@/lib/gemini";
import type { Watch } from "@/lib/mock-watches";

export function buildWatchDescription(
  analysis?: WatchAnalysis | null,
  details?: Partial<Watch>
): string {
  const brand = details?.brand || analysis?.brand || "luxury watch";
  const model = details?.model || analysis?.model || "";
  const material = details?.case_material || analysis?.caseMaterial || "";
  const dial = details?.dial_color || analysis?.dialColor || "";

  const parts = [brand];
  if (model && model !== "unknown") parts.push(model);

  const specs: string[] = [];
  if (material && material !== "unknown") specs.push(material);
  if (dial && dial !== "unknown") specs.push(`${dial} dial`);
  if (specs.length) parts.push(`(${specs.join(", ")})`);

  return parts.join(" ");
}

export function getTablePrompt(
  analysis?: WatchAnalysis | null,
  details?: Partial<Watch>
): string {
  const desc = buildWatchDescription(analysis, details);
  return `Use the supplied photo of a ${desc} as the only reference. Recreate the exact same watch (same dial, markers, hands, case, crown, strap, materials, colors, proportions) but place it in a lifestyle flat-lay table-setting scene.

WATCH POSITIONING (CRITICAL):
- The watch MUST be laying completely FLAT on the surface, face-up, dial visible from directly above.
- The watch is viewed from a top-down angle (bird's eye / flat-lay perspective).
- The strap or bracelet extends straight up and down, flat on the table.
- Do NOT show the watch standing upright, leaning, or at a steep angle.

SCENE COMPOSITION:
- The watch lies flat on a warm, richly-grained wooden surface (walnut or mahogany).
- Surrounding masculine accessories placed naturally around the watch: a leather-bound notebook or journal, a brass or gold fountain pen, a vintage brass compass (opened), and a small Arabic coffee cup (finjan) on a saucer.
- Items are casually arranged, not lined up — like a gentleman's desk.
- Shallow depth of field: watch tack-sharp in the center, surrounding objects softly blurred.

LIGHTING:
- Warm directional light from upper-left (golden hour or desk lamp feel).
- Soft fill from the right to prevent harsh shadows.
- Gentle specular highlights on the watch crystal and metal surfaces.

QUALITY:
- Editorial lifestyle photography, luxury magazine double-page quality.
- Rich, warm color palette. No cold blue tones.
- Ultra-sharp on the watch, cinematic bokeh on the rest.

RESTRICTIONS:
- Do NOT change the watch design, logos, hands, dial, or proportions.
- Do NOT add a wrist or hand.
- Do NOT add any alcoholic beverages or glasses. No wine, whisky, beer, or cocktails.
- No text overlays, no watermarks.`;
}

export function getEmiratiPrompt(
  analysis?: WatchAnalysis | null,
  details?: Partial<Watch>
): string {
  const desc = buildWatchDescription(analysis, details);
  return `Use the supplied photo of a ${desc} as the only reference. Recreate the exact same watch (same dial, markers, hands, case, crown, strap, materials, colors, proportions) but show it worn on an Emirati man's wrist.

WRIST & SKIN:
- Olive to tan Middle-Eastern skin tone, well-groomed hand.
- The watch sits naturally on the left wrist, crown side out.
- Fingers relaxed, slightly curled — a natural posed position.

CLOTHING:
- White kandora (thobe) sleeve visible, crisp and pressed.
- Possibly a subtle cufflink or traditional detail on the sleeve.

BACKGROUND & SETTING:
- Luxurious but blurred background: marble lobby, gold-accented interior, or premium car interior.
- Shallow depth of field — background is creamy bokeh.

LIGHTING:
- Soft, warm overhead light. Clean specular highlights on watch.
- Natural indoor or golden-hour outdoor feel.

QUALITY:
- High-end watch advertisement photography.
- Skin looks natural and detailed (not plastic or over-smoothed).
- Watch is the hero — tack sharp with perfect detail.

RESTRICTIONS:
- Do NOT change the watch design, logos, hands, dial, or proportions.
- No text overlays, no watermarks.`;
}

export function getSuitPrompt(
  analysis?: WatchAnalysis | null,
  details?: Partial<Watch>
): string {
  const desc = buildWatchDescription(analysis, details);
  return `Use the supplied photo of a ${desc} as the only reference. Recreate the exact same watch (same dial, markers, hands, case, crown, strap, materials, colors, proportions) but show it worn on a Black man's wrist with a formal suit.

WRIST & SKIN:
- Rich dark skin tone, well-groomed hand.
- The watch sits naturally on the left wrist.
- Hand posed elegantly — adjusting a French cuff, or resting on a table edge.

CLOTHING:
- Dark navy or charcoal suit jacket, crisp white dress shirt.
- French cuff with elegant cufflinks visible near the watch.
- Fine fabric texture visible — wool or cashmere.

BACKGROUND & SETTING:
- Professional, upscale blurred background: boardroom, luxury office, or evening event.
- Shallow depth of field — creamy bokeh.

LIGHTING:
- Studio-quality lighting: soft key light from upper right, gentle fill.
- Clean highlights on the watch crystal and case.
- Skin looks natural with rich tones, not flat.

QUALITY:
- High-end editorial / luxury brand campaign photography.
- Ultra-sharp on the watch, cinematic feel overall.

RESTRICTIONS:
- Do NOT change the watch design, logos, hands, dial, or proportions.
- No text overlays, no watermarks.`;
}
