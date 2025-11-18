import moment from 'moment';

/**
 * Parses min_duration from berth data (format: "HH:MM:SS" or "HH:MM")
 * Returns duration in milliseconds
 */
export const parseMinDuration = (berthData) => {
  if (!berthData?.min_duration) {
    return 0;
  }
  const timeParts = berthData.min_duration.split(':');
  if (timeParts.length >= 2) {
    const hours = parseInt(timeParts[0], 10) || 0;
    const minutes = parseInt(timeParts[1], 10) || 0;
    const seconds = parseInt(timeParts[2], 10) || 0;
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  }
  return 0;
};

/**
 * Gets working hours for a specific date from berthAvailabilityData
 * Returns null if is_active is false or if no availability data is found
 * Uses start_time and end_time from berthAvailabilityData when available
 */
export const getWorkingHours = (date, berthAvailabilityData = []) => {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Map day of week to day name
  const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const dayName = dayNames[dayOfWeek];

  // Find availability data for this day of week (check all entries, not just active ones)
  const availabilityForDay = berthAvailabilityData.find(
    (availability) => availability?.day_of_week === dayName
  );

  // If day exists but is_active is false, return time range with isAvailable = false
  if (availabilityForDay && availabilityForDay.is_active === false) {
    // Use start_time and end_time if available, otherwise use full day
    if (availabilityForDay.start_time && availabilityForDay.end_time) {
      const startTimeParts = availabilityForDay.start_time.split(':');
      const endTimeParts = availabilityForDay.end_time.split(':');
      const startHour = parseInt(startTimeParts[0], 10);
      const startMinute = parseInt(startTimeParts[1], 10);
      const endHour = parseInt(endTimeParts[0], 10);
      const endMinute = parseInt(endTimeParts[1], 10);

      const start = new Date(year, month, day, startHour, startMinute, 0);
      const end = new Date(year, month, day, endHour, endMinute, 0);

      return { start, end, isAvailable: false };
    } else {
      // Use full day if times not specified
      const start = new Date(year, month, day, 0, 0, 0);
      const end = new Date(year, month, day, 23, 59, 59);

      return { start, end, isAvailable: false };
    }
  }

  // If day exists, is_active is true, and has start/end times, use them
  if (
    availabilityForDay &&
    availabilityForDay.is_active === true &&
    availabilityForDay.start_time &&
    availabilityForDay.end_time
  ) {
    // Parse time strings (format: "HH:MM:SS")
    const startTimeParts = availabilityForDay.start_time.split(':');
    const endTimeParts = availabilityForDay.end_time.split(':');
    const startHour = parseInt(startTimeParts[0], 10);
    const startMinute = parseInt(startTimeParts[1], 10);
    const endHour = parseInt(endTimeParts[0], 10);
    const endMinute = parseInt(endTimeParts[1], 10);

    const start = new Date(year, month, day, startHour, startMinute, 0);
    const end = new Date(year, month, day, endHour, endMinute, 0);

    return { start, end, isAvailable: true };
  }

  // If day doesn't exist in berthAvailabilityData, return null (no fallback)
  return null;
};

/**
 * Creates availability blocks by merging and splitting overlapping time ranges per berth
 * Returns timeline bars showing occupied vs available slots
 * Note: Availability is calculated based on ALL bookings, regardless of selectedBoat
 * The selectedBoat is used to create a dotted overlay block showing where the boat would fit
 * Now includes unoccupied blocks for the entire day range
 */
export const createAvailabilityBlocks = (
  bookings,
  selectedBoat,
  dayStart,
  dayEnd,
  berthData = null,
) => {
  // Group ALL bookings by berth (for availability calculation)
  const bookingsByBerth = bookings.reduce(
    (acc, booking) => {
      const berthId = booking?.berth?.id ?? 0;
      if (!acc[berthId]) {
        acc[berthId] = [];
      }
      acc[berthId].push(booking);
      return acc;
    },
    {},
  );

  const availabilityBlocks = [];

  // Process each berth separately
  Object.entries(bookingsByBerth).forEach(([berthIdStr, berthBookings]) => {
    const berthId = Number(berthIdStr);
    const berth = berthBookings[0]?.berth ?? {
      max_boat_allowed: 2,
      name: 'Unknown',
      length: 100,
    };

    // Use berthData if provided (from selectedBerthData), otherwise use berth from booking
    const maxAllowed = berthData.max_boat_allowed ?? 2;
    const berthLength = berthData.length ?? 100;
    console.log('berthData', berthData);

    // Collect all unique time points (start and end times) from ALL bookings
    const timePoints = new Set();
    berthBookings.forEach((booking) => {
      const start = new Date(booking.start_date).getTime();
      const end = new Date(booking.end_date).getTime();
      timePoints.add(start);
      timePoints.add(end);
    });

    // If dayStart and dayEnd are provided, add them to time points to create blocks for unoccupied periods
    if (dayStart && dayEnd) {
      timePoints.add(dayStart.getTime());
      timePoints.add(dayEnd.getTime());
    }

    // Sort time points
    const sortedTimePoints = Array.from(timePoints).sort((a, b) => a - b);

    // Create availability blocks between consecutive time points
    for (let i = 0; i < sortedTimePoints.length - 1; i++) {
      let blockStart = new Date(sortedTimePoints[i]);
      let blockEnd = new Date(sortedTimePoints[i + 1]);

      // Skip if block is outside the day range (when dayStart/dayEnd are provided)
      if (dayStart && dayEnd) {
        if (blockEnd <= dayStart || blockStart >= dayEnd) {
          continue;
        }
        // Clamp block to day range
        blockStart = blockStart < dayStart ? dayStart : blockStart;
        blockEnd = blockEnd > dayEnd ? dayEnd : blockEnd;
        if (blockStart >= blockEnd) {
          continue;
        }
      }

      // Find all bookings that overlap with this time block (use ALL bookings for availability)
      const overlappingBookings = berthBookings.filter((booking) => {
        const bookingStart = new Date(booking.start_date);
        const bookingEnd = new Date(booking.end_date);
        return bookingStart < blockEnd && bookingEnd > blockStart;
      });

      const occupiedCount = overlappingBookings.length;
      
      // Calculate block duration in milliseconds
      const blockDurationMs = blockEnd.getTime() - blockStart.getTime();
      
      // Parse min_duration from berth data and check if block duration is too short
      const minDurationMs = parseMinDuration(berthData);
      const isDurationTooShort = minDurationMs > 0 && blockDurationMs < minDurationMs;
      
      // If duration is too short, mark as unavailable (fully occupied with stripes)
      const isFullyOccupied = occupiedCount >= maxAllowed || isDurationTooShort;
      const isAvailable = occupiedCount < maxAllowed && !isDurationTooShort;

      // Calculate cumulative boat length + buffer for this time slot
      // Use each booking's individual boat_buffer_length (boats have buffer, berths don't)
      const occupiedLength = overlappingBookings.reduce((sum, booking) => {
        const boatLength = booking?.boat_length ?? 0;
        const bookingBufferLength = booking?.boat_buffer_length ?? 0; // Only boat has buffer_length, not berth
        return sum + boatLength + bookingBufferLength;
      }, 0);

      const availableLength = Math.max(0, berthLength - occupiedLength);
      // If duration is too short, show as fully occupied (100% width with stripes)
      const widthPercent = isDurationTooShort ? 100 : (berthLength > 0 ? (occupiedLength / berthLength) * 100 : 0);

      // Filter overlapping bookings for display if boat is selected (for informational purposes)
      const displayOverlappingBookings = selectedBoat?.id
        ? overlappingBookings.filter((b) => b.boat?.id === selectedBoat.id)
        : overlappingBookings;

      // Create title with length information
      const lengthInfo = `${occupiedLength.toFixed(1)}ft / ${berthLength.toFixed(1)}ft`;
      const title = isFullyOccupied
        ? `Fully Occupied (${lengthInfo})`
        : `Available (${availableLength.toFixed(1)}ft free)`;

      // Always create availability blocks where bookings exist
      // This shows the merged/split time ranges as timeline bars
      availabilityBlocks.push({
        id: `availability-${berthId}-${blockStart.getTime()}-${blockEnd.getTime()}`,
        start: blockStart,
        end: blockEnd,
        title,
        berthId,
        berthName: berth.name,
        occupiedCount,
        maxAllowed,
        isAvailable,
        isFullyOccupied,
        overlappingBookings: displayOverlappingBookings,
        allOverlappingBookings: overlappingBookings, 
        berthLength,
        occupiedLength,
        availableLength,
        bufferLength: 0, 
        widthPercent,
      });
    }
  });

  return availabilityBlocks;
};

