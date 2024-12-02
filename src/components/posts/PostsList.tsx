import React, {ChangeEvent, useEffect, useState, useMemo} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {RootState, AppDispatch} from '../../store'
import {
    fetchPosts,
    applyPostFilters,
    applyPostSort,
    changePostPage,
    fetchUserPosts,
    fetchFavoritePosts
} from '../../actions/postActions'
import {getAllCategories} from '../../actions/categoryActions'
import {Post} from '../../types/Post'
import {Link} from 'react-router-dom'
import {Button} from '../ui/button'
import {Input} from '../ui/input'
import {Alert, AlertTitle, AlertDescription} from '../ui/alert'
import {
    Search,
    ChevronRight,
    ChevronLeft,
    ChevronsLeft,
    ChevronsRight,
    LayoutGrid,
    List,
    PlusCircle,
    Folder,
    Clock,
    Star,
    Filter,
    SortAsc,
    X,
    RefreshCw,
    Calendar
} from 'lucide-react'
import {format, addDays} from 'date-fns'
import debounce from 'lodash.debounce'
import {Avatar, AvatarFallback, AvatarImage} from '../ui/avatar'
import {Badge} from "../ui/badge"
import {Card, CardContent, CardHeader, CardTitle} from '../ui/card'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../ui/select'
import DOMPurify from 'dompurify'
import parse from 'html-react-parser'
import UserRatingBadge from "@/components/user/UserRatingBadge.tsx"
import {Checkbox} from "../ui/checkbox"
import {Label} from "../ui/label"
import {Separator} from "../ui/separator"
import RatingDisplay from "@/components/posts/PostRatingDisplay.tsx";

interface PostsListProps {
    source: 'all' | 'user' | 'favorites'
    userId?: string
}

const PostsList: React.FC<PostsListProps> = ({source = 'all', userId}) => {

    const dispatch = useDispatch<AppDispatch>()

    const handleFilterReset = () => {
        setLocalSearch('')
        setSelectedCategories([])
        setFilterStartDate('')
        setFilterEndDate('')
        setCategorySearch('')
        setStatusFilter('both')
        dispatch(applyPostFilters({
            searchTitle: '',
            categoryFilters: [],
            startDate: '',
            endDate: '',
            statusFilter: 'both'
        }, source, userId))
    }

    const handleSortChange = (value: string) => {
        if (value === 'rating') {
            dispatch(applyPostSort({sortBy: 'rating', order: 'DESC'}, source, userId))
        } else if (value === 'created_at') {
            dispatch(applyPostSort({sortBy: 'created_at', order: 'DESC'}, source, userId))
        }
    }
    useEffect(() => {
        // Reset filters, sorts, and searches when the component mounts
        dispatch(applyPostSort({sortBy: 'rating', order: 'DESC'}, source, userId))
        dispatch(changePostPage(1, source, userId))
        handleFilterReset();
        handleSortChange('rating');
    }, [dispatch])
    const {
        posts,
        loading,
        error,
        currentPage,
        totalPages,
        found,
        total,
        searchTitle,
        categoryFilters,
        startDate,
        endDate,
        sortBy,
        order
    } = useSelector((state: RootState) => state.posts)
    const {categories, loading: categoriesLoading} = useSelector((state: RootState) => state.categories)
    const authUser = useSelector((state: RootState) => state.auth.user)
    const isAdmin = authUser?.role.toLowerCase() === 'admin'


    const [localSearch, setLocalSearch] = useState<string>(searchTitle)
    const [selectedCategories, setSelectedCategories] = useState<number[]>(categoryFilters)
    const [filterStartDate, setFilterStartDate] = useState<string>(startDate || '')
    const [filterEndDate, setFilterEndDate] = useState<string>(endDate || '')
    const [isGridView, setIsGridView] = useState<boolean>(true)
    const [categorySearch, setCategorySearch] = useState<string>('')
    const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'both'>('both')

    useEffect(() => {
        if (source === 'all') {
            dispatch(fetchPosts())
        } else if (source === 'user' && userId) {
            dispatch(fetchUserPosts(userId))
        } else if (source === 'favorites' && userId) {
            dispatch(fetchFavoritePosts(userId))
        }
    }, [dispatch, currentPage, searchTitle, categoryFilters, startDate, endDate, sortBy, order, source, userId])

    useEffect(() => {
        dispatch(getAllCategories(1, 1000, ''))
    }, [dispatch, categories.length])

    const debouncedSearch = useMemo(() => debounce((value: string) => {
        if (source === 'all') {
            dispatch(applyPostFilters({searchTitle: value}, source))
        } else if (source === 'user') {
            dispatch(applyPostFilters({searchTitle: value}, source, userId))
        } else if (source === 'favorites') {
            dispatch(applyPostFilters({searchTitle: value}, source, userId))
        }
    }, 500), [dispatch, source, userId])

    const debouncedDateFilter = useMemo(() => debounce((startDate: string, endDate: string) => {
        const adjustedEndDate = endDate ? format(addDays(new Date(endDate), 1), 'yyyy-MM-dd') : endDate
        dispatch(applyPostFilters({startDate, endDate: adjustedEndDate}, source, userId))
    }, 500), [dispatch, source, userId])

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

    const handleCategoryToggle = (categoryId: number) => {
        const updatedCategories = selectedCategories.includes(categoryId)
            ? selectedCategories.filter(id => id !== categoryId)
            : [...selectedCategories, categoryId]
        setSelectedCategories(updatedCategories)

        const categoriesToSend = updatedCategories.length === 1
            ? [updatedCategories[0], updatedCategories[0]]
            : updatedCategories

        dispatch(applyPostFilters({
            searchTitle: localSearch,
            categoryFilters: categoriesToSend,
            startDate: filterStartDate,
            endDate: filterEndDate ? format(addDays(new Date(filterEndDate), 1), 'yyyy-MM-dd') : filterEndDate
        }, source, userId))
    }

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return
        dispatch(changePostPage(page, source, userId))
    }

    const renderPostContentPreview = (htmlContent: string): JSX.Element => {
        const cleanHTML = DOMPurify.sanitize(htmlContent, {
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
            ALLOWED_ATTR: ['href', 'target', 'rel']
        })
        const parsedContent = parse(cleanHTML)

        return <div className="line-clamp-3">{parsedContent}</div>
    }

    const filteredCategories = categories.filter(category =>
        category.title.toLowerCase().includes(categorySearch.toLowerCase())
    )

    const postClassNames = (isGridView: boolean, postStatus: string) => `
  group block transition-all duration-200 
  ${isGridView ? 'bg-card hover:bg-accent rounded-xl shadow-sm hover:shadow-lg' : 'bg-card hover:bg-accent rounded-lg shadow-sm hover:shadow-md'} 
  relative 
  ${postStatus === 'inactive' ? 'opacity-50 grayscale' : ''}
`;

    return (
        <div className={`container mx-auto px-4 ${source === 'all' ? 'py-20' : 'py-5'} max-w-7xl`}>
            {/* Header Section */}
            {source === 'all' && (
                <div className="relative mb-12">
                    <div
                        className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-3xl blur-3xl"/>
                    <div className="relative bg-card/50 backdrop-blur-xl rounded-3xl border shadow-2xl">
                        <div className="p-8">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="p-4 bg-primary/10 rounded-2xl">
                                        <Folder className="w-12 h-12 text-primary"/>
                                    </div>
                                    <div>
                                        <h1 className="text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                                            Posts
                                        </h1>
                                        <p className="text-lg text-muted-foreground mt-2">
                                            Browse and discover various IT topics
                                        </p>
                                    </div>
                                </div>
                                {authUser && (
                                    <Link to="/posts/create">
                                        <Button size="lg" className="flex items-center gap-2">
                                            <PlusCircle className="w-5 h-5"/>
                                            Create Post
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-64 flex-shrink-0 order-first lg:order-last">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Filters</CardTitle>
                            <Button variant="ghost" size="sm" onClick={handleFilterReset} className="h-8 w-8 p-0">
                                <RefreshCw className="h-4 w-4"/>
                                <span className="sr-only">Reset filters</span>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-2">Categories</h4>
                                    <Input
                                        type="text"
                                        placeholder="Search categories..."
                                        value={categorySearch}
                                        onChange={(e) => setCategorySearch(e.target.value)}
                                        className="mb-2"
                                    />
                                    <div className="max-h-48 overflow-y-auto space-y-2">
                                        {filteredCategories.length === 0 ? (
                                            <p className="text-muted-foreground text-sm">No categories found.</p>
                                        ) : (
                                            filteredCategories.map(category => (
                                                <div key={category.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`category-${category.id}`}
                                                        checked={selectedCategories.includes(category.id)}
                                                        onCheckedChange={() => handleCategoryToggle(category.id)}
                                                    />
                                                    <Label htmlFor={`category-${category.id}`}>{category.title}</Label>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                                <Separator/>
                                <div>
                                    <h4 className="font-medium mb-2">Creation Date</h4>
                                    <div className="space-y-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="start-date">Start Date</Label>
                                            <Input
                                                id="start-date"
                                                type="date"
                                                value={filterStartDate}
                                                onChange={(e) => handleDateChange(e.target.value, filterEndDate)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="end-date">End Date</Label>
                                            <Input
                                                id="end-date"
                                                type="date"
                                                value={filterEndDate}
                                                onChange={(e) => handleDateChange(filterStartDate, e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                {source === 'user' && isAdmin && (
                                    <div>
                                        <h4 className="font-medium mb-2">Status</h4>
                                        <Select value={statusFilter} onValueChange={(value) => {
                                            setStatusFilter(value as 'active' | 'inactive' | 'both')
                                            dispatch(applyPostFilters({statusFilter: value as 'active' | 'inactive' | 'both'}, source, userId))
                                        }}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select status"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="both">All</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="flex-grow">
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
                                    <Select onValueChange={handleSortChange} defaultValue="rating">
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
                        </CardContent>
                    </Card>

                    {/* Search Results */}
                    {(searchTitle || categoryFilters.length > 0 || startDate || endDate) && (
                        <div className="mb-6 p-4 bg-muted/50 rounded-lg flex items-center gap-2">
                            <Search className="w-4 h-4 text-muted-foreground"/>
                            <span className="text-muted-foreground">
                                Found {found} {found === 1 ? 'post' : 'posts'} matching your criteria
                            </span>
                        </div>
                    )}

                    {/* Error Alert */}
                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{
                                error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Loading State */}
                    {loading || categoriesLoading ? (
                        <div className="flex justify-center items-center min-h-[400px]">
                            <div className="relative">
                                <div
                                    className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <Folder className="w-6 h-6 text-primary"/>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={isGridView ?
                            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6" :
                            "flex flex-col gap-4"
                        }>
                            {posts.length === 0 ? (
                                <div className="col-span-full bg-muted/10 rounded-xl p-12 text-center">
                                    <div
                                        className="p-4 bg-primary/5 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                                        <Search className="w-10 h-10 text-primary"/>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">No posts found</h3>
                                    <p className="text-muted-foreground max-w-md mx-auto">
                                        Try adjusting your search terms or filters to find relevant posts.
                                    </p>
                                </div>
                            ) : (
                                posts.map((post: Post) => (
                                    <Link key={post.id} to={`/posts/${post.id}`}
                                          className={postClassNames(isGridView, post.status)}>
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
                                                    <div
                                                        className="flex items-center gap-2 text-sm text-muted-foreground">
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
                                                    <div
                                                        className="flex items-center gap-2 text-sm text-muted-foreground">
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
                                ))
                            )}
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

export default PostsList

