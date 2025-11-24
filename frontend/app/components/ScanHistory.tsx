'use client';

import { HistoryItem } from '../types';

interface ScanHistoryProps {
  history: HistoryItem[];
  onRescan: (url: string) => void;
}

export default function ScanHistory({ history, onRescan }: ScanHistoryProps) {
  if (history.length === 0) {
    return null;
  }

  const getLabelColor = (label: string) => {
    switch (label) {
      case 'Safe':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Suspicious':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Potential phishing':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Potential malware':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Recent Scans</h2>
      <div className="space-y-2">
        {history.map((item, index) => (
          <button
            key={index}
            onClick={() => onRescan(item.url)}
            className="w-full text-left p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono truncate text-gray-900 dark:text-gray-100">{item.url}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(item.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`px-2 py-1 text-xs rounded font-semibold ${getLabelColor(item.label)}`}>
                  {item.label}
                </span>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  {item.confidence}%
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

