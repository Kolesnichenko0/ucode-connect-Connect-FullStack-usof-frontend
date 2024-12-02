import React, {ChangeEvent, useEffect, useState} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {RootState, AppDispatch} from '../../store'
import {getAllCategories, createCategory} from '../../actions/categoryActions'
import {Category} from '../../types/Category'
import {Link, useNavigate} from 'react-router-dom'
import {Button} from '../ui/button'
import {Input} from '../ui/input'
import Modal from '../ui/modal'
import {Alert, AlertTitle, AlertDescription} from '../ui/alert'
import {
    FolderPlus,
    Folder,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ChevronLeft,
    Search,
    Clock,
    LayoutGrid,
    List
} from 'lucide-react'
import {format} from 'date-fns'
import {Textarea} from "@/components/ui/textarea"
import debounce from 'lodash.debounce'
import {Card} from '../ui/card'

const CategoriesList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const {
        categories,
        loading,
        error,
        currentPage,
        totalPages,
        searchTitle,
        found
    } = useSelector((state: RootState) => state.categories)
    const authUser = useSelector((state: RootState) => state.auth.user)

    const [showModal, setShowModal] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [formError, setFormError] = useState<string | null>(null)
    const [searchInput, setSearchInput] = useState(searchTitle)
    const [isGridView, setIsGridView] = useState(true)

    useEffect(() => {
        dispatch(getAllCategories(currentPage, 30, searchTitle))
    }, [dispatch, currentPage, searchTitle])

    const debouncedSearch = debounce((value: string) => {
        dispatch(getAllCategories(1, 30, value))
    }, 500)

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchInput(value)
        debouncedSearch(value)
    }

    const handleCreateCategory = async () => {
        if (!title.trim()) {
            setFormError('Title is required.')
            return
        }
        try {
            const newCategory = await dispatch(createCategory({title, description}))
            setTitle('')
            setDescription('')
            setShowModal(false)
            setFormError(null)
            dispatch(getAllCategories(currentPage, 30, searchTitle))
            navigate(`/categories/${newCategory.id}`)
        } catch (err: any) {
            setFormError(err.response?.data?.message || 'Failed to create category')
        }
    }

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return
        dispatch(getAllCategories(page, 30, searchTitle))
    }

    return (
        <div className="container mx-auto px-4 py-20 max-w-7xl">
            {/* Header Section */}
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
                                        Categories
                                    </h1>
                                    <p className="text-lg text-muted-foreground mt-2">
                                        Organize and discover your content collections
                                    </p>
                                </div>
                            </div>
                            {authUser && authUser.role === 'admin' && (
                                <Button onClick={() => setShowModal(true)} size="lg"
                                        className="flex items-center gap-2">
                                    <FolderPlus className="w-5 h-5"/>
                                    Create Category
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and View Toggle */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6">
                <div className="relative flex-grow md:max-w-md">
                    <Search
                        className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2"/>
                    <Input
                        type="text"
                        placeholder="Search categories..."
                        value={searchInput}
                        onChange={handleSearchChange}
                        className="pl-10 h-11"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        variant={isGridView ? "default" : "outline"}
                        size="icon"
                        onClick={() => setIsGridView(true)}
                        className="h-11 w-11"
                    >
                        <LayoutGrid className="w-5 h-5"/>
                    </Button>
                    <Button
                        variant={!isGridView ? "default" : "outline"}
                        size="icon"
                        onClick={() => setIsGridView(false)}
                        className="h-11 w-11"
                    >
                        <List className="w-5 h-5"/>
                    </Button>
                </div>
            </div>

            {/* Search Results */}
            {searchTitle && (
                <div className="mb-6 p-4 bg-muted/50 rounded-lg flex items-center gap-2">
                    <Search className="w-4 h-4 text-muted-foreground"/>
                    <span className="text-muted-foreground">
                        Found {found} {found === 1 ? 'category' : 'categories'} matching your search
                    </span>
                </div>
            )}

            {/* Loading State */}
            {loading ? (
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
                    "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" :
                    "flex flex-col gap-4"
                }>
                    {categories.length === 0 ? (
                        <div className="col-span-full bg-muted/10 rounded-xl p-12 text-center">
                            <div
                                className="p-4 bg-primary/5 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                                <Folder className="w-10 h-10 text-primary"/>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No categories found</h3>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                Try adjusting your search terms or create a new category to get started.
                            </p>
                        </div>
                    ) : (
                        categories.map((category: Category) => (
                            <Link
                                key={category.id}
                                to={`/categories/${category.id}`}
                                className={`group block transition-all duration-200 ${
                                    isGridView ?
                                        'bg-card hover:bg-accent rounded-xl shadow-sm hover:shadow-lg' :
                                        'bg-card hover:bg-accent rounded-lg shadow-sm hover:shadow-md'
                                }`}
                            >
                                <div className={`p-6 ${!isGridView && 'flex justify-between items-center'}`}>
                                    <div className={!isGridView ? 'flex items-center gap-6 flex-grow' : ''}>
                                        <div
                                            className="p-3 bg-primary/10 rounded-lg mb-4 w-fit group-hover:bg-primary/20 transition-colors">
                                            <Folder className="w-6 h-6 text-primary"/>
                                        </div>
                                        <div className={!isGridView ? 'flex-grow' : ''}>
                                            <h3 className="text-xl font-semibold group-hover:text-primary transition-colors mb-2">
                                                {category.title}
                                            </h3>
                                            <p className="text-muted-foreground mb-4 line-clamp-2">
                                                {category.description}
                                            </p>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4"/>
                                                    {format(new Date(category.created_at), 'MMM d, yyyy')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div
                                            className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                            <ChevronRight className="w-5 h-5 text-primary"/>
                                        </div>
                                    </div>
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
                            <ChevronRight className="h-4 w-4"/>
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

            {/* Create Category Modal */}
            {showModal && (
                <Modal onClose={() => setShowModal(false)}>
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <FolderPlus className="w-6 h-6 text-primary"/>
                            </div>
                            <h3 className="text-2xl font-bold">Create New Category</h3>
                        </div>
                        {formError && (
                            <Alert variant="destructive" className="mb-6">
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{formError}</AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Title</label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter category title"
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Enter category description"
                                    className="w-full"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="outline" onClick={() => {
                                    setShowModal(false);
                                    setFormError(null);
                                    setTitle('');
                                    setDescription('');
                                }}>Cancel</Button>
                                <Button onClick={handleCreateCategory}>Create Category</Button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}

export default CategoriesList
