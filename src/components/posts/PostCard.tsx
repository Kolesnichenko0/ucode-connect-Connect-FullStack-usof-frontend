import React from 'react'
import {Link} from 'react-router-dom'
import {Post} from '../../types/Post'
import {Avatar, AvatarFallback, AvatarImage} from '../ui/avatar'
import {Badge} from "../ui/badge.tsx"
import {Star, ChevronRight} from 'lucide-react'
import {format} from 'date-fns'
import DOMPurify from 'dompurify'
import parse from 'html-react-parser'

interface PostCardProps {
    post: Post
    isGridView: boolean
}

const PostCard: React.FC<PostCardProps> = ({post, isGridView}) => {
    const renderPostContentPreview = (htmlContent: string): JSX.Element => {
        const cleanHTML = DOMPurify.sanitize(htmlContent, {
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
            ALLOWED_ATTR: ['href', 'target', 'rel']
        })
        const parsedContent = parse(cleanHTML)

        return <div>{parsedContent}</div>
    }

    return (
        <Link to={`/posts/${post.id}`}
              className={`group block transition-all duration-200 ${isGridView ? 'bg-card hover:bg-accent rounded-xl shadow-sm hover:shadow-lg' : 'bg-card hover:bg-accent rounded-lg shadow-sm hover:shadow-md'} relative`}>
            <div className={`p-6 ${!isGridView && 'flex flex-col h-full'}`}>
                {/* Header: User Info */}
                <div className="flex items-center gap-4 mb-4">
                    <Avatar
                        className="h-10 w-10 ring-2 ring-primary/10 group-hover:ring-primary/20 transition-all">
                        <AvatarImage src={post.user?.profile_picture_url} alt={post.user?.login}/>
                        <AvatarFallback>
                            {post.user?.login.charAt(0).toUpperCase() || '?'}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">{post.user?.login}</span>
                            <span
                                className="text-sm text-muted-foreground">• {format(new Date(post.created_at), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500"/>
                            <span>{post.user?.rating}</span>
                        </div>
                    </div>
                </div>
                {/* Title */}
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                </h3>
                {/* Content Preview */}
                <div className="text-muted-foreground mb-4">
                    {renderPostContentPreview(post.content)}
                </div>
                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {post.categories?.map(category => (
                        <Badge key={category.id} className="bg-primary/10 text-primary">
                            {category.title}
                        </Badge>
                    ))}
                </div>
                {/* Footer: Likes/Dislikes/Rating */}
                <div className="flex items-center gap-4 mt-auto">
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-green-500"/>
                        <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-red-500"/>
                        <span>{post.dislikes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500"/>
                        <span>{post.rating}</span>
                    </div>
                </div>
            </div>
            {/* Chevron Icon */}
            <div className="absolute top-4 right-4 flex items-center">
                <ChevronRight
                    className="w-5 h-5 text-primary group-hover:text-secondary transition-colors"/>
            </div>
        </Link>
    )
}

export default PostCard
