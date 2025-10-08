import React, { useEffect, useRef, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Animated, Modal, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/customStyles';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { AntDesign } from '@react-native-vector-icons/ant-design';
import { ToastContext } from '../../context/ToastContext';

const { height: screenHeight } = Dimensions.get('window');

const AddBoatModal = ({ visible, onClose, onSave }) => {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const toastContext = useContext(ToastContext);
  
  // Form state
  const [boatName, setBoatName] = useState('');
  const [boatRegNo, setBoatRegNo] = useState('');
  const [boatLength, setBoatLength] = useState('');
  const [boatWidth, setBoatWidth] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(screenHeight);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!boatName.trim()) {
      newErrors.boatName = 'Boat name is required';
    }
    
    if (!boatRegNo.trim()) {
      newErrors.boatRegNo = 'Registration number is required';
    }
    
    if (!boatLength.trim()) {
      newErrors.boatLength = 'Boat length is required';
    } else if (isNaN(boatLength) || parseFloat(boatLength) <= 0) {
      newErrors.boatLength = 'Please enter a valid length';
    }
    
    if (!boatWidth.trim()) {
      newErrors.boatWidth = 'Boat width is required';
    } else if (isNaN(boatWidth) || parseFloat(boatWidth) <= 0) {
      newErrors.boatWidth = 'Please enter a valid width';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const boatData = {
      boatName: boatName.trim(),
      boatRegNo: boatRegNo.trim(),
      boatLength: boatLength.trim(),
      boatWidth: boatWidth.trim(),
      description: description.trim(),
    };

    try {
      await onSave(boatData);
      handleClose();
    } catch (error) {
      // API errors should be handled by the parent component and shown as toast
      // This catch block is here in case onSave throws an error
      console.error('Error saving boat:', error);
    }
  };

  const handleClose = () => {
    setBoatName('');
    setBoatRegNo('');
    setBoatLength('');
    setBoatWidth('');
    setDescription('');
    setErrors({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[ styles.modalContainer, { transform: [{ translateY: slideAnim }], }, ]} >
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.headerIcon}>
                  <Ionicons name="add-circle-outline" size={25} color={Colors.primary} />
                </View>
                <Text style={styles.headerTitle}>Add New Boat</Text>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={handleClose}
              >
                <Ionicons name="close" size={16} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
              {/* Form Fields */}
              <View style={styles.formContainer}>
                {/* Boat Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Boat Name*</Text>
                  <TextInput
                    style={[styles.input, errors.boatName && styles.inputError]}
                    value={boatName}
                    onChangeText={(text) => {
                      setBoatName(text);
                      if (errors.boatName) {
                        setErrors(prev => ({ ...prev, boatName: '' }));
                      }
                    }}
                    placeholder="Enter boat name"
                    placeholderTextColor="#C8C8C8"
                  />
                  {errors.boatName && <Text style={styles.errorText}>{errors.boatName}</Text>}
                </View>

                {/* Boat Reg No */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Boat Reg No*</Text>
                  <TextInput
                    style={[styles.input, errors.boatRegNo && styles.inputError]}
                    value={boatRegNo}
                    onChangeText={(text) => {
                      setBoatRegNo(text);
                      if (errors.boatRegNo) {
                        setErrors(prev => ({ ...prev, boatRegNo: '' }));
                      }
                    }}
                    placeholder="Enter registration number"
                    placeholderTextColor="#C8C8C8"
                  />
                  {errors.boatRegNo && <Text style={styles.errorText}>{errors.boatRegNo}</Text>}
                </View>

                {/* Boat Length */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Boat Length*</Text>
                  <TextInput
                    style={[styles.input, errors.boatLength && styles.inputError]}
                    value={boatLength}
                    onChangeText={(text) => {
                      setBoatLength(text);
                      if (errors.boatLength) {
                        setErrors(prev => ({ ...prev, boatLength: '' }));
                      }
                    }}
                    placeholder="Enter boat length"
                    placeholderTextColor="#C8C8C8"
                    keyboardType="numeric"
                  />
                  {errors.boatLength && <Text style={styles.errorText}>{errors.boatLength}</Text>}
                </View>

                {/* Boat Width */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Boat Width*</Text>
                  <TextInput
                    style={[styles.input, errors.boatWidth && styles.inputError]}
                    value={boatWidth}
                    onChangeText={(text) => {
                      setBoatWidth(text);
                      if (errors.boatWidth) {
                        setErrors(prev => ({ ...prev, boatWidth: '' }));
                      }
                    }}
                    placeholder="Enter boat width"
                    placeholderTextColor="#C8C8C8"
                    keyboardType="numeric"
                  />
                  {errors.boatWidth && <Text style={styles.errorText}>{errors.boatWidth}</Text>}
                </View>

                {/* Description */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Description*</Text>
                  <TextInput
                    style={[styles.input, styles.textArea, errors.description && styles.inputError]}
                    value={description}
                    onChangeText={(text) => {
                      setDescription(text);
                      if (errors.description) {
                        setErrors(prev => ({ ...prev, description: '' }));
                      }
                    }}
                    placeholder="Enter boat description"
                    placeholderTextColor="#C8C8C8"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                  {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
                </View>

                {/* Boat Images */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Boat Images*</Text>
                  <TouchableOpacity style={styles.imageUploadArea}>
                    <View style={styles.uploadIcon}>
                      <Ionicons name="add" size={32} color="#C8C8C8" />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            {/* Save Button */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <AntDesign name="save" size={20} color="white" />
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: screenHeight * 0.95,
    minHeight: screenHeight * 0.88,
    marginHorizontal: 3,
    paddingHorizontal: 15,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#4C4C4C',
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: Colors.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: '#4C4C4C',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#4C4C4C',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  inputError: {
    borderColor: Colors.error,
    borderWidth: 2,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
    marginLeft: 4,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imageUploadArea: {
    height: 120,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  uploadIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  saveButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.white,
    marginLeft: 10,
  },
});

export default AddBoatModal;
