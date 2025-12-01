import { useEffect, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { I18nManager } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import react-native-restart with error handling
let RNRestart = null;
try {
  const restartModule = require('react-native-restart');
  
  // Try different ways to access Restart method
  if (restartModule && restartModule.Restart && typeof restartModule.Restart === 'function') {
    // Standard export: { Restart: function }
    RNRestart = restartModule;
  } else if (restartModule && restartModule.default) {
    if (restartModule.default.Restart && typeof restartModule.default.Restart === 'function') {
      // Default export with Restart method
      RNRestart = restartModule.default;
    } else if (typeof restartModule.default === 'function') {
      // Default export is the function itself
      RNRestart = { Restart: restartModule.default };
    }
  } else if (restartModule && typeof restartModule === 'function') {
    // Module itself is the function
    RNRestart = { Restart: restartModule };
  }
  
  // Final verification
  if (!RNRestart || typeof RNRestart.Restart !== 'function') {
    RNRestart = null;
  }
} catch (e) {
  RNRestart = null;
}

const useLanguageToggle = (onLanguageChange) => {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');

  // Apply RTL/LTR based on current language
  const applyRTL = useCallback((lang, shouldRestart = false) => {
    const isArabic = lang === "ar";
    const wasRTL = I18nManager.isRTL;
    
    // Always set RTL based on language
    // For Arabic: enable and force RTL
    // For English: disable RTL (force LTR)
    I18nManager.allowRTL(true); // Allow RTL to be changed
    
    if (isArabic) {
      // Enable RTL for Arabic
      I18nManager.forceRTL(true);
    } else {
      // Disable RTL for English (force LTR)
      I18nManager.forceRTL(false);
    }
       
    // Restart app if RTL state changed and restart is requested
    if (shouldRestart && wasRTL !== isArabic && RNRestart) {
      setTimeout(() => {
        RNRestart.Restart();
      }, 300);
    }
  }, []);

  useEffect(() => {
    const lang = i18n.language || 'en';
    setCurrentLang(lang);
    applyRTL(lang);
  }, [i18n.language, applyRTL]);

  // Toggle between English and Arabic
  const toggleLanguage = useCallback(() => {
    const currentLanguage = i18n.language || 'en';
    const newLang = currentLanguage === "en" ? "ar" : "en";
    const isArabic = newLang === "ar";
   
    // Set RTL state immediately
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(isArabic);
    
    // Change language in i18n
    i18n.changeLanguage(newLang).then(() => {
      setCurrentLang(newLang);
      
      // Save language preference
      AsyncStorage.setItem('userLanguage', newLang).catch(() => {
        // Ignore errors
      });
      
      // Call callback if provided (e.g., to show toast)
      if (onLanguageChange) {
        const langName = newLang === 'ar' ? 'Arabic' : 'English';
        onLanguageChange(newLang, langName);
      }
      
      // Always restart app when language changes to apply RTL/LTR layout changes
      // This is required because React Native needs a restart for layout direction changes
      if (RNRestart) {
        setTimeout(() => {
          try {
            if (RNRestart.Restart) {
              RNRestart.Restart();
            } else if (typeof RNRestart === 'function') {
              RNRestart();
            }
          } catch (error) {
            // Silently handle restart errors
          }
        }, 500);
      }
    }).catch(() => {
      // Silently handle language change errors
    });
  }, [i18n, onLanguageChange]);

  return {
    currentLanguage: currentLang,
    toggleLanguage,
    isArabic: currentLang === "ar",
    isEnglish: currentLang === "en",
  };
};

export default useLanguageToggle;
