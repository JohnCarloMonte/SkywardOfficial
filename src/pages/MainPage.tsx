import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Types
interface Car {
  id: string;
  name: string;
  photo: string | null;
  details: string | null;
  price: number;
  created_at: string;
  updated_at: string;
}

const MainPage = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";

  // State
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    customerName: "",
    contactNumber: "",
    email: "",
    startDate: "",
    endDate: "",
    paymentMethod: "",
  });
  const [isBookingLoading, setIsBookingLoading] = useState(false);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("username");
    navigate("/");
  };

  // Fetch cars from Supabase
  const fetchCars = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("car")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setCars(data || []);
    } catch (error) {
      console.error("Error fetching cars:", error);
      toast({
        title: "Error",
        description: "Failed to load cars. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Open car details modal
  const openModal = (car: Car) => {
    setSelectedCar(car);
    setIsModalOpen(true);
  };

  // Open booking modal
  const openBookingModal = (car: Car) => {
    setSelectedCar(car);
    setIsBookingModalOpen(true);
    setBookingForm({
      customerName: "",
      contactNumber: "",
      email: "",
      startDate: "",
      endDate: "",
      paymentMethod: "",
    });
  };

  // Book car
  const bookCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCar) return;

    // Form validation
    if (
      !bookingForm.customerName ||
      !bookingForm.contactNumber ||
      !bookingForm.email ||
      !bookingForm.startDate ||
      !bookingForm.endDate ||
      !bookingForm.paymentMethod
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate date
    const start = new Date(bookingForm.startDate);
    const end = new Date(bookingForm.endDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 0) {
      toast({
        title: "Date Error",
        description: "End date must be after start date.",
        variant: "destructive",
      });
      return;
    }

    // Calculate total price
    const dailyRate = selectedCar.price / 7;
    const totalPrice = dailyRate * daysDiff;

    // Ensure car_id is a UUID string
    const carId = String(selectedCar.id);
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(carId)) {
      toast({
        title: "Invalid Car ID",
        description: "Selected car has an invalid ID. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    const bookingData = {
      car_id: carId,
      car_model: selectedCar.name,
      customer_name: bookingForm.customerName,
      contact_number: bookingForm.contactNumber,
      email: bookingForm.email,
      start_date: bookingForm.startDate,
      end_date: bookingForm.endDate,
      pickup_date: bookingForm.startDate,
      return_date: bookingForm.endDate,
      total_price: totalPrice,
      payment_method: bookingForm.paymentMethod,
      status: "pending",
      username: localStorage.getItem("username") || bookingForm.customerName,
    };

    try {
      setIsBookingLoading(true);
      const { error } = await supabase.from("bookings").insert(bookingData);

      if (error) throw error;

      toast({
        title: "Booking Successful!",
        description: `${selectedCar.name} reserved for ₱${totalPrice.toFixed(2)} (${bookingForm.paymentMethod}).`,
      });

      setIsBookingModalOpen(false);
      setIsModalOpen(false);
      setSelectedCar(null);
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Booking Failed",
        description: "An error occurred while booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBookingLoading(false);
    }
  };

  // Load cars on mount
  useEffect(() => {
    fetchCars();
  }, []);

  return (
    <>
      {/* Navbar */}
      <nav className="w-full bg-brand text-brand-foreground shadow flex items-center justify-between px-8 py-4 mb-8">
        <div className="flex items-center">
          <img src="/logobluebig.png" alt="CarRental Logo" className="h-10 w-auto object-contain rounded-lg shadow-md" />
        </div>
        <div className="flex items-center gap-6">
          <span className="font-medium">Hello, {username}</span>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate("/mainpage")}>Home</Button>
            <Button variant="ghost" onClick={() => navigate("/booking")}>My Bookings</Button>
            <Button variant="ghost" onClick={() => navigate("/profile")}>Profile</Button>
            <Button variant="outline" onClick={handleLogout} style={{ color: "black" }}>Logout</Button>
          </div>
        </div>
      </nav>

      {/* Main Section */}
      <div className="min-h-screen bg-gradient-to-br from-brand/10 to-background flex flex-col items-center justify-start px-4 py-10">
        {/* Hero */}
        <Card className="w-full max-w-3xl shadow-lg mb-10">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-extrabold text-brand mb-2">Welcome to CarRental</CardTitle>
            <p className="text-lg text-muted-foreground">The easiest way to rent a car online. Fast, secure, and reliable.</p>
          </CardHeader>
        </Card>

        {/* Cars Grid */}
        <div className="w-full max-w-6xl">
          <h2 className="text-3xl font-bold text-brand mb-8 text-center">Available Cars</h2>
          {loading ? (
            <div className="text-center py-8">Loading cars...</div>
          ) : cars.length === 0 ? (
            <div className="text-center py-8">No cars available at the moment.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
                <Card key={car.id} className="shadow-lg hover:shadow-xl transition-shadow">
                  <div className="aspect-video overflow-hidden">
                    {car.photo ? (
                      <img src={car.photo} alt={car.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">No Image</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{car.name}</h3>
                    <p className="text-sm text-muted-foreground mb-1">Weekly Rate</p>
                    <p className="text-2xl font-bold text-brand">₱{car.price.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Daily: ₱{(car.price / 7).toFixed(2)}</p>
                    <Button onClick={() => openModal(car)} className="w-full bg-brand text-brand-foreground hover:bg-brand/90">View Details</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Car Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{selectedCar?.name}</DialogTitle>
          </DialogHeader>
          {selectedCar && (
            <div className="space-y-6">
              <div className="aspect-video overflow-hidden rounded-lg">
                {selectedCar.photo ? (
                  <img src={selectedCar.photo} alt={selectedCar.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-lg">No Image Available</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedCar.details || "No description available."}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Pricing</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span>Weekly Rate:</span>
                      <span className="font-bold text-xl text-brand">₱{selectedCar.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Daily Rate:</span>
                      <span className="font-semibold">₱{(selectedCar.price / 7).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button onClick={() => { setIsModalOpen(false); openBookingModal(selectedCar); }} className="flex-1 bg-brand text-brand-foreground hover:bg-brand/90">Book Now</Button>
                <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Booking Modal */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Book {selectedCar?.name}</DialogTitle>
          </DialogHeader>
          {selectedCar && (
            <form onSubmit={bookCar} className="space-y-6">
              {/* Booking Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-lg mb-2">Booking Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Car:</span> {selectedCar.name}</div>
                  <div><span className="font-medium">Weekly Rate:</span> ₱{selectedCar.price.toLocaleString()}</div>
                  <div><span className="font-medium">Daily Rate:</span> ₱{(selectedCar.price / 7).toFixed(2)}</div>
                  <div><span className="font-medium">Status:</span> Available</div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Customer Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName">Full Name *</Label>
                    <Input
                      id="customerName"
                      type="text"
                      value={bookingForm.customerName}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, customerName: e.target.value }))}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactNumber">Contact Number *</Label>
                    <Input
                      id="contactNumber"
                      type="tel"
                      value={bookingForm.contactNumber}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, contactNumber: e.target.value }))}
                      placeholder="Enter your contact number"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={bookingForm.email}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Booking Dates */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Booking Dates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={bookingForm.startDate}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={bookingForm.endDate}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, endDate: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Payment Method</h4>
                <Label htmlFor="paymentMethod">Select Payment Method *</Label>
                <Select
                  value={bookingForm.paymentMethod}
                  onValueChange={(value) => setBookingForm(prev => ({ ...prev, paymentMethod: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    
                    <SelectItem value="Cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Preview */}
{bookingForm.startDate && bookingForm.endDate && (
  <div className="bg-blue-50 p-4 rounded-lg">
    <h4 className="font-semibold text-lg mb-2">Price Calculation</h4>
    {(() => {
      const start = new Date(bookingForm.startDate);
      const end = new Date(bookingForm.endDate);
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const dailyRate = selectedCar.price / 7;
      const totalPrice = dailyRate * daysDiff;

      // Format numbers with commas
      const formattedDailyRate = dailyRate.toLocaleString("en-PH", { minimumFractionDigits: 2 });
      const formattedTotalPrice = totalPrice.toLocaleString("en-PH", { minimumFractionDigits: 2 });

      return (
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span>Days:</span>
            <span>{daysDiff} day{daysDiff !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex justify-between">
            <span>Daily Rate:</span>
            <span>₱{formattedDailyRate}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total Price:</span>
            <span className="text-brand">₱{formattedTotalPrice}</span>
          </div>
        </div>
      );
    })()}
  </div>
)}


              <DialogFooter className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setIsBookingModalOpen(false)} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1 bg-brand text-brand-foreground hover:bg-brand/90" disabled={isBookingLoading}>
                  {isBookingLoading ? "Booking..." : "Confirm Booking"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MainPage;
