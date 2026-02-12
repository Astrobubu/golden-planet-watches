import { useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, RefreshCw, Loader2, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { CONDITIONS, type ConditionRating } from "@/lib/conditions";
import { analyzeWatch, type WatchAnalysis } from "@/lib/gemini";
import type { Watch } from "@/lib/mock-watches";
import type { SourceImage, WatchEditorAction } from "@/lib/watch-editor-types";
import { DirhamSign } from "@/components/DirhamSign";
import { useState } from "react";

interface Props {
  source: SourceImage | null;
  analysis: WatchAnalysis | null;
  analyzing: boolean;
  analyzeError: string | null;
  watchDetails: Partial<Watch>;
  dispatch: React.Dispatch<WatchEditorAction>;
  onContinue: () => void;
}

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1];
      resolve({ base64, mimeType: file.type });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function StepUploadDetails({
  source,
  analysis,
  analyzing,
  analyzeError,
  watchDetails,
  dispatch,
  onContinue,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const { base64, mimeType } = await fileToBase64(file);
      const previewUrl = URL.createObjectURL(file);
      dispatch({ type: "SET_SOURCE", source: { base64, mimeType, previewUrl } });
    },
    [dispatch]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleAnalyze = useCallback(async () => {
    if (!source || analyzing) return;
    dispatch({ type: "SET_ANALYZE_ERROR", error: null });
    dispatch({ type: "SET_ANALYZING", analyzing: true });
    try {
      const result = await analyzeWatch(source.base64, source.mimeType);
      dispatch({ type: "SET_ANALYSIS", analysis: result });
      // Auto-fill details from analysis
      const updates: Partial<Watch> = {};
      if (result.brand && result.brand !== "unknown") updates.brand = result.brand;
      if (result.model && result.model !== "unknown") updates.model = result.model;
      if (result.reference && result.reference !== "unknown") updates.reference_number = result.reference;
      if (result.dialColor && result.dialColor !== "unknown") updates.dial_color = result.dialColor;
      if (result.caseMaterial && result.caseMaterial !== "unknown") updates.case_material = result.caseMaterial;
      if (result.caseSizeMm) updates.case_size_mm = result.caseSizeMm;
      if (result.movementType && result.movementType !== "unknown") updates.movement_type = result.movementType;
      if (result.year) updates.year = result.year;
      if (result.description && result.description !== "unknown") updates.description = result.description;
      dispatch({ type: "UPDATE_DETAILS", details: updates });
    } catch (e) {
      dispatch({ type: "SET_ANALYZE_ERROR", error: e instanceof Error ? e.message : "Analysis failed" });
    }
  }, [source, analyzing, dispatch]);

  const updateField = useCallback(
    (field: keyof Watch, value: string | number) => {
      dispatch({ type: "UPDATE_DETAILS", details: { [field]: value } as Partial<Watch> });
    },
    [dispatch]
  );

  const canContinue = !!(watchDetails.brand && watchDetails.model && source);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Upload Zone */}
      <div className="rounded-lg border border-gold/20 bg-surface-elevated overflow-hidden">
        <div className="p-4">
          <p className="text-[10px] tracking-[0.2em] uppercase text-gold/60 mb-3">
            Source Image
          </p>

          {!source ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="relative flex flex-col items-center justify-center gap-3 p-10 border-2 border-dashed border-gold/20 rounded-lg cursor-pointer transition-colors hover:border-gold/40 hover:bg-gold/5"
            >
              <Upload className="w-8 h-8 text-gold/40" />
              <p className="text-sm text-muted-foreground text-center">
                Drag & drop a watch photo
                <br />
                <span className="text-gold/60">or click to browse</span>
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-lg overflow-hidden aspect-square bg-black/30 max-w-xs mx-auto">
                <img
                  src={source.previewUrl}
                  alt="Source watch"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => dispatch({ type: "CLEAR_SOURCE" })}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-gold transition-colors"
                >
                  <X className="w-3 h-3" />
                  Clear
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gold/30 text-sm text-gold hover:bg-gold/10 transition-colors disabled:opacity-50"
                >
                  {analyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {analyzing ? "Analyzing..." : "Analyze Watch"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Analyze error */}
      {analyzeError && (
        <p className="text-sm text-red-400 text-center">{analyzeError}</p>
      )}

      {/* Analysis panel (collapsible) */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-lg border border-gold/20 bg-surface-elevated overflow-hidden"
          >
            <button
              onClick={() => setShowAnalysis(!showAnalysis)}
              className="w-full flex items-center justify-between p-4"
            >
              <span className="text-[10px] tracking-[0.2em] uppercase text-gold/60">
                Analysis Details
              </span>
              {showAnalysis ? (
                <ChevronUp className="w-4 h-4 text-gold/40" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gold/40" />
              )}
            </button>
            {showAnalysis && (
              <div className="px-4 pb-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Brand</span>
                  <span className="text-foreground font-medium">{analysis.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Model</span>
                  <span className="text-foreground font-medium">{analysis.model}</span>
                </div>
                <Separator className="my-2 bg-gold/10" />
                {(["hour", "minute", "second"] as const).map((hand) => {
                  const h = analysis.hands[hand];
                  if (h.shape === "not visible" || h.shape === "not present") return null;
                  return (
                    <div key={hand} className="mb-2">
                      <p className="text-[10px] tracking-[0.2em] uppercase text-gold/60 mb-1">
                        {hand} hand
                      </p>
                      <div className="text-xs space-y-0.5">
                        <div><span className="text-muted-foreground">Shape: </span>{h.shape}</div>
                        <div><span className="text-muted-foreground">Material: </span>{h.material}, {h.finish}</div>
                        <div><span className="text-muted-foreground">Color: </span>{h.color}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Watch Details Form */}
      {source && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-gold/20 bg-surface-elevated p-4 space-y-4"
        >
          <p className="text-[10px] tracking-[0.2em] uppercase text-gold/60">
            Watch Details
          </p>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Brand" value={watchDetails.brand ?? ""} onChange={(v) => updateField("brand", v)} />
            <Field label="Model" value={watchDetails.model ?? ""} onChange={(v) => updateField("model", v)} />
            <Field label="Reference" value={watchDetails.reference_number ?? ""} onChange={(v) => updateField("reference_number", v)} />
            <Field label="Year" type="number" value={watchDetails.year ?? ""} onChange={(v) => updateField("year", Number(v))} />
            <Field label="Dial Color" value={watchDetails.dial_color ?? ""} onChange={(v) => updateField("dial_color", v)} />
            <Field label="Case Material" value={watchDetails.case_material ?? ""} onChange={(v) => updateField("case_material", v)} />
            <Field label="Case Size (mm)" type="number" value={watchDetails.case_size_mm ?? ""} onChange={(v) => updateField("case_size_mm", Number(v))} />
            <Field label={<>Base Price <DirhamSign className="w-3 h-3" /></>} type="number" value={watchDetails.base_price ?? ""} onChange={(v) => updateField("base_price", Number(v))} />
            <Field label="Margin %" type="number" value={watchDetails.margin_percent ?? 10} onChange={(v) => updateField("margin_percent", Number(v))} />
            <SelectField
              label="Condition"
              value={watchDetails.condition_rating ?? "A"}
              options={Object.keys(CONDITIONS) as ConditionRating[]}
              onChange={(v) => updateField("condition_rating", v)}
            />
            <SelectField
              label="Movement"
              value={watchDetails.movement_type ?? "Automatic"}
              options={["Automatic", "Manual", "Quartz"]}
              onChange={(v) => updateField("movement_type", v)}
            />
          </div>

          <div>
            <label className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground block mb-1">Description</label>
            <textarea
              value={watchDetails.description ?? ""}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
              className="w-full bg-background border border-gold/10 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/40 resize-none"
            />
          </div>
        </motion.div>
      )}

      {/* Continue */}
      {source && (
        <div className="flex justify-end">
          <button
            onClick={onContinue}
            disabled={!canContinue}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all bg-gradient-to-r from-gold-dark via-gold to-gold-light text-background hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Field helpers ── */

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: React.ReactNode;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1 flex items-center gap-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-background border border-gold/10 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/40"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground block mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-background border border-gold/10 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/40"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
