import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native';
import { Lucide } from '@react-native-vector-icons/lucide';
import { Colors } from '../../constants/customStyles';

const CustomTimePickerModal = ({ 
  visible, 
  onClose, 
  onConfirm, 
  currentTime, 
  title 
}) => {
  const [selectedHour, setSelectedHour] = useState(1);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState('AM');
  
  const hourScrollRef = useRef(null);
  const minuteScrollRef = useRef(null);
  const periodScrollRef = useRef(null);
  
  const itemHeight = 50;
  const visibleItems = 3; 

  const hourOptions = [
    ...Array.from({ length: 12 }, (_, i) => i + 1), 
    ...Array.from({ length: 12 }, (_, i) => i + 1),
    ...Array.from({ length: 12 }, (_, i) => i + 1), 
  ];
  
  const minuteOptions = [
    ...Array.from({ length: 60 }, (_, i) => i), 
    ...Array.from({ length: 60 }, (_, i) => i), 
    ...Array.from({ length: 60 }, (_, i) => i), 
  ];
  
  const periodOptions = ['AM', 'PM'];

  useEffect(() => {
    if (currentTime) {
      const [time, period] = currentTime.split(' ');
      if (time) {
        const [hours, minutes] = time.split(':').map(Number);
        if (hours !== undefined && minutes !== undefined) {
          let hour12 = hours;
          let period12 = 'AM';
          
          if (hours === 0) {
            hour12 = 12;
            period12 = 'AM';
          } else if (hours === 12) {
            hour12 = 12;
            period12 = 'PM';
          } else if (hours > 12) {
            hour12 = hours - 12;
            period12 = 'PM';
          }
          
          setSelectedHour(hour12);
          setSelectedMinute(minutes);
          setSelectedPeriod(period12);
        }
      }
    } else {
      const now = new Date();
      let hour12 = now.getHours();
      let period12 = 'AM';
      
      if (hour12 === 0) {
        hour12 = 12;
        period12 = 'AM';
      } else if (hour12 === 12) {
        hour12 = 12;
        period12 = 'PM';
      } else if (hour12 > 12) {
        hour12 = hour12 - 12;
        period12 = 'PM';
      }
      
      setSelectedHour(hour12);
      setSelectedMinute(now.getMinutes());
      setSelectedPeriod(period12);
    }
  }, [currentTime, visible]);

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        hourScrollRef.current?.scrollTo({
          y: (12 + selectedHour - 1) * itemHeight, 
          animated: true
        });
        minuteScrollRef.current?.scrollTo({
          y: (60 + selectedMinute) * itemHeight, 
          animated: true
        });
      }, 100);
    }
  }, [visible, selectedHour, selectedMinute, selectedPeriod]);

  const handleConfirm = () => {
    // Return time in 12-hour format with AM/PM
    const timeString = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')} ${selectedPeriod}`;
    onConfirm(timeString);
  };

  const onHourScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / itemHeight);
    const hourValue = hourOptions[index];
    setSelectedHour(hourValue);
    
    // Handle infinite scroll - reset position when reaching boundaries
    const totalItems = hourOptions.length;
    const middleStart = 12; // Start of middle set
    
    if (index < 6) {
      // Near the beginning, jump to middle
      setTimeout(() => {
        hourScrollRef.current?.scrollTo({
          y: (middleStart + hourValue - 1) * itemHeight,
          animated: false
        });
      }, 50);
    } else if (index > totalItems - 6) {
      // Near the end, jump to middle
      setTimeout(() => {
        hourScrollRef.current?.scrollTo({
          y: (middleStart + hourValue - 1) * itemHeight,
          animated: false
        });
      }, 50);
    }
  };

  const onMinuteScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / itemHeight);
    const minuteValue = minuteOptions[index];
    setSelectedMinute(minuteValue);
    
    // Handle infinite scroll - reset position when reaching boundaries
    const totalItems = minuteOptions.length;
    const middleStart = 60; 
    const middleEnd = 119;
    
    if (index < 30) {
      // Near the beginning, jump to middle
      setTimeout(() => {
        minuteScrollRef.current?.scrollTo({
          y: (middleStart + minuteValue) * itemHeight,
          animated: false
        });
      }, 50);
    } else if (index > totalItems - 30) {
      // Near the end, jump to middle
      setTimeout(() => {
        minuteScrollRef.current?.scrollTo({
          y: (middleStart + minuteValue) * itemHeight,
          animated: false
        });
      }, 50);
    }
  };

  const handlePeriodSelect = (period) => {
    setSelectedPeriod(period);
  };

  const renderPickerColumn = (items, selectedValue, onScroll, scrollRef) => {
    return (
      <View style={styles.pickerColumn}>
        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          snapToInterval={itemHeight}
          decelerationRate="fast"
          onMomentumScrollEnd={onScroll}
          contentContainerStyle={styles.scrollContent}
        >
          {items.map((item, index) => {
            const isSelected = item === selectedValue;
            return (
              <View key={`${item}-${index}`} style={styles.scrollItem}>
                <Text style={[
                  styles.scrollText,
                  isSelected && styles.scrollTextSelected
                ]}>
                  {item.toString().padStart(2, '0')}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderPeriodButtons = () => {
    return (
      <View style={styles.periodColumn}>
        {periodOptions.map((period) => {
          const isSelected = period === selectedPeriod;
          return (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                isSelected && styles.periodButtonSelected
              ]}
              onPress={() => handlePeriodSelect(period)}
            >
              <Text style={[
                styles.periodButtonText,
                isSelected && styles.periodButtonTextSelected
              ]}>
                {period}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
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
            {/* Hours Column */}
            {renderPickerColumn(hourOptions, selectedHour, onHourScroll, hourScrollRef)}
            
            {/* Minutes Column */}
            {renderPickerColumn(minuteOptions, selectedMinute, onMinuteScroll, minuteScrollRef)}
            
            {/* AM/PM Buttons */}
            {renderPeriodButtons()}
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
    borderRadius: 12,
    width: '80%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border_line,
  },
  timePickerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.heading_font,
  },
  closeButton: {
    padding: 4,
  },
  timePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  periodColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
    justifyContent: 'center',
  },
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    minWidth: 60,
    alignItems: 'center',
  },
  periodButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  periodButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.sub_heading_font,
  },
  periodButtonTextSelected: {
    color: Colors.white,
    fontFamily: 'Inter-SemiBold',
  },
  scrollView: {
    height: 150,
    width: 80,
  },
  scrollContent: {
    paddingVertical: 50, 
  },
  scrollItem: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.font_gray,
    textAlign: 'center',
  },
  scrollTextSelected: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Colors.primary, 
  },
  timePickerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border_line,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border_line,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.sub_heading_font,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.white,
  },
});

export default CustomTimePickerModal;
