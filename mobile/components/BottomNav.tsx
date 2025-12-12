import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Colors } from '../constants/colors';

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push('/')}
        activeOpacity={0.7}
      >
        <Text style={[styles.icon, isActive('/') && styles.iconActive]}>
          🏠
        </Text>
        <Text style={[styles.label, isActive('/') && styles.labelActive]}>
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push('/create-bill')}
        activeOpacity={0.7}
      >
        <View style={styles.centerButton}>
          <Text style={styles.centerIcon}>+</Text>
        </View>
        <Text style={styles.centerLabel}>New Bill</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => {}}
        activeOpacity={0.7}
        disabled
      >
        <Text style={[styles.icon, styles.iconDisabled]}>
          ⚙️
        </Text>
        <Text style={[styles.label, styles.labelDisabled]}>
          Settings
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 24,
    marginBottom: 4,
    opacity: 0.6,
  },
  iconActive: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  iconDisabled: {
    opacity: 0.3,
  },
  label: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  labelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  labelDisabled: {
    opacity: 0.3,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  centerIcon: {
    fontSize: 32,
    color: Colors.white,
    fontWeight: '300',
    lineHeight: 36,
  },
  centerLabel: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
  },
});
