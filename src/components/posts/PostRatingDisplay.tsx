import {Star, TrendingDown, TrendingUp} from 'lucide-react';
import {cn} from "@/lib/utils";

const RatingDisplay = ({localRating}) => {
    const getRatingStyles = () => {
        const roundedRating = Math.round(localRating);

        if (roundedRating > 0) {
            return {
                bgColor: "bg-green-100",
                textColor: "text-green-800",
                icon: <TrendingUp className="w-5 h-5 text-green-600"/>,
            };
        } else if (roundedRating < 0) {
            return {
                bgColor: "bg-red-100",
                textColor: "text-red-800",
                icon: <TrendingDown className="w-5 h-5 text-red-600"/>,
            };
        } else {
            return {
                bgColor: "bg-gray-100",
                textColor: "text-gray-800",
                icon: <Star className="w-5 h-5 text-gray-500"/>,
            };
        }
    };

    const {bgColor, textColor, icon} = getRatingStyles();
    const roundedRating = Math.round(localRating);

    return (
        <div
            className={cn(
                "flex items-center space-x-2 rounded-full px-3 py-1 shadow-sm transition-all duration-300 ease-in-out",
                bgColor
            )}
        >
            {icon}
            <span
                className={cn(
                    "font-bold text-xl",
                    textColor
                )}
            >
        {Math.abs(roundedRating)}
      </span>
        </div>
    );
};

export default RatingDisplay;