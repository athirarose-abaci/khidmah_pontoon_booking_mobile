import { useMemo } from 'react';
import moment from 'moment';
import { isBerthActiveOnDate } from './useBoatOccupancyBlocks';

const useBookingEventCalculations = (bookingsData, selectedBerthData, calendarViewMode, berthSettings, selectedBoat, currentDate) => {
  // Calculate horizontal positioning for day view based on boat length
  const calculateEventTracksAndPositions = useMemo(() => {
    // For day view, check if berth is active on the current date
    if (calendarViewMode === 'day' && currentDate && selectedBerthData) {
      if (!isBerthActiveOnDate(currentDate, selectedBerthData, berthSettings)) {
        return []; // Return empty array if berth is not active
      }
    }

    // Filter bookings by selected boat if boat is selected
    let filteredBookings = bookingsData;
    if (selectedBoat && calendarViewMode === 'day') {
      filteredBookings = bookingsData.filter(booking => {
        if (!booking?.boat) return false;
        const bookingBoatId = typeof booking.boat === 'object' 
          ? booking.boat.id 
          : booking.boat;
        return bookingBoatId === selectedBoat;
      });
    }

    if (!selectedBerthData || !filteredBookings.length || calendarViewMode !== 'day') {
      // For non-day views, return events without position data
      return filteredBookings
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
        .filter(event => event !== null); // Remove null entries
    }

    const berthLength = parseFloat(selectedBerthData?.length) || 100;
    // const bufferLength = parseFloat(bookingsData?.boat_buffer_length) || 0;
    const maxAllowed = parseFloat(selectedBerthData?.max_boat_allowed) || 2;
    const assigned = [];
    
    // Filter out bookings with invalid dates
    const validBookings = filteredBookings.filter(booking => {
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
      
      const bufferLength = parseFloat(booking?.boat_buffer_length) || 0;
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
  }, [bookingsData, selectedBerthData, calendarViewMode, selectedBoat, berthSettings, currentDate]);

  // Transform bookings to calendar events format for react-native-big-calendar
  const calendarEvents = useMemo(() => {
    // For day view, check if berth is active on the current date
    if (calendarViewMode === 'day' && currentDate && selectedBerthData) {
      if (!isBerthActiveOnDate(currentDate, selectedBerthData, berthSettings)) {
        return []; // Return empty array if berth is not active
      }
    }

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
  }, [calculateEventTracksAndPositions, calendarViewMode, currentDate, selectedBerthData, berthSettings]);

  return {
    calculateEventTracksAndPositions,
    calendarEvents,
  };
};

export default useBookingEventCalculations;

