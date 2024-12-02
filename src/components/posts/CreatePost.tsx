import React, {useState, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import store, {RootState, AppDispatch} from '../../store'
import {uploadPostFiles, createPost} from '../../actions/postActions'
import {getAllCategories} from '../../actions/categoryActions'
import {Button} from '../ui/button'
import {Input} from '../ui/input'
import {Label} from '../ui/label'
import {Alert, AlertTitle, AlertDescription} from '../ui/alert'
import {useForm, Controller} from 'react-hook-form'
import {yupResolver} from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {Category} from '../../types/Category'
import {XCircle, Folder, PlusCircle} from 'lucide-react'
import {Editor} from '@tinymce/tinymce-react'
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Checkbox} from "@/components/ui/checkbox"

import DOMPurify from 'dompurify'
import {resetUploadedFiles} from "@/reducers/postReducer.ts";


const schema = yup.object().shape({
    title: yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
    content: yup.string().required('Content is required').min(10, 'Content must be at least 10 characters'),
    categories: yup.array().of(yup.number()).min(1, 'At least one category must be selected'),
    files: yup.array().of(
        yup.mixed()
            .test('fileSize', 'File is too large', (value) => !value || value.size <= 5 * 1024 * 1024)
            .test('fileType', 'Unsupported File Format', (value) =>
                !value || ['application/pdf', 'image/png', 'image/jpg', 'image/jpeg'].includes(value.type)
            )
    ).max(5, 'You can upload up to 5 files'),
})

interface CreatePostForm {
    title: string
    content: string
    categories: number[]
    files: FileList
}

const CreatePost: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const {
        categories,
        loading: categoriesLoading,
        error: categoriesError
    } = useSelector((state: RootState) => state.categories)
    const {
        uploadedFiles,
        uploadFilesLoading,
        uploadFilesError,
        creatingPost,
        createPostError
    } = useSelector((state: RootState) => state.posts)

    const {register, handleSubmit, control, formState: {errors}, setValue, watch} = useForm<CreatePostForm>({
        resolver: yupResolver(schema),
        defaultValues: {
            categories: [],
        }
    })

    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [fileErrors, setFileErrors] = useState<string[]>([])
    const [categorySearch, setCategorySearch] = useState('')

    const selectedCategories = watch('categories')

    useEffect(() => {
        if (categories.length === 0) {
            dispatch(getAllCategories(1, 1000, ''))
        }
    }, [dispatch, categories.length])

    const onSubmit = async (data: CreatePostForm) => {
        try {
            let uploadedFileNames: string[] = []

            await dispatch(resetUploadedFiles());

            if (selectedFiles.length > 0) {
                await dispatch(uploadPostFiles(selectedFiles))
                const state = store.getState()
                uploadedFileNames = state.posts.uploadedFiles
            }

            const sanitizedContent = DOMPurify.sanitize(data.content)


            const postData = {
                title: data.title,
                content: sanitizedContent,
                category_ids: data.categories,
                files: uploadedFileNames,
            }

            const newPostId = await dispatch(createPost(postData))
            navigate(`/posts/${newPostId}`)
        } catch (error: any) {
            console.error('Failed to create post:', error)
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
        const updatedCategories = selectedCategories.includes(categoryId)
            ? selectedCategories.filter(id => id !== categoryId)
            : [...selectedCategories, categoryId]
        setValue('categories', updatedCategories, {shouldValidate: true})
    }

    const filteredCategories = categories.filter(category =>
        category.title.toLowerCase().includes(categorySearch.toLowerCase())
    )

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
                                <PlusCircle className="w-12 h-12 text-primary"/>
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                                    Create New Post
                                </h1>
                                <p className="text-lg text-muted-foreground mt-2">
                                    Share your IT knowledge and insights
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Alert */}
            {(categoriesError || uploadFilesError || createPostError || fileErrors.length > 0) && (
                <Alert variant="destructive" className="mb-6">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {categoriesError && <div>{categoriesError}</div>}
                        {uploadFilesError && <div>{uploadFilesError}</div>}
                        {createPostError && <div>{createPostError}</div>}
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
                                                    {text: 'sql', value: 'sql'},
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
                                                    checked={selectedCategories.includes(category.id)}
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

                        {/* File Upload */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Attachments</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className={`border-2 border-dashed rounded-lg p-6 text-center 
                                    transition-colors duration-300 group cursor-pointer
                                    ${selectedFiles.length + (fileErrors.length > 0 ? 1 : 0) >= 5
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
                                    />
                                    <label htmlFor="files" className="cursor-pointer flex flex-col items-center">
                                        <Folder className="w-12 h-12 text-gray-400 group-hover:text-primary mb-4"/>
                                        <p className="text-gray-600 group-hover:text-primary">
                                            Drag and drop files or <span
                                            className="text-primary underline">Browse</span>
                                        </p>
                                        <p className="text-xs text-gray-500 mt-2">
                                            PNG, JPG, PDF (Max 5 files, 5MB each)
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
                                                <div className="flex-grow mr-4 overflow-hidden">
                                                    <p className="text-sm truncate">{file.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {(file.size / 1024).toFixed(1)} KB
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="flex-shrink-0"
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

                        {selectedFiles.length + (fileErrors.length > 0 ? 1 : 0) >= 5 && (
                            <div className="mt-2 bg-red-50 border border-red-300 rounded-md p-3 flex items-center">
                                <XCircle className="w-5 h-5 text-red-500 mr-2"/>
                                <p className="text-red-700 text-sm">
                                    {selectedFiles.length >= 5
                                        ? 'Maximum of 5 files allowed.'
                                        : 'Error: File upload restrictions exceeded.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <Button type="submit" disabled={creatingPost}>
                        {creatingPost ? 'Creating...' : 'Create Post'}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default CreatePost;