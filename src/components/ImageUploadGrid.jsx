import React, {useContext, useState} from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View, Image, ActivityIndicator, Vibration, } from 'react-native';
import ImageView from 'react-native-image-viewing';
import {BlurView} from '@react-native-community/blur';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import {Colors} from '../constants/customStyles';
import {ToastContext} from '../context/ToastContext';
import ImageSourceModal from './modals/ImageSourceModal';

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

  const handleImageSelected = (newFile) => {
    const newImage = {
      id: newFile.id,
      name: newFile.name,
      url: newFile.uri,
      image: newFile.uri,
    };

    if (images.length < maxImages) {
      const updatedImages = [...images, newImage];
      onImagesChange(updatedImages);
    }
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

  const TouchableImage = ({index, image, isLarge = false}) => {
    const isEmpty = !image;

    return (
      <TouchableOpacity
        style={[
          isLarge ? styles.largeImageContainer : styles.imageContainer,
          isEmpty && styles.emptyImageContainer,
          imageContainerStyle,
          {
            backgroundColor: isDarkMode ? Colors.dark_container : '#F9F9F9',
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
              <View style={[
                isLarge ? styles.largePlusIconContainer : styles.plusIconContainer,
                {
                  backgroundColor: isDarkMode ? Colors.dark_container : '#F5F5F5',
                  borderColor: isDarkMode ? Colors.input_border_dark : '#E5E5E5'
                }
              ]}>
                <Ionicons
                  name="add"
                  size={isLarge ? 32 : 24}
                  color={isDarkMode ? Colors.font_gray : '#666'}
                />
              </View>
            ) : (
              <Image
                source={require('../assets/images/no_image.jpg')}
                style={{
                  width: isLarge ? (width * 0.90 - 48 - 24) / 2 : (width * 0.85 - 48 - 24) / 4,
                  height: isLarge ? (width * 0.90 - 48 - 24) / 2 : (width * 0.85 - 48 - 24) / 4,
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
        {images.length === 0 ? (
          // Show large container with plus button when no images
          <TouchableImage 
            key="large-add" 
            index={0} 
            image={null} 
            isLarge={true}
          />
        ) : (
          // Show existing images + small add button
          <>
            {images.map((image, index) => (
              <TouchableImage 
                key={index} 
                index={index} 
                image={image} 
                isLarge={false}
              />
            ))}
            {images.length < maxImages && (
              <TouchableImage 
                key="small-add" 
                index={images.length} 
                image={null} 
                isLarge={false}
              />
            )}
          </>
        )}
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
      <ImageSourceModal
        visible={sourceModalVisible}
        onClose={() => setSourceModalVisible(false)}
        onImageSelected={handleImageSelected}
        isDarkMode={isDarkMode}
        maxFiles={maxImages}
        currentFileCount={images.length}
      />

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
  largeImageContainer: {
    width: '100%',
    height: (width * 0.95 - 48 - 24) / 3,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
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
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  largePlusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
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

});

export default ImageUploadGrid;
