import React, { useLayoutEffect, useState } from 'react';
import { StatusBar, StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { Colors } from '../constants/customStyles';
import { Octicons } from '@react-native-vector-icons/octicons';
import BookingSuccessModal from '../components/modals/BookingSuccessModal';
import { PontoonDetailsTab, BoatDetailsTab, BookingDetailsTab } from '../components/newBooking';

const STEPS = {
  PONTOON_DETAILS: 'pontoon_details',
  BOAT_DETAILS: 'boat_details', 
  BOOKING_DETAILS: 'booking_details'
};

const NewBookingScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(STEPS.PONTOON_DETAILS); 
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [pontoonName, setPontoonName] = useState('');
  const [berthName, setBerthName] = useState('');
  
  const [arrivalDate, setArrivalDate] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  
  const [selectedBoat, setSelectedBoat] = useState('');
  const [boatRegNo, setBoatRegNo] = useState('');
  const [noOfPassengers, setNoOfPassengers] = useState('');
  const [boatWidth, setBoatWidth] = useState('');
  const [boatLength, setBoatLength] = useState('');

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' }
    });
  }, [navigation]);

  const handleNext = () => {
    if (currentStep === STEPS.PONTOON_DETAILS) {
      setCurrentStep(STEPS.BOAT_DETAILS);
    } else if (currentStep === STEPS.BOAT_DETAILS) {
      setCurrentStep(STEPS.BOOKING_DETAILS);
    } else {
      setShowSuccessModal(true);
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
    setCurrentStep(step);
  };

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
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>New Booking</Text>
          {currentStep === STEPS.BOAT_DETAILS && (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.headerAddBoatActionButton}
              onPress={() => console.log("Add new boat")}
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
            style={[styles.stepIconContainer, currentStep === STEPS.PONTOON_DETAILS ? styles.activeIconContainer : styles.inactiveIconContainer]}
            onPress={() => handleStepClick(STEPS.PONTOON_DETAILS)}
          >
            <View style={[styles.stepIcon, currentStep === STEPS.PONTOON_DETAILS ? styles.activeIcon : styles.inactiveIcon]}>
              <Ionicons name="location" size={22} color={currentStep === STEPS.PONTOON_DETAILS ? Colors.white : "#6F6F6F"} />
            </View>
          </TouchableOpacity>
          <View style={styles.stepConnectorLine} />
          <TouchableOpacity 
            style={[styles.stepIconContainer, currentStep === STEPS.BOAT_DETAILS ? styles.activeIconContainer : styles.inactiveIconContainer]}
            onPress={() => handleStepClick(STEPS.BOAT_DETAILS)}
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
            />
          ) : currentStep === STEPS.BOAT_DETAILS ? (
            <BoatDetailsTab
              selectedBoat={selectedBoat}
              setSelectedBoat={setSelectedBoat}
              boatRegNo={boatRegNo}
              setBoatRegNo={setBoatRegNo}
              noOfPassengers={noOfPassengers}
              setNoOfPassengers={setNoOfPassengers}
              boatWidth={boatWidth}
              setBoatWidth={setBoatWidth}
              boatLength={boatLength}
              setBoatLength={setBoatLength}
            />
          ) : (
            <BookingDetailsTab
              arrivalDate={arrivalDate}
              setArrivalDate={setArrivalDate}
              arrivalTime={arrivalTime}
              setArrivalTime={setArrivalTime}
              hours={hours}
              setHours={setHours}
              minutes={minutes}
              setMinutes={setMinutes}
              departureDate={departureDate}
              setDepartureDate={setDepartureDate}
              departureTime={departureTime}
              setDepartureTime={setDepartureTime}
            />
          )}
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.primaryActionButton} onPress={handleNext}>
          <Text style={styles.primaryActionButtonText}>
            {currentStep === STEPS.PONTOON_DETAILS ? "Next" : currentStep === STEPS.BOAT_DETAILS ? "Next" : "Book"}
          </Text>
        </TouchableOpacity>
      </View>

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
