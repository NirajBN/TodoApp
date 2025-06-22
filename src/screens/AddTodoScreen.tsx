import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useDispatch} from 'react-redux';
import {StackNavigationProp} from '@react-navigation/stack';
import {addTodo} from '../store/todoSlice';
import { RootStackParamList} from '../types';
import { AppDispatch } from '../store/store';

type AddTodoScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'AddTodoScreen'
>;

interface Props {
  navigation: AddTodoScreenNavigationProp;
}

const AddTodoScreen: React.FC<Props> = ({navigation}) => {
  const [title, setTitle] = useState<string>('');
  const dispatch = useDispatch<AppDispatch>();

  // Handle adding new todo with validation
  const handleAddTodo = useCallback(() => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      Alert.alert('Error', 'Please enter a todo title');
      return;
    }

    if (trimmedTitle.length > 100) {
      Alert.alert('Error', 'Todo title must be less than 100 characters');
      return;
    }

    // Dispatch add todo action
    dispatch(addTodo({title: trimmedTitle}));

    // Show success feedback
    Alert.alert('Success', 'Todo added successfully!', [
      {text: 'OK', onPress: () => navigation.goBack()},
    ]);

    // Clear input
    setTitle('');
  }, [title, dispatch, navigation]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleTitleChange = useCallback((text: string) => {
    setTitle(text);
  }, []);

  const isAddDisabled = !title.trim();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <Text style={styles.label}>Todo Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={handleTitleChange}
          placeholder="Enter your todo..."
          placeholderTextColor="#999"
          multiline
          maxLength={100}
          textAlignVertical="top"
          autoFocus
        />

        <Text style={styles.charCount}>{title.length}/100 characters</Text>

        <TouchableOpacity
          style={[styles.addButton, {opacity: isAddDisabled ? 0.5 : 1}]}
          onPress={handleAddTodo}
          disabled={isAddDisabled}
          activeOpacity={0.8}>
          <Text style={styles.addButtonText}>Add Todo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleGoBack}
          activeOpacity={0.8}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  input: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    color: '#333',
  },
  charCount: {
    textAlign: 'right',
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 24,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f8f8f8',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AddTodoScreen;