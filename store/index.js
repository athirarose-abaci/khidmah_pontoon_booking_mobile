import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import themeSlice from "./themeSlice";

const store = configureStore({
    reducer : {
        authSlice : authSlice,
        themeSlice : themeSlice,
    }
})

export default store;