'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createWorker } from 'tesseract.js';
import { Dish } from '@/types/bill';

export default function UploadReceipt() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async () => {
    if (!image) return;

    setProcessing(true);
    setProgress(0);

    try {
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const { data: { text } } = await worker.recognize(image);
      await worker.terminate();

      // Parse OCR text to extract dishes
      const dishes = parseReceiptText(text);

      // Get existing bill data from session
      const existingData = sessionStorage.getItem('newBill');
      const billData = existingData ? JSON.parse(existingData) : {
        restaurantName: '',
        paidBy: '',
        gstPercentage: 9,
        serviceChargePercentage: 10,
        dishes: [],
      };

      // Add OCR dishes to existing dishes
      billData.dishes = [...billData.dishes, ...dishes];

      sessionStorage.setItem('newBill', JSON.stringify(billData));

      // Redirect back to create page
      router.push('/create');
    } catch (error) {
      console.error('OCR Error:', error);
      alert('Failed to process image. Please try again or add dishes manually.');
    } finally {
      setProcessing(false);
    }
  };

  const parseReceiptText = (text: string): Dish[] => {
    const dishes: Dish[] = [];
    const lines = text.split('\n');

    for (const line of lines) {
      // Look for lines with price patterns (e.g., "Item Name 12.50" or "Item Name $12.50")
      const priceMatch = line.match(/(.+?)\s+\$?(\d+\.\d{2})/);

      if (priceMatch) {
        const name = priceMatch[1].trim();
        const price = parseFloat(priceMatch[2]);

        // Filter out common non-item lines
        if (
          name &&
          price > 0 &&
          price < 1000 && // Reasonable price range
          !name.toLowerCase().includes('total') &&
          !name.toLowerCase().includes('subtotal') &&
          !name.toLowerCase().includes('tax') &&
          !name.toLowerCase().includes('service') &&
          !name.toLowerCase().includes('gst')
        ) {
          dishes.push({
            id: `dish_${Date.now()}_${Math.random()}`,
            name,
            price,
            sharedBy: [],
          });
        }
      }
    }

    return dishes;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/create" className="text-gray-400 hover:text-white">
            ← Back
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-white mb-6">Upload Receipt</h1>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 mb-6">
          <p className="text-gray-400 mb-4">
            Upload a photo of your receipt and we'll automatically extract the dishes using OCR.
          </p>

          {!image ? (
            <label className="block">
              <div className="border-2 border-dashed border-[#2a2a2a] rounded-lg p-12 text-center cursor-pointer hover:border-[#10b981] transition">
                <div className="text-6xl mb-4">📷</div>
                <div className="text-gray-400 mb-2">Click to upload receipt image</div>
                <div className="text-gray-500 text-sm">or drag and drop</div>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          ) : (
            <div>
              <div className="mb-4">
                <img
                  src={image}
                  alt="Receipt"
                  className="w-full rounded-lg border border-[#2a2a2a]"
                />
              </div>

              {processing ? (
                <div>
                  <div className="mb-2 text-gray-400">
                    Processing image... {progress}%
                  </div>
                  <div className="w-full bg-[#2a2a2a] rounded-full h-2">
                    <div
                      className="bg-[#10b981] h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={processImage}
                    className="flex-1 bg-[#10b981] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
                  >
                    Extract Dishes
                  </button>
                  <button
                    onClick={() => setImage(null)}
                    className="px-6 py-3 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#3a3a3a] transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h3 className="text-blue-400 font-semibold mb-2">💡 Tips for best results:</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• Take a clear, well-lit photo</li>
            <li>• Make sure all text is visible and in focus</li>
            <li>• Avoid shadows and glare</li>
            <li>• You can review and edit extracted dishes before saving</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
