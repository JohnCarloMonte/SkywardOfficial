import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  className?: string;
}

const StarRating = ({ rating, className = "" }: StarRatingProps) => {
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          className={`${
            star <= rating 
              ? "text-yellow-400 fill-yellow-400" 
              : "text-gray-300"
          }`}
        />
      ))}
      <span className="text-sm text-muted-foreground ml-2">({rating}/5)</span>
    </div>
  );
};

export default StarRating;