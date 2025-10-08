import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import {useSelector} from 'react-redux';
import {Colors} from '../../constants/customStyles';

const {width} = Dimensions.get('window');

const ConfirmationModal = ({
  isVisible,
  onRequestClose,
  onConfirm,
  title = 'Confirmation',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Yes',
  cancelText = 'Cancel',
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
            style={[
              styles.button,
              {
                backgroundColor: isDarkMode
                  ? Colors.small_container_dark_bg
                  : '#F9F9F9',
                borderWidth: isDarkMode ? 0 : 1,   
                borderColor: isDarkMode ? 'transparent' : '#BDBDBD',
              },
            ]}
            onPress={onRequestClose}>
            <Text
              style={[
                styles.buttonText,
                { color: isDarkMode ? Colors.white : '#62808A' },
              ]}>
              {cancelText}
            </Text>
          </TouchableOpacity>


            <TouchableOpacity
              style={[styles.button, styles.logoutButton]}
              onPress={onConfirm}>
              <Text style={[styles.buttonText, styles.logoutButtonText]}>
                {confirmText}
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
    borderRadius: 20,
    padding: 20,
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
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 35,
    lineHeight: 26,
  },
  message: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#F9F9F9',
  },
  logoutButton: {
    backgroundColor: Colors.primary,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  cancelButtonText: {
    color: '#666',
  },
  logoutButtonText: {
    color: 'white',
  },
});

export default ConfirmationModal;
