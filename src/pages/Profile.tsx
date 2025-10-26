import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const Profile = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";

  const [profile, setProfile] = useState({
    full_name: "",
    age: "",
    citizenship: "",
    gender: "",
    password: "",
  });

  const [editForm, setEditForm] = useState({
    username: "",
    full_name: "",
    age: "",
    citizenship: "",
    gender: "",
    password: "",
    lastPassword: "", // For verification
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Reset edit form when opening dialog
  const handleEditOpen = () => {
    setEditForm({
      username: username,
      full_name: profile.full_name,
      age: profile.age,
      citizenship: profile.citizenship,
      gender: profile.gender,
      password: "",
      lastPassword: "",
    });
    setIsEditOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    navigate("/");
  };

  // Fetch profile
  useEffect(() => {
    if (!username || username === "User") {
      // If no username is found, redirect to login
      navigate("/");
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load your profile.",
          variant: "destructive",
        });
      } else if (data) {
        setProfile({
          full_name: data.full_name || "",
          age: data.age?.toString() || "",
          citizenship: data.citizenship || "",
          gender: data.gender || "",
          password: data.password || "",
        });
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, [username]);

  // Save profile changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Verify last password matches current password
    if (editForm.lastPassword !== profile.password) {
      toast({
        title: "Verification Failed",
        description: "Current password does not match your stored password.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Prepare update object with only changed fields
    const updateData: any = {};
    
    if (editForm.username !== username) {
      updateData.username = editForm.username;
    }
    if (editForm.full_name !== profile.full_name) {
      updateData.full_name = editForm.full_name;
    }
    if (editForm.age !== profile.age) {
      updateData.age = editForm.age ? parseInt(editForm.age) : null;
    }
    if (editForm.citizenship !== profile.citizenship) {
      updateData.citizenship = editForm.citizenship;
    }
    if (editForm.gender !== profile.gender) {
      updateData.gender = editForm.gender;
    }
    if (editForm.password && editForm.password !== "") {
      updateData.password = editForm.password;
    }

    // If no changes were made
    if (Object.keys(updateData).length === 0) {
      toast({
        title: "No Changes",
        description: "No changes were made to your profile.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("username", username);

    setIsLoading(false);

    if (error) {
      console.error("Update error:", error);
      toast({
        title: "Update Failed",
        description: "Something went wrong while saving changes.",
        variant: "destructive",
      });
    } else {
      // Update local storage if username changed
      if (editForm.username !== username) {
        localStorage.setItem("username", editForm.username);
      }
      
      // Refresh profile data
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", editForm.username !== username ? editForm.username : username)
        .single();
      
      if (data) {
        setProfile({
          full_name: data.full_name || "",
          age: data.age?.toString() || "",
          citizenship: data.citizenship || "",
          gender: data.gender || "",
          password: data.password || "",
        });
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditOpen(false);
    }
  };

  return (
    <>
      {/* Navbar */}
      <nav className="w-full bg-brand text-brand-foreground shadow flex items-center justify-between px-8 py-4 mb-8">
        <div className="flex items-center">
          <img
            src="/logobluebig.png"
            alt="CarRental Logo"
            className="h-10 w-auto object-contain rounded-lg shadow-md"
          />
        </div>
        <div className="flex items-center gap-6">
          <span className="font-medium">Hello, {username}</span>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate("/mainpage")}>
              Home
            </Button>
            <Button variant="ghost" onClick={() => navigate("/booking")}>
              My Bookings
            </Button>
            <Button variant="ghost" onClick={() => navigate("/profile")}>
              Profile
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              style={{ color: "black" }}
            >
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Profile Main Section */}
      <div className="min-h-screen bg-gradient-to-br from-brand/10 to-background flex flex-col items-center px-4 py-10">
        <Card className="w-full max-w-md text-center shadow-lg p-6">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-brand">
              Hi, {profile.full_name || username}!
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-4 mt-4">
            <Button
              className="bg-brand text-white hover:bg-brand/90"
              onClick={handleEditOpen}
            >
              Edit Profile
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/booking")}
              className="hover:bg-muted"
            >
              Booking History
            </Button>

            <Button
              variant="outline"
              onClick={handleLogout}
              style={{ color: "black" }}
            >
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-3 mt-3">
            <div>
              <Label>Username</Label>
              <Input
                type="text"
                value={editForm.username}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, username: e.target.value }))
                }
              />
            </div>

            <div>
              <Label>Full Name</Label>
              <Input
                type="text"
                value={editForm.full_name}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, full_name: e.target.value }))
                }
              />
            </div>

            <div>
              <Label>Age</Label>
              <Input
                type="number"
                value={editForm.age}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, age: e.target.value }))
                }
              />
            </div>

            <div>
              <Label>Citizenship</Label>
              <Input
                type="text"
                value={editForm.citizenship}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    citizenship: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <Label>Gender</Label>
              <Input
                type="text"
                value={editForm.gender}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, gender: e.target.value }))
                }
              />
            </div>

            <div>
              <Label>New Password (leave blank to keep current)</Label>
              <Input
                type="password"
                value={editForm.password}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="Enter new password"
              />
            </div>

            <div>
              <Label>Current Password (required for verification)</Label>
              <Input
                type="password"
                value={editForm.lastPassword}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, lastPassword: e.target.value }))
                }
                placeholder="Enter your current password"
                required
              />
            </div>

            <DialogFooter className="mt-4 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-brand text-white hover:bg-brand/90"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Profile;

