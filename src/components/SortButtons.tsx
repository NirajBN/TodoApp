// ===== src/components/SortButtons.tsx =====
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SortButtonsProps, SortType } from '../types';

const SortButtons = ({ currentSort, onSortChange }: SortButtonsProps) => {
  const sortOptions: { key: SortType; label: string }[] = [
    { key: 'mostRecent', label: 'Most Recent' },
    { key: 'id', label: 'By ID' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Sort by:</Text>
      <View style={styles.buttonContainer}>
        {sortOptions.map(option => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.sortButton,
              {
                backgroundColor: currentSort === option.key ? '#000' : '#fff',
                borderColor: '#000',
              },
            ]}
            onPress={() => onSortChange(option.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.sortButtonText,
                { color: currentSort === option.key ? '#fff' : '#000' },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sortButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 6,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SortButtons;
