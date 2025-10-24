import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	messages: {},
};

const chatSlice = createSlice({
	name: 'chat',
	initialState,
	reducers: {
		addMessage(state, action) {
			const { ticketId, message } = action.payload;
			if (!state.messages[ticketId]) state.messages[ticketId] = [];
			state.messages[ticketId].push(message);
		},
		setMessages(state, action) {
			const { ticketId, messages } = action.payload;
			state.messages[ticketId] = messages;
		},
		clearMessages(state, action) {
			const { ticketId } = action.payload;
			delete state.messages[ticketId];
		},
	},
});

export const { addMessage, setMessages, clearMessages } =	chatSlice.actions;
export default chatSlice.reducer;