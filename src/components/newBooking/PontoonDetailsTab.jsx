import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Lucide } from '@react-native-vector-icons/lucide';
import { Dropdown } from 'react-native-element-dropdown';
import { Colors } from '../../constants/customStyles';

const PontoonDetailsTab = ({ 
  pontoonName, 
  setPontoonName, 
  berthName, 
  setBerthName,
  pontoons = [],
  berths = [],
  onPontoonSelect
}) => {
  const safePontoons = Array.isArray(pontoons) ? pontoons : [];
  const safeBerths = Array.isArray(berths) ? berths : [];
  
  const isSinglePontoon = safePontoons.length === 1;
  const isMultiplePontoons = safePontoons.length > 1;
  const isSingleBerth = safeBerths.length === 1;
  const isMultipleBerths = safeBerths.length > 1;

  // Transform data for dropdown component
  const pontoonData = safePontoons.map((item, index) => ({
    label: item.name,
    value: item.name,
    id: item.id,
  }));

  const berthData = safeBerths.map((item, index) => ({
    label: item.name,
    value: item.name,
  }));
  return (
    <>
      {/* Pontoon Name */}
      <View style={styles.formInputContainer}>
        <View style={styles.formLabelContainer}>
          <Text style={styles.inputLabel}>Pontoon Name</Text>
          <Lucide name="asterisk" size={12} color="black" />
        </View>
        
        {isSinglePontoon ? (
          // Show text input for single pontoon (auto-filled)
          <TextInput
            style={[styles.textInput, styles.disabledInput]}
            value={pontoonName}
            editable={false}
            placeholder="Pontoon name"
            placeholderTextColor="#C8C8C8"
          />
        ) : isMultiplePontoons ? (
          // Show dropdown for multiple pontoons
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={pontoonData}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select pontoon"
            searchPlaceholder="Search..."
            value={pontoonName}
            onChange={item => {
              setPontoonName(item.value);
              onPontoonSelect && onPontoonSelect(item.id);
            }}
            renderLeftIcon={() => (
              <Lucide name="map-pin" size={20} color="#C8C8C8" style={styles.icon} />
            )}
          />
        ) : (
          // Show regular text input when no pontoons loaded yet
          <TextInput
            style={styles.textInput}
            value={pontoonName}
            onChangeText={setPontoonName}
            placeholder="Enter pontoon name"
            placeholderTextColor="#C8C8C8"
          />
        )}
      </View>

      {/* Berth Name */}
      <View style={styles.formInputContainer}>
        <View style={styles.formLabelContainer}>
          <Text style={styles.inputLabel}>Berth Name</Text>
          <Lucide name="asterisk" size={12} color="black" />
        </View>
        
        {isSingleBerth ? (
          // Show text input for single berth (auto-filled)
          <TextInput
            style={[styles.textInput, styles.disabledInput]}
            value={berthName}
            editable={false}
            placeholder="Berth name"
            placeholderTextColor="#C8C8C8"
          />
        ) : isMultipleBerths ? (
          // Show dropdown for multiple berths
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={berthData}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select berth"
            searchPlaceholder="Search..."
            value={berthName}
            onChange={item => {
              setBerthName(item.value);
            }}
            renderLeftIcon={() => (
              <Lucide name="anchor" size={20} color="#C8C8C8" style={styles.icon} />
            )}
          />
        ) : (
          // Show regular text input when no berths loaded yet
          <TextInput
            style={styles.textInput}
            value={berthName}
            onChangeText={setBerthName}
            placeholder="Enter berth name"
            placeholderTextColor="#C8C8C8"
          />
        )}
      </View>

    </>
  );
};

const styles = StyleSheet.create({
  formInputContainer: {
    marginBottom: 20,
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
  dropdown: {
    height: 50,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.white,
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
  },
});

export default PontoonDetailsTab;
