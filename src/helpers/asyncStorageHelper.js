import AsyncStorage from "@react-native-async-storage/async-storage"

const storeData = async (key, value) => {
    try {
        await AsyncStorage.setItem(key, value)
    } catch (err) {
        //Pass
    }
}

const getData = async (key) => {
    try {
        const value = await AsyncStorage.getItem(key)
        return value
    } catch (err) {
        //Pass
        return null
    }
}

const removeData = async (key) => {
    try {
        await AsyncStorage.removeItem(key)
    } catch (err) {
        //Pass
    }
}

export { storeData, getData, removeData }