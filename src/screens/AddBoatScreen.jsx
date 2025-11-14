import React, { useEffect, useRef, useState, useContext, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Animated, Dimensions, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/customStyles';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { AntDesign } from '@react-native-vector-icons/ant-design';
import { ToastContext } from '../context/ToastContext';
import ImageUploadGrid from '../components/ImageUploadGrid';
import { createBoat, fetchBoatById, deleteBoatImage, updateBoatDetails } from '../apis/boat';
import Error from '../helpers/Error';
import { useDispatch, useSelector } from 'react-redux';
import { setBoats, updateBoat } from '../../store/boatSlice';
import AbaciLoader from '../components/AbaciLoader';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@react-native-vector-icons/feather';

const { height: screenHeight } = Dimensions.get('window');

const AddBoatScreen = () => {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const toastContext = useContext(ToastContext);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const isDarkMode = useSelector(state => state.themeSlice.isDarkMode);
  const authState = useSelector(state => state.authSlice.authState);
  
  const isEditMode = route.params?.isEditMode || false;
  const boatId = route.params?.boatId;
  const existingBoat = route.params?.boatData;
  const fromBookingScreen = route.params?.fromBookingScreen || false;
  const berthData = route.params?.berthData || null;
  
  const [boatName, setBoatName] = useState('');
  const [boatRegNo, setBoatRegNo] = useState('');
  const [boatLength, setBoatLength] = useState('');
  const [boatWidth, setBoatWidth] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' }
    });
  }, [navigation]);

  useEffect(() => {
    // Animate in from bottom
    slideAnim.setValue(screenHeight);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
    
    if (isEditMode && boatId) {
      loadBoatData();
    }
  }, [isEditMode, boatId]);
  
  const loadBoatData = async () => {
    setIsInitialLoading(true);
    try {
      const boatData = await fetchBoatById(boatId);
      setBoatName(boatData?.name || '');
      setBoatRegNo(boatData?.registration_number || '');
      setBoatLength(boatData?.length ? boatData.length.toString() : '');
      setBoatWidth(boatData?.width ? boatData.width.toString() : '');
      setDescription(boatData?.description || '');
      
      if (boatData?.images && boatData?.images.length > 0) {
        const formattedImages = boatData?.images.map(img => ({
          ...img, 
          isExisting: true 
        }));
        setImages(formattedImages);
      }
    } catch (error) {
      let err_msg = Error(error);
      toastContext.showToast(err_msg, 'short', 'error');
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleImagesChange = async (newImages) => {
    // Check if any existing images were removed
    const currentExistingImages = images.filter(img => img.isExisting);
    const newExistingImages = newImages.filter(img => img.isExisting);
    
    const deletedImages = currentExistingImages.filter(currentImg => 
      !newExistingImages.find(newImg => newImg.id === currentImg.id)
    );
    
    if (deletedImages.length > 0) {
      try {
        await deleteBoatImage(deletedImages[0].id);
        toastContext.showToast('Image deleted successfully!', 'short', 'success');
      } catch (error) {
        let err_msg = Error(error);
        toastContext.showToast(err_msg, 'short', 'error');
      }
    }
    
    setImages(newImages);
  };

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
    } else {
      // Validate boat length against berth length + buffer_length when creating from booking screen
      if (fromBookingScreen && berthData) {
        const boatLengthValue = parseFloat(boatLength);
        const berthLength = berthData.length ? parseFloat(berthData.length) : 0;
        const bufferLength = berthData.buffer_length ? parseFloat(berthData.buffer_length) : 0;
        const usableLength = berthLength + bufferLength;
        
        if (boatLengthValue >= usableLength) {
          newErrors.boatLength = `The Boat length (${boatLengthValue} ft) exceeds the berth's maximum allowed length (${usableLength} ft). Regret to inform that your boat cannot be berthed in this Pontoon`;
        }
      }
    }
    
    // Boat width is optional, but if provided, it must be valid
    if (boatWidth.trim() && (isNaN(boatWidth) || parseFloat(boatWidth) <= 0)) {
      newErrors.boatWidth = 'Please enter a valid width';
    }
    
    // Images are optional
    // if (images.length === 0) {
    //   newErrors.images = 'At least one image is required';
    // }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const boatData = {
      name: boatName.trim(),
      registration_number: boatRegNo.trim(),
      length: boatLength.trim(),
      width: boatWidth.trim(),
      description: description.trim(),
    };

    try {
      let response;
      const customerId = authState?.id;
      
      if (isEditMode) {
        const newImages = images.filter(img => !img.isExisting);
        response = await updateBoatDetails(boatId, boatData, newImages, customerId);
        dispatch(updateBoat(response));
        toastContext.showToast('Boat updated successfully!', 'short', 'success');
      } else {
        response = await createBoat(boatData, images, customerId);
        dispatch(setBoats(response));
        toastContext.showToast('Boat added successfully!', 'short', 'success');
      }
      handleGoBack();
    } catch (error) {
      let err_msg = Error(error);
      toastContext.showToast(err_msg, 'short', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'flex' }
    });
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? Colors.dark_bg_color : Colors.bg_color }]}>
      <StatusBar 
        translucent={true}
        backgroundColor="transparent" 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
      />
      
      {/* Background Overlay */}
      <View style={[styles.overlay, { backgroundColor: isDarkMode ? Colors.dark_bg_color : Colors.bg_color }]} />
      
      <Animated.View style={[styles.screenContainer, { 
        transform: [{ translateY: slideAnim }],
        backgroundColor: isDarkMode ? Colors.dark_container : Colors.white
      }]}>
        <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? Colors.dark_container : Colors.white }]} edges={['left','right','bottom']}>
          {/* Header */}
          <View style={[styles.header, { 
            backgroundColor: isDarkMode ? Colors.dark_container : Colors.white,
            borderBottomColor: isDarkMode ? Colors.dark_separator : '#F2F2F2'
          }]}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIcon}>
                {isEditMode ? (
                    <Feather name="edit" size={18} color={Colors.primary} />
                  ) : (
                    <Ionicons name="add-circle-outline" size={25} color={Colors.primary} />
                )}
              </View>
              <Text style={[styles.headerTitle, { color: isDarkMode ? Colors.white : Colors.heading_font }]}>{isEditMode ? 'Edit Boat Details' : 'Add New Boat'}</Text>
            </View>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleGoBack}
            >
              <Ionicons name="close" size={16} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollContainer} 
            showsVerticalScrollIndicator={false} 
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets={true}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Form Fields */}
            <View style={styles.formContainer}>
              {/* Boat Name */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: isDarkMode ? Colors.white : Colors.sub_heading_font }]}>Boat Name*</Text>
                <TextInput
                  style={[styles.input, errors.boatName && styles.inputError, { 
                    backgroundColor: isDarkMode ? Colors.dark_container : Colors.white,
                    color: isDarkMode ? Colors.white : Colors.black,
                    borderColor: isDarkMode ? Colors.input_border_dark : Colors.input_border_light
                  }]}
                  value={boatName}
                  onChangeText={(text) => {
                    setBoatName(text);
                    if (errors.boatName) {
                      setErrors(prev => ({ ...prev, boatName: '' }));
                    }
                  }}
                  placeholder="Enter boat name"
                  placeholderTextColor={isDarkMode ? Colors.dark_text_secondary : "#C8C8C8"}
                />
                {errors.boatName && <Text style={styles.errorText}>{errors.boatName}</Text>}
              </View>

              {/* Boat Reg No */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: isDarkMode ? Colors.white : Colors.sub_heading_font }]}>Boat Reg No*</Text>
                <TextInput
                  style={[styles.input, errors.boatRegNo && styles.inputError, { 
                    backgroundColor: isDarkMode ? Colors.dark_container : Colors.white,
                    color: isDarkMode ? Colors.white : Colors.black,
                    borderColor: isDarkMode ? Colors.input_border_dark : Colors.input_border_light
                  }]}
                  value={boatRegNo}
                  onChangeText={(text) => {
                    setBoatRegNo(text);
                    if (errors.boatRegNo) {
                      setErrors(prev => ({ ...prev, boatRegNo: '' }));
                    }
                  }}
                  placeholder="Enter registration number"
                  placeholderTextColor={isDarkMode ? Colors.dark_text_secondary : "#C8C8C8"}
                />
                {errors.boatRegNo && <Text style={styles.errorText}>{errors.boatRegNo}</Text>}
              </View>

              {/* Boat Length */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: isDarkMode ? Colors.white : Colors.sub_heading_font }]}>Boat Length (ft)*</Text>
                <TextInput
                  style={[styles.input, errors.boatLength && styles.inputError, { 
                    backgroundColor: isDarkMode ? Colors.dark_container : Colors.white,
                    color: isDarkMode ? Colors.white : Colors.black,
                    borderColor: isDarkMode ? Colors.input_border_dark : Colors.input_border_light
                  }]}
                  value={boatLength}
                  onChangeText={(text) => {
                    setBoatLength(text);
                    if (errors.boatLength) {
                      setErrors(prev => ({ ...prev, boatLength: '' }));
                    }
                  }}
                  placeholder="Enter boat length (ft)"
                  placeholderTextColor={isDarkMode ? Colors.dark_text_secondary : "#C8C8C8"}
                  keyboardType="numeric"
                />
                {errors.boatLength && <Text style={styles.errorText}>{errors.boatLength}</Text>}
              </View>

              {/* Boat Width */}
              {/* <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: isDarkMode ? Colors.white : Colors.sub_heading_font }]}>Boat Width (ft)</Text>
                <TextInput
                  style={[styles.input, errors.boatWidth && styles.inputError, { 
                    backgroundColor: isDarkMode ? Colors.dark_container : Colors.white,
                    color: isDarkMode ? Colors.white : Colors.black,
                    borderColor: isDarkMode ? Colors.input_border_dark : Colors.input_border_light
                  }]}
                  value={boatWidth}
                  onChangeText={(text) => {
                    setBoatWidth(text);
                    if (errors.boatWidth) {
                      setErrors(prev => ({ ...prev, boatWidth: '' }));
                    }
                  }}
                  placeholder="Enter boat width (ft)"
                  placeholderTextColor={isDarkMode ? Colors.dark_text_secondary : "#C8C8C8"}
                  keyboardType="numeric"
                />
                {errors.boatWidth && <Text style={styles.errorText}>{errors.boatWidth}</Text>}
              </View> */}

              {/* Description */}
              {/* <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: isDarkMode ? Colors.white : Colors.sub_heading_font }]}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea, errors.description && styles.inputError, { 
                    backgroundColor: isDarkMode ? Colors.dark_container : Colors.white,
                    color: isDarkMode ? Colors.white : Colors.black,
                    borderColor: isDarkMode ? Colors.input_border_dark : Colors.input_border_light
                  }]}
                  value={description}
                  onChangeText={(text) => {
                    setDescription(text);
                    if (errors.description) {
                      setErrors(prev => ({ ...prev, description: '' }));
                    }
                  }}
                  placeholder="Enter boat description"
                  placeholderTextColor={isDarkMode ? Colors.dark_text_secondary : "#C8C8C8"}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
              </View> */}

              {/* Boat Images */}
              <View style={styles.inputGroup}>
                <ImageUploadGrid
                  images={images}
                  onImagesChange={handleImagesChange}
                  maxImages={4}
                  label="Boat Images"
                  disabled={isLoading}
                  showLoading={isLoading}
                  allowDelete={true}
                  isDarkMode={isDarkMode}
                  gridStyle={styles.centeredImageGrid}
                />
                {errors.images && <Text style={styles.errorText}>{errors.images}</Text>}
              </View>
            </View>
          </ScrollView>

          {/* Save Button */}
          <View style={[styles.buttonContainer, { backgroundColor: isDarkMode ? Colors.dark_container : Colors.white }]}>
            <TouchableOpacity 
              style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} 
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <AntDesign name="save" size={20} color="white" />
                  <Text style={styles.saveButtonText}>{isEditMode ? 'Update' : 'Save'}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>
      
      <AbaciLoader visible={isLoading || isInitialLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  screenContainer: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 50, 
    marginHorizontal: 3,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  safeArea: {
    flex: 1,
    paddingTop: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
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
  scrollContent: {
    paddingBottom: 180,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: '#4C4C4C',
    marginBottom: 12,
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
  saveButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.white,
    marginLeft: 10,
  },
  centeredImageGrid: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AddBoatScreen;
