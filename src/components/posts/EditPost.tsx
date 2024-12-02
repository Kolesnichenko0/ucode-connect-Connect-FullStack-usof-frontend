import React, {useState, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Link, useNavigate, useParams} from 'react-router-dom'
import store, {RootState, AppDispatch} from '../../store'
import {
    uploadPostFiles,
    updatePost as updatePostAction,
    fetchLikeStatus,
    likePost,
    dislikePost
} from '../../actions/postActions'
import {getAllCategories} from '../../actions/categoryActions'
import {Button} from '../ui/button'
import {Input} from '../ui/input'
import {Label} from '../ui/label'
import {Alert, AlertTitle, AlertDescription} from '../ui/alert'
import {useForm, Controller} from 'react-hook-form'
import {yupResolver} from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {Category, Post, User} from '../../types/Post'
import {FileText, ImageIcon, Paperclip, Pencil, XCircle} from 'lucide-react'
import {Editor} from '@tinymce/tinymce-react'
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from '@/components/ui/card'
import {Checkbox} from '@/components/ui/checkbox'
import DOMPurify from 'dompurify'
import {Skeleton} from "@/components/ui/skeleton.tsx";
import postService from "@/services/postService.ts";
import userService from "@/services/userService.ts";
import {resetUploadedFiles} from "@/reducers/postReducer.ts";

const schema = yup.object().shape({
    title: yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
    content: yup.string().required('Content is required').min(10, 'Content must be at least 10 characters'),
    categories: yup.array().of(yup.number()).min(1, 'At least one category must be selected'),
})

interface EditPostForm {
    title: string
    content: string
    categories: number[]
    files: FileList
    status?: 'active' | 'inactive'
}

const EditPost: React.FC = () => {
    const {postId} = useParams<{ postId: string }>()
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const authUser = useSelector((state: RootState) => state.auth.user)

    const [post, setPost] = useState<Post | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const categoriesFromStore = useSelector((state: RootState) => state.categories.categories)
    const categoriesLoading = useSelector((state: RootState) => state.categories.loading)
    const categoriesError = useSelector((state: RootState) => state.categories.error)
    const [files, setFiles] = useState<FileAttachment[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [fileErrors, setFileErrors] = useState<string[]>([])

    const [existingFiles, setExistingFiles] = useState<FileAttachment[]>([])

    const {register, handleSubmit, control, formState: {errors}, setValue, watch} = useForm<EditPostForm>({
        resolver: yupResolver(schema),
        defaultValues: {
            title: '',
            content: '',
            categories: [],
            files: {} as FileList,
            status: 'active',
        }
    })

    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [categorySearch, setCategorySearch] = useState('')

    useEffect(() => {
        const fetchPostDetails = async () => {
            try {
                setLoading(true)
                const postResponse = await postService.getPostById(Number(postId))
                const fetchedPost: Post = postResponse.data
                setPost(fetchedPost)

                const userResponse = await userService.getUserById(fetchedPost.user_id)
                const fetchedUser: User = userResponse.data
                setUser(fetchedUser)

                if (categoriesFromStore.length === 0) {
                    await dispatch(getAllCategories(1, 1000))
                }

                setValue('title', fetchedPost.title)
                setValue('content', fetchedPost.content)
                setValue('categories', fetchedPost.category_ids)
                setValue('status', fetchedPost.status)

                const filesResponse = await postService.getFileNamesByPostId(Number(postId))
                const fetchedFiles: FileAttachment[] = (filesResponse || []).map((file: any) => ({
                    ...file,
                    file_type: file.file_name.split('.').pop()?.toLowerCase() === 'pdf' ? 'application/pdf' : 'image/jpeg'
                }))
                setFiles(fetchedFiles)

                setExistingFiles(fetchedFiles)

                setLoading(false)
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to fetch post details')
                setLoading(false)
            }
        }

        if (postId) {
            fetchPostDetails()
        }
    }, [postId, dispatch, categoriesFromStore.length, setValue])

    const handleRemoveExistingFile = (fileToRemove: FileAttachment) => {
        setExistingFiles(prev => prev.filter(file => file.file_name !== fileToRemove.file_name))
    }

    const onSubmit = async (data: EditPostForm) => {
        try {
            let uploadedFileNames: string[] = []

            await dispatch(resetUploadedFiles());

            if (selectedFiles.length > 0) {
                await dispatch(uploadPostFiles(selectedFiles))
                const state = store.getState()
                uploadedFileNames = state.posts.uploadedFiles
            }

            const sanitizedContent = DOMPurify.sanitize(data.content)

            const updateData: any = {
                title: data.title,
                content: sanitizedContent,
                category_ids: data.categories,
                files: [...existingFiles.map(file => file.file_name), ...uploadedFileNames]
            }

            if (data.status) {
                updateData.status = data.status
            }

            await dispatch(updatePostAction(post!.id, updateData))
            navigate(`/posts/${post!.id}`)
        } catch (error: any) {
            console.error('Failed to update post:', error)
            setError(error.response?.data?.message || 'Failed to update the post')
        }
    }

    const renderFilePreview = (file: FileAttachment) => {
        if (file.file_type.startsWith('image/')) {
            return (
                <div
                    className="w-full cursor-pointer overflow-hidden rounded-lg shadow-lg"
                    onClick={() => window.open(file.file_url, '_blank')}
                >
                    <img
                        src={file.file_url}
                        alt="Attachment preview"
                        className="w-full h-32 object-cover transition-transform duration-300 hover:scale-105"
                    />
                </div>
            )
        } else if (file.file_type === 'application/pdf') {
            return (
                <div
                    className="w-full bg-red-50 rounded-lg overflow-hidden shadow-md cursor-pointer hover:bg-red-100 transition-colors"
                    onClick={() => window.open(file.file_url, '_blank')}
                >
                    <div className="flex items-center p-4">
                        <FileText className="w-8 h-8 text-red-600 mr-4"/>
                        <span className="text-red-800 font-medium">View PDF Document</span>
                    </div>
                </div>
            )
        } else {
            return (
                <div
                    className="w-full bg-gray-50 rounded-lg overflow-hidden shadow-md cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => window.open(file.file_url, '_blank')}
                >
                    <div className="flex items-center p-4">
                        <Paperclip className="w-8 h-8 text-gray-600 mr-4"/>
                        <span className="text-gray-800 font-medium">View Attachment</span>
                    </div>
                </div>
            )
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files) {
            const fileArray = Array.from(files)
            const errors: string[] = []

            fileArray.forEach(file => {
                if (!['application/pdf', 'image/png', 'image/jpg', 'image/jpeg'].includes(file.type)) {
                    errors.push(`${file.name} has an unsupported format.`)
                }
                if (file.size > 5 * 1024 * 1024) {
                    errors.push(`${file.name} exceeds the maximum size of 5MB.`)
                }
            })

            if (selectedFiles.length + fileArray.length > 5) {
                errors.push('You can upload a maximum of 5 files.')
            }

            if (errors.length > 0) {
                setFileErrors(errors)
            } else {
                setFileErrors([])
                setSelectedFiles(prev => [...prev, ...fileArray])
            }
        }
    }

    const handleRemoveFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    }

    const handleCategoryToggle = (categoryId: number) => {
        const selectedCategories = watch('categories')
        const updatedCategories = selectedCategories.includes(categoryId)
            ? selectedCategories.filter(id => id !== categoryId)
            : [...selectedCategories, categoryId]
        setValue('categories', updatedCategories, {shouldValidate: true})
    }

    const filteredCategories = categoriesFromStore.filter(category =>
        category.title.toLowerCase().includes(categorySearch.toLowerCase())
    )

    if (loading || categoriesLoading) {
        return <PostSkeleton/>
    }

    if (error || !post) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {error || 'Post not found'}
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    const isAuthor = authUser?.id === post.user_id
    const isAdmin = authUser?.role === 'admin'

    if (!isAuthor) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Alert variant="destructive">
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                        You do not have permission to edit this post.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-20 max-w-7xl">
            {/* Header Section */}
            <div className="relative mb-12">
                <div
                    className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-3xl blur-3xl"/>
                <div className="relative bg-card/50 backdrop-blur-xl rounded-3xl border shadow-2xl">
                    <div className="p-8">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-primary/10 rounded-2xl">
                                <Pencil className="w-12 h-12 text-primary"/>
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                                    Edit Post
                                </h1>
                                <p className="text-lg text-muted-foreground mt-2">
                                    Update your IT knowledge and insights
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Alert */}
            {(error || fileErrors.length > 0) && (
                <Alert variant="destructive" className="mb-6">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {error && <div>{error}</div>}
                        {fileErrors.length > 0 && (
                            <ul className="list-disc pl-5">
                                {fileErrors.map((err, idx) => (
                                    <li key={idx}>{err}</li>
                                ))}
                            </ul>
                        )}
                    </AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title Input */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Post Title</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Input
                                    id="title"
                                    placeholder="Enter a descriptive title for your post"
                                    {...register('title')}
                                    className="text-xl"
                                />
                                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                            </CardContent>
                        </Card>

                        {/* Content Editor */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Post Content</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Controller
                                    name="content"
                                    control={control}
                                    render={({field}) => (
                                        <Editor
                                            apiKey="qinraddxoyyhta0k5ldj3yxhd4fdcjel76mjp9hn7ilguvzc"
                                            init={{
                                                height: 500,
                                                menubar: false,
                                                plugins: [
                                                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                                                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                                    'insertdatetime', 'media', 'table', 'help', 'wordcount', 'codesample'
                                                ],
                                                toolbar: 'undo redo | blocks | ' +
                                                    'bold italic forecolor | alignleft aligncenter ' +
                                                    'alignright alignjustify | bullist numlist outdent indent | ' +
                                                    'table | removeformat | codesample | help',
                                                block_formats: 'Paragraph=p; Header 2=h2; Header 3=h3; Header 4=h4; Header 5=h5; Header 6=h6',
                                                content_style: `
                                  body { font-family:Helvetica,Arial,sans-serif; font-size:14px }
                                  pre.language-markup { border-radius: 4px; padding: 1em; background-color: #f4f4f4; }
                                  pre.language-javascript { border-radius: 4px; padding: 1em; background-color: #f0f0f0; }
                                  pre.language-css { border-radius: 4px; padding: 1em; background-color: #f8f8f8; }
                                `,
                                                codesample_languages: [
                                                    {text: 'HTML/XML', value: 'markup'},
                                                    {text: 'JavaScript', value: 'javascript'},
                                                    {text: 'CSS', value: 'css'},
                                                    {text: 'PHP', value: 'php'},
                                                    {text: 'Ruby', value: 'ruby'},
                                                    {text: 'Python', value: 'python'},
                                                    {text: 'Java', value: 'java'},
                                                    {text: 'C', value: 'c'},
                                                    {text: 'C#', value: 'csharp'},
                                                    {text: 'C++', value: 'cpp'},
                                                    {text: 'SQL', value: 'sql'},
                                                    {text: 'Bash', value: 'bash'},
                                                ]
                                            }}
                                            onEditorChange={(content) => field.onChange(content)}
                                            value={field.value}
                                        />
                                    )}
                                />
                                {errors.content &&
                                    <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-6">
                        {/* Categories Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Categories</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Input
                                    type="text"
                                    placeholder="Search categories..."
                                    value={categorySearch}
                                    onChange={(e) => setCategorySearch(e.target.value)}
                                    className="mb-4"
                                />
                                <div className="max-h-64 overflow-y-auto space-y-2">
                                    {filteredCategories.length === 0 ? (
                                        <p className="text-muted-foreground text-sm">No categories found.</p>
                                    ) : (
                                        filteredCategories.map(category => (
                                            <div key={category.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`category-${category.id}`}
                                                    checked={watch('categories').includes(category.id)}
                                                    onCheckedChange={() => handleCategoryToggle(category.id)}
                                                />
                                                <Label htmlFor={`category-${category.id}`}>{category.title}</Label>
                                            </div>
                                        ))
                                    )}
                                </div>
                                {errors.categories && (
                                    <p className="text-red-500 text-sm mt-2">{errors.categories.message}</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Existing Attachments</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {existingFiles.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {existingFiles.map((file, index) => (
                                            <div key={index} className="relative group">
                                                {renderFilePreview(file)}
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleRemoveExistingFile(file)}
                                                >
                                                    <XCircle className="w-4 h-4"/>
                                                    <span className="sr-only">Remove file</span>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-sm">No existing files.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* New File Upload */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Upload New Files</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className={`border-2 border-dashed rounded-lg p-6 text-center 
                            transition-colors duration-300 group cursor-pointer
                            ${selectedFiles.length + existingFiles.length >= 5
                                        ? 'border-red-300 bg-red-50'
                                        : 'border-gray-300 hover:border-primary hover:bg-primary/5'}`}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const files = e.dataTransfer.files;
                                        if (files) {
                                            handleFileChange({target: {files}} as React.ChangeEvent<HTMLInputElement>);
                                        }
                                    }}
                                >
                                    <input
                                        type="file"
                                        id="files"
                                        accept=".pdf, .png, .jpg, .jpeg"
                                        multiple
                                        onChange={handleFileChange}
                                        className="hidden"
                                        disabled={selectedFiles.length + existingFiles.length >= 5}
                                    />
                                    <label htmlFor="files" className="cursor-pointer flex flex-col items-center">
                                        <Paperclip className="w-12 h-12 text-gray-400 group-hover:text-primary mb-4"/>
                                        <p className="text-gray-600 group-hover:text-primary">
                                            Drag and drop files or <span
                                            className="text-primary underline">Browse</span>
                                        </p>
                                        <p className="text-xs text-gray-500 mt-2">
                                            PNG, JPG, PDF (Max 5 files total, 5MB each)
                                        </p>
                                    </label>
                                </div>

                                {selectedFiles.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        {selectedFiles.map((file, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between border rounded-lg p-2
                                        bg-gray-50 shadow-sm hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    {file.type.startsWith('image/') ? (
                                                        <ImageIcon className="w-5 h-5 text-blue-500"/>
                                                    ) : (
                                                        <FileText className="w-5 h-5 text-red-500"/>
                                                    )}
                                                    <span className="text-sm truncate">{file.name}</span>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveFile(index)}
                                                >
                                                    <XCircle className="w-4 h-4 text-red-500"/>
                                                    <span className="sr-only">Remove file</span>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="py-8 z-50">
                    <div className="container mx-auto px-4 flex justify-end space-x-4 max-w-7xl">
                        <Link to={`/posts/${post!.id}`} className="flex-grow-0">
                            <Button
                                type="button"
                                variant="destructive"
                                className="w-full md:w-auto transition-all duration-300 hover:bg-red-600 hover:scale-105"
                            >
                                Cancel
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            className="w-full md:w-auto transition-all duration-300 hover:scale-105 hover:bg-primary/90"
                        >
                            Update Post
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}

interface FileAttachment {
    file_name: string;
    file_url: string;
    file_type: string;
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

export default EditPost
