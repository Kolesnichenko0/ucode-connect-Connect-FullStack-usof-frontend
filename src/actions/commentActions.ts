import {AppDispatch, RootState} from '../store'
import commentService from '../services/commentService'
import {
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
} from '../reducers/commentReducer'
import {Comment, User} from '../types/Comment'
import userService from "@/services/userService.ts";

export const fetchComments = (postId: number) => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
        dispatch(fetchCommentsRequest())
        const state = getState()
        const userId = state.auth.user?.id || null

        const response = await commentService.getCommentsByPostId(postId, userId)
        const comments: Comment[] = response.data

        const userIds = Array.from(new Set(comments.map(comment => comment.user_id)))
        const usersPromises = userIds.map(id => userService.getUserById(id))
        const usersData = await Promise.all(usersPromises)
        const users: User[] = usersData.map(data => data.data)

        const enrichedComments = comments.map(comment => ({
            ...comment,
            user: users.find(user => user.id === comment.user_id),
        }))

        dispatch(fetchCommentsSuccess(enrichedComments))
    } catch (error: any) {
        dispatch(fetchCommentsFailure(error.response?.data?.message || 'Failed to load comments'))
    }
}

export const addComment = (postId: number, content: string, parentCommentId?: number) => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
        dispatch(addCommentRequest())
        const response = await commentService.createComment(postId, content, parentCommentId)
        const newComment: Comment = response.data


        const userResponse = await userService.getUserById(newComment.user_id.toString())
        const user: User = userResponse.data
        const enrichedComment = {
            ...newComment,
            user,
        }

        dispatch(addCommentSuccess(enrichedComment))
    } catch (error: any) {
        dispatch(addCommentFailure(error.response?.data?.message || 'Failed to add a comment'))
    }
}

export const updateComment = (commentId: number, content?: string, status?: 'active' | 'inactive') => async (dispatch: AppDispatch) => {
    try {
        dispatch(updateCommentRequest())
        const updateData: { content?: string, status?: 'active' | 'inactive' } = {}
        if (content !== undefined) updateData.content = content
        if (status !== undefined) updateData.status = status

        const response = await commentService.updateComment(commentId, updateData)
        const updatedComment: Comment = response.data

        const userResponse = await userService.getUserById(updatedComment.user_id.toString())
        const user: User = userResponse.data

        const enrichedComment = {
            ...updatedComment,
            user,
        }

        dispatch(updateCommentSuccess(enrichedComment))
    } catch (error: any) {
        dispatch(updateCommentFailure(error.response?.data?.message || 'Failed to update the comment'))
    }
}

export const deleteComment = (commentId: number) => async (dispatch: AppDispatch) => {
    try {
        dispatch(deleteCommentRequest())
        await commentService.deleteComment(commentId)
        dispatch(deleteCommentSuccess(commentId))
    } catch (error: any) {
        dispatch(deleteCommentFailure(error.response?.data?.message || 'Failed to delete comment'))
    }
}

export const likeComment = (commentId: number) => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
        await commentService.likeComment(commentId)
        const state = getState()
        const previousStatus = state.comments.likeStatuses[commentId]

        if (previousStatus === 'like') {
            await commentService.removeLike(commentId)
            dispatch(decrementLikes(commentId))
            dispatch(setLikeStatus({commentId, status: null}))
        } else if (previousStatus === 'dislike') {
            await commentService.removeLike(commentId)
            dispatch(decrementDislikes(commentId))
            await commentService.likeComment(commentId)
            dispatch(incrementLikes(commentId))
            dispatch(setLikeStatus({commentId, status: 'like'}))
        } else {
            dispatch(incrementLikes(commentId))
            dispatch(setLikeStatus({commentId, status: 'like'}))
        }
    } catch (error: any) {
        console.error('Didn\'t manage to put a like on it:', error)
    }
}

export const dislikeComment = (commentId: number) => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
        await commentService.dislikeComment(commentId)
        const state = getState()
        const previousStatus = state.comments.likeStatuses[commentId]

        if (previousStatus === 'dislike') {
            await commentService.removeLike(commentId)
            dispatch(decrementDislikes(commentId))
            dispatch(setLikeStatus({commentId, status: null}))
        } else if (previousStatus === 'like') {
            await commentService.removeLike(commentId)
            dispatch(decrementLikes(commentId))
            await commentService.dislikeComment(commentId)
            dispatch(incrementDislikes(commentId))
            dispatch(setLikeStatus({commentId, status: 'dislike'}))
        } else {
            dispatch(incrementDislikes(commentId))
            dispatch(setLikeStatus({commentId, status: 'dislike'}))
        }
    } catch (error: any) {
        console.error('Failed to disliked:', error)
    }
}

export const removeLikeFromComment = (commentId: number) => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
        await commentService.removeLike(commentId)
        const state = getState()
        const previousStatus = state.comments.likeStatuses[commentId]

        if (previousStatus === 'like') {
            dispatch(decrementLikes(commentId))
        } else if (previousStatus === 'dislike') {
            dispatch(decrementDislikes(commentId))
        }

        dispatch(setLikeStatus({commentId, status: null}))
    } catch (error: any) {
        console.error('Failed to delete the likes/dislikes:', error)
    }
}

export const fetchCommentLikeStatus = (commentId: number) => async (dispatch: AppDispatch) => {
    try {
        const response = await commentService.getLikeStatus(commentId)
        const status: 'like' | 'dislike' | null = response.data
        dispatch(setLikeStatus({commentId, status}))
    } catch (error: any) {
        console.error('Failed to fetch like status:', error)
    }
}