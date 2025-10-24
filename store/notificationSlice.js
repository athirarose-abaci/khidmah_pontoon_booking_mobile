import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    notifications: {},
    processedNotificationIds: []
}

const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        setNotifications: (state, action) => {
            state.notifications = action.payload;
        },
        addNotification: (state, action) => {
            const notification = action.payload;
            // Only add if not already processed
            if (!state.processedNotificationIds.includes(notification?.id)) {
                state.notifications = { ...state.notifications, [notification?.id]: notification };
                state.processedNotificationIds.push(notification?.id);
            }
        },
        removeNotification: (state, action) => {
            const { [action.payload]: removed, ...rest } = state.notifications;
            state.notifications = rest;
        },
        clearNotifications: (state) => {
            state.notifications = {};
        },
        clearProcessedIds: (state) => {
            state.processedNotificationIds = [];
        },
    },
});

export const { setNotifications, addNotification, removeNotification, clearNotifications, clearProcessedIds } = notificationSlice.actions;
export default notificationSlice.reducer;