export const Colors = {
  black: '#000000',
  white: '#ffffff',
  red: '#FF0000',

  primary: '#75C8AD',
  font_gray: '#959595',
  border_line: '#F2F2F2',
  bg_color: '#F7F7F7',
  tab_inactive: '#C8C8C8',
  sub_heading_font: '#4C4C4C',
  heading_font: '#494949',
  error: '#ff6b6b',
};

export function getStatusTagColors(status) {
  const key = (status || '').toString().trim().toLowerCase();
  const normalized = key.replace(/[_-]/g, ' ');

  switch (normalized) {
    case 'confirmed':
      return {
        backgroundColor: '#E3F4EF',
        textColor: '#75C8AD',
      };
    case 'checked in':
      return {
        backgroundColor: '#DFF4F7',
        textColor: '#61C8D5',
      };
    case 'checked out':
      return {
        backgroundColor: '#E2E2E2',
        textColor: '#6F6F6F',
      };
    case 'no show':
      return {
        backgroundColor: '#FCE5D3',
        textColor: '#F27C21',
      };
    case 'cancelled':
      return {
        backgroundColor: '#F7CECE',
        textColor: '#D80C0C',
      };
    default:
      return {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        textColor: Colors.black,
      };
  }
}

export function getStatusTagColorsWithBg(status) {
  const key = (status || '').toString().trim().toLowerCase();
  const normalized = key.replace(/[_-]/g, ' ');

  switch (normalized) {
    case 'confirmed':
      return {
        backgroundColor: '#E3F4EF',
        textColor: '#75C8AD',
      };
    case 'checked in':
      return {
        backgroundColor: '#DFF4F7',
        textColor: '#61C8D5',
      };
    case 'checked out':
      return {
        backgroundColor: '#E2E2E2',
        textColor: '#6F6F6F',
      };
    case 'no show':
      return {
        backgroundColor: '#FCE5D3',
        textColor: '#F27C21',
      };
    case 'cancelled':
      return {
        backgroundColor: '#F7CECE',
        textColor: '#D80C0C',
      };
    default:
      return {
        backgroundColor: '#E7E7E7',
        textColor: Colors.black,
      };
  }
}

export const getDisplayStatus = (status) => {
  if (!status) return 'N/A';
  const code = String(status).toUpperCase();
  switch (code) {
    case 'CONFIRMED':
      return 'Upcoming';
    case 'CHECKED_IN':
      return 'In pontoon';
    case 'CHECKED_OUT':
      return 'Checked out';
    case 'NO_SHOW':
      return 'No show';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status; 
  }
};

// Booking status mapping constants
export const BOOKING_STATUS_MAP = {
  'All': null,
  'Checked In': 'CHECKED_IN',
  'Upcoming': 'CONFIRMED', 
  'Checked Out': 'CHECKED_OUT',
  'No Show': 'NO_SHOW',
  'Cancelled': 'CANCELLED'
};

export const BOOKING_TABS = ['All', 'Upcoming', 'Checked In', 'Checked Out', 'No Show', 'Cancelled'];

export const getBackendStatus = (tabName) => {
  return BOOKING_STATUS_MAP[tabName] || null;
};

// Ticket status color mapping
export function getTicketStatusColors(status) {
  const key = (status || '').toString().trim().toUpperCase();
  
  switch (key) {
    case 'OPEN':
      return {
        backgroundColor: '#FFF4E5',
        textColor: '#F27C21',
        borderColor: '#FFC78E',
      };
    case 'IN_PROGRESS':
      return {
        backgroundColor: '#E3F4EF',
        textColor: '#75C8AD',
        borderColor: '#75C8AD',
      };
    case 'CLOSED':
      return {
        backgroundColor: '#E2E2E2',
        textColor: '#6F6F6F',
        borderColor: '#B0B0B0',
      };
    default:
      return {
        backgroundColor: '#E7E7E7',
        textColor: Colors.black,
        borderColor: '#C8C8C8',
      };
  }
}

export const getDisplayTicketStatus = (status) => {
  if (!status) return 'Unknown';
  const code = String(status).toUpperCase();
  switch (code) {
    case 'OPEN':
      return 'Open';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'CLOSED':
      return 'Closed';
    default:
      return status;
  }
};

// Notification configuration for different notification types
// To add a new notification type:
// 1. Add a new entry to NOTIFICATION_CONFIG with a unique key
// 2. Set backgroundColor (light background color for the icon container)
// 3. Set iconColor (color for the icon)
// 4. Set iconType to either 'image' or 'icon'
// 5. If iconType is 'image', set iconSource to require() the image file
// 6. If iconType is 'icon', set iconName to the MaterialDesignIcons name
// 7. The getNotificationConfig function will automatically handle matching by type or subject
export const NOTIFICATION_CONFIG = {
  'checked_in': {
    backgroundColor: '#E8F5E8',
    iconColor: '#4CAF50',
    iconType: 'image',
    iconSource: require('../assets/images/clock_in.png'),
    iconName: null,
  },
  'checked_out': {
    backgroundColor: '#FFE5E5',
    iconColor: '#FF6B6B',
    iconType: 'image',
    iconSource: require('../assets/images/clock_out.png'),
    iconName: null,
  },
  'booking_successful': {
    backgroundColor: '#E3F4EF',
    iconColor: '#4CAF50',
    iconType: 'icon',
    iconSource: null,
    iconName: 'check-circle-outline',
  },
  'booking_cancelled': {
    backgroundColor: '#FFE5E5',
    iconColor: '#FF6B6B',
    iconType: 'icon',
    iconSource: null,
    iconName: 'close-circle-outline',
  },
  'booking_updated': {
    backgroundColor: '#E3F4EF',
    iconColor: '#4CAF50',
    iconType: 'icon',
    iconSource: null,
    iconName: 'check-circle-outline',
  },
  'reminder': {
    backgroundColor: '#E3F2FD',
    iconColor: '#2196F3',
    iconType: 'icon',
    iconSource: null,
    iconName: 'clock-outline',
  },
  'cancelled': {
    backgroundColor: '#FFE5E5',
    iconColor: '#FF6B6B',
    iconType: 'icon',
    iconSource: null,
    iconName: 'close-circle-outline',
  },
  'ticket_created': {
    backgroundColor: '#FFF4E5',
    iconColor: '#F27C21',
    iconType: 'icon',
    iconSource: null,
    iconName: 'ticket-outline',
  },
  'ticket_claimed': {
    backgroundColor: '#E8F5E8',
    iconColor: '#4CAF50',
    iconType: 'icon',
    iconSource: null,
    iconName: 'ticket-confirmation-outline',
  },
  'extend_stay': {
    backgroundColor: '#E3F2FD',
    iconColor: '#2196F3',
    iconType: 'image',
    iconSource: require('../assets/images/extend_stay.png'),
    iconName: null,
  },
  'default': {
    backgroundColor: '#F0F0F0',
    iconColor: '#959595',
    iconType: 'icon',
    iconSource: null,
    iconName: 'notifications-outline',
  }
};

// Helper function to get notification configuration
export const getNotificationConfig = (notificationType, subject) => {

  if (notificationType && NOTIFICATION_CONFIG[notificationType]) {
    return NOTIFICATION_CONFIG[notificationType];
  }
  
  if (subject) {
    const normalizedSubject = subject.toLowerCase().replace(/\s+/g, '_');
    if (NOTIFICATION_CONFIG[normalizedSubject]) {
      return NOTIFICATION_CONFIG[normalizedSubject];
    }
  }
  
  return NOTIFICATION_CONFIG['default'];
};