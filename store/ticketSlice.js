import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    tickets: [],
}

const ticketSlice = createSlice({
    name: 'ticket',
    initialState,
    reducers: {
        setTickets: (state, action) => {
            state.tickets = action.payload;
        },
        addTickets: (state, action) => {
            state.tickets = [...state.tickets, ...action.payload];
        },
        updateTicket: (state, action) => {
            state.tickets = state.tickets.map(ticket => ticket.id === action.payload.id ? action.payload : ticket);
        },
        clearTickets: (state) => {
            state.tickets = [];
        },
    },
});

export const { setTickets, addTickets, updateTicket, clearTickets } = ticketSlice.actions;
export default ticketSlice.reducer;