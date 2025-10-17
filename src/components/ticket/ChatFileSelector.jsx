import React, { useCallback, useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from '../../constants/customStyles';
import { pick } from '@react-native-documents/picker';
import { ToastContext } from '../../context/ToastContext';
import ImageSourceModal from '../modals/ImageSourceModal';

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

const ChatFileSelector = ({
  files = [],
  onChange,
  disabled = false,
  maxFiles = 5,
}) => {
  const [sourceModalVisible, setSourceModalVisible] = useState(false);
  const toastContext = useContext(ToastContext);

  const handleImageSelected = useCallback((newFile) => {
    const updatedFiles = [...(files || []), newFile];
    onChange?.(updatedFiles);
  }, [files, onChange]);

  const onPickDocuments = useCallback(async () => {
    try {
      const picked = await pick({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ],
        allowMultiSelection: true,
        mode: 'import',
        requestLongTermAccess: true,
      });

      if (picked && picked.length > 0) {
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
      if (e?.message && !/cancel/i.test(String(e.message))) {
        toastContext.showToast('Failed to open document picker: ' + e.message, 'short', 'error');
      }
    }
  }, [files, onChange, toastContext]);

  const removeFile = useCallback((fileId) => {
    const next = (files || []).filter((f) => f.id !== fileId);
    onChange?.(next);
  }, [files, onChange]);

  return (
    <View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.uploadButton, styles.imageButton]}
          onPress={() => setSourceModalVisible(true)}
          disabled={disabled}
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={25} color={Colors.primary} />
          <Text style={styles.uploadButtonText}>Images</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.uploadButton, styles.documentButton]}
          onPress={onPickDocuments}
          disabled={disabled}
          activeOpacity={0.8}
        >
          <Ionicons name="document" size={25} color={Colors.primary} />
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

      <ImageSourceModal
        visible={sourceModalVisible}
        onClose={() => setSourceModalVisible(false)}
        onImageSelected={handleImageSelected}
        maxFiles={maxFiles}
        currentFileCount={(files || []).length}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 35,
    width: '50%',
    alignSelf: 'center',
    marginTop: 8,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  imageButton: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(117, 200, 173, 0.1)',
  },
  documentButton: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(117, 200, 173, 0.1)',
  },
  uploadButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.primary,
    marginTop: 2,
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

export default ChatFileSelector;
