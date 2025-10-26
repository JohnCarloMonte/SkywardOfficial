import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import CarCard from "./CarCard";
import { toast } from "@/hooks/use-toast";

// The project's `car` table uses these fields (photo/details/price as in MainPage)
interface Car {
  id: string;
  name: string;
  photo?: string | null;
  details?: string | null;
  price?: number; // weekly rate in some parts of the app
  available?: boolean;
  created_at?: string;
  updated_at?: string;
}

const CarsSection = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    const filtered = cars.filter(car =>
      car.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCars(filtered);
  }, [searchTerm, cars]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await (supabase as any)
        .from("car")
        .select("*")
        .eq("available", true);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = (res as any)?.data as Car[] | null;

      setCars(data || []);
      setFilteredCars(data || []);
    } catch (error) {
      console.error("Error fetching cars:", error);
      toast({
        title: "Error",
        description: "Failed to load cars. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCarClick = (car: Car) => {
    toast({
      title: "Car Selected",
      description: `You selected ${car.name}. Contact us to proceed with booking!`,
    });
  };

  return (
    <section id="cars" className="py-20 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-brand mb-8">
            Available Cars
          </h2>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              type="text"
              placeholder="Search for a car..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading cars...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car) => {
              // Map the 'car' row to the props CarCard expects
              // Map DB row to CarCard props. Some legacy rows may not have a 'rating' field.
              const mapped = {
                id: car.id,
                name: car.name,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                rating: (car as any)?.rating ?? 4.5,
                description: car.details ?? "",
                price_per_day: car.price ? Math.round(car.price / 7) : 0,
                image_url: car.photo ?? "",
              };

              return (
                <CarCard
                  key={car.id}
                  car={mapped}
                  onClick={() => handleCarClick(car)}
                />
              );
            })}
          </div>
        )}

        {!loading && filteredCars.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm ? "No cars found matching your search." : "No cars available at the moment."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CarsSection;