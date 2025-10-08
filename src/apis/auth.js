import { authAxios, publicAxios } from "../context/AxiosContext";

export const userLogin = async (email, otp) => {
    const payload = {
        email : email,
        otp: otp
    }
    try {
        const response = await publicAxios.post('users/login/', payload);
        return response;
    } catch (error) {
        throw error;
    }
};

export const verifyOTP = async (email, otp) => {
    const payload = {
        email : email,
        otp : otp
    }
    try {
        const response = await publicAxios.post('users/verify-otp/', payload);
        return response;
    } catch (error) {
        throw error;
    }
};

export const register = async (firstName, lastName, email, phone) => {
    const payload = {
        first_name : firstName,
        last_name : lastName,
        email : email,
        phone : phone
    }
    try {
        const response = await publicAxios.post('users/register/', payload);
        return response;
    } catch (error) {
        throw error;
    }
};

export const logout = async () => {
    try {
        const response = await authAxios.post('users/logout/');
        return response.data;
    } catch (error) {
        throw error;
    }
};