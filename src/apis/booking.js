import { authAxios} from "../context/AxiosContext";

export const fetchBookings = async () => {
    try {
        const response = await authAxios.get('bookings/');
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

