import React, {useEffect, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ListRenderItem,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {StackNavigationProp} from '@react-navigation/stack';
import {
  fetchTodosAsync,
  toggleTodo,
  deleteTodo,
  setFilter,
  setSortBy,
  clearError,
} from '../store/todoSlice';
import TodoItem from '../components/TodoItem';
import FilterButtons from '../components/FilterButtons';
import SortButtons from '../components/SortButtons';
import {
  Todo,
  RootStackParamList,
  FilterType,
  SortType,
} from '../types';
import { AppDispatch, RootState } from '../store/store';
import { SafeAreaView } from 'react-native-safe-area-context';

type MainScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'MainScreen'
>;

interface Props {
  navigation: MainScreenNavigationProp;
}

const MainScreen: React.FC<Props> = ({navigation}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {items, loading, error, filter, sortBy} = useSelector(
    (state: RootState) => state.todos,
  );

  // Fetch todos on component mount
  useEffect(() => {
    dispatch(fetchTodosAsync());
  }, [dispatch]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      if (error) {
        dispatch(clearError());
      }
    };
  }, [dispatch, error]);

  // Memoized filtered and sorted todos for performance
  const filteredAndSortedTodos = useMemo((): Todo[] => {
    let filtered: Todo[] = items;

    // Apply filter
    switch (filter) {
      case 'Active':
        filtered = items.filter(todo => !todo.completed);
        break;
      case 'Done':
        filtered = items.filter(todo => todo.completed);
        break;
      default:
        filtered = items;
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'mostRecent') {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      } else {
        return a.id - b.id;
      }
    });

    return sorted;
  }, [items, filter, sortBy]);

  // Memoized counts for performance
  const counts = useMemo(
    () => ({
      total: items.length,
      completed: items.filter(todo => todo.completed).length,
    }),
    [items],
  );

  // Handle todo toggle with useCallback for performance
  const handleToggleTodo = useCallback(
    (id: number) => {
      dispatch(toggleTodo(id));
    },
    [dispatch],
  );

  // Handle todo deletion with confirmation
  const handleDeleteTodo = useCallback(
    (id: number, title: string) => {
      Alert.alert(
        'Delete Todo',
        `Are you sure you want to delete "${title}"?`,
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => dispatch(deleteTodo(id)),
          },
        ],
      );
    },
    [dispatch],
  );

  // Handle filter change
  const handleFilterChange = useCallback(
    (newFilter: FilterType) => {
      dispatch(setFilter(newFilter));
    },
    [dispatch],
  );

  // Handle sort change
  const handleSortChange = useCallback(
    (newSort: SortType) => {
      dispatch(setSortBy(newSort));
    },
    [dispatch],
  );

  // Render todo item with memoization
  const renderTodoItem: ListRenderItem<Todo> = useCallback(
    ({item}) => (
      <TodoItem
        todo={item}
        onToggle={handleToggleTodo}
        onDelete={handleDeleteTodo}
      />
    ),
    [handleToggleTodo, handleDeleteTodo],
  );

  // Handle retry
  const handleRetry = useCallback(() => {
    dispatch(fetchTodosAsync());
  }, [dispatch]);

  // Navigate to add todo screen
  const navigateToAddTodo = useCallback(() => {
    navigation.navigate('AddTodoScreen');
  }, [navigation]);

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer} edges={['left', 'right', 'bottom']}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading todos...</Text>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.centerContainer} edges={['left', 'right', 'bottom']}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={handleRetry}
          activeOpacity={0.8}>
          <Text style={styles.retryButtonText}>Retry</Text>
        
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      {/* Header with counts */}
     <View style={styles.header}>
        <Text style={styles.headerText}>
          Total: {counts.total} | Completed: {counts.completed}
        </Text>
      </View>

      {/* Filter and Sort Controls */}
      <View style={styles.controlsContainer}>
        <FilterButtons
          currentFilter={filter}
          onFilterChange={handleFilterChange}
        />
        <SortButtons currentSort={sortBy} onSortChange={handleSortChange} />
      </View>

      {/* Todo List */}
      <FlatList
        data={filteredAndSortedTodos}
        keyExtractor={(item: Todo) => item.id.toString()}
        renderItem={renderTodoItem}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {filter === 'All'
                ? 'No todos yet'
                : `No ${filter.toLowerCase()} todos`}
            </Text>
          </View>
        }
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={20}
        getItemLayout={(data, index) => ({
          length: 80,
          offset: 80 * index,
          index,
        })}
      />

      {/* Add Todo Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={navigateToAddTodo}
        activeOpacity={0.8}>
        <Text style={styles.addButtonText}>+</Text>     
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  controlsContainer: {
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  list: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default MainScreen;