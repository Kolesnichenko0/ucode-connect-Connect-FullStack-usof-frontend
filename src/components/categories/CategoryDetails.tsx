import React, {ChangeEvent, useEffect, useState, useMemo} from 'react'
import {useParams, Link, useNavigate} from 'react-router-dom'
import {useSelector, useDispatch} from 'react-redux'
import {RootState, AppDispatch} from '../../store'
import {getCategoryById, deleteCategory, updateCategory} from '../../actions/categoryActions'
import {fetchPosts, applyPostFilters, applyPostSort, changePostPage} from '../../actions/postActions'
import {Button} from '../ui/button'
import {Input} from '../ui/input'
import {Alert, AlertDescription} from '../ui/alert'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"
import {
    ArrowLeft,
    Calendar,
    Folder,
    MessageSquare,
    Pencil,
    Trash2,
    X,
    Save,
    ChevronRight,
    ChevronLeft,
    ChevronsLeft,
    ChevronsRight,
    LayoutGrid,
    List,
    Search,
    RefreshCw
} from 'lucide-react'
import {format, addDays} from 'date-fns'
import debounce from 'lodash.debounce'
import {Avatar, AvatarFallback, AvatarImage} from '../ui/avatar'
import {Badge} from "../ui/badge"
import {Card, CardContent} from '../ui/card'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../ui/select'
import DOMPurify from 'dompurify'
import parse from 'html-react-parser'
import UserRatingBadge from "@/components/user/UserRatingBadge.tsx"
import RatingDisplay from "@/components/posts/PostRatingDisplay"
import {Post} from '../../types/Post'

const CategoryDetails: React.FC = () => {
    const {categoryId} = useParams<{ categoryId: string }>()
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()
    const {currentCategory, loading, error} = useSelector((state: RootState) => state.categories)
    const {
        posts,
        loading: postsLoading,
        error: postsError,
        currentPage,
        totalPages,
        found,
        total,
        searchTitle,
        startDate,
        endDate,
        sortBy,
        order
    } = useSelector((state: RootState) => state.posts)

    const [isEditing, setIsEditing] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [editTitle, setEditTitle] = useState('')
    const [editDescription, setEditDescription] = useState('')
    const [editError, setEditError] = useState('')
    const [deleteError, setDeleteError] = useState('')
    const [localSearch, setLocalSearch] = useState<string>(searchTitle)
    const [filterStartDate, setFilterStartDate] = useState<string>(startDate || '')
    const [filterEndDate, setFilterEndDate] = useState<string>(endDate || '')
    const [isGridView, setIsGridView] = useState<boolean>(true)
    const authUser = useSelector((state: RootState) => state.auth.user)
    const isAdmin = authUser?.role === 'admin'


    useEffect(() => {
        if (categoryId) {
            dispatch(getCategoryById(categoryId))
            dispatch(applyPostFilters({categoryFilters: [parseInt(categoryId, 10), parseInt(categoryId, 10)]}, 'all'))
            dispatch(fetchPosts())
        }
    }, [dispatch, categoryId])

    useEffect(() => {
        if (currentCategory) {
            setEditTitle(currentCategory.title)
            setEditDescription(currentCategory.description)
        }
    }, [currentCategory])

    const debouncedSearch = useMemo(() => debounce((value: string) => {
        dispatch(applyPostFilters({searchTitle: value}, 'all'))
    }, 500), [dispatch])

    const debouncedDateFilter = useMemo(() => debounce((startDate: string, endDate: string) => {
        const adjustedEndDate = endDate ? format(addDays(new Date(endDate), 1), 'yyyy-MM-dd') : endDate
        dispatch(applyPostFilters({startDate, endDate: adjustedEndDate}, 'all'))
    }, 500), [dispatch])

    useEffect(() => {
        return () => {
            debouncedSearch.cancel()
            debouncedDateFilter.cancel()
        }
    }, [debouncedSearch, debouncedDateFilter])

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setLocalSearch(value)
        debouncedSearch(value)
    }

    const handleDateChange = (startDate: string, endDate: string) => {
        setFilterStartDate(startDate)
        setFilterEndDate(endDate)
        debouncedDateFilter(startDate, endDate)
    }

    const handleSortChange = (value: string) => {
        if (value === 'rating') {
            dispatch(applyPostSort({sortBy: 'rating', order: 'DESC'}, 'all'))
        } else if (value === 'created_at') {
            dispatch(applyPostSort({sortBy: 'created_at', order: 'DESC'}, 'all'))
        }
    }

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return
        dispatch(changePostPage(page, 'all'))
    }

    const handleDelete = async () => {
        try {
            if (currentCategory?.id) {
                await dispatch(deleteCategory(currentCategory.id))
                navigate('/categories')
            }
        } catch (err) {
            setDeleteError('Failed to delete category. Please try again.')
            setIsDeleteDialogOpen(false)
        }
    }

    const handleUpdate = async () => {
        setEditError('')

        try {
            if (!editTitle.trim()) {
                setEditError('Title is required')
                return
            }

            if (currentCategory?.id) {
                await dispatch(updateCategory(currentCategory.id, {
                    title: editTitle,
                    description: editDescription
                }))
                setIsEditing(false)
            }
        } catch (err: any) {
            if (err?.message?.includes('duplicate')) {
                setEditError('A category with this title already exists')
            } else {
                setEditError('Failed to update category. Please try again.')
            }
        }
    }

    const renderPostContentPreview = (htmlContent: string): JSX.Element => {
        const cleanHTML = DOMPurify.sanitize(htmlContent, {
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
            ALLOWED_ATTR: ['href', 'target', 'rel']
        })
        const parsedContent = parse(cleanHTML)

        return <div className="line-clamp-3">{parsedContent}</div>
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!currentCategory) {
        return (
            <div className="text-center mt-8">
                <h2 className="text-xl font-semibold">Category not found</h2>
                <Button asChild className="mt-4">
                    <Link to="/categories">Back to Categories</Link>
                </Button>
            </div>
        )
    }

    const handleFilterReset = () => {
        setLocalSearch('')
        setFilterStartDate('')
        setFilterEndDate('')
        dispatch(applyPostFilters({
            searchTitle: '',
            startDate: '',
            endDate: ''
        }, 'all'))
    }

    return (
        <div className="container mx-auto px-4 py-20">
            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {deleteError && (
                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{deleteError}</AlertDescription>
                </Alert>
            )}

            <Button
                variant="ghost"
                asChild
                className="mb-6 hover:bg-accent"
            >
                <Link to="/categories" className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4"/>
                    Back to Categories
                </Link>
            </Button>

            <div className="bg-card rounded-lg shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Folder className="w-10 h-10 text-primary"/>
                        {!isEditing ? (
                            <div>
                                <h1 className="text-3xl font-bold mb-2">{currentCategory.title}</h1>
                                <div className="flex items-center text-sm text-muted-foreground gap-4">
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2"/>
                                        {format(new Date(currentCategory.created_at), 'MMMM d, yyyy')}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1">
                                <div className="grid gap-4 max-w-md">
                                    <div className="grid gap-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            value={editTitle}
                                            style={{width: '400px'}}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                        />
                                    </div>
                                    {editError && (
                                        <Alert variant="destructive">
                                            <AlertDescription>{editError}</AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    {isAdmin && (
                        <div className="flex gap-2">
                            {!isEditing ? (
                                <>
                                    <Button
                                        variant="outline"
                                        className="flex items-center gap-2"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <Pencil className="w-4 h-4"/>
                                        Edit
                                    </Button>

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
                                                    This action cannot be undone. This will permanently delete the
                                                    category and all its associated data.
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
                            ) : (
                                <>
                                    <Button
                                        variant="outline"
                                        className="flex items-center gap-2"
                                        onClick={() => setIsEditing(false)}
                                    >
                                        <X className="w-4 h-4"/>
                                        Cancel
                                    </Button>
                                    <Button
                                        className="flex items-center gap-2"
                                        onClick={handleUpdate}
                                    >
                                        <Save className="w-4 h-4"/>
                                        Save
                                    </Button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {!isEditing ? (
                    <div className="bg-accent/50 rounded-lg p-6 mb-8">
                        <p className="text-lg leading-relaxed">{currentCategory.description}</p>
                    </div>
                ) : (
                    <div className="mb-8">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="mt-2"
                        />
                    </div>
                )}

                <div className="mt-12">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6"/>
                        Posts in this Category
                    </h2>

                    {/* Search and Sort Section */}
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <div className="flex-grow">
                                    <div className="relative">
                                        <Search
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"/>
                                        <Input
                                            type="text"
                                            placeholder="Search posts..."
                                            value={localSearch}
                                            onChange={handleSearchChange}
                                            className="pl-10 w-full"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Select onValueChange={handleSortChange} defaultValue={sortBy}>
                                        <SelectTrigger className="w-[200px]">
                                            <SelectValue placeholder="Sort by"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="rating">Rating (High to Low)</SelectItem>
                                            <SelectItem value="created_at">Creation Date (Newest)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <div className="flex items-center gap-2 border rounded-md p-1">
                                        <Button
                                            variant={isGridView ? "default" : "ghost"}
                                            size="icon"
                                            onClick={() => setIsGridView(true)}
                                            className="h-8 w-8"
                                        >
                                            <LayoutGrid className="w-4 h-4"/>
                                        </Button>
                                        <Button
                                            variant={!isGridView ? "default" : "ghost"}
                                            size="icon"
                                            onClick={() => setIsGridView(false)}
                                            className="h-8 w-8"
                                        >
                                            <List className="w-4 h-4"/>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-col md:flex-row md:items-center gap-4">
                                <div className="flex-grow flex items-center gap-2">
                                    <Label htmlFor="start-date">Start Date</Label>
                                    <Input
                                        id="start-date"
                                        type="date"
                                        value={filterStartDate}
                                        onChange={(e) => handleDateChange(e.target.value, filterEndDate)}
                                    />
                                </div>
                                <div className="flex-grow flex items-center gap-2">
                                    <Label htmlFor="end-date">End Date</Label>
                                    <Input
                                        id="end-date"
                                        type="date"
                                        value={filterEndDate}
                                        onChange={(e) => handleDateChange(filterStartDate, e.target.value)}
                                    />
                                </div>
                                <Button variant="ghost" size="sm" onClick={handleFilterReset} className="h-8 w-8 p-0">
                                    <RefreshCw className="h-4 w-4"/>
                                    <span className="sr-only">Reset filters</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mb-6 p-4 bg-muted/50 rounded-lg flex items-center gap-2">
                        <Search className="w-4 h-4 text-muted-foreground"/>
                        <span className="text-muted-foreground">
                                Found {found} {found === 1 ? 'post' : 'posts'} matching your criteria
                            </span>
                    </div>

                    {postsLoading ? (
                        <div className="flex justify-center items-center min-h-[200px]">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : postsError ? (
                        <Alert variant="destructive">
                            <AlertDescription>{postsError}</AlertDescription>
                        </Alert>
                    ) : posts.length === 0 ? (
                        <div className="bg-accent/30 rounded-lg p-8 text-center">
                            {total === 0 ? (
                                <p className="text-muted-foreground">No posts in this category yet.</p>
                            ) : (
                                <div></div>
                            )}
                        </div>
                    ) : (
                        <div className={isGridView ?
                            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6" :
                            "flex flex-col gap-4"
                        }>
                            {posts.map((post: Post) => (
                                <Link key={post.id} to={`/posts/${post.id}`}
                                      className={`group block transition-all duration-200 ${isGridView ? 'bg-card hover:bg-accent rounded-xl shadow-sm hover:shadow-lg' : 'bg-card hover:bg-accent rounded-lg shadow-sm hover:shadow-md'} relative`}>
                                    <div className={`p-6 ${!isGridView && 'flex gap-6'}`}>
                                        <div
                                            className={`flex items-center gap-4 mb-4 ${!isGridView && 'mb-0 flex-shrink-0'}`}>
                                            <div className="relative">
                                                <Avatar
                                                    className="h-12 w-12 ring-2 ring-primary/10 group-hover:ring-primary/20 transition-all">
                                                    <AvatarImage src={post.user?.profile_picture_url}
                                                                 alt={post.user?.login}/>
                                                    <AvatarFallback>
                                                        {post.user?.login.charAt(0).toUpperCase() || '?'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div
                                                    className="absolute -bottom-1 -right-1 translate-x-1 translate-y-1">
                                                    <UserRatingBadge rating={post.user?.rating || 0}/>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="font-semibold">{post.user?.login}</span>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <span>{post.user?.full_name}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={!isGridView ? 'flex-grow' : ''}>
                                            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                                {post.title}
                                            </h3>
                                            <div className="text-muted-foreground mb-4">
                                                {renderPostContentPreview(post.content)}
                                            </div>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {post.categories?.map(category => (
                                                    <Badge key={category.id} variant="secondary">
                                                        {category.title}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <RatingDisplay localRating={post.rating}/>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="w-4 h-4"/>
                                                    <span>{format(new Date(post.created_at), 'MMM d, yyyy')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute top-4 right-4">
                                        <ChevronRight className="w-5 h-5 text-primary"/>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-12 flex justify-center">
                            <Card className="bg-card/50 backdrop-blur border p-2 inline-flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handlePageChange(1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronsLeft className="h-4 w-4"/>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4"/>
                                </Button>

                                <div className="flex items-center gap-1">
                                    {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                                        let pageNumber: number
                                        if (totalPages <= 5) {
                                            pageNumber = i + 1
                                        } else if (currentPage <= 3) {
                                            pageNumber = i + 1
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNumber = totalPages - 4 + i
                                        } else {
                                            pageNumber = currentPage - 2 + i
                                        }

                                        if (pageNumber < 1 || pageNumber > totalPages) return null

                                        return (
                                            <Button
                                                key={pageNumber}
                                                variant={pageNumber === currentPage ? 'default' : 'ghost'}
                                                className="w-10 h-10"
                                                onClick={() => handlePageChange(pageNumber)}
                                            >
                                                {pageNumber}
                                            </Button>
                                        )
                                    })}
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="w-4 w-4"/>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handlePageChange(totalPages)}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronsRight className="h-4 w-4"/>
                                </Button>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CategoryDetails

