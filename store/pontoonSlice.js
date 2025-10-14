import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    pontoons: [],
}

const pontoonSlice = createSlice({
    name: 'pontoon',
    initialState,
    reducers: {
        setPontoons: (state, action) => {
            state.pontoons = action.payload;
        },
        clearPontoons: (state) => {
            state.pontoons = [];
        },
    },
});

export const { setPontoons, clearPontoons } = pontoonSlice.actions;
export default pontoonSlice.reducer;