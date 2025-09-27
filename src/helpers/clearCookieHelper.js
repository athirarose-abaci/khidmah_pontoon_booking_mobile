import CookieManager from "@react-native-cookies/cookies";

const clearCookies = async () => {
    try {
      await CookieManager.clearAll(); // Clears all cookies
    } catch (error) {
      // Pass
    }
  };

  export {clearCookies}