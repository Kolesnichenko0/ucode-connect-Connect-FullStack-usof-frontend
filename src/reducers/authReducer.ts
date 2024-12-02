import {createSlice, PayloadAction} from '@reduxjs/toolkit'

interface User {
    id: string
    login: string
    email: string
    full_name: string
    profile_picture_url: string
    profile_picture_name: string
    rating: string
    created_at: string
    role: string
}

interface AuthState {
    user: User | null
    loading: boolean
    error: string | null
}

const initialState: AuthState = {
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    loading: false,
    error: null,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload
            state.error = null
        },
        setUser: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload
            state.loading = false
            state.error = null
            if (action.payload) {
                localStorage.setItem('user', JSON.stringify(action.payload))
            } else {
                localStorage.removeItem('user')
            }
        },
        setError: (state, action: PayloadAction<string>) => {
            state.loading = false
            state.error = action.payload
        },
        logout: (state) => {
            state.user = null
            state.loading = false
            state.error = null
            localStorage.removeItem('user')
            sessionStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
        },
        clearError: (state) => {
            state.error = null
        },
    },
})

export const {setLoading, setUser, setError, logout, clearError} = authSlice.actions

export default authSlice.reducer
