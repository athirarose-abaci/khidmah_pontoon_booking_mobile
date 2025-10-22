import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Colors, getTicketStatusColors, getDisplayTicketStatus } from '../../constants/customStyles';
import { useSelector } from 'react-redux';

const MyTicketsCard = ({ item, onPress }) => {
  const description = typeof item?.description === 'string' ? item?.description : '';
  const displayDescription = description.length > 26 ? `${description.slice(0, 26)}…` : description;
  const statusColors = getTicketStatusColors(item?.status);
  const displayStatus = getDisplayTicketStatus(item?.status);

  const isDarkMode = useSelector(state => state.themeSlice.isDarkMode);
  
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
              
              if (categoryName.toLowerCase() === 'others' && item?.subject) {
                return `Others: ${item.subject}`;
              }
              
              return categoryName;
            })()}
          </Text>
          {item?.ticket_id ? (
            <Text style={styles.ticketId} numberOfLines={1}>#{item?.ticket_id}</Text>
          ) : null}
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.category} numberOfLines={1}>{displayDescription}</Text>
          <View style={[styles.statusBadge, { 
            backgroundColor: statusColors.backgroundColor,
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
            {item?.agent ? (
              <>
                {item?.agent?.avatar ? (
                  <Image source={item?.agent?.avatar} style={styles.avatar} />
                ) : null}
                <View style={styles.agentTextBlock}>
                  <Text style={[styles.agentRole, { color: isDarkMode ? Colors.primary : '#00263A' }]}>Assigned Agent</Text>
                  <Text style={[styles.agentName, { color: isDarkMode ? Colors.white : Colors.black }]}>
                    {item?.agent?.name ? item?.agent?.name : ''}
                  </Text>
                </View>
              </>
            ) : null}
          </View>

          <View style={styles.rightSection}>
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>3</Text>
            </View>
            <Text style={styles.timestamp}>
              {item?.createdAtDate} {item?.createdAtTime}
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
  unassignedBadge: {
    backgroundColor: '#FFF4E5',
    borderColor: '#FFC78E',
    borderWidth: 1,
    paddingHorizontal: 25,
    paddingVertical: 4,
    borderRadius: 8,
  },
  unassignedText: {
    color: '#C27A00',
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  notificationBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginBottom: 4,
  },
  notificationCount: {
    color: Colors.white,
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
  },
});

