import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { ConditionBadge } from "@/components/ConditionBadge";
import { DirhamSign } from "@/components/DirhamSign";
import { useAllWatches } from "@/hooks/use-watches";
import { type Watch, MOCK_WATCHES, getDisplayPrice, formatPrice } from "@/lib/mock-watches";
import { CONDITIONS } from "@/lib/conditions";
import { Pencil, Trash2, Eye, X, Check, ChevronDown } from "lucide-react";

function EditForm({
  watch,
  onSave,
  onCancel,
}: {
  watch: Watch;
  onSave: (w: Watch) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Watch>({ ...watch });

  const set = (key: keyof Watch, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const fieldClass =
    "w-full bg-surface border border-border rounded-sm px-3 py-2 font-sans text-sm text-foreground focus:outline-none focus:border-gold/50";

  return (
    <div className="p-4 space-y-4 border-t border-border">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <label className="space-y-1">
          <span className="text-[10px] tracking-[0.2em] uppercase text-gold/60">Brand</span>
          <input className={fieldClass} value={form.brand} onChange={(e) => set("brand", e.target.value)} />
        </label>
        <label className="space-y-1">
          <span className="text-[10px] tracking-[0.2em] uppercase text-gold/60">Model</span>
          <input className={fieldClass} value={form.model} onChange={(e) => set("model", e.target.value)} />
        </label>
        <label className="space-y-1">
          <span className="text-[10px] tracking-[0.2em] uppercase text-gold/60">Reference</span>
          <input className={fieldClass} value={form.reference_number} onChange={(e) => set("reference_number", e.target.value)} />
        </label>
        <label className="space-y-1">
          <span className="text-[10px] tracking-[0.2em] uppercase text-gold/60">Base Price</span>
          <input className={fieldClass} type="number" value={form.base_price} onChange={(e) => set("base_price", Number(e.target.value))} />
        </label>
        <label className="space-y-1">
          <span className="text-[10px] tracking-[0.2em] uppercase text-gold/60">Margin %</span>
          <input className={fieldClass} type="number" value={form.margin_percent} onChange={(e) => set("margin_percent", Number(e.target.value))} />
        </label>
        <label className="space-y-1">
          <span className="text-[10px] tracking-[0.2em] uppercase text-gold/60">Condition</span>
          <select className={fieldClass} value={form.condition_rating} onChange={(e) => set("condition_rating", e.target.value)}>
            {Object.keys(CONDITIONS).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-[10px] tracking-[0.2em] uppercase text-gold/60">Year</span>
          <input className={fieldClass} type="number" value={form.year} onChange={(e) => set("year", Number(e.target.value))} />
        </label>
        <label className="space-y-1">
          <span className="text-[10px] tracking-[0.2em] uppercase text-gold/60">Dial Color</span>
          <input className={fieldClass} value={form.dial_color} onChange={(e) => set("dial_color", e.target.value)} />
        </label>
        <label className="space-y-1">
          <span className="text-[10px] tracking-[0.2em] uppercase text-gold/60">Case Material</span>
          <input className={fieldClass} value={form.case_material} onChange={(e) => set("case_material", e.target.value)} />
        </label>
        <label className="space-y-1">
          <span className="text-[10px] tracking-[0.2em] uppercase text-gold/60">Case Size (mm)</span>
          <input className={fieldClass} type="number" value={form.case_size_mm} onChange={(e) => set("case_size_mm", Number(e.target.value))} />
        </label>
        <label className="space-y-1">
          <span className="text-[10px] tracking-[0.2em] uppercase text-gold/60">Movement</span>
          <input className={fieldClass} value={form.movement_type} onChange={(e) => set("movement_type", e.target.value)} />
        </label>
        <label className="space-y-1">
          <span className="text-[10px] tracking-[0.2em] uppercase text-gold/60">Image URL</span>
          <input className={fieldClass} value={form.original_image_url} onChange={(e) => set("original_image_url", e.target.value)} />
        </label>
      </div>

      <label className="block space-y-1">
        <span className="text-[10px] tracking-[0.2em] uppercase text-gold/60">Description</span>
        <textarea className={`${fieldClass} min-h-[80px]`} value={form.description} onChange={(e) => set("description", e.target.value)} />
      </label>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_featured} onChange={(e) => set("is_featured", e.target.checked)} className="accent-gold" />
          <span className="text-xs text-muted-foreground">Featured</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_hero} onChange={(e) => set("is_hero", e.target.checked)} className="accent-gold" />
          <span className="text-xs text-muted-foreground">Hero</span>
        </label>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => onSave(form)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-gold/10 border border-gold/30 text-gold text-xs tracking-wider uppercase hover:bg-gold/20 transition-colors"
        >
          <Check className="w-3.5 h-3.5" /> Save
        </button>
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm border border-border text-muted-foreground text-xs tracking-wider uppercase hover:border-gold/30 transition-colors"
        >
          <X className="w-3.5 h-3.5" /> Cancel
        </button>
      </div>
    </div>
  );
}

function WatchRow({
  watch,
  onEdit,
  onDelete,
  onRestore,
  isEditing,
  isHidden,
  confirmingDelete,
  onConfirmDelete,
  onCancelDelete,
  onSave,
}: {
  watch: Watch;
  onEdit: () => void;
  onDelete: () => void;
  onRestore: () => void;
  isEditing: boolean;
  isHidden: boolean;
  confirmingDelete: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  onSave: (w: Watch) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-sm border border-border bg-card overflow-hidden ${isHidden ? "opacity-50" : ""}`}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Thumbnail */}
        <div className="w-16 h-16 rounded-sm overflow-hidden bg-surface-elevated shrink-0">
          {watch.original_image_url ? (
            <img
              src={watch.original_image_url}
              alt={watch.model}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gold/30 font-serif text-xs">
              {watch.brand[0]}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-gold">
              {watch.brand}
            </p>
            <ConditionBadge rating={watch.condition_rating} />
            {isHidden && (
              <span className="font-sans text-[10px] tracking-wider uppercase text-red-400/70">Hidden</span>
            )}
          </div>
          <p className="font-serif text-base text-foreground truncate">{watch.model}</p>
          <p className="font-sans text-xs text-muted-foreground">
            Ref. {watch.reference_number} · {watch.year}
          </p>
        </div>

        {/* Price */}
        <div className="hidden sm:flex items-center gap-1 font-serif text-lg text-gold-light shrink-0">
          <DirhamSign className="w-4 h-4" />
          {formatPrice(getDisplayPrice(watch))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {isHidden ? (
            <button
              onClick={onRestore}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-sm border border-gold/20 text-gold text-xs tracking-wider uppercase hover:bg-gold/10 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" /> Restore
            </button>
          ) : (
            <>
              <button
                onClick={onEdit}
                className="p-2 rounded-sm border border-border text-muted-foreground hover:text-gold hover:border-gold/30 transition-colors"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
              {confirmingDelete ? (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-red-400 mr-1">Delete?</span>
                  <button
                    onClick={onConfirmDelete}
                    className="p-2 rounded-sm bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-colors"
                    title="Yes, delete"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onCancelDelete}
                    className="p-2 rounded-sm border border-border text-muted-foreground hover:text-gold transition-colors"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onDelete}
                  className="p-2 rounded-sm border border-border text-muted-foreground hover:text-red-400 hover:border-red-400/30 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Inline Edit Form */}
      {isEditing && (
        <EditForm
          watch={watch}
          onSave={onSave}
          onCancel={onEdit}
        />
      )}
    </motion.div>
  );
}

const ListingManager = () => {
  const {
    allWatchesUnfiltered,
    hiddenIds,
    loading,
    saveWatch,
    deleteWatch,
    hideWatch,
    unhideWatch,
  } = useAllWatches();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showHidden, setShowHidden] = useState(false);

  const mockIds = new Set(MOCK_WATCHES.map((w) => w.id));

  const handleSave = async (watch: Watch) => {
    await saveWatch(watch);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    hideWatch(id);
    if (!mockIds.has(id)) {
      await deleteWatch(id);
    }
    setConfirmDeleteId(null);
  };

  const visibleWatches = allWatchesUnfiltered.filter((w) => !hiddenIds.includes(w.id));
  const hiddenWatches = allWatchesUnfiltered.filter((w) => hiddenIds.includes(w.id));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-8">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <p className="font-sans text-[10px] font-medium tracking-[0.4em] uppercase text-gold/60 mb-3">
              Administration
            </p>
            <h1 className="font-serif text-3xl md:text-4xl text-gold-gradient">
              Listing Manager
            </h1>
            <p className="font-sans text-xs text-muted-foreground mt-3">
              {visibleWatches.length} active · {hiddenWatches.length} hidden
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container max-w-5xl space-y-4">
          {loading && (
            <p className="text-center text-muted-foreground text-sm py-8">Loading watches...</p>
          )}

          {/* Active watches */}
          <AnimatePresence mode="popLayout">
            {visibleWatches.map((watch) => (
              <WatchRow
                key={watch.id}
                watch={watch}
                isHidden={false}
                isEditing={editingId === watch.id}
                confirmingDelete={confirmDeleteId === watch.id}
                onEdit={() => setEditingId(editingId === watch.id ? null : watch.id)}
                onDelete={() => setConfirmDeleteId(watch.id)}
                onConfirmDelete={() => handleDelete(watch.id)}
                onCancelDelete={() => setConfirmDeleteId(null)}
                onRestore={() => {}}
                onSave={handleSave}
              />
            ))}
          </AnimatePresence>

          {!loading && visibleWatches.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">No active watches.</p>
          )}

          {/* Hidden watches section */}
          {hiddenWatches.length > 0 && (
            <div className="pt-8">
              <button
                onClick={() => setShowHidden(!showHidden)}
                className="flex items-center gap-2 mx-auto font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-gold transition-colors"
              >
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showHidden ? "rotate-180" : ""}`} />
                {hiddenWatches.length} hidden {hiddenWatches.length === 1 ? "watch" : "watches"}
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showHidden ? "rotate-180" : ""}`} />
              </button>

              {showHidden && (
                <div className="space-y-4 mt-4">
                  <AnimatePresence mode="popLayout">
                    {hiddenWatches.map((watch) => (
                      <WatchRow
                        key={watch.id}
                        watch={watch}
                        isHidden={true}
                        isEditing={false}
                        confirmingDelete={false}
                        onEdit={() => {}}
                        onDelete={() => {}}
                        onConfirmDelete={() => {}}
                        onCancelDelete={() => {}}
                        onRestore={() => unhideWatch(watch.id)}
                        onSave={() => {}}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ListingManager;
