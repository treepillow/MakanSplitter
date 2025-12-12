import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StatusBar,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useBill } from '../context/BillContext';
import { Colors } from '../constants/colors';

export default function CreateBillScreen() {
  const { setCurrentBill } = useBill();
  const [gstPercentage, setGstPercentage] = useState('9');
  const [serviceChargePercentage, setServiceChargePercentage] = useState('10');
  const [paidBy, setPaidBy] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = () => {
    if (!paidBy.trim()) {
      Alert.alert('Missing Information', 'Please enter who paid the bill');
      return;
    }

    const gst = parseFloat(gstPercentage) || 0;
    const serviceCharge = parseFloat(serviceChargePercentage) || 0;

    if (gst < 0 || gst > 100) {
      Alert.alert('Invalid Input', 'GST percentage must be between 0 and 100');
      return;
    }

    if (serviceCharge < 0 || serviceCharge > 100) {
      Alert.alert('Invalid Input', 'Service charge percentage must be between 0 and 100');
      return;
    }

    setCurrentBill({
      gstPercentage: gst,
      serviceChargePercentage: serviceCharge,
      paidBy: paidBy.trim(),
      date: new Date(),
      dishes: [],
      people: [],
    });

    router.push('/add-people');
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <Animated.View
              style={[
                styles.header,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={styles.headerEmoji}>💸</Text>
              <Text style={styles.title}>New Bill</Text>
              <View style={styles.stepIndicator}>
                <View style={[styles.stepDot, styles.stepDotActive]} />
                <View style={styles.stepDot} />
                <View style={styles.stepDot} />
                <View style={styles.stepDot} />
              </View>
              <Text style={styles.subtitle}>Step 1 of 4</Text>
            </Animated.View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
              <Animated.View
                style={[
                  styles.card,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
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
                  keyboardType="decimal-pad"
                  icon="📋"
                />

                <Input
                  label="Service Charge (%)"
                  value={serviceChargePercentage}
                  onChangeText={setServiceChargePercentage}
                  placeholder="10"
                  keyboardType="decimal-pad"
                  icon="🔔"
                />

                <View style={styles.infoBox}>
                  <Text style={styles.infoIcon}>💡</Text>
                  <Text style={styles.infoText}>
                    In Singapore, GST is typically 9% and service charge is 10%.
                    Leave as 0 if not applicable.
                  </Text>
                </View>
              </Animated.View>
            </ScrollView>

            <Animated.View
              style={[
                styles.footer,
                {
                  opacity: fadeAnim,
                },
              ]}
            >
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => router.back()}
                style={styles.cancelButton}
              />
              <Button
                title="Continue"
                onPress={handleContinue}
                style={styles.continueButton}
                icon="→"
              />
            </Animated.View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.cardHover,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelButton: {
    flex: 1,
  },
  continueButton: {
    flex: 2,
  },
});
