import React, { useCallback, useContext, useLayoutEffect, useState, useEffect } from 'react';
import { StatusBar, StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { createBooking, updateBooking as updateBookingAPI } from '../apis/booking';
import { useDispatch, useSelector } from 'react-redux';
import { setPontoons } from '../../store/pontoonSlice';
import { setBerths } from '../../store/berthSlice';
import { addBookings, updateBooking } from '../../store/bookingSlice';
import Error from '../helpers/Error';
import { ToastContext } from '../context/ToastContext';
import moment from 'moment';
import { convertTo24HourFormat, formatTime12Hour } from '../helpers/timeHelper';

const STEPS = {
  PONTOON_DETAILS: 'pontoon_details',
  BOAT_DETAILS: 'boat_details', 
  BOOKING_DETAILS: 'booking_details'
};

const NewBookingScreen = ({ navigation, route }) => {
  const isDarkMode = useSelector(state => state.themeSlice.isDarkMode);
  const [currentStep, setCurrentStep] = useState(() => {
    return route?.params?.editMode ? STEPS.BOAT_DETAILS : STEPS.PONTOON_DETAILS;
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const insets = useSafeAreaInsets();
  
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

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({
        tabBarStyle: { display: 'none' }
      });
    }, [navigation])
  );

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
        if (bookingData?.start_date) {
          const startDate = moment(bookingData?.start_date).format('DD/MM/YYYY');
          const startTime24 = moment(bookingData?.start_date).format('HH:mm');
          const startTime = formatTime12Hour(parseInt(startTime24.split(':')[0]), parseInt(startTime24.split(':')[1]));
          
          const endDate = bookingData?.end_date ? moment(bookingData?.end_date).format('DD/MM/YYYY') : '';
          let endTime = '';
          if (bookingData?.end_date) {
            const endTime24 = moment(bookingData?.end_date).format('HH:mm');
            endTime = formatTime12Hour(parseInt(endTime24.split(':')[0]), parseInt(endTime24.split(':')[1]));
          }
          
          let hours = '';
          let minutes = '';
          if (bookingData?.start_date && bookingData?.end_date) {
            const startMoment = moment(bookingData?.start_date);
            const endMoment = moment(bookingData?.end_date);
            const duration = moment.duration(endMoment.diff(startMoment));
            hours = Math.floor(duration.asHours()).toString().padStart(2, '0');
            minutes = duration.minutes().toString().padStart(2, '0');
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
      
      setCurrentStep(STEPS.PONTOON_DETAILS);
    }
  }, [route?.params]);

  // Handle prefill data from calendar (when clicking availability blocks)
  useEffect(() => {
    if (route?.params?.prefillData && !route?.params?.editMode) {
      const prefillData = route?.params?.prefillData;
      
      // Set pontoon name if provided
      if (prefillData?.pontoonName) {
        setPontoonName(prefillData.pontoonName);
      }
      
      // Set berth name
      if (prefillData?.berthName) {
        setBerthName(prefillData.berthName);
      }
      
      // Set selected boat
      if (prefillData?.selectedBoatId) {
        setSelectedBoat(prefillData.selectedBoatId);
      }
      
      // Set booking details from startDate and endDate
      // Convert ISO strings to Date objects if needed
      if (prefillData?.startDate && prefillData?.endDate) {
        // Handle both Date objects and ISO strings
        const startDateObj = typeof prefillData.startDate === 'string' 
          ? new Date(prefillData.startDate) 
          : prefillData.startDate;
        const endDateObj = typeof prefillData.endDate === 'string' 
          ? new Date(prefillData.endDate) 
          : prefillData.endDate;
        
        const startDate = moment(startDateObj).format('DD/MM/YYYY');
        const startTime24 = moment(startDateObj).format('HH:mm');
        const startTime = formatTime12Hour(parseInt(startTime24.split(':')[0]), parseInt(startTime24.split(':')[1]));
        
        const endDate = moment(endDateObj).format('DD/MM/YYYY');
        const endTime24 = moment(endDateObj).format('HH:mm');
        const endTime = formatTime12Hour(parseInt(endTime24.split(':')[0]), parseInt(endTime24.split(':')[1]));
        
        // Calculate duration
        const startMoment = moment(startDateObj);
        const endMoment = moment(endDateObj);
        const duration = moment.duration(endMoment.diff(startMoment));
        const hours = Math.floor(duration.asHours()).toString().padStart(2, '0');
        const minutes = duration.minutes().toString().padStart(2, '0');
        
        setBookingDetails({
          arrivalDate: startDate,
          arrivalTime: startTime,
          departureDate: endDate,
          departureTime: endTime,
          hours: hours,
          minutes: minutes
        });
      }
    }
  }, [route?.params?.prefillData]);

  const validatePontoonDetails = () => {
    return pontoonName.trim() !== '' && berthName.trim() !== '';
  };

  const validateBoatDetails = () => {
    return selectedBoat && selectedBoat !== '' && noOfPassengers.trim() !== '' && !isNaN(noOfPassengers) && parseInt(noOfPassengers) > 0;
  };

  const validateBookingDetails = () => {
    const { arrivalDate, arrivalTime, hours, minutes, departureDate, departureTime } = bookingDetails;
    
    // Check if all required fields are filled
    const isArrivalDateValid = arrivalDate && arrivalDate.trim() !== '';
    const isArrivalTimeValid = arrivalTime && arrivalTime.trim() !== '';
    const isHoursValid = hours && hours.trim() !== '' && !isNaN(hours) && parseInt(hours) >= 0;
    const isMinutesValid = minutes && minutes.trim() !== '' && !isNaN(minutes) && parseInt(minutes) >= 0 && parseInt(minutes) < 60;
    const isDepartureDateValid = departureDate && departureDate.trim() !== '';
    const isDepartureTimeValid = departureTime && departureTime.trim() !== '';
    
    return isArrivalDateValid && isArrivalTimeValid && isHoursValid && isMinutesValid && isDepartureDateValid && isDepartureTimeValid;
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

      // const formatDateTimeForAPI = (dateString, timeString) => {
      //   if (!dateString || !timeString) return '';
        
      //   const time24Hour = convertTo24HourFormat(timeString);
      //   const momentDate = moment(`${dateString} ${time24Hour}`, 'DD/MM/YYYY HH:mm');
        
      //   return momentDate.toISOString();
      // };

      const toLocalISOString = (date, time) => {
        if (!date || !time) return '';
        
        // Convert date from DD/MM/YYYY to YYYY-MM-DD
        const momentDate = moment(date, 'DD/MM/YYYY');
        const formattedDate = momentDate.format('YYYY-MM-DD');     
        // Convert time from 12-hour format to 24-hour format
        const time24Hour = convertTo24HourFormat(time);
        // Combine as YYYY-MM-DDTHH:mm:ss
        return `${formattedDate}T${time24Hour}:00`;
      };

      const bookingPayload = {
        boat: selectedBoatObj?.id,
        customer: currentAuthState?.id,
        berth: selectedBerthObj?.id,
        start_date: toLocalISOString(bookingDetails?.arrivalDate, bookingDetails?.arrivalTime),
        end_date: toLocalISOString(bookingDetails?.departureDate, bookingDetails?.departureTime),
        passengers: parseInt(noOfPassengers)
      };

      const response = await createBooking(bookingPayload);
      dispatch(addBookings([response]));
      setBookingData(response);
      setShowSuccessModal(true);
    } catch (error) {
      let err_msg = Error(error);
      toastContext.showToast(err_msg, "long", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBooking = async () => {
    setIsLoading(true);
    try {
      const selectedBoatObj = boatsData.find(boat => boat?.id === selectedBoat);
      if (!selectedBoatObj) {
        toastContext.showToast("Please select a boat", "short", "error");
        setIsLoading(false);
        return;
      }

      const selectedBerthObj = berthsData.find(berth => berth?.name === berthName);
      if (!selectedBerthObj) {
        toastContext.showToast("Please select a berth", "short", "error");
        setIsLoading(false);
        return;
      }

      // const formatDateTimeForAPI = (dateString, timeString) => {
      //   if (!dateString || !timeString) return '';
        
      //   const time24Hour = convertTo24HourFormat(timeString);
      //   const momentDate = moment(`${dateString} ${time24Hour}`, 'DD/MM/YYYY HH:mm');
        
      //   return momentDate.toISOString();
      // };

      const toLocalISOString = (date, time) => {
        if (!date || !time) return '';
        
        // Convert date from DD/MM/YYYY to YYYY-MM-DD
        const momentDate = moment(date, 'DD/MM/YYYY');
        const formattedDate = momentDate.format('YYYY-MM-DD');
        // Convert time from 12-hour format to 24-hour format
        const time24Hour = convertTo24HourFormat(time);
        // Combine as YYYY-MM-DDTHH:mm:ss
        return `${formattedDate}T${time24Hour}:00`;
      };

      const bookingPayload = {
        boat: selectedBoatObj?.id,
        customer: currentAuthState?.id,
        berth: selectedBerthObj?.id,
        start_date: toLocalISOString(bookingDetails?.arrivalDate, bookingDetails?.arrivalTime),
        end_date: toLocalISOString(bookingDetails?.departureDate, bookingDetails?.departureTime),
        passengers: parseInt(noOfPassengers)
      };

      const response = await updateBookingAPI(editingBookingId, bookingPayload);
      dispatch(updateBooking(response));
      setShowSuccessModal(true);
    } catch (error) {
      let err_msg = Error(error);
      toastContext.showToast(err_msg, "long", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoHome = () => {
    setShowSuccessModal(false);
    setBookingData(null);
    navigation.goBack();
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setBookingData(null);
  };

  const handleStepClick = (step) => {
    
    // In edit mode, only allow navigation to boat details and booking details
    if (isEditMode && step === STEPS.PONTOON_DETAILS) {
      return;
    }
    
    // Apply same validation logic as Next button
    if (step === STEPS.BOAT_DETAILS && currentStep === STEPS.PONTOON_DETAILS) {
      // Moving from pontoon to boat - validate pontoon details
      if (!validatePontoonDetails()) {
        toastContext.showToast("Please fill in both Pontoon Name and Berth Name", "short", "error");
        return;
      }
    } else if (step === STEPS.BOOKING_DETAILS && currentStep === STEPS.BOAT_DETAILS) {
      // Moving from boat to booking - validate boat details
      if (!validateBoatDetails()) {
        toastContext.showToast("Please fill in all required boat details", "short", "error");
        return;
      }
    } else if (step === STEPS.BOOKING_DETAILS && currentStep === STEPS.PONTOON_DETAILS) {
      // Moving from pontoon directly to booking - validate both pontoon and boat
      if (!validatePontoonDetails()) {
        toastContext.showToast("Please fill in both Pontoon Name and Berth Name", "short", "error");
        return;
      }
      if (!validateBoatDetails()) {
        toastContext.showToast("Please fill in all required boat details", "short", "error");
        return;
      }
    }
    
    // Allow navigation to any step if validation passes
    setCurrentStep(step);
  };

  const handleBackNavigation = () => {
    if (currentStep === STEPS.PONTOON_DETAILS) {
      navigation.goBack();
    } else if (currentStep === STEPS.BOAT_DETAILS) {
      if (isEditMode) {
        navigation.goBack();
      } else {
        setCurrentStep(STEPS.PONTOON_DETAILS);
      }
    } else if (currentStep === STEPS.BOOKING_DETAILS) {
      if (isEditMode) {
        setCurrentStep(STEPS.BOAT_DETAILS);
      } else {
        setCurrentStep(STEPS.BOAT_DETAILS);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPontoonsData();
      fetchBerthsData();
      fetchBoatsData();
    }, [])
  );

  // Listen for screen dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });

    return () => subscription?.remove();
  }, []);

  // Calculate responsive bottom margin for the button
  const getButtonBottomMargin = () => {
    const { height } = screenData;
    
    const safeBottomMargin = Math.max(insets.bottom, 20);
    
    if (height < 700) {
      return safeBottomMargin + 10;
    }
    else if (height >= 700 && height < 800) {
      return safeBottomMargin + 15;
    }
    else {
      return safeBottomMargin + 20;
    }
  };

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
      
      if(response?.length === 1 && !route?.params?.prefillData?.pontoonName) {
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? Colors.dark_bg_color : Colors.bg_color }]} edges={["left", "right", "bottom"]}>
      <StatusBar 
        translucent={true}
        backgroundColor="transparent" 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
      />
      <View style={[styles.container, { backgroundColor: isDarkMode ? Colors.dark_bg_color : Colors.bg_color }]}>
        {/* Header */}
        <View style={styles.header}>
          <MaterialIcons
            name="chevron-left"
            size={30}
            color={isDarkMode ? Colors.white : Colors.font_gray}
            style={styles.backButton}
            onPress={handleBackNavigation}
          />
          <Text style={[styles.headerTitle, { color: isDarkMode ? Colors.white : Colors.font_gray }]}>{isEditMode ? "Edit Booking" : "New Booking"}</Text>
          {currentStep === STEPS.BOAT_DETAILS && (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.headerAddBoatActionButton}
              onPress={() => {
                const selectedBerth = berthsData.find(berth => berth?.name === berthName);
                if (selectedBerth) {
                  navigation.navigate('AddBoat', {
                    fromBookingScreen: true,
                    berthData: selectedBerth
                  });
                } else {
                  toastContext.showToast("Please select a berth first", "short", "error");
                }
              }}
            >
              <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
              <Text style={styles.headerAddBoatActionText}>Add new boat</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Instruction Box */}
        <View style={[styles.instructionContainer, { backgroundColor: isDarkMode ? Colors.dark_container : Colors.white }]}>
          <Text style={[styles.instructionText, { color: isDarkMode ? Colors.white : Colors.sub_heading_font }]}>
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
              <Ionicons name="location" size={22} color={currentStep === STEPS.PONTOON_DETAILS ? Colors.white : (isDarkMode ? Colors.font_gray : "#6F6F6F")} />
            </View>
          </TouchableOpacity>
          <View style={[styles.stepConnectorLine, { backgroundColor: isDarkMode ? Colors.dark_separator : Colors.input_border_light }]} />
          <TouchableOpacity 
            style={[
              styles.stepIconContainer, 
              currentStep === STEPS.BOAT_DETAILS ? styles.activeIconContainer : styles.inactiveIconContainer,
              // In create mode, disable boat tab if pontoon details are not valid
              !isEditMode && currentStep === STEPS.PONTOON_DETAILS && !validatePontoonDetails() && styles.disabledStepContainer
            ]}
            onPress={() => handleStepClick(STEPS.BOAT_DETAILS)}
            disabled={!isEditMode && currentStep === STEPS.PONTOON_DETAILS && !validatePontoonDetails()}
          >
            <View style={[styles.stepIcon, currentStep === STEPS.BOAT_DETAILS ? styles.activeIcon : styles.inactiveIcon]}>
              <Ionicons name="boat-outline" size={22} color={currentStep === STEPS.BOAT_DETAILS ? Colors.white : (isDarkMode ? Colors.font_gray : "#6F6F6F")}/>
            </View>
          </TouchableOpacity>
          <View style={[styles.stepConnectorLine, { backgroundColor: isDarkMode ? Colors.dark_separator : Colors.input_border_light }]} />
          <TouchableOpacity 
            style={[
              styles.stepIconContainer, 
              currentStep === STEPS.BOOKING_DETAILS ? styles.activeIconContainer : styles.inactiveIconContainer,
              // Disable booking tab if previous steps are not valid
              !isEditMode && currentStep === STEPS.PONTOON_DETAILS && !validatePontoonDetails() && styles.disabledStepContainer,
              !isEditMode && currentStep === STEPS.BOAT_DETAILS && !validateBoatDetails() && styles.disabledStepContainer
            ]}
            onPress={() => handleStepClick(STEPS.BOOKING_DETAILS)}
            disabled={
              (!isEditMode && currentStep === STEPS.PONTOON_DETAILS && !validatePontoonDetails()) ||
              (!isEditMode && currentStep === STEPS.BOAT_DETAILS && !validateBoatDetails())
            }
          >
            <View style={[styles.stepIcon, currentStep === STEPS.BOOKING_DETAILS ? styles.activeIcon : styles.inactiveIcon]}>
              <Octicons name="people" size={22} color={currentStep === STEPS.BOOKING_DETAILS ? Colors.white : (isDarkMode ? Colors.font_gray : "#6F6F6F")} />
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
            { backgroundColor: isDarkMode ? Colors.dark_container : Colors.white },
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
            <Text style={[styles.cardHeaderText, { color: Colors.primary }]}>
              {currentStep === STEPS.PONTOON_DETAILS ? "Pontoon Details" : currentStep === STEPS.BOAT_DETAILS ? "Boat Details" : "Booking Details"}
            </Text>
          </View>
          <View style={[styles.cardHeaderSeparator, { backgroundColor: isDarkMode ? Colors.dark_separator : '#E8EBEC' }]} />

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
              isEditMode={isEditMode}
            />
          ) : null}
          </View>
        </ScrollView>

        <View style={[styles.buttonContainer, { marginBottom: getButtonBottomMargin() }]}>
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
      </View>

      <AbaciLoader visible={isLoading} />

      {/* Success Modal */}
      <BookingSuccessModal
        visible={showSuccessModal}
        onClose={handleCloseModal}
        onGoHome={handleGoHome}
        isEditMode={isEditMode}
        bookingData={bookingData}
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
  buttonContainer: {
    paddingHorizontal: 26,
  },
  primaryActionButton: {
    backgroundColor: '#75C8AD',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
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
