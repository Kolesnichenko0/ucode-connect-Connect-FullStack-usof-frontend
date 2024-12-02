import {createSlice, PayloadAction} from '@reduxjs/toolkit'

interface User {
    id: string
    login: string
    email: string
    full_name: string
    profile_picture_url: string
    role: string
}

interface Post {
    id: string
    title: string
    content: string
}

interface SortOptions {
    sortBy: 'login' | 'rating'
    order: 'ASC' | 'DESC'
}

interface UserState {
    currentUser: User | null
    allUsers: User[]
    userPosts: Post[]
    favoritePosts: Post[]
    loading: boolean
    error: string | null
    allUsersLoading: boolean
    allUsersError: string | null
    allUsersPage: number
    allUsersLimit: number
    allUsersTotal: number
    allUsersSort: SortOptions
}

const initialState: UserState = {
    currentUser: null,
    allUsers: [],
    userPosts: [],
    favoritePosts: [],
    loading: false,
    error: null,
    allUsersLoading: false,
    allUsersError: null,
    allUsersPage: 1,
    allUsersLimit: 30,
    allUsersTotal: 0,
    allUsersSort: {
        sortBy: 'login',
        order: 'ASC',
    },
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        getUserRequest: (state) => {
            state.loading = true
            state.error = null
        },
        getUserSuccess: (state, action: PayloadAction<User>) => {
            state.currentUser = action.payload
            state.loading = false
        },
        getUserFailure: (state, action: PayloadAction<string>) => {
            state.loading = false
            state.error = action.payload
        },
        updateUserRequest: (state) => {
            state.loading = true
            state.error = null
        },
        updateUserSuccess: (state, action: PayloadAction<User>) => {
            state.currentUser = action.payload
            state.loading = false
        },
        updateUserFailure: (state, action: PayloadAction<string>) => {
            state.loading = false
            state.error = action.payload
        },
        getUserPostsRequest: (state) => {
            state.loading = true
            state.error = null
        },
        getUserPostsSuccess: (state, action: PayloadAction<Post[]>) => {
            state.userPosts = action.payload
            state.loading = false
        },
        getUserPostsFailure: (state, action: PayloadAction<string>) => {
            state.loading = false
            state.error = action.payload
        },
        getFavoritePostsRequest: (state) => {
            state.loading = true
            state.error = null
        },
        getFavoritePostsSuccess: (state, action: PayloadAction<Post[]>) => {
            state.favoritePosts = action.payload
            state.loading = false
        },
        getFavoritePostsFailure: (state, action: PayloadAction<string>) => {
            state.loading = false
            state.error = action.payload
        },
        addFavoritePostRequest: (state) => {
            state.loading = true
            state.error = null
        },
        addFavoritePostSuccess: (state, action: PayloadAction<string>) => {
            // You might want to update the favoritePosts array here
            state.loading = false
        },
        addFavoritePostFailure: (state, action: PayloadAction<string>) => {
            state.loading = false
            state.error = action.payload
        },
        removeFavoritePostRequest: (state) => {
            state.loading = true
            state.error = null
        },
        removeFavoritePostSuccess: (state, action: PayloadAction<string>) => {
            state.favoritePosts = state.favoritePosts.filter(post => post.id !== action.payload)
            state.loading = false
        },
        removeFavoritePostFailure: (state, action: PayloadAction<string>) => {
            state.loading = false
            state.error = action.payload
        },
        uploadAvatarRequest: (state) => {
            state.loading = true
            state.error = null
        },
        uploadAvatarSuccess: (state, action: PayloadAction<string>) => {
            if (state.currentUser) {
                state.currentUser.profile_picture_url = action.payload
            }
            state.loading = false
        },
        uploadAvatarFailure: (state, action: PayloadAction<string>) => {
            state.loading = false
            state.error = action.payload
        },
        getAllUsersRequest: (state) => {
            state.allUsersLoading = true
            state.allUsersError = null
        },
        getAllUsersSuccess: (state, action: PayloadAction<{ users: User[]; total: number }>) => {
            state.allUsers = action.payload.users
            state.allUsersTotal = action.payload.total
            state.allUsersLoading = false
        },
        getAllUsersFailure: (state, action: PayloadAction<string>) => {
            state.allUsersLoading = false
            state.allUsersError = action.payload
        },
        setAllUsersPage: (state, action: PayloadAction<number>) => {
            state.allUsersPage = action.payload
        },
        setAllUsersLimit: (state, action: PayloadAction<number>) => {
            state.allUsersLimit = action.payload
        },
        setAllUsersSort: (state, action: PayloadAction<SortOptions>) => {
            state.allUsersSort = action.payload
            state.allUsersPage = 1
        },
    },
})

export const {
    getUserRequest,
    getUserSuccess,
    getUserFailure,
    updateUserRequest,
    updateUserSuccess,
    updateUserFailure,
    getUserPostsRequest,
    getUserPostsSuccess,
    getUserPostsFailure,
    getFavoritePostsRequest,
    getFavoritePostsSuccess,
    getFavoritePostsFailure,
    addFavoritePostRequest,
    addFavoritePostSuccess,
    addFavoritePostFailure,
    removeFavoritePostRequest,
    removeFavoritePostSuccess,
    removeFavoritePostFailure,
    uploadAvatarRequest,
    uploadAvatarSuccess,
    uploadAvatarFailure,
    getAllUsersRequest,
    getAllUsersSuccess,
    getAllUsersFailure,
    setAllUsersPage,
    setAllUsersLimit,
    setAllUsersSort,
} = userSlice.actions


export default userSlice.reducer

