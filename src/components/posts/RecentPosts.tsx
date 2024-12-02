import {useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {Link} from 'react-router-dom'
import {RootState, AppDispatch} from '@/store.ts'
import {fetchPosts, applyPostSort, changePostPage, applyPostFilters} from '@/actions/postActions.ts'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar.tsx'
import {Badge} from '@/components/ui/badge.tsx'
import {Card, CardContent} from '@/components/ui/card.tsx'
import UserRatingBadge from '@/components/user/UserRatingBadge.tsx'
import RatingDisplay from '@/components/posts/PostRatingDisplay.tsx'
import {Calendar, ChevronRight} from 'lucide-react'
import {format} from 'date-fns'
import DOMPurify from 'dompurify'
import parse from 'html-react-parser'

export default function RecentPosts() {
    const dispatch = useDispatch<AppDispatch>()
    const {posts, loading, error} = useSelector((state: RootState) => state.posts)

    useEffect(() => {
        dispatch(applyPostSort({sortBy: 'created_at', order: 'DESC'}, 'all'))
        dispatch(changePostPage(1, 'all'))
        dispatch(applyPostFilters({
            searchTitle: '',
            categoryFilters: [],
            startDate: '',
            endDate: '',
            statusFilter: 'active'
        }, 'all'))
        dispatch(fetchPosts())
    }, [dispatch])

    const renderPostContentPreview = (htmlContent: string): JSX.Element => {
        const cleanHTML = DOMPurify.sanitize(htmlContent, {
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
            ALLOWED_ATTR: ['href', 'target', 'rel']
        })
        const parsedContent = parse(cleanHTML)

        return <div className="line-clamp-3">{parsedContent}</div>
    }

    if (loading) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div className="text-red-500">Error loading recent posts: {error}</div>
    }

    return (
        <div className="space-y-4">
            {posts.slice(0, 5).map((post) => (
                <Link key={post.id} to={`/posts/${post.id}`}>
                    <Card className="hover:bg-accent transition-colors">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Avatar
                                        className="h-12 w-12 ring-2 ring-primary/10 group-hover:ring-primary/20 transition-all">
                                        <AvatarImage src={post.user?.profile_picture_url} alt={post.user?.login}/>
                                        <AvatarFallback>
                                            {post.user?.login.charAt(0).toUpperCase() || '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-1 -right-1 translate-x-1 translate-y-1">
                                        <UserRatingBadge rating={post.user?.rating || 0}/>
                                    </div>
                                </div>
                                <div>
                                    <span className="font-semibold">{post.user?.login}</span>
                                    <div
                                        className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span>{post.user?.full_name}</span>
                                    </div>
                                </div>
                                <div className="flex-grow">
                                    <h3 className="font-semibold line-clamp-1">{post.title}</h3>
                                    <div className="text-muted-foreground text-sm mb-2">
                                        {renderPostContentPreview(post.content)}
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {post.categories?.slice(0, 3).map(category => (
                                            <Badge key={category.id} variant="secondary">
                                                {category.title}
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <RatingDisplay localRating={post.rating}/>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4"/>
                                            <span>{format(new Date(post.created_at), 'MMM d, yyyy')}</span>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-primary flex-shrink-0"/>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    )
}

