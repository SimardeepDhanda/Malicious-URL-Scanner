export function validateAndNormalizeUrl(input: string): { valid: boolean; url?: string; error?: string } {
  if (!input || input.trim().length === 0) {
    return { valid: false, error: "Please enter a valid URL." };
  }

  let url = input.trim();

  // Auto-prepend https:// if no scheme
  if (!url.match(/^https?:\/\//i)) {
    url = `https://${url}`;
  }

  try {
    const urlObj = new URL(url);
    
    // Only allow http and https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, error: "Only HTTP and HTTPS URLs are supported." };
    }

    // Basic validation - URL constructor will throw if invalid
    return { valid: true, url: urlObj.href };
  } catch (error) {
    return { valid: false, error: "Please enter a valid URL." };
  }
}

export function sanitizeForLogging(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return "[invalid-url]";
  }
}

