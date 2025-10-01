import React from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { getMarkedDates } from '../../helpers/markedDatesHelper';
import { Colors } from '../../constants/customStyles';

const CalendarModal = ({
  visible,
  onClose,
  selectedDate,
  setSelectedDate,
  selectedDateRef,
  onRangeSelected,
  onClear,
  isDarkMode = false,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, {backgroundColor: isDarkMode ? Colors.container_dark_bg : '#fff'}]}>
          <Calendar
            markingType={'period'}
            markedDates={getMarkedDates(
              selectedDate?.startDate,
              selectedDate?.endDate
            )}
            onDayPress={(day) => {
              if (!selectedDate?.startDate || (selectedDate?.startDate && selectedDate?.endDate)) {
                const newSelection = { startDate: day.dateString, endDate: null };
                setSelectedDate(newSelection);
                selectedDateRef.current = newSelection;
              } else if (selectedDate?.startDate && !selectedDate?.endDate) {
                // Check if the selected date is before the start date
                if (day.dateString < selectedDate.startDate) {
                  // If previous date is selected, make it the new start date
                  const newSelection = { startDate: day.dateString, endDate: null };
                  setSelectedDate(newSelection);
                  selectedDateRef.current = newSelection;
                } else {
                  // Normal end date selection
                  const newSelection = { ...selectedDate, endDate: day.dateString };
                  setSelectedDate(newSelection);
                  selectedDateRef.current = newSelection;
                  onRangeSelected(newSelection);
                }
              }
            }}
          />

          <TouchableOpacity
            style={[styles.closeButton, {backgroundColor: Colors.primary}]}
            onPress={() => {
              setSelectedDate(null);
              selectedDateRef.current = null;
              onClear?.();
              onClose();
            }}
          >
            <Text style={{ color: Colors.white, fontWeight: '600' }}>Clear & Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default CalendarModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 30,
    alignItems: 'center',
    elevation: 5,
  },
  closeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
});
