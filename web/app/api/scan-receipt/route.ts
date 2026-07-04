import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// --- Configuration for Next.js App Router ---
export const maxDuration = 60;
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxBodySize = '10mb';
// ---------------------------------

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("CRITICAL: GEMINI_API_KEY is UNDEFINED");
} else {
  console.log(`API Key loaded successfully. Length: ${apiKey.length}`);
}

// Server-side rate limiter for Gemini API (prevents cost abuse)
const scanLimits = new Map<string, { count: number; resetAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [ip, limit] of scanLimits.entries()) {
    if (now > limit.resetAt) {
      scanLimits.delete(ip);
    }
  }
}, 60000);

function rateLimitScan(ip: string, maxScans = 10, windowMs = 3600000): boolean {
  const now = Date.now();
  const limit = scanLimits.get(ip);

  if (!limit || now > limit.resetAt) {
    scanLimits.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (limit.count >= maxScans) {
    return false;
  }

  limit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const MAX_RETRIES = 1;
  const DELAY_MS = 2000;

  try {
    // Rate limit: 10 scans per hour per IP
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0] || 'unknown';

    if (!rateLimitScan(ip)) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many receipt scans. Please wait an hour and try again.'
        },
        { status: 429 }
      );
    }

    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Extract mime type and base64 data
    const matches = image.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json(
        { error: 'Invalid image format' },
        { status: 400 }
      );
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    console.log('Image MIME type:', mimeType);
    console.log('Base64 data length:', base64Data.length);
    console.log('Estimated size:', Math.round(base64Data.length * 0.75 / 1024), 'KB');

    const prompt = `You are a receipt OCR expert. Analyze this receipt image and extract ONLY the food/dish items with their prices.

IMPORTANT RULES:
1. Extract ONLY individual food/drink items (NOT subtotals, totals, GST, service charges, or taxes)
2. For each item, provide the dish name, the price of ONE unit, and the quantity
3. If a line shows a quantity multiplier (e.g. "2x Chicken Rice $10.00"), set quantity to that number and price to the PER-UNIT price (10.00 / 2 = 5.00)
4. If no quantity is shown, use quantity 1 and the printed price
5. Handle both English and Chinese text
6. Return ONLY valid JSON, no markdown code blocks

Return a JSON array in this EXACT format:
[
  {"name": "Dish Name", "price": 12.50, "quantity": 1},
  {"name": "Another Dish", "price": 8.00, "quantity": 2}
]

If no items are found, return an empty array: []`;

    // Call Gemini REST API directly
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    let result;
    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        console.log(`Attempt ${i + 1} to call Gemini API...`);

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: base64Data,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 2048,
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(`API returned ${response.status}: ${errorText}`);
        }

        result = await response.json();
        console.log('API call succeeded!');
        break;
      } catch (error) {
        console.error(`Attempt ${i + 1} failed:`, error);

        if (i === MAX_RETRIES - 1) {
          throw new Error(
            `Gemini API failed after ${MAX_RETRIES} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }

        await new Promise(resolve => setTimeout(resolve, DELAY_MS * (i + 1)));
      }
    }

    if (!result || !result.candidates || !result.candidates[0]) {
      throw new Error('Invalid response from Gemini API');
    }

    const text = result.candidates[0].content.parts[0].text;
    console.log('Gemini response:', text);

    // Parse JSON
    let dishes = [];
    try {
      const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
      dishes = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('Failed to parse response:', text);
      return NextResponse.json(
        { error: 'Failed to parse receipt data', rawText: text },
        { status: 500 }
      );
    }

    // Expand quantities into separate line items so each portion can be
    // claimed individually in the Telegram poll (e.g. "Chicken Rice #1", "#2").
    // A single merged line would wrongly split one portion's price among
    // everyone who ordered their own.
    const expandedDishes: { name: string; price: number }[] = [];
    for (const dish of dishes) {
      const quantity = Math.min(Math.max(Math.round(Number(dish.quantity) || 1), 1), 50);
      if (quantity === 1) {
        expandedDishes.push({ name: dish.name, price: dish.price });
      } else {
        for (let unit = 1; unit <= quantity; unit++) {
          expandedDishes.push({ name: `${dish.name} #${unit}`, price: dish.price });
        }
      }
    }

    return NextResponse.json({
      dishes: expandedDishes,
      rawText: text,
    });
  } catch (error) {
    console.error('Final Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
