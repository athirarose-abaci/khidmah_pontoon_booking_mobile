import { authAxios, publicAxios } from "../context/AxiosContext";

export const fetchSystemStatus = async () => {
    try {
        const response = await publicAxios.get('systems/status/');
        return response?.data;
    } catch (error) {
        throw error;
    }
};

export const fetchOrganizationSettings = async () => {
    try {
        const response = await authAxios.get('systems/organization-settings/');
        return response?.data;
    } catch (error) {
        throw error;
    }
};

export const fetchNotifications = async (page = 1, limit = 10) => {
    try {
        const offset = limit * (page - 1);
        const response = await authAxios.get(`systems/notifications/?limit=${limit}&offset=${offset}&page=${page}&ordering=-created_at`);
        return response?.data;
    } catch (error) {
        throw error;
    }
};

export const deleteNotification = async (notificationId) => {
    try {
        const response = await authAxios.delete(`systems/notifications/${notificationId}/`);
        return response?.data;
    } catch (error) {
        throw error;
    }
};