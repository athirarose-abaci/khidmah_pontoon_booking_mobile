import React, { useCallback, useContext, useLayoutEffect, useState, useEffect } from 'react';
import { StatusBar, StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { Octicons } from '@react-native-vector-icons/octicons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../constants/customStyles';
import BookingSuccessModal from '../components/modals/BookingSuccessModal';
import { PontoonDetailsTab, BoatDetailsTab, BookingDetailsTab } from '../components/newBooking/index';
import AbaciLoader from '../components/AbaciLoader';
import { fetchPontoons } from '../apis/pontoon';
import { fetchBerths } from '../apis/berth';
import { fetchBoatsList } from '../apis/boat';
import { createBooking, updateBooking } from '../apis/booking';
import { useDispatch, useSelector } from 'react-redux';
import { setPontoons } from '../../store/pontoonSlice';
import { setBerths } from '../../store/berthSlice';
import Error from '../helpers/Error';
import { ToastContext } from '../context/ToastContext';
import moment from 'moment';

const STEPS = {
  PONTOON_DETAILS: 'pontoon_details',
  BOAT_DETAILS: 'boat_details', 
  BOOKING_DETAILS: 'booking_details'
};

const NewBookingScreen = ({ navigation, route }) => {
  const [currentStep, setCurrentStep] = useState(STEPS.PONTOON_DETAILS); 
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  
  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [editingBookingData, setEditingBookingData] = useState(null);

  const dispatch = useDispatch();
  const toastContext = useContext(ToastContext);
  const currentAuthState = useSelector(state => state.authSlice.authState);
  
  const [pontoonName, setPontoonName] = useState('');
  const [berthName, setBerthName] = useState('');
  const [pontoonsData, setPontoonsData] = useState([]);
  const [berthsData, setBerthsData] = useState([]);
  const [boatsData, setBoatsData] = useState([]);
  
  const [bookingDetails, setBookingDetails] = useState({
    arrivalDate: '',
    arrivalTime: '',
    hours: '',
    minutes: '',
    departureDate: '',
    departureTime: ''
  });

  const handleBookingDetailsChange = (field, value) => {
    setBookingDetails(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      return updated;
    });
  };
  
  const [selectedBoat, setSelectedBoat] = useState('');
  const [noOfPassengers, setNoOfPassengers] = useState('');

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' }
    });
  }, [navigation]);

  // Handle edit mode initialization
  useEffect(() => {
    if (route?.params?.editMode) {
      setIsEditMode(true);
      setEditingBookingId(route?.params?.bookingId);
      setEditingBookingData(route?.params?.bookingData);
      
      if (route?.params?.bookingData) {
        const bookingData = route?.params?.bookingData;
        
        // Set pontoon and berth data
        if (bookingData?.pontoon) {
          setPontoonName(bookingData?.pontoon?.name || '');
        }
        if (bookingData?.berth) {
          setBerthName(bookingData?.berth?.name || '');
        }
        
        // Set boat data
        if (bookingData?.boat) {
          setSelectedBoat(bookingData?.boat?.id || '');
        }
        if (bookingData?.passengers) {
          setNoOfPassengers(bookingData?.passengers?.toString());
        }
        
        // Set booking details
        if (bookingData.start_date) {
          const startDate = moment(bookingData?.start_date).format('DD/MM/YYYY');
          const startTime = moment(bookingData?.start_date).format('HH:mm');
          const endDate = bookingData?.end_date ? moment(bookingData?.end_date).format('DD/MM/YYYY') : '';
          const endTime = bookingData?.end_date ? moment(bookingData?.end_date).format('HH:mm') : '';
          
          let hours = '';
          let minutes = '';
          if (bookingData?.start_date && bookingData?.end_date) {
            const startMoment = moment(bookingData?.start_date);
            const endMoment = moment(bookingData?.end_date);
            const duration = moment.duration(endMoment.diff(startMoment));
            hours = Math.floor(duration.asHours()).toString();
            minutes = duration.minutes().toString();
          }
          
          setBookingDetails(prev => ({
            ...prev,
            arrivalDate: startDate,
            arrivalTime: startTime,
            departureDate: endDate,
            departureTime: endTime,
            hours: hours,
            minutes: minutes
          }));
        }
      }
      
      setCurrentStep(STEPS.BOOKING_DETAILS);
    }
  }, [route?.params]);

  const validatePontoonDetails = () => {
    return pontoonName.trim() !== '' && berthName.trim() !== '';
  };

  const validateBoatDetails = () => {
    return selectedBoat && selectedBoat !== '' && noOfPassengers.trim() !== '' && !isNaN(noOfPassengers) && parseInt(noOfPassengers) > 0;
  };

  const validateBookingDetails = () => {
    return true; 
  };

  const isCurrentStepValid = () => {
    if (currentStep === STEPS.PONTOON_DETAILS) {
      return validatePontoonDetails();
    } else if (currentStep === STEPS.BOAT_DETAILS) {
      return validateBoatDetails();
    } else {
      return validateBookingDetails();
    }
  };

  const handleNext = async () => {
    let canProceed = false;

    if (currentStep === STEPS.PONTOON_DETAILS) {
      canProceed = validatePontoonDetails();
      if (canProceed) {
        setIsLoading(true);
        setTimeout(() => {
          setCurrentStep(STEPS.BOAT_DETAILS);
          setIsLoading(false);
        }, 500);
      } else {
        toastContext.showToast("Please fill in both Pontoon Name and Berth Name", "short", "error");
      }
    } else if (currentStep === STEPS.BOAT_DETAILS) {
      canProceed = validateBoatDetails();
      if (canProceed) {
        setIsLoading(true);
        setTimeout(() => {
          setCurrentStep(STEPS.BOOKING_DETAILS);
          setIsLoading(false);
        }, 500);
      } else {
        toastContext.showToast("Please fill in all required boat details", "short", "error");
      }
    } else {
      canProceed = validateBookingDetails();
      if (canProceed) {
        if (isEditMode) {
          await handleUpdateBooking();
        } else {
          await handleCreateBooking();
        }
      } else {
        toastContext.showToast("Please fill in all required booking details", "short", "error");
      }
    }
  };

  const handleCreateBooking = async () => {
    setIsLoading(true);
    try {
      const selectedBoatObj = boatsData.find(boat => boat?.id === selectedBoat);
      if (!selectedBoatObj) {
        toastContext.showToast("Selected boat not found", "short", "error");
        return;
      }

      const selectedBerthObj = berthsData.find(berth => berth?.name === berthName);
      if (!selectedBerthObj) {
        toastContext.showToast("Selected berth not found", "short", "error");
        return;
      }

      const formatDateTimeForAPI = (dateString, timeString) => {
        if (!dateString || !timeString) return '';
        
        const momentDate = moment(`${dateString} ${timeString}`, 'DD/MM/YYYY HH:mm');
        
        return momentDate.toISOString();
      };

      const bookingPayload = {
        boat: selectedBoatObj?.id,
        customer: currentAuthState?.id,
        berth: selectedBerthObj?.id,
        start_date: formatDateTimeForAPI(bookingDetails?.arrivalDate, bookingDetails?.arrivalTime),
        end_date: formatDateTimeForAPI(bookingDetails?.departureDate, bookingDetails?.departureTime),
        passengers: parseInt(noOfPassengers)
      };

      const response = await createBooking(bookingPayload);
      setShowSuccessModal(true);
    } catch (error) {
      let err_msg = Error(error);
      toastContext.showToast(err_msg, "short", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBooking = async () => {
    setIsLoading(true);
    try {
      const formatDateTimeForAPI = (dateString, timeString) => {
        if (!dateString || !timeString) return '';
        
        const momentDate = moment(`${dateString} ${timeString}`, 'DD/MM/YYYY HH:mm');
        
        return momentDate.toISOString();
      };

      const bookingPayload = {
        boat: editingBookingData?.boat?.id,
        customer: currentAuthState?.id,
        berth: editingBookingData?.berth?.id,
        start_date: formatDateTimeForAPI(bookingDetails?.arrivalDate, bookingDetails?.arrivalTime),
        end_date: formatDateTimeForAPI(bookingDetails?.departureDate, bookingDetails?.departureTime),
        passengers: parseInt(noOfPassengers)
      };

      const response = await updateBooking(editingBookingId, bookingPayload);
      dispatch(updateBooking(response));
      setShowSuccessModal(true);
      toastContext.showToast("Booking updated successfully!", "short", "success");
      navigation.goBack();
    } catch (error) {
      let err_msg = Error(error);
      toastContext.showToast(err_msg, "short", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoHome = () => {
    setShowSuccessModal(false);
    navigation.goBack();
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  const handleStepClick = (step) => {
    if (isEditMode && step !== STEPS.BOOKING_DETAILS) {
      return;
    }
    setCurrentStep(step);
  };

  const handleBackNavigation = () => {
    if (isEditMode) {
      navigation.goBack();
      return;
    }
    
    if (currentStep === STEPS.PONTOON_DETAILS) {
      navigation.goBack();
    } else if (currentStep === STEPS.BOAT_DETAILS) {
      setCurrentStep(STEPS.PONTOON_DETAILS);
    } else if (currentStep === STEPS.BOOKING_DETAILS) {
      setCurrentStep(STEPS.BOAT_DETAILS);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (!isEditMode) {
        fetchPontoonsData();
        fetchBerthsData();
        fetchBoatsData();
      }
    }, [isEditMode])
  );

   const fetchBerthsData = async (pontoonId) => {
    setIsLoading(true);
    try {
      const response = await fetchBerths(pontoonId);
      setBerthsData(response || []);
      dispatch(setBerths(response || []));
      
      if (response && response?.length === 1) {
        setBerthName(response?.[0]?.name);
      } else {
        setBerthName('');
      }
    } catch (error) {
      let err_msg = Error(error);
      toastContext.showToast(err_msg, "short", "error");
    } finally {
      setIsLoading(false);
    }
  }

  const fetchPontoonsData = async () => {
    setIsLoading(true);
    try {
      const response = await fetchPontoons();
      const pontoons = response || [];
      setPontoonsData(pontoons);
      dispatch(setPontoons(pontoons));
      
      if(response?.length === 1) {
        const singlePontoon = pontoons[0];
        setPontoonName(singlePontoon?.name);
        await fetchBerthsData(singlePontoon?.id);
      } else {
        setBerthsData([]);
      }
    } catch (error) {
      let err_msg = Error(error);
      toastContext.showToast(err_msg, "short", "error");
    } finally {
      setIsLoading(false);
    }
  }

  const fetchBoatsData = async () => {
    setIsLoading(true);
    try {
      const response = await fetchBoatsList();
      setBoatsData(response || []);
    }
    catch (error) {
      let err_msg = Error(error);
      toastContext.showToast(err_msg, "short", "error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <StatusBar backgroundColor={Colors.bg_color} barStyle="dark-content" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <MaterialIcons
            name="chevron-left"
            size={30}
            color={Colors.font_gray}
            style={styles.backButton}
            onPress={handleBackNavigation}
          />
          <Text style={styles.headerTitle}>{isEditMode ? "Edit Booking" : "New Booking"}</Text>
          {currentStep === STEPS.BOAT_DETAILS && (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.headerAddBoatActionButton}
              onPress={() => navigation.navigate('AddBoat')}
            >
              <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
              <Text style={styles.headerAddBoatActionText}>Add new boat</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Instruction Box */}
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            {currentStep === STEPS.PONTOON_DETAILS 
              ? "Select your preferred pontoon\nto book."
              : currentStep === STEPS.BOAT_DETAILS
              ? "Select your boat or enter\ndetails of the boat"
              : "Select your preferred date to\nbook a pontoon."
            }
          </Text>
        </View>

        {/* Progress Indicators */}
        <View style={styles.stepProgressContainer}>
          <TouchableOpacity 
            style={[
              styles.stepIconContainer, 
              currentStep === STEPS.PONTOON_DETAILS ? styles.activeIconContainer : styles.inactiveIconContainer,
              isEditMode && styles.disabledStepContainer
            ]}
            onPress={() => !isEditMode && handleStepClick(STEPS.PONTOON_DETAILS)}
            disabled={isEditMode}
          >
            <View style={[styles.stepIcon, currentStep === STEPS.PONTOON_DETAILS ? styles.activeIcon : styles.inactiveIcon]}>
              <Ionicons name="location" size={22} color={currentStep === STEPS.PONTOON_DETAILS ? Colors.white : "#6F6F6F"} />
            </View>
          </TouchableOpacity>
          <View style={styles.stepConnectorLine} />
          <TouchableOpacity 
            style={[
              styles.stepIconContainer, 
              currentStep === STEPS.BOAT_DETAILS ? styles.activeIconContainer : styles.inactiveIconContainer,
              isEditMode && styles.disabledStepContainer
            ]}
            onPress={() => !isEditMode && handleStepClick(STEPS.BOAT_DETAILS)}
            disabled={isEditMode}
          >
            <View style={[styles.stepIcon, currentStep === STEPS.BOAT_DETAILS ? styles.activeIcon : styles.inactiveIcon]}>
              <Ionicons name="boat-outline" size={22} color={currentStep === STEPS.BOAT_DETAILS ? Colors.white : "#6F6F6F"}/>
            </View>
          </TouchableOpacity>
          <View style={styles.stepConnectorLine} />
          <TouchableOpacity 
            style={[styles.stepIconContainer, currentStep === STEPS.BOOKING_DETAILS ? styles.activeIconContainer : styles.inactiveIconContainer]}
            onPress={() => handleStepClick(STEPS.BOOKING_DETAILS)}
          >
            <View style={[styles.stepIcon, currentStep === STEPS.BOOKING_DETAILS ? styles.activeIcon : styles.inactiveIcon]}>
              <Octicons name="people" size={22} color={currentStep === STEPS.BOOKING_DETAILS ? Colors.white : "#6F6F6F"} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Scrollable Content */}
        <ScrollView 
          style={styles.mainScrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollableContent}
        >
          {/* Content Card */}
          <View style={[
            styles.mainBookingCard,
            currentStep === STEPS.PONTOON_DETAILS ? styles.pontoonDetailsCard : 
            currentStep === STEPS.BOAT_DETAILS ? styles.boatDetailsCard : 
            styles.bookingDetailsCard
          ]}>
          <View style={styles.cardHeaderContainer}>
            <View style={[styles.cardHeaderIconContainer, currentStep === STEPS.PONTOON_DETAILS ? styles.activeCardIconContainer : currentStep === STEPS.BOAT_DETAILS ? styles.activeCardIconContainer : currentStep === STEPS.BOOKING_DETAILS ? styles.activeCardIconContainer : styles.inactiveCardIconContainer]}>
              <View style={[styles.cardHeaderIcon, currentStep === STEPS.PONTOON_DETAILS ? styles.activeCardIcon : currentStep === STEPS.BOAT_DETAILS ? styles.activeCardIcon : currentStep === STEPS.BOOKING_DETAILS ? styles.activeCardIcon : styles.inactiveCardIcon]}>
                {currentStep === STEPS.PONTOON_DETAILS ? (
                  <Ionicons name="location" size={16} color={Colors.white} />
                ) : currentStep === STEPS.BOAT_DETAILS ? (
                  <Ionicons name="boat-outline" size={16} color={Colors.white} />
                ) : (
                  <Octicons name="people" size={16} color={Colors.white} />
                )}
              </View>
            </View>
            <Text style={styles.cardHeaderText}>
              {currentStep === STEPS.PONTOON_DETAILS ? "Pontoon Details" : currentStep === STEPS.BOAT_DETAILS ? "Boat Details" : "Booking Details"}
            </Text>
          </View>
          <View style={styles.cardHeaderSeparator} />

          {currentStep === STEPS.PONTOON_DETAILS ? (
            <PontoonDetailsTab
              pontoonName={pontoonName}
              setPontoonName={setPontoonName}
              berthName={berthName}
              setBerthName={setBerthName}
              pontoons={pontoonsData}
              berths={berthsData}
              onPontoonSelect={(id) => fetchBerths(id)}
            />
          ) : currentStep === STEPS.BOAT_DETAILS ? (
            <BoatDetailsTab
              selectedBoat={selectedBoat}
              setSelectedBoat={setSelectedBoat}
              noOfPassengers={noOfPassengers}
              setNoOfPassengers={setNoOfPassengers}
              boats={boatsData}
            />
          ) : currentStep === STEPS.BOOKING_DETAILS ? (
            <BookingDetailsTab
              bookingDetails={bookingDetails}
              onBookingDetailsChange={handleBookingDetailsChange}
              berthsData={berthsData}
              pontoonName={pontoonName}
              berthName={berthName}
            />
          ) : null}
          </View>
        </ScrollView>

        <TouchableOpacity 
          style={[
            styles.primaryActionButton, 
            !isCurrentStepValid() && styles.disabledButton
          ]} 
          onPress={handleNext}
          disabled={!isCurrentStepValid()}
        >
          <Text style={[
            styles.primaryActionButtonText,
            !isCurrentStepValid() && styles.disabledButtonText
          ]}>
            {currentStep === STEPS.PONTOON_DETAILS ? "Next" : currentStep === STEPS.BOAT_DETAILS ? "Next" : (isEditMode ? "Update Booking" : "Book")}
          </Text>
        </TouchableOpacity>
      </View>

      <AbaciLoader visible={isLoading} />

      {/* Success Modal */}
      <BookingSuccessModal
        visible={showSuccessModal}
        onClose={handleCloseModal}
        onGoHome={handleGoHome}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg_color,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    marginTop: 25,
    paddingRight: 12,
  },
  backButton: {
    marginLeft: 10,
    marginTop: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.font_gray,
    marginLeft: 5,
    flex: 1,
  },
  headerAddBoatActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headerAddBoatActionText: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: Colors.primary,
    marginLeft: 6,
  },
  instructionContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 26,
    marginBottom: 30,
  },
  instructionText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.sub_heading_font,
    textAlign: 'center',
  },
  stepProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    marginHorizontal: 26,
    paddingHorizontal: 20,
  },
  stepConnectorLine: {
    width: 30,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 5,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconContainer: {
    backgroundColor: `${Colors.primary}40`, 
  },
  inactiveIconContainer: {
    backgroundColor: 'transparent',
  },
  disabledStepContainer: {
    opacity: 0.5,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIcon: {
    backgroundColor: Colors.primary,
  },
  inactiveIcon: {
    backgroundColor: '#D9D9D9',
  },
  mainScrollContainer: {
    flex: 1,
  },
  scrollableContent: {
    paddingBottom: 20,
  },
  mainBookingCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 26,
    marginBottom: 30,
    width: '90%',
  },
  cardHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardHeaderIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  activeCardIconContainer: {
    backgroundColor: `${Colors.primary}40`, 
  },
  inactiveCardIconContainer: {
    backgroundColor: 'transparent',
  },
  cardHeaderIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCardIcon: {
    backgroundColor: Colors.primary,
  },
  inactiveCardIcon: {
    backgroundColor: '#D9D9D9',
  },
  cardHeaderText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
  },
  cardHeaderSeparator: {
    height: 1,
    backgroundColor: '#E8EBEC',
    marginHorizontal: -20,
    marginBottom: 20,
  },
  primaryActionButton: {
    backgroundColor: '#75C8AD',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 26,
    marginBottom: '36%',
  },
  primaryActionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.white,
  },
  disabledButton: {
    backgroundColor: '#C8C8C8',
  },
  disabledButtonText: {
    color: '#999999',
  },
  pontoonDetailsCard: {
    height: 300, 
  },
  boatDetailsCard: {
    height: 400,
  },
  bookingDetailsCard: {
    height: 400, 
  },
});

export default NewBookingScreen;
