import { AnalysisResult } from '../types';

const HISTORY_KEY = 'blood-test-app.history.v1';
const CONSENT_KEY = 'blood-test-app.history-enabled.v1';
const MAX_ITEMS = 20;

/**
 * Local-only persistence. Uses the browser's localStorage, never a server.
 * Disabled by default — the user has to opt in explicitly.
 */
const isAvailable = (): boolean => {
  try {
    const probe = '__probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
};

export const storageAvailable = isAvailable();

export const isHistoryEnabled = (): boolean => {
  if (!storageAvailable) return false;
  return window.localStorage.getItem(CONSENT_KEY) === 'true';
};

export const setHistoryEnabled = (enabled: boolean): void => {
  if (!storageAvailable) return;
  window.localStorage.setItem(CONSENT_KEY, String(enabled));
  if (!enabled) window.localStorage.removeItem(HISTORY_KEY);
};

export const loadHistory = (): AnalysisResult[] => {
  if (!storageAvailable || !isHistoryEnabled()) return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AnalysisResult[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const persist = (items: AnalysisResult[]): void => {
  if (!storageAvailable) return;
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
  } catch {
    /* quota exceeded — silently skip, the analysis itself still works */
  }
};

export const addToHistory = (result: AnalysisResult): AnalysisResult[] => {
  if (!isHistoryEnabled()) return [];
  const items = [result, ...loadHistory()].slice(0, MAX_ITEMS);
  persist(items);
  return items;
};

export const removeFromHistory = (id: string): AnalysisResult[] => {
  const items = loadHistory().filter((item) => item.id !== id);
  persist(items);
  return items;
};

export const clearHistory = (): void => {
  if (!storageAvailable) return;
  window.localStorage.removeItem(HISTORY_KEY);
};
