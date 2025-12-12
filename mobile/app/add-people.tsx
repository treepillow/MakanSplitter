import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  StatusBar,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useBill } from '../context/BillContext';
import { Colors } from '../constants/colors';

export default function AddPeopleScreen() {
  const { currentBill, setCurrentBill } = useBill();
  const [personName, setPersonName] = useState('');
  const [people, setPeople] = useState<string[]>([]);

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

  useEffect(() => {
    if (!currentBill) {
      router.replace('/');
    }
  }, [currentBill]);

  if (!currentBill) {
    return null;
  }

  const handleAddPerson = () => {
    const trimmedName = personName.trim();
    if (!trimmedName) {
      Alert.alert('Invalid Name', 'Please enter a person\'s name');
      return;
    }

    if (people.includes(trimmedName)) {
      Alert.alert('Duplicate Name', 'This person has already been added');
      return;
    }

    setPeople([...people, trimmedName]);
    setPersonName('');
  };

  const handleRemovePerson = (name: string) => {
    setPeople(people.filter((p) => p !== name));
  };

  const handleContinue = () => {
    if (people.length === 0) {
      Alert.alert('No People Added', 'Please add at least one person');
      return;
    }

    setCurrentBill({
      ...currentBill,
      people: people.map((name) => ({
        id: `person_${Date.now()}_${Math.random()}`,
        name,
        amountOwed: 0,
        hasPaid: false,
      })),
    });

    router.push('/add-dishes');
  };

  const renderPerson = ({ item }: { item: string }) => (
    <View style={styles.personCard}>
      <View style={styles.personInfo}>
        <Text style={styles.personIcon}>👤</Text>
        <Text style={styles.personName}>{item}</Text>
      </View>
      <TouchableOpacity
        onPress={() => handleRemovePerson(item)}
        style={styles.removeButton}
        activeOpacity={0.7}
      >
        <Text style={styles.removeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <SafeAreaView style={styles.container}>
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.headerEmoji}>👥</Text>
          <Text style={styles.title}>Add People</Text>
          <View style={styles.stepIndicator}>
            <View style={styles.stepDot} />
            <View style={[styles.stepDot, styles.stepDotActive]} />
            <View style={styles.stepDot} />
            <View style={styles.stepDot} />
          </View>
          <Text style={styles.subtitle}>Step 2 of 4</Text>
        </Animated.View>

        <View style={styles.content}>
          <Animated.View
            style={[
              styles.inputSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Input
              label="Person's Name"
              value={personName}
              onChangeText={setPersonName}
              placeholder="e.g. Sarah"
              icon="✏️"
              style={styles.input}
            />
            <Button
              title="Add Person"
              onPress={handleAddPerson}
              style={styles.addButton}
              icon="+"
            />
          </Animated.View>

          <View style={styles.listContainer}>
            <Animated.View
              style={[
                styles.listHeader,
                {
                  opacity: fadeAnim,
                },
              ]}
            >
              <Text style={styles.listTitle}>
                People Added
              </Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{people.length}</Text>
              </View>
            </Animated.View>

            {people.length === 0 ? (
              <Animated.View
                style={[
                  styles.emptyState,
                  {
                    opacity: fadeAnim,
                  },
                ]}
              >
                <View style={styles.emptyIconContainer}>
                  <Text style={styles.emptyIcon}>👥</Text>
                </View>
                <Text style={styles.emptyText}>
                  No people added yet{'\n'}Add everyone who shared the meal
                </Text>
              </Animated.View>
            ) : (
              <FlatList
                data={people}
                renderItem={renderPerson}
                keyExtractor={(item) => item}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>

        <Animated.View
          style={[
            styles.footer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Button
            title="Back"
            variant="secondary"
            onPress={() => router.back()}
            style={styles.backButton}
          />
          <Button
            title="Continue"
            onPress={handleContinue}
            style={styles.continueButton}
            disabled={people.length === 0}
            icon="→"
          />
        </Animated.View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputSection: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    marginBottom: 16,
  },
  addButton: {
    marginTop: 0,
  },
  listContainer: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  countBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    minWidth: 32,
    alignItems: 'center',
  },
  countText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.white,
  },
  list: {
    gap: 12,
    paddingBottom: 20,
  },
  personCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  personInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  personIcon: {
    fontSize: 20,
  },
  personName: {
    fontSize: 17,
    color: Colors.text,
    fontWeight: '600',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  emptyIcon: {
    fontSize: 50,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  backButton: {
    flex: 1,
  },
  continueButton: {
    flex: 2,
  },
});
