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
        updateBoat: (state, action) => {
            state.boats = state.boats.map(boat => boat.id === action.payload.id ? action.payload : boat);
        },
        updateBoatStatus: (state, action) => {
            const { boatId, status } = action.payload;
            state.boats = state.boats.map(boat => 
                boat.id === boatId ? { ...boat, status } : boat
            );
        },
        removeBoat: (state, action) => {
            state.boats = state.boats.filter(boat => boat.id !== action.payload);
        },
        clearBoats: (state) => {
            state.boats = [];
        },
    },
});

export const { setBoats, clearBoats, updateBoat, updateBoatStatus, removeBoat } = boatSlice.actions;
export default boatSlice.reducer;