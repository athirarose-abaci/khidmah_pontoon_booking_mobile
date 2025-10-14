import { authAxios } from "../context/AxiosContext";

export const fetchPontoons = async () => {
    try {
        const response = await authAxios.get('locations/pontoon/?is_pagination=false');
        return response.data;
    } catch (error) {
        throw error;
    }
}