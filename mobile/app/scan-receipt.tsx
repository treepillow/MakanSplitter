import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import { Button } from '../components/Button';
import { ImageCropper } from '../components/ImageCropper';
import { scanReceipt } from '../utils/receiptOCR';
import { isOCRConfigured, getOCRErrorMessage, OCR_CONFIG } from '../config/ocr';
import { useBill } from '../context/BillContext';

export default function ScanReceiptScreen() {
  const { currentBill, setCurrentBill } = useBill();
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Fade in and slide up animation on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const takePictureWithCrop = async () => {
    try {
      // Request camera permission
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow camera access to scan receipts.');
        return;
      }

      // Launch camera without editing - we'll crop manually
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setRawImage(result.assets[0].uri);
        setShowCropper(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Camera Error', 'Failed to open camera.');
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
        return;
      }

      // Pick from gallery without editing - we'll crop manually
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setRawImage(result.assets[0].uri);
        setShowCropper(true);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Gallery Error', 'Failed to open gallery.');
    }
  };

  const handleCropComplete = (croppedUri: string) => {
    setCapturedImage(croppedUri);
    setShowCropper(false);
    setRawImage(null);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setRawImage(null);
  };

  const processReceipt = async () => {
    if (!capturedImage) return;

    // Check if OCR is configured
    if (!isOCRConfigured()) {
      Alert.alert(
        'Setup Required',
        'To use receipt scanning, you need to:\n\n' +
        '1. Get a FREE Google Cloud Vision API key at console.cloud.google.com\n' +
        '2. Enable "Cloud Vision API"\n' +
        '3. Add API key to config/ocr.ts\n' +
        '4. Set ENABLED: true\n\n' +
        'Free tier: 1,000 scans/month!\n\n' +
        'For now, add dishes manually.',
        [
          {
            text: 'Add Manually',
            onPress: () => router.back(),
          },
        ]
      );
      return;
    }

    setProcessing(true);

    try {
      // Call Google Cloud Vision OCR
      const result = await scanReceipt(capturedImage, OCR_CONFIG.GOOGLE_VISION_API_KEY);

      if (result.dishes.length === 0) {
        Alert.alert(
          'No Dishes Found',
          'Could not detect any dishes from the receipt. This could be because:\n\n' +
          '• Receipt image is blurry\n• Text is too small\n• Receipt format not recognized\n\n' +
          'Please add dishes manually.',
          [
            { text: 'Retake Photo', onPress: retakePicture },
            { text: 'Add Manually', onPress: () => router.back() },
          ]
        );
        return;
      }

      // Show success and add dishes to current bill
      Alert.alert(
        'Success!',
        `Found ${result.dishes.length} dish${result.dishes.length > 1 ? 'es' : ''} on the receipt:\n\n` +
        result.dishes.map(d => `• ${d.name} - $${d.price.toFixed(2)}`).join('\n') +
        '\n\nThese will be added to your bill. You can edit them on the next screen.',
        [
          {
            text: 'Add to Bill',
            onPress: () => {
              // Add scanned dishes to current bill
              if (currentBill) {
                setCurrentBill({
                  ...currentBill,
                  dishes: [...(currentBill.dishes || []), ...result.dishes],
                });
              }
              router.back(); // Go back to add-dishes screen
            },
          },
          { text: 'Retake', onPress: retakePicture, style: 'cancel' },
        ]
      );
    } catch (error) {
      console.error('OCR Error:', error);
      Alert.alert(
        'Scan Failed',
        'Failed to scan receipt. This could be due to:\n\n' +
        '• Network connection issues\n' +
        '• Invalid API key\n' +
        '• API rate limit reached\n\n' +
        'Error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        [
          { text: 'Try Again', onPress: () => processReceipt() },
          { text: 'Add Manually', onPress: () => router.back() },
        ]
      );
    } finally {
      setProcessing(false);
    }
  };

  const retakePicture = () => {
    setCapturedImage(null);
  };

  // Show cropper interface
  if (showCropper && rawImage) {
    return (
      <ImageCropper
        imageUri={rawImage}
        onCropComplete={handleCropComplete}
        onCancel={handleCropCancel}
      />
    );
  }

  if (capturedImage) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Button
            title="← Back"
            variant="text"
            onPress={() => router.back()}
          />
          <Text style={styles.title}>Review Receipt</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />

          {processing ? (
            <View style={styles.processingCard}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.processingText}>Scanning receipt...</Text>
              <Text style={styles.processingSubtext}>
                Using AI to detect dishes and prices
              </Text>
            </View>
          ) : (
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>🤖</Text>
              <Text style={styles.infoText}>
                {isOCRConfigured()
                  ? 'Tap "Scan Receipt" to automatically detect dishes using Google Cloud Vision AI!'
                  : 'Get a FREE Google Cloud Vision API key to enable automatic receipt scanning. See config/ocr.ts for setup instructions.'}
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Retake Photo"
            variant="secondary"
            onPress={retakePicture}
            style={styles.footerButton}
            disabled={processing}
          />
          <Button
            title={isOCRConfigured() ? "🤖 Scan Receipt" : "Add Manually"}
            onPress={isOCRConfigured() ? processReceipt : () => router.back()}
            style={styles.footerButton}
            loading={processing}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light" backgroundColor={Colors.background} />
      <View style={styles.header}>
        <Button
          title="← Back"
          variant="text"
          onPress={() => router.back()}
        />
        <Text style={styles.title}>📸 Scan Receipt</Text>
        <View style={{ width: 60 }} />
      </View>

      <Animated.View
        style={[
          styles.welcomeContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.welcomeIcon}>📸</Text>
        <Text style={styles.welcomeTitle}>Scan Your Receipt</Text>
        <Text style={styles.welcomeText}>
          Take a photo and crop it to show only the items and prices section for best OCR results!
        </Text>

        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>💡 How to get best results:</Text>
          <Text style={styles.instructionText}>1. Take a clear photo of your receipt</Text>
          <Text style={styles.instructionText}>2. Use the crop tool to select only the items section</Text>
          <Text style={styles.instructionText}>3. Exclude headers, footers, and totals</Text>
          <Text style={styles.instructionText}>4. Make sure text is sharp and readable</Text>
        </View>

        <View style={styles.options}>
          <Button
            title="📸 Take Photo & Crop"
            onPress={takePictureWithCrop}
            style={styles.optionButton}
          />

          <Button
            title="🖼️ Choose from Gallery & Crop"
            variant="secondary"
            onPress={pickImageFromGallery}
            style={styles.optionButton}
          />
        </View>

        <Button
          title="Skip - Add Manually"
          variant="text"
          onPress={() => router.back()}
          style={styles.skipButton}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  welcomeContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  welcomeIcon: {
    fontSize: 60,
    marginBottom: 16,
    textAlign: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  instructionsCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 22,
    marginBottom: 4,
  },
  options: {
    width: '100%',
    gap: 12,
    marginBottom: 16,
  },
  optionButton: {
    width: '100%',
  },
  skipButton: {
    width: '100%',
  },
  previewContainer: {
    flex: 1,
    padding: 16,
  },
  previewImage: {
    width: '100%',
    height: 400,
    borderRadius: 16,
    marginBottom: 16,
    resizeMode: 'contain',
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  processingCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  processingText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 4,
  },
  processingSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  footerButton: {
    width: '100%',
  },
});
