import { authAxios } from "../context/AxiosContext";

export const fetchTickets = async (pageNumber, limit, searchQuery = null, status = null) => {
    try {
        const offset = limit * (pageNumber - 1);
        let url = `users/ticket/?limit=${limit}&offset=${offset}&page=${pageNumber}`;

        if (searchQuery && searchQuery !== 'null') {
            url += `&search=${encodeURIComponent(searchQuery)}`;
        }

        if (status && status !== 'All') {
            url += `&status=${encodeURIComponent((status))}`;
        }

        const response = await authAxios.get(url);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const createTicket = async (ticketData, files, userId) => {
    try {
        const formData = new FormData();
        
        formData.append('category', ticketData?.issue_category);
        formData.append('subject', ticketData?.subject);
        formData.append('description', ticketData?.description);
        formData.append('user', userId);
        
        if (files && files.length > 0) {
            files.forEach((file, index) => {
                if (file.uri) {
                    formData.append('files', {
                        uri: file.uri,
                        type: file.type || 'application/octet-stream',
                        name: file.name || `file_${index}`,
                    });
                }
            });
        }

        const response = await authAxios.post('users/ticket/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const ticketCategories = async () => {
    try {
        const response = await authAxios.get('users/ticket-category/?is_pagination=false');
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

export const fetchTicketConversations = async (ticketId) => {
    try {
        const response = await authAxios.get(`users/ticket/${ticketId}/conversations/`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const replyToTicket = async (ticketId, payload, files = []) => {
    try {
        if (files && files.length > 0) {
            const responses = [];
            
            if (payload.message?.trim()) {
                const messageResponse = await authAxios.post(`users/ticket/${ticketId}/conversations/`, payload);
                responses.push(messageResponse.data);
            }

            const formData = new FormData();
            
            formData.append('ticket', payload.ticket);
            formData.append('message', ''); 
            formData.append('is_user', payload.is_user);
            
            for (const file of files) {
                if (file.uri) {
                    formData.append('file', {
                        uri: file.uri,
                        type: file.type || 'application/octet-stream',
                        name: file.name || `file_${index}`,
                    });
                }
            
                const fileResponse = await authAxios.post(`users/ticket/${ticketId}/conversations/`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                responses.push(fileResponse.data);
            }
            console.log('formData from the replyToTicket', formData);
            console.log('responses from the replyToTicket', responses);
            return responses[responses.length - 1]; 
        } else {
            console.log('payload from the replyToTicket', payload);
            const response = await authAxios.post(`users/ticket/${ticketId}/conversations/`, payload);
            console.log('response from the replyToTicket', response);
            return response.data;
        }
    } catch (error) {
        console.log('error from the replyToTicket', error);
        throw error;
    }
}