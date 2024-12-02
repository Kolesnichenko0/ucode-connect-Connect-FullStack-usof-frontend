import React, {useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {RootState, AppDispatch} from '../../store'
import {likeComment, dislikeComment, updateComment, deleteComment} from '../../actions/commentActions'
import {fetchCommentLikeStatus} from "@/actions/commentActions.ts"
import {Avatar, AvatarFallback, AvatarImage} from '../ui/avatar'
import {Button} from '../ui/button'
import {ThumbsUp, ThumbsDown, Edit, Trash2, Eye, EyeOff} from 'lucide-react'
import {format} from 'date-fns'
import {Alert, AlertTitle, AlertDescription} from '../ui/alert'
import UserRatingBadge from "@/components/user/UserRatingBadge.tsx";
import RatingDisplay from "@/components/posts/PostRatingDisplay.tsx";
import {Comment} from '../../types/Comment'
import CommentForm from "@/components/comments/CommentForm.tsx";
import {Link} from "react-router-dom";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction
} from '../ui/alert-dialog'


interface CommentItemProps {
    comment: Comment
    post: { status: string }
    isReply?: boolean
}

const CommentItem: React.FC<CommentItemProps> = ({comment, post, isReply = false}) => {
    const dispatch = useDispatch<AppDispatch>()
    const authUser = useSelector((state: RootState) => state.auth.user)
    const [localLikeCount, setLocalLikeCount] = useState<number>(comment.likes)
    const [localDislikeCount, setLocalDislikeCount] = useState<number>(comment.dislikes)
    const [localRating, setLocalRating] = useState<number>(comment.rating)
    const likeStatus = useSelector((state: RootState) => state.comments.likeStatuses[comment.id])
    const [isReplying, setIsReplying] = useState<boolean>(false)
    const [isEditing, setIsEditing] = useState<boolean>(false)
    const [editContent, setEditContent] = useState<string>(comment.content)
    const [error, setError] = useState<string | null>(null)


    useEffect(() => {
        if (authUser) {
            dispatch(fetchCommentLikeStatus(comment.id))
        }
    }, [authUser, comment.id, dispatch])

    const isAuthor = authUser?.id === comment.user_id
    const isAdmin = authUser?.role === 'admin'
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)

    const handleLike = async () => {
        if (!authUser) return
        try {
            const prevStatus = likeStatus
            // Optimistic UI update
            if (prevStatus === 'dislike') {
                setLocalDislikeCount(prev => prev - 1)
                setLocalRating(prev => prev + 2)
            } else if (prevStatus !== 'like') {
                setLocalRating(prev => prev + 1)
            } else {
                setLocalRating(prev => prev - 1)
            }

            if (prevStatus !== 'like') {
                setLocalLikeCount(prev => prev + 1)
            } else {
                setLocalLikeCount(prev => prev - 1)
            }

            await dispatch(likeComment(comment.id))
            setError(null)
        } catch (err: any) {
            // Revert changes in case of error
            if (prevStatus === 'dislike') {
                setLocalDislikeCount(prev => prev + 1)
                setLocalRating(prev => prev - 2)
            } else if (prevStatus !== 'like') {
                setLocalRating(prev => prev - 1)
            } else {
                setLocalRating(prev => prev + 1)
            }

            if (prevStatus !== 'like') {
                setLocalLikeCount(prev => prev - 1)
            } else {
                setLocalLikeCount(prev => prev + 1)
            }
            setError(err.response?.data?.message || 'Failed to like the comment')
        }
    }

    const handleDislike = async () => {
        if (!authUser) return
        try {
            const prevStatus = likeStatus
            // Optimistic UI update
            if (prevStatus === 'like') {
                setLocalLikeCount(prev => prev - 1)
                setLocalRating(prev => prev - 2)
            } else if (prevStatus !== 'dislike') {
                setLocalRating(prev => prev - 1)
            } else {
                setLocalRating(prev => prev + 1)
            }

            if (prevStatus !== 'dislike') {
                setLocalDislikeCount(prev => prev + 1)
            } else {
                setLocalDislikeCount(prev => prev - 1)
            }

            await dispatch(dislikeComment(comment.id))
            setError(null)
        } catch (err: any) {
            // Revert changes in case of error
            if (prevStatus === 'like') {
                setLocalLikeCount(prev => prev + 1)
                setLocalRating(prev => prev + 2)
            } else if (prevStatus !== 'dislike') {
                setLocalRating(prev => prev + 1)
            } else {
                setLocalRating(prev => prev - 1)
            }

            if (prevStatus !== 'dislike') {
                setLocalDislikeCount(prev => prev - 1)
            } else {
                setLocalDislikeCount(prev => prev + 1)
            }
            setError(err.response?.data?.message || 'Failed to dislike the comment')
        }
    }


    const handleEdit = async () => {
        if (!editContent.trim()) {
            setError('Content cannot be empty.')
            return
        }
        try {
            await dispatch(updateComment(comment.id, editContent))
            setIsEditing(false)
            setError(null)
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update the comment.')
        }
    }

    const handleDelete = async () => {
        try {
            await dispatch(deleteComment(comment.id))
            setIsDeleteDialogOpen(false)
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete the comment.')
        }
    }

    const handleToggleStatus = async () => {
        const newStatus = comment.status === 'active' ? 'inactive' : 'active'
        try {
            await dispatch(updateComment(comment.id, undefined, newStatus))
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update comment status.')
        }
    }

    return (
        <div
            className={`flex ${isReply ? 'flex-row items-start' : 'flex-row items-center'} gap-4 ${comment.status === 'inactive' ? 'opacity-50' : ''}`}>
            <div className="sticky top-4 self-start">
                <Link key={comment.user?.id} to={`/users/${comment.user?.id}`}>
                    <div className="relative">
                        <Avatar className="h-12 w-12 ring-2 ring-primary/10 group-hover:ring-primary/20 transition-all">
                            <AvatarImage src={comment.user?.profile_picture_url} alt={comment.user?.login}/>
                            <AvatarFallback>
                                {comment.user?.login.charAt(0).toUpperCase() || '?'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 translate-x-1 translate-y-1">
                            <UserRatingBadge rating={comment.user?.rating || 0}/>
                        </div>
                    </div>
                </Link>
            </div>
            <div className="flex-grow">
                <div className="flex items-center justify-between">
                    <div>
                        <Link key={comment.user?.id} to={`/users/${comment.user?.id}`}>
                            <span className="font-semibold">{comment.user?.login}</span>
                        </Link>
                        <span className="text-sm text-muted-foreground ml-2">
                            {format(new Date(comment.created_at), 'PPP')}
                            {comment.created_at !== comment.updated_at && (
                                <span
                                    className="ml-1 text-xs text-muted-foreground"
                                    title={`Updated on ${format(new Date(comment.updated_at), 'PPP')}`}
                                >
            (edited)
                                </span>
                            )}
                        </span>
                    </div>
                    <RatingDisplay localRating={localRating}/>
                </div>
                {!isEditing ? (
                    <p className="mt-2 text-base">{comment.content}</p>
                ) : (
                    <div className="mt-2">
                        <textarea
                            className="w-full p-2 border rounded"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={3}
                        />
                        {error && (
                            <Alert variant="destructive" className="mt-2">
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div className="mt-2 flex gap-2">
                            <Button onClick={handleEdit} variant="primary">Save</Button>
                            <Button onClick={() => {
                                setIsEditing(false);
                                setEditContent(comment.content);
                                setError(null)
                            }} variant="ghost">Cancel</Button>
                        </div>
                    </div>
                )}
                <div className="mt-2 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Button
                            variant={likeStatus === 'like' ? 'default' : 'outline'}
                            onClick={handleLike}
                            disabled={isAuthor || !authUser}
                            className="flex items-center gap-2"
                        >
                            <ThumbsUp className={`w-4 h-4 ${likeStatus === 'like' ? 'text-white' : 'text-primary'}`}/>
                            <span>{localLikeCount}</span>
                        </Button>
                        <Button
                            variant={likeStatus === 'dislike' ? 'destructive' : 'outline'}
                            onClick={handleDislike}
                            disabled={isAuthor || !authUser}
                            className="flex items-center gap-2"
                        >
                            <ThumbsDown
                                className={`w-4 h-4 ${likeStatus === 'dislike' ? 'text-white' : 'text-destructive'}`}/>
                            <span>{localDislikeCount}</span>
                        </Button>
                    </div>
                    {authUser && comment.status === 'active' && comment.parent_comment_id === null && (
                        <Button variant="ghost" size="sm" onClick={() => setIsReplying(!isReplying)}>
                            Reply
                        </Button>
                    )}
                    {(isAuthor || isAdmin) && (
                        <>
                            {(isAuthor) && (
                                <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
                                    <Edit className="w-4 h-4 mr-1"/> Edit
                                </Button>
                            )}
                            <Button
                                variant={comment.status === 'active' ? 'destructive' : 'ghost'}
                                size="sm"
                                onClick={handleToggleStatus}
                                disabled={comment.status === 'inactive' && !isAdmin}
                            >
                                {comment.status === 'active' ? (
                                    <>
                                        <EyeOff className="w-4 h-4 mr-1"/>
                                        Deactivate
                                    </>
                                ) : (
                                    <>
                                        <Eye className="w-4 h-4 mr-1"/>
                                        {isAdmin ? 'Activate' : 'Cannot Activate'}
                                    </>
                                )}
                            </Button>
                            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setIsDeleteDialogOpen(true)}
                                >
                                    <Trash2 className="w-4 h-4 mr-1"/> Delete
                                </Button>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the comment.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            onClick={handleDelete}
                                        >
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </>
                    )}
                </div>
                {isReplying && post.status === 'active' && (
                    <div className="mt-4">
                        <CommentForm postId={comment.post_id} parentCommentId={comment.id}
                                     onCancel={() => setIsReplying(false)}/>
                    </div>
                )}
                {error && (
                    <Alert variant="destructive" className="mt-2">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
            </div>
        </div>
    )
}

export default CommentItem

