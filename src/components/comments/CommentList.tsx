import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {fetchComments} from '../../actions/commentActions';
import {RootState, AppDispatch} from '../../store';
import CommentItem from './CommentItem';
import {Comment} from '../../types/Comment';
import CommentForm from "@/components/comments/CommentForm.tsx";
import {Link} from "react-router-dom";
import {Button} from "@/components/ui/button.tsx";
import {MessageSquare} from 'lucide-react';
import {Card, CardContent, CardHeader} from '../ui/card';
import {Separator} from '../ui/separator';

interface CommentListProps {
    postId: number;
    post: { status: string };
}

const CommentList: React.FC<CommentListProps> = ({postId, post}) => {
    const dispatch = useDispatch<AppDispatch>();
    const {comments, loading, error} = useSelector((state: RootState) => state.comments);
    const authUser = useSelector((state: RootState) => state.auth.user);

    const [visibleCount, setVisibleCount] = useState(10);

    useEffect(() => {
        dispatch(fetchComments(postId));
    }, [dispatch, postId]);

    const mainComments = comments.filter(comment => comment.parent_comment_id === null);
    const replies = comments.filter(comment => comment.parent_comment_id !== null);

    const getReplies = (parentId: number) => {
        return replies.filter(reply => reply.parent_comment_id === parentId);
    };

    const loadMoreComments = () => {
        setVisibleCount(prevCount => prevCount + 10);
    };

    if (loading) {
        return <CommentListSkeleton/>;
    }

    if (error) {
        return (
            <Card className="max-w-4xl mx-auto mt-8">
                <CardContent className="pt-6 text-center text-destructive">
                    Error loading comments: {error}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader
                className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 flex flex-row items-center justify-between">
                <div className="flex items-center space-x-3">
                    <MessageSquare className="w-6 h-6 text-primary"/>
                    <h2 className="text-2xl font-semibold">Comments</h2>
                </div>
            </CardHeader>

            <Separator/>

            <CardContent className="p-6">
                {post.status !== 'active' && (
                    <div className="text-center text-muted-foreground py-8 border rounded-lg mb-6">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground"/>
                        <p className="text-lg">This post is inactive. Commenting is disabled.</p>
                    </div>
                )}
                {authUser && post.status === 'active' && <CommentForm postId={postId}/>}
                {!authUser && (
                    <div className="mb-6">
                        <Link to="/login">
                            <Button variant="secondary" size="sm">Log in to comment</Button>
                        </Link>
                    </div>
                )}

                <div className="mt-6">
                    {mainComments.length === 0 ? (
                        post.status === 'active' ? (
                            <div className="text-center text-muted-foreground py-8 border rounded-lg">
                                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground"/>
                                <p className="text-lg">No comments yet. Be the first to comment!</p>
                            </div>
                        ) : null
                    ) : (
                        mainComments.slice(0, visibleCount).map((comment: Comment) => (
                            <div key={comment.id} className="mb-4 space-y-2">
                                <CommentItem comment={comment} post={post}/>
                                <div className="ml-8 mt-2 space-y-2">
                                    {getReplies(comment.id).map(reply => (
                                        <CommentItem key={reply.id} comment={reply} post={post} isReply/>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {visibleCount < mainComments.length && (
                    <div className="text-center mt-4 relative overflow-hidden">
                        <div
                            className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                        <Button
                            onClick={loadMoreComments}
                            variant="outline"
                            className="relative z-10 px-6 py-2 rounded-full bg-background text-primary border-primary/20 hover:bg-primary/5 transition-all duration-300 ease-in-out shadow-sm hover:shadow-md"
                        >
                            Load more comments
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const CommentListSkeleton: React.FC = () => (
    <Card className="max-w-4xl mx-auto">
        <CardHeader
            className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 flex flex-row items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-muted-foreground/20 rounded-full animate-pulse"/>
                <div className="h-8 w-48 bg-muted-foreground/20 rounded animate-pulse"/>
            </div>
        </CardHeader>

        <Separator/>

        <CardContent className="p-6">
            <div className="space-y-4">
                {[1, 2, 3].map(item => (
                    <div key={item} className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-muted-foreground/20 rounded-full animate-pulse"/>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-1/2 bg-muted-foreground/20 rounded animate-pulse"/>
                            <div className="h-4 w-full bg-muted-foreground/20 rounded animate-pulse"/>
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
);

export default CommentList;
