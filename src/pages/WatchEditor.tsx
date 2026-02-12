import { useReducer, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { watchEditorReducer, getInitialState, getCleanState } from "@/lib/watch-editor-reducer";
import { saveDraft, getSavedWatchesAsync, loadEditorData, clearDraft } from "@/lib/watch-editor-storage";
import { StepIndicator } from "@/components/watch-editor/StepIndicator";
import { StepUploadDetails } from "@/components/watch-editor/StepUploadDetails";
import { StepMultiAngle } from "@/components/watch-editor/StepMultiAngle";
import { StepHandExtraction } from "@/components/watch-editor/StepHandExtraction";
import { StepCleanDial } from "@/components/watch-editor/StepCleanDial";
import { StepReviewSave } from "@/components/watch-editor/StepReviewSave";
import { EditorLightbox } from "@/components/watch-editor/EditorLightbox";
import type { EditorStep } from "@/lib/watch-editor-types";
import type { GeneratedImage } from "@/lib/gemini";

export default function WatchEditor() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  // Use clean state for new watches, draft state only when resuming an edit
  const [state, dispatch] = useReducer(
    watchEditorReducer,
    editId,
    (id) => id ? getInitialState() : getCleanState()
  );
  const overrideMasks = useRef<(Uint8Array | null)[]>([null, null, null]);
  const editLoadedRef = useRef(false);

  // When visiting /studio (no edit param), ensure we start fresh
  useEffect(() => {
    if (!editId && (state.editingWatchId || state.savedWatchId)) {
      // User navigated to /studio for a new watch but state has stale edit data
      clearDraft();
      dispatch({ type: "CLEAR_SOURCE" });
    }
  }, []); // only on mount

  // Load watch for editing from ?edit=watchId
  useEffect(() => {
    if (!editId || editLoadedRef.current) return;
    editLoadedRef.current = true;

    // Set editing watch ID so save reuses it
    dispatch({ type: "SET_EDITING_WATCH_ID", watchId: editId });
    dispatch({ type: "SET_STEP", step: 1 });

    // Load watch from IDB
    getSavedWatchesAsync().then((saved) => {
      const watch = saved.find((w) => w.id === editId);
      if (!watch) return;

      const details = {
        brand: watch.brand,
        model: watch.model,
        reference_number: watch.reference_number,
        description: watch.description,
        base_price: watch.base_price,
        margin_percent: watch.margin_percent,
        condition_rating: watch.condition_rating,
        year: watch.year,
        dial_color: watch.dial_color,
        case_material: watch.case_material,
        case_size_mm: watch.case_size_mm,
        movement_type: watch.movement_type,
      };
      dispatch({ type: "UPDATE_DETAILS", details });

      // Try to load full editor data from IndexedDB
      loadEditorData(editId).then((editorData) => {
      if (editorData) {
        // Full restore — all generated images, selections, configs
        dispatch({
          type: "RESTORE_EDITOR_DATA",
          data: {
            source: editorData.source,
            analysis: editorData.analysis,
            angleResults: editorData.angleResults,
            angleSelections: editorData.angleSelections,
            handSheetResults: editorData.handSheetResults,
            handSheetSelection: editorData.handSheetSelection,
            cleanDialResults: editorData.cleanDialResults,
            cleanDialSelection: editorData.cleanDialSelection,
            extractedHands: editorData.extractedHands,
            handConfigs: editorData.handConfigs,
            watchHandsConfig: editorData.watchHandsConfig,
            completedSteps: [1, 2, 3, 4, 5],
          },
        });
        // Re-apply details after restore
        dispatch({ type: "UPDATE_DETAILS", details });
      } else {
        // No editor data in IDB — basic restore from Watch object
        const sourceUrl = watch.source_image_url || watch.original_image_url;
        if (sourceUrl) {
          // Determine if we have the actual base64 data
          let base64 = "";
          let mimeType = "image/png";
          if (sourceUrl.startsWith("data:")) {
            const match = sourceUrl.match(/^data:([^;]+);base64,(.+)$/);
            if (match) {
              mimeType = match[1];
              base64 = match[2];
            }
          }
          dispatch({
            type: "SET_SOURCE",
            source: { base64, mimeType, previewUrl: sourceUrl },
          });
          // Re-apply details since SET_SOURCE clears them
          dispatch({ type: "UPDATE_DETAILS", details });
        }

        if (watch.live_face_data) {
          dispatch({ type: "SET_WATCH_CONFIG", config: watch.live_face_data.config });
        }

        dispatch({ type: "COMPLETE_STEP", step: 1 });
      }
      });
    });
  }, [editId]);

  // Debounced draft auto-save (only when editing, not for fresh new watches without source)
  useEffect(() => {
    if (!state.source) return;
    const timer = setTimeout(() => saveDraft(state), 2000);
    return () => clearTimeout(timer);
  }, [state]);

  const goToStep = useCallback(
    (step: EditorStep) => {
      dispatch({ type: "SET_STEP", step });
    },
    []
  );

  const completeAndAdvance = useCallback(
    (currentStep: number, nextStep: EditorStep) => {
      dispatch({ type: "COMPLETE_STEP", step: currentStep });
      dispatch({ type: "SET_STEP", step: nextStep });
    },
    []
  );

  const handleOpenLightbox = useCallback(
    (img: GeneratedImage) => {
      dispatch({ type: "SET_LIGHTBOX", image: img });
    },
    []
  );

  const handleDownload = useCallback((img: GeneratedImage) => {
    const link = document.createElement("a");
    link.href = `data:${img.mimeType};base64,${img.base64}`;
    link.download = `watch-${Date.now()}.png`;
    link.click();
  }, []);

  const handleCloseLightbox = useCallback(() => {
    dispatch({ type: "SET_LIGHTBOX", image: null });
  }, []);

  const isEditing = !!state.editingWatchId;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container pt-28 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold/60 mb-2">
            {isEditing ? "Editing" : "AI-Powered"}
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-gold-gradient mb-3">
            {isEditing ? "Edit Listing" : "Watch Editor"}
          </h1>
          <p className="text-muted-foreground max-w-xl">
            {isEditing
              ? "Review and modify your watch listing. All your generated images are preserved."
              : "Create complete watch listings with AI-generated multi-angle shots and animated live faces."
            }
          </p>
        </motion.div>

        {/* Step Indicator */}
        <StepIndicator
          currentStep={state.currentStep}
          completedSteps={state.completedSteps}
          onStepClick={goToStep}
        />

        {/* Step Content */}
        {state.currentStep === 1 && (
          <StepUploadDetails
            source={state.source}
            analysis={state.analysis}
            analyzing={state.analyzing}
            analyzeError={state.analyzeError}
            watchDetails={state.watchDetails}
            dispatch={dispatch}
            onContinue={() => completeAndAdvance(1, 2)}
          />
        )}

        {state.currentStep === 2 && state.source && (
          <StepMultiAngle
            source={state.source}
            analysis={state.analysis}
            watchDetails={state.watchDetails}
            angleResults={state.angleResults}
            angleSelections={state.angleSelections}
            generatingAngles={state.generatingAngles}
            angleGenerateCounts={state.angleGenerateCounts}
            dispatch={dispatch}
            onOpenLightbox={handleOpenLightbox}
            onDownload={handleDownload}
            onContinue={() => completeAndAdvance(2, 3)}
            onBack={() => goToStep(1)}
          />
        )}

        {state.currentStep === 3 && state.source && (
          <StepHandExtraction
            source={state.source}
            analysis={state.analysis}
            handSheetResults={state.handSheetResults}
            handSheetSelection={state.handSheetSelection}
            generatingHandSheet={state.generatingHandSheet}
            handConfigs={state.handConfigs}
            extractedHands={state.extractedHands}
            handSheetGenerateCount={state.handSheetGenerateCount}
            dispatch={dispatch}
            overrideMasks={overrideMasks}
            onOpenLightbox={handleOpenLightbox}
            onDownload={handleDownload}
            onContinue={() => completeAndAdvance(3, 4)}
            onBack={() => goToStep(2)}
          />
        )}

        {state.currentStep === 4 && state.source && (
          <StepCleanDial
            source={state.source}
            analysis={state.analysis}
            angleSelections={state.angleSelections}
            angleResults={state.angleResults}
            cleanDialResults={state.cleanDialResults}
            cleanDialSelection={state.cleanDialSelection}
            generatingCleanDial={state.generatingCleanDial}
            extractedHands={state.extractedHands}
            handConfigs={state.handConfigs}
            watchHandsConfig={state.watchHandsConfig}
            cleanDialGenerateCount={state.cleanDialGenerateCount}
            dispatch={dispatch}
            onOpenLightbox={handleOpenLightbox}
            onDownload={handleDownload}
            onContinue={() => completeAndAdvance(4, 5)}
            onBack={() => goToStep(3)}
          />
        )}

        {state.currentStep === 5 && state.source && (
          <StepReviewSave
            source={state.source}
            watchDetails={state.watchDetails}
            angleSelections={state.angleSelections}
            angleResults={state.angleResults}
            cleanDialSelection={state.cleanDialSelection}
            cleanDialResults={state.cleanDialResults}
            extractedHands={state.extractedHands}
            handConfigs={state.handConfigs}
            watchHandsConfig={state.watchHandsConfig}
            editingWatchId={state.editingWatchId}
            fullState={state}
            dispatch={dispatch}
            onBack={() => goToStep(4)}
          />
        )}
      </main>

      {/* Shared Lightbox */}
      <EditorLightbox
        image={state.lightbox}
        onClose={handleCloseLightbox}
        onDownload={handleDownload}
        zoom={state.zoom}
        onZoom={(z) => dispatch({ type: "SET_ZOOM", zoom: z })}
        pan={state.pan}
        onPan={(p) => dispatch({ type: "SET_PAN", pan: p })}
      />
    </div>
  );
}
