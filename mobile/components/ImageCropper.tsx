import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Image, Text } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Button } from './Button';
import { Colors } from '../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CROP_AREA_SIZE = SCREEN_WIDTH - 40;

interface ImageCropperProps {
  imageUri: string;
  onCropComplete: (croppedUri: string) => void;
  onCancel: () => void;
}

export function ImageCropper({ imageUri, onCropComplete, onCancel }: ImageCropperProps) {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [cropping, setCropping] = useState(false);

  // Crop area position and size (as percentages of image)
  const cropX = useSharedValue(10);
  const cropY = useSharedValue(10);
  const cropWidth = useSharedValue(80);
  const cropHeight = useSharedValue(80);

  // Store initial values when gesture starts
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const startWidth = useSharedValue(0);
  const startHeight = useSharedValue(0);

  React.useEffect(() => {
    Image.getSize(imageUri, (width, height) => {
      setImageSize({ width, height });
    });
  }, [imageUri]);

  const handleCrop = async () => {
    setCropping(true);
    try {
      // Convert percentages to actual pixel values
      const cropRegion = {
        originX: (cropX.value / 100) * imageSize.width,
        originY: (cropY.value / 100) * imageSize.height,
        width: (cropWidth.value / 100) * imageSize.width,
        height: (cropHeight.value / 100) * imageSize.height,
      };

      const croppedImage = await manipulateAsync(
        imageUri,
        [{ crop: cropRegion }],
        { compress: 0.9, format: SaveFormat.JPEG }
      );

      onCropComplete(croppedImage.uri);
    } catch (error) {
      console.error('Crop error:', error);
      alert('Failed to crop image');
    } finally {
      setCropping(false);
    }
  };

  // Gesture for dragging the entire crop box
  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = cropX.value;
      startY.value = cropY.value;
    })
    .onUpdate((event) => {
      const deltaX = (event.translationX / CROP_AREA_SIZE) * 100;
      const deltaY = (event.translationY / CROP_AREA_SIZE) * 100;

      cropX.value = Math.max(0, Math.min(100 - cropWidth.value, startX.value + deltaX));
      cropY.value = Math.max(0, Math.min(100 - cropHeight.value, startY.value + deltaY));
    });

  // Top-left corner
  const topLeftGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = cropX.value;
      startY.value = cropY.value;
      startWidth.value = cropWidth.value;
      startHeight.value = cropHeight.value;
    })
    .onUpdate((event) => {
      const deltaX = (event.translationX / CROP_AREA_SIZE) * 100;
      const deltaY = (event.translationY / CROP_AREA_SIZE) * 100;

      const newX = Math.max(0, Math.min(startX.value + startWidth.value - 10, startX.value + deltaX));
      const newY = Math.max(0, Math.min(startY.value + startHeight.value - 10, startY.value + deltaY));

      cropWidth.value = Math.max(10, startX.value + startWidth.value - newX);
      cropHeight.value = Math.max(10, startY.value + startHeight.value - newY);
      cropX.value = newX;
      cropY.value = newY;
    });

  // Top-right corner
  const topRightGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = cropX.value;
      startY.value = cropY.value;
      startWidth.value = cropWidth.value;
      startHeight.value = cropHeight.value;
    })
    .onUpdate((event) => {
      const deltaX = (event.translationX / CROP_AREA_SIZE) * 100;
      const deltaY = (event.translationY / CROP_AREA_SIZE) * 100;

      const newY = Math.max(0, Math.min(startY.value + startHeight.value - 10, startY.value + deltaY));
      const newWidth = Math.max(10, Math.min(100 - startX.value, startWidth.value + deltaX));

      cropWidth.value = newWidth;
      cropHeight.value = Math.max(10, startY.value + startHeight.value - newY);
      cropY.value = newY;
    });

  // Bottom-left corner
  const bottomLeftGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = cropX.value;
      startY.value = cropY.value;
      startWidth.value = cropWidth.value;
      startHeight.value = cropHeight.value;
    })
    .onUpdate((event) => {
      const deltaX = (event.translationX / CROP_AREA_SIZE) * 100;
      const deltaY = (event.translationY / CROP_AREA_SIZE) * 100;

      const newX = Math.max(0, Math.min(startX.value + startWidth.value - 10, startX.value + deltaX));
      const newHeight = Math.max(10, Math.min(100 - startY.value, startHeight.value + deltaY));

      cropWidth.value = Math.max(10, startX.value + startWidth.value - newX);
      cropHeight.value = newHeight;
      cropX.value = newX;
    });

  // Bottom-right corner
  const bottomRightGesture = Gesture.Pan()
    .onStart(() => {
      startWidth.value = cropWidth.value;
      startHeight.value = cropHeight.value;
      startX.value = cropX.value;
      startY.value = cropY.value;
    })
    .onUpdate((event) => {
      const deltaX = (event.translationX / CROP_AREA_SIZE) * 100;
      const deltaY = (event.translationY / CROP_AREA_SIZE) * 100;

      cropWidth.value = Math.max(10, Math.min(100 - startX.value, startWidth.value + deltaX));
      cropHeight.value = Math.max(10, Math.min(100 - startY.value, startHeight.value + deltaY));
    });

  const cropBoxStyle = useAnimatedStyle(() => {
    return {
      left: `${cropX.value}%`,
      top: `${cropY.value}%`,
      width: `${cropWidth.value}%`,
      height: `${cropHeight.value}%`,
    };
  });

  const aspectRatio = imageSize.width / imageSize.height || 1;
  const displayHeight = CROP_AREA_SIZE / aspectRatio;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Crop Receipt</Text>
        <Text style={styles.subtitle}>Drag corners to resize, drag box to move</Text>
      </View>

      <View style={styles.imageContainer}>
        <View style={[styles.imageWrapper, { height: displayHeight }]}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="contain"
          />

          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.cropBox, cropBoxStyle]}>
              <View style={styles.cropBorder} />

              {/* Top-left corner */}
              <GestureDetector gesture={topLeftGesture}>
                <Animated.View style={[styles.corner, styles.topLeft]}>
                  <View style={styles.cornerInner} />
                </Animated.View>
              </GestureDetector>

              {/* Top-right corner */}
              <GestureDetector gesture={topRightGesture}>
                <Animated.View style={[styles.corner, styles.topRight]}>
                  <View style={styles.cornerInner} />
                </Animated.View>
              </GestureDetector>

              {/* Bottom-left corner */}
              <GestureDetector gesture={bottomLeftGesture}>
                <Animated.View style={[styles.corner, styles.bottomLeft]}>
                  <View style={styles.cornerInner} />
                </Animated.View>
              </GestureDetector>

              {/* Bottom-right corner */}
              <GestureDetector gesture={bottomRightGesture}>
                <Animated.View style={[styles.corner, styles.bottomRight]}>
                  <View style={styles.cornerInner} />
                </Animated.View>
              </GestureDetector>
            </Animated.View>
          </GestureDetector>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Cancel"
          variant="secondary"
          onPress={onCancel}
          style={styles.button}
          disabled={cropping}
        />
        <Button
          title="Crop & Continue"
          onPress={handleCrop}
          style={styles.button}
          loading={cropping}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imageWrapper: {
    width: CROP_AREA_SIZE,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cropBox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  cropBorder: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderStyle: 'dashed',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cornerInner: {
    width: 20,
    height: 20,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  topLeft: {
    top: -20,
    left: -20,
  },
  topRight: {
    top: -20,
    right: -20,
  },
  bottomLeft: {
    bottom: -20,
    left: -20,
  },
  bottomRight: {
    bottom: -20,
    right: -20,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  button: {
    flex: 1,
  },
});
