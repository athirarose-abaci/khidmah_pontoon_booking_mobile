import { authAxios } from "../context/AxiosContext";

export const fetchTickets = async () => {
    try {
        const response = await authAxios.get('users/ticket/');
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const createTicket = async (payload) => {
    try {
        const response = await authAxios.post('users/ticket/', payload);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const updateTicket = async (ticketId, payload) => {  
    try {
        const response = await authAxios.patch(`users/ticket/${ticketId}/`, payload);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const deleteTicket = async (ticketId) => {
    try {
        const response = await authAxios.delete(`users/ticket/${ticketId}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const fetchTicketById = async (ticketId) => {
    try {
        const response = await authAxios.get(`users/ticket/${ticketId}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
}