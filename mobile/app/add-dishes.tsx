import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  Animated,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useBill } from '../context/BillContext';
import { Dish } from '../types/bill';
import { Colors } from '../constants/colors';

export default function AddDishesScreen() {
  const { currentBill, setCurrentBill } = useBill();
  const [dishes, setDishes] = useState<Dish[]>(currentBill?.dishes || []);
  const [dishName, setDishName] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Sync local dishes state with currentBill.dishes when they change
  useEffect(() => {
    if (currentBill?.dishes) {
      setDishes(currentBill.dishes);
    }
  }, [currentBill?.dishes]);

  // Fade and slide animation on mount
  useEffect(() => {
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

  useEffect(() => {
    if (!currentBill || !currentBill.people) {
      router.replace('/');
    }
  }, [currentBill]);

  if (!currentBill || !currentBill.people) {
    return null;
  }

  const people = currentBill.people;

  const handleAddDish = () => {
    const trimmedName = dishName.trim();
    const price = parseFloat(dishPrice);

    if (!trimmedName) {
      Alert.alert('Invalid Input', 'Please enter a dish name');
      return;
    }

    if (isNaN(price) || price <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid price');
      return;
    }

    const newDish: Dish = {
      id: `dish_${Date.now()}_${Math.random()}`,
      name: trimmedName,
      price: price,
      sharedBy: [],
    };

    setDishes([...dishes, newDish]);
    setDishName('');
    setDishPrice('');

    // Automatically open assignment modal
    setSelectedDish(newDish);
    setSelectedPeople([]);
    setAssignModalVisible(true);
  };

  const handleAssignPeople = (dish: Dish) => {
    setSelectedDish(dish);
    setSelectedPeople(dish.sharedBy);
    setAssignModalVisible(true);
  };

  const handleTogglePerson = (personId: string) => {
    if (selectedPeople.includes(personId)) {
      setSelectedPeople(selectedPeople.filter((id) => id !== personId));
    } else {
      setSelectedPeople([...selectedPeople, personId]);
    }
  };

  const handleSaveAssignment = () => {
    if (selectedPeople.length === 0) {
      Alert.alert(
        'No People Selected',
        'Please select at least one person for this dish'
      );
      return;
    }

    if (selectedDish) {
      setDishes(
        dishes.map((d) =>
          d.id === selectedDish.id ? { ...d, sharedBy: selectedPeople } : d
        )
      );
    }

    setAssignModalVisible(false);
    setSelectedDish(null);
    setSelectedPeople([]);
  };

  const handleRemoveDish = (dishId: string) => {
    setDishes(dishes.filter((d) => d.id !== dishId));
  };

  const handleContinue = () => {
    if (dishes.length === 0) {
      Alert.alert('No Dishes Added', 'Please add at least one dish');
      return;
    }

    const unassignedDishes = dishes.filter((d) => d.sharedBy.length === 0);
    if (unassignedDishes.length > 0) {
      Alert.alert(
        'Unassigned Dishes',
        `Please assign people to: ${unassignedDishes.map((d) => d.name).join(', ')}`
      );
      return;
    }

    setCurrentBill({
      ...currentBill,
      dishes,
    });

    router.push('/bill-summary');
  };

  const renderDish = ({ item }: { item: Dish }) => {
    const assignedPeople = people.filter((p) => item.sharedBy.includes(p.id));
    const isAssigned = item.sharedBy.length > 0;

    return (
      <View style={styles.dishCard}>
        <View style={styles.dishHeader}>
          <View style={styles.dishInfo}>
            <Text style={styles.dishName}>{item.name}</Text>
            <Text style={styles.dishPrice}>${item.price.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            onPress={() => handleRemoveDish(item.id)}
            style={styles.removeButton}
          >
            <Text style={styles.removeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {isAssigned ? (
          <TouchableOpacity
            style={styles.assignedContainer}
            onPress={() => handleAssignPeople(item)}
          >
            <Text style={styles.assignedLabel}>Shared by:</Text>
            <Text style={styles.assignedNames}>
              {assignedPeople.map((p) => p.name).join(', ')}
            </Text>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.unassignedContainer}
            onPress={() => handleAssignPeople(item)}
          >
            <Text style={styles.unassignedText}>⚠️ Tap to assign people</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.headerTop}>
          <Text style={styles.headerEmoji}>🍽️</Text>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Add Dishes</Text>
            <View style={styles.stepIndicator}>
              <View style={styles.stepDot} />
              <View style={styles.stepDot} />
              <View style={[styles.stepDot, styles.stepDotActive]} />
              <View style={styles.stepDot} />
            </View>
          </View>
        </View>
        <Text style={styles.subtitle}>Step 3 of 4</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.inputContainer}>
          <Button
            title="📸 Scan Receipt"
            variant="secondary"
            onPress={() => router.push('/scan-receipt')}
            style={styles.scanButton}
          />

          <View style={styles.dishInputRow}>
            <Input
              label="Dish Name"
              value={dishName}
              onChangeText={setDishName}
              placeholder="e.g. Xiao Long Bao"
              style={styles.dishNameInput}
            />
            <Input
              label="Price ($)"
              value={dishPrice}
              onChangeText={setDishPrice}
              placeholder="0.00"
              keyboardType="decimal-pad"
              style={styles.dishPriceInput}
            />
          </View>
          <Button
            title="Add Dish"
            onPress={handleAddDish}
            style={styles.addButton}
          />
        </View>

        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Dishes ({dishes.length})</Text>

          {dishes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🍽️</Text>
              <Text style={styles.emptyText}>
                No dishes added yet.{'\n'}Add all items from the bill.
              </Text>
            </View>
          ) : (
            <FlatList
              data={dishes}
              renderItem={renderDish}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
            />
          )}
        </View>
      </Animated.View>

      <View style={styles.footer}>
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
          disabled={dishes.length === 0}
        />
      </View>

      <Modal
        visible={assignModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAssignModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Who shared this dish?
            </Text>
            <Text style={styles.modalSubtitle}>
              {selectedDish?.name} (${selectedDish?.price.toFixed(2)})
            </Text>

            <ScrollView style={styles.peopleList}>
              {people.map((person) => {
                const isSelected = selectedPeople.includes(person.id);
                return (
                  <TouchableOpacity
                    key={person.id}
                    style={[
                      styles.personOption,
                      isSelected && styles.personOptionSelected,
                    ]}
                    onPress={() => handleTogglePerson(person.id)}
                  >
                    <Text
                      style={[
                        styles.personOptionText,
                        isSelected && styles.personOptionTextSelected,
                      ]}
                    >
                      {person.name}
                    </Text>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => {
                  setAssignModalVisible(false);
                  setSelectedDish(null);
                  setSelectedPeople([]);
                }}
                style={styles.modalCancelButton}
              />
              <Button
                title="Save"
                onPress={handleSaveAssignment}
                style={styles.modalSaveButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  headerEmoji: {
    fontSize: 32,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
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
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  scanButton: {
    width: '100%',
    marginBottom: 16,
  },
  dishInputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  dishNameInput: {
    flex: 2,
    marginBottom: 0,
  },
  dishPriceInput: {
    flex: 1,
    marginBottom: 0,
  },
  addButton: {
    width: '100%',
  },
  listContainer: {
    flex: 1,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  list: {
    gap: 12,
  },
  dishCard: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dishHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dishInfo: {
    flex: 1,
  },
  dishName: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  dishPrice: {
    fontSize: 18,
    color: Colors.accent,
    fontWeight: 'bold',
  },
  removeButton: {
    padding: 4,
  },
  removeButtonText: {
    fontSize: 20,
    color: Colors.error,
  },
  assignedContainer: {
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  assignedLabel: {
    fontSize: 12,
    color: Colors.success,
    marginBottom: 4,
  },
  assignedNames: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
    marginBottom: 4,
  },
  editText: {
    fontSize: 12,
    color: Colors.accent,
    textAlign: 'right',
  },
  unassignedContainer: {
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  unassignedText: {
    fontSize: 14,
    color: Colors.warning,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.backgroundSecondary,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  peopleList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  personOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  personOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  personOptionText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  personOptionTextSelected: {
    color: Colors.white,
  },
  checkmark: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: 'bold',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
  },
  modalSaveButton: {
    flex: 2,
  },
});
