import {AppDispatch, RootState} from '../store'
import postService from '../services/postService'
import {
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
} from '../reducers/postReducer'
import userService from '../services/userService'
import categoryService from '../services/categoryService'
import {Post, User, Category} from '../types/Post'
import {createAsyncThunk} from "@reduxjs/toolkit";

const POSTS_PER_PAGE = 30

export const fetchPosts = () => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
        dispatch(getPostsRequest())
        const state = getState().posts
        const {currentPage, searchTitle, categoryFilters, startDate, endDate, sortBy, order} = state

        const params = new URLSearchParams()
        params.append('page', currentPage.toString())
        params.append('limit', POSTS_PER_PAGE.toString())
        params.append('sortBy', sortBy)
        params.append('order', order)

        if (searchTitle) {
            params.append('title', searchTitle)
        }

        if (categoryFilters.length > 0) {
            categoryFilters.forEach(id => params.append('category_ids', id.toString()))
        }

        if (startDate) {
            params.append('startDate', startDate)
        }

        if (endDate) {
            params.append('endDate', endDate)
        }

        const response = await postService.getAllPosts(params.toString())

        const posts: Post[] = response.data
        const found: number = response.found
        const total: number = response.total

        const userIds = Array.from(new Set(posts.map(post => post.user_id)))
        const categoryIds = Array.from(new Set(posts.flatMap(post => post.category_ids)))

        const usersPromises = userIds.map(id => userService.getUserById(id))
        const usersData = await Promise.all(usersPromises)
        const users: User[] = usersData.map(data => data.data)

        const categoriesPromises = categoryIds.map(id => categoryService.getCategoryById(id))
        const categoriesData = await Promise.all(categoriesPromises)
        const categories: Category[] = categoriesData.map(data => data.data)

        const enrichedPosts = posts.map(post => ({
            ...post,
            user: users.find(user => user.id === post.user_id),
            categories: categories.filter(category => post.category_ids.includes(category.id)),
        }))

        dispatch(getPostsSuccess({posts: enrichedPosts, found, total}))
    } catch (error: any) {
        dispatch(getPostsFailure(error.response?.data?.message || 'Failed to load the posts'))
    }
}

export const searchPosts = createAsyncThunk(
    'posts/searchPosts',
    async (searchTerm: string, {rejectWithValue}) => {
        try {
            if (searchTerm.length < 1) {
                return [];
            }

            const response = await postService.searchPosts(searchTerm);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response.data.message || 'Failed to fetch posts');
        }
    }
);

export const applyPostFilters = (filters: {
    searchTitle?: string
    categoryFilters?: number[]
    startDate?: string
    endDate?: string
    statusFilter?: 'active' | 'inactive' | 'both'
}, source: 'all' | 'user' | 'favorites', userId?: string) => (dispatch: AppDispatch) => {
    dispatch(setPostFilters(filters))
    if (source === 'all') {
        dispatch(fetchPosts())
    } else if (source === 'user' && userId) {
        dispatch(fetchUserPosts(userId))
    } else if (source === 'favorites' && userId) {
        dispatch(fetchFavoritePosts(userId))
    }
}

export const applyPostSort = (sort: {
    sortBy: 'rating' | 'created_at'
    order: 'DESC' | 'ASC'
}, source: 'all' | 'user' | 'favorites', userId?: string) => (dispatch: AppDispatch) => {
    dispatch(setPostSort(sort))
    if (source === 'all') {
        dispatch(fetchPosts())
    } else if (source === 'user' && userId) {
        dispatch(fetchUserPosts(userId))
    } else if (source === 'favorites' && userId) {
        dispatch(fetchFavoritePosts(userId))
    }
}

export const changePostPage = (page: number, source: 'all' | 'user' | 'favorites', userId?: string) => (dispatch: AppDispatch) => {
    dispatch(setPostPage(page))
    if (source === 'all') {
        dispatch(fetchPosts())
    } else if (source === 'user' && userId) {
        dispatch(fetchUserPosts(userId))
    } else if (source === 'favorites' && userId) {
        dispatch(fetchFavoritePosts(userId))
    }
}

export const uploadPostFiles = (files: File[]) => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
        dispatch(uploadFilesRequest())

        const formData = new FormData()
        files.forEach(file => {
            formData.append('media', file)
        })

        const response = await postService.uploadFiles(formData)
        const uploadedFiles: string[] = response.savedFiles.map((file: {
            server_filename: string
        }) => file.server_filename)
        dispatch(uploadFilesSuccess(uploadedFiles))
        const updatedState = getState()
        console.log('Updated uploadedFiles in state:', updatedState.posts.uploadedFiles)
        return uploadedFiles
    } catch (error: any) {
        dispatch(uploadFilesFailure(error.response?.data?.message || 'Failed to upload files'))
    }
}

export const createPost = (data: {
    title: string;
    content: string;
    category_ids: number[];
    files: string[]
}) => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
        dispatch(createPostRequest())
        const response = await postService.createPost(data)
        const newPost: Post = response.data

        dispatch(createPostSuccess(newPost))
        dispatch(resetUploadedFiles())
        return newPost.id
    } catch (error: any) {
        dispatch(createPostFailure(error.response?.data?.message || 'Failed to create post'))
        throw error
    }
}

export const fetchLikeStatus = (postId: number) => async (dispatch: AppDispatch) => {
    try {
        const response = await postService.getLikeStatus(postId)
        const status: 'like' | 'dislike' | null = response.data
        dispatch(setLikeStatus({postId, status}))
    } catch (error: any) {
        console.error('Failed to fetch like status:', error)
    }
}

export const likePost = (postId: number) => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
        await postService.likePost(postId)
        const state = getState()
        const previousStatus = state.posts.likeStatuses[postId]

        if (previousStatus === 'like') {
            await postService.removeLike(postId)
            dispatch(decrementLikes(postId))
            dispatch(setLikeStatus({postId, status: null}))
        } else if (previousStatus === 'dislike') {
            await postService.removeLike(postId)
            dispatch(decrementDislikes(postId))
            await postService.likePost(postId)
            dispatch(incrementLikes(postId))
            dispatch(setLikeStatus({postId, status: 'like'}))
        } else {
            dispatch(incrementLikes(postId))
            dispatch(setLikeStatus({postId, status: 'like'}))
        }
    } catch (error: any) {
        console.error('Failed to like the post:', error)
    }
}

export const dislikePost = (postId: number) => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
        await postService.dislikePost(postId)
        const state = getState()
        const previousStatus = state.posts.likeStatuses[postId]

        if (previousStatus === 'dislike') {
            await postService.removeLike(postId)
            dispatch(decrementDislikes(postId))
            dispatch(setLikeStatus({postId, status: null}))
        } else if (previousStatus === 'like') {
            await postService.removeLike(postId)
            dispatch(decrementLikes(postId))
            await postService.dislikePost(postId)
            dispatch(incrementDislikes(postId))
            dispatch(setLikeStatus({postId, status: 'dislike'}))
        } else {
            dispatch(incrementDislikes(postId))
            dispatch(setLikeStatus({postId, status: 'dislike'}))
        }
    } catch (error: any) {
        console.error('Failed to dislike the post:', error)
    }
}

export const removeLike = (postId: number) => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
        await postService.removeLike(postId)
        const state = getState()
        const previousStatus = state.posts.likeStatuses[postId]

        if (previousStatus === 'like') {
            dispatch(decrementLikes(postId))
        } else if (previousStatus === 'dislike') {
            dispatch(decrementDislikes(postId))
        }

        dispatch(setLikeStatus({postId, status: null}))
    } catch (error: any) {
        console.error('Failed to remove like/dislike:', error)
    }
}

export const updatePost = (
    postId: number,
    data: {
        title?: string;
        content?: string;
        category_ids?: number[];
        files?: string[];
        status?: 'active' | 'inactive'
    }
) => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
        dispatch(updatePostRequest())

        const updateData: any = {
            title: data.title,
            content: data.content,
        };

        if (data.category_ids && data.category_ids.length > 0) {
            updateData.category_ids = data.category_ids;
        }

        if (data.files && data.files.length > 0) {
            updateData.files = data.files;
        }

        if (data.status) {
            updateData.status = data.status;
        }

        const response = await postService.updatePost(postId, updateData)
        const updatedPost: Post = response.data
        dispatch(updatePostSuccess(updatedPost))
    } catch (error: any) {
        dispatch(updatePostFailure(error.response?.data?.message || 'Failed to update the post'))
    }
}

export const deletePost = (postId: number) => async (dispatch: AppDispatch) => {
    try {
        dispatch(deletePostRequest())
        await postService.deletePost(postId)
        dispatch(deletePostSuccess(postId))
    } catch (error: any) {
        dispatch(deletePostFailure(error.response?.data?.message || 'Failed to delete post'))
    }
}

export const fetchUserPosts = (userId: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
        dispatch(getPostsRequest())
        const state = getState().posts
        const {currentPage, searchTitle, categoryFilters, startDate, endDate, sortBy, order, statusFilter} = state

        const params = new URLSearchParams()
        params.append('page', currentPage.toString())
        params.append('limit', '30');

        if (searchTitle) {
            params.append('title', searchTitle)
        }

        if (statusFilter) {
            params.append('status', statusFilter)
        }

        if (categoryFilters.length > 0) {
            categoryFilters.forEach(id => params.append('category_ids', id.toString()))
        }

        if (startDate) {
            params.append('startDate', startDate)
        }

        if (endDate) {
            params.append('endDate', endDate)
        }

        if (sortBy) {
            params.append('sortBy', sortBy)
            params.append('order', order)
        }


        const response = await postService.getUserPosts(userId, params.toString())

        const posts: Post[] = response.data
        const found: number = response.found
        const total: number = response.total

        const userIds = Array.from(new Set(posts.map(post => post.user_id)))
        const categoryIds = Array.from(new Set(posts.flatMap(post => post.category_ids)))

        const usersPromises = userIds.map(id => userService.getUserById(id.toString()))
        const usersData = await Promise.all(usersPromises)
        const users: User[] = usersData.map(data => data.data)

        const categoriesPromises = categoryIds.map(id => postService.getCategoryById(id))
        const categoriesData = await Promise.all(categoriesPromises)
        const categories: Category[] = categoriesData.map(data => data.data)

        const enrichedPosts = posts.map(post => ({
            ...post,
            user: users.find(user => user.id === post.user_id),
            categories: categories.filter(category => post.category_ids.includes(category.id)),
        }))

        dispatch(getPostsSuccess({posts: enrichedPosts, found, total}))
    } catch (error: any) {
        dispatch(getPostsFailure(error.response?.data?.message || 'Failed to load user posts'))
    }
}

export const fetchFavoritePosts = (userId: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
        dispatch(getPostsRequest())
        const state = getState().posts
        const {currentPage, searchTitle, categoryFilters, startDate, endDate, sortBy, order} = state

        const params = new URLSearchParams()
        params.append('page', currentPage.toString())
        params.append('limit', '30')

        if (searchTitle) {
            params.append('title', searchTitle)
        }

        if (categoryFilters.length > 0) {
            categoryFilters.forEach(id => params.append('category_ids', id.toString()))
        }

        if (startDate) {
            params.append('startDate', startDate)
        }

        if (endDate) {
            params.append('endDate', endDate)
        }

        if (sortBy) {
            params.append('sortBy', sortBy)
            params.append('order', order)
        }

        const response = await postService.getFavoritePosts(userId, params.toString())

        const posts: Post[] = response.data
        const found: number = response.found
        const total: number = response.total

        const userIds = Array.from(new Set(posts.map(post => post.user_id)))
        const categoryIds = Array.from(new Set(posts.flatMap(post => post.category_ids)))

        const usersPromises = userIds.map(id => userService.getUserById(id.toString()))
        const usersData = await Promise.all(usersPromises)
        const users: User[] = usersData.map(data => data.data)

        const categoriesPromises = categoryIds.map(id => postService.getCategoryById(id))
        const categoriesData = await Promise.all(categoriesPromises)
        const categories: Category[] = categoriesData.map(data => data.data)

        const enrichedPosts = posts.map(post => ({
            ...post,
            user: users.find(user => user.id === post.user_id),
            categories: categories.filter(category => post.category_ids.includes(category.id)),
        }))

        dispatch(getPostsSuccess({posts: enrichedPosts, found, total}))
    } catch (error: any) {
        dispatch(getPostsFailure(error.response?.data?.message || 'Failed to load favourite posts'))
    }
}

export const addFavoritePost = (userId: string, postId: string) => async (dispatch: AppDispatch) => {
    try {
        await postService.addFavoritePost(postId)
    } catch (error: any) {
        console.error('Error when adding to favourites:', error)
    }
}

export const removeFavoritePost = (userId: string, postId: string) => async (dispatch: AppDispatch) => {
    try {
        await postService.removeFavoritePost(postId)
    } catch (error: any) {
        console.error('Error when deleting from favourites:', error)
    }
}
