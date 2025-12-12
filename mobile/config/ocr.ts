/**
 * OCR Configuration
 *
 * To get your FREE Google Cloud Vision API key:
 * 1. Go to https://console.cloud.google.com/
 * 2. Create a new project (or select existing)
 * 3. Enable "Cloud Vision API"
 * 4. Go to "Credentials" and create API key
 * 5. Copy the API key and paste it below
 *
 * FREE TIER LIMITS:
 * - 1,000 requests per month (FREE)
 * - After that: $1.50 per 1,000 requests
 * - More than enough for personal use!
 */

export const OCR_CONFIG = {
  // Replace 'YOUR_GOOGLE_VISION_API_KEY' with your actual Google Cloud Vision API key
  // Example: 'AIzaSyAbc123...'
  GOOGLE_VISION_API_KEY: 'AIzaSyByQx_0hYpseVzcOl69v91ssEPB0dXge60',

  // Set to true once you've added your API key above
  ENABLED: true,
};

// Validation
export function isOCRConfigured(): boolean {
  return (
    OCR_CONFIG.ENABLED &&
    OCR_CONFIG.GOOGLE_VISION_API_KEY !== 'YOUR_GOOGLE_VISION_API_KEY' &&
    OCR_CONFIG.GOOGLE_VISION_API_KEY.length > 0
  );
}

export function getOCRErrorMessage(): string {
  if (!OCR_CONFIG.ENABLED) {
    return 'OCR is not enabled. Please update config/ocr.ts';
  }
  if (OCR_CONFIG.GOOGLE_VISION_API_KEY === 'YOUR_GOOGLE_VISION_API_KEY') {
    return 'Please add your Google Cloud Vision API key in config/ocr.ts';
  }
  return 'OCR configuration error';
}
