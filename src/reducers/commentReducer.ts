import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {Comment} from '../types/Comment'

interface CommentState {
    comments: Comment[]
    loading: boolean
    error: string | null
    addingComment: boolean
    addCommentError: string | null
    updatingComment: boolean
    updateCommentError: string | null
    deletingComment: boolean
    deleteCommentError: string | null
    likeStatuses: { [commentId: number]: 'like' | 'dislike' | null }
}

const initialState: CommentState = {
    comments: [],
    loading: false,
    error: null,
    addingComment: false,
    addCommentError: null,
    updatingComment: false,
    updateCommentError: null,
    deletingComment: false,
    deleteCommentError: null,
    likeStatuses: {},
}

const commentSlice = createSlice({
    name: 'comments',
    initialState,
    reducers: {
        fetchCommentsRequest: (state) => {
            state.loading = true
            state.error = null
        },
        fetchCommentsSuccess: (state, action: PayloadAction<Comment[]>) => {
            state.comments = action.payload
            state.loading = false
        },
        fetchCommentsFailure: (state, action: PayloadAction<string>) => {
            state.loading = false
            state.error = action.payload
        },
        addCommentRequest: (state) => {
            state.addingComment = true
            state.addCommentError = null
        },
        addCommentSuccess: (state, action: PayloadAction<Comment>) => {
            state.addingComment = false
            state.comments.push(action.payload)
        },
        addCommentFailure: (state, action: PayloadAction<string>) => {
            state.addingComment = false
            state.addCommentError = action.payload
        },
        updateCommentRequest: (state) => {
            state.updatingComment = true
            state.updateCommentError = null
        },
        updateCommentSuccess: (state, action: PayloadAction<Comment>) => {
            state.updatingComment = false
            const index = state.comments.findIndex(c => c.id === action.payload.id)
            if (index !== -1) {
                state.comments[index] = action.payload
            }
        },
        updateCommentFailure: (state, action: PayloadAction<string>) => {
            state.updatingComment = false
            state.updateCommentError = action.payload
        },
        deleteCommentRequest: (state) => {
            state.deletingComment = true
            state.deleteCommentError = null
        },
        deleteCommentSuccess: (state, action: PayloadAction<number>) => {
            state.deletingComment = false
            state.comments = state.comments.filter(c => c.id !== action.payload)
            delete state.likeStatuses[action.payload]
        },
        deleteCommentFailure: (state, action: PayloadAction<string>) => {
            state.deletingComment = false
            state.deleteCommentError = action.payload
        },
        setLikeStatus: (
            state,
            action: PayloadAction<{ commentId: number; status: 'like' | 'dislike' | null }>
        ) => {
            state.likeStatuses[action.payload.commentId] = action.payload.status
        },
        incrementLikes: (state, action: PayloadAction<number>) => {
            const comment = state.comments.find(c => c.id === action.payload)
            if (comment) {
                comment.likes += 1
            }
        },
        decrementLikes: (state, action: PayloadAction<number>) => {
            const comment = state.comments.find(c => c.id === action.payload)
            if (comment && comment.likes > 0) {
                comment.likes -= 1
            }
        },
        incrementDislikes: (state, action: PayloadAction<number>) => {
            const comment = state.comments.find(c => c.id === action.payload)
            if (comment) {
                comment.dislikes += 1
            }
        },
        decrementDislikes: (state, action: PayloadAction<number>) => {
            const comment = state.comments.find(c => c.id === action.payload)
            if (comment && comment.dislikes > 0) {
                comment.dislikes -= 1
            }
        },
    },
    extraReducers: (builder) => {
    },
})

export const {
    fetchCommentsRequest,
    fetchCommentsSuccess,
    fetchCommentsFailure,
    addCommentRequest,
    addCommentSuccess,
    addCommentFailure,
    updateCommentRequest,
    updateCommentSuccess,
    updateCommentFailure,
    deleteCommentRequest,
    deleteCommentSuccess,
    deleteCommentFailure,
    setLikeStatus,
    incrementLikes,
    decrementLikes,
    incrementDislikes,
    decrementDislikes,
} = commentSlice.actions

export default commentSlice.reducer
