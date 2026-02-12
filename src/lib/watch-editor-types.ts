import type { WatchAnalysis, GeneratedImage } from "@/lib/gemini";
import type { HandConfig, ProcessedHand } from "@/lib/hand-processing";
import type { WatchHandsConfig } from "@/components/LiveWatchFace";
import type { Watch } from "@/lib/mock-watches";

/* ─── Angle keys for multi-angle generation ─── */

export type AngleKey = "catalog" | "table" | "emirati" | "suit";

export const ANGLE_KEYS: AngleKey[] = ["catalog", "table", "emirati", "suit"];

/* ─── Editor step ─── */

export type EditorStep = 1 | 2 | 3 | 4 | 5;

/* ─── LiveFaceData — persisted on Watch ─── */

export interface LiveFaceData {
  clean_dial_url: string;
  extracted_hands: {
    hour: { dataUrl: string; pivotX: number; pivotY: number; width?: number; height?: number } | null;
    minute: { dataUrl: string; pivotX: number; pivotY: number; width?: number; height?: number } | null;
    second: { dataUrl: string; pivotX: number; pivotY: number; width?: number; height?: number } | null;
  };
  config: WatchHandsConfig;
}

/* ─── Source image from upload ─── */

export interface SourceImage {
  base64: string;
  mimeType: string;
  previewUrl: string;
}

/* ─── Full editor state ─── */

export interface WatchEditorState {
  // Navigation
  currentStep: EditorStep;
  completedSteps: number[];

  // Step 1 — Upload & Details
  source: SourceImage | null;
  analysis: WatchAnalysis | null;
  analyzing: boolean;
  analyzeError: string | null;
  watchDetails: Partial<Watch>;

  // Step 2 — Multi-Angle Shots
  angleResults: Record<AngleKey, GeneratedImage[]>;
  angleSelections: Record<AngleKey, string | null>;
  generatingAngles: Set<AngleKey>;

  // Step 3 — Clock Hands Extraction
  handSheetResults: GeneratedImage[];
  handSheetSelection: string | null;
  generatingHandSheet: boolean;
  handConfigs: HandConfig[];
  extractedHands: (ProcessedHand | null)[];

  // Step 4 — Clean Dial
  cleanDialResults: GeneratedImage[];
  cleanDialSelection: string | null;
  generatingCleanDial: boolean;

  // Step 5 — Preview & Save
  watchHandsConfig: WatchHandsConfig;
  savedWatchId: string | null;
  editingWatchId: string | null;

  // Per-section generation counts
  angleGenerateCounts: Record<AngleKey, number>;
  handSheetGenerateCount: number;
  cleanDialGenerateCount: number;
  lightbox: GeneratedImage | null;
  zoom: number;
  pan: { x: number; y: number };
}

/* ─── Reducer actions ─── */

export type WatchEditorAction =
  | { type: "SET_STEP"; step: EditorStep }
  | { type: "COMPLETE_STEP"; step: number }
  | { type: "SET_SOURCE"; source: SourceImage }
  | { type: "CLEAR_SOURCE" }
  | { type: "SET_ANALYSIS"; analysis: WatchAnalysis }
  | { type: "SET_ANALYZING"; analyzing: boolean }
  | { type: "SET_ANALYZE_ERROR"; error: string | null }
  | { type: "UPDATE_DETAILS"; details: Partial<Watch> }
  | { type: "SET_ANGLE_RESULTS"; angle: AngleKey; images: GeneratedImage[] }
  | { type: "SELECT_ANGLE"; angle: AngleKey; imageId: string | null }
  | { type: "ADD_GENERATING_ANGLE"; angle: AngleKey }
  | { type: "REMOVE_GENERATING_ANGLE"; angle: AngleKey }
  | { type: "SET_HAND_SHEET_RESULTS"; images: GeneratedImage[] }
  | { type: "SELECT_HAND_SHEET"; imageId: string | null }
  | { type: "SET_GENERATING_HAND_SHEET"; generating: boolean }
  | { type: "SET_HAND_CONFIGS"; configs: HandConfig[] }
  | { type: "SET_EXTRACTED_HANDS"; hands: (ProcessedHand | null)[] }
  | { type: "SET_CLEAN_DIAL_RESULTS"; images: GeneratedImage[] }
  | { type: "SELECT_CLEAN_DIAL"; imageId: string | null }
  | { type: "SET_GENERATING_CLEAN_DIAL"; generating: boolean }
  | { type: "SET_WATCH_CONFIG"; config: WatchHandsConfig }
  | { type: "SET_ANGLE_GENERATE_COUNT"; angle: AngleKey; count: number }
  | { type: "SET_HAND_SHEET_GENERATE_COUNT"; count: number }
  | { type: "SET_CLEAN_DIAL_GENERATE_COUNT"; count: number }
  | { type: "SET_LIGHTBOX"; image: GeneratedImage | null }
  | { type: "SET_ZOOM"; zoom: number }
  | { type: "SET_PAN"; pan: { x: number; y: number } }
  | { type: "MARK_SAVED"; watchId: string }
  | { type: "SET_EDITING_WATCH_ID"; watchId: string }
  | { type: "RESTORE_EDITOR_DATA"; data: Partial<WatchEditorState> }
  | { type: "LOAD_DRAFT"; state: Partial<WatchEditorState> };
