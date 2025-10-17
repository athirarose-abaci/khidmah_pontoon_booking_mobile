import moment from 'moment';

/**
 * Parse 12-hour format time string (e.g., "10:00 AM") and convert to 24-hour format
 * @param {string} timeString - Time in 12-hour format with AM/PM
 * @returns {object} - Object with hour24, minute, and original format
 */
export const parseTime12Hour = (timeString) => {
  const timeMatch = timeString.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!timeMatch) {
    throw new Error('Invalid time format. Expected format: "HH:MM AM/PM"');
  }
  
  let hour24 = parseInt(timeMatch[1]);
  const minute = parseInt(timeMatch[2]);
  const period = timeMatch[3].toUpperCase();
  
  // Convert to 24-hour format
  if (period === 'AM' && hour24 === 12) {
    hour24 = 0;
  } else if (period === 'PM' && hour24 !== 12) {
    hour24 += 12;
  }
  
  return {
    hour24,
    minute,
    period,
    originalFormat: timeString
  };
};

/**
 * Convert 24-hour format to 12-hour format with AM/PM
 * @param {number} hour24 - Hour in 24-hour format (0-23)
 * @param {number} minute - Minute (0-59)
 * @returns {string} - Time in 12-hour format with AM/PM
 */
export const formatTime12Hour = (hour24, minute) => {
  let hour12 = hour24;
  let period = 'AM';
  
  if (hour24 === 0) {
    hour12 = 12;
    period = 'AM';
  } else if (hour24 === 12) {
    hour12 = 12;
    period = 'PM';
  } else if (hour24 > 12) {
    hour12 = hour24 - 12;
    period = 'PM';
  }
  
  return `${hour12.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
};

/**
 * Calculate departure time based on arrival time and duration
 * @param {string} arrivalDate - Arrival date in DD/MM/YYYY format
 * @param {string} arrivalTime - Arrival time in 12-hour format with AM/PM
 * @param {string|number} durationHours - Duration hours
 * @param {string|number} durationMinutes - Duration minutes
 * @returns {object} - Object with departureDate and departureTime
 */
export const calculateDepartureTime = (arrivalDate, arrivalTime, durationHours, durationMinutes) => {
  try {
    // Parse arrival date and time
    const arrivalDateObj = moment(arrivalDate, 'DD/MM/YYYY');
    const { hour24, minute } = parseTime12Hour(arrivalTime);
    
    // Set arrival time
    arrivalDateObj.hour(hour24).minute(minute);
    
    // Add duration
    const durationHoursNum = parseInt(durationHours) || 0;
    const durationMinutesNum = parseInt(durationMinutes) || 0;
    
    const departureDateObj = arrivalDateObj.clone()
      .add(durationHoursNum, 'hours')
      .add(durationMinutesNum, 'minutes');
    
    // Format results
    const departureDate = departureDateObj.format('DD/MM/YYYY');
    const departureTime = formatTime12Hour(departureDateObj.hour(), departureDateObj.minute());
    
    return {
      departureDate,
      departureTime
    };
  } catch (error) {
    throw new Error(`Failed to calculate departure time: ${error.message}`);
  }
};

/**
 * Validate time format
 * @param {string} timeString - Time string to validate
 * @returns {boolean} - True if valid 12-hour format
 */
export const isValidTimeFormat = (timeString) => {
  return /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.test(timeString);
};

/**
 * Get current time in 12-hour format
 * @returns {string} - Current time in 12-hour format with AM/PM
 */
export const getCurrentTime12Hour = () => {
  const now = new Date();
  return formatTime12Hour(now.getHours(), now.getMinutes());
};

/**
 * Convert 12-hour format time to 24-hour format for API calls
 * @param {string} timeString - Time in 12-hour format with AM/PM (e.g., "10:00 AM")
 * @returns {string} - Time in 24-hour format (e.g., "10:00")
 */
export const convertTo24HourFormat = (timeString) => {
  const { hour24, minute } = parseTime12Hour(timeString);
  return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

/**
 * Format timestamp as "time ago" (e.g., "2 hours ago", "3 days ago")
 * @param {string|Date} timestamp - Timestamp to format
 * @returns {string} - Formatted time ago string
 */
export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return '';
  
  const now = moment();
  const time = moment(timestamp);
  
  if (!time.isValid()) return '';
  
  return time.fromNow();
};