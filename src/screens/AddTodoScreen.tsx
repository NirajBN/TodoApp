import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { StackNavigationProp } from '@react-navigation/stack';
import { addTodo } from '../store/todoSlice';
import { RootStackParamList } from '../types';
import { AppDispatch } from '../store/store';
import CustomModal from '../components/CustomModal';

type AddTodoScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'AddTodoScreen'
>;

interface Props {
  navigation: AddTodoScreenNavigationProp;
}

interface ModalState {
  visible: boolean;
  type: 'error' | 'success';
  title: string;
  message: string;
}

const AddTodoScreen: React.FC<Props> = ({ navigation }) => {
  const [title, setTitle] = useState<string>('');
  const [modal, setModal] = useState<ModalState>({
    visible: false,
    type: 'error',
    title: '',
    message: '',
  });

  const dispatch = useDispatch<AppDispatch>();

  // Show modal helper
  const showModal = useCallback(
    (type: 'error' | 'success', title: string, message: string) => {
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

  // Handle adding new todo with validation
  const handleAddTodo = useCallback(() => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      showModal('error', 'Error', 'Please enter a todo title');
      return;
    }

    if (trimmedTitle.length > 100) {
      showModal(
        'error',
        'Error',
        'Todo title must be less than 100 characters',
      );
      return;
    }

    // Dispatch add todo action
    dispatch(addTodo({ title: trimmedTitle }));

    // Show success feedback
    showModal('success', 'Success', 'Todo added successfully!');

    // Clear input
    setTitle('');
  }, [title, dispatch, showModal]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleTitleChange = useCallback((text: string) => {
    setTitle(text);
  }, []);

  const handleSuccessModalClose = useCallback(() => {
    hideModal();
    navigation.goBack();
  }, [hideModal, navigation]);

  const isAddDisabled = !title.trim();

  // Get modal buttons based on type
  const getModalButtons = () => {
    if (modal.type === 'success') {
      return [
        {
          text: 'OK',
          onPress: handleSuccessModalClose,
          style: 'default' as const,
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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
          style={[styles.addButton, { opacity: isAddDisabled ? 0.5 : 1 }]}
          onPress={handleAddTodo}
          disabled={isAddDisabled}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>Add Todo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleGoBack}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <CustomModal
        visible={modal.visible}
        title={modal.title}
        message={modal.message}
        buttons={getModalButtons()}
        onClose={hideModal}
      />
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
