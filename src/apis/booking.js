import { authAxios} from "../context/AxiosContext";
import Error from "../helpers/Error";

export const fetchBookings = async (page = 1, limit = 10, search = null, status = null, dateRange) => {
    try {
        const offset = limit * (page - 1);
        let url = `bookings/?limit=${limit}&offset=${offset}&page=${page}`;
        
        if (search && search !== 'null') {
            url += `&search=${encodeURIComponent(search)}`;
        }
        
        if (status && status !== 'All') {
            url += `&status=${encodeURIComponent(status)}`;
        }

        if(dateRange){
            const endDate = new Date(dateRange.endDate);
            endDate.setDate(endDate.getDate() + 1);
            const nextDay = endDate.toISOString().split('T')[0];   
            url = url + `&start_date=${dateRange.startDate} 00:00&end_date=${nextDay} 00:00`
        }
        const response = await authAxios.get(url);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const fetchBookingsForCalendar = async (dateRange, berthId) => {
    try {
        let url = `bookings/calendar/`;
        if(dateRange){
            const endDate = new Date(dateRange.endDate);
            endDate.setDate(endDate.getDate() + 1);
            const nextDay = endDate.toISOString().split('T')[0];   
            url = url + `?start_date=${dateRange.startDate}&end_date=${nextDay}`
        }
        if(berthId){
            url = url + `&berth=${berthId}`;
        }
        const response = await authAxios.get(url);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const createBooking = async (payload) => {
    try {
        const response = await authAxios.post('bookings/create/', payload);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const updateBooking = async (bookingId, payload) => {
    try {
        const response = await authAxios.patch(`bookings/${bookingId}/`, payload);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const bookingDetails = async (bookingId) => {
    try {
        const response = await authAxios.get(`bookings/${bookingId}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const checkInBooking = async (bookingId) => {
    try {
        const response = await authAxios.patch(`bookings/check-in/${bookingId}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const checkOutBooking = async (bookingId) => {
    try {
        const response = await authAxios.patch(`bookings/check-out/${bookingId}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const extendBooking = async (bookingId, hours, minutes) => {
    try {
        const extension_duration = `${hours}:${minutes}`;
        const response = await authAxios.post(`bookings/extend/${bookingId}/`, { extension_duration });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const deleteBooking = async (bookingId) => {
    try {
        const response = await authAxios.delete(`bookings/${bookingId}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

