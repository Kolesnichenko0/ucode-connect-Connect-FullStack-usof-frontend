export interface Category {
    id: number
    title: string
    description: string
    created_at: string
    updated_at: string
}

export interface CategoriesResponse {
    message: string
    data: Category[]
    currentPage: number
    totalPages: number
}

export interface CategoryResponse {
    message: string
    data: Category
}

export interface CreateCategoryData {
    title: string
    description: string
}

export interface UpdateCategoryData {
    title?: string
    description?: string
}
