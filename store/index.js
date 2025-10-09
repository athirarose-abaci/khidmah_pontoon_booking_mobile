import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import themeSlice from "./themeSlice";
import boatSlice from "./boatSlice";

const store = configureStore({
    reducer : {
        authSlice : authSlice,
        themeSlice : themeSlice,
        boatSlice : boatSlice,
    }
})

export default store;