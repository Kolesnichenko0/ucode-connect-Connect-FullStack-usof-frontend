import React, {useState, ChangeEvent, useEffect} from 'react'
import {Category} from '../../types/Category'
import {Input} from '../ui/input'
import {Badge} from '../ui/badge'
import {Button} from '../ui/button'

interface CategoryFilterProps {
    categories: Category[]
    selectedCategories: number[]
    setSelectedCategories: (ids: number[]) => void
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
                                                           categories,
                                                           selectedCategories,
                                                           setSelectedCategories
                                                       }) => {
    const [searchTerm, setSearchTerm] = useState<string>('')
    const [displayedCategories, setDisplayedCategories] = useState<Category[]>([])

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setDisplayedCategories(categories.slice(0, 15))
        } else {
            const filtered = categories.filter(category =>
                category.title.toLowerCase().includes(searchTerm.toLowerCase())
            )
            setDisplayedCategories(filtered.slice(0, 15))
        }
    }, [searchTerm, categories])

    const handleCategorySelect = (id: number) => {
        if (selectedCategories.includes(id)) {
            setSelectedCategories(selectedCategories.filter(catId => catId !== id))
        } else {
            setSelectedCategories([...selectedCategories, id])
        }
    }

    const handleRemoveCategory = (id: number) => {
        setSelectedCategories(selectedCategories.filter(catId => catId !== id))
    }

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Categories</label>
            {/* Search Field */}
            <Input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="mb-2"
            />
            {/* Categories List */}
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {displayedCategories.map(category => (
                    <Button
                        key={category.id}
                        variant={selectedCategories.includes(category.id) ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handleCategorySelect(category.id)}
                        className="capitalize"
                    >
                        {category.title}
                    </Button>
                ))}
            </div>
            {/* Selected Categories */}
            {selectedCategories.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                    {selectedCategories.map(id => {
                        const category = categories.find(cat => cat.id === id)
                        if (!category) return null
                        return (
                            <Badge
                                key={id}
                                variant="secondary"
                                className="flex items-center gap-1"
                            >
                                {category.title}
                                <Button
                                    variant="ghost"
                                    size="xs"
                                    onClick={() => handleRemoveCategory(id)}
                                >
                                    ×
                                </Button>
                            </Badge>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default CategoryFilter
