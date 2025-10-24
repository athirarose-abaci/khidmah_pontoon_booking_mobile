import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import moment from 'moment';
import { Colors } from '../../constants/customStyles';
import { BASE_URL_IMAGE } from '../../constants/baseUrl';
import { useSelector } from 'react-redux';

const TicketMessage = ({ 
  item, 
  authState, 
  onFilePress 
}) => {
  const isDarkMode = useSelector(state => state.themeSlice.isDarkMode);
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
        {!!name && !isCurrentUser && <Text style={[styles.msgAuthorName, { color: isDarkMode ? Colors.dark_text_secondary : '#5C7E86' }]}>{name}</Text>}
        
         {!!item?.message && (
           <View style={[
             styles.messageBubble, 
             isCurrentUser ? styles.messageBubbleRight : styles.messageBubbleLeft,
             { 
               backgroundColor: isCurrentUser 
                 ? (isDarkMode ? 'rgba(117, 200, 173, 0.2)' : 'rgba(117, 200, 173, 0.15)')
                 : (isDarkMode ? Colors.dark_container : Colors.white),
               borderWidth: isCurrentUser ? 0 : 1,
               borderColor: isCurrentUser 
                 ? 'transparent'
                 : (isDarkMode ? 'rgba(117, 200, 173, 0.2)' : 'rgba(117, 200, 173, 0.2)')
             }
           ]}>
             <Text style={[
               styles.msgBody, 
               isCurrentUser ? styles.msgBodyRight : styles.msgBodyLeft,
               { color: isCurrentUser 
                 ? Colors.white 
                 : (isDarkMode ? Colors.white : Colors.heading_font)
               }
             ]}>{item.message}</Text>
           </View>
         )}
        {hasFile && (
          <TouchableOpacity 
            style={[
              styles.fileAttachment, 
              isCurrentUser ? styles.fileAttachmentRight : styles.fileAttachmentLeft,
              { 
                backgroundColor: isDarkMode ? Colors.dark_bg_color : '#F8F9FA',
                borderColor: isDarkMode ? Colors.dark_separator : '#E9ECEF'
              }
            ]} 
            activeOpacity={0.7}
            onPress={() => onFilePress(item?.file)}
          >
            <View style={[
              styles.fileIconContainer, 
              isCurrentUser ? styles.fileIconContainerRight : styles.fileIconContainerLeft,
              { backgroundColor: isDarkMode ? Colors.dark_container : '#E3F2FD' }
            ]}>
              <Ionicons 
                name={item?.file?.includes('.jpg') || item?.file?.includes('.jpeg') || item?.file?.includes('.png') ? 'image' : 'document'} 
                size={20} 
                color={Colors.primary} 
              />
            </View>
            <View style={styles.fileInfoContainer}>
              <Text style={[
                styles.fileName, 
                isCurrentUser ? styles.fileNameRight : styles.fileNameLeft,
                { color: isDarkMode ? Colors.white : '#212529' }
              ]} numberOfLines={1}>
                {item?.file?.split('/').pop() || 'Attachment'}
              </Text>
              <Text style={[
                styles.fileType, 
                isCurrentUser ? styles.fileTypeRight : styles.fileTypeLeft,
                { color: isDarkMode ? Colors.dark_text_secondary : '#6C757D' }
              ]}>
                {item?.file?.includes('.jpg') || item?.file?.includes('.jpeg') || item?.file?.includes('.png') ? 'Image' : 'Document'}
              </Text>
            </View>
            <Ionicons name="download-outline" size={16} color={Colors.primary} />
          </TouchableOpacity>
        )}
        
        <Text style={[
          styles.msgTime, 
          isCurrentUser ? styles.msgTimeRight : styles.msgTimeLeft,
          { color: isDarkMode ? Colors.dark_text_secondary : '#8E9AA6' }
        ]}>
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
    borderTopLeftRadius: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  messageBubbleRight: {
    borderTopRightRadius: 4,
  },
  msgAuthorName: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  msgBody: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
  msgBodyLeft: {
  },
  msgBodyRight: {
  },
  msgTime: {
    marginTop: 4,
    fontSize: 10,
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
    borderWidth: 1,
  },
  fileAttachmentRight: {
    borderWidth: 1,
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
  },
  fileIconContainerRight: {
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
  },
  fileNameRight: {
  },
  fileType: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
  },
  fileTypeLeft: {
  },
  fileTypeRight: {
  },
});
