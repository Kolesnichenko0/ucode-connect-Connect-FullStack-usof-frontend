import axios from 'axios'

const API_URL = 'http://localhost:3001/api'

const categoryService = {
    getAllCategories: async (page: number = 1, limit: number = 30, title: string = '') => {
        const response = await axios.get(`${API_URL}/categories`, {
            params: {page, limit, title},
        })
        return response.data
    },
    getCategoryById: async (categoryId: string) => {
        const response = await axios.get(`${API_URL}/categories/${categoryId}`)
        return response.data
    },
    createCategory: async (data: { title: string; description: string }) => {
        const response = await axios.post(`${API_URL}/categories`, data)
        return response.data
    },
    updateCategory: async (categoryId: string, data: { title?: string; description?: string }) => {
        const response = await axios.patch(`${API_URL}/categories/${categoryId}`, data)
        return response.data
    },
    deleteCategory: async (categoryId: string) => {
        const response = await axios.delete(`${API_URL}/categories/${categoryId}`)
        return response.data
    },
    getCategoryPosts: async (categoryId: string, page: number = 1, limit: number = 30) => {
        const response = await axios.get(`${API_URL}/categories/${categoryId}/posts`, {
            params: {page, limit},
        })
        return response.data
    },
}

export default categoryService
