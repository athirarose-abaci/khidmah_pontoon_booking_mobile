import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors, getTicketStatusColors, getDisplayTicketStatus } from '../../constants/customStyles';
import { useSelector } from 'react-redux';
import moment from 'moment';

const MyTicketsCard = ({ item, onPress }) => {
  const isDarkMode = useSelector(state => state.themeSlice.isDarkMode);

  // Format created date
  const formatCreatedAt = (value) => {
    if (!value) return { date: '', time: '' };
    const m = moment(value);
    if (!m.isValid()) return { date: '', time: '' };
    return { date: m.format('DD.MM.YY'), time: m.format('hh.mmA') };
  };

  // Get agent information if ticket is claimed
  const getAgentInfo = () => {
    if (item?.status === 'IN_PROGRESS' && item?.claimed_by) {
      return {
        name: item?.claimed_by?.full_name || item?.claimed_by?.first_name || item?.claimed_by?.username || '',
        avatar: item?.claimed_by?.avatar ? { uri: item?.claimed_by?.avatar } : undefined,
      };
    }
    return null;
  };

  const description = typeof item?.description === 'string' ? item?.description : '';
  const displayDescription = description.length > 26 ? `${description.slice(0, 26)}…` : description;
  const statusColors = getTicketStatusColors(item?.status);
  const displayStatus = getDisplayTicketStatus(item?.status);
  const { date: createdAtDate, time: createdAtTime } = formatCreatedAt(item?.created_at || item?.createdAt || item?.created_on);
  const agent = getAgentInfo();

  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      onPress={onPress} 
      style={[styles.card, { backgroundColor: isDarkMode ? Colors.dark_container : Colors.white }]}
    >
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: isDarkMode ? Colors.white : Colors.black }]} numberOfLines={1}>
            {(() => {
              const categoryName = typeof item?.category === 'object' && item?.category?.name 
                ? item.category.name 
                : (typeof item?.category === 'string' ? item.category : '');
              
              let displayText = '';
              if (categoryName.toLowerCase() === 'others' && item?.subject) {
                displayText = `Others: ${item.subject}`;
              } else {
                displayText = categoryName;
              }
              
              // Limit to 22 characters maximum
              return displayText.length > 22 ? `${displayText.slice(0, 22)}…` : displayText;
            })()}
          </Text>
          {item?.ticket_id ? (
            <Text style={styles.ticketId} numberOfLines={1}>#{item?.ticket_id}</Text>
          ) : null}
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.category} numberOfLines={1}>{displayDescription}</Text>
          <View style={[styles.statusBadge, { 
            backgroundColor: isDarkMode 
              ? Colors.dark_container 
              : statusColors.backgroundColor,
            borderColor: statusColors.borderColor 
          }]}>
            <Text style={[styles.statusText, { color: statusColors.textColor }]}>
              {displayStatus}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.footerRow}>
          <View style={styles.agentRow}>
            {agent ? (
              <>
                {agent?.avatar ? (
                  <Image source={agent?.avatar} style={styles.avatar} />
                ) : null}
                <View style={styles.agentTextBlock}>
                  <Text style={[styles.agentRole, { color: isDarkMode ? Colors.primary : '#00263A' }]}>Assigned Agent</Text>
                  <Text style={[styles.agentName, { color: isDarkMode ? Colors.white : Colors.black }]}>
                    {agent?.name ? agent?.name : ''}
                  </Text>
                </View>
              </>
            ) : null}
          </View>

          <View style={styles.rightSection}>
            {agent && (
              <View style={styles.messageIconContainer}>
                <View style={styles.messageBadge}>
                  <Text style={styles.messageCount}>{item?.unread_message_count || 0}</Text>
                </View>
                <Ionicons name="chatbox-outline" size={20} color="#B0B0B0" />
              </View>
            )} 
            <Text style={styles.timestamp}>
              {createdAtDate} {createdAtTime}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MyTicketsCard;

const styles = StyleSheet.create({
  card: {
    // backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 5,
    marginTop: 10,
    minHeight: 100,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    overflow: 'hidden',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    // color: Colors.black,
    fontSize: 14.5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
  },
  ticketId: {
    marginLeft: 12,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
    fontSize: 12,
  },
  category: {
    marginTop: 4,
    color: '#9E9E9E',
    fontFamily: 'Inter-Regular',
    fontSize: 12.5,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginTop: 12,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 10,
  },
  agentTextBlock: {
    flexDirection: 'column',
  },
  agentRole: {
    fontSize: 12,
    // color: '#00263A',
    fontFamily: 'Inter-Italic',
  },
  agentName: {
    fontSize: 13,
    // color: Colors.black,
    fontFamily: 'Inter-SemiBold',
  },
  rightSection: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    color: '#B0B0B0',
    fontFamily: 'Inter-Italic',
  },
  messageIconContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 2,
    position: 'relative',
  },
  messageBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    minWidth: 17,
    height: 17,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    position: 'absolute',
    top: -6,
    right: -6,
    zIndex: 1,
    borderWidth: 1,
    borderColor: Colors.white,
    textAlign: 'center',
  },
  messageCount: {
    color: Colors.white,
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    lineHeight: 12,
  },
});

