import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors } from '../../constants/customStyles';

const MyTicketsCard = ({ item }) => {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.category} numberOfLines={1}>{item.category}</Text>

        <View style={styles.divider} />

        <View style={styles.footerRow}>
          <View style={styles.agentRow}>
            <Image source={item.agent?.avatar} style={styles.avatar} />
            <View style={styles.agentTextBlock}>
              <Text style={styles.agentRole}>Assigned Agent</Text>
              <Text style={styles.agentName}>{item.agent?.name}</Text>
            </View>
          </View>

          <Text style={styles.timestamp}>
            {item.createdAtDate} {item.createdAtTime}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default MyTicketsCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
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
  title: {
    fontFamily: 'Inter-SemiBold',
    color: Colors.black,
    fontSize: 14,
  },
  category: {
    marginTop: 4,
    color: '#9E9E9E',
    fontFamily: 'Inter-Regular',
    fontSize: 12,
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
    fontSize: 11,
    color: Colors.primary,
    fontFamily: 'Inter-Regular',
  },
  agentName: {
    fontSize: 13,
    color: Colors.black,
    fontFamily: 'Inter-SemiBold',
  },
  timestamp: {
    fontSize: 11,
    color: '#B0B0B0',
    fontFamily: 'Inter-Medium',
  },
});

