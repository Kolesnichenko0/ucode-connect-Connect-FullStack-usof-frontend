import axios from 'axios'
import userService from './userService'

const API_URL = 'http://localhost:3001/api/auth'

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

interface AuthResponse {
    data: {
        accessToken: string
        refreshToken: string
        user: {
            id: string
            login: string
            email: string
            full_name: string
            profile_picture_name: string
            role: string
        }
    }
}

const authService = {
    register: async (userData: RegisterData) => {
        const response = await axios.post(`${API_URL}/register`, userData)
        return response.data
    },
    login: async (loginData: LoginData) => {
        try {
            const response = await axios.post<AuthResponse>(`${API_URL}/login`, loginData)
            if (response.data.data.accessToken) {
                sessionStorage.setItem('accessToken', response.data.data.accessToken)
                localStorage.setItem('refreshToken', response.data.data.refreshToken)
                const userWithProfileUrl = {
                    ...response.data.data.user,
                    profile_picture_url: `http://localhost:3001/uploads/avatars/${response.data.data.user.profile_picture_name}`
                }
                localStorage.setItem('user', JSON.stringify(userWithProfileUrl))
                userService.setAuthToken(response.data.data.accessToken)
                return {...response.data, user: userWithProfileUrl}
            }
            return response.data
        } catch (error: any) {
            console.log('Login error:', error.response)
            throw error
        }
    },
    logout: async () => {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
            throw new Error('No refresh token found')
        }
        try {
            await axios.post(`${API_URL}/logout`, {refreshToken})
        } catch (error) {
            console.error('Logout error:', error)
            throw error
        } finally {
            sessionStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
            userService.clearAuthToken()
        }
    },
    refreshToken: async () => {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
            throw new Error('No refresh token available')
        }
        try {
            const response = await axios.post<AuthResponse>(`${API_URL}/access-token/refresh`, {refreshToken})
            if (response.data.data.accessToken) {
                sessionStorage.setItem('accessToken', response.data.data.accessToken)
                userService.setAuthToken(response.data.data.accessToken)
            }
            return response.data
        } catch (error: any) {
            console.log('Refresh token error:', error.response)
            throw error
        }
    },
    verifyEmail: async (token: string) => {
        const response = await axios.get(`${API_URL}/verify-email/${token}`)
        return response.data
    },
    sendPasswordResetLink: async (email: string) => {
        const response = await axios.post(`${API_URL}/password-reset`, {email})
        return response.data
    },
    resetPassword: async (token: string, newPassword: string) => {
        const response = await axios.post(`${API_URL}/password-reset/${token}`, {newPassword})
        return response.data
    },
}

export default authService
