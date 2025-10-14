import { authAxios} from "../context/AxiosContext";

export const fetchBoats = async (pageNumer, limit, searchQuery = '') => {
    try {
        const offset = limit * (pageNumer - 1);
        let url = `users/boat/?limit=${limit}&offset=${offset}&page=${pageNumer}`;

        if (searchQuery && searchQuery !== 'null') {
            url += `&search=${encodeURIComponent(searchQuery)}`;
        }
        
        const response = await authAxios.get(url);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const fetchBoatsList = async () => {
    try {
        const response = await authAxios.get('users/boat/?is_pagination=false');
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

export const createBoat = async (boatData, images = [], customerId = null) => { 
    try {
        const formData = new FormData();
        
        formData.append('name', boatData.name);
        formData.append('registration_number', boatData.registration_number);
        formData.append('length', boatData.length);
        formData.append('width', boatData.width);
        formData.append('description', boatData.description);
        
        if (customerId) {
            formData.append('customer', customerId);
        }
        
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

export const updateBoatDetails = async (boatId, boatData, images = [], customerId = null) => { 
    try {
        const formData = new FormData();
        
        formData.append('name', boatData.name);
        formData.append('registration_number', boatData.registration_number);
        formData.append('length', boatData.length);
        formData.append('width', boatData.width);
        formData.append('description', boatData.description);
        
        if (customerId) {
            formData.append('customer', customerId);
        }
        
        images.forEach((image, index) => {
            if (image && image.url) {
                formData.append('images', {
                    uri: image.url,
                    type: 'image/jpeg',
                    name: image.name || `boat_image_${index}.jpg`,
                });
            }
        });
        
        const response = await authAxios.put(`users/boat/${boatId}/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const deleteBoatImage = async (imageId) => {
    try {
        const response = await authAxios.delete(`users/boat/images/${imageId}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const disableBoat = async (boatId, status) => {
    const payload = {
        status: status
    }
    try {
        const response = await authAxios.patch(`users/boat/${boatId}/`, payload);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const deleteBoat = async (boatId) => {
    try {
        const response = await authAxios.delete(`users/boat/${boatId}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
}
