import React, { useMemo } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Lucide } from '@react-native-vector-icons/lucide';
import { Dropdown } from 'react-native-element-dropdown';
import { Colors } from '../../constants/customStyles';
import { useSelector } from 'react-redux';

const BoatDetailsTab = ({ 
  selectedBoat, 
  setSelectedBoat, 
  noOfPassengers, 
  setNoOfPassengers,
  boats = []
}) => {
  const isDarkMode = useSelector(state => state.themeSlice.isDarkMode);

  const boatData = useMemo(() => {
    const safeBoats = Array.isArray(boats) ? boats : [];

    const activeBoats = safeBoats.filter(boat => boat.status === 'ACTIVE');

    return activeBoats.map(boat => ({
      label: boat.name || '',
      value: boat.name || '',
      id: boat.id,
      registration_number: boat.registration_number || boat.boatId || 'N/A',
      length: boat.length ? boat.length.toString() : '0',
      width: boat.width ? boat.width.toString() : '0',
    }));
  }, [boats]);

  const selectedBoatDetails = useMemo(() => 
    boatData.find(boat => boat.id === selectedBoat), [boatData, selectedBoat]
  );
  
  return (
    <>
      {/* Select Boat - Full Width */}
      <View style={styles.boatSelectionWrapper}>
        <View style={styles.formLabelContainer}>
          <Text style={[styles.inputLabel, { color: isDarkMode ? Colors.dark_text_secondary : Colors.sub_heading_font }]}>Select Boat</Text>
          <Lucide name="asterisk" size={12} color={isDarkMode ? Colors.white : 'black'} />
        </View>
        
        <Dropdown
          style={[styles.dropdown, { backgroundColor: isDarkMode ? Colors.dark_container : Colors.white, borderColor: isDarkMode ? Colors.input_border_dark : Colors.input_border_light }]}
          placeholderStyle={[styles.placeholderStyle, { color: isDarkMode ? Colors.dark_text_secondary : '#C8C8C8' }]}
          selectedTextStyle={[styles.selectedTextStyle, { color: isDarkMode ? Colors.white : '#000', fontWeight: '600' }]}
          inputSearchStyle={[styles.inputSearchStyle, { color: isDarkMode ? Colors.white : '#333', backgroundColor: isDarkMode ? Colors.dropdown_container_dark : Colors.dropdown_container_light }]}
          iconStyle={styles.iconStyle}
          data={boatData}
          search
          maxHeight={300}
          labelField="label"
          valueField="id"
          placeholder="Select boat"
          searchPlaceholder="Search boats..."
          value={selectedBoat}
          onChange={item => {
            setSelectedBoat(item.id);
          }}
          renderLeftIcon={() => (
            <Lucide name="ship" size={20} color={isDarkMode ? Colors.dark_text_secondary : "#C8C8C8"} style={styles.icon} />
          )}
          itemContainerStyle={{ backgroundColor: isDarkMode ? Colors.dropdown_container_dark : Colors.dropdown_container_light }}
          itemTextStyle={{ color: isDarkMode ? Colors.white : '#333' }}
          activeColor={isDarkMode ? Colors.dropdown_selected_dark : Colors.dropdown_selected_light}
          containerStyle={{ backgroundColor: isDarkMode ? Colors.dropdown_container_dark : Colors.dropdown_container_light, borderRadius: 8, elevation: isDarkMode ? 0 : 2, shadowOpacity: isDarkMode ? 0 : 0.1, borderWidth: 1, borderColor: isDarkMode ? Colors.dropdown_border_dark : Colors.dropdown_border_light }}
        />
      </View>

      {/* Boat Reg No and No of Passengers Row */}
      <View style={styles.formInputRow}>
        <View style={styles.formInputContainer}>
          <View style={styles.formLabelContainer}>
            <Text style={[styles.inputLabel, { color: isDarkMode ? Colors.dark_text_secondary : Colors.sub_heading_font }]}>Boat Reg No</Text>
          </View>
          <TextInput
            style={[styles.textInput, styles.disabledInput, { backgroundColor: isDarkMode ? Colors.dark_container : '#F5F5F5', color: isDarkMode ? Colors.white : '#666', borderColor: isDarkMode ? Colors.input_border_dark : Colors.input_border_light }]}
            value={selectedBoatDetails?.registration_number || ''}
            editable={false}
            placeholder="Enter reg no"
            placeholderTextColor="#C8C8C8"
          />
        </View>
        <View style={styles.formInputContainer}>
          <View style={styles.formLabelContainer}>
            <Text style={[styles.inputLabel, { color: isDarkMode ? Colors.dark_text_secondary : Colors.sub_heading_font }]}>No of Passengers</Text>
            <Lucide name="asterisk" size={12} color={isDarkMode ? Colors.white : 'black'} />
          </View>
          <TextInput
            style={[styles.textInput, { backgroundColor: isDarkMode ? Colors.dark_container : Colors.white, color: isDarkMode ? Colors.white : '#333', borderColor: isDarkMode ? Colors.input_border_dark : Colors.input_border_light }]}
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
            <Text style={[styles.inputLabel, { color: isDarkMode ? Colors.dark_text_secondary : Colors.sub_heading_font }]}>Boat Width (ft)</Text>
          </View>
          <TextInput
            style={[styles.textInput, styles.disabledInput, { backgroundColor: isDarkMode ? Colors.dark_container : '#F5F5F5', color: isDarkMode ? Colors.white : '#666', borderColor: isDarkMode ? Colors.input_border_dark : Colors.input_border_light }]}
            value={selectedBoatDetails?.width || ''}
            editable={false}
            placeholder="Enter width (ft)"
            placeholderTextColor="#C8C8C8"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.formInputContainer}>
          <View style={styles.formLabelContainer}>
            <Text style={[styles.inputLabel, { color: isDarkMode ? Colors.dark_text_secondary : Colors.sub_heading_font }]}>Boat Length (ft)</Text>
          </View>
          <TextInput
            style={[styles.textInput, styles.disabledInput, { backgroundColor: isDarkMode ? Colors.dark_container : '#F5F5F5', color: isDarkMode ? Colors.white : '#666', borderColor: isDarkMode ? Colors.input_border_dark : Colors.input_border_light }]}
            value={selectedBoatDetails?.length || ''}
            editable={false}
            placeholder="Enter length (ft)"
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
    color: '#333',
  },
  disabledInput: {
    backgroundColor: '#F5F5F5',
    color: '#666',
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
  dropdown: {
    height: 50,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.white,
    elevation: 0,
    shadowOpacity: 0,
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#C8C8C8',
  },
  selectedTextStyle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
});

export default BoatDetailsTab;
