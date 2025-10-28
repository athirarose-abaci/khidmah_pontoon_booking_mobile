import React, { useCallback, useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, PermissionsAndroid } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from '../constants/customStyles';
import { pick, isKnownType, keepLocalCopy } from '@react-native-documents/picker';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { ToastContext } from '../context/ToastContext';
import moment from 'moment';

// Use MIME/UTType strings per react-native-documents/picker docs
const SUPPORTED_TYPES = [
  'image/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const getFileIcon = (fileType) => {
  if (!fileType) return 'document';
  if (fileType.includes('pdf')) return 'document-text';
  if (fileType.includes('word') || fileType.includes('doc')) return 'document-text';
  if (fileType.includes('excel') || fileType.includes('sheet')) return 'grid';
  if (fileType.includes('presentation') || fileType.includes('powerpoint')) return 'easel';
  if (fileType.startsWith('image/')) return 'image';
  return 'document';
};

const DocumentUpload = ({
  label = 'Attach Files/Screenshots',
  helperText = 'Images, PDF, DOC, Excel files supported',
  files = [],
  onChange,
  disabled = false,
  maxFiles = 5,
  isDarkMode = false,
}) => {
  const toastContext = useContext(ToastContext);

  const requestPermissions = async (source) => {
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
          const result = await request(PERMISSIONS.IOS.CAMERA);
          const grantedResult = Object.values(result).every(status => status === RESULTS.GRANTED);
          return grantedResult;
        }
      } else {
        // For gallery, we don't need to request permissions explicitly on modern Android
        if (Platform.OS === 'android') {
          return true;
        } else {
          const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
          const grantedResult = Object.values(result).every(status => status === RESULTS.GRANTED);
          return grantedResult;
        }
      }
    } catch (error) {
      return false;
    }
  };

  
  const onPick = useCallback(async () => {
    try {
      const picked = await pick({
        type: SUPPORTED_TYPES,
        allowMultiSelection: true,
        mode: 'import',
        requestLongTermAccess: true,
      });

      if (picked && picked.length > 0) {
        // Optionally ensure local copy for virtual/content URIs
        // const ensured = await Promise.all(picked.map(f => keepLocalCopy({ uri: f.uri }).catch(() => f)));
        const newFiles = picked.map((f) => ({
          id: Date.now() + Math.random(),
          name: f.name,
          uri: f.uri,
          type: f.type,
          size: f.size,
        }));
        onChange?.([...(files || []), ...newFiles]);
      }
    } catch (e) {
      // Swallow cancellations; show toast for unexpected errors
      if (e?.message && !/cancel/i.test(String(e.message))) {
        toastContext.showToast('Failed to open document picker: ' + e.message, 'short', 'error');
      }
    }
  }, [files, onChange]);

  const removeFile = useCallback((fileId) => {
    const next = (files || []).filter((f) => f.id !== fileId);
    onChange?.(next);
  }, [files, onChange]);

  const selectImage = useCallback(async (source) => {
    const hasPermission = await requestPermissions(source);

    if (!hasPermission) {
      toastContext.showToast(`Permission denied for ${source}`, 'short', 'error');
      return;
    }

    if ((files || []).length >= maxFiles) {
      toastContext.showToast(`You can only select up to ${maxFiles} files.`, 'short', 'error');
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

    launchFunction(options, (response) => {
      if (response.didCancel) {
        return;
      } else if (response.error) {
        toastContext.showToast('Error while opening camera', 'short', 'error');
      } else if (response.assets && response.assets[0]) {
        const fileName = moment().unix().toString() + (response?.assets[0]?.fileName?.slice(-10) || '.jpg');
        const uri = response?.assets[0]?.uri;
        
        const newFile = {
          id: Date.now() + Math.random(),
          name: fileName,
          uri: uri,
          type: response.assets[0].type || 'image/jpeg',
          size: response.assets[0].fileSize || 0,
        };

        onChange?.([...(files || []), newFile]);
      }
    });
  }, [files, onChange, maxFiles, toastContext]);


  return (
    <View>
      {!!label && <Text style={[styles.label, { color: isDarkMode ? Colors.label_dark : Colors.label_light }]}>{label}</Text>}
      {!!helperText && <Text style={styles.subtext}>{helperText}</Text>}

      <View style={styles.buttonContainer}>
        {/* Camera Button */}
        <TouchableOpacity
          style={[styles.uploadButton, styles.cameraButton]}
          onPress={() => selectImage('camera')}
          disabled={disabled}
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={20} color={Colors.primary} />
          <Text style={styles.uploadButtonText}>Camera</Text>
        </TouchableOpacity>

        {/* Gallery Button */}
        <TouchableOpacity
          style={[styles.uploadButton, styles.galleryButton]}
          onPress={() => selectImage('gallery')}
          disabled={disabled}
          activeOpacity={0.8}
        >
          <Ionicons name="images" size={20} color={Colors.primary} />
          <Text style={styles.uploadButtonText}>Gallery</Text>
        </TouchableOpacity>

        {/* Files Button */}
        <TouchableOpacity
          style={[styles.uploadButton, styles.filesButton]}
          onPress={onPick}
          disabled={disabled}
          activeOpacity={0.8}
        >
          <Ionicons name="document" size={20} color={Colors.primary} />
          <Text style={styles.uploadButtonText}>Files</Text>
        </TouchableOpacity>
      </View>

      {(files || []).length > 0 && (
        <View style={styles.fileList}>
          {files.map((file) => (
            <View key={file.id} style={styles.fileItem}>
              <View style={styles.fileInfo}>
                <Ionicons name={getFileIcon(file.type)} size={20} color={Colors.primary} />
                <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
              </View>
              <TouchableOpacity onPress={() => removeFile(file.id)} style={styles.removeFileButton}>
                <Ionicons name="close-circle" size={20} color={Colors.red} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: '#4C4C4C',
    marginBottom: 15,
    marginTop: 8,
  },
  subtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  cameraButton: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(117, 200, 173, 0.1)',
  },
  galleryButton: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(117, 200, 173, 0.1)',
  },
  filesButton: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(117, 200, 173, 0.1)',
  },
  uploadButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.primary,
    marginLeft: 6,
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

export default DocumentUpload;


