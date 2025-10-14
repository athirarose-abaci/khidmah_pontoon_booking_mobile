import { authAxios } from "../context/AxiosContext";

export const fetchBerths = async (pontoonId) => {
    try {
        let url = 'locations/berth/';
        if(pontoonId) {
            url = `locations/berth/?pontoon=${pontoonId}&is_pagination=false`;
        }
        const response = await authAxios.get(url);
        return response.data;

    } catch (error) {
        throw error;
    }
}