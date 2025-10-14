import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    berths: [],
}

const berthSlice = createSlice({
    name: 'berth',
    initialState,
    reducers: {
        setBerths: (state, action) => {
            state.berths = action.payload;
        },
        clearBerths: (state) => {
            state.berths = [];
        },
    },
});

export const { setBerths, clearBerths } = berthSlice.actions;
export default berthSlice.reducer;