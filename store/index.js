import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import themeSlice from "./themeSlice";
import boatSlice from "./boatSlice";
import bookingSlice from "./bookingSlice";
import ticketSlice from "./ticketSlice";
import socketSlice from "./socketSlice";

const store = configureStore({
    reducer : {
        authSlice : authSlice,
        themeSlice : themeSlice,
        boatSlice : boatSlice,
        bookingSlice : bookingSlice,
        ticketSlice : ticketSlice,
        socketSlice : socketSlice,
    }
})

export default store;