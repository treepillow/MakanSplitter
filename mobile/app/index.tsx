import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { useBill } from '../context/BillContext';
import { SplashScreen } from '../components/SplashScreen';
import { BottomNav } from '../components/BottomNav';
import { formatCurrency } from '../utils/billCalculator';
import { Colors } from '../constants/colors';

export default function HomeScreen() {
  const { bills } = useBill();
  const [showSplash, setShowSplash] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!showSplash) {
      Animated.spring(fadeAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  }, [showSplash]);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  const sortedBills = [...bills].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const renderBillItem = ({ item }: { item: any }) => {
    const paidCount = item.people.filter((p: any) => p.hasPaid).length;
    const totalPeople = item.people.length;
    const allPaid = paidCount === totalPeople;

    return (
      <View style={styles.billCard}>
        <TouchableOpacity
          style={styles.billCardInner}
          onPress={() => router.push(`/bill/${item.id}`)}
          activeOpacity={0.8}
        >
          {allPaid && <View style={styles.paidGlow} />}

          <View style={styles.billHeader}>
            <View style={[styles.dateContainer, allPaid && styles.dateContainerPaid]}>
              <Text style={styles.dateDay}>
                {new Date(item.date).getDate()}
              </Text>
              <Text style={styles.dateMonth}>
                {new Date(item.date).toLocaleDateString('en-SG', { month: 'short' }).toUpperCase()}
              </Text>
            </View>

            <View style={styles.billInfo}>
              <Text style={styles.paidByLabel}>Paid by</Text>
              <Text style={styles.paidByName}>{item.paidBy}</Text>
              <View style={styles.peopleRow}>
                <Text style={styles.peopleIcon}>👥</Text>
                <Text style={styles.peopleCount}>
                  {totalPeople} {totalPeople === 1 ? 'person' : 'people'}
                </Text>
              </View>
            </View>

            <View style={styles.amountContainer}>
              <Text style={styles.billTotal}>{formatCurrency(item.total)}</Text>
              {allPaid ? (
                <View style={styles.allPaidBadge}>
                  <Text style={styles.badgeText}>✅ PAID</Text>
                </View>
              ) : (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingText}>{paidCount}/{totalPeople}</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Modern Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hello 👋</Text>
              <Text style={styles.title}>MakanSplit</Text>
            </View>
            <View style={styles.headerStats}>
              <Text style={styles.statsLabel}>Total Bills</Text>
              <Text style={styles.statsValue}>{bills.length}</Text>
            </View>
          </View>

          {/* Bills list or empty state */}
          {bills.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Text style={styles.emptyIcon}>🧾</Text>
              </View>
              <Text style={styles.emptyTitle}>No bills yet</Text>
              <Text style={styles.emptyText}>
                Create your first bill to start splitting with friends
              </Text>
            </View>
          ) : (
            <FlatList
              data={sortedBills}
              renderItem={renderBillItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </Animated.View>
        <BottomNav />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 16,
    color: Colors.textLight,
    fontWeight: '500',
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -1,
  },
  headerStats: {
    backgroundColor: Colors.card,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statsLabel: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '600',
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
  },
  listContent: {
    padding: 20,
    paddingBottom: 20,
  },
  billCard: {
    marginBottom: 16,
  },
  billCardInner: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  paidGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: Colors.success,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  billHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateContainer: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dateContainerPaid: {
    backgroundColor: Colors.success,
    shadowColor: Colors.success,
  },
  dateDay: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -1,
  },
  dateMonth: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
    opacity: 0.9,
  },
  billInfo: {
    flex: 1,
  },
  paidByLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  paidByName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  peopleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  peopleIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  peopleCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  billTotal: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  allPaidBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pendingBadge: {
    backgroundColor: Colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.black,
    letterSpacing: 0.5,
  },
  pendingText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.black,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  emptyIcon: {
    fontSize: 60,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
});
