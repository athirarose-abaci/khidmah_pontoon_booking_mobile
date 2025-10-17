import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import moment from 'moment';
import { Colors } from '../../constants/customStyles';
import { BASE_URL_IMAGE } from '../../constants/baseUrl';

const TicketMessage = ({ 
  item, 
  authState, 
  onFilePress 
}) => {
  const name = item?.created_by_name || '';
  const isCurrentUser = item?.created_by?.role === 'CUSTOMER';
  const avatarUri = item?.created_by?.avatar ? { uri: `${BASE_URL_IMAGE}${item?.created_by?.avatar}` } : null;
  const when = item?.created_at;
  const hasFile = item?.file;

  return (
    <View style={[styles.chatRow, isCurrentUser ? styles.chatRowRight : styles.chatRowLeft]}>
      {!isCurrentUser && (
        <View style={styles.avatarColumn}>
          <View style={styles.avatarCircle}>
            {avatarUri ? (
              <Image source={avatarUri} style={styles.avatar} />
            ) : (
              <Ionicons name="person" size={16} color={Colors.white} />
            )}
          </View>
        </View>
      )}
      
      <View style={[styles.messageColumn, isCurrentUser ? styles.messageColumnRight : styles.messageColumnLeft]}>
        {!!name && !isCurrentUser && <Text style={styles.msgAuthorName}>{name}</Text>}
        
        {!!item?.message && (
          <View style={[styles.messageBubble, isCurrentUser ? styles.messageBubbleRight : styles.messageBubbleLeft]}>
            <Text style={[styles.msgBody, isCurrentUser ? styles.msgBodyRight : styles.msgBodyLeft]}>{item.message}</Text>
          </View>
        )}
        {hasFile && (
          <TouchableOpacity 
            style={[styles.fileAttachment, isCurrentUser ? styles.fileAttachmentRight : styles.fileAttachmentLeft]} 
            activeOpacity={0.7}
            onPress={() => onFilePress(item?.file)}
          >
            <View style={[styles.fileIconContainer, isCurrentUser ? styles.fileIconContainerRight : styles.fileIconContainerLeft]}>
              <Ionicons 
                name={item?.file?.includes('.jpg') || item?.file?.includes('.jpeg') || item?.file?.includes('.png') ? 'image' : 'document'} 
                size={20} 
                color={isCurrentUser ? Colors.primary : Colors.primary} 
              />
            </View>
            <View style={styles.fileInfoContainer}>
              <Text style={[styles.fileName, isCurrentUser ? styles.fileNameRight : styles.fileNameLeft]} numberOfLines={1}>
                {item?.file?.split('/').pop() || 'Attachment'}
              </Text>
              <Text style={[styles.fileType, isCurrentUser ? styles.fileTypeRight : styles.fileTypeLeft]}>
                {item?.file?.includes('.jpg') || item?.file?.includes('.jpeg') || item?.file?.includes('.png') ? 'Image' : 'Document'}
              </Text>
            </View>
            <Ionicons name="download-outline" size={16} color={isCurrentUser ? Colors.primary : Colors.primary} />
          </TouchableOpacity>
        )}
        
        <Text style={[styles.msgTime, isCurrentUser ? styles.msgTimeRight : styles.msgTimeLeft]}>
          {moment(when).isValid() ? moment(when).format('DD MMM YYYY, hh:mm A') : ''}
        </Text>
      </View>
      
      {isCurrentUser && (
        <View style={styles.avatarColumn}>
          <View style={styles.avatarCircle}>
            {avatarUri ? (
              <Image source={avatarUri} style={styles.avatar} />
            ) : (
              <Ionicons name="person" size={16} color={Colors.white} />
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default TicketMessage;

const styles = StyleSheet.create({
  chatRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    marginBottom: 4,
  },
  chatRowLeft: {
    justifyContent: 'flex-start',
  },
  chatRowRight: {
    justifyContent: 'flex-end',
  },
  avatarColumn: {
    width: 40,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#9EC2D2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  messageColumn: {
    maxWidth: '75%',
    minWidth: 100,
  },
  messageColumnLeft: {
    alignItems: 'flex-start',
  },
  messageColumnRight: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 4,
  },
  messageBubbleLeft: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  messageBubbleRight: {
    backgroundColor: 'rgba(117, 200, 173, 0.15)',
    borderTopRightRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(117, 200, 173, 0.3)',
  },
  msgAuthorName: {
    fontSize: 12,
    color: '#5C7E86',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  msgBody: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
  msgBodyLeft: {
    color: Colors.heading_font,
  },
  msgBodyRight: {
    color: Colors.heading_font,
  },
  msgTime: {
    marginTop: 4,
    fontSize: 10,
    color: '#8E9AA6',
    fontFamily: 'Inter-Italic',
  },
  msgTimeLeft: {
    textAlign: 'left',
  },
  msgTimeRight: {
    textAlign: 'right',
  },
  fileAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 6,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    minWidth: 200,
  },
  fileAttachmentLeft: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  fileAttachmentRight: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  fileIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  fileIconContainerLeft: {
    backgroundColor: '#E3F2FD',
  },
  fileIconContainerRight: {
    backgroundColor: '#E3F2FD',
  },
  fileInfoContainer: {
    flex: 1,
    marginRight: 6,
  },
  fileName: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginBottom: 1,
  },
  fileNameLeft: {
    color: '#212529',
  },
  fileNameRight: {
    color: '#212529',
  },
  fileType: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
  },
  fileTypeLeft: {
    color: '#6C757D',
  },
  fileTypeRight: {
    color: '#6C757D',
  },
});
