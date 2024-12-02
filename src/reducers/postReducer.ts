import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {Post} from '../types/Post'
import {searchPosts} from "@/actions/postActions.ts";

interface PostState {
    posts: Post[]
    searchResults: Post[]
    loading: boolean
    error: string | null
    currentPage: number
    totalPages: number
    found: number
    total: number
    searchTitle: string
    categoryFilters: number[]
    startDate?: string
    endDate?: string
    sortBy: 'rating' | 'created_at'
    order: 'DESC' | 'ASC'
    statusFilter?: 'active' | 'inactive' | 'both'
    creatingPost: boolean
    createPostError: string | null
    uploadedFiles: string[]
    uploadFilesLoading: boolean
    uploadFilesError: string | null
    likeStatuses: { [postId: number]: 'like' | 'dislike' | null }
    updatingPost: boolean
    updatePostError: string | null
}

const initialState: PostState = {
    posts: [],
    searchResults: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    found: 0,
    total: 0,
    searchTitle: '',
    categoryFilters: [],
    sortBy: 'rating',
    order: 'DESC',
    statusFilter: 'active',
    creatingPost: false,
    createPostError: null,
    uploadedFiles: [],
    uploadFilesLoading: false,
    uploadFilesError: null,
    likeStatuses: {},
    updatingPost: false,
    updatePostError: null,
}

const postSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        getPostsRequest: (state) => {
            state.loading = true
            state.error = null
        },
        getPostsSuccess: (
            state,
            action: PayloadAction<{ posts: Post[]; found: number; total: number }>
        ) => {
            state.posts = action.payload.posts
            state.found = action.payload.found
            state.total = action.payload.total
            state.totalPages = Math.ceil(action.payload.found / 30)
            state.loading = false
        },
        getPostsFailure: (state, action: PayloadAction<string>) => {
            state.loading = false
            state.error = action.payload
        },
        setPostFilters: (
            state,
            action: PayloadAction<{
                searchTitle?: string
                categoryFilters?: number[]
                startDate?: string
                endDate?: string
                statusFilter?: 'active' | 'inactive' | 'both'
            }>
        ) => {
            state.searchTitle = action.payload.searchTitle ?? state.searchTitle
            state.categoryFilters = action.payload.categoryFilters ?? state.categoryFilters
            state.startDate = action.payload.startDate
            state.endDate = action.payload.endDate
            state.statusFilter = action.payload.statusFilter ?? state.statusFilter
            state.currentPage = 1
        },
        setPostSort: (
            state,
            action: PayloadAction<{
                sortBy: 'rating' | 'created_at'
                order: 'DESC' | 'ASC'
            }>
        ) => {
            state.sortBy = action.payload.sortBy
            state.order = action.payload.order
            state.currentPage = 1
        },
        setPostPage: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload
        },
        uploadFilesRequest: (state) => {
            state.uploadFilesLoading = true
            state.uploadFilesError = null
        },
        uploadFilesSuccess: (state, action: PayloadAction<string[]>) => {
            state.uploadFilesLoading = false
            state.uploadFilesError = null
            state.uploadedFiles = [...state.uploadedFiles, ...action.payload]
        },
        uploadFilesFailure: (state, action: PayloadAction<string>) => {
            state.uploadFilesLoading = false
            state.uploadFilesError = action.payload
        },
        createPostRequest: (state) => {
            state.creatingPost = true
            state.createPostError = null
        },
        createPostSuccess: (state, action: PayloadAction<Post>) => {
            state.creatingPost = false
            state.createPostError = null
            state.posts.unshift(action.payload)
        },
        createPostFailure: (state, action: PayloadAction<string>) => {
            state.creatingPost = false
            state.createPostError = action.payload
        },
        resetUploadedFiles: (state) => {
            state.uploadedFiles = []
            state.uploadFilesError = null
        },
        setLikeStatus: (
            state,
            action: PayloadAction<{ postId: number; status: 'like' | 'dislike' | null }>
        ) => {
            state.likeStatuses[action.payload.postId] = action.payload.status
        },
        incrementLikes: (state, action: PayloadAction<number>) => {
            const post = state.posts.find(p => p.id === action.payload)
            if (post) {
                post.likes += 1
            }
        },
        decrementLikes: (state, action: PayloadAction<number>) => {
            const post = state.posts.find(p => p.id === action.payload)
            if (post && post.likes > 0) {
                post.likes -= 1
            }
        },
        incrementDislikes: (state, action: PayloadAction<number>) => {
            const post = state.posts.find(p => p.id === action.payload)
            if (post) {
                post.dislikes += 1
            }
        },
        decrementDislikes: (state, action: PayloadAction<number>) => {
            const post = state.posts.find(p => p.id === action.payload)
            if (post && post.dislikes > 0) {
                post.dislikes -= 1
            }
        },
        updatePostRequest: (state) => {
            state.updatingPost = true
            state.updatePostError = null
        },
        updatePostSuccess: (state, action: PayloadAction<Post>) => {
            state.updatingPost = false
            state.updatePostError = null
            const index = state.posts.findIndex(p => p.id === action.payload.id)
            if (index !== -1) {
                state.posts[index] = action.payload
            }
        },
        updatePostFailure: (state, action: PayloadAction<string>) => {
            state.updatingPost = false
            state.updatePostError = action.payload
        },
        deletePostRequest: (state) => {
            state.loading = true
            state.error = null
        },
        deletePostSuccess: (state, action: PayloadAction<number>) => {
            state.loading = false
            state.error = null
            state.posts = state.posts.filter(post => post.id !== action.payload)
            delete state.likeStatuses[action.payload]
        },
        deletePostFailure: (state, action: PayloadAction<string>) => {
            state.loading = false
            state.error = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(searchPosts.pending, (state) => {
            })
            .addCase(searchPosts.fulfilled, (state, action: PayloadAction<any>) => {
                state.searchResults = action.payload;
            })
            .addCase(searchPosts.rejected, (state, action: PayloadAction<any>) => {
            });
    },
})

export const {
    getPostsRequest,
    getPostsSuccess,
    getPostsFailure,
    setPostFilters,
    setPostSort,
    setPostPage,
    uploadFilesRequest,
    uploadFilesSuccess,
    uploadFilesFailure,
    createPostRequest,
    createPostSuccess,
    createPostFailure,
    resetUploadedFiles,
    setLikeStatus,
    incrementLikes,
    decrementLikes,
    incrementDislikes,
    decrementDislikes,
    updatePostRequest,
    updatePostSuccess,
    updatePostFailure,
    deletePostRequest,
    deletePostSuccess,
    deletePostFailure,
} = postSlice.actions

export default postSlice.reducer
