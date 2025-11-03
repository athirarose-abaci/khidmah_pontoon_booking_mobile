import React, { useEffect, useRef, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Animated, Dimensions, ScrollView, StatusBar, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/customStyles';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { AntDesign } from '@react-native-vector-icons/ant-design';
import { Dropdown } from 'react-native-element-dropdown';
import { ToastContext } from '../../context/ToastContext';
import DocumentUpload from '../DocumentUpload';
import { createTicket, ticketCategories } from '../../apis/tickets';
import Error from '../../helpers/Error';
import { useDispatch, useSelector } from 'react-redux';
import { addTickets } from '../../../store/ticketSlice';
import AbaciLoader from '../AbaciLoader';

const { height: screenHeight } = Dimensions.get('window');

const CreateTicketModal = ({ visible, onClose, onCreated }) => {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const toastContext = useContext(ToastContext);
  const dispatch = useDispatch();
  const authState = useSelector(state => state.authSlice.authState);
  const isDarkMode = useSelector(state => state.themeSlice?.isDarkMode);
  
  const [issueCategory, setIssueCategory] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [descriptionHeight, setDescriptionHeight] = useState(80);

  useEffect(() => {
    if (visible) {
      // Animate in from bottom
      slideAnim.setValue(screenHeight);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
      // Load ticket categories when modal opens
      loadTicketCategories();
    } else {
      // Reset form when modal closes
      setIssueCategory('');
      setSelectedCategoryId(null);
      setSubject('');
      setDescription('');
      setFiles([]);
      setErrors({});
    }
  }, [visible]);

  const loadTicketCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const categories = await ticketCategories();
      
      const transformedData = categories.map(category => ({
        label: category.name || '',
        value: category.id,
        id: category.id,
      }));
      
      setCategoryData(transformedData);
    } catch (error) {
      let err_msg = Error(error);
      toastContext.showToast(err_msg, 'short', 'error');
    } finally {
      setIsLoadingCategories(false);
    }
  };


  const validateForm = () => {
    const newErrors = {};
    
    if (!selectedCategoryId) {
      newErrors.issueCategory = 'Issue category is required';
    }
    
    // Only require subject if "Others" category is selected
    const selectedCategory = categoryData.find(cat => cat.value === selectedCategoryId);
    if (selectedCategory && selectedCategory.label.toLowerCase() === 'others' && !subject.trim()) {
      newErrors.subject = 'Subject is required';
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

    setIsLoading(true);

    const selectedCategory = categoryData.find(cat => cat.value === selectedCategoryId);
    const isOthersCategory = selectedCategory && selectedCategory.label.toLowerCase() === 'others';
    const subjectValue = isOthersCategory ? subject.trim() : '';
    const ticketData = {
      issue_category: selectedCategoryId,
      subject: subjectValue.trim(),
      description: description.trim(),
    };
    try {
      const customerId = authState?.id;
      
      const response = await createTicket(ticketData, files, customerId);
      dispatch(addTickets([response]));
      toastContext.showToast('Ticket created successfully!', 'short', 'success');
      onCreated?.(response);
      onClose();
    } catch (error) {
      let err_msg = Error(error);
      toastContext.showToast(err_msg, 'short', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: screenHeight,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <StatusBar 
          translucent={true}
          backgroundColor="transparent" 
          barStyle={isDarkMode ? "light-content" : "dark-content"} 
        />
        
        {/* Background Overlay */}
        <View style={[styles.overlay, { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.09)' }]} />
        
        <Animated.View style={[styles.screenContainer, { transform: [{ translateY: slideAnim }], backgroundColor: isDarkMode ? Colors.dark_container : 'white' }]}>
          <SafeAreaView style={styles.safeArea} edges={['left','right','bottom']}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.headerIcon}>
                  <Ionicons name="add-circle-outline" size={25} color={Colors.primary} />
                </View>
                <Text style={[styles.headerTitle, { color: isDarkMode ? Colors.white : '#4C4C4C' }]}>Raise A Ticket</Text>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={handleClose}
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
              {/* Subject */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: isDarkMode ? Colors.label_dark : Colors.label_light }]}>Subject*</Text>
                <Dropdown
                  style={[styles.dropdown, errors.issueCategory && styles.inputError, { 
                    backgroundColor: isDarkMode ? Colors.dark_container : Colors.white, 
                    borderColor: isDarkMode ? Colors.input_border_dark : Colors.input_border_light
                  }]}
                  placeholderStyle={[styles.placeholderStyle, { color: isDarkMode ? Colors.dark_text_secondary : '#C8C8C8' }]}
                  selectedTextStyle={[styles.selectedTextStyle, { color: isDarkMode ? Colors.white : '#000', fontWeight: '600' }]}
                  inputSearchStyle={[styles.inputSearchStyle, { 
                    color: isDarkMode ? Colors.white : '#333', 
                    backgroundColor: isDarkMode ? Colors.dropdown_container_dark : Colors.dropdown_container_light
                  }]}
                  iconStyle={styles.iconStyle}
                  data={categoryData}
                  search
                  maxHeight={400}
                  labelField="label"
                  valueField="value"
                  placeholder="Select issue category"
                  searchPlaceholder="Search categories..."
                  value={selectedCategoryId}
                  onChange={item => {
                    setSelectedCategoryId(item.value);
                    setIssueCategory(item.label);
                    if (errors.issueCategory) {
                      setErrors(prev => ({ ...prev, issueCategory: '' }));
                    }
                    // Clear subject when switching away from "Others" category
                    if (item.label.toLowerCase() !== 'others') {
                      setSubject('');
                      if (errors.subject) {
                        setErrors(prev => ({ ...prev, subject: '' }));
                      }
                    }
                  }}
                  renderLeftIcon={() => (
                    <Ionicons name="list" size={20} color={isDarkMode ? Colors.dark_text_secondary : "#C8C8C8"} style={styles.dropdownIcon} />
                  )}
                  renderRightIcon={() => (
                    <Ionicons name="chevron-down" size={20} color={isDarkMode ? Colors.dark_text_secondary : "#C8C8C8"} />
                  )}
                  itemContainerStyle={{ backgroundColor: isDarkMode ? Colors.dropdown_container_dark : Colors.dropdown_container_light }}
                  itemTextStyle={{ color: isDarkMode ? Colors.white : '#333' }}
                  activeColor={isDarkMode ? Colors.dropdown_selected_dark : Colors.dropdown_selected_light}
                  containerStyle={{ 
                    backgroundColor: isDarkMode ? Colors.dropdown_container_dark : Colors.dropdown_container_light, 
                    borderRadius: 8, 
                    elevation: isDarkMode ? 0 : 2, 
                    shadowOpacity: isDarkMode ? 0 : 0.1, 
                    borderWidth: 1, 
                    borderColor: isDarkMode ? Colors.dropdown_border_dark : Colors.dropdown_border_light 
                  }}
                />
                {errors.issueCategory && <Text style={styles.errorText}>{errors.issueCategory}</Text>}
              </View>

                {/* Subject - Only show for "Others" category */}
                {(() => {
                  const selectedCategory = categoryData.find(cat => cat.value === selectedCategoryId);
                  const isOthersCategory = selectedCategory && selectedCategory.label.toLowerCase() === 'others';
                  
                  return isOthersCategory ? (
                    <View style={styles.inputGroup}>
                      <Text style={[styles.label, { color: isDarkMode ? Colors.label_dark : Colors.label_light }]}>Specify Subject*</Text>
                      <TextInput
                        style={[styles.input, errors.subject && styles.inputError, { 
                          backgroundColor: isDarkMode ? Colors.size_bg_dark : '#F5F5F5',
                          color: isDarkMode ? Colors.white : '#4C4C4C',
                          borderColor: isDarkMode ? Colors.input_border_dark : '#E5E5E5'
                        }]}
                        value={subject}
                        onChangeText={(text) => {
                          setSubject(text);
                          if (errors.subject) {
                            setErrors(prev => ({ ...prev, subject: '' }));
                          }
                        }}
                        placeholder="Enter subject"
                        placeholderTextColor={isDarkMode ? Colors.font_gray : '#C8C8C8'}
                      />
                      {errors.subject && <Text style={styles.errorText}>{errors.subject}</Text>}
                    </View>
                  ) : null;
                })()}

                {/* Description */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: isDarkMode ? Colors.label_dark : Colors.label_light }]}>Description*</Text>
                  <TextInput
                    style={[styles.input, styles.textArea, errors.description && styles.inputError, { 
                      backgroundColor: isDarkMode ? Colors.size_bg_dark : '#F5F5F5',
                      color: isDarkMode ? Colors.white : '#4C4C4C',
                      borderColor: isDarkMode ? Colors.input_border_dark : '#E5E5E5',
                      height: Math.max(80, descriptionHeight)
                    }]}
                    value={description}
                    onChangeText={(text) => {
                      setDescription(text);
                      if (errors.description) {
                        setErrors(prev => ({ ...prev, description: '' }));
                      }
                    }}
                    placeholder="Enter description"
                    placeholderTextColor={isDarkMode ? Colors.font_gray : '#C8C8C8'}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    onContentSizeChange={(e) => setDescriptionHeight(e.nativeEvent.contentSize.height)}
                    scrollEnabled={false}
                  />
                  {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
                </View>

                {/* Attach Files */}
                <View style={styles.inputGroup}>
                  <DocumentUpload 
                    label="Attach Files/Screenshots" 
                    helperText={null}
                    files={files}
                    onChange={setFiles}
                    disabled={isLoading}
                    isDarkMode={isDarkMode}
                  />
                </View>
              </View>
            </ScrollView>

            {/* Save Button */}
            <View style={styles.buttonContainer}>
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
                    <Text style={styles.saveButtonText}>Save</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>
        
        <AbaciLoader visible={isLoading} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.09)',
  },
  screenContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
    marginBottom: 10,
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
  scrollContent: {
    paddingBottom: 50,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  inputGroup: {
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: '#4C4C4C',
    marginBottom: 10,
    marginTop: 5,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
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
    height: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
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
  // Dropdown styles
  dropdown: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    minHeight: 50,
  },
  placeholderStyle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#C8C8C8',
  },
  selectedTextStyle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#4C4C4C',
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  dropdownIcon: {
    marginRight: 8,
  },
  // File upload styles
  subtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 12,
  },
  fileUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
  },
  fileUploadText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.primary,
    marginLeft: 8,
  },
  fileList: {
    marginTop: 12,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4C4C4C',
    marginLeft: 12,
    flex: 1,
  },
  removeFileButton: {
    padding: 4,
  },
});

export default CreateTicketModal;
