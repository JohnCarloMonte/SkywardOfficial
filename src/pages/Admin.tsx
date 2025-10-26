import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Car {
  id: string;
  name: string;
  photo: string | null;
  details: string | null;
  price: number;
  created_at: string;
  updated_at: string;
}

interface Booking {
  id: string;
  car_id: string;
  customer_name: string;
  contact_number: string;
  email: string;
  start_date: string;
  end_date: string;
  total_price: number | null;
  payment_method: string | null;
  status: string | null;
  created_at: string;
  car?: Car;
  car_model?: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"cars" | "bookings">("cars");

  // Cars
  const [cars, setCars] = useState<Car[]>([]);
  const [carsLoading, setCarsLoading] = useState(true);
  const [isCarModalOpen, setIsCarModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [carForm, setCarForm] = useState({ name: "", photo: "", details: "", price: "" });

  // Bookings
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    if (!isAdmin) {
      navigate("/");
      return;
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("isAdmin");
    navigate("/");
  };

  const fetchCars = async () => {
    try {
      setCarsLoading(true);
      const { data, error } = await supabase.from("car").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setCars(data || []);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to load cars.", variant: "destructive" });
    } finally {
      setCarsLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setBookingsLoading(true);

      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const bookingsData: Booking[] = data || [];

      const carIds = bookingsData.filter(b => b.car_id).map(b => b.car_id) as string[];
      let carsMap: Record<string, Car> = {};
      if (carIds.length > 0) {
        const { data: carsData, error: carsError } = await supabase
          .from("car")
          .select("*")
          .in("id", carIds);
        if (carsError) throw carsError;

        carsMap = Object.fromEntries((carsData || []).map(c => [c.id, c]));
      }

      const bookingsWithCars = bookingsData.map(b => ({
        ...b,
        car: b.car_id ? carsMap[b.car_id] : undefined
      }));

      setBookings(bookingsWithCars);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to load bookings.", variant: "destructive" });
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "cars") fetchCars();
    if (activeTab === "bookings") fetchBookings();
  }, [activeTab]);

  const openCarModal = (car?: Car) => {
    if (car) {
      setEditingCar(car);
      setCarForm({
        name: car.name,
        photo: car.photo || "",
        details: car.details || "",
        price: car.price.toString(),
      });
    } else {
      setEditingCar(null);
      setCarForm({ name: "", photo: "", details: "", price: "" });
    }
    setIsCarModalOpen(true);
  };

  const saveCar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCar) {
        const { error } = await supabase
          .from("car")
          .update({
            name: carForm.name,
            photo: carForm.photo || null,
            details: carForm.details || null,
            price: parseFloat(carForm.price),
            updated_at: new Date(),
          })
          .eq("id", editingCar.id);
        if (error) throw error;
        toast({ title: "Success", description: "Car updated." });
      } else {
        const { error } = await supabase
          .from("car")
          .insert({
            name: carForm.name,
            photo: carForm.photo || null,
            details: carForm.details || null,
            price: parseFloat(carForm.price),
          });
        if (error) throw error;
        toast({ title: "Success", description: "Car added." });
      }
      setIsCarModalOpen(false);
      fetchCars();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to save car.", variant: "destructive" });
    }
  };

  const deleteCar = async (id: string) => {
    if (!confirm("Delete this car?")) return;
    try {
      const { error } = await supabase.from("car").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Car deleted." });
      fetchCars();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to delete car.", variant: "destructive" });
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase.from("bookings").update({ status }).eq("id", bookingId);
      if (error) throw error;
      toast({ title: "Success", description: `Booking ${status}.` });
      fetchBookings();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to update booking.", variant: "destructive" });
    }
  };

  const deleteBooking = async (bookingId: string) => {
    if (!confirm("Delete this booking?")) return;
    try {
      const { error } = await supabase.from("bookings").delete().eq("id", bookingId);
      if (error) throw error;
      toast({ title: "Success", description: "Booking deleted." });
      fetchBookings();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to delete booking.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="flex justify-between mb-6">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <Button onClick={handleLogout}>Logout</Button>
      </header>

      <div className="flex gap-4 mb-6">
        <Button variant={activeTab === "cars" ? "default" : "outline"} onClick={() => setActiveTab("cars")}>Cars</Button>
        <Button variant={activeTab === "bookings" ? "default" : "outline"} onClick={() => setActiveTab("bookings")}>Bookings</Button>
      </div>

      {activeTab === "cars" && (
        <div>
          <div className="flex justify-between mb-4">
            <h2 className="font-bold text-lg">Cars Management</h2>
            <Button onClick={() => openCarModal()}>Add Car</Button>
          </div>
          {carsLoading ? <p>Loading cars...</p> : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cars.map(car => (
                <Card key={car.id}>
                  <CardContent>
                    <h3 className="font-semibold">{car.name}</h3>
                    {car.photo && <img src={car.photo} alt={car.name} className="w-full h-32 object-cover rounded my-2" />}
                    <p>{car.details}</p>
                    <p>₱{car.price.toFixed(2)}</p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={() => openCarModal(car)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteCar(car.id)}>Delete</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "bookings" && (
        <div>
          <h2 className="font-bold text-lg mb-4">Bookings Management</h2>
          {bookingsLoading ? <p>Loading bookings...</p> : (
            <div className="space-y-4">
              {bookings.map(b => (
                <Card key={b.id}>
                  <CardContent>
                    <p><strong>Customer:</strong> {b.customer_name}</p>
                    <p><strong>Email:</strong> {b.email}</p>
                    <p><strong>Phone:</strong> {b.contact_number}</p>
                    <p><strong>Car:</strong> {b.car?.name || b.car_model || "Unknown"}</p>
                    <p><strong>Dates:</strong> {b.start_date} to {b.end_date}</p>
                    <p><strong>Total:</strong> ₱{b.total_price?.toFixed(2) || "0.00"}</p>
                    <p><strong>Status:</strong> {b.status || "pending"}</p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={() => updateBookingStatus(b.id, "approved")} disabled={b.status === "approved"}>Approve</Button>
                      <Button size="sm" variant="destructive" onClick={() => updateBookingStatus(b.id, "rejected")} disabled={b.status === "rejected"}>Reject</Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteBooking(b.id)}>Delete</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Car Modal */}
      <Dialog open={isCarModalOpen} onOpenChange={setIsCarModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCar ? "Edit Car" : "Add Car"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveCar} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={carForm.name} onChange={e => setCarForm(prev => ({ ...prev, name: e.target.value }))} required />
            </div>
            <div>
              <Label>Photo URL</Label>
              <Input value={carForm.photo} onChange={e => setCarForm(prev => ({ ...prev, photo: e.target.value }))} />
            </div>
            <div>
              <Label>Details</Label>
              <Input value={carForm.details} onChange={e => setCarForm(prev => ({ ...prev, details: e.target.value }))} />
            </div>
            <div>
              <Label>Price (₱)</Label>
              <Input type="number" value={carForm.price} onChange={e => setCarForm(prev => ({ ...prev, price: e.target.value }))} required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCarModalOpen(false)}>Cancel</Button>
              <Button type="submit">{editingCar ? "Update" : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
