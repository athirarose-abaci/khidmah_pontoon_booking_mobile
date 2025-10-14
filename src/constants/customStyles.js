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
      return 'Confirmed';
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
  'Confirmed': 'CONFIRMED', 
  'Checked Out': 'CHECKED_OUT',
  'No Show': 'NO_SHOW',
  'Cancelled': 'CANCELLED'
};

export const BOOKING_TABS = ['All', 'Checked In', 'Confirmed', 'Checked Out', 'No Show', 'Cancelled'];

export const getBackendStatus = (tabName) => {
  return BOOKING_STATUS_MAP[tabName] || null;
};