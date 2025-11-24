import { ScanResponse, ErrorResponse } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function scanUrl(url: string): Promise<ScanResponse> {
  const response = await fetch(`${API_BASE_URL}/scan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as ErrorResponse;
    throw new Error(error.error.message);
  }

  return data as ScanResponse;
}

