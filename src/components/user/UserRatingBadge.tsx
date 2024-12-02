import {Star} from 'lucide-react'

const UserRatingBadge = ({rating, className = ""}) => {
    const isNegative = rating < 0

    const baseStyle = `
        bg-white dark:bg-slate-900
        shadow-lg
        border-2
    `

    const positiveStyle = `
        border-yellow-500/50
        bg-gradient-to-b from-yellow-50 to-yellow-100/50
        dark:from-yellow-500/20 dark:to-yellow-500/10
        text-yellow-700
        dark:text-yellow-300
    `

    const negativeStyle = `
        border-red-500/50
        bg-gradient-to-b from-red-50 to-red-100/50
        dark:from-red-500/20 dark:to-red-500/10
        text-red-700
        dark:text-red-300
    `

    return (
        <div className={`
            inline-flex items-center gap-1.5
            px-2 py-1
            rounded-full 
            transition-all
            ${baseStyle}
            ${isNegative ? negativeStyle : positiveStyle}
            ${className}
        `}>
            <Star
                className={`
                    h-4 w-4
                    ${isNegative
                    ? "text-red-500"
                    : "text-yellow-500 fill-yellow-500"
                }
                `}
            />
            <span className="font-bold text-sm leading-none">
                {rating > 0 ? `+${rating}` : rating}
            </span>
        </div>
    )
}

export default UserRatingBadge