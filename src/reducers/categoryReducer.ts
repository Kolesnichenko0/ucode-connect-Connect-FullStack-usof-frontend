import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {Category} from '../types/Category'

interface CategoryState {
    categories: Category[]
    currentCategory: Category | null
    loading: boolean
    error: string | null
    currentPage: number
    totalPages: number
    searchTitle: string
    found: number
}

const initialState: CategoryState = {
    categories: [],
    currentCategory: null,
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    searchTitle: '',
    found: 0,
}

const categorySlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {
        getCategoriesRequest: (state) => {
            state.loading = true
            state.error = null
        },
        getCategoriesSuccess: (
            state,
            action: PayloadAction<{
                categories: Category[];
                currentPage: number;
                totalPages: number;
                searchTitle: string;
                found: number
            }>
        ) => {
            state.categories = action.payload.categories
            state.currentPage = action.payload.currentPage
            state.totalPages = action.payload.totalPages
            state.searchTitle = action.payload.searchTitle
            state.found = action.payload.found
            state.loading = false
        },
        getCategoriesFailure: (state, action: PayloadAction<string>) => {
            state.loading = false
            state.error = action.payload
        },
        getCategoryRequest: (state) => {
            state.loading = true
            state.error = null
        },
        getCategorySuccess: (state, action: PayloadAction<Category>) => {
            state.currentCategory = action.payload
            state.loading = false
        },
        getCategoryFailure: (state, action: PayloadAction<string>) => {
            state.loading = false
            state.error = action.payload
        },
        createCategoryRequest: (state) => {
            state.loading = true
            state.error = null
        },
        createCategorySuccess: (state, action: PayloadAction<Category>) => {
            state.categories.unshift(action.payload)
            state.loading = false
        },
        createCategoryFailure: (state, action: PayloadAction<string>) => {
            state.loading = false
            state.error = action.payload
        },
        updateCategoryRequest: (state) => {
            state.loading = true
            state.error = null
        },
        updateCategorySuccess: (state, action: PayloadAction<Category>) => {
            const index = state.categories.findIndex(cat => cat.id === action.payload.id)
            if (index !== -1) {
                state.categories[index] = action.payload
            }
            if (state.currentCategory && state.currentCategory.id === action.payload.id) {
                state.currentCategory = action.payload
            }
            state.loading = false
        },
        updateCategoryFailure: (state, action: PayloadAction<string>) => {
            state.loading = false
            state.error = action.payload
        },
        deleteCategoryRequest: (state) => {
            state.loading = true
            state.error = null
        },
        deleteCategorySuccess: (state, action: PayloadAction<string>) => {
            state.categories = state.categories.filter(cat => cat.id !== action.payload)
            if (state.currentCategory && state.currentCategory.id === action.payload) {
                state.currentCategory = null
            }
            state.loading = false
        },
        deleteCategoryFailure: (state, action: PayloadAction<string>) => {
            state.loading = false
            state.error = action.payload
        },
    },
})

export const {
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
} = categorySlice.actions

export default categorySlice.reducer
