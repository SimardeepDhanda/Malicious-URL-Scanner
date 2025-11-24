'use client';

import { useState, useEffect } from 'react';
import URLInput from './components/URLInput';
import ScanResults from './components/ScanResults';
import ScanHistory from './components/ScanHistory';
import { scanUrl } from './utils/api';
import { saveToHistory, getHistory } from './utils/storage';
import { ScanResponse, HistoryItem } from './types';

type AppState = 'idle' | 'validating' | 'loading' | 'success' | 'error';

export default function Home() {
  const [state, setState] = useState<AppState>('idle');
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleScan = async (inputUrl: string) => {
    setUrl(inputUrl);
    setError('');
    setState('loading');
    setResult(null);

    try {
      const response = await scanUrl(inputUrl);
      setResult(response);
      setState('success');

      // Save to history
      const historyItem: HistoryItem = {
        url: response.url,
        timestamp: response.timestamp,
        label: response.final_label,
        confidence: response.confidence,
      };
      saveToHistory(historyItem);
      setHistory(getHistory());
    } catch (err: any) {
      setError(err.message || 'An error occurred while scanning the URL');
      setState('error');
    }
  };

  const handleScanAnother = () => {
    setState('idle');
    setResult(null);
    setError('');
    setUrl('');
  };

  const handleRescan = (urlToRescan: string) => {
    handleScan(urlToRescan);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Malicious URL Scanner
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Analyze URLs for security risks and indicators of compromise
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center gap-8">
          {state === 'success' && result ? (
            <ScanResults result={result} onScanAnother={handleScanAnother} />
          ) : (
            <>
              <URLInput onScan={handleScan} isLoading={state === 'loading'} />

              {/* Loading State */}
              {state === 'loading' && (
                <div className="w-full max-w-2xl text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Analyzing URL...</p>
                </div>
              )}

              {/* Error State */}
              {state === 'error' && error && (
                <div className="w-full max-w-2xl p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-800 dark:text-red-200 font-semibold mb-1">Error</p>
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                  <button
                    onClick={handleScanAnother}
                    className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* History */}
              {state === 'idle' && <ScanHistory history={history} onRescan={handleRescan} />}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

