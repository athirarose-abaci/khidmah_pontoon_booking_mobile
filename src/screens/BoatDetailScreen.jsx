import React, { useLayoutEffect, useState, useEffect, useContext } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Feather } from '@react-native-vector-icons/feather';
import { Colors } from '../constants/customStyles';
import { fetchBoatById } from '../apis/boat';
import AbaciLoader from '../components/AbaciLoader';
import { ToastContext } from '../context/ToastContext';
import ImageView from 'react-native-image-viewing';
import Error from '../helpers/Error';

const { width, height } = Dimensions.get('window');

const BoatDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { boatId } = route.params;
  const insets = useSafeAreaInsets();
  const toastContext = useContext(ToastContext);
  
  const [boat, setBoat] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' }
    });
  }, [navigation]);

  useEffect(() => {
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

    if (boatId) {
      loadBoatDetails();
    }
  }, [boatId, toastContext, navigation]);

  const handleEdit = () => {
    console.log('Edit boat:', boat?.id);
  };

  const handleDelete = () => {
    console.log('Delete boat:', boat?.id);
  };

  const handleRemove = () => {
    console.log('Remove boat:', boat?.id);
  };

  const handleImagePress = (index) => {
    setImageViewerIndex(index);
    setImageViewerVisible(true);
  };

  // Get the main image from the boat data
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
                style={[styles.actionButton, styles.removeButton]}
                onPress={handleRemove}
                activeOpacity={0.7}
              >
                <Ionicons name="remove-circle-outline" size={18} color="#C0082C" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}
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
            <Text style={styles.sizeText}>Size: {boat?.length} x {boat?.width}</Text>
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
      
      <AbaciLoader visible={isLoading} />
      
      {/* Full Screen Image Viewer */}
      <ImageView
        images={boat?.images?.map(img => ({ uri: img.image })) || []}
        imageIndex={imageViewerIndex}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
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
  removeButton: {
    borderColor: '#C0082C',
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
