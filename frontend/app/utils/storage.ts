import { HistoryItem } from '../types';

const STORAGE_KEY = 'url-scanner-history';
const MAX_HISTORY_ITEMS = 10;

export function saveToHistory(item: HistoryItem): void {
  if (typeof window === 'undefined') return;

  try {
    const existing = getHistory();
    const updated = [item, ...existing.filter(h => h.url !== item.url)].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save to history:', error);
  }
}

export function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as HistoryItem[];
  } catch (error) {
    console.error('Failed to read history:', error);
    return [];
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

