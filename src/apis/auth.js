import { authAxios, publicAxios } from "../context/AxiosContext";
import Error from "../helpers/Error";


export const userLogin = async (email) => {
    const payload = {
        email : email,
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
        // console.log('response in verifyOTP: ', response);
        return response;
    } catch (error) {
        // console.log('error in verifyOTP: ', error);
        // let err_msg = Error(error);
        // console.log('err_msg in verifyOTP: ', err_msg);
        throw err_msg;
    }
};

export const register = async (firstName, lastName, email, phone) => {
    const payload = {
        first_name : firstName,
        last_name : lastName,
        email : email,
        mobile_number : phone
    }
    try {
        const response = await publicAxios.post('users/register/', payload);
        return response;
    } catch (error) {
        throw error;
    }
};

export const fetchProfile = async () => {
    try {
        const response = await authAxios.get('users/profile/');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateProfile = async ( payload ) => {
    try {
        const response = await authAxios.patch('users/profile/', payload);
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