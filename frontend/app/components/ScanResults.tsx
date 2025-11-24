'use client';

import { ScanResponse } from '../types';
import { useEffect, useState } from 'react';

interface ScanResultsProps {
  result: ScanResponse;
  onScanAnother: () => void;
}

export default function ScanResults({ result, onScanAnother }: ScanResultsProps) {
  const [copied, setCopied] = useState(false);

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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const copyReport = async () => {
    const report = {
      ...result,
      humanReadable: `
Malicious URL Scanner Report
============================

URL: ${result.url}
Risk Level: ${result.final_label}
Confidence: ${result.confidence}%

Summary:
${result.summary}

Indicators of Compromise:
${result.iocs.map((ioc, i) => `${i + 1}. [${ioc.severity.toUpperCase()}] ${ioc.indicator_type}: ${ioc.description}`).join('\n')}

Recommendations:
${result.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

Scanned: ${new Date(result.timestamp).toLocaleString()}
Model: ${result.model_metadata.model}
Analysis Time: ${result.model_metadata.latency_ms}ms
      `.trim(),
    };

    const text = `JSON Report:\n${JSON.stringify(result, null, 2)}\n\n${report.humanReadable}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="w-full max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Scanned URL</p>
          <p className="text-sm font-mono break-all text-gray-900 dark:text-gray-100">{result.url}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`px-4 py-2 rounded-lg font-semibold ${getLabelColor(result.final_label)}`}>
            {result.final_label}
          </span>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Confidence</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{result.confidence}%</p>
          </div>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all ${
            result.confidence >= 70 ? 'bg-red-500' : result.confidence >= 40 ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          style={{ width: `${result.confidence}%` }}
        />
      </div>

      {/* Summary */}
      <div>
        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Summary</h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{result.summary}</p>
      </div>

      {/* Indicators of Compromise */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
          Risk Indicators ({result.iocs.length})
        </h2>
        <div className="space-y-2">
          {result.iocs.map((ioc, index) => (
            <div
              key={index}
              className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {ioc.indicator_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${getSeverityColor(ioc.severity)}`}>
                      {ioc.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{ioc.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Recommended Actions</h2>
        <ul className="space-y-2">
          {result.recommendations.map((rec, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center text-sm font-semibold mt-0.5">
                {index + 1}
              </span>
              <p className="text-gray-700 dark:text-gray-300">{rec}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={copyReport}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
        >
          {copied ? '✓ Copied!' : 'Copy Report'}
        </button>
        <button
          onClick={onScanAnother}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          Scan Another URL
        </button>
      </div>
    </div>
  );
}

