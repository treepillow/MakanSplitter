import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Share,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Button } from '../components/Button';
import { useBill } from '../context/BillContext';
import { calculateBill, formatCurrency, generateTelegramMessage, generateWhatsAppMessage } from '../utils/billCalculator';
import { Bill } from '../types/bill';
import { Colors } from '../constants/colors';
import { saveBillToFirebase } from '../services/billStorage';

export default function BillSummaryScreen() {
  const { currentBill, setCurrentBill, saveBillToHistory } = useBill();
  const [saving, setSaving] = useState(false);
  const [showCalculationBreakdown, setShowCalculationBreakdown] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const cardFadeAnims = useRef([]).current;

  // Initialize animation values for cards
  const getCardAnim = (index: number) => {
    if (!cardFadeAnims[index]) {
      cardFadeAnims[index] = new Animated.Value(0);
    }
    return cardFadeAnims[index];
  };

  useEffect(() => {
    // Fade and slide in on mount
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

    // Stagger cards animation
    const cardAnimations = [0, 1, 2, 3, 4].map((index) =>
      Animated.timing(getCardAnim(index), {
        toValue: 1,
        duration: 500,
        delay: 300 + index * 100,
        useNativeDriver: true,
      })
    );

    Animated.stagger(100, cardAnimations).start();
  }, []);

  useEffect(() => {
    if (!currentBill || !currentBill.dishes || !currentBill.people) {
      router.replace('/');
    }
  }, [currentBill]);

  if (!currentBill || !currentBill.dishes || !currentBill.people) {
    return null;
  }

  const calculation = calculateBill(
    currentBill.dishes,
    currentBill.people,
    currentBill.gstPercentage || 0,
    currentBill.serviceChargePercentage || 0
  );

  const handleSaveBill = async () => {
    setSaving(true);
    try {
      const completeBill: Bill = {
        id: `bill_${Date.now()}`,
        restaurantName: currentBill.restaurantName!,
        date: currentBill.date || new Date(),
        gstPercentage: currentBill.gstPercentage || 0,
        serviceChargePercentage: currentBill.serviceChargePercentage || 0,
        dishes: currentBill.dishes!,
        people: calculation.perPersonBreakdown.map((p) => ({
          id: p.personId,
          name: p.personName,
          amountOwed: p.total,
          hasPaid: false,
        })),
        participants: [], // Start with empty participants for Telegram selection
        phase: 'selection' as const, // Start in selection phase
        subtotal: calculation.subtotal,
        gstAmount: calculation.gst,
        serviceChargeAmount: calculation.serviceCharge,
        total: calculation.total,
        paidBy: currentBill.paidBy!,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save to local storage
      await saveBillToHistory(completeBill);

      // Save to Firebase (for Telegram bot integration)
      try {
        await saveBillToFirebase(completeBill);
        console.log('Bill saved to Firebase:', completeBill.id);
      } catch (error) {
        console.error('Failed to save to Firebase:', error);
        // Don't block the user if Firebase fails
      }

      setCurrentBill(null);

      Alert.alert(
        'Bill Saved!',
        'Your bill has been saved successfully',
        [
          {
            text: 'View Bill',
            onPress: () => {
              setTimeout(() => {
                router.push(`/bill/${completeBill.id}`);
              }, 100);
            },
          },
          {
            text: 'Home',
            onPress: () => {
              setTimeout(() => {
                router.push('/');
              }, 100);
            },
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save bill. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyToClipboard = async (format: 'telegram' | 'whatsapp') => {
    const tempBill: Bill = {
      id: 'temp',
      restaurantName: currentBill.restaurantName!,
      date: currentBill.date || new Date(),
      gstPercentage: currentBill.gstPercentage || 0,
      serviceChargePercentage: currentBill.serviceChargePercentage || 0,
      dishes: currentBill.dishes!,
      people: calculation.perPersonBreakdown.map((p) => ({
        id: p.personId,
        name: p.personName,
        amountOwed: p.total,
        hasPaid: false,
      })),
      participants: [],
      phase: 'selection' as const,
      subtotal: calculation.subtotal,
      gstAmount: calculation.gst,
      serviceChargeAmount: calculation.serviceCharge,
      total: calculation.total,
      paidBy: currentBill.paidBy!,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const message = format === 'telegram'
      ? generateTelegramMessage(tempBill, calculation)
      : generateWhatsAppMessage(tempBill, calculation);

    await Clipboard.setStringAsync(message);
    Alert.alert('Copied!', `Message copied to clipboard. Paste it in ${format === 'telegram' ? 'Telegram' : 'WhatsApp'}.`);
  };

  const handleShare = async () => {
    const tempBill: Bill = {
      id: 'temp',
      restaurantName: currentBill.restaurantName!,
      date: currentBill.date || new Date(),
      gstPercentage: currentBill.gstPercentage || 0,
      serviceChargePercentage: currentBill.serviceChargePercentage || 0,
      dishes: currentBill.dishes!,
      people: calculation.perPersonBreakdown.map((p) => ({
        id: p.personId,
        name: p.personName,
        amountOwed: p.total,
        hasPaid: false,
      })),
      participants: [],
      phase: 'selection' as const,
      subtotal: calculation.subtotal,
      gstAmount: calculation.gst,
      serviceChargeAmount: calculation.serviceCharge,
      total: calculation.total,
      paidBy: currentBill.paidBy!,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const message = generateWhatsAppMessage(tempBill, calculation);

    try {
      await Share.share({
        message: message,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <Animated.View
        style={[
          styles.mainContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerEmoji}>📋</Text>
            <Text style={styles.title}>Bill Summary</Text>
          </View>
          <View style={styles.stepIndicator}>
            <View style={styles.stepDot} />
            <View style={styles.stepDot} />
            <View style={styles.stepDot} />
            <View style={[styles.stepDot, styles.stepDotActive]} />
          </View>
          <Text style={styles.subtitle}>Step 4 of 4</Text>
        </View>

        <ScrollView style={styles.content}>
          <Animated.View
            style={[
              styles.restaurantCard,
              {
                opacity: getCardAnim(0),
              },
            ]}
          >
            <Text style={styles.restaurantName}>{currentBill.restaurantName}</Text>
            <Text style={styles.paidByText}>Paid by: {currentBill.paidBy}</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.totalsCard,
              {
                opacity: getCardAnim(1),
              },
            ]}
          >
          <Text style={styles.sectionTitle}>Total Bill</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(calculation.subtotal)}</Text>
          </View>
          {currentBill.serviceChargePercentage! > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                Service Charge ({currentBill.serviceChargePercentage}%)
              </Text>
              <Text style={styles.totalValue}>{formatCurrency(calculation.serviceCharge)}</Text>
            </View>
          )}
          {currentBill.gstPercentage! > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>GST ({currentBill.gstPercentage}%)</Text>
              <Text style={styles.totalValue}>{formatCurrency(calculation.gst)}</Text>
            </View>
          )}
            <View style={[styles.totalRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(calculation.total)}</Text>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.breakdownCard,
              {
                opacity: getCardAnim(2),
              },
            ]}
          >
          <Text style={styles.sectionTitle}>Payment Breakdown</Text>
          {calculation.perPersonBreakdown.map((person) => (
            <View key={person.personId} style={styles.personBreakdown}>
              <View style={styles.personHeader}>
                <Text style={styles.personName}>{person.personName}</Text>
                <Text style={styles.personTotal}>{formatCurrency(person.total)}</Text>
              </View>
              {person.dishesEaten.map((dish, index) => (
                <View key={index} style={styles.dishRow}>
                  <Text style={styles.dishRowName}>• {dish.dishName}</Text>
                  <Text style={styles.dishRowAmount}>
                    {formatCurrency(dish.shareAmount)}
                  </Text>
                </View>
              ))}
            </View>
          ))}
          </Animated.View>

          <Animated.View
            style={[
              styles.calculationCard,
              {
                opacity: getCardAnim(3),
              },
            ]}
          >
          <TouchableOpacity
            style={styles.calculationHeader}
            onPress={() => setShowCalculationBreakdown(!showCalculationBreakdown)}
            activeOpacity={0.7}
          >
            <Text style={styles.sectionTitle}>How was this calculated?</Text>
            <Text style={styles.expandIcon}>{showCalculationBreakdown ? '▼' : '▶'}</Text>
          </TouchableOpacity>

          {showCalculationBreakdown && (
            <View style={styles.calculationDetails}>
              <Text style={styles.calculationStep}>Step 1: Dishes Total</Text>
              {currentBill.dishes!.map((dish, index) => (
                <View key={index} style={styles.calculationRow}>
                  <Text style={styles.calculationLabel}>• {dish.name}</Text>
                  <Text style={styles.calculationValue}>{formatCurrency(dish.price)}</Text>
                </View>
              ))}
              <View style={[styles.calculationRow, styles.calculationSubtotal]}>
                <Text style={styles.calculationLabel}>Subtotal</Text>
                <Text style={styles.calculationValue}>{formatCurrency(calculation.subtotal)}</Text>
              </View>

              {currentBill.serviceChargePercentage! > 0 && (
                <>
                  <Text style={styles.calculationStep}>Step 2: Service Charge</Text>
                  <View style={styles.calculationRow}>
                    <Text style={styles.calculationLabel}>
                      {formatCurrency(calculation.subtotal)} × {currentBill.serviceChargePercentage}%
                    </Text>
                    <Text style={styles.calculationValue}>{formatCurrency(calculation.serviceCharge)}</Text>
                  </View>
                </>
              )}

              {currentBill.gstPercentage! > 0 && (
                <>
                  <Text style={styles.calculationStep}>Step {currentBill.serviceChargePercentage! > 0 ? '3' : '2'}: GST</Text>
                  <View style={styles.calculationRow}>
                    <Text style={styles.calculationLabel}>
                      ({formatCurrency(calculation.subtotal)} + {formatCurrency(calculation.serviceCharge)}) × {currentBill.gstPercentage}%
                    </Text>
                    <Text style={styles.calculationValue}>{formatCurrency(calculation.gst)}</Text>
                  </View>
                </>
              )}

              <Text style={styles.calculationStep}>Final: Per Person Split</Text>
              {calculation.perPersonBreakdown.map((person, index) => (
                <View key={index} style={styles.personCalculation}>
                  <Text style={styles.calculationPersonName}>{person.personName}</Text>
                  {person.dishesEaten.map((dish, dishIndex) => (
                    <View key={dishIndex} style={styles.calculationRow}>
                      <Text style={styles.calculationLabel}>
                        • {dish.dishName} ÷ {currentBill.dishes!.find(d => d.name === dish.dishName)?.sharedBy.length}
                      </Text>
                      <Text style={styles.calculationValue}>{formatCurrency(dish.shareAmount)}</Text>
                    </View>
                  ))}
                  <View style={styles.calculationRow}>
                    <Text style={styles.calculationLabel}>+ Service Charge ({currentBill.serviceChargePercentage}%)</Text>
                    <Text style={styles.calculationValue}>{formatCurrency(person.serviceCharge)}</Text>
                  </View>
                  <View style={styles.calculationRow}>
                    <Text style={styles.calculationLabel}>+ GST ({currentBill.gstPercentage}%)</Text>
                    <Text style={styles.calculationValue}>{formatCurrency(person.gst)}</Text>
                  </View>
                  <View style={[styles.calculationRow, styles.calculationPersonTotal]}>
                    <Text style={styles.calculationLabel}>Total</Text>
                    <Text style={styles.calculationTotalValue}>{formatCurrency(person.total)}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
          </Animated.View>
        </ScrollView>

        <View style={styles.footer}>
        <View style={styles.shareButtons}>
          <Button
            title="Copy for Telegram"
            variant="secondary"
            onPress={() => handleCopyToClipboard('telegram')}
            style={styles.shareButton}
          />
          <Button
            title="Copy for WhatsApp"
            variant="secondary"
            onPress={() => handleCopyToClipboard('whatsapp')}
            style={styles.shareButton}
          />
        </View>
        <Button
          title="Share"
          variant="secondary"
          onPress={handleShare}
          style={styles.fullButton}
        />
        <Button
          title="Save Bill"
          onPress={handleSaveBill}
          loading={saving}
          style={styles.fullButton}
        />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mainContainer: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
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
    width: 12,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  restaurantCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  paidByText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  totalsCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  totalValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    marginTop: 8,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  breakdownCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  personBreakdown: {
    marginBottom: 20,
  },
  personHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  personName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  personTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  dishRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 8,
    marginBottom: 4,
  },
  dishRowName: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  dishRowAmount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  shareButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  shareButton: {
    flex: 1,
  },
  fullButton: {
    width: '100%',
    marginBottom: 8,
  },
  calculationCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  calculationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expandIcon: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  calculationDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  calculationStep: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingLeft: 8,
  },
  calculationLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  calculationValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  calculationSubtotal: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    marginTop: 4,
    paddingLeft: 0,
  },
  personCalculation: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderDark,
  },
  calculationPersonName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  calculationPersonTotal: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    marginTop: 4,
  },
  calculationTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
});
