import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

type Booking = {
  id: string | number;
  car_model?: string;
  pickup_date?: string;
  return_date?: string;
  status?: string;
  created_at?: string;
  username?: string;
};

const Booking = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "";

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | number | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("username");
    navigate("/");
  };

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      if (!username) {
        setBookings([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("username", username)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching bookings:", error);
        setBookings([]);
      } else {
        setBookings(data || []);
      }
    } catch (err) {
      console.error("Unexpected fetch error:", err);
      setBookings([]);
    }
    setLoading(false);
  }, [username]);

  const cancelBooking = async (bookingId: string | number) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      setCancellingId(bookingId);

      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (error) {
        console.error("Error cancelling booking:", error);
        toast({
          title: "Cancel Failed",
          description: "Failed to cancel booking. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Booking Cancelled",
          description: "Your booking has been cancelled successfully.",
        });
        fetchBookings();
      }
    } finally {
      setCancellingId(null);
    }
  };

  useEffect(() => {
    fetchBookings();

    const channel = supabase
      .channel("public:bookings")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bookings" },
        (payload) => {
          const newBooking = payload.new as Booking;
          if (newBooking?.username === username) fetchBookings();
        }
      )
      .subscribe();

    return () => {
      try {
        channel.unsubscribe();
      } catch (err) {
        console.warn("Error unsubscribing channel:", err);
      }
    };
  }, [fetchBookings, username]);

  return (
    <>
      <nav className="w-full bg-brand text-brand-foreground shadow flex items-center justify-between px-8 py-4 mb-8">
        <div className="flex items-center">
          <img src="/logobluebig.png" alt="CarRental Logo" className="h-10 w-auto object-contain rounded-lg shadow-md" />
        </div>
        <div className="flex items-center gap-6">
          <span className="font-medium">Hello, {username || "User"}</span>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate("/mainpage")}>Home</Button>
            <Button variant="ghost" onClick={() => navigate("/booking")}>My Bookings</Button>
            <Button variant="ghost" onClick={() => navigate("/profile")}>Profile</Button>
            <Button variant="outline" onClick={handleLogout} style={{ color: "black" }}>Logout</Button>
          </div>
        </div>
      </nav>

      <div className="min-h-screen bg-gradient-to-br from-brand/10 to-background flex flex-col items-center px-4 py-10">
        <Card className="w-full max-w-4xl shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-brand">My Bookings</CardTitle>
          </CardHeader>

          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground">Loading your bookings...</p>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12">
                <img src="/no-booking.png" alt="No bookings" className="mx-auto h-40 opacity-80" />
                <h3 className="text-xl font-semibold text-brand mt-4">No bookings yet!</h3>
                <p className="text-muted-foreground mb-4">Looks like you haven’t booked a car yet. Let’s change that!</p>
                <Button className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={() => navigate("/mainpage")}>Browse Cars</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="shadow hover:shadow-lg transition">
                    <CardHeader>
                      <CardTitle className="text-xl text-brand">{booking.car_model}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p><strong>Pickup Date:</strong> {booking.pickup_date}</p>
                      <p><strong>Return Date:</strong> {booking.return_date}</p>
                      <p><strong>Status:</strong> <span className={booking.status === "cancelled" ? "text-red-500" : "text-green-600"}>{booking.status}</span></p>

                      <div className="flex flex-col gap-2">
                        {booking.status !== "cancelled" && (
                          <Button
                            className="bg-red-500 hover:bg-red-600 text-white w-full"
                            onClick={() => cancelBooking(booking.id)}
                            disabled={cancellingId === booking.id}
                          >
                            {cancellingId === booking.id ? "Cancelling..." : "Cancel Booking"}
                          </Button>
                        )}

                        <Button
                          className="bg-blue-500 hover:bg-blue-600 text-white w-full"
                          onClick={() => setContactModalOpen(true)}
                        >
                          Contact Owner
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contact Owner Modal */}
      <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Owner</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p><strong>Phone:</strong> <a href="tel:09351053930" className="text-blue-600 hover:underline">09351053930</a></p>
            <p><strong>Email:</strong> <a href="mailto:skyward@gmail.com" className="text-blue-600 hover:underline">skyward@gmail.com</a></p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContactModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Booking;
