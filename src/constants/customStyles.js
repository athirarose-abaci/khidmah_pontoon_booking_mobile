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

  dark_container: '#2D2F33',
  dark_tab_bar: '#25272A',
  dark_bg_color: '#1C1D20',
  
  size_bg_light: '#F5F5F5',
  size_bg_dark: '#3A3D42',
  
  input_border_light: '#E0E0E0',
  input_border_dark: '#5A5D62',
  
  dark_separator: '#3A3D42',
  dark_text_secondary: '#959595',
  
  dropdown_selected_light: '#F0F8FF',
  dropdown_selected_dark: '#4A4D52',
  
  dropdown_container_light: '#FFFFFF',
  dropdown_container_dark: '#2D2F33',
  
  dropdown_border_light: '#E0E0E0',
  dropdown_border_dark: '#3A3D42',
  
  label_light: '#4C4C4C',
  label_dark: '#959595',
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

export const BOOKING_TABS = ['Upcoming', 'All', 'Checked In', 'Checked Out', 'No Show', 'Cancelled'];

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

export const NOTIFICATION_CONFIG = {
  'checked_in': {
    backgroundColor: '#E8F5E8',
    iconColor: '#4CAF50',
    iconType: 'image',
    iconSource: require('../assets/images/clock_in.png'),
    iconName: null,
  },
  "haven’t_checked_in_yet?": {
    backgroundColor: '#E3F2FD',
    iconColor: '#2196F3',
    iconType: 'icon',
    iconSource: null,
    iconName: 'clock-outline',
  },
  'checked_out': {
    backgroundColor: '#FFE5E5',
    iconColor: '#FF6B6B',
    iconType: 'image',
    iconSource: require('../assets/images/clock_out.png'),
    iconName: null,
  },
  'checkout_reminder': {
    backgroundColor: '#E3F2FD',
    iconColor: '#2196F3',
    iconType: 'icon',
    iconSource: null,
    iconName: 'clock-outline',
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
  'booking_extended': {
    backgroundColor: '#E3F2FD',
    iconColor: '#2196F3',
    iconType: 'image',
    iconSource: require('../assets/images/extend_stay.png'),
    iconName: null,
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
  'ticket_closed': {
    backgroundColor: '#E2E2E2',
    iconColor: '#6F6F6F',
    iconType: 'lucide',
    iconSource: null,
    iconName: 'ticket-x',
  },
  'others': {
    backgroundColor: '#F0F0F0',
    iconColor: '#959595',
    iconType: 'icon',
    iconSource: null,
    iconName: 'notifications-outline',
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
