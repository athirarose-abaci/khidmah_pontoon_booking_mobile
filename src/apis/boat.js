import { authAxios} from "../context/AxiosContext";

export const fetchBoats = async (pageNumer, limit, searchQuery = '') => {
    try {
        const offset = limit * (pageNumer - 1);
        let url = `users/boat/?limit=${limit}&offset=${offset}&page=${pageNumer}&search=${searchQuery!=='null' ? searchQuery : ''}`;
        console.log(url, "url from fetchBoats");
        const response = await authAxios.get(url);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const fetchBoatById = async (boatId) => {
    try {
        const response = await authAxios.get(`users/boat/${boatId}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const createBoat = async (boatData, images = []) => { 
    try {
        const formData = new FormData();
        
        formData.append('name', boatData.name);
        formData.append('registration_number', boatData.registration_number);
        formData.append('length', boatData.length);
        formData.append('width', boatData.width);
        formData.append('description', boatData.description);
        
        images.forEach((image, index) => {
            if (image && image.url) {
                formData.append('images', {
                    uri: image.url,
                    type: 'image/jpeg',
                    name: image.name || `boat_image_${index}.jpg`,
                });
            }
        });
        
        const response = await authAxios.post('users/boat/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

