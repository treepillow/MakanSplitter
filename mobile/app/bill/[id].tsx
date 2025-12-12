import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Animated,
  StatusBar,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Button } from '../../components/Button';
import { useBill } from '../../context/BillContext';
import { calculateBill, formatCurrency, generateTelegramMessage, generateWhatsAppMessage } from '../../utils/billCalculator';
import { Bill } from '../../types/bill';
import { Colors } from '../../constants/colors';
import { sendBillToTelegram, isTelegramConfigured, shareBillToTelegram, shareBillViaInlineMode } from '../../utils/telegramAPI';
import { saveBillToFirebase } from '../../services/billStorage';
import { TELEGRAM_CONFIG } from '../../config/telegram';

export default function BillDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bills, updateBillInHistory, deleteBillFromHistory } = useBill();
  const [bill, setBill] = useState<Bill | null>(null);
  const [sendingToTelegram, setSendingToTelegram] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const cardAnimRefs = useRef<Animated.Value[]>([]).current;
  const cardAnimOpacityRefs = useRef<Animated.Value[]>([]).current;

  useEffect(() => {
    const foundBill = bills.find((b) => b.id === id);
    if (foundBill) {
      setBill(foundBill);
    } else {
      Alert.alert('Bill Not Found', 'This bill no longer exists', [
        { text: 'OK', onPress: () => router.replace('/') },
      ]);
    }
  }, [id, bills]);

  // Initialize and trigger animations on component mount
  useEffect(() => {
    if (bill) {
      // Reset animation values
      fadeAnim.setValue(0);
      slideAnim.setValue(50);

      // Trigger fade and slide animations
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

      // Trigger card stagger animations
      setTimeout(() => {
        const cardCount = 4; // Restaurant, Totals, Payments, Breakdown cards
        cardAnimRefs.length = cardCount;
        cardAnimOpacityRefs.length = cardCount;

        for (let i = 0; i < cardCount; i++) {
          if (!cardAnimRefs[i]) {
            cardAnimRefs[i] = new Animated.Value(30);
            cardAnimOpacityRefs[i] = new Animated.Value(0);
          }
        }

        const staggeredAnimations = cardAnimRefs.map((anim, index) =>
          Animated.sequence([
            Animated.delay(index * 100),
            Animated.parallel([
              Animated.timing(anim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(cardAnimOpacityRefs[index], {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }),
            ]),
          ])
        );

        Animated.stagger(100, staggeredAnimations).start();
      }, 200);
    }
  }, [bill]);

  if (!bill) {
    return null;
  }

  const calculation = calculateBill(
    bill.dishes,
    bill.people,
    bill.gstPercentage,
    bill.serviceChargePercentage
  );

  const handleTogglePayment = async (personId: string) => {
    const updatedPeople = bill.people.map((p) =>
      p.id === personId ? { ...p, hasPaid: !p.hasPaid } : p
    );

    const updatedBill = {
      ...bill,
      people: updatedPeople,
      updatedAt: new Date(),
    };

    setBill(updatedBill);
    await updateBillInHistory(updatedBill);

    const allPaid = updatedPeople.every((p) => p.hasPaid);
    if (allPaid) {
      Alert.alert('🎉 All Paid!', 'Everyone has paid for this bill!');
    }
  };

  const handleCopyToClipboard = async (format: 'telegram' | 'whatsapp') => {
    const message = format === 'telegram'
      ? generateTelegramMessage(bill, calculation)
      : generateWhatsAppMessage(bill, calculation);

    await Clipboard.setStringAsync(message);
    Alert.alert('Copied!', `Message copied to clipboard. Paste it in ${format === 'telegram' ? 'Telegram' : 'WhatsApp'}.`);
  };

  const handleShare = async () => {
    const message = generateWhatsAppMessage(bill, calculation);

    try {
      await Share.share({
        message: message,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSendToTelegram = async () => {
    // Use inline share for interactive buttons
    handleInlineShare();
  };

  const handleQuickShare = async () => {
    // Simple share - opens Telegram with the bill message
    // User can choose any chat/group to send to!
    setSendingToTelegram(true);
    const result = await shareBillToTelegram(bill);
    setSendingToTelegram(false);

    if (!result.success) {
      Alert.alert('Error', result.error || 'Could not open Telegram');
    }
  };

  const handleInlineShare = async () => {
    setSendingToTelegram(true);

    // First, save bill to Firebase so webhook can access it
    try {
      await saveBillToFirebase(bill);
      console.log('Bill saved to Firebase for inline mode');
    } catch (error) {
      console.error('Failed to save to Firebase:', error);
      Alert.alert('Error', 'Failed to prepare bill for sharing. Please try again.');
      setSendingToTelegram(false);
      return;
    }

    setSendingToTelegram(false);

    // Copy just the bill ID to clipboard
    await Clipboard.setStringAsync(bill.id);

    // Show instructions for inline mode
    Alert.alert(
      '📤 Bill ID Copied!',
      `Share with interactive buttons:\n\n` +
      `1. Open any Telegram chat\n` +
      `2. Type: @${TELEGRAM_CONFIG.BOT_USERNAME}\n` +
      `3. Add a space, then paste the bill ID\n` +
      `4. Tap the bill result that appears\n` +
      `5. Send it!\n\n` +
      `✨ Bill ID: ${bill.id}\n\n` +
      `Friends can tap "Paid" buttons!`,
      [
        { text: 'Got it!' },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Bill',
      'Are you sure you want to delete this bill? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteBillFromHistory(bill.id);
            router.replace('/');
          },
        },
      ]
    );
  };

  const paidCount = bill.people.filter((p) => p.hasPaid).length;
  const totalPeople = bill.people.length;
  const allPaid = paidCount === totalPeople;

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
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerEmoji}>📄</Text>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>

      <ScrollView style={styles.content}>
        <Animated.View
          style={[
            styles.restaurantCard,
            {
              opacity: cardAnimOpacityRefs[0] || 0,
              transform: [{ translateY: cardAnimRefs[0] || 0 }],
            },
          ]}
        >
          <Text style={styles.restaurantName}>{bill.restaurantName}</Text>
          <Text style={styles.date}>
            {new Date(bill.date).toLocaleDateString('en-SG', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
          <Text style={styles.paidByText}>Paid by: {bill.paidBy}</Text>
          {allPaid ? (
            <View style={styles.allPaidBadge}>
              <Text style={styles.allPaidText}>✅ All Paid</Text>
            </View>
          ) : (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>
                ⏳ {paidCount}/{totalPeople} Paid
              </Text>
            </View>
          )}
        </Animated.View>

        <Animated.View
          style={[
            styles.totalsCard,
            {
              opacity: cardAnimOpacityRefs[1] || 0,
              transform: [{ translateY: cardAnimRefs[1] || 0 }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Total Bill</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(calculation.subtotal)}</Text>
          </View>
          {bill.serviceChargePercentage > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                Service Charge ({bill.serviceChargePercentage}%)
              </Text>
              <Text style={styles.totalValue}>{formatCurrency(calculation.serviceCharge)}</Text>
            </View>
          )}
          {bill.gstPercentage > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>GST ({bill.gstPercentage}%)</Text>
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
            styles.paymentsCard,
            {
              opacity: cardAnimOpacityRefs[2] || 0,
              transform: [{ translateY: cardAnimRefs[2] || 0 }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Payment Status</Text>
          {calculation.perPersonBreakdown.map((person) => {
            const personData = bill.people.find((p) => p.id === person.personId);
            const hasPaid = personData?.hasPaid || false;

            return (
              <TouchableOpacity
                key={person.personId}
                style={[
                  styles.paymentRow,
                  hasPaid && styles.paymentRowPaid,
                ]}
                onPress={() => handleTogglePayment(person.personId)}
              >
                <View style={styles.paymentInfo}>
                  <Text style={[
                    styles.paymentName,
                    hasPaid && styles.paymentNamePaid,
                  ]}>
                    {hasPaid ? '✅' : '⏳'} {person.personName}
                  </Text>
                  <Text style={styles.paymentAmount}>
                    {formatCurrency(person.total)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
          <View style={styles.paymentHint}>
            <Text style={styles.paymentHintText}>
              💡 Tap a person to mark them as paid/unpaid
            </Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.breakdownCard,
            {
              opacity: cardAnimOpacityRefs[3] || 0,
              transform: [{ translateY: cardAnimRefs[3] || 0 }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Detailed Breakdown</Text>
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
      </ScrollView>

      </Animated.View>

      <View style={styles.footer}>
        <Button
          title="📤 Share to Telegram"
          variant="primary"
          onPress={handleSendToTelegram}
          style={styles.fullButton}
          loading={sendingToTelegram}
          disabled={sendingToTelegram}
        />
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
      </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.accent,
    fontWeight: '600',
  },
  headerEmoji: {
    fontSize: 24,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    color: Colors.error,
    fontWeight: '600',
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
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
  },
  paidByText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  allPaidBadge: {
    backgroundColor: `${Colors.success}20`,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  allPaidText: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: '600',
  },
  pendingBadge: {
    backgroundColor: `${Colors.warning}20`,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  pendingText: {
    fontSize: 14,
    color: Colors.warning,
    fontWeight: '600',
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
    borderTopWidth: 2,
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
  paymentsCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  paymentRow: {
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 10,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  paymentRowPaid: {
    backgroundColor: `${Colors.success}15`,
    borderColor: Colors.success,
  },
  paymentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentName: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  paymentNamePaid: {
    color: Colors.success,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  paymentHint: {
    marginTop: 8,
    padding: 12,
    backgroundColor: `${Colors.primary}15`,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  paymentHintText: {
    fontSize: 12,
    color: Colors.primary,
    textAlign: 'center',
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
    color: Colors.textLight,
    flex: 1,
  },
  dishRowAmount: {
    fontSize: 14,
    color: Colors.textLight,
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.backgroundSecondary,
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
  },
});
