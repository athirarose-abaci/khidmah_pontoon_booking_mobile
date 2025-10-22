import React, { useLayoutEffect, useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Feather } from '@react-native-vector-icons/feather';
import { Colors } from '../constants/customStyles';
import { fetchBoatById, disableBoat, deleteBoat } from '../apis/boat';
import AbaciLoader from '../components/AbaciLoader';
import { ToastContext } from '../context/ToastContext';
import ImageView from 'react-native-image-viewing';
import Error from '../helpers/Error';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import { useDispatch } from 'react-redux';
import { updateBoatStatus, removeBoat } from '../../store/boatSlice';

const { width, height } = Dimensions.get('window');

const BoatDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { boatId } = route.params;
  const insets = useSafeAreaInsets();
  const toastContext = useContext(ToastContext);
  const dispatch = useDispatch();
  
  const [boat, setBoat] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);
  const [disableModalVisible, setDisableModalVisible] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrorModalVisible, setDeleteErrorModalVisible] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' }
    });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      if (boatId) {
        loadBoatDetails();
      }
    }, [boatId])
  );

  const loadBoatDetails = async () => {
    setIsLoading(true);
    try {
      const boatData = await fetchBoatById(boatId);
      setBoat(boatData);
    } catch (err) {
      let err_msg = Error(err);
      toastContext.showToast(err_msg, 'short', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('AddBoat', {
      isEditMode: true,
      boatId: boat?.id,
      boatData: boat
    });
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const response = await deleteBoat(boat?.id);
      console.log('Delete boat response:', response);
      
      // Check if response has error property
      if (response?.error) {
        setDeleteError(response.error);
        setDeleteErrorModalVisible(true);
        setDeleteModalVisible(false);
        return;
      }
      
      dispatch(removeBoat(boat?.id));
      toastContext.showToast('Boat deleted successfully!', 'short', 'success');
      navigation.goBack();
    } catch (error) {
      let err_msg = Error(error);
      console.log('Delete boat error:', err_msg);
      toastContext.showToast(err_msg, 'short', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteModalVisible(false);
    }
  };

  const handleDeleteErrorConfirm = async () => {
    setIsConfirmingDelete(true);
    try {
      const response = await deleteBoat(boat?.id, true); // Pass is_confirm = true
      console.log('Delete boat with confirmation response:', response);
      
      dispatch(removeBoat(boat?.id));
      toastContext.showToast('Boat deleted successfully!', 'short', 'success');
      navigation.goBack();
    } catch (error) {
      let err_msg = Error(error);
      console.log('Delete boat with confirmation error:', err_msg);
      toastContext.showToast(err_msg, 'short', 'error');
    } finally {
      setIsConfirmingDelete(false);
      setDeleteErrorModalVisible(false);
    }
  };

  const handleDisableConfirm = async () => {
    setIsDisabling(true);
    try {
      const newStatus = boat?.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      
      await disableBoat(boat?.id, newStatus);
 
      dispatch(updateBoatStatus({ boatId: boat?.id, status: newStatus }));
      setBoat(prevBoat => ({ ...prevBoat, status: newStatus }));
      const actionText = newStatus === 'INACTIVE' ? 'disabled' : 'enabled';
      
      toastContext.showToast(`Boat ${actionText} successfully!`, 'short', 'success');
    } catch (error) {
      let err_msg = Error(error);
      toastContext.showToast(err_msg, 'short', 'error');
    } finally {
      setIsDisabling(false);
      setDisableModalVisible(false);
    }
  };

  const handleImagePress = (index) => {
    setImageViewerIndex(index);
    setImageViewerVisible(true);
  };

  const mainImage = boat?.images?.length > 0 
    ? { uri: boat.images[0].image }
    : require('../assets/images/no_image.jpg');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent />
      
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
          <Text style={styles.backText}>Boats</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Main boat image */}
        <View style={styles.mainImageContainer}>
          <Image source={mainImage} style={styles.mainImage} resizeMode="cover" />
        </View>

        {/* Boat details card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <View style={styles.boatInfo}>
              <Text style={styles.boatId}>{boat?.registration_number || 'N/A'}</Text>
              <Text style={styles.boatName}>{boat?.name}</Text>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={handleEdit}
                activeOpacity={0.7}
              >
                <Feather name="edit" size={18} color={Colors.primary} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.actionButton, 
                  boat?.status === 'INACTIVE' && { borderColor: Colors.primary },
                  boat?.status === 'ACTIVE' && { borderColor: '#C0082C' }
                ]}
                onPress={() => setDisableModalVisible(true)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={boat?.status === 'ACTIVE' ? "remove-circle-outline" : "checkmark-circle-outline"} 
                  size={18} 
                  color={boat?.status === 'ACTIVE' ? "#C0082C" : "#4CAF50"} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => setDeleteModalVisible(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="trash" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {boat?.description ? (
            <Text style={styles.description}>
              {boat.description}
            </Text>
          ) : (
            <View style={styles.noDescriptionContainer}>
              <Text style={styles.noDescriptionText}>
                Add a few words about the yacht's standout features…
              </Text>
            </View>
          )}

          <View style={styles.sizeContainer}>
            <Text style={styles.sizeText}>Size: {boat?.length} x {boat?.width} ft</Text>
          </View>
        </View>

        {/* Boat images section */}
        <View style={styles.imagesSection}>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Boat Images</Text>
          {boat?.images?.length > 0 ? (
            <View style={styles.imagesGrid}>
              {boat?.images.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleImagePress(index)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: image?.image }}
                    style={styles.gridImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noImagesContainer}>
              <Image 
                source={require('../assets/images/image_not_found.png')} 
                style={styles.noImagesIcon} 
                resizeMode="contain" 
              />
              <Text style={styles.noImagesText}>No boat images found</Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      <AbaciLoader visible={isLoading || isDisabling || isDeleting} />
      
      {/* Full Screen Image Viewer */}
      <ImageView
        images={boat?.images?.map(img => ({ uri: img.image })) || []}
        imageIndex={imageViewerIndex}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
      />

      {/* Disable Boat Confirmation Modal */}
      <ConfirmationModal
        isVisible={disableModalVisible}
        onRequestClose={() => setDisableModalVisible(false)}
        onConfirm={handleDisableConfirm}
        title="Are you sure?"
        message={boat?.status === 'ACTIVE' 
          ? "The boat will be marked as inactive and won't be available for bookings."
          : "The boat will be marked as active and will be available for bookings."
        }
        confirmText={isDisabling 
          ? ""
          : (boat?.status === 'ACTIVE' ? "Disable" : "Enable")
        }
        cancelText="Cancel"
        warningIconName={boat?.status === 'ACTIVE' ? "remove-circle" : "check-circle"}
        warningIconColor={boat?.status === 'ACTIVE' ? "#FF6B6B" : "#4CAF50"}
        warningIconSize={50}
        confirmIconName={boat?.status === 'ACTIVE' ? "block" : "check"}
        confirmIconColor="white"
        confirmIconSize={18}
        confirmIconComponent={isDisabling ? (
          <ActivityIndicator size="small" color="white" />
        ) : null}
      />

      {/* Delete Boat Confirmation Modal */}
      <ConfirmationModal
        isVisible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Boat"
        message="Are you sure you want to delete this boat? This action cannot be undone and all associated data will be permanently removed."
        confirmText={isDeleting ? "" : "Delete"}
        cancelText="Cancel"
        warningIconName="delete-forever"
        warningIconColor="#FF4444"
        warningIconSize={50}
        confirmIconName="delete"
        confirmIconColor="white"
        confirmIconSize={18}
        confirmIconComponent={isDeleting ? (
          <ActivityIndicator size="small" color="white" />
        ) : null}
      />

      {/* Delete Error Confirmation Modal */}
      <ConfirmationModal
        isVisible={deleteErrorModalVisible}
        onRequestClose={() => setDeleteErrorModalVisible(false)}
        onConfirm={handleDeleteErrorConfirm}
        title="Confirm Delete"
        message={deleteError || "This boat has associated bookings or data. Are you sure you want to proceed with deletion? This action cannot be undone."}
        confirmText={isConfirmingDelete ? "" : "Confirm Delete"}
        cancelText="Cancel"
        warningIconName="warning"
        warningIconColor="#FF6B35"
        warningIconSize={50}
        confirmIconName="delete"
        confirmIconColor="white"
        confirmIconSize={18}
        confirmIconComponent={isConfirmingDelete ? (
          <ActivityIndicator size="small" color="white" />
        ) : null}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  mainImageContainer: {
    height: height * 0.28,
    width: '100%',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  detailsCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 30,
    minHeight: 200,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  boatInfo: {
    flex: 1,
  },
  boatId: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  boatName: {
    fontSize: 24,
    color: Colors.primary,
    fontFamily: 'Inter-Bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  editButton: {
    borderColor: Colors.primary,
  },
  deleteButton: {
    backgroundColor: '#C0082C',
    borderColor: '#C0082C',
  },
  description: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    marginBottom: 20,
  },
  noDescriptionContainer: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  noDescriptionText: {
    fontSize: 14,
    color: '#6C757D',
    fontFamily: 'Inter-Medium',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
  sizeContainer: {
    alignItems: 'flex-end',
  },
  sizeText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Medium',
  },
  imagesSection: {
    backgroundColor: Colors.white,
    paddingHorizontal: 30,
    paddingBottom: 30,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#E9ECEF',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 15,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  gridImage: {
    width: (width - 80) / 2,
    height: (width - 80) / 2,
    borderRadius: 12,
    marginBottom: 15,
  },
  noImagesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noImagesIcon: {
    width: 120,
    height: 120,
  },
  noImagesText: {
    fontSize: 12,
    color: Colors.font_gray,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
});

export default BoatDetailScreen;
