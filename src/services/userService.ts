import axios from 'axios'
import authService from './authService'

const API_URL = 'http://localhost:3001/api'

const userService = {
    setAuthToken: (token: string) => {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    },
    clearAuthToken: () => {
        delete axios.defaults.headers.common['Authorization']
    },
    refreshToken: async () => {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
            throw new Error('No refresh token available')
        }
        const response = await axios.post(`${API_URL}/auth/access-token/refresh`, {refreshToken})
        return response.data
    },
    getCurrentUser: async (userId: string) => {
        const response = await axios.get(`${API_URL}/users/${userId}`)
        return response.data
    },
    updateCurrentUser: async (userData: any, userId: string) => {
        const response = await axios.patch(`${API_URL}/users/${userId}`, userData)
        return response.data
    },
    getUserById: async (userId: string) => {
        const response = await axios.get(`${API_URL}/users/${userId}`)
        return response.data
    },
    getUserPosts: async (userId: string, page = 1, limit = 30, status?: string) => {
        const response = await axios.get(`${API_URL}/users/${userId}/posts`, {
            params: {
                page,
                limit,
                status,
            },
        })
        return response.data
    },
    getFavoritePosts: async (userId: string, page = 1, limit = 30) => {
        const response = await axios.get(`${API_URL}/users/${userId}/favorite-posts`, {
            params: {
                page,
                limit,
            },
        })
        return response.data
    },
    addFavoritePost: async (postId: string) => {
        const response = await axios.post(`${API_URL}/users/favorite-posts`, {postId})
        return response.data
    },
    removeFavoritePost: async (postId: string) => {
        const response = await axios.delete(`${API_URL}/users/favorite-posts/${postId}`)
        return response.data
    },
    uploadAvatar: async (formData: FormData) => {
        const response = await axios.post(`${API_URL}/users/upload-avatar`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    },
    getAllUsers: async (
        page: number = 1,
        limit: number = 30,
        sortBy: 'login' | 'rating' = 'login',
        order: 'ASC' | 'DESC' = 'ASC'
    ) => {
        const response = await axios.get(`${API_URL}/users`, {
            params: {
                page,
                limit,
                sortBy,
                order,
            },
        })
        return response.data
    },
}

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        if (
            error.response &&
            (error.response.status === 401 || error.response.status === 403) &&
            !originalRequest._retry &&
            !originalRequest.url.includes('/auth/login') &&
            !originalRequest.url.includes('/auth/register')
        ) {
            originalRequest._retry = true
            try {
                const refreshedTokenData = await authService.refreshToken()
                originalRequest.headers['Authorization'] = `Bearer ${refreshedTokenData.data.accessToken}`
                sessionStorage.setItem('accessToken', refreshedTokenData.data.accessToken)
                userService.setAuthToken(refreshedTokenData.data.accessToken)
                return axios(originalRequest)
            } catch (refreshError) {
                await authService.logout()
                return Promise.reject(refreshError)
            }
        }
        return Promise.reject(error)
    }
)

export default userService
