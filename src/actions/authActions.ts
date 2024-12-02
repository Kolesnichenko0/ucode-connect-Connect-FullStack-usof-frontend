import {AppDispatch} from '../store'
import authService from '../services/authService'
import {setLoading, setUser, setError, logout as logoutAction} from '../reducers/authReducer'

interface RegisterData {
    login: string
    email: string
    password: string
}

interface LoginData {
    login?: string
    email?: string
    password: string
}

export const register = (userData: RegisterData) => async (dispatch: AppDispatch) => {
    try {
        dispatch(setLoading(true))
        const data = await authService.register(userData)
        dispatch(setLoading(false))
        return data
    } catch (error: any) {
        dispatch(setError(error.response?.data?.message || 'Registration failed'))
        throw error
    }
}

export const login = (loginData: LoginData) => async (dispatch: AppDispatch) => {
    try {
        dispatch(setLoading(true))
        const data = await authService.login(loginData)
        dispatch(setUser(data.user)) // data.user - profile_picture_url
        dispatch(setLoading(false))
        return data
    } catch (error: any) {
        dispatch(setError(error.response?.data?.message || 'Login failed'))
        throw error
    }
}

export const logout = () => async (dispatch: AppDispatch) => {
    try {
        await authService.logout()
        dispatch(logoutAction())
    } catch (error) {
        console.error('Logout error:', error)
    }
}

export const verifyEmail = (token: string) => async (dispatch: AppDispatch) => {
    try {
        dispatch(setLoading(true))
        const data = await authService.verifyEmail(token)
        dispatch(setLoading(false))
        return data
    } catch (error: any) {
        dispatch(setError(error.response?.data?.message || 'Email verification failed'))
        throw error
    }
}

export const sendPasswordResetLink = (email: string) => async (dispatch: AppDispatch) => {
    try {
        dispatch(setLoading(true))
        const data = await authService.sendPasswordResetLink(email)
        dispatch(setLoading(false))
        return data
    } catch (error: any) {
        dispatch(setError(error.response?.data?.message || 'Failed to send reset link'))
        throw error
    }
}

export const resetPassword = (token: string, newPassword: string) => async (dispatch: AppDispatch) => {
    try {
        dispatch(setLoading(true))
        const data = await authService.resetPassword(token, newPassword)
        dispatch(setLoading(false))
        return data
    } catch (error: any) {
        dispatch(setError(error.response?.data?.message || 'Password reset failed'))
        throw error
    }
}
