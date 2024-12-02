import React from 'react'
import {Button} from '../ui/button'
import {Input} from '../ui/input'
import {Category} from '../../types/Category'
import CategoryFilter from './CategoryFilter'

interface FilterSectionProps {
    searchTitle: string
    setSearchTitle: (value: string) => void
    selectedCategories: number[]
    setSelectedCategories: (ids: number[]) => void
    categories: Category[]
    filterStartDate: string
    setFilterStartDate: (value: string) => void
    filterEndDate: string
    setFilterEndDate: (value: string) => void
    applyFilters: () => void
}

const FilterSection: React.FC<FilterSectionProps> = ({
                                                         searchTitle,
                                                         setSearchTitle,
                                                         selectedCategories,
                                                         setSelectedCategories,
                                                         categories,
                                                         filterStartDate,
                                                         setFilterStartDate,
                                                         filterEndDate,
                                                         setFilterEndDate,
                                                         applyFilters,
                                                     }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="text-xl font-semibold mb-4">Filters</h3>
            <div className="flex flex-col md:flex-row md:items-end gap-4">
                {/* Search by Title */}
                <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">Search by Title</label>
                    <Input
                        type="text"
                        placeholder="Enter title..."
                        value={searchTitle}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTitle(e.target.value)}
                        className="w-full"
                    />
                </div>
                {/* Category Selection */}
                <div className="flex-1">
                    <CategoryFilter
                        categories={categories}
                        selectedCategories={selectedCategories}
                        setSelectedCategories={setSelectedCategories}
                    />
                </div>
                {/* Date Filter */}
                <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">Creation Date</label>
                    <div className="flex gap-2">
                        <Input
                            type="date"
                            value={filterStartDate}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterStartDate(e.target.value)}
                            className="w-1/2"
                        />
                        <Input
                            type="date"
                            value={filterEndDate}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterEndDate(e.target.value)}
                            className="w-1/2"
                        />
                    </div>
                </div>
                {/* Apply Filters Button */}
                <div className="self-end">
                    <Button onClick={applyFilters}>Apply Filters</Button>
                </div>
            </div>
        </div>
    )
}

export default FilterSection
