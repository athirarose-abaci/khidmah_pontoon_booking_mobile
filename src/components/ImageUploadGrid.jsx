import React, {useContext, useState} from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View, Image, ActivityIndicator, Vibration, } from 'react-native';
import { launchImageLibrary, launchCamera, requestCameraPermission, requestMediaLibraryPermission, } from 'react-native-image-picker';
import ImageView from 'react-native-image-viewing';
import {BlurView} from '@react-native-community/blur';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import {Platform, PermissionsAndroid} from 'react-native';
import {Colors} from '../constants/customStyles';
import moment from 'moment';
import {ToastContext} from '../context/ToastContext';
import { PERMISSIONS, request, requestMultiple, RESULTS, } from 'react-native-permissions';

const {width, height} = Dimensions.get('window');

const ImageUploadGrid = ({
  images = [],
  onImagesChange,
  maxImages = 4,
  gridStyle,
  imageContainerStyle,
  addButtonStyle,
  label = 'Upload Images',
  subtext,
  disabled = false,
  isDarkMode = false,
  showLoading = false,
  allowDelete = true,
}) => {
  const [imagesToShow, setImagesToShow] = useState([]);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [sourceModalVisible, setSourceModalVisible] = useState(false);
  const toastContext = useContext(ToastContext);

  const requestPermissions = async source => {
    try {
      if (source === 'camera') {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'Camera Permission',
              message: 'This app needs camera access to take photos',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } else {
          // const result = await requestCameraPermission();
          // return result === 'granted';
          const result = await request(PERMISSIONS.IOS.CAMERA);
          const grantedResult = Object.values(result).every( status => status === RESULTS.GRANTED, );
          return grantedResult;
        }
      } else {
        // For gallery, we don't need to request permissions explicitly on modern Android
        // The image picker will handle permissions automatically
        if (Platform.OS === 'android') {
          // On Android 11+ (API 30+), we don't need READ_EXTERNAL_STORAGE for image picker
          // The image picker handles permissions automatically
          return true;
        } else {
          // const result = await requestMediaLibraryPermission();
          // return result === 'granted';
          const result2 = request(PERMISSIONS.IOS.PHOTO_LIBRARY);
          const grantedResult2 = Object.values(result2).every(
            status => status === RESULTS.GRANTED,
          );
          return grantedResult2;
        }
      }
    } catch (error) {
      return false;
    }
  };

  const selectImage = async source => {
    const hasPermission = await requestPermissions(source);

    if (!hasPermission) {
      toastContext.showToast(`Permission denied for ${source}`, 'error');
      return;
    }

    const options = {
      mediaType: 'photo',
      quality: 0.5,
      includeBase64: true,
      maxWidth: 1024,
      maxHeight: 1024,
      saveToPhotos: false,
    };

    const launchFunction = source === 'camera' ? launchCamera : launchImageLibrary;

    launchFunction(options, response => {
      if (response.didCancel) {
        return;
      } else if (response.error) {
        console.log('Image picker error:', response.error);
      } else if (response.assets && response.assets[0]) {
        const fileName =
          moment().unix().toString() + response?.assets[0]?.fileName?.slice(-10) || '.jpg';
        const uri = response?.assets[0]?.uri;
        const newImage = {
          id: fileName,
          name: fileName,
          url: uri,
          image: uri,
        };

        if (images.length < maxImages) {
          const updatedImages = [...images, newImage];
          onImagesChange(updatedImages);
        }
      }
    });
  };

  const handleImagePress = index => {
    if (images[index]) {
      setImagesToShow(images.map(img => ({uri: img.url || img.image})));
      setImageViewerIndex(index);
      setImageViewerVisible(true);
    } else {
      if (!disabled) {
        setSourceModalVisible(true);
      }
    }
  };

  const handleImageLongPress = index => {
    if (images[index] && allowDelete) {
      Vibration.vibrate(60); 
      setImageToDelete({index, image: images[index]});
      setDeleteModalVisible(true);
    }
  };

  const deleteImage = () => {
    if (imageToDelete) {
      const updatedImages = images.filter(
        (_, index) => index !== imageToDelete.index,
      );
      onImagesChange(updatedImages);
      setDeleteModalVisible(false);
      setImageToDelete(null);
    }
  };

  const TouchableImage = ({index, image}) => {
    const isEmpty = !image;

    return (
      <TouchableOpacity
        style={[
          styles.imageContainer,
          isEmpty && styles.emptyImageContainer,
          imageContainerStyle,
          {
            backgroundColor: isDarkMode ? Colors.black : '#F9F9F9',
            borderColor: isDarkMode ? Colors.font_gray : '#BDBDBD',
          },
        ]}
        onPress={() => handleImagePress(index)}
        onLongPress={() => handleImageLongPress(index)}
        activeOpacity={0.7}
        // disabled={disabled || showLoading}
      >
        {isEmpty ? (
          <View style={styles.addImageContent}>
            {showLoading ? (
              <ActivityIndicator
                size="small"
                color={isDarkMode ? Colors.font_gray : '#666'}
              />
            ) : !disabled ? (
              <View style={styles.plusIconContainer}>
                <Ionicons
                  name="add"
                  size={24}
                  color={isDarkMode ? Colors.font_gray : '#666'}
                />
              </View>
            ) : (
              <Image
                source={require('../assets/images/no_image.jpg')}
                style={{
                  width: (width * 0.85 - 48 - 24) / 4,
                  height: (width * 0.85 - 48 - 24) / 4,
                }}
                resizeMode="contain"
              />
            )}
          </View>
        ) : (
          <Image source={{uri: image.url || image.image}} style={styles.imageThumbnail} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      {label && (
        <Text
          style={[styles.label, {color: isDarkMode ? Colors.white : '#333'}]}>
          {label}
        </Text>
      )}

      {subtext && (
        <Text
          style={[
            styles.subtext,
            {color: isDarkMode ? Colors.font_gray : '#666'},
          ]}>
          {subtext}
        </Text>
      )}

      <View style={[styles.imageGrid, gridStyle]}>
        {Array.from({length: maxImages}, (_, index) => (
          <TouchableImage key={index} index={index} image={images[index]} />
        ))}
      </View>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}>
        <BlurView
          style={styles.blurOverlay}
          blurType={isDarkMode ? 'dark' : 'light'}
          blurAmount={12}>
          <View
            style={[
              styles.deleteModalContent,
              {backgroundColor: isDarkMode ? Colors.black : 'white'},
            ]}>
            <Text
              style={[
                styles.deleteModalTitle,
                {color: isDarkMode ? Colors.white : '#333'},
              ]}>
              Delete Image?
            </Text>
            {imageToDelete && (
              <Image
                source={{uri: imageToDelete.image.url || imageToDelete.image.image}}
                style={styles.deletePreviewImage}
              />
            )}
            <View style={styles.deleteButtonContainer}>
              <TouchableOpacity
                style={styles.deleteCancelButton}
                onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.deleteCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteConfirmButton}
                onPress={deleteImage}>
                <Text style={styles.deleteConfirmButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>

      {/* Image Source Selection Modal */}
      <Modal
        visible={sourceModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSourceModalVisible(false)}>
        <BlurView
          style={styles.blurOverlay}
          blurType={isDarkMode ? 'dark' : 'light'}
          blurAmount={10}>
          <View
            style={[
              styles.sourceModalContent,
              {backgroundColor: isDarkMode ? Colors.black : 'white'},
            ]}>
            <Text
              style={[
                styles.sourceModalTitle,
                {color: isDarkMode ? Colors.white : '#333'},
              ]}>
              Select Image Source
            </Text>
            <View style={styles.sourceButtonContainer}>
              <TouchableOpacity
                style={styles.sourceButton}
                onPress={() => {
                  setSourceModalVisible(false);
                  selectImage('camera');
                }}>
                <Ionicons name="camera" size={24} color={Colors.primary} />
                <Text style={styles.sourceButtonText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sourceButton}
                onPress={() => {
                  setSourceModalVisible(false);
                  selectImage('gallery');
                }}>
                <Ionicons name="images" size={24} color={Colors.primary} />
                <Text style={styles.sourceButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.sourceCancelButton}
              onPress={() => setSourceModalVisible(false)}>
              <Text style={styles.sourceCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Modal>

      {/* Full Screen Image Viewer */}
      <ImageView
        keyExtractor={item => item.id?.toString() ?? Math.random().toString()}
        images={imagesToShow}
        imageIndex={imageViewerIndex}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
      />
    </>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 12,
    lineHeight: 20,
  },
  subtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
    lineHeight: 16,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  imageContainer: {
    width: (width * 0.90 - 48 - 24) / 4,
    height: (width * 0.95 - 48 - 24) / 4,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  emptyImageContainer: {
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageContent: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  plusIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 15,
  },
  imageThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  // Delete Modal Styles
  blurOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)'
  },
  deleteModalContent: {
    width: width * 0.8,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  deleteModalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  deletePreviewImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 20,
  },
  deleteButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteCancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BDBDBD',
  },
  deleteCancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#666',
  },
  deleteConfirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#FF4444',
  },
  deleteConfirmButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },

  // Source Selection Modal Styles
  sourceModalContent: {
    width: width * 0.8,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  sourceModalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 20,
  },
  sourceButtonContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  sourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#F9F9F9',
  },
  sourceButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginLeft: 12,
  },
  sourceCancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  sourceCancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
});

export default ImageUploadGrid;
