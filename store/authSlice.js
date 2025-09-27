import { createSlice} from '@reduxjs/toolkit';

const initialState = {
    authState : { authenticated : false },
    authToggle : false,
    loginCredentials : null,
}

const authSlice = createSlice({
    name : 'authentication',
    initialState,
    reducers : {
        setAuthState : (state, action) => {
            state.authState = action.payload;
        },
        setAuthToggle : (state, action) => {
            state.authToggle = action.payload;
        },
        setLoginCredentials : (state, action) => {
            state.loginCredentials = action.payload;
        }
    },
});

export const { setAuthState, setAuthToggle, setLoginCredentials } = authSlice.actions;
export default authSlice.reducer;