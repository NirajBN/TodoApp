import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import {useDispatch} from 'react-redux';
import {editTodo} from '../store/todoSlice';
import {TodoItemProps} from '../types';
import {AppDispatch} from '../store/store';

const TodoItem: React.FC<TodoItemProps> = React.memo(
  ({todo, onToggle, onDelete}) => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editText, setEditText] = useState<string>(todo.title);
    const dispatch = useDispatch<AppDispatch>();
    // Handle edit save
    const handleSave = useCallback(() => {
      const trimmedText = editText.trim();

      if (!trimmedText) {
        Alert.alert('Error', 'Todo title cannot be empty');
        return;
      }

      if (trimmedText !== todo.title) {
        dispatch(editTodo({id: todo.id, title: trimmedText}));
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
      onToggle(todo.id);
    }, [onToggle, todo.id]);

    const handleDelete = useCallback(() => {
      onDelete(todo.id, todo.title);
    }, [onDelete, todo.id, todo.title]);

    const handleEditPress = useCallback(() => {
      setIsEditing(true);
    }, []);

    const handleLongPress = useCallback(() => {
      setIsEditing(true);
    }, []);

    const handleEditTextChange = useCallback((text: string) => {
      setEditText(text);
    }, []);

    return (
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Checkbox */}
          <TouchableOpacity
            style={[
              styles.checkbox,
              {backgroundColor: todo.completed ? '#000' : '#fff'},
            ]}
            onPress={handleToggle}
            activeOpacity={0.7}>
            {todo.completed && <Text style={styles.checkmark}>✓</Text>}
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
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.todoText,
                    {
                      textDecorationLine: todo.completed
                        ? 'line-through'
                        : 'none',
                    },
                    {color: todo.completed ? '#999' : '#333'},
                  ]}>
                  {todo.title}
                </Text>
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
                  activeOpacity={0.7}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  activeOpacity={0.7}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.normalActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={handleEditPress}
                  activeOpacity={0.7}>
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDelete}
                  activeOpacity={0.7}>
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
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
    shadowOffset: {width: 0, height: 2},
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
  todoText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
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
