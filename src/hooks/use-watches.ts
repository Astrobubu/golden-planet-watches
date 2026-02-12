import { useState, useEffect, useCallback } from "react";
import { type Watch, MOCK_WATCHES } from "@/lib/mock-watches";
import {
  getSavedWatchesAsync,
  saveWatch as saveWatchToIDB,
  deleteWatch as deleteWatchFromIDB,
  getHiddenWatches,
  addHiddenWatch,
  removeHiddenWatch,
} from "@/lib/watch-editor-storage";

/**
 * Hook that loads all watches (mock + saved from IndexedDB),
 * filters out hidden watches, and exposes save/hide/unhide mutators.
 */
export function useAllWatches() {
  const [savedWatches, setSavedWatches] = useState<Watch[]>([]);
  const [hiddenIds, setHiddenIds] = useState<string[]>(getHiddenWatches);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    getSavedWatchesAsync().then((saved) => {
      if (!cancelled) {
        setSavedWatches(saved);
        setHiddenIds(getHiddenWatches());
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [refreshKey]);

  // Merge: saved watches first, then mock watches (deduplicate by id), filter hidden
  const ids = new Set(savedWatches.map((w) => w.id));
  const allWatches = [...savedWatches, ...MOCK_WATCHES.filter((w) => !ids.has(w.id))];
  const watches = allWatches.filter((w) => !hiddenIds.includes(w.id));

  // Also expose unfiltered list for the manager
  const allWatchesUnfiltered = allWatches;

  const saveWatch = useCallback(async (watch: Watch) => {
    await saveWatchToIDB(watch);
    refresh();
  }, [refresh]);

  const deleteWatchById = useCallback(async (id: string) => {
    await deleteWatchFromIDB(id);
    refresh();
  }, [refresh]);

  const hideWatch = useCallback((id: string) => {
    addHiddenWatch(id);
    setHiddenIds(getHiddenWatches());
  }, []);

  const unhideWatch = useCallback((id: string) => {
    removeHiddenWatch(id);
    setHiddenIds(getHiddenWatches());
  }, []);

  return {
    watches,
    allWatchesUnfiltered,
    hiddenIds,
    loading,
    saveWatch,
    deleteWatch: deleteWatchById,
    hideWatch,
    unhideWatch,
    refresh,
  };
}
