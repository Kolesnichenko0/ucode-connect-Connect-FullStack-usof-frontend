import axios from 'axios'

const API_URL = 'http://localhost:3001/api'

const postService = {
    getAllPosts: async (queryString: string) => {
        const response = await axios.get(`${API_URL}/posts?${queryString}`)
        return response.data
    },
    getPostById: async (postId: number) => {
        const response = await axios.get(`${API_URL}/posts/${postId}`)
        return response.data
    },
    getFileNamesByPostId: async (postId: number) => {
        const response = await axios.get(`${API_URL}/posts/${postId}/file-names`)
        return response.data.data
    },
    getLikeStatus: async (postId: number) => {
        const response = await axios.get(`${API_URL}/posts/${postId}/like-status`)
        return response.data
    },
    likePost: async (postId: number) => {
        const response = await axios.post(`${API_URL}/posts/${postId}/like`, {isLike: 'true'})
        return response.data
    },
    dislikePost: async (postId: number) => {
        const response = await axios.post(`${API_URL}/posts/${postId}/like`, {isLike: 'false'})
        return response.data
    },
    removeLike: async (postId: number) => {
        const response = await axios.delete(`${API_URL}/posts/${postId}/like`)
        return response.data
    },
    createPost: async (data: { title: string; content: string; category_ids: number[]; files: string[] }) => {
        const response = await axios.post(`${API_URL}/posts`, data, {
            headers: {
                'Content-Type': 'application/json',
            },
        })
        return response.data
    },
    uploadFiles: async (formData: FormData) => {
        const response = await axios.post(`${API_URL}/posts/upload-files`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    },
    updatePost: async (
        postId: number,
        data: {
            title?: string;
            content?: string;
            category_ids?: number[];
            files?: string[];
            status?: 'active' | 'inactive'
        }
    ) => {
        const response = await axios.patch(`${API_URL}/posts/${postId}`, data, {
            headers: {
                'Content-Type': 'application/json',
            },
        })
        return response.data
    },
    deletePost: async (postId: number) => {
        const response = await axios.delete(`${API_URL}/posts/${postId}`)
        return response.data
    },
    getUserPosts: async (userId: string, queryString: string) => {
        const response = await axios.get(`${API_URL}/users/${userId}/posts?${queryString}`)
        return response.data
    },
    getFavoritePosts: async (userId: string, queryString: string) => {
        const response = await axios.get(`${API_URL}/users/${userId}/favorite-posts?${queryString}`)
        return response.data
    },
    getCategoryById: async (categoryId: number) => {
        const response = await axios.get(`${API_URL}/categories/${categoryId}`)
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
    searchPosts: async (searchTerm: string) => {
        const response = await axios.get(`${API_URL}/posts?title=${searchTerm}`);
        return response.data;
    },
}

export default postService
