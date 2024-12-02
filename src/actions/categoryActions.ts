import {AppDispatch} from '../store'
import categoryService from '../services/categoryService'
import {
    getCategoriesRequest,
    getCategoriesSuccess,
    getCategoriesFailure,
    getCategoryRequest,
    getCategorySuccess,
    getCategoryFailure,
    createCategoryRequest,
    createCategorySuccess,
    createCategoryFailure,
    updateCategoryRequest,
    updateCategorySuccess,
    updateCategoryFailure,
    deleteCategoryRequest,
    deleteCategorySuccess,
    deleteCategoryFailure,
} from '../reducers/categoryReducer'

export const getAllCategories = (page: number = 1, limit: number = 30, searchTitle: string = '') => async (dispatch: AppDispatch) => {
    try {
        dispatch(getCategoriesRequest())
        const response = await categoryService.getAllCategories(page, limit, searchTitle)
        const categories = response.data
        const found = response.found
        const totalPages = Math.ceil(found / limit)
        dispatch(getCategoriesSuccess({
            categories: categories,
            currentPage: page,
            totalPages: totalPages,
            searchTitle: searchTitle,
            found: found
        }))
    } catch (error: any) {
        dispatch(getCategoriesFailure(error.response?.data?.message || 'Failed to get categories'))
    }
}

export const getCategoryById = (categoryId: string) => async (dispatch: AppDispatch) => {
    try {
        dispatch(getCategoryRequest())
        const data = await categoryService.getCategoryById(categoryId)
        dispatch(getCategorySuccess(data.data))
    } catch (error: any) {
        dispatch(getCategoryFailure(error.response?.data?.message || 'Failed to fetch category'))
    }
}

export const createCategory = (data: { title: string; description: string }) => async (dispatch: AppDispatch) => {
    try {
        dispatch(createCategoryRequest())
        const response = await categoryService.createCategory(data)
        dispatch(createCategorySuccess(response.data))
        return response.data
    } catch (error: any) {
        dispatch(createCategoryFailure(error.response?.data?.message || 'Failed to create category'))
        throw error
    }
}

export const updateCategory = (categoryId: string, data: {
    title?: string;
    description?: string
}) => async (dispatch: AppDispatch) => {
    try {
        dispatch(updateCategoryRequest())
        const response = await categoryService.updateCategory(categoryId, data)
        dispatch(updateCategorySuccess(response.data))
    } catch (error: any) {
        dispatch(updateCategoryFailure(error.response?.data?.message || 'Failed to update category'))
    }
}

export const deleteCategory = (categoryId: string) => async (dispatch: AppDispatch) => {
    try {
        dispatch(deleteCategoryRequest())
        await categoryService.deleteCategory(categoryId)
        dispatch(deleteCategorySuccess(categoryId))
    } catch (error: any) {
        dispatch(deleteCategoryFailure(error.response?.data?.message || 'Failed to delete category'))
    }
}
