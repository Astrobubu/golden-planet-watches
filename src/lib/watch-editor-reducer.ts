import { DEFAULT_CONFIG } from "@/components/LiveWatchFace";
import { DEFAULT_HANDS } from "@/lib/hand-processing";
import { loadDraft } from "@/lib/watch-editor-storage";
import type { WatchEditorState, WatchEditorAction, AngleKey } from "@/lib/watch-editor-types";

const emptyAngleResults = (): Record<AngleKey, import("@/lib/gemini").GeneratedImage[]> => ({
  catalog: [],
  table: [],
  emirati: [],
  suit: [],
});

const emptyAngleSelections = (): Record<AngleKey, string | null> => ({
  catalog: null,
  table: null,
  emirati: null,
  suit: null,
});

const defaultAngleGenerateCounts = (): Record<AngleKey, number> => ({
  catalog: 3,
  table: 3,
  emirati: 3,
  suit: 3,
});

function defaultState(): WatchEditorState {
  return {
    currentStep: 1,
    completedSteps: [],

    source: null,
    analysis: null,
    analyzing: false,
    analyzeError: null,
    watchDetails: {},

    angleResults: emptyAngleResults(),
    angleSelections: emptyAngleSelections(),
    generatingAngle: null,

    handSheetResults: [],
    handSheetSelection: null,
    generatingHandSheet: false,
    handConfigs: [...DEFAULT_HANDS],
    extractedHands: [null, null, null],

    cleanDialResults: [],
    cleanDialSelection: null,
    generatingCleanDial: false,

    watchHandsConfig: { ...DEFAULT_CONFIG },
    savedWatchId: null,
    editingWatchId: null,

    angleGenerateCounts: defaultAngleGenerateCounts(),
    handSheetGenerateCount: 3,
    cleanDialGenerateCount: 3,
    lightbox: null,
    zoom: 1,
    pan: { x: 0, y: 0 },
  };
}

/** Returns state loaded from draft (for resuming an edit) */
export function getInitialState(): WatchEditorState {
  const base = defaultState();
  const draft = loadDraft();
  if (!draft) return base;
  return { ...base, ...draft };
}

/** Returns a completely clean state (for new watches) */
export function getCleanState(): WatchEditorState {
  return defaultState();
}

export function watchEditorReducer(
  state: WatchEditorState,
  action: WatchEditorAction
): WatchEditorState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.step };

    case "COMPLETE_STEP":
      if (state.completedSteps.includes(action.step)) return state;
      return { ...state, completedSteps: [...state.completedSteps, action.step] };

    case "SET_SOURCE":
      return {
        ...state,
        source: action.source,
        analysis: null,
        analyzeError: null,
        angleResults: emptyAngleResults(),
        angleSelections: emptyAngleSelections(),
        handSheetResults: [],
        handSheetSelection: null,
        cleanDialResults: [],
        cleanDialSelection: null,
        extractedHands: [null, null, null],
        savedWatchId: null,
      };

    case "CLEAR_SOURCE":
      return {
        ...defaultState(),
      };

    case "SET_ANALYSIS":
      return { ...state, analysis: action.analysis, analyzing: false, analyzeError: null };

    case "SET_ANALYZING":
      return { ...state, analyzing: action.analyzing };

    case "SET_ANALYZE_ERROR":
      return { ...state, analyzeError: action.error, ...(action.error ? { analyzing: false } : {}) };

    case "UPDATE_DETAILS":
      return { ...state, watchDetails: { ...state.watchDetails, ...action.details } };

    case "SET_ANGLE_RESULTS":
      return {
        ...state,
        angleResults: { ...state.angleResults, [action.angle]: action.images },
        angleSelections: { ...state.angleSelections, [action.angle]: null },
      };

    case "SELECT_ANGLE":
      return {
        ...state,
        angleSelections: { ...state.angleSelections, [action.angle]: action.imageId },
      };

    case "SET_GENERATING_ANGLE":
      return { ...state, generatingAngle: action.angle };

    case "SET_HAND_SHEET_RESULTS":
      return { ...state, handSheetResults: action.images, handSheetSelection: null };

    case "SELECT_HAND_SHEET":
      return { ...state, handSheetSelection: action.imageId };

    case "SET_GENERATING_HAND_SHEET":
      return { ...state, generatingHandSheet: action.generating };

    case "SET_HAND_CONFIGS":
      return { ...state, handConfigs: action.configs };

    case "SET_EXTRACTED_HANDS":
      return { ...state, extractedHands: action.hands };

    case "SET_CLEAN_DIAL_RESULTS":
      return { ...state, cleanDialResults: action.images, cleanDialSelection: null };

    case "SELECT_CLEAN_DIAL":
      return { ...state, cleanDialSelection: action.imageId };

    case "SET_GENERATING_CLEAN_DIAL":
      return { ...state, generatingCleanDial: action.generating };

    case "SET_WATCH_CONFIG":
      return { ...state, watchHandsConfig: action.config };

    case "SET_ANGLE_GENERATE_COUNT":
      return {
        ...state,
        angleGenerateCounts: { ...state.angleGenerateCounts, [action.angle]: action.count },
      };

    case "SET_HAND_SHEET_GENERATE_COUNT":
      return { ...state, handSheetGenerateCount: action.count };

    case "SET_CLEAN_DIAL_GENERATE_COUNT":
      return { ...state, cleanDialGenerateCount: action.count };

    case "SET_LIGHTBOX":
      return { ...state, lightbox: action.image, zoom: 1, pan: { x: 0, y: 0 } };

    case "SET_ZOOM":
      return { ...state, zoom: action.zoom };

    case "SET_PAN":
      return { ...state, pan: action.pan };

    case "MARK_SAVED":
      return { ...state, savedWatchId: action.watchId };

    case "SET_EDITING_WATCH_ID":
      return { ...state, editingWatchId: action.watchId };

    case "RESTORE_EDITOR_DATA":
      return { ...state, ...action.data };

    case "LOAD_DRAFT":
      return { ...state, ...action.state };

    default:
      return state;
  }
}
