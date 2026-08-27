import { useCallback, useEffect, useState } from 'react';
import {
  addToHistory,
  clearHistory,
  isHistoryEnabled,
  loadHistory,
  removeFromHistory,
  setHistoryEnabled,
  storageAvailable,
} from '../lib/storage';
import { AnalysisResult } from '../types';

/** Opt-in history kept only in this browser's localStorage. */
export const useLocalHistory = () => {
  const [enabled, setEnabled] = useState(false);
  const [items, setItems] = useState<AnalysisResult[]>([]);

  useEffect(() => {
    const on = isHistoryEnabled();
    setEnabled(on);
    setItems(on ? loadHistory() : []);
  }, []);

  const toggle = useCallback((next: boolean) => {
    setHistoryEnabled(next);
    setEnabled(next);
    setItems(next ? loadHistory() : []);
  }, []);

  const save = useCallback((result: AnalysisResult) => {
    if (!isHistoryEnabled()) return;
    setItems(addToHistory(result));
  }, []);

  const remove = useCallback((id: string) => {
    setItems(removeFromHistory(id));
  }, []);

  const clearAll = useCallback(() => {
    clearHistory();
    setItems([]);
  }, []);

  return { enabled, items, available: storageAvailable, toggle, save, remove, clearAll };
};
