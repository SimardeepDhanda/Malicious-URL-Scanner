'use client';

import { useState, FormEvent } from 'react';

interface URLInputProps {
  onScan: (url: string) => void;
  isLoading: boolean;
}

export default function URLInput({ onScan, isLoading }: URLInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const validateUrl = (input: string): boolean => {
    if (!input || input.trim().length === 0) {
      setError('Please enter a URL');
      return false;
    }

    const trimmed = input.trim();
    let testUrl = trimmed;

    // Auto-prepend https:// if no scheme
    if (!testUrl.match(/^https?:\/\//i)) {
      testUrl = `https://${testUrl}`;
    }

    try {
      new URL(testUrl);
      setError('');
      return true;
    } catch {
      setError('Please enter a valid URL');
      return false;
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validateUrl(url) && !isLoading) {
      onScan(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError('');
            }}
            placeholder="https://example.com or example.com"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          {error && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
        >
          {isLoading ? 'Scanning...' : 'Scan'}
        </button>
      </div>
    </form>
  );
}

