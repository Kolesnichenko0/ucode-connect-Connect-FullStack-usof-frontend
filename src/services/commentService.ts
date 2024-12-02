import axios from 'axios'

const API_URL = 'http://localhost:3001/api'

const commentService = {
    getCommentsByPostId: async (postId: number, userId: number | null) => {
        const response = await axios.get(`${API_URL}/posts/${postId}/comments`, {
            params: {
                userId,
            },
        })
        return response.data
    },
    createComment: async (postId: number, content: string, parentCommentId?: number) => {
        const response = await axios.post(`${API_URL}/posts/${postId}/comments`, {
            content,
            parent_comment_id: parentCommentId || null,
        })
        return response.data
    },
    updateComment: async (commentId: number, data: { content?: string; status?: 'active' | 'inactive' }) => {
        const response = await axios.patch(`${API_URL}/comments/${commentId}`, data)
        return response.data
    },
    deleteComment: async (commentId: number) => {
        const response = await axios.delete(`${API_URL}/comments/${commentId}`)
        return response.data
    },
    likeComment: async (commentId: number) => {
        const response = await axios.post(`${API_URL}/comments/${commentId}/like`, {isLike: 'true'})
        return response.data
    },
    dislikeComment: async (commentId: number) => {
        const response = await axios.post(`${API_URL}/comments/${commentId}/like`, {isLike: 'false'})
        return response.data
    },
    removeLike: async (commentId: number) => {
        const response = await axios.delete(`${API_URL}/comments/${commentId}/like`)
        return response.data
    },
    getLikeStatus: async (commentId: number) => {
        const response = await axios.get(`${API_URL}/comments/${commentId}/like-status`)
        return response.data
    },
}

export default commentService
