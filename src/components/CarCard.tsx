import { Card, CardContent } from "@/components/ui/card";
import StarRating from "./StarRating";

interface Car {
  id: string;
  name: string;
  rating: number;
  description: string;
  price_per_day: number;
  image_url: string; // Added image_url
}

interface CarCardProps {
  car: Car;
  onClick: () => void;
}

const CarCard = ({ car, onClick }: CarCardProps) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200 bg-card border-border"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
          {car.image_url ? (
            <img
              src={car.image_url}
              alt={car.name}
              className="object-cover w-full h-full"
              style={{ maxHeight: '180px' }}
            />
          ) : (
            <div className="text-center text-muted-foreground">
              <div className="text-4xl mb-2">🚗</div>
              <p className="text-sm">Car Image</p>
            </div>
          )}
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">{car.name}</h3>
        <StarRating rating={car.rating} className="mb-3" />
        <p className="text-muted-foreground mb-4 text-sm">{car.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-brand">
            ₱{car.price_per_day}<span className="text-sm text-muted-foreground">/day</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CarCard;