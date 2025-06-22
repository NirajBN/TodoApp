import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

interface ModalButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: ModalButton[];
  onClose: () => void;
}

const CustomModal= ({
  visible,
  title,
  message,
  buttons,
  onClose,
}:CustomModalProps) => {
  const getButtonStyle = (style: string = 'default') => {
    switch (style) {
      case 'cancel':
        return [styles.button, styles.cancelButton];
      case 'destructive':
        return [styles.button, styles.destructiveButton];
      default:
        return [styles.button, styles.defaultButton];
    }
  };

  const getButtonTextStyle = (style: string = 'default') => {
    switch (style) {
      case 'cancel':
        return [styles.buttonText, styles.cancelButtonText];
      case 'destructive':
        return [styles.buttonText, styles.destructiveButtonText];
      default:
        return [styles.buttonText, styles.defaultButtonText];
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            <View style={styles.buttonContainer}>
              {buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={getButtonStyle(button.style)}
                  onPress={button.onPress}
                  activeOpacity={0.8}
                >
                  <Text style={getButtonTextStyle(button.style)}>
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: Dimensions.get('window').width * 0.85,
    maxWidth: 300,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    gap: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  defaultButton: {
    backgroundColor: '#000',
  },
  cancelButton: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  destructiveButton: {
    backgroundColor: '#ff3b30',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  defaultButtonText: {
    color: '#fff',
  },
  cancelButtonText: {
    color: '#666',
  },
  destructiveButtonText: {
    color: '#fff',
  },
});

export default CustomModal;
