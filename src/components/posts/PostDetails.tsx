import React, {useEffect, useState} from 'react'
import {useParams, Link, useNavigate} from 'react-router-dom'
import {useSelector, useDispatch} from 'react-redux'
import {RootState, AppDispatch} from '../../store'
import postService from '../../services/postService'
import userService from '../../services/userService'
import categoryService from '../../services/categoryService'
import {Button} from '../ui/button'
import {Avatar, AvatarFallback, AvatarImage} from '../ui/avatar'
import {format} from 'date-fns'
import {Bookmark, BookmarkMinus} from 'lucide-react'
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
import {
    ThumbsUp,
    ThumbsDown,
    MessageSquare,
    Calendar,
    Star,
    ArrowLeft,
    FileText,
    ImageIcon,
    Trash2,
    Edit,
    EyeOff, Eye, StarOff
} from 'lucide-react'
import {Badge} from '../ui/badge'
import {Card, CardContent, CardFooter, CardHeader} from '../ui/card'
import {Skeleton} from '../ui/skeleton'
import DOMPurify from 'dompurify'
import UserRatingBadge from '../user/UserRatingBadge.tsx'
import {Alert, AlertTitle, AlertDescription} from '../ui/alert'
import {
    fetchLikeStatus,
    likePost,
    dislikePost,
    updatePost,
    addFavoritePost,
    removeFavoritePost
} from '../../actions/postActions'
import {Post, User, Category} from '../../types/Post'
import {Separator} from '../ui/separator'
import RatingDisplay from "@/components/posts/PostRatingDisplay.tsx";
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import 'highlight.js/styles/github-dark.css'

import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import cpp from 'highlight.js/lib/languages/cpp'
import ruby from 'highlight.js/lib/languages/ruby'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'
import sql from 'highlight.js/lib/languages/sql'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'
import css from 'highlight.js/lib/languages/css'
import markdown from 'highlight.js/lib/languages/markdown'
import {cn} from "@/lib/utils.ts";

import CommentList from '../comments/CommentList'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('java', java)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('ruby', ruby)
hljs.registerLanguage('go', go)
hljs.registerLanguage('rust', rust)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('json', json)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('css', css)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('markup', xml)


interface FileAttachment {
    file_name: string;
    file_url: string;
    file_type: string;
}

const PostDetails: React.FC = () => {
    const {postId} = useParams<{ postId: string }>()
    const dispatch = useDispatch<AppDispatch>()
    const authUser = useSelector((state: RootState) => state.auth.user)
    const navigate = useNavigate()


    const [post, setPost] = useState<Post | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [files, setFiles] = useState<FileAttachment[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const likeStatus = useSelector((state: RootState) => post ? state.posts.likeStatuses[post.id] : null)
    const [likeError, setLikeError] = useState<string | null>(null)
    const [localLikeCount, setLocalLikeCount] = useState<number>(0)
    const [localDislikeCount, setLocalDislikeCount] = useState<number>(0)
    const [localRating, setLocalRating] = useState<number>(0)
    const [categoriesLoaded, setCategoriesLoaded] = useState<boolean>(false)
    const [localIsFavorite, setLocalIsFavorite] = useState<boolean>(false)
    const [favoriteError, setFavoriteError] = useState<string | null>(null)

    useEffect(() => {
        const fetchPostDetails = async () => {
            try {
                setLoading(true)
                const postResponse = await postService.getPostById(Number(postId))
                const fetchedPost: Post = postResponse.data
                setLocalIsFavorite(fetchedPost.isFavourite || false)

                setPost(fetchedPost)
                setLocalLikeCount(fetchedPost.likes)
                setLocalDislikeCount(fetchedPost.dislikes)
                setLocalRating(fetchedPost.rating)

                const userResponse = await userService.getUserById(fetchedPost.user_id)
                const fetchedUser: User = userResponse.data
                setUser(fetchedUser)

                if (!categoriesLoaded) {
                    const categoriesPromises = fetchedPost.category_ids.map(id => categoryService.getCategoryById(id))
                    const categoriesResponses = await Promise.all(categoriesPromises)
                    const fetchedCategories: Category[] = categoriesResponses.map(res => res.data)
                    setCategories(fetchedCategories)
                    setCategoriesLoaded(true)
                }

                const filesResponse = await postService.getFileNamesByPostId(Number(postId))
                const fetchedFiles: FileAttachment[] = (filesResponse || []).map((file: any) => ({
                    ...file,
                    file_type: file.file_name.split('.').pop().toLowerCase() === 'pdf' ? 'application/pdf' : 'image/jpeg'
                }))
                setFiles(fetchedFiles)

                if (authUser) {
                    await dispatch(fetchLikeStatus(fetchedPost.id))
                }

                setLoading(false)
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to fetch post details')
                setLoading(false)
            }
        }

        if (postId) {
            fetchPostDetails()
        }
    }, [postId, authUser, dispatch, categoriesLoaded])

    const handleLike = async () => {
        if (!authUser || !post) return
        try {
            const prevStatus = likeStatus
            if (prevStatus === 'dislike') {
                setLocalDislikeCount(prev => prev - 1)
                setLocalRating(prev => prev + 4)
            } else if (prevStatus !== 'like') {
                setLocalRating(prev => prev + 2)
            } else {
                setLocalRating(prev => prev - 2)
            }

            if (prevStatus !== 'like') {
                setLocalLikeCount(prev => prev + 1)
            } else {
                setLocalLikeCount(prev => prev - 1)
            }

            await dispatch(likePost(post.id))
            setLikeError(null)
        } catch (err: any) {
            if (prevStatus === 'dislike') {
                setLocalDislikeCount(prev => prev + 1)
                setLocalRating(prev => prev - 4)
            } else if (prevStatus !== 'like') {
                setLocalRating(prev => prev - 2)
            } else {
                setLocalRating(prev => prev + 2)
            }

            if (prevStatus !== 'like') {
                setLocalLikeCount(prev => prev - 1)
            } else {
                setLocalLikeCount(prev => prev + 1)
            }
            setLikeError(err.response?.data?.message || 'Failed to like the post')
        }
    }

    const handleDislike = async () => {
        if (!authUser || !post) return
        try {
            const prevStatus = likeStatus
            if (prevStatus === 'like') {
                setLocalLikeCount(prev => prev - 1)
                setLocalRating(prev => prev - 4)
            } else if (prevStatus !== 'dislike') {
                setLocalRating(prev => prev - 2)
            } else {
                setLocalRating(prev => prev + 2)
            }

            if (prevStatus !== 'dislike') {
                setLocalDislikeCount(prev => prev + 1)
            } else {
                setLocalDislikeCount(prev => prev - 1)
            }

            await dispatch(dislikePost(post.id))
            setLikeError(null)
        } catch (err: any) {
            if (prevStatus === 'like') {
                setLocalLikeCount(prev => prev + 1)
                setLocalRating(prev => prev + 4)
            } else if (prevStatus !== 'dislike') {
                setLocalRating(prev => prev + 2)
            } else {
                setLocalRating(prev => prev - 2)
            }

            if (prevStatus !== 'dislike') {
                setLocalDislikeCount(prev => prev - 1)
            } else {
                setLocalDislikeCount(prev => prev + 1)
            }
            setLikeError(err.response?.data?.message || 'Failed to dislike the post')
        }
    }

    const handleAddToFavorites = async () => {
        if (!authUser || !post) return
        try {
            setLocalIsFavorite(true)
            await dispatch(addFavoritePost(authUser.id.toString(), post.id.toString()))
            setFavoriteError(null)
        } catch (err: any) {
            setLocalIsFavorite(false)
            setFavoriteError(err.response?.data?.message || 'Failed to add to favorites')
        }
    }

    const handleRemoveFromFavorites = async () => {
        if (!authUser || !post) return
        try {
            setLocalIsFavorite(false)
            await dispatch(removeFavoritePost(authUser.id.toString(), post.id.toString()))
            setFavoriteError(null)
        } catch (err: any) {
            setLocalIsFavorite(true)
            setFavoriteError(err.response?.data?.message || 'Failed to remove from favorites')
        }
    }
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)


    const handleDelete = async () => {
        if (!post) return
        try {
            await postService.deletePost(post.id)
            navigate('/posts')
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete the post')
        }
    }

    const handleToggleStatus = async () => {
        if (!post) return
        const newStatus = post.status === 'active' ? 'inactive' : 'active'

        if (newStatus === 'active' && post.status === 'inactive' && authUser?.role !== 'admin') {
            alert('Only admins can set inactive posts to active.')
            return
        }

        try {
            await dispatch(updatePost(post.id, {status: newStatus}))
            setPost(prev => prev ? {...prev, status: newStatus} : prev)
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update post status')
        }
    }

    const renderPostContent = (htmlContent: string): JSX.Element => {
        const cleanHTML = DOMPurify.sanitize(htmlContent, {
            ALLOWED_TAGS: [
                'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'p', 'br', 'h1',
                'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'blockquote', 'code', 'pre',
                'table', 'thead', 'tbody', 'tr', 'th', 'td', 'colgroup', 'col', 'span'
            ],
            ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title', 'style', 'border', 'cellpadding', 'cellspacing', 'width', 'height', 'class', 'data-language']
        })

        const modifiedHTML = cleanHTML.replace(/<h1/g, '<h2').replace(/<\/h1>/g, '</h2>')

        return (
            <div
                className="prose prose-lg max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{__html: modifiedHTML}}
                ref={(el) => {
                    if (el) {
                        el.querySelectorAll('pre code').forEach((block) => {
                            hljs.highlightElement(block as HTMLElement)
                        })
                    }
                }}
            />
        )
    }

    useEffect(() => {
        if (post) {
            const codeBlocks = document.querySelectorAll('pre code')
            codeBlocks.forEach((block) => {
                hljs.highlightElement(block as HTMLElement)
            })
        }
    }, [post?.content])

    if (loading) {
        return <PostSkeleton/>
    }

    if (error || !post) {
        return (
            <Card className="max-w-4xl mx-auto mt-8">
                <CardContent className="pt-6 text-center">
                    <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            {error || 'Post not found'}
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        )
    }

    const isAuthor = authUser?.id === post.user_id
    const isAdmin = authUser?.role === 'admin';

    return (
        <div className="container mx-auto px-4 py-10">
            <Card className="max-w-4xl mx-auto overflow-hidden">
                <CardHeader className="space-y-4 bg-gradient-to-r from-primary/10 to-secondary/10 p-6">
                    <Link key={user.id} to={`/users/${user.id}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <Avatar
                                        className="h-12 w-12 ring-2 ring-primary/10 group-hover:ring-primary/20 transition-all">
                                        <AvatarImage src={user?.profile_picture_url} alt={user?.login}/>
                                        <AvatarFallback>
                                            {user?.login.charAt(0).toUpperCase() || '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-1 -right-1 translate-x-1 translate-y-1">
                                        <UserRatingBadge rating={user?.rating || 0}/>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <span className="font-semibold text-2xl">{user?.login}</span>
                                    </div>
                                    <div
                                        className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span>{user.full_name}</span>
                                    </div>
                                </div>
                            </div>
                            <RatingDisplay localRating={localRating}/>
                        </div>
                    </Link>
                    <h1 className="text-3xl sm:text-4xl font-bold">{post.title}</h1>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(category => (
                            <Link key={category.id} to={`/categories/${category.id}`}>
                                <Badge key={category.id} variant="secondary" className="text-xs">
                                    {category.title}
                                </Badge>
                            </Link>
                        ))}
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    {renderPostContent(post.content)}

                    {files.length > 0 && (
                        <div className="mt-6">
                            <h2 className="text-2xl font-semibold mb-4">Attachments</h2>
                            <div className="grid grid-cols-1 gap-4">
                                {files.map((file, index) => (
                                    <div key={index} className="w-full group">
                                        {file.file_type.startsWith('image/') ? (
                                            <div
                                                className="w-full cursor-pointer overflow-hidden rounded-lg shadow-lg"
                                                onClick={() => window.open(file.file_url, '_blank')}
                                            >
                                                <img
                                                    src={file.file_url}
                                                    alt="Attachment"
                                                    className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
                                                />
                                            </div>
                                        ) : file.file_type === 'application/pdf' ? (
                                            <div
                                                className="w-full bg-red-50 rounded-lg overflow-hidden shadow-md cursor-pointer hover:bg-red-100 transition-colors"
                                                onClick={() => window.open(file.file_url, '_blank')}
                                            >
                                                <div className="flex items-center p-4">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="48"
                                                        height="48"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        className="text-red-600 mr-4"
                                                    >
                                                        <path
                                                            d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                                                        <polyline points="14 2 14 8 20 8"/>
                                                        <path d="M10 12v6"/>
                                                        <path d="M8 15h4"/>
                                                        <path d="M16 12v6"/>
                                                    </svg>
                                                    <span
                                                        className="text-red-800 font-medium text-lg">Open PDF Document</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                className="w-full bg-gray-50 rounded-lg overflow-hidden shadow-md cursor-pointer hover:bg-gray-100 transition-colors"
                                                onClick={() => window.open(file.file_url, '_blank')}
                                            >
                                                <div className="flex items-center p-4">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="48"
                                                        height="48"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        className="text-gray-600 mr-4"
                                                    >
                                                        <path
                                                            d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                                                        <polyline points="14 2 14 8 20 8"/>
                                                    </svg>
                                                    <span className="text-gray-800 font-medium text-lg">Open File</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
                <Separator/>
                <CardFooter className="flex flex-col space-y-4 p-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-start">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={likeStatus === 'like' ? 'default' : 'outline'}
                                    onClick={handleLike}
                                    disabled={isAuthor || !authUser}
                                    className="flex items-center gap-2"
                                >
                                    <ThumbsUp
                                        className={`w-4 h-4 ${likeStatus === 'like' ? 'text-white' : 'text-primary'}`}/>
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
                            {!authUser && (
                                <Link to="/login" className="ml-2">
                                    <Button variant="secondary" size="sm">Log in to like/dislike</Button>
                                </Link>
                            )}
                            {authUser && (
                                <Button
                                    variant="outline"
                                    onClick={localIsFavorite ? handleRemoveFromFavorites : handleAddToFavorites}
                                    className={cn(
                                        "p-2 rounded-full transition-all duration-200",
                                        localIsFavorite ? "bg-primary/10" : "hover:bg-primary/10"
                                    )}
                                    title={localIsFavorite ? "Remove from Favorites" : "Add to Favorites"}
                                >
                                    <Bookmark className={`w-5 h-5 ${
                                        localIsFavorite
                                            ? "text-orange-500 fill-orange-500"
                                            : "text-muted-foreground group-hover:text-primary"
                                    }`}/>
                                </Button>
                            )}
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            {isAuthor && (
                                <Link to={`/posts/${post.id}/edit`}>
                                    <Button variant="outline" className="flex items-center gap-2">
                                        <Edit className="w-4 h-4"/>
                                        Edit
                                    </Button>
                                </Link>
                            )}
                            {(isAuthor || isAdmin) && (
                                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                    <Button
                                        variant="destructive"
                                        className="flex items-center gap-2"
                                        onClick={() => setIsDeleteDialogOpen(true)}
                                    >
                                        <Trash2 className="w-4 h-4"/>
                                        Delete
                                    </Button>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the post.
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
                            )}
                            {(isAuthor || isAdmin) && (
                                <Button
                                    variant={post.status === 'active' ? 'destructive' : 'outline'}
                                    className="flex items-center gap-2"
                                    onClick={handleToggleStatus}
                                    disabled={post.status === 'inactive' && !isAdmin}
                                >
                                    {post.status === 'active' ? (
                                        <>
                                            <EyeOff className="w-4 h-4"/>
                                            Deactivate
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="w-4 h-4"/>
                                            {isAdmin ? 'Activate' : 'Cannot Activate'}
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>

                    {likeError && (
                        <Alert variant="destructive" className="w-full mt-2">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{likeError}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-between w-full mt-2">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2 sm:mb-0">
                            <Calendar className="w-4 h-4"/>
                            <span>{format(new Date(post.created_at), 'PPP')}</span>
                        </div>
                        <Badge
                            variant={post.status === 'active' ? 'success' : 'destructive'}
                            className="text-xs sm:text-sm"
                        >
                            {post.status.toUpperCase()}
                        </Badge>
                    </div>
                </CardFooter>
            </Card>
            <div className="mt-8 max-w-4xl mx-auto">
                <CommentList postId={post.id} post={post}/>
            </div>
        </div>
    )
}

const PostSkeleton: React.FC = () => (
    <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
            <CardHeader className="space-y-4 bg-gradient-to-r from-primary/10 to-secondary/10 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-16 w-16 rounded-full"/>
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-40"/>
                            <Skeleton className="h-4 w-24"/>
                        </div>
                    </div>
                    <Skeleton className="h-8 w-16 rounded-full"/>
                </div>
                <Skeleton className="h-10 w-3/4 mb-4"/>
                <div className="flex flex-wrap gap-2 mb-4">
                    <Skeleton className="h-6 w-20"/>
                    <Skeleton className="h-6 w-20"/>
                    <Skeleton className="h-6 w-20"/>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <Skeleton className="h-4 w-full mb-2"/>
                <Skeleton className="h-4 w-full mb-2"/>
                <Skeleton className="h-4 w-5/6 mb-2"/>
                <Skeleton className="h-4 w-full mb-2"/>
                <Skeleton className="h-4 w-5/6"/>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-9 w-24"/>
                    <Skeleton className="h-9 w-24"/>
                </div>
                <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-20"/>
                </div>
            </CardFooter>
        </Card>
    </div>
)

export default PostDetails

