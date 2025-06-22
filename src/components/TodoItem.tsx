import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { editTodo } from '../store/todoSlice';
import { TodoItemProps } from '../types';
import { AppDispatch } from '../store/store';

const TodoItem: React.FC<TodoItemProps> = React.memo(
  ({ todo, onToggle, onDelete }) => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editText, setEditText] = useState<string>(todo.title);
    const dispatch = useDispatch<AppDispatch>();

    // Animated values
    const slideX = useSharedValue(0);
    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);
    const checkboxScale = useSharedValue(todo.completed ? 1 : 0.8);
    const strikethroughProgress = useSharedValue(todo.completed ? 1 : 0);

    // Initialize animations on mount
    useEffect(() => {
      slideX.value = withSpring(0, { damping: 15, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 15, stiffness: 100 });
    }, [slideX, opacity, scale]);

    // Update animations when todo completion status changes
    useEffect(() => {
      checkboxScale.value = withSpring(todo.completed ? 1.1 : 0.8, {
        damping: 12,
        stiffness: 150,
      });
      strikethroughProgress.value = withTiming(todo.completed ? 1 : 0, {
        duration: 300,
      });
    }, [todo.completed, checkboxScale, strikethroughProgress]);

    // Handle edit save
    const handleSave = useCallback(() => {
      const trimmedText = editText.trim();

      if (!trimmedText) {
        Alert.alert('Error', 'Todo title cannot be empty');
        return;
      }

      if (trimmedText !== todo.title) {
        dispatch(editTodo({ id: todo.id, title: trimmedText }));
      }

      setIsEditing(false);
    }, [editText, todo.id, todo.title, dispatch]);

    // Handle edit cancel
    const handleCancel = useCallback(() => {
      setEditText(todo.title);
      setIsEditing(false);
    }, [todo.title]);

    // Format date for display
    const formatDate = useCallback((dateString: string): string => {
      const date = new Date(dateString);
      return (
        date.toLocaleDateString() +
        ' ' +
        date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    }, []);

    const handleToggle = useCallback(() => {
      // Animate checkbox with bounce effect
      checkboxScale.value = withSequence(
        withSpring(1.3, { damping: 8, stiffness: 200 }),
        withSpring(todo.completed ? 0.8 : 1.1, { damping: 12, stiffness: 150 }),
      );

      // Animate text strikethrough
      strikethroughProgress.value = withTiming(!todo.completed ? 1 : 0, {
        duration: 300,
      });

      // Add a subtle scale animation to the entire item
      scale.value = withSequence(
        withSpring(0.98, { damping: 15, stiffness: 200 }),
        withSpring(1, { damping: 15, stiffness: 200 }),
      );

      onToggle(todo.id);
    }, [
      onToggle,
      todo.id,
      todo.completed,
      checkboxScale,
      strikethroughProgress,
      scale,
    ]);

    const handleDelete = useCallback(() => {
      // Animate deletion: slide out and fade
      slideX.value = withTiming(-300, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
      scale.value = withTiming(0.8, { duration: 300 }, finished => {
        if (finished) {
          runOnJS(onDelete)(todo.id, todo.title);
        }
      });
    }, [onDelete, todo.id, todo.title, slideX, opacity, scale]);

    const handleEditPress = useCallback(() => {
      setIsEditing(true);
    }, []);

    const handleLongPress = useCallback(() => {
      // Add haptic feedback animation
      scale.value = withSequence(
        withSpring(0.95, { damping: 15, stiffness: 200 }),
        withSpring(1, { damping: 15, stiffness: 200 }),
      );
      setIsEditing(true);
    }, [scale]);

    const handleEditTextChange = useCallback((text: string) => {
      setEditText(text);
    }, []);

    // Animated styles
    const animatedContainerStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: slideX.value }, { scale: scale.value }],
        opacity: opacity.value,
      };
    }, [slideX, scale, opacity]);

    const animatedCheckboxStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: checkboxScale.value }],
      };
    }, [checkboxScale]);

    const animatedTextStyle = useAnimatedStyle(() => {
      const textOpacity = interpolate(
        strikethroughProgress.value,
        [0, 1],
        [1, 0.6],
        Extrapolation.CLAMP,
      );

      return {
        opacity: textOpacity,
      };
    }, [strikethroughProgress]);

    const animatedStrikethroughStyle = useAnimatedStyle(() => {
      const width = interpolate(
        strikethroughProgress.value,
        [0, 1],
        [0, 100],
        Extrapolation.CLAMP,
      );

      return {
        width: `${width}%`,
      };
    }, [strikethroughProgress]);

    return (
      <Animated.View style={[styles.container, animatedContainerStyle]}>
        <View style={styles.content}>
          {/* Checkbox */}
          <TouchableOpacity onPress={handleToggle} activeOpacity={0.7}>
            <Animated.View
              style={[
                styles.checkbox,
                { backgroundColor: todo.completed ? '#000' : '#fff' },
                animatedCheckboxStyle,
              ]}
            >
              {todo.completed && <Text style={styles.checkmark}>✓</Text>}
            </Animated.View>
          </TouchableOpacity>

          {/* Todo Content */}
          <View style={styles.todoContent}>
            {isEditing ? (
              <TextInput
                style={styles.editInput}
                value={editText}
                onChangeText={handleEditTextChange}
                autoFocus
                multiline
                onBlur={handleSave}
                onSubmitEditing={handleSave}
              />
            ) : (
              <TouchableOpacity
                onLongPress={handleLongPress}
                activeOpacity={0.7}
              >
                <View style={styles.textContainer}>
                  <Animated.Text
                    style={[
                      styles.todoText,
                      { color: todo.completed ? '#999' : '#333' },
                      animatedTextStyle,
                    ]}
                  >
                    {todo.title}
                  </Animated.Text>
                  {todo.completed && (
                    <Animated.View
                      style={[styles.strikethrough, animatedStrikethroughStyle]}
                    />
                  )}
                </View>
              </TouchableOpacity>
            )}

            {/* Timestamps */}
            <View style={styles.timestampContainer}>
              <Text style={styles.timestamp}>
                Created: {formatDate(todo.created_at)}
              </Text>
              {todo.updated_at !== todo.created_at && (
                <Text style={styles.timestamp}>
                  Updated: {formatDate(todo.updated_at)}
                </Text>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {isEditing ? (
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  activeOpacity={0.7}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.normalActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={handleEditPress}
                  activeOpacity={0.7}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDelete}
                  activeOpacity={0.7}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  todoContent: {
    flex: 1,
    marginRight: 12,
  },
  textContainer: {
    position: 'relative',
  },
  todoText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  strikethrough: {
    position: 'absolute',
    top: 11,
    left: 0,
    height: 1,
    backgroundColor: '#999',
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
    marginBottom: 8,
    minHeight: 40,
  },
  timestampContainer: {
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  actionButtons: {
    justifyContent: 'center',
  },
  editActions: {
    flexDirection: 'column',
  },
  normalActions: {
    flexDirection: 'column',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginBottom: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginBottom: 4,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default TodoItem;
