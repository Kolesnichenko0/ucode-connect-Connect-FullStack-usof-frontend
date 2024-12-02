import {AppDispatch, RootState} from '../store'
import userService from '../services/userService'

import {
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
    uploadAvatarRequest,
    uploadAvatarSuccess,
    uploadAvatarFailure,
    getAllUsersRequest,
    getAllUsersSuccess,
    getAllUsersFailure,
    setAllUsersPage,
    setAllUsersLimit,
    setAllUsersSort,
} from '../reducers/userReducer'
import {setUser, setError} from "@/reducers/authReducer.ts"

export const getCurrentUser = (userId: string, currentRole?: string) => async (dispatch: AppDispatch) => {
    try {
        dispatch(getUserRequest())
        const data = await userService.getCurrentUser(userId)
        dispatch(getUserSuccess(data.data))
        if (currentRole && currentRole !== data.data.role) {
            dispatch({type: 'auth/setUser', payload: data.data})
        }
    } catch (error: any) {
        dispatch(getUserFailure(error.response?.data?.message || 'Failed to get current user'))
        dispatch(setError(error.response?.data?.message || 'Failed to get current user'))
    }
}

export const getUserById = (userId: string) => async (dispatch: AppDispatch) => {
    try {
        dispatch(getUserRequest())
        const data = await userService.getUserById(userId)
        dispatch(getUserSuccess(data.data))
    } catch (error: any) {
        dispatch(getUserFailure(error.response?.data?.message || 'Failed to get user'))
        dispatch(setError(error.response?.data?.message || 'Failed to get user'))
    }
}

export const updateCurrentUser = (userData: any, userId: string) => async (dispatch: AppDispatch) => {
    try {
        dispatch(updateUserRequest())
        const data = await userService.updateCurrentUser(userData, userId)
        dispatch(updateUserSuccess(data.data))
        dispatch({type: 'auth/setUser', payload: data.data})
    } catch (error: any) {
        dispatch(updateUserFailure(error.response?.data?.message || 'Failed to update user'))
        dispatch(setError(error.response?.data?.message || 'Failed to update user'))
        throw error;
    }
}


export const updateUserRole = (userId: string, role: string) => async (dispatch: AppDispatch) => {
    try {
        await userService.updateCurrentUser({role}, userId)
    } catch (error) {
        console.error('Error updating role:', error);
    }
};

export const getUserPosts = (userId: string, page = 1, limit = 30, status?: string) => async (dispatch: AppDispatch) => {
    try {
        dispatch(getUserPostsRequest())
        const data = await userService.getUserPosts(userId, page, limit, status)
        dispatch(getUserPostsSuccess(data.data))
    } catch (error: any) {
        dispatch(getUserPostsFailure(error.response?.data?.message || 'Failed to get user posts'))
    }
}

export const getFavoritePosts = (userId: string, page = 1, limit = 30) => async (dispatch: AppDispatch) => {
    try {
        dispatch(getFavoritePostsRequest())
        const data = await userService.getFavoritePosts(userId, page, limit)
        dispatch(getFavoritePostsSuccess(data.data))
    } catch (error: any) {
        dispatch(getFavoritePostsFailure(error.response?.data?.message || 'Failed to get favorite posts'))
    }
}

export const uploadAvatar = (formData: FormData, userId: string) => async (dispatch: AppDispatch) => {
    try {
        dispatch(uploadAvatarRequest())
        const data = await userService.uploadAvatar(formData)
        dispatch(uploadAvatarSuccess(data.server_filename))
        const updatedData = await userService.updateCurrentUser({profile_picture_name: data.server_filename}, userId)
        dispatch(updateUserSuccess(updatedData.data))
        dispatch({type: 'auth/setUser', payload: updatedData.data})
    } catch (error: any) {
        dispatch(uploadAvatarFailure(error.response?.data?.message || 'Failed to upload avatar'))
        dispatch(setError(error.response?.data?.message || 'Failed to upload avatar'))
    }
}

export const getAllUsers = (
    page = 1,
    limit = 30,
    sortBy: 'login' | 'rating' = 'login',
    order: 'ASC' | 'DESC' = 'ASC'
) => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
        dispatch(getAllUsersRequest())

        const data = await userService.getAllUsers(page, limit, sortBy, order)

        const usersWithProfileUrl = data.data.map((user: any) => ({
            ...user,
            profile_picture_url: `http://localhost:3001/uploads/avatars/${user.profile_picture_name}`
        }));
        dispatch(getAllUsersSuccess({users: usersWithProfileUrl, total: data.total}))
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to get users'
        dispatch(getAllUsersFailure(errorMessage))
        dispatch(setError(errorMessage))
    }
}

export const changeUsersPage = (page: number) => (dispatch: AppDispatch) => {
    dispatch(setAllUsersPage(page))
}

export const changeUsersLimit = (limit: number) => (dispatch: AppDispatch) => {
    dispatch(setAllUsersLimit(limit))
}

export const changeUsersSort = (sortBy: 'login' | 'rating', order: 'ASC' | 'DESC') => (dispatch: AppDispatch) => {
    dispatch(setAllUsersSort({sortBy, order}))
}