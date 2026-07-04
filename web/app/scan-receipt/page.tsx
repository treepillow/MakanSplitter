'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/Input';
import { Toast } from '@/components/Toast';
import { useBill } from '@/context/BillContext';
import { canScan, incrementScan, getRemaining, getTimeUntilReset, getDailyLimit } from '@/lib/scanLimits';
import { Edit2, Trash2, Plus, Check, X } from 'lucide-react';

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

  // Edit dish state
  const [editingDishIndex, setEditingDishIndex] = useState<number | null>(null);
  const [editDishName, setEditDishName] = useState('');
  const [editDishPrice, setEditDishPrice] = useState('');

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
      setToast({ message: 'Upload an image first', type: 'error' });
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
      setToast({ message: 'Reading the receipt…', type: 'info' });
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
        setToast({ message: 'No dishes found. Try manual entry instead.', type: 'warning' });
      } else {
        setToast({ message: `Found ${dishes.length} dishes`, type: 'success' });
      }
    } catch (error) {
      console.error('OCR Error:', error);
      setToast({
        message: error instanceof Error ? error.message : 'Scan failed. Try again.',
        type: 'error',
      });
    } finally {
      setScanning(false);
      setProgress(0);
    }
  };

  // Dish editing functions
  const handleEditDish = (index: number) => {
    setEditingDishIndex(index);
    setEditDishName(scannedDishes[index].name);
    setEditDishPrice(scannedDishes[index].price.toString());
  };

  const handleSaveEdit = () => {
    if (editingDishIndex === null) return;

    const price = parseFloat(editDishPrice);
    if (!editDishName.trim() || isNaN(price) || price <= 0) {
      setToast({ message: 'Enter a valid dish name and price', type: 'error' });
      return;
    }

    const updatedDishes = [...scannedDishes];
    updatedDishes[editingDishIndex] = {
      ...updatedDishes[editingDishIndex],
      name: editDishName.trim(),
      price: price,
    };
    setScannedDishes(updatedDishes);
    setEditingDishIndex(null);
    setEditDishName('');
    setEditDishPrice('');
  };

  const handleCancelEdit = () => {
    setEditingDishIndex(null);
    setEditDishName('');
    setEditDishPrice('');
  };

  const handleDeleteDish = (index: number) => {
    const updatedDishes = scannedDishes.filter((_, i) => i !== index);
    setScannedDishes(updatedDishes);
    if (editingDishIndex === index) {
      setEditingDishIndex(null);
      setEditDishName('');
      setEditDishPrice('');
    }
  };

  const handleAddDish = () => {
    const newDish = {
      id: `dish_${Date.now()}`,
      name: 'New Dish',
      price: 0,
      sharedBy: [],
    };
    setScannedDishes([...scannedDishes, newDish]);
    setEditingDishIndex(scannedDishes.length);
    setEditDishName('New Dish');
    setEditDishPrice('0');
  };

  const handleContinue = () => {
    if (!paidBy.trim()) {
      setToast({ message: 'Enter who paid the bill', type: 'error' });
      return;
    }

    const gst = parseFloat(gstPercentage) || 0;
    const serviceCharge = parseFloat(serviceChargePercentage) || 0;

    if (gst < 0 || gst > 100) {
      setToast({ message: 'GST must be between 0 and 100', type: 'error' });
      return;
    }

    if (serviceCharge < 0 || serviceCharge > 100) {
      setToast({ message: 'Service charge must be between 0 and 100', type: 'error' });
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
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
      <div className="min-h-screen py-12 px-5 sm:px-8">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="mb-8">
            <p className="starline mb-4">★ AI does the typing ★</p>
            <h1 className="font-mono font-extrabold uppercase text-3xl tracking-tight text-ink mb-2">
              Scan receipt
            </h1>
            <p className="text-ink-soft mb-3">
              Upload a photo, crop to the items, and every dish is read for you.
            </p>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink-faint">
              {scansRemaining.toLocaleString()} free scans left today · resets in {getTimeUntilReset()}
            </p>
          </div>

          {/* Image Upload */}
          {!image ? (
            <button
              className="w-full border border-dashed border-rule-dash rounded-sm bg-paper px-8 py-16 text-center cursor-pointer hover:border-ink transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <p className="font-mono font-bold uppercase tracking-[0.12em] text-ink mb-2">
                Drop the receipt here
              </p>
              <p className="text-sm text-ink-soft mb-1">
                Click to upload a photo — JPG, PNG or HEIC
              </p>
              <p className="text-xs text-ink-faint">
                Crop tightly around the items for the best read.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </button>
          ) : (
            <div>
              {/* Cropper modal */}
              {showCropper && image && (
                <div className="fixed inset-0 z-50 flex flex-col bg-ink">
                  <div className="flex-none p-4 text-center">
                    <h2 className="font-mono font-bold uppercase tracking-[0.14em] text-paper">
                      Crop receipt
                    </h2>
                    <p className="text-sm text-paper/60">
                      Drag the corners to frame just the items
                    </p>
                  </div>

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
                        alt="Receipt to crop"
                        onLoad={onImageLoad}
                        style={{
                          maxHeight: '70vh',
                          maxWidth: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    </ReactCrop>
                  </div>

                  <div className="flex-none p-6 border-t border-dashed border-paper/20">
                    <div className="flex gap-3 max-w-lg mx-auto">
                      <button
                        onClick={() => {
                          setShowCropper(false);
                          setImage(null);
                        }}
                        className="btn btn-ghost flex-1 !text-paper !border-paper/40 hover:!border-paper"
                      >
                        Cancel
                      </button>
                      <button onClick={handleCropConfirm} className="btn btn-chop flex-[2]">
                        Confirm crop
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Image Preview (Post Crop) */}
              {!showCropper && (
                <div className="slip p-3 mb-6">
                  <img
                    src={croppedImage || image}
                    alt="Receipt"
                    className="w-full"
                  />
                  {croppedImage && (
                    <button
                      onClick={() => setShowCropper(true)}
                      className="btn btn-text btn-sm mt-1"
                    >
                      Re-crop image
                    </button>
                  )}
                </div>
              )}

              {/* Progress Bar */}
              {scanning && (
                <div className="slip px-6 py-5 mb-6">
                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink mb-3">
                    Reading… <span className="tabnum">{progress}%</span>
                  </p>
                  <div className="w-full h-1.5 bg-rule">
                    <div
                      className="h-1.5 bg-ink transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* OCR Result (nothing parsed) */}
              {ocrText && !scanning && scannedDishes.length === 0 && (
                <div className="slip px-6 py-5 mb-6">
                  <p className="mlabel mb-3">Detected text</p>
                  <pre className="font-mono text-xs whitespace-pre-wrap p-4 bg-bright border border-rule rounded-sm overflow-x-auto max-h-64 overflow-y-auto text-ink-soft">
                    {ocrText}
                  </pre>
                </div>
              )}

              {/* Scanned Dishes & Bill Details Form */}
              {scannedDishes.length > 0 && (
                <>
                  <div className="slip px-6 py-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <p className="mlabel">
                        {scannedDishes.length} {scannedDishes.length === 1 ? 'dish' : 'dishes'} found
                      </p>
                      <button onClick={handleAddDish} className="btn btn-ghost btn-sm">
                        <Plus size={14} />
                        Add dish
                      </button>
                    </div>
                    <div className="space-y-1 max-h-80 overflow-y-auto">
                      {scannedDishes.map((dish, idx) => (
                        <div key={idx} className="py-1.5">
                          {editingDishIndex === idx ? (
                            // Edit mode
                            <div className="space-y-2 border border-rule-dash rounded-sm p-3 bg-bright">
                              <input
                                type="text"
                                value={editDishName}
                                onChange={(e) => setEditDishName(e.target.value)}
                                placeholder="Dish name"
                                className="field text-sm"
                              />
                              <input
                                type="number"
                                value={editDishPrice}
                                onChange={(e) => setEditDishPrice(e.target.value)}
                                placeholder="Price"
                                step="0.01"
                                className="field field-mono text-sm"
                              />
                              <div className="flex gap-2">
                                <button onClick={handleSaveEdit} className="btn btn-paid btn-sm flex-1">
                                  <Check size={14} />
                                  Save
                                </button>
                                <button onClick={handleCancelEdit} className="btn btn-ghost btn-sm flex-1">
                                  <X size={14} />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            // View mode
                            <div className="flex items-center gap-2">
                              <div className="leader-row font-mono text-sm text-ink flex-1 min-w-0">
                                <span className="truncate">{dish.name}</span>
                                <span className="leader" />
                                <span className="tabnum">{dish.price.toFixed(2)}</span>
                              </div>
                              <button
                                onClick={() => handleEditDish(idx)}
                                aria-label={`Edit ${dish.name}`}
                                className="p-1.5 text-ink-faint hover:text-ink transition-colors"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteDish(idx)}
                                aria-label={`Remove ${dish.name}`}
                                className="p-1.5 text-ink-faint hover:text-chop transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="slip px-6 py-6 mb-6">
                    <p className="mlabel mb-5">Bill details</p>
                    <div className="space-y-4">
                      <Input
                        label="Who paid?"
                        value={paidBy}
                        onChangeText={setPaidBy}
                        placeholder="e.g. Aaron"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="GST %"
                          value={gstPercentage}
                          onChangeText={setGstPercentage}
                          placeholder="9"
                          type="number"
                        />
                        <Input
                          label="Service %"
                          value={serviceChargePercentage}
                          onChangeText={setServiceChargePercentage}
                          placeholder="10"
                          type="number"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setImage(null);
                    setCroppedImage(null);
                    setOcrText('');
                    setProgress(0);
                    setScannedDishes([]);
                    setPaidBy('');
                    setCrop(undefined);
                    setCompletedCrop(null);
                  }}
                  className="btn btn-ghost w-full sm:flex-1"
                >
                  Different image
                </button>
                {!ocrText ? (
                  <button
                    onClick={handleScanReceipt}
                    disabled={scanning}
                    className="btn btn-ink w-full sm:flex-[2]"
                  >
                    {scanning ? `Reading… ${progress}%` : 'Scan receipt'}
                  </button>
                ) : scannedDishes.length > 0 ? (
                  <button
                    onClick={handleContinue}
                    disabled={!paidBy.trim()}
                    className="btn btn-ink w-full sm:flex-[2]"
                  >
                    Next: review
                  </button>
                ) : (
                  <button
                    onClick={() => router.push('/create-bill')}
                    className="btn btn-ghost w-full sm:flex-1"
                  >
                    Type it in instead
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
