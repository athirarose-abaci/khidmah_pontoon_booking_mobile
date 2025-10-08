import React, { useLayoutEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Dimensions, } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { Colors } from '../constants/customStyles';

const { width, height } = Dimensions.get('window');

const BoatDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { boat } = route.params;
  const insets = useSafeAreaInsets();

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' }
    });
  }, [navigation]);

  const handleEdit = () => {
    console.log('Edit boat:', boat.id);
  };

  const handleDelete = () => {
    console.log('Delete boat:', boat.id);
  };

  const handleRemove = () => {
    console.log('Remove boat:', boat.id);
  };

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
          <Image source={boat.image} style={styles.mainImage} resizeMode="cover" />
        </View>

        {/* Boat details card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <View style={styles.boatInfo}>
              <Text style={styles.boatId}>{boat.boatId || 'DXB-1121'}</Text>
              <Text style={styles.boatName}>{boat.name}</Text>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={handleEdit}
                activeOpacity={0.7}
              >
                <Ionicons name="pencil" size={16} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.removeButton]}
                onPress={handleRemove}
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={16} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}
                activeOpacity={0.7}
              >
                <Ionicons name="trash" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.description}>
            {boat.description || "Lazzara 80 Skylounge, boasting a spacious wide-body salon, an enclosed flybridge, and a versatile five-stateroom, six-head layout. With elegant Euro-inspired styling and the largest interior volume in its class."}
          </Text>

          <View style={styles.sizeContainer}>
            <Text style={styles.sizeText}>Size: {boat.size}</Text>
          </View>
        </View>

        {/* Boat images section */}
        <View style={styles.imagesSection}>
          <Text style={styles.sectionTitle}>Boat Images</Text>
          <View style={styles.imagesGrid}>
            {boat.additionalImages?.map((image, index) => (
              <Image
                key={index}
                source={image}
                style={styles.gridImage}
                resizeMode="cover"
              />
            )) || (
              // Fallback to main image repeated 4 times if no additional images
              <>
                <Image source={boat.image} style={styles.gridImage} resizeMode="cover" />
                <Image source={boat.image} style={styles.gridImage} resizeMode="cover" />
                <Image source={boat.image} style={styles.gridImage} resizeMode="cover" />
                <Image source={boat.image} style={styles.gridImage} resizeMode="cover" />
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
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
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
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
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingHorizontal: 20,
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
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#4CAF50',
  },
  removeButton: {
    backgroundColor: '#F44336',
  },
  deleteButton: {
    backgroundColor: '#D32F2F',
  },
  description: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    marginBottom: 20,
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
    paddingHorizontal: 20,
    paddingBottom: 30,
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
  },
  gridImage: {
    width: (width - 60) / 2,
    height: (width - 60) / 2,
    borderRadius: 12,
    marginBottom: 10,
  },
});

export default BoatDetailScreen;
