import { authAxios} from "../context/AxiosContext";

export const fetchBookings = async (page = 1, limit = 10, search = null, status = null) => {
    try {
        const offset = limit * (page - 1);
        let url = `bookings/?limit=${limit}&offset=${offset}&page=${page}`;
        
        if (search && search !== 'null') {
            url += `&search=${encodeURIComponent(search)}`;
        }
        
        if (status && status !== 'All') {
            url += `&status=${encodeURIComponent(status)}`;
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
    const extension_duration = `${hours}:${minutes}`;
    try {
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

