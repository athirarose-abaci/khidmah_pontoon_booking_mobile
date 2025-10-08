import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import {useSelector} from 'react-redux';
import {Colors} from '../../constants/customStyles';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

const {width} = Dimensions.get('window');

const ConfirmationModal = ({
  isVisible,
  onRequestClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be done. The Boat will be deleted',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  showWarningIcon = true,
  warningIconName = 'warning',
  warningIconColor = '#FF4444',
  warningIconSize = 24,
  warningIconComponent = null, 
  confirmIconName = 'delete',
  confirmIconColor = 'white',
  confirmIconSize = 18,
  showConfirmIcon = true,
  confirmIconComponent = null, 
}) => {
  const isDarkMode = useSelector(state => state.themeSlice?.isDarkMode);

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onRequestClose}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            {backgroundColor: isDarkMode ? Colors.container_dark_bg : Colors.white},
          ]}>
          
          {showWarningIcon && (
            <View style={styles.warningIconContainer}>
              {warningIconComponent ? (
                warningIconComponent
              ) : (
                <MaterialIcons 
                  name={warningIconName} 
                  size={warningIconSize} 
                  color={warningIconColor} 
                />
              )}
            </View>
          )}
          
          <Text style={[styles.title,{color: isDarkMode ? '#4FB7C5' : Colors.font_primary}]}>{title}</Text>
          <Text
            style={[
              styles.message,
              {color: isDarkMode ? Colors.white : '#666'},
            ]}>
            {message}
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={onConfirm}>
              {showConfirmIcon && (
                confirmIconComponent ? (
                  <View style={styles.buttonIcon}>
                    {confirmIconComponent}
                  </View>
                ) : (
                  <MaterialIcons 
                    name={confirmIconName} 
                    size={confirmIconSize} 
                    color={confirmIconColor} 
                    style={styles.buttonIcon} 
                  />
                )
              )}
              <Text style={[styles.buttonText, styles.deleteButtonText]}>
                {confirmText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
                {
                  backgroundColor: isDarkMode
                    ? Colors.small_container_dark_bg
                    : Colors.white,
                  borderWidth: isDarkMode ? 0 : 1,   
                  borderColor: isDarkMode ? 'transparent' : '#4CAF50',
                },
              ]}
              onPress={onRequestClose}>
              <Text
                style={[
                  styles.buttonText,
                  styles.cancelButtonText,
                  { color: isDarkMode ? Colors.white : '#4CAF50' },
                ]}>
                {cancelText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
    borderRadius: 25,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  warningIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFE6E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
    lineHeight: 26,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF4444',
  },
  cancelButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
  deleteButtonText: {
    color: 'white',
  },
  cancelButtonText: {
    color: Colors.primary,
  },
});

export default ConfirmationModal;
