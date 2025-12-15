'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Toast } from '@/components/Toast';
import { useBill } from '@/context/BillContext';
import { Colors } from '@/constants/colors';
import { canScan, incrementScan, getRemaining, getScanCount, getTimeUntilReset, getDailyLimit } from '@/lib/scanLimits';

import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export default function ScanReceiptPage() {
  const router = useRouter();
  const { setCurrentBill } = useBill();
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null); 

  // State
  const [image, setImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  
  // React-Image-Crop State
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  
  const [showCropper, setShowCropper] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ocrText, setOcrText] = useState('');
  const [scannedDishes, setScannedDishes] = useState<any[]>([]);
  const [paidBy, setPaidBy] = useState('');
  const [gstPercentage, setGstPercentage] = useState('9');
  const [serviceChargePercentage, setServiceChargePercentage] = useState('10');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [scansRemaining, setScansRemaining] = useState(0);

  // Update scans remaining on mount and when scanning
  useEffect(() => {
    setScansRemaining(getRemaining());
  }, [scanning]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      setShowCropper(true);
      setCrop(undefined); 
      setCompletedCrop(null);
    };
    reader.readAsDataURL(file);
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    // Default to selecting the whole image with a slight margin
    const cropWidth = width * 0.9;
    const cropHeight = height * 0.9;
    const x = (width - cropWidth) / 2;
    const y = (height - cropHeight) / 2;
    
    setCrop({
      unit: 'px',
      x,
      y,
      width: cropWidth,
      height: cropHeight,
    });
  };

  const createCroppedImage = useCallback(async () => {
    if (!imgRef.current || !completedCrop) return null;

    const image = imgRef.current;
    const crop = completedCrop;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Calculate scale between displayed image size and natural (original) size
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const pixelRatio = window.devicePixelRatio;

    canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
    canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';

    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;

    ctx.save();
    ctx.translate(-cropX, -cropY);
    
    ctx.drawImage(
      image,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
    );

    ctx.restore();

    return canvas.toDataURL('image/jpeg');
  }, [completedCrop]);

  const handleCropConfirm = async () => {
    // If no crop is set, or crop is invalid, use original
    if (!completedCrop || completedCrop.width === 0 || completedCrop.height === 0) {
        setCroppedImage(image);
        setShowCropper(false);
        return;
    }
    const cropped = await createCroppedImage();
    if (cropped) {
      setCroppedImage(cropped);
      setShowCropper(false);
    }
  };

  const handleScanReceipt = async () => {
    const imageToScan = croppedImage || image;
    if (!imageToScan) {
      setToast({ message: 'Please upload an image first', type: 'error' });
      return;
    }

    // Check if user has reached daily scan limit
    if (!canScan()) {
      setToast({
        message: `Daily limit reached (${getDailyLimit()} scans). Resets in ${getTimeUntilReset()}.`,
        type: 'error',
      });
      return;
    }

    setScanning(true);
    setProgress(20);

    try {
      setToast({ message: 'Analyzing receipt with AI...', type: 'info' });
      setProgress(40);

      // Call the Gemini API route
      const response = await fetch('/api/scan-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageToScan }),
      });

      setProgress(80);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to scan receipt');
      }

      const data = await response.json();
      setProgress(100);

      // Increment the scan count
      incrementScan();
      setScansRemaining(getRemaining());

      // Process the dishes
      const dishes = data.dishes.map((dish: any) => ({
        id: `dish_${Date.now()}_${Math.random()}`,
        name: dish.name,
        price: dish.price,
        sharedBy: [],
      }));

      setOcrText(data.rawText || '');
      setScannedDishes(dishes);

      if (dishes.length === 0) {
        setToast({ message: 'No dishes found. Please try manual entry.', type: 'warning' });
      } else {
        setToast({ message: `Found ${dishes.length} dishes!`, type: 'success' });
      }
    } catch (error) {
      console.error('OCR Error:', error);
      setToast({
        message: error instanceof Error ? error.message : 'Failed to scan receipt. Please try again.',
        type: 'error',
      });
    } finally {
      setScanning(false);
      setProgress(0);
    }
  };


  const handleContinue = () => {
    if (!paidBy.trim()) {
      setToast({ message: 'Please enter who paid the bill', type: 'error' });
      return;
    }

    const gst = parseFloat(gstPercentage) || 0;
    const serviceCharge = parseFloat(serviceChargePercentage) || 0;

    if (gst < 0 || gst > 100) {
      setToast({ message: 'GST percentage must be between 0 and 100', type: 'error' });
      return;
    }

    if (serviceCharge < 0 || serviceCharge > 100) {
      setToast({ message: 'Service charge percentage must be between 0 and 100', type: 'error' });
      return;
    }

    setCurrentBill({
      restaurantName: 'Restaurant',
      dishes: scannedDishes,
      people: [],
      gstPercentage: gst,
      serviceChargePercentage: serviceCharge,
      paidBy: paidBy.trim(),
      date: new Date(),
    });

    router.push('/bill-summary');
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="min-h-screen" style={{ backgroundColor: Colors.background }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-4xl sm:text-6xl mb-4">📸</div>
            <h1 className="text-2xl sm:text-4xl font-bold mb-3" style={{ color: Colors.text }}>
              Scan Receipt
            </h1>
            <p className="text-sm sm:text-base mb-4" style={{ color: Colors.textSecondary }}>
              Upload a photo of your receipt to auto-detect dishes
            </p>
            <div
              className="max-w-2xl mx-auto rounded-lg p-6 text-left"
              style={{ backgroundColor: Colors.backgroundTertiary }}
            >
              <p className="text-sm font-semibold mb-4" style={{ color: Colors.text }}>
                How it works:
              </p>  
              <ol className="text-sm space-y-3" style={{ color: Colors.textSecondary }}>
                <li>1. Upload a clear photo of your receipt</li>
                <li>2. Crop to focus ONLY on the items (drag corners)</li>
                <li>3. AI will scan and extract dishes with prices</li>
                <li>4. Review and confirm the details</li>
              </ol>
            </div>

            {/* Free Tier Transparency Banner */}
            <div
              className="max-w-2xl mx-auto rounded-lg p-4 mb-6 border"
              style={{
                backgroundColor: Colors.card,
                borderColor: Colors.primary,
              }}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">🎁</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-2" style={{ color: Colors.text }}>
                    Free AI-Powered Scanning
                  </p>
                  <p className="text-xs mb-2" style={{ color: Colors.textSecondary }}>
                    We use Google Gemini AI for accurate receipt scanning. To keep this service free,
                    we limit scans to <strong>1,500 per day</strong> (resets at midnight Pacific time).
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <span style={{ color: Colors.primary }} className="font-semibold">
                      {scansRemaining.toLocaleString()} scans remaining today
                    </span>
                    <span style={{ color: Colors.textSecondary }}>
                      • Resets in {getTimeUntilReset()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Image Upload */}
            {!image ? (
              <div
                className="rounded-2xl p-12 border-2 border-dashed text-center cursor-pointer hover:border-opacity-80 transition-all"
                style={{ borderColor: Colors.primary }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-6xl mb-4">📷</div>
                <p className="text-lg font-semibold mb-2" style={{ color: Colors.text }}>
                  Click to upload receipt
                </p>
                <p className="text-sm" style={{ color: Colors.textSecondary }}>
                  Supports JPG, PNG, HEIC
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            ) : (
              <div>
                {/* ================================================================
                   UPDATED CROPPER MODAL STRUCTURE
                   ================================================================
                   1. Fixed, Full Screen, Flex Column Layout.
                   2. Header stays top, Buttons stay bottom.
                   3. Middle section (flex-1) holds the image.
                   4. Image has max-height: 70vh to ensure it fits.
                */}
                {showCropper && image && (
                  <div className="fixed inset-0 z-50 flex flex-col bg-black">
                    
                    {/* MODAL HEADER */}
                    <div className="flex-none p-4 text-center bg-black bg-opacity-50">
                       <h2 className="text-xl font-bold text-white">Crop Receipt</h2>
                       <p className="text-sm text-gray-300">Drag corners to select items</p>
                    </div>

                    {/* MODAL BODY (Image Container) */}
                    <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
                       <ReactCrop
                          crop={crop}
                          onChange={(c) => setCrop(c)}
                          onComplete={(c) => setCompletedCrop(c)}
                          className="max-h-full max-w-full"
                        >
                          <img 
                            ref={imgRef}
                            src={image} 
                            alt="Crop me" 
                            onLoad={onImageLoad}
                            // This ensures the image respects the container height
                            // and scales down properly without getting cutoff
                            style={{ 
                              maxHeight: '70vh', 
                              maxWidth: '100%', 
                              objectFit: 'contain' 
                            }}
                          />
                        </ReactCrop>
                    </div>

                    {/* MODAL FOOTER (Buttons) */}
                    <div className="flex-none p-6 bg-black border-t border-gray-800">
                      <div className="flex gap-4 max-w-lg mx-auto">
                        <Button
                          title="Cancel"
                          variant="secondary"
                          onPress={() => {
                            setShowCropper(false);
                            setImage(null);
                          }}
                          className="flex-1"
                        />
                        <Button
                          title="Confirm Crop ✓"
                          onPress={handleCropConfirm}
                          className="flex-[2]"
                        />
                      </div>
                    </div>

                  </div>
                )}

                {/* Image Preview (Post Crop) */}
                {!showCropper && (
                  <div
                    className="rounded-2xl p-4 mb-6 border"
                    style={{
                      backgroundColor: Colors.card,
                      borderColor: Colors.border,
                    }}
                  >
                    <img
                      src={croppedImage || image}
                      alt="Receipt"
                      className="w-full rounded-lg"
                    />
                    {croppedImage && (
                      <button
                        onClick={() => setShowCropper(true)}
                        className="mt-3 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                        style={{
                          backgroundColor: Colors.backgroundTertiary,
                          color: Colors.primary,
                        }}
                      >
                        Re-crop Image ✂️
                      </button>
                    )}
                  </div>
                )}

                {/* Progress Bar */}
                {scanning && (
                  <div
                    className="rounded-xl p-6 mb-6"
                    style={{ backgroundColor: Colors.card }}
                  >
                    <p className="text-sm font-semibold mb-3" style={{ color: Colors.text }}>
                      Scanning... {progress}%
                    </p>
                    <div className="w-full h-2 rounded-full" style={{ backgroundColor: Colors.border }}>
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: Colors.primary,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* OCR Result */}
                {ocrText && !scanning && scannedDishes.length === 0 && (
                  <div
                    className="rounded-xl p-6 mb-6"
                    style={{ backgroundColor: Colors.card }}
                  >
                    <h3 className="text-lg font-bold mb-3" style={{ color: Colors.text }}>
                      Detected Text:
                    </h3>
                    <pre
                      className="text-xs whitespace-pre-wrap p-4 rounded-lg overflow-x-auto max-h-64 overflow-y-auto"
                      style={{
                        backgroundColor: Colors.backgroundTertiary,
                        color: Colors.textSecondary,
                      }}
                    >
                      {ocrText}
                    </pre>
                  </div>
                )}

                {/* Scanned Dishes & Bill Details Form */}
                {scannedDishes.length > 0 && (
                  <>
                    <div
                      className="rounded-xl p-6 mb-6 border"
                      style={{
                        backgroundColor: Colors.card,
                        borderColor: Colors.border,
                      }}
                    >
                      <h3 className="text-lg font-bold mb-4" style={{ color: Colors.text }}>
                        Found {scannedDishes.length} Dishes
                      </h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {scannedDishes.map((dish, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span style={{ color: Colors.text }}>{dish.name}</span>
                            <span style={{ color: Colors.primary }} className="font-semibold">${dish.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div
                      className="rounded-xl p-6 mb-6 border space-y-6"
                      style={{
                        backgroundColor: Colors.card,
                        borderColor: Colors.border,
                      }}
                    >
                      <h3 className="text-lg font-bold mb-4" style={{ color: Colors.text }}>
                        Bill Details
                      </h3>
                      <Input
                        label="Who Paid the Bill?"
                        value={paidBy}
                        onChangeText={setPaidBy}
                        placeholder="e.g. John, Me"
                        icon="👤"
                      />
                      <Input
                        label="GST (%)"
                        value={gstPercentage}
                        onChangeText={setGstPercentage}
                        placeholder="9"
                        type="number"
                        icon="📋"
                      />
                      <Input
                        label="Service Charge (%)"
                        value={serviceChargePercentage}
                        onChangeText={setServiceChargePercentage}
                        placeholder="10"
                        type="number"
                        icon="🔔"
                      />
                    </div>
                  </>
                )}

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    title="Upload Different Image"
                    variant="secondary"
                    onPress={() => {
                      setImage(null);
                      setCroppedImage(null);
                      setOcrText('');
                      setProgress(0);
                      setScannedDishes([]);
                      setPaidBy('');
                      setCrop(undefined);
                      setCompletedCrop(null);
                    }}
                    className="w-full sm:flex-1"
                  />
                  {!ocrText ? (
                    <Button
                      title={scanning ? `Scanning... ${progress}%` : "Scan Receipt 🔍"}
                      onPress={handleScanReceipt}
                      disabled={scanning}
                      className="w-full sm:flex-[2]"
                    />
                  ) : scannedDishes.length > 0 ? (
                    <Button
                      title="Continue to Summary →"
                      onPress={handleContinue}
                      className="w-full sm:flex-[2]"
                      disabled={!paidBy.trim()}
                    />
                  ) : (
                    <Button
                      title="Manual Entry Instead"
                      variant="secondary"
                      onPress={() => router.push('/create-bill')}
                      className="w-full sm:flex-1"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Info */}
            <div
              className="mt-8 rounded-lg p-4"
              style={{ backgroundColor: Colors.backgroundTertiary }}
            >
              <p className="text-xs text-center" style={{ color: Colors.textSecondary }}>
                💡 <strong>Tip:</strong> Crop tightly around the dish names and prices for the best accuracy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}