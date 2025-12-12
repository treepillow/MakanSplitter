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
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { useBill } from '../context/BillContext';
import { Button } from '../components/Button';
import { SplashScreen } from '../components/SplashScreen';
import { formatCurrency } from '../utils/billCalculator';
import { Colors } from '../constants/colors';

export default function HomeScreen() {
  const { bills } = useBill();
  const [showSplash, setShowSplash] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!showSplash) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
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

  const renderBillItem = ({ item, index }: { item: any; index: number }) => {
    const paidCount = item.people.filter((p: any) => p.hasPaid).length;
    const totalPeople = item.people.length;
    const allPaid = paidCount === totalPeople;

    const itemAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(itemAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        style={[
          styles.billCard,
          {
            opacity: itemAnim,
            transform: [
              {
                translateY: itemAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.billCardInner}
          onPress={() => router.push(`/bill/${item.id}`)}
          activeOpacity={0.7}
        >
          {allPaid && <View style={styles.paidStripe} />}
          
          <View style={styles.billHeader}>
            <View style={styles.dateContainer}>
              <Text style={styles.dateDay}>
                {new Date(item.date).getDate()}
              </Text>
              <Text style={styles.dateMonth}>
                {new Date(item.date).toLocaleDateString('en-SG', { month: 'short' })}
              </Text>
            </View>

            <View style={styles.billInfo}>
              <View style={styles.paidByRow}>
                <Text style={styles.paidByLabel}>Paid by</Text>
                <Text style={styles.paidByName}>{item.paidBy}</Text>
              </View>
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
                  <Text style={styles.badgeText}>✅ Paid</Text>
                </View>
              ) : (
                <View style={styles.pendingBadge}>
                  <Text style={styles.badgeText}>
                    {paidCount}/{totalPeople}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Header with hamburger menu */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setMenuVisible(true)}
            >
              <View style={styles.menuBar} />
              <View style={styles.menuBar} />
              <View style={styles.menuBar} />
            </TouchableOpacity>

            <View style={styles.titleContainer}>
              <Text style={styles.logo}>🍜</Text>
              <Text style={styles.title}>MakanSplit</Text>
            </View>

            <View style={styles.menuButton} />
          </View>

          {/* Bills list or empty state */}
          {bills.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🧾</Text>
              <Text style={styles.emptyTitle}>No bills yet</Text>
              <Text style={styles.emptyText}>
                Create your first bill to get started
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

          {/* Floating action button */}
          <TouchableOpacity
            style={styles.fab}
            onPress={() => router.push('/create-bill')}
            activeOpacity={0.9}
          >
            <Text style={styles.fabIcon}>+</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Hamburger Menu */}
        <Modal
          visible={menuVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setMenuVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          >
            <View style={styles.menuPanel}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Menu</Text>
                <TouchableOpacity onPress={() => setMenuVisible(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.menuItem} onPress={() => {
                setMenuVisible(false);
                router.push('/create-bill');
              }}>
                <Text style={styles.menuItemIcon}>➕</Text>
                <Text style={styles.menuItemText}>New Bill</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.menuItemIcon}>📊</Text>
                <Text style={styles.menuItemText}>Statistics</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.menuItemIcon}>⚙️</Text>
                <Text style={styles.menuItemText}>Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.menuItemIcon}>ℹ️</Text>
                <Text style={styles.menuItemText}>About</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    gap: 6,
  },
  menuBar: {
    height: 3,
    backgroundColor: Colors.text,
    borderRadius: 2,
    width: '100%',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    fontSize: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  listContent: {
    padding: 16,
  },
  billCard: {
    marginBottom: 16,
  },
  billCardInner: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  paidStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: Colors.success,
  },
  billHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  dateDay: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.white,
  },
  dateMonth: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
    textTransform: 'uppercase',
  },
  billInfo: {
    flex: 1,
  },
  paidByRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  paidByLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginRight: 6,
  },
  paidByName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  peopleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  peopleIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  peopleCount: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '500',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  billTotal: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 6,
  },
  allPaidBadge: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pendingBadge: {
    backgroundColor: Colors.warningLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: Colors.white,
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuPanel: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  closeButton: {
    fontSize: 28,
    color: Colors.textLight,
    fontWeight: '300',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuItemIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
  },
  menuItemText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
});
