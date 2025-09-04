import React, { useEffect, useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { StackNavigationProp } from '@react-navigation/stack';
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
import CustomModal from '../components/CustomModal';
import { Todo, RootStackParamList, FilterType, SortType } from '../types';
import { AppDispatch, RootState } from '../store/store';
import { SafeAreaView } from 'react-native-safe-area-context';

type MainScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'MainScreen'
>;

interface Props {
  navigation: MainScreenNavigationProp;
}

interface ModalState {
  visible: boolean;
  title: string;
  message: string;
}

const MainScreen = ({ navigation }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error, filter, sortBy } = useSelector(
    (state: RootState) => state.todos,
  );

  const [modal, setModal] = useState<ModalState>({
    visible: false,
    title: '',
    message: '',
  });

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

  // Show modal helper
  const showModal = useCallback((title: string, message: string) => {
    setModal({
      visible: true,
      title,
      message,
    });
  }, []);

  // Hide modal helper
  const hideModal = useCallback(() => {
    setModal(prev => ({ ...prev, visible: false }));
  }, []);

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
      active: items.filter(todo => !todo.completed).length,
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

  // Handle todo deletion - now just dispatches delete action
  const handleDeleteTodo = useCallback(
    (id: number) => {
      dispatch(deleteTodo(id));
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
    ({ item }) => (
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

  // Handle error display
  const handleShowError = useCallback(() => {
    if (error) {
      showModal('Error', error);
    }
  }, [error, showModal]);

  // Show error modal when error occurs
  useEffect(() => {
    if (error) {
      handleShowError();
    }
  }, [error, handleShowError]);

  // Get modal buttons for error display
  const getModalButtons = () => {
    return [
      {
        text: 'OK',
        onPress: hideModal,
        style: 'default' as const,
      },
    ];
  };

  // Get item layout for FlatList optimization
  const getItemLayout = useCallback(
    (data: Todo[] | null | undefined, index: number) => ({
      length: 120, // Estimated item height
      offset: 120 * index,
      index,
    }),
    [],
  );

  // Key extractor for FlatList
  const keyExtractor = useCallback((item: Todo) => item.id.toString(), []);

  // Loading state
  if (loading) {
    return (
      <SafeAreaView
        style={styles.centerContainer}
        edges={['left', 'right', 'bottom']}
      >
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading todos...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      {/* Header with counts */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Total: {counts.total} | Active: {counts.active} | Completed:{' '}
          {counts.completed}
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
        keyExtractor={keyExtractor}
        renderItem={renderTodoItem}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {filter === 'All'
                ? 'No todos yet. Tap + to add your first todo!'
                : `No ${filter.toLowerCase()} todos`}
            </Text>
          </View>
        }
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={15}
        updateCellsBatchingPeriod={50}
        getItemLayout={getItemLayout}
        // Add content container style for better spacing
        contentContainerStyle={
          filteredAndSortedTodos.length === 0
            ? styles.emptyListContainer
            : { paddingBottom: 84,}
        }
      />

      {/* Add Todo Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={navigateToAddTodo}
        activeOpacity={0.8}
        accessibilityLabel="Add new todo"
        accessibilityRole="button"
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* Error Modal - Only for errors, not for delete confirmation */}
      <CustomModal
        visible={modal.visible}
        title={modal.title}
        message={modal.message}
        buttons={getModalButtons()}
        onClose={hideModal}
      />
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
    paddingHorizontal: 20,
    paddingTop: 100,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
    shadowOffset: { width: 0, height: 4 },
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
