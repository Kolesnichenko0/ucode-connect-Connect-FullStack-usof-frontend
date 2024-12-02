import React, {useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {addComment} from '../../actions/commentActions'
import {RootState, AppDispatch} from '../../store'
import {Button} from '../ui/button'
import {Textarea} from '../ui/textarea'
import {Alert, AlertTitle, AlertDescription} from '../ui/alert'

interface CommentFormProps {
    postId: number
    parentCommentId?: number
    onCancel?: () => void
}

const CommentForm: React.FC<CommentFormProps> = ({postId, parentCommentId = null, onCancel}) => {
    const dispatch = useDispatch<AppDispatch>()
    const authUser = useSelector((state: RootState) => state.auth.user)
    const {addingComment, addCommentError} = useSelector((state: RootState) => state.comments)
    const [content, setContent] = useState<string>('')
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) {
            setError('Comment content cannot be empty.')
            return
        }
        try {
            await dispatch(addComment(postId, content, parentCommentId))
            setContent('')
            setError(null)
            if (onCancel) onCancel()
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add comment.')
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mb-6">
            <div className="flex flex-col gap-2">
                <Textarea
                    placeholder="Write your comment..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                />
                {error && (
                    <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {addCommentError && (
                    <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{addCommentError}</AlertDescription>
                    </Alert>
                )}
                <div className="flex items-center gap-2">
                    <Button type="submit" disabled={addingComment}>
                        {addingComment ? 'Posting...' : 'Post Comment'}
                    </Button>
                    {onCancel && (
                        <Button type="button" variant="ghost" onClick={onCancel}>
                            Cancel
                        </Button>
                    )}
                </div>
            </div>
        </form>
    )
}

export default CommentForm
