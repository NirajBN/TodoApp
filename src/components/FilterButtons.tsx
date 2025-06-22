import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {FilterButtonsProps, FilterType} from '../types';

const FilterButtons: React.FC<FilterButtonsProps> = ({
  currentFilter,
  onFilterChange,
}) => {
  const filters: FilterType[] = ['All', 'Active', 'Done'];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Filter:</Text>
      <View style={styles.buttonContainer}>
        {filters.map(filter => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              {
                backgroundColor: currentFilter === filter ? '#000' : '#fff',
                borderColor: '#000',
              },
            ]}
            onPress={() => onFilterChange(filter)}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.filterButtonText,
                {color: currentFilter === filter ? '#fff' : '#000'},
              ]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
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
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 6,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default FilterButtons;

