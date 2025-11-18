import { useMemo } from 'react';
import moment from 'moment';
import { createAvailabilityBlocks, getWorkingHours, parseMinDuration } from '../helpers/availabilityHelper';

const useBookingEventCalculations = (bookingsData, selectedBerthData, calendarViewMode, selectedBoat, currentDate, useAvailabilityMode = false, berthAvailabilityData = []) => {
  // Calculate horizontal positioning for day view based on boat length
  const calculateEventTracksAndPositions = useMemo(() => {
    // If using availability mode, skip the old calculation
    if (useAvailabilityMode) {
      return [];
    }

    if (!selectedBerthData || !bookingsData.length || calendarViewMode !== 'day') {
      // For non-day views, return events without position data
      return bookingsData
        .filter(booking => booking?.start_date && booking?.end_date)
        .map(booking => {
          const startMoment = moment(booking?.start_date);
          const endMoment = moment(booking?.end_date);
          // Validate dates using moment
          if (!startMoment.isValid() || !endMoment.isValid()) {
            return null;
          }
          // Convert to Date objects for calendar compatibility
          const startDate = startMoment.toDate();
          const endDate = endMoment.toDate();
          return {
            booking,
            startDate,
            endDate,
            widthPercent: 100,
            leftPercent: 0,
            bufferPercent: 0,
            boatLength: parseFloat(booking?.boat?.length || 0),
          };
        })
        .filter(event => event !== null); 
    }

    const berthLength = parseFloat(selectedBerthData?.length) || 100;
    // const bufferLength = parseFloat(bookingsData?.boat_buffer_length) || 0;
    const maxAllowed = parseFloat(selectedBerthData?.max_boat_allowed) || 2;
    const assigned = [];
    
    // Filter out bookings with invalid dates
    const validBookings = bookingsData.filter(booking => {
      if (!booking?.start_date || !booking?.end_date) return false;
      const startMoment = moment(booking.start_date);
      const endMoment = moment(booking.end_date);
      return startMoment.isValid() && endMoment.isValid();
    });
    
    // Sort bookings by start time using moment
    const sortedBookings = [...validBookings].sort((a, b) => {
      const aStart = moment(a.start_date);
      const bStart = moment(b.start_date);
      if (!aStart.isValid() || !bStart.isValid()) return 0;
      return aStart.valueOf() - bStart.valueOf();
    });

    // Process each booking using gap-finding algorithm
    sortedBookings.forEach(booking => {
      // Validate dates before creating moment objects
      if (!booking?.start_date || !booking?.end_date) {
        return; // Skip invalid bookings
      }
      
      const startMoment = moment(booking.start_date);
      const endMoment = moment(booking.end_date);
      
      // Validate that dates are valid using moment
      if (!startMoment.isValid() || !endMoment.isValid()) {
        return; // Skip invalid dates
      }
      
      // Convert to Date objects for calendar compatibility
      const startDate = startMoment.toDate();
      const endDate = endMoment.toDate();
      
      const bufferLength = parseFloat(booking?.boat_buffer_length || 0);
      const boatLength = parseFloat(booking?.boat?.length) || 0;
      const widthPercent = (boatLength / berthLength) * 100;
      const bufferPercent = (bufferLength / berthLength) * 100;
      const currentTotalWidth = widthPercent + bufferPercent;

      // Find existing overlapping bookings for the same berth using moment
      const overlapping = assigned.filter(event => {
        const eventStartMoment = moment(event.startDate);
        const eventEndMoment = moment(event.endDate);
        const currentStartMoment = startMoment;
        const currentEndMoment = endMoment;
        
        // Check if dates are valid
        if (!eventStartMoment.isValid() || !eventEndMoment.isValid() || 
            !currentStartMoment.isValid() || !currentEndMoment.isValid()) {
          return false;
        }
        
        // Check for overlap: currentStart < eventEnd && currentEnd > eventStart
        return currentStartMoment.isBefore(eventEndMoment) && currentEndMoment.isAfter(eventStartMoment);
      });

      let leftPercent = 0;

      // Place current event at the first available gap among overlapping segments
      if (overlapping.length > 0) {
        // Build occupied segments from already assigned overlapping events
        const occupiedSegments = overlapping
          .map(event => ({
            start: event.leftPercent || 0,
            end: (event.leftPercent || 0) + (event.widthPercent || 0) + (event.bufferPercent || 0),
          }))
          .sort((a, b) => a.start - b.start);

        let candidate = 0;
        for (const seg of occupiedSegments) {
          if (candidate + currentTotalWidth <= seg.start) {
            break; // fits before this segment
          }
          candidate = Math.max(candidate, seg.end); // move past this segment
        }
        leftPercent = candidate;
      }

      // Check if overflow (more than allowed boats)
      const overflow = overlapping.length >= maxAllowed;

      assigned.push({
        booking,
        startDate,
        endDate,
        boatLength,
        widthPercent: Math.min(widthPercent, 100), // Cap at 100%
        leftPercent: Math.min(leftPercent, 100 - currentTotalWidth), // Ensure it fits
        bufferPercent,
        isOverflow: overflow,
      });
    });

    return assigned;
  }, [bookingsData, selectedBerthData, calendarViewMode, useAvailabilityMode]);

  // NEW CODE - Availability blocks calculation for CUSTOMER role in DAY view
  const availabilityEvents = useMemo(() => {
    if (!useAvailabilityMode || calendarViewMode !== 'day' || !selectedBerthData) {
      return [];
    }

    // Filter bookings to the current date range
    const filteredBookings = bookingsData.filter((booking) => {
      if (!booking?.start_date || !booking?.end_date) return false;
      const bookingStartDate = new Date(booking?.start_date);
      const bookingEndDate = new Date(booking?.end_date);
      const currentDateObj = currentDate ? new Date(currentDate) : new Date();
      const dayStart = new Date(currentDateObj);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDateObj);
      dayEnd.setHours(23, 59, 59, 999);
      // Check if booking overlaps with the date range
      return bookingStartDate < dayEnd && bookingEndDate > dayStart;
    });

    // Get working hours for the current date being viewed from berthAvailabilityData
    const workingHours = getWorkingHours(
      currentDate ? new Date(currentDate) : new Date(),
      berthAvailabilityData,
    );
    
    // If no working hours data is available (data missing), return empty array
    if (!workingHours || !workingHours.start || !workingHours.end) {
      return [];
    }
    
    const dayStartTime = workingHours.start;
    const dayEndTime = workingHours.end;
    const isDayAvailable = workingHours.isAvailable !== false; // Default to true if not specified

    // If day is not available (is_active = false), create a "Not Available" block
    if (!isDayAvailable && selectedBerthData) {
      const berthLength = selectedBerthData.length ?? 100;
      const maxAllowed = selectedBerthData.max_boat_allowed ?? 2;

      const notAvailableBlock = {
        id: `not-available-${selectedBerthData.id}-${dayStartTime.getTime()}-${dayEndTime.getTime()}`,
        start: dayStartTime,
        end: dayEndTime,
        title: 'Not Available',
        berthId: selectedBerthData.id,
        berthName: selectedBerthData.name,
        occupiedCount: 0,
        maxAllowed,
        isAvailable: false,
        isFullyOccupied: true,
        isNotAvailable: true,
        overlappingBookings: [],
        berthLength,
        occupiedLength: berthLength,
        availableLength: 0,
        bufferLength: 0,
        widthPercent: 100,
      };

      // Convert to calendar event format
      return [{
        id: notAvailableBlock.id,
        title: notAvailableBlock.title,
        start: notAvailableBlock.start,
        end: notAvailableBlock.end,
        berthId: notAvailableBlock.berthId,
        berthName: notAvailableBlock.berthName,
        isNotAvailable: true,
        isAvailable: false,
        isFullyOccupied: true,
        widthPercent: 100,
      }];
    }

    // Create availability blocks for CUSTOMER in DAY view (only if day is available)
    const availabilityBlocks = createAvailabilityBlocks(
      filteredBookings,
      selectedBoat,
      dayStartTime,
      dayEndTime,
      selectedBerthData,
    );

    // If no bookings exist, create a single unoccupied block for the working hours
    // Note: The helper should handle this, but we add it here as a fallback for the selected berth
    if (filteredBookings.length === 0 && selectedBerthData && availabilityBlocks.length === 0) {
      const berthLength = selectedBerthData.length ?? 100;
      const maxAllowed = selectedBerthData.max_boat_allowed ?? 2;
      
      // Calculate block duration and check min_duration using the shared helper function
      const blockDurationMs = dayEndTime.getTime() - dayStartTime.getTime();
      const minDurationMs = parseMinDuration(selectedBerthData);
      const isDurationTooShort = minDurationMs > 0 && blockDurationMs < minDurationMs;

      availabilityBlocks.push({
        id: `availability-${selectedBerthData.id}-${dayStartTime.getTime()}-${dayEndTime.getTime()}`,
        start: dayStartTime,
        end: dayEndTime,
        title: `Available (${berthLength.toFixed(1)}ft free)`,
        berthId: selectedBerthData.id,
        berthName: selectedBerthData.name,
        occupiedCount: 0,
        maxAllowed,
        isAvailable: !isDurationTooShort,
        isFullyOccupied: isDurationTooShort,
        overlappingBookings: [],
        berthLength,
        occupiedLength: 0,
        availableLength: berthLength,
        bufferLength: 0, 
        widthPercent: isDurationTooShort ? 100 : 0,
      });
    }

    // Convert availability blocks to calendar events format
    const calendarEvents = [];

    // Process all availability blocks (both occupied and unoccupied)
    availabilityBlocks.forEach((block) => {
      // Check if the selected boat is already booked during this time block
      // Use allOverlappingBookings (all bookings) instead of overlappingBookings (filtered for display)
      const allOverlappingBookings = block.allOverlappingBookings || block.overlappingBookings || [];
      const isSelectedBoatAlreadyBooked = selectedBoat?.id 
        ? allOverlappingBookings.some((booking) => booking?.boat?.id === selectedBoat.id)
        : false;

      // Add occupied blocks (single color for all occupied)
      // Only show occupied blocks if there's actually something occupied
      if (block.occupiedLength > 0) {
        // If the selected boat is already booked, mark as fully occupied (100% width, unavailable)
        const shouldShowAsFullyOccupied = isSelectedBoatAlreadyBooked || block.isFullyOccupied;
        // If fully occupied (max allowed reached) or selected boat is already booked, use 100% width
        // Otherwise use the calculated width based on occupied length
        const displayWidthPercent = shouldShowAsFullyOccupied ? 100 : block.widthPercent;
        
        const stripedBlockData = {
          id: block.id,
          start: block.start,
          end: block.end,
          title: '', // Empty title for visual bar only
          status: 'OCCUPIED', // Single status for all occupied blocks
          berthId: block.berthId,
          berthName: block.berthName,
          occupiedCount: block.occupiedCount,
          maxAllowed: block.maxAllowed,
          isAvailable: isSelectedBoatAlreadyBooked ? false : block.isAvailable,
          isFullyOccupied: shouldShowAsFullyOccupied,
          availabilityBlock: block,
          widthPercent: displayWidthPercent,
          // Length information
          occupiedLength: block.occupiedLength,
          availableLength: block.availableLength,
          berthLength: block.berthLength,
          isSelectedBoatAlreadyBooked,
        };

        console.log('🔴 STRIPED BLOCK (Unavailable/Occupied):', {
          timeRange: `${new Date(block.start).toLocaleTimeString()} - ${new Date(block.end).toLocaleTimeString()}`,
          berthName: block.berthName,
          occupiedLength: `${block.occupiedLength.toFixed(1)}ft`,
          availableLength: `${block.availableLength.toFixed(1)}ft`,
          berthLength: `${block.berthLength.toFixed(1)}ft`,
          widthPercent: `${displayWidthPercent.toFixed(1)}%`,
          isFullyOccupied: shouldShowAsFullyOccupied,
          isAvailable: stripedBlockData.isAvailable,
          occupiedCount: block.occupiedCount,
          maxAllowed: block.maxAllowed,
          isSelectedBoatAlreadyBooked,
        });
        
        calendarEvents.push(stripedBlockData);
      }

      // If boat is selected, check if it can fit and create a dotted block
      // This works for both occupied blocks (on the right side) and unoccupied blocks (full width)
      // Skip if the selected boat is already booked (it should show as unavailable/striped)
      if (selectedBoat?.id && selectedBoat.length && !block.isFullyOccupied && !isSelectedBoatAlreadyBooked) {

        const selectedBoatLength = parseFloat(selectedBoat.length) || 0;
        // Use boat's buffer_length (boats have buffer_length, berths don't)
        // Check if boat has buffer_length property (could be boat_buffer_length or buffer_length)
        const boatBufferLength = parseFloat(selectedBoat.buffer_length || selectedBoat.boat_buffer_length || 0);
        const requiredSpace = selectedBoatLength + boatBufferLength;
        
        // Check if boat can actually fit in the available space
        const boatFits = block.availableLength >= requiredSpace;

        if (boatFits) {
          // Calculate position and width based on boat's actual dimensions
          const boatWidthPercent = (selectedBoatLength / block.berthLength) * 100;
          const boatBufferPercent = (boatBufferLength / block.berthLength) * 100;
          const totalBoatWidthPercent = boatWidthPercent + boatBufferPercent;
          
          // For unoccupied blocks (occupiedLength === 0), start at 0
          // For occupied blocks, start after occupied space
          const boatLeftPercent = block.occupiedLength > 0 ? block.widthPercent : 0;
          
          // Verify the boat doesn't exceed the berth width
          if (boatLeftPercent + totalBoatWidthPercent <= 100) {
            // Create dotted block for selected boat showing where it would fit
            const primaryColorBlockData = {
              id: `selected-boat-${block.id}-${selectedBoat.id}`,
              start: block.start,
              end: block.end,
              title: '', // Empty title
              status: 'SELECTED_BOAT', // Special status for selected boat
              berthId: block.berthId,
              availabilityBlock: block,
              widthPercent: totalBoatWidthPercent,
              leftPercent: boatLeftPercent,
              isSelectedBoat: true,
              // Length information
              selectedBoatLength,
              boatBufferLength,
              requiredSpace,
              boatWidthPercent,
              boatBufferPercent,
              totalBoatWidthPercent,
              boatLeftPercent,
              blockAvailableLength: block.availableLength,
              blockBerthLength: block.berthLength,
              blockOccupiedLength: block.occupiedLength,
            };

            console.log('🟢 PRIMARY COLOR BLOCK (Available/Selected Boat):', {
              timeRange: `${new Date(block.start).toLocaleTimeString()} - ${new Date(block.end).toLocaleTimeString()}`,
              boatName: selectedBoat.name || selectedBoat.id,
              boatLength: `${selectedBoatLength.toFixed(1)}ft`,
              boatBufferLength: `${boatBufferLength.toFixed(1)}ft`,
              requiredSpace: `${requiredSpace.toFixed(1)}ft`,
              availableLength: `${block.availableLength.toFixed(1)}ft`,
              berthLength: `${block.berthLength.toFixed(1)}ft`,
              occupiedLength: `${block.occupiedLength.toFixed(1)}ft`,
              widthPercent: `${totalBoatWidthPercent.toFixed(1)}%`,
              leftPercent: `${boatLeftPercent.toFixed(1)}%`,
              boatWidthPercent: `${boatWidthPercent.toFixed(1)}%`,
              boatBufferPercent: `${boatBufferPercent.toFixed(1)}%`,
              boatFits: boatFits,
            });

            calendarEvents.push(primaryColorBlockData);
          }
        }
      }
    });

    return calendarEvents;
  }, [bookingsData, selectedBerthData, calendarViewMode, selectedBoat, currentDate, useAvailabilityMode]);

  // Transform bookings to calendar events format for react-native-big-calendar
  const calendarEvents = useMemo(() => {
    // If using availability mode, return availability events
    if (useAvailabilityMode && calendarViewMode === 'day') {
      return availabilityEvents;
    }
    
    // Otherwise, use legacy booking event model
    return calculateEventTracksAndPositions
      .filter(eventData => {
        // Ensure we have valid dates using moment
        const { startDate, endDate } = eventData;
        if (!startDate || !endDate) return false;
        const startMoment = moment(startDate);
        const endMoment = moment(endDate);
        return startMoment.isValid() && endMoment.isValid();
      })
      .map(eventData => {
        const { booking, startDate, endDate, widthPercent, leftPercent, boatLength, bufferPercent, isOverflow } = eventData;
        
        // Check if this is the current customer's booking
        const isCurrentCustomer = booking?.customer !== undefined && booking?.customer !== null;
        return {
          id: booking.id,
          title: isCurrentCustomer 
            ? `${booking?.boat?.name || 'Boat'}`
            : 'Booked', 
          start: startDate,
          end: endDate,
          booking: booking,
          isCurrentCustomer: isCurrentCustomer,
          // Add positioning data for horizontal stacking based on boat length
          widthPercent: widthPercent || 100,
          leftPercent: leftPercent || 0,
          boatLength: boatLength || 0,
          bufferPercent: bufferPercent || 0,
          isOverflow: isOverflow || false,
        };
      });
  }, [calculateEventTracksAndPositions, availabilityEvents, useAvailabilityMode, calendarViewMode]);

  return {
    calculateEventTracksAndPositions,
    calendarEvents,
    availabilityEvents,
  };
};

export default useBookingEventCalculations;

