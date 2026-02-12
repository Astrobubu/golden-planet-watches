import type { Watch } from "@/lib/mock-watches";
import type { WatchEditorState, AngleKey, SourceImage } from "@/lib/watch-editor-types";
import type { GeneratedImage, WatchAnalysis } from "@/lib/gemini";
import type { HandConfig, ProcessedHand } from "@/lib/hand-processing";
import type { WatchHandsConfig } from "@/components/LiveWatchFace";
import { idbSet, idbGet, idbDelete } from "@/lib/idb-images";

const DRAFT_KEY = "mdt_watch_editor_draft";
const WATCHES_IDB_KEY = "saved_watches";

/* ─── Draft persistence (metadata only, no base64 images) ─── */

interface DraftData {
  watchDetails: Partial<Watch>;
  currentStep: number;
  completedSteps: number[];
  angleSelections: Record<string, string | null>;
  handSheetSelection: string | null;
  cleanDialSelection: string | null;
  handConfigs: HandConfig[];
  watchHandsConfig: WatchHandsConfig;
  editingWatchId: string | null;
}

export function saveDraft(state: WatchEditorState): void {
  try {
    const draft: DraftData = {
      watchDetails: state.watchDetails,
      currentStep: state.currentStep,
      completedSteps: state.completedSteps,
      angleSelections: state.angleSelections,
      handSheetSelection: state.handSheetSelection,
      cleanDialSelection: state.cleanDialSelection,
      handConfigs: state.handConfigs,
      watchHandsConfig: state.watchHandsConfig,
      editingWatchId: state.editingWatchId,
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export function loadDraft(): Partial<WatchEditorState> | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft: DraftData = JSON.parse(raw);
    return {
      watchDetails: draft.watchDetails ?? {},
      currentStep: (draft.currentStep as WatchEditorState["currentStep"]) ?? 1,
      completedSteps: draft.completedSteps ?? [],
      handConfigs: draft.handConfigs,
      watchHandsConfig: draft.watchHandsConfig,
      editingWatchId: draft.editingWatchId ?? null,
    };
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

/* ─── Saved watches (IndexedDB — handles large base64 images) ─── */

export async function saveWatch(watch: Watch): Promise<void> {
  const existing = await getSavedWatchesAsync();
  const idx = existing.findIndex((w) => w.id === watch.id);
  if (idx >= 0) {
    existing[idx] = watch;
  } else {
    existing.push(watch);
  }
  await idbSet(WATCHES_IDB_KEY, existing);
}

export async function getSavedWatchesAsync(): Promise<Watch[]> {
  try {
    const data = await idbGet<Watch[]>(WATCHES_IDB_KEY);
    if (data) return data;

    // Migrate from localStorage if exists
    const LEGACY_KEY = "mdt_saved_watches";
    const raw = localStorage.getItem(LEGACY_KEY);
    if (raw) {
      const watches = JSON.parse(raw) as Watch[];
      await idbSet(WATCHES_IDB_KEY, watches);
      localStorage.removeItem(LEGACY_KEY);
      return watches;
    }

    return [];
  } catch {
    return [];
  }
}

/** Synchronous fallback — reads from localStorage legacy key only (for initial render) */
export function getSavedWatches(): Watch[] {
  try {
    const raw = localStorage.getItem("mdt_saved_watches");
    if (!raw) return [];
    return JSON.parse(raw) as Watch[];
  } catch {
    return [];
  }
}

/* ─── Delete a saved watch from IndexedDB ─── */

export async function deleteWatch(id: string): Promise<void> {
  const existing = await getSavedWatchesAsync();
  const filtered = existing.filter((w) => w.id !== id);
  await idbSet(WATCHES_IDB_KEY, filtered);
}

/* ─── Hidden watches (mock watches the user wants to hide) ─── */

const HIDDEN_KEY = "gpw_hidden_watches";

export function getHiddenWatches(): string[] {
  try {
    const raw = localStorage.getItem(HIDDEN_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function addHiddenWatch(id: string): void {
  const hidden = getHiddenWatches();
  if (!hidden.includes(id)) {
    hidden.push(id);
    localStorage.setItem(HIDDEN_KEY, JSON.stringify(hidden));
  }
}

export function removeHiddenWatch(id: string): void {
  const hidden = getHiddenWatches().filter((h) => h !== id);
  localStorage.setItem(HIDDEN_KEY, JSON.stringify(hidden));
}

/* ─── Editor data persistence (IndexedDB — all generated images) ─── */

export interface WatchEditorSavedData {
  source: SourceImage;
  analysis: WatchAnalysis | null;
  angleResults: Record<AngleKey, GeneratedImage[]>;
  angleSelections: Record<AngleKey, string | null>;
  handSheetResults: GeneratedImage[];
  handSheetSelection: string | null;
  cleanDialResults: GeneratedImage[];
  cleanDialSelection: string | null;
  extractedHands: (ProcessedHand | null)[];
  handConfigs: HandConfig[];
  watchHandsConfig: WatchHandsConfig;
}

const editorKey = (watchId: string) => `editor:${watchId}`;

export async function saveEditorData(
  watchId: string,
  state: WatchEditorState
): Promise<void> {
  if (!state.source) return;

  // Ensure previewUrl is a data URL (blob URLs expire across sessions)
  const source: SourceImage = { ...state.source };
  if (source.base64 && source.previewUrl.startsWith("blob:")) {
    source.previewUrl = `data:${source.mimeType};base64,${source.base64}`;
  }

  const data: WatchEditorSavedData = {
    source,
    analysis: state.analysis,
    angleResults: state.angleResults,
    angleSelections: state.angleSelections,
    handSheetResults: state.handSheetResults,
    handSheetSelection: state.handSheetSelection,
    cleanDialResults: state.cleanDialResults,
    cleanDialSelection: state.cleanDialSelection,
    extractedHands: state.extractedHands,
    handConfigs: state.handConfigs,
    watchHandsConfig: state.watchHandsConfig,
  };
  await idbSet(editorKey(watchId), data);
}

export async function loadEditorData(
  watchId: string
): Promise<WatchEditorSavedData | null> {
  const data = await idbGet<WatchEditorSavedData>(editorKey(watchId));
  return data ?? null;
}

export async function deleteEditorData(watchId: string): Promise<void> {
  await idbDelete(editorKey(watchId));
}
