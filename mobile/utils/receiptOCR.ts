import { Dish } from '../types/bill';
import * as FileSystem from 'expo-file-system/legacy';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

// Google Cloud Vision API endpoint
const GOOGLE_VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

export interface OCRResult {
  dishes: Dish[];
  rawText: string;
}

/**
 * Performs OCR on a receipt image using Google Cloud Vision API
 * @param imageUri - Local file URI of the receipt image
 * @param apiKey - Your Google Cloud Vision API key (1000 free requests/month)
 */
export async function scanReceipt(imageUri: string, apiKey: string): Promise<OCRResult> {
  try {
    // Resize image to reduce file size (max width 1024px)
    const resizedImage = await manipulateAsync(
      imageUri,
      [{ resize: { width: 1024 } }],
      { compress: 0.7, format: SaveFormat.JPEG }
    );

    // Convert image to base64
    const base64Image = await FileSystem.readAsStringAsync(resizedImage.uri, {
      encoding: 'base64',
    });

    // Call Google Cloud Vision API
    const response = await fetch(`${GOOGLE_VISION_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: base64Image,
            },
            features: [
              {
                type: 'TEXT_DETECTION',
                maxResults: 1,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Vision API error (${response.status}): ${error}`);
    }

    const result = await response.json();

    if (result.responses[0].error) {
      throw new Error(result.responses[0].error.message);
    }

    const rawText = result.responses[0]?.fullTextAnnotation?.text || '';

    if (!rawText) {
      throw new Error('No text detected in image');
    }

    // Debug: Log the raw text detected
    console.log('=== RAW OCR TEXT ===');
    console.log(rawText);
    console.log('===================');

    // Parse the text to extract dishes
    const dishes = parseReceiptText(rawText);

    // Debug: Log parsed dishes
    console.log('=== PARSED DISHES ===');
    console.log(JSON.stringify(dishes, null, 2));
    console.log('====================');

    return {
      dishes,
      rawText,
    };
  } catch (error) {
    console.error('OCR Error:', error);
    throw error;
  }
}

/**
 * Parses OCR text to extract dish names and prices
 * Uses pattern matching to find items that look like menu items with prices
 */
function parseReceiptText(text: string): Dish[] {
  const dishes: Dish[] = [];
  const lines = text.split('\n').map(l => l.trim());

  // Pattern to match prices (with or without $)
  const pricePattern = /^(\$?\d+\.\d{2})$/;
  // Pattern to match quantity info like "2 @ 10.56"
  const quantityPattern = /^\d+\s*@\s*\d+\.\d{2}$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip empty lines and headers/footers
    if (!line || isHeaderOrFooter(line)) continue;

    // Check if current line is a price
    const priceMatch = line.match(pricePattern);

    if (priceMatch && i > 0) {
      const price = parseFloat(priceMatch[1].replace('$', ''));

      // Look back for the item name (previous line that's not a quantity or price)
      let dishName = '';
      for (let j = i - 1; j >= 0; j--) {
        const prevLine = lines[j];
        if (!prevLine) continue;

        // Skip quantity lines
        if (quantityPattern.test(prevLine)) continue;

        // Skip if it's another price
        if (pricePattern.test(prevLine)) break;

        // Skip headers/footers
        if (isHeaderOrFooter(prevLine)) break;

        // This should be the dish name
        dishName = prevLine;
        break;
      }

      // Clean up dish name
      dishName = cleanDishName(dishName);

      // Validate it looks like a dish (not subtotal, tax, etc.)
      if (dishName && price > 0 && price < 1000 && !isNonDishLine(dishName)) {
        dishes.push({
          id: `dish_${Date.now()}_${Math.random()}`,
          name: dishName,
          price: price,
          sharedBy: [], // User will assign people later
        });
      }
    }
  }

  return dishes;
}

/**
 * Cleans up dish name by removing quantity indicators, special chars, etc.
 */
function cleanDishName(name: string): string {
  // Remove leading numbers/quantities (e.g., "2x ", "1 ")
  name = name.replace(/^\d+x?\s*/i, '');

  // Remove trailing whitespace and special chars
  name = name.replace(/[*#@]+/g, '').trim();

  // Title case
  name = name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return name;
}

/**
 * Checks if a line is likely a header/footer and should be skipped
 */
function isHeaderOrFooter(line: string): boolean {
  const lowerLine = line.toLowerCase();
  const skipKeywords = [
    'receipt',
    'tax invoice',
    'gst reg',
    'thank you',
    'welcome',
    'tel:',
    'address',
    'date:',
    'time:',
    'cashier',
    'total',
    'subtotal',
    'cash',
    'change',
    'credit card',
  ];

  return skipKeywords.some(keyword => lowerLine.includes(keyword));
}

/**
 * Checks if a line is likely not a dish (subtotal, GST, service charge, etc.)
 */
function isNonDishLine(text: string): boolean {
  const lowerText = text.toLowerCase();
  const nonDishKeywords = [
    'subtotal',
    'sub total',
    'total',
    'gst',
    'tax',
    'service charge',
    'svc charge',
    'discount',
    'rounding',
    'cash',
    'change',
    'balance',
    'amount',
  ];

  return nonDishKeywords.some(keyword => lowerText.includes(keyword));
}

