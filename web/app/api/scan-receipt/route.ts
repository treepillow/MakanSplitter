import { NextRequest, NextResponse } from 'next/server';

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

export async function POST(request: NextRequest) {
  const MAX_RETRIES = 1;
  const DELAY_MS = 2000;

  try {
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
2. For each item, provide the dish name and price
3. Handle both English and Chinese text
4. Ignore quantity multipliers (1x, 2x, etc.) - just give the item name
5. Return ONLY valid JSON, no markdown code blocks

Return a JSON array in this EXACT format:
[
  {"name": "Dish Name", "price": 12.50},
  {"name": "Another Dish", "price": 8.00}
]

If no items are found, return an empty array: []`;

    // Call Gemini REST API directly
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

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

    return NextResponse.json({
      dishes,
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
