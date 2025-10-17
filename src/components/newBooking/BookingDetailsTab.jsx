import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Lucide } from '@react-native-vector-icons/lucide';
import { Colors } from '../../constants/customStyles';
import DatePickerModal from '../modals/DatePickerModal';
import CustomTimePickerModal from '../modals/CustomTimePickerModal';
import moment from 'moment';
import { ToastContext } from '../../context/ToastContext';
import Error from '../../helpers/Error';
import { calculateDepartureTime } from '../../helpers/timeHelper';

const BookingDetailsTab = ({ 
  bookingDetails,
  onBookingDetailsChange,
  berthsData = [],
  pontoonName = '',
  berthName = '',
  isEditMode = false
}) => {
  const [showArrivalDatePicker, setShowArrivalDatePicker] = useState(false);
  const [showArrivalTimePicker, setShowArrivalTimePicker] = useState(false);

  const toastContext = useContext(ToastContext);
  
  useEffect(() => {
    // Only set default duration if not in edit mode and duration fields are empty
    if (berthsData && berthsData.length > 0 && berthName && !isEditMode) {
      const selectedBerth = berthsData.find(berth => berth.name === berthName);
      if (selectedBerth && selectedBerth.default_duration) {
        const durationParts = selectedBerth.default_duration.split(':');
        if (durationParts.length >= 2) {
          const hours = durationParts[0].padStart(2, '0');
          const minutes = durationParts[1].padStart(2, '0');
          
          // Only set if current duration fields are empty
          if (!bookingDetails?.hours && !bookingDetails?.minutes) {
            onBookingDetailsChange('hours', hours);
            onBookingDetailsChange('minutes', minutes);
          }
        }
      }
    }
  }, [berthName, isEditMode]); 

  useEffect(() => {
    const { arrivalDate, arrivalTime, hours, minutes } = bookingDetails || {};
    if (arrivalDate && arrivalTime && hours !== '' && minutes !== '') {
      try {
        // Ensure hours and minutes are valid numbers
        const hoursNum = parseInt(hours) || 0;
        const minutesNum = parseInt(minutes) || 0;
        
        const { departureDate, departureTime } = calculateDepartureTime(
          arrivalDate, 
          arrivalTime, 
          hoursNum, 
          minutesNum
        );
        
        const currentDepartureDate = bookingDetails?.departureDate || '';
        const currentDepartureTime = bookingDetails?.departureTime || '';
        
        if (departureDate !== currentDepartureDate || departureTime !== currentDepartureTime) {
          onBookingDetailsChange('departureDate', departureDate);
          onBookingDetailsChange('departureTime', departureTime);
        }
      } catch (error) {
        let err_msg = Error(error);
        toastContext.showToast(err_msg, 'short', 'error');
      }
    }
  }, [bookingDetails?.arrivalDate, bookingDetails?.arrivalTime, bookingDetails?.hours, bookingDetails?.minutes]);

  // Time picker handlers
  const handleArrivalTimeConfirm = (timeString) => {
    onBookingDetailsChange('arrivalTime', timeString);
    setShowArrivalTimePicker(false);
  };
   
  return (
    <>
      {/* Arrival Date/Time Row */}
      <View style={styles.formInputRow}>
        <View style={styles.formInputContainer}>
          <View style={styles.formLabelContainer}>
            <Text style={styles.inputLabel}>Arrival Date</Text>
            <Lucide name="asterisk" size={12} color="black" />
          </View>
          <View style={styles.inputWithIcon}>
            <TextInput
              style={[styles.textInput, styles.textInputWithIcon]}
              value={bookingDetails?.arrivalDate || ''}
              onChangeText={(value) => onBookingDetailsChange('arrivalDate', value)}
              placeholder="Select date"
              placeholderTextColor="#C8C8C8"
              editable={false}
            />
            <TouchableOpacity 
              style={styles.calendarIcon}
              onPress={() => setShowArrivalDatePicker(true)}
            >
              <Lucide name="calendar" size={20} color={Colors.primary}/>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.formInputContainer}>
          <View style={styles.formLabelContainer}>
            <Text style={styles.inputLabel}>Arrival Time</Text>
            <Lucide name="asterisk" size={12} color="black" />
          </View>
          <View style={styles.inputWithIcon}>
            <TextInput
              style={[styles.textInput, styles.textInputWithIcon]}
              value={bookingDetails?.arrivalTime || ''}
              placeholder="Select time"
              placeholderTextColor="#C8C8C8"
              editable={false}
            />
            <TouchableOpacity 
              style={styles.calendarIcon}
              onPress={() => setShowArrivalTimePicker(true)}
            >
              <Lucide name="clock" size={20} color={Colors.primary}/>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Duration Row */}
      <View style={styles.bookingDurationContainer}>
        <Text style={styles.durationLabel}>Duration (Hours)</Text>
        <View style={styles.bookingDurationInputs}>
          <TextInput
            style={styles.bookingDurationInput}
            value={bookingDetails?.hours || ''}
            onChangeText={(value) => {
              // Only allow numeric input and limit to 2 digits
              const numericValue = value.replace(/[^0-9]/g, '');
              if (numericValue.length <= 2) {
                onBookingDetailsChange('hours', numericValue);
              }
            }}
            placeholder="Hours"
            placeholderTextColor="#C8C8C8"
            keyboardType="numeric"
            maxLength={2}
          />
          <Text style={styles.bookingDurationSeparator}>:</Text>
          <TextInput
            style={styles.bookingDurationInput}
            value={bookingDetails?.minutes || ''}
            onChangeText={(value) => {
              // Only allow numeric input and limit to 2 digits
              const numericValue = value.replace(/[^0-9]/g, '');
              if (numericValue.length <= 2) {
                onBookingDetailsChange('minutes', numericValue);
              }
            }}
            placeholder="Minutes"
            placeholderTextColor="#C8C8C8"
            keyboardType="numeric"
            maxLength={2}
          />
        </View>
      </View>

      {/* Departure Date/Time Row */}
      <View style={styles.formInputRow}>
        <View style={styles.formInputContainer}>
          <View style={styles.formLabelContainer}>
            <Text style={styles.inputLabel}>Departure Date</Text>
            <Lucide name="asterisk" size={12} color="black" />
          </View>
          <TextInput
            style={styles.textInput}
            value={bookingDetails?.departureDate || ''}
            placeholder="Departure Date"
            placeholderTextColor="#C8C8C8"
            editable={false}
          />
        </View>
        <View style={styles.formInputContainer}>
          <View style={styles.formLabelContainer}>
            <Text style={styles.inputLabel}>Departure time</Text>
            <Lucide name="asterisk" size={12} color="black" />
          </View>
          <TextInput
            style={styles.textInput}
            value={bookingDetails?.departureTime || ''}
            placeholder="Departure Time"
            placeholderTextColor="#C8C8C8"
            editable={false}
          />
        </View>
      </View>

      <DatePickerModal
        visible={showArrivalDatePicker}
        onClose={() => setShowArrivalDatePicker(false)}
        onDateSelect={(value) => onBookingDetailsChange('arrivalDate', value)}
        selectedDate={bookingDetails?.arrivalDate || ''}
        title="Select Arrival Date"
        minimumDate={new Date().toISOString().split('T')[0]} 
      />


      <CustomTimePickerModal
        visible={showArrivalTimePicker}
        onClose={() => setShowArrivalTimePicker(false)}
        onConfirm={handleArrivalTimeConfirm}
        currentTime={bookingDetails?.arrivalTime || ''}
        title="Select Arrival Time"
      />


    </>
  );
};

const styles = StyleSheet.create({
  formInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  formInputContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  formLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginRight: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.sub_heading_font,
  },
  bookingDurationContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  durationLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginBottom: 12,
  },
  bookingDurationInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingDurationInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
    width: 80,
    textAlign: 'center',
  },
  bookingDurationSeparator: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginHorizontal: 8,
  },
  inputWithIcon: {
    position: 'relative',
  },
  textInputWithIcon: {
    paddingRight: 50,
  },
  calendarIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
    // padding: 4,
  },
});

export default BookingDetailsTab;
