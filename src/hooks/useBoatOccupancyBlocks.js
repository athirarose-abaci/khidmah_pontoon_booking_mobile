import { useMemo } from 'react';
import moment from 'moment';

const calculateTotalBoatLength = (booking) => {
  return booking?.total_boat_length 
    ? parseFloat(booking?.total_boat_length)
    : (parseFloat(booking?.boat?.length || 0) + parseFloat(booking?.boat_buffer_length || 0));
};

const getWorkingHours = (date, berth, berthSettings) => {
  const dayOfWeek = date.getDay();
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Map JavaScript day of week (0=Sunday) to API format (SUNDAY, MONDAY, etc.)
  const dayOfWeekMap = {
    0: 'SUNDAY',
    1: 'MONDAY',
    2: 'TUESDAY',
    3: 'WEDNESDAY',
    4: 'THURSDAY',
    5: 'FRIDAY',
    6: 'SATURDAY',
  };

  const apiDayOfWeek = dayOfWeekMap[dayOfWeek];
  let startHour;
  let endHour;

  if (berthSettings && berthSettings.length > 0 && berth?.id) {
    const matchingSetting = berthSettings.find(
      (setting) =>
        setting.day_of_week === apiDayOfWeek &&
        setting.berth === berth.id &&
        setting.is_active === true,
    );

    if (matchingSetting && matchingSetting.start_time && matchingSetting.end_time) {
      const [startHours, startMinutes] = matchingSetting.start_time.split(':').map(Number);
      const [endHours, endMinutes] = matchingSetting.end_time.split(':').map(Number);
      startHour = startHours;
      endHour = endHours;

      const start = new Date(year, month, day, startHour, startMinutes, 0);
      const end = new Date(year, month, day, endHour, endMinutes, 0);
      return { start, end };
    }
  }

  // Default working hours: Weekdays (Mon-Fri) 8 AM - 9 PM, Weekends 6 AM - 10 PM
  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    startHour = 8;
    endHour = 21;
  } else {
    startHour = 6;
    endHour = 22;
  }

  const start = new Date(year, month, day, startHour, 0, 0);
  const end = new Date(year, month, day, endHour, 0, 0);
  return { start, end };
};

const getBufferTime = (date, berth, berthSettings) => {
  const dayOfWeek = date.getDay();

  // Map JavaScript day of week to API format
  const dayOfWeekMap = {
    0: 'SUNDAY',
    1: 'MONDAY',
    2: 'TUESDAY',
    3: 'WEDNESDAY',
    4: 'THURSDAY',
    5: 'FRIDAY',
    6: 'SATURDAY',
  };

  const apiDayOfWeek = dayOfWeekMap[dayOfWeek];

  if (berthSettings && berthSettings.length > 0 && berth?.id) {
    const matchingSetting = berthSettings.find(
      (setting) =>
        setting.day_of_week === apiDayOfWeek &&
        setting.berth === berth.id &&
        setting.is_active === true,
    );

    if (matchingSetting && matchingSetting.buffer_time) {
      // Parse buffer_time string (format: "00:05:00" = 5 minutes) and convert to milliseconds
      const [hours, minutes, seconds] = matchingSetting.buffer_time.split(':').map(Number);
      const bufferMs = (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
      return bufferMs;
    }
  }

  return 0;
};

/**
 * Checks if a berth is active on a specific date based on berthSettings
 */
export const isBerthActiveOnDate = (date, berth, berthSettings) => {
  if (!berth || !berthSettings || berthSettings.length === 0) {
    return true; // Default to active if no settings
  }

  const dayOfWeek = date.getDay();
  const dayOfWeekMap = {
    0: 'SUNDAY',
    1: 'MONDAY',
    2: 'TUESDAY',
    3: 'WEDNESDAY',
    4: 'THURSDAY',
    5: 'FRIDAY',
    6: 'SATURDAY',
  };
  const apiDayOfWeek = dayOfWeekMap[dayOfWeek];

  const matchingSetting = berthSettings.find(
    (setting) =>
      setting?.day_of_week === apiDayOfWeek &&
      setting?.berth === berth?.id
  );

  // Return true only if setting exists and is_active is true
  return matchingSetting ? matchingSetting?.is_active === true : false;
};

/**
 * Sweep-line algorithm to compute berth occupancy over time.
 * Creates timeline segments where occupancy level remains constant.
 */
function computeCumulativeWidths(
  bookings,
  dayStart,
  dayEnd,
  berthLength = 100,
  defaultBufferLength = 0,
  bufferTime = 0,
) {
  // Build event list: +1 for booking start, -1 for booking end (with buffer time added)
  const events = [];

  for (const b of bookings) {
    const s = new Date(b.start_date);
    const e = new Date(new Date(b.end_date).getTime() + bufferTime);

    // Skip bookings that don't overlap with the time window
    if (e <= dayStart || s >= dayEnd) {
      continue;
    }

    events.push({ time: s, type: +1, booking: b });
    events.push({ time: e, type: -1, booking: b });
  }

  // Sort events chronologically. When times are equal, end events (-1) come before start events (+1)
  // to ensure proper handling of bookings that start exactly when another ends
  events.sort((a, b) => {
    const t = a.time.getTime() - b.time.getTime();
    if (t !== 0) return t;
    return a.type - b.type;
  });

  const timelineSegments = [];
  const active = new Set(); // Currently active bookings at the sweep-line position
  let lastTime = dayStart;

  // Calculate total occupied length from all active bookings
  const computeOccupiedLength = (activeSet) => {
    let sum = 0;
    for (const bk of Array.from(activeSet)) {
      // Prefer pre-calculated total_boat_length if available
      if (typeof bk.total_boat_length === 'number') {
        sum += bk.total_boat_length;
        continue;
      }

      // Otherwise calculate: boat physical length + required buffer space
      const boatLen = bk.boat?.length ?? 0;
      const bookingBuffer = bk.boat_buffer_length ?? defaultBufferLength;
      sum += boatLen + bookingBuffer;
    }
    return sum;
  };

  // Sweep through events, creating segments between each event
  for (const ev of events) {
    const currentTime = ev.time;

    const segStart = lastTime < dayStart ? dayStart : lastTime;
    const segEnd = currentTime > dayEnd ? dayEnd : currentTime;

    if (segStart < segEnd) {
      const occupiedLength = computeOccupiedLength(active);
      const availableLength = Math.max(0, berthLength - occupiedLength);

      let widthPercent = berthLength > 0 ? (occupiedLength / berthLength) * 100 : 0;

      if (!isFinite(widthPercent) || isNaN(widthPercent)) widthPercent = 0;
      widthPercent = Math.max(0, Math.min(100, widthPercent));

      timelineSegments.push({
        start: new Date(segStart),
        end: new Date(segEnd),
        overlappingBookings: Array.from(active),
        occupiedLength,
        availableLength,
        widthPercent,
      });
    }

    // Update active bookings set
    if (ev.type === +1) {
      active.add(ev.booking);
    } else {
      // Remove booking from active set by matching ID
      for (const bk of Array.from(active)) {
        if ((bk).id === (ev.booking).id) {
          active.delete(bk);
          break;
        }
      }
    }

    lastTime = currentTime;

    if (lastTime >= dayEnd) break;
  }

  // Handle remaining time segment after all events
  if (lastTime < dayEnd) {
    const segStart = lastTime < dayStart ? dayStart : lastTime;
    const segEnd = dayEnd;

    if (segStart < segEnd) {
      const occupiedLength = computeOccupiedLength(active);
      const availableLength = Math.max(0, berthLength - occupiedLength);

      let widthPercent = berthLength > 0 ? (occupiedLength / berthLength) * 100 : 0;
      if (!isFinite(widthPercent) || isNaN(widthPercent)) widthPercent = 0;
      widthPercent = Math.max(0, Math.min(100, widthPercent));

      timelineSegments.push({
        start: new Date(segStart),
        end: new Date(segEnd),
        overlappingBookings: Array.from(active),
        occupiedLength,
        availableLength,
        widthPercent,
      });
    }
  }

  return timelineSegments;
}
/**
 * Get occupied blocks where a boat cannot be placed.
 * This is the inverse of buildAvailabilityBlocks - it returns segments
 * where the boat cannot be placed due to various constraints.
 *
 * @param timelineSegments  Output from computeCumulativeWidths(...)
 * @param selectedBoat      The boat to check placement for
 * @param berth             The berth (has length, max_allowed, etc.)
 * @returns Array of unavailable blocks with reason why boat cannot be placed
 */
export function getUnavailableBlocks(timelineSegments, selectedBoat, berth) {
	const berthLength = berth.length;
	const requiredLength =
		selectedBoat?.length + selectedBoat?.length * (berth.buffer_length / 100);

	const unavailableBlocks = [];

	if (timelineSegments.length === 0) {
		// If no segments, the entire day is available
		return [];
	}

	timelineSegments.forEach((seg, idx) => {
		const occupiedLength = seg.overlappingBookings.reduce(
			(sum, b) => sum + (b.total_boat_length ?? 0),
			0,
		);

		const availableLength = berthLength - occupiedLength;
		const reasons = [];

		// A) Boat is already booked in this segment
		const selectedBoatAlreadyBooked = seg.overlappingBookings.some(
			(b) => b.boat?.id === selectedBoat?.id,
		);
		if (selectedBoatAlreadyBooked) {
			reasons.push('BOAT_ALREADY_BOOKED');
		}

		// B) Berth fully occupied
		if (availableLength <= 0) {
			reasons.push('BERTH_FULLY_OCCUPIED');
		}

		// C) Boat does not fit (insufficient space)
		if (availableLength < requiredLength) {
			reasons.push('INSUFFICIENT_SPACE');
		}

		// D) Max boats allowed reached
		if (seg.overlappingBookings.length >= berth.max_boat_allowed) {
			reasons.push('MAX_BOATS_REACHED');
		}

		// If any reason exists, this block is unavailable
		if (reasons.length > 0) {
			unavailableBlocks.push({
				id: `unavailable-${idx}-${seg.start.getTime()}`,
				start: seg.start,
				end: seg.end,
				availableLength,
				occupiedLength,
				requiredLength,
				overlappingBookings: seg.overlappingBookings,
				reasons, // Array of reasons why boat cannot be placed
				widthPercent: seg.widthPercent,
				occupiedCount: seg.overlappingBookings.length,
				maxAllowed: berth.max_boat_allowed,
				selectedBoat: selectedBoat,
				selectedBerth: berth,
			});
		}
	});

	return unavailableBlocks;
}

function buildAvailabilityBlocks(timelineSegments, selectedBoat, berth, workingStart, workingEnd) {
  const berthLength = berth.length || 100;
  // Required length includes buffer percentage from berth data
  const bufferPercentage = parseFloat(berth?.buffer_length) || 30;
  const requiredLength = selectedBoat?.length 
    ? selectedBoat.length * (1 + bufferPercentage / 100) 
    : 0;
    
  const availabilityBlocks = [];

  // If no bookings exist, entire day is available
  if (timelineSegments.length === 0) {
    return [
      {
        id: 'avail-full-day',
        start: workingStart,
        end: workingEnd,
        widthPercent: (requiredLength / berthLength) * 100,
        leftPercent: 0,
        isAvailable: true,
        occupiedLength: 0,
        availableLength: berthLength,
        overlappingBookings: [],
      },
    ];
  }

  timelineSegments.forEach((seg, idx) => {
    const occupiedLength = seg.overlappingBookings.reduce(
      (sum, b) => sum + (b.total_boat_length ?? calculateTotalBoatLength(b)),
      0,
    );
    const availableLength = berthLength - occupiedLength;

    // Skip if selected boat is already booked in this time segment
    const selectedBoatAlreadyBooked = seg.overlappingBookings.some(
      (b) => b.boat?.id === selectedBoat?.id,
    );
    if (selectedBoatAlreadyBooked) return;

    // Skip if berth is fully occupied
    if (availableLength <= 0) return;

    // Skip if boat doesn't fit in available space
    if (availableLength < requiredLength) return;

    // Skip if maximum boats limit reached
    if (seg.overlappingBookings.length >= (berth.max_boat_allowed || 2)) return;

    // availabilityBlocks.push({
    //   id: `avail-${idx}-${seg.start.getTime()}`,
    //   start: seg.start,
    //   end: seg.end,
    //   availableLength,
    //   occupiedLength,
    //   overlappingBookings: seg.overlappingBookings,
    //   widthPercent: (requiredLength / berthLength) * 100,
    //   leftPercent: 0, // Availability blocks always start at left edge
    //   isAvailable: true,
    // });
  });

  return availabilityBlocks;
}

/**
 * Merge adjacent availability blocks that are continuous in time
 */
function mergeContinuousAvailability(blocks) {
  if (!blocks.length) return [];

  const result = [];
  let current = { ...blocks[0] };

  for (let i = 1; i < blocks.length; i++) {
    const next = blocks[i];

    // If blocks are continuous (end time equals next start time), merge them
    if (current.end.getTime() === next.start.getTime()) {
      current.end = next.end;
      // Reset leftPercent to 0 for merged availability blocks
      // Occupied blocks will be positioned separately
      current.leftPercent = 0;
    } else {
      result.push(current);
      current = { ...next };
    }
  }

  result.push(current);
  return result;
}

const useBoatOccupancyBlocks = (
  bookingsData,
  selectedBoatId,
  currentDate,
  selectedBerthData,
  berthSettings = [],
  boatsData = [],
) => {
  const occupancyBlocks = useMemo(() => {
    if (!currentDate || !selectedBerthData) {
      return [];
    }

    // If berth is not active on this date, return empty blocks
    if (!isBerthActiveOnDate(currentDate, selectedBerthData, berthSettings)) {
      return [];
    }

    const selectedBoat = selectedBoatId 
      ? boatsData.find(boat => boat.id === selectedBoatId) 
      : null;

    const workingHours = getWorkingHours(currentDate, selectedBerthData, berthSettings);
    const dayStart = workingHours.start;
    const dayEnd = workingHours.end;

    const bufferTime = getBufferTime(currentDate, selectedBerthData, berthSettings);

    // Filter bookings that overlap with the current day's working hours
    const filteredBookings = bookingsData.filter((booking) => {
      if (!booking?.start_date || !booking?.end_date || !booking?.boat) {
        return false;
      }

      const bookingStart = moment(booking.start_date);
      const bookingEnd = moment(booking.end_date);
      const currentDayStart = moment(dayStart);
      const currentDayEnd = moment(dayEnd);

      return bookingStart.isBefore(currentDayEnd) && bookingEnd.isAfter(currentDayStart);
    });

    const berthLength = parseFloat(selectedBerthData?.length) || 100;
    const defaultBufferLength = parseFloat(selectedBerthData?.buffer_length) || 0;

    const occupiedBlocks = computeCumulativeWidths(
      filteredBookings,
      dayStart,
      dayEnd,
      berthLength,
      defaultBufferLength,
      bufferTime,
    );
    const unavailableBlocks = getUnavailableBlocks(
      occupiedBlocks, 
      selectedBoat, 
      selectedBerthData,
    );

    if (selectedBoatId && selectedBoat) {
      const availabilityBlocks = buildAvailabilityBlocks(
        occupiedBlocks,
        selectedBoat,
        selectedBerthData,
        dayStart,
        dayEnd,
      );

      const mergedAvailabilityBlocks = mergeContinuousAvailability(availabilityBlocks);

      // Filter availability blocks by minimum duration requirement
      let filteredMergedAvailabilityBlocks = mergedAvailabilityBlocks;
      if (selectedBerthData.min_duration) {
        const [hh, mm, ss] = selectedBerthData.min_duration.split(':').map(Number);
        const minDuration = (hh * 3600 + mm * 60 + ss) * 1000;
        filteredMergedAvailabilityBlocks = mergedAvailabilityBlocks.filter((block) => {
          return block.end.getTime() - block.start.getTime() >= minDuration;
        });
      }

      // Filter out availability blocks that start before the current date and time
      const now = new Date();
      filteredMergedAvailabilityBlocks = filteredMergedAvailabilityBlocks.filter((block) => {
        return block.start.getTime() >= now.getTime();
      });

      const displayBlocks = [];

      filteredMergedAvailabilityBlocks.forEach((block) => {
        // Subtract buffer time from availability end time since buffer was added to occupied blocks
        displayBlocks.push({
          start: block.start,
          end: new Date(block.end.getTime() - bufferTime),
          isAvailable: true,
          isOccupied: false,
          selectedBoatAlreadyBooked: false,
          widthPercent: block.widthPercent,
          leftPercent: block.leftPercent,
          occupiedLength: block.occupiedLength,
          availableLength: block.availableLength,
          overlappingBookings: block.overlappingBookings,
          berthLength,
        });
      });

      // Add occupied blocks, positioning them to the right of availability blocks if they overlap
      unavailableBlocks
        .filter((b) => b.occupiedLength > 0)
        .forEach((block) => {
          let leftPercent = 0;
          const overlappingAvailabilityBlock = filteredMergedAvailabilityBlocks.find((availBlock) => {
            return (
              block.start.getTime() < availBlock.end.getTime() &&
              block.end.getTime() > availBlock.start.getTime()
            );
          });

          // Position occupied block to the right of availability block if they overlap
          if (overlappingAvailabilityBlock) {
            leftPercent = overlappingAvailabilityBlock.widthPercent;
          }
          
          // Check if selected boat is already booked in this slot
          const selectedBoatAlreadyBooked = block.overlappingBookings.some(
            (b) => b.boat?.id === selectedBoatId,
          );
          
          // If selected boat is already booked, prioritize showing it as blue (selected boat booking)
          // instead of red (occupied). Set isOccupied to false so it doesn't show red or diagonal stripes.
          displayBlocks.push({
            start: block.start,
            end: block.end,
            isAvailable: false,
            isOccupied: !selectedBoatAlreadyBooked, // Set to false if selected boat is booked (priority: blue over red)
            selectedBoatAlreadyBooked: selectedBoatAlreadyBooked,
            // widthPercent: block.widthPercent,
            widthPercent: 100,
            leftPercent: leftPercent,
            occupiedLength: block.occupiedLength,
            availableLength: block.availableLength,
            overlappingBookings: block.overlappingBookings,
            berthLength,
          });
        });

    // Add non-working hour blocks (before workingStart and after workingEnd)
    // Get the full day boundaries (midnight to midnight)
    const fullDayStart = new Date(currentDate);
    fullDayStart.setHours(0, 0, 0, 0);
    const fullDayEnd = new Date(currentDate);
    fullDayEnd.setHours(23, 59, 59, 999);

    // Add block before working hours (if workingStart is after midnight)
    if (dayStart.getTime() > fullDayStart.getTime()) {
      displayBlocks.push({
        start: fullDayStart,
        end: dayStart,
        isAvailable: false,
        isOccupied: false,
        isNonWorkingHours: true,
        selectedBoatAlreadyBooked: false,
        widthPercent: 100,
        leftPercent: 0,
        occupiedLength: 0,
        availableLength: 0,
        overlappingBookings: [],
        berthLength,
      });
    }

    // Add block after working hours (if workingEnd is before midnight)
    if (dayEnd.getTime() < fullDayEnd.getTime()) {
      displayBlocks.push({
        start: dayEnd,
        end: fullDayEnd,
        isAvailable: false,
        isOccupied: false,
        isNonWorkingHours: true,
        selectedBoatAlreadyBooked: false,
        widthPercent: 100,
        leftPercent: 0,
        occupiedLength: 0,
        availableLength: 0,
        overlappingBookings: [],
        berthLength,
      });
    }

    // Sort blocks by start time, then by left position for proper rendering order
    displayBlocks.sort((a, b) => {
      const timeDiff = a.start.getTime() - b.start.getTime();
        if (timeDiff !== 0) return timeDiff;
      return (a.leftPercent || 0) - (b.leftPercent || 0);
    });

    // Calculate position percentages for timeline rendering
    // Calendar displays full day (0:00 to 23:59), so all blocks must be positioned relative to full day
    const fullDayDuration = fullDayEnd.getTime() - fullDayStart.getTime();
    if (fullDayDuration <= 0) {
      return [];
    }

      return displayBlocks.map((block) => {
      const blockStart = block.start.getTime();
      const blockEnd = block.end.getTime();
      const blockDuration = blockEnd - blockStart;

      // All blocks positioned relative to full day (0:00 to 23:59)
      const startPercent = fullDayDuration > 0
        ? ((blockStart - fullDayStart.getTime()) / fullDayDuration) * 100
        : 0;
      
      const widthPercent = block.widthPercent !== undefined 
        ? block.widthPercent 
        : (fullDayDuration > 0 ? (blockDuration / fullDayDuration) * 100 : 0);
      
        const leftPercent = block.leftPercent !== undefined ? block.leftPercent : 0;

      return {
        ...block,
        startPercent: Math.max(0, Math.min(100, startPercent)),
        widthPercent: Math.max(0, Math.min(100, widthPercent)),
        leftPercent: Math.max(0, Math.min(100, leftPercent)),
        berthLength,
      };
    });
    }

    // If no boat selected, return only occupied blocks
    const displayBlocks = occupiedBlocks
      .filter((b) => b.occupiedLength > 0)
      .map((block) => {
        const blockStart = block.start.getTime();
        const blockEnd = block.end.getTime();
        const blockDuration = blockEnd - blockStart;
        const totalDuration = dayEnd.getTime() - dayStart.getTime();

        const startPercent = totalDuration > 0 
          ? ((blockStart - dayStart.getTime()) / totalDuration) * 100 
          : 0;

        return {
          start: block.start,
          end: block.end,
          isAvailable: false,
          isOccupied: true,
          selectedBoatAlreadyBooked: false,
          widthPercent: block.widthPercent,
          leftPercent: 0,
          occupiedLength: block.occupiedLength,
          availableLength: block.availableLength,
          overlappingBookings: block.overlappingBookings,
          berthLength,
          startPercent: Math.max(0, Math.min(100, startPercent)),
        };
      });

    return displayBlocks;
  }, [bookingsData, selectedBoatId, currentDate, selectedBerthData, berthSettings, boatsData]);

  return occupancyBlocks;
};

export const convertOccupancyBlocksToEvents = (occupancyBlocks, selectedBoat, selectedBerthData) => {
  return occupancyBlocks.map((block, index) => ({
    id: `occupancy-block-${index}-${block.start.getTime()}`,
    title: block.isNonWorkingHours
      ? 'Non-Working Hours'
      : (block.isAvailable 
        ? 'Available' 
        : (block.selectedBoatAlreadyBooked ? 'Your Booking' : 'Occupied')),
    start: block.start,
    end: block.end,
    isOccupancyBlock: true,
    isAvailable: block.isAvailable || false,
    isOccupied: block.isOccupied || false,
    isNonWorkingHours: block.isNonWorkingHours || false,
    selectedBoatAlreadyBooked: block.selectedBoatAlreadyBooked || false,
    booking: block.overlappingBookings?.[0] || null,
    berthLength: block.berthLength,
    widthPercent: block.widthPercent || 100,
    leftPercent: block.leftPercent || 0,
    occupiedLength: block.occupiedLength,
    availableLength: block.availableLength,
    overlappingBookings: block.overlappingBookings || [],
    selectedBoatId: selectedBoat?.id || null,
    selectedBoat: selectedBoat || null,
    berthData: selectedBerthData || null,
  }));
};

export default useBoatOccupancyBlocks;
