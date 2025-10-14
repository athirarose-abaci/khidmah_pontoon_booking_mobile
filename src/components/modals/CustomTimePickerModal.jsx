import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native';
import { Lucide } from '@react-native-vector-icons/lucide';
import { Colors } from '../../constants/customStyles';

const CustomTimePickerModal = ({ 
  visible, 
  onClose, 
  onConfirm, 
  currentTime, 
  title, 
  hourOptions, 
  minuteOptions 
}) => {
  const [selectedHour, setSelectedHour] = useState(0);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const hourScrollRef = useRef(null);
  const minuteScrollRef = useRef(null);
  const itemHeight = 40;

  useEffect(() => {
    if (currentTime) {
      const [hours, minutes] = currentTime.split(':').map(Number);
      setSelectedHour(hours || 0);
      setSelectedMinute(minutes || 0);
    } else {
      const now = new Date();
      setSelectedHour(now.getHours());
      setSelectedMinute(now.getMinutes());
    }
  }, [currentTime, visible]);

  useEffect(() => {
    if (visible && hourScrollRef.current) {
      setTimeout(() => {
        hourScrollRef.current?.scrollTo({
          y: selectedHour * itemHeight,
          animated: true
        });
      }, 100);
    }
  }, [visible, selectedHour]);

  useEffect(() => {
    if (visible && minuteScrollRef.current) {
      setTimeout(() => {
        minuteScrollRef.current?.scrollTo({
          y: selectedMinute * itemHeight,
          animated: true
        });
      }, 100);
    }
  }, [visible, selectedMinute]);

  const handleConfirm = () => {
    onConfirm(selectedHour, selectedMinute);
  };

  const onHourScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / itemHeight);
    setSelectedHour(index);
  };

  const onMinuteScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / itemHeight);
    setSelectedMinute(index);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.timePickerModal}>
          <View style={styles.timePickerHeader}>
            <Text style={styles.timePickerTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Lucide name="x" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.timePickerContent}>
            {/* Hours Section */}
            <View style={styles.timeSection}>
              <ScrollView
                ref={hourScrollRef}
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                snapToInterval={itemHeight}
                decelerationRate="fast"
                onMomentumScrollEnd={onHourScroll}
                contentContainerStyle={styles.scrollContent}
              >
                {hourOptions.map((hour) => (
                  <View key={hour} style={styles.scrollItem}>
                    <Text style={[
                      styles.scrollText,
                      selectedHour === hour && styles.scrollTextSelected
                    ]}>
                      {hour.toString().padStart(2, '0')}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Separator */}
            <Text style={styles.separatorText}>:</Text>

            {/* Minutes Section */}
            <View style={styles.timeSection}>
              <ScrollView
                ref={minuteScrollRef}
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                snapToInterval={itemHeight}
                decelerationRate="fast"
                onMomentumScrollEnd={onMinuteScroll}
                contentContainerStyle={styles.scrollContent}
              >
                {minuteOptions.map((minute) => (
                  <View key={minute} style={styles.scrollItem}>
                    <Text style={[
                      styles.scrollText,
                      selectedMinute === minute && styles.scrollTextSelected
                    ]}>
                      {minute.toString().padStart(2, '0')}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
          
          <View style={styles.timePickerFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
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
  timePickerModal: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: '70%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  timePickerTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  timePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  timeSection: {
    alignItems: 'center',
    flex: 1,
  },
  scrollView: {
    height: 120,
    width: 60,
  },
  scrollContent: {
    paddingVertical: 40,
  },
  scrollItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollText: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: '#999',
    textAlign: 'center',
  },
  scrollTextSelected: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Colors.primary,
  },
  separatorText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#666',
    marginHorizontal: 10,
  },
  timePickerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 10,
    marginLeft: 8,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
});

export default CustomTimePickerModal;
