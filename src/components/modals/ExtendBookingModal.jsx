import React, { useState } from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet, TextInput } from 'react-native';
import { Colors } from '../../constants/customStyles';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import AbaciLoader from '../AbaciLoader';
import { useSelector } from 'react-redux';

const ExtendBookingModal = ({
  visible,
  onClose,
  onExtend,
  bookingItem,
  extending,
}) => {
  const [extensionHours, setExtensionHours] = useState('');
  const [extensionMinutes, setExtensionMinutes] = useState('');
  const [error, setError] = useState(null);
  const isDarkMode = useSelector(state => state.themeSlice?.isDarkMode);

  const handleSave = () => {
    const h = Math.max(0, parseInt(extensionHours, 10) || 0);
    const mRaw = parseInt(extensionMinutes, 10) || 0;

    const m = Math.min(59, Math.max(0, mRaw));

    const pad2 = (n) => String(n).padStart(2, '0');
    const hh = pad2(h);
    const mm = pad2(m);

    if (h === 0 && m === 0) {
      setError('Please enter hours or minutes');
      return;
    }

    const ss = '00';
    onExtend(bookingItem?.id, hh, mm, ss);
    setExtensionHours('');
    setExtensionMinutes('');
    setError(null);
    onClose();
  };

  const handleClose = () => {
    setExtensionHours('');
    setExtensionMinutes('');
    setError(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: isDarkMode ? Colors.dark_container : Colors.white }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="boat-outline" size={20} color={Colors.primary} />
                <Ionicons name="time" size={12} color={Colors.primary} style={styles.timeIcon} />
              </View>
              <Text style={[styles.modalTitle, { color: isDarkMode ? Colors.white : Colors.heading_font }]}>Extend Booking</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.divider} />

          {/* Content */}
          <View style={styles.content}>
            <Text style={[styles.label, { color: isDarkMode ? Colors.label_dark : Colors.label_light }]}>Extension Time</Text>
            <View style={styles.timeInputsContainer}>
              <View style={[styles.timeInputWrapper, error && styles.inputError, { 
                backgroundColor: isDarkMode ? Colors.size_bg_dark : Colors.bg_color,
                borderColor: isDarkMode ? Colors.input_border_dark : Colors.border_line
              }]}>
                <TextInput
                  style={[styles.timeInput, { color: isDarkMode ? Colors.white : Colors.black }]}
                  value={extensionHours}
                  onChangeText={(text) => { setExtensionHours(text); if (error) setError(null); }}
                  placeholder="00"
                  placeholderTextColor={isDarkMode ? Colors.font_gray : '#999'}
                  keyboardType="numeric"
                  maxLength={2}
                />
                <Text style={[styles.timeLabel, { color: isDarkMode ? Colors.font_gray : Colors.font_gray }]}>hrs</Text>
              </View>
              
              <View style={[styles.timeInputWrapper, error && styles.inputError, { 
                backgroundColor: isDarkMode ? Colors.size_bg_dark : Colors.bg_color,
                borderColor: isDarkMode ? Colors.input_border_dark : Colors.border_line
              }]}>
                <TextInput
                  style={[styles.timeInput, { color: isDarkMode ? Colors.white : Colors.black }]}
                  value={extensionMinutes}
                  onChangeText={(text) => { setExtensionMinutes(text); if (error) setError(null); }}
                  placeholder="00"
                  placeholderTextColor={isDarkMode ? Colors.font_gray : '#999'}
                  keyboardType="numeric"
                  maxLength={2}
                />
                <Text style={[styles.timeLabel, { color: isDarkMode ? Colors.font_gray : Colors.font_gray }]}>min</Text>
              </View>
            </View>
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Ionicons name="save" size={18} color={Colors.white} style={styles.saveIcon} />
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
      <AbaciLoader visible={extending} />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  timeIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.heading_font,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border_line,
    marginBottom: 20,
  },
  content: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.heading_font,
    marginBottom: 10,
  },
  timeInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  timeInputWrapper: {
    width: 80,
    backgroundColor: Colors.bg_color,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border_line,
    alignItems: 'center',
    minHeight: 60,
    justifyContent: 'center',
  },
  timeInput: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.black,
    textAlign: 'center',
    width: '100%',
    minHeight: 24,
    lineHeight: 20,
    textAlignVertical: 'center',
  },
  timeLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.font_gray,
    marginTop: 0,
  },
  inputError: {
    borderColor: Colors.red,
  },
  errorText: {
    marginTop: 8,
    color: Colors.red,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    alignSelf: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '55%',
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  saveIcon: {
    marginRight: 6,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: Colors.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ExtendBookingModal;
