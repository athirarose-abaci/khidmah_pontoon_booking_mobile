import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    boats: [],
}

const boatSlice = createSlice({
    name: 'boat',
    initialState,
    reducers: {
        setBoats: (state, action) => {
            state.boats = action.payload;
        },
        clearBoats: (state) => {
            state.boats = [];
        },
    },
});

export const { setBoats, clearBoats } = boatSlice.actions;
export default boatSlice.reducer;