import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useDispatch } from 'react-redux';
import BouncyCheckbox from "react-native-bouncy-checkbox";
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
import CustomModal from '../components/CustomModal';

interface ModalState {
  visible: boolean;
  type: 'error' | 'confirm';
  title: string;
  message: string;
}

const MAX_CHARACTERS = 100;

const TodoItem = React.memo(({ todo, onToggle, onDelete }: TodoItemProps) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editText, setEditText] = useState<string>(todo.title);
  const [modal, setModal] = useState<ModalState>({
    visible: false,
    type: 'error',
    title: '',
    message: '',
  });
  const [textLayout, setTextLayout] = useState({ width: 0, height: 0, lineHeight: 22 });

  const dispatch = useDispatch<AppDispatch>();

  // Animated values
  const slideX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const checkboxScale = useSharedValue(1);
  const strikethroughProgress = useSharedValue(todo.completed ? 1 : 0);

  // Initialize animations on mount
  useEffect(() => {
    slideX.value = withSpring(0, { damping: 15, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 300 });
    scale.value = withSpring(1, { damping: 15, stiffness: 100 });
  }, [slideX, opacity, scale]);

  // Update animations when todo completion status changes
  useEffect(() => {
    checkboxScale.value = withSpring(1, {
      damping: 12,
      stiffness: 150,
    });
    strikethroughProgress.value = withTiming(todo.completed ? 1 : 0, {
      duration: 300,
    });
  }, [todo.completed, checkboxScale, strikethroughProgress]);

  // Calculate number of lines based on text layout
  const getNumberOfLines = useCallback((width: number, height: number, lineHeight: number) => {
    if (height === 0) return 1;
    return Math.round(height / lineHeight);
  }, []);

  // Show modal helper
  const showModal = useCallback(
    (type: 'error' | 'confirm', title: string, message: string) => {
      setModal({
        visible: true,
        type,
        title,
        message,
      });
    },
    [],
  );

  // Hide modal helper
  const hideModal = useCallback(() => {
    setModal(prev => ({ ...prev, visible: false }));
  }, []);

  // Handle edit save
  const handleSave = useCallback(() => {
    const trimmedText = editText.trim();

    if (!trimmedText) {
      showModal('error', 'Error', 'Todo title cannot be empty');
      return;
    }

    if (trimmedText !== todo.title) {
      dispatch(editTodo({ id: todo.id, title: trimmedText }));
    }

    setIsEditing(false);
  }, [editText, todo.id, todo.title, dispatch, showModal]);

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

  const handleToggle = useCallback((isChecked: boolean) => {
    // Animate text strikethrough
    strikethroughProgress.value = withTiming(isChecked ? 1 : 0, {
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
    strikethroughProgress,
    scale,
  ]);

  // Confirm delete action
  const confirmDelete = useCallback(() => {
    hideModal();
    // Animate deletion: slide out and fade
    slideX.value = withTiming(-300, { duration: 300 });
    opacity.value = withTiming(0, { duration: 300 });
    scale.value = withTiming(0.8, { duration: 300 }, finished => {
      if (finished) {
        runOnJS(onDelete)(todo.id, todo.title);
      }
    });
  }, [onDelete, todo.id, todo.title, slideX, opacity, scale, hideModal]);

  const handleDelete = useCallback(() => {
    showModal(
      'confirm',
      'Confirm Delete',
      `Are you sure you want to delete "${
        todo.title.length > 30
          ? todo.title.substring(0, 30) + '...'
          : todo.title
      }"?`,
    );
  }, [showModal, todo.title]);

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
    if (text.length <= MAX_CHARACTERS) {
      setEditText(text);
    }
  }, []);

  // Handle text layout measurement
  const handleTextLayout = useCallback((event) => {
    const { width, height } = event.nativeEvent.layout;
    setTextLayout({ width, height, lineHeight: 22 });
  }, []);

  // Get modal buttons based on type
  const getModalButtons = () => {
    if (modal.type === 'confirm') {
      return [
        {
          text: 'Delete',
          onPress: confirmDelete,
          style: 'destructive' as const,
        },
        {
          text: 'Cancel',
          onPress: hideModal,
          style: 'cancel' as const,
        },
      ];
    } else {
      return [
        {
          text: 'OK',
          onPress: hideModal,
          style: 'default' as const,
        },
      ];
    }
  };

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
    <>
      <Animated.View style={[styles.container, animatedContainerStyle]}>
        <View style={styles.content}>
          {/* Checkbox */}
          {!isEditing && (
            <Animated.View style={[styles.checkboxContainer, animatedCheckboxStyle]}>
              <BouncyCheckbox
                isChecked={todo.completed}
                onPress={handleToggle}
                size={24}
                fillColor="#000000"
                unfillColor="#FFFFFF"
                text=""
                iconStyle={{ 
                  borderColor: "#000000", 
                  borderRadius: 6,
                  borderWidth: 2 
                }}
                innerIconStyle={{ 
                  borderWidth: 2, 
                  borderRadius: 4 
                }}
                textStyle={{ display: 'none' }}
                bounceEffect={1.3}
                bounceFriction={3}
                bounceVelocityIn={0.1}
                bounceVelocityOut={0.4}
                useNativeDriver={true}
                disableBuiltInState={false}
              />
            </Animated.View>
          )}

          {/* Todo Content */}
          <View style={styles.todoContent}>
            {isEditing ? (
              <View>
                <TextInput
                  style={styles.editInput}
                  value={editText}
                  onChangeText={handleEditTextChange}
                  autoFocus
                  multiline
                  maxLength={MAX_CHARACTERS}
                  onBlur={handleSave}
                  onSubmitEditing={handleSave}
                />
                <Text style={styles.characterCounter}>
                  {editText.length}/{MAX_CHARACTERS}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                onLongPress={handleLongPress}
                activeOpacity={1}
              >
                <View style={styles.textContainer}>
                  <Animated.Text
                    style={[
                      styles.todoText,
                      { color: todo.completed ? '#999' : '#333' },
                      animatedTextStyle,
                    ]}
                    onLayout={handleTextLayout}
                  >
                    {todo.title}
                  </Animated.Text>
                  {todo.completed && textLayout.height > 0 && (
                    <>
                      {Array.from({ 
                        length: getNumberOfLines(textLayout.width, textLayout.height, textLayout.lineHeight) 
                      }, (_, index) => (
                        <Animated.View
                          key={index}
                          style={[
                            styles.strikethrough,
                            {
                              top: 11 + (index * textLayout.lineHeight),
                            },
                            animatedStrikethroughStyle,
                          ]}
                        />
                      ))}
                    </>
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

      <CustomModal
        visible={modal.visible}
        title={modal.title}
        message={modal.message}
        buttons={getModalButtons()}
        onClose={hideModal}
      />
    </>
  );
});

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
  checkboxContainer: {
    marginRight: 12,
    marginTop: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todoContent: {
    flex: 1,
    marginRight: 12,
  },
  textContainer: {
    position: 'relative',
    alignSelf: 'stretch',
  },
  todoText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  strikethrough: {
    position: 'absolute',
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
    marginBottom: 4,
    minHeight: 40,
  },
  characterCounter: {
    fontSize: 11,
    color: '#666',
    textAlign: 'right',
    marginBottom: 4,
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