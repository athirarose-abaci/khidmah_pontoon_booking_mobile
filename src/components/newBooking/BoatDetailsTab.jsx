import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Lucide } from '@react-native-vector-icons/lucide';
import { Colors } from '../../constants/customStyles';

const BoatDetailsTab = ({ 
  selectedBoat, 
  setSelectedBoat, 
  boatRegNo, 
  setBoatRegNo, 
  noOfPassengers, 
  setNoOfPassengers, 
  boatWidth, 
  setBoatWidth, 
  boatLength, 
  setBoatLength 
}) => {
  return (
    <>
      {/* Select Boat - Full Width */}
      <View style={styles.boatSelectionWrapper}>
        <View style={styles.formLabelContainer}>
          <Text style={styles.inputLabel}>Select Boat</Text>
          <Lucide name="asterisk" size={12} color="black" />
        </View>
        <View style={styles.boatSelectionContainer}>
          <TextInput
            style={styles.boatSelectionInput}
            value={selectedBoat}
            onChangeText={setSelectedBoat}
            placeholder="Select boat"
            placeholderTextColor="#C8C8C8"
          />
          <Ionicons name="chevron-down" size={16} color="#C8C8C8" />
        </View>
      </View>

      {/* Boat Reg No and No of Passengers Row */}
      <View style={styles.formInputRow}>
        <View style={styles.formInputContainer}>
          <View style={styles.formLabelContainer}>
            <Text style={styles.inputLabel}>Boat Reg No</Text>
          </View>
          <TextInput
            style={styles.textInput}
            value={boatRegNo}
            onChangeText={setBoatRegNo}
            placeholder="Enter reg no"
            placeholderTextColor="#C8C8C8"
          />
        </View>
        <View style={styles.formInputContainer}>
          <View style={styles.formLabelContainer}>
            <Text style={styles.inputLabel}>No of Passengers</Text>
          </View>
          <TextInput
            style={styles.textInput}
            value={noOfPassengers}
            onChangeText={setNoOfPassengers}
            placeholder="Enter count"
            placeholderTextColor="#C8C8C8"
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Boat Width and Boat Length Row */}
      <View style={styles.formInputRow}>
        <View style={styles.formInputContainer}>
          <View style={styles.formLabelContainer}>
            <Text style={styles.inputLabel}>Boat Width</Text>
          </View>
          <TextInput
            style={styles.textInput}
            value={boatWidth}
            onChangeText={setBoatWidth}
            placeholder="Enter width"
            placeholderTextColor="#C8C8C8"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.formInputContainer}>
          <View style={styles.formLabelContainer}>
            <Text style={styles.inputLabel}>Boat Length</Text>
          </View>
          <TextInput
            style={styles.textInput}
            value={boatLength}
            onChangeText={setBoatLength}
            placeholder="Enter length"
            placeholderTextColor="#C8C8C8"
            keyboardType="numeric"
          />
        </View>
      </View>
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
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#F8F9FA',
  },
  boatSelectionWrapper: {
    marginBottom: 20,
  },
  boatSelectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    height: 45,
  },
  boatSelectionInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
    paddingVertical: 0,
  },
});

export default BoatDetailsTab;
