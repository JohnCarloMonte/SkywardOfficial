import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User, Session } from "@supabase/supabase-js";

import heroImage from "@/assets/hero-car-bg.jpg"; // <-- replace with your background image path

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    username: "",
    password: ""
  });

  const [signupData, setSignupData] = useState({
    fullName: "",
    age: "",
    citizenship: "",
    gender: "",
    username: "",
    password: "",
    confirmPassword: ""
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) navigate('/');
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) navigate('/');
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const username = loginData.username.trim();
      const password = loginData.password.trim();

      // Admin login
      if (username === 'admin' && password === 'login') {
        localStorage.setItem("username", "admin");
        localStorage.setItem("isAdmin", "true");
        toast({
          title: "Admin Login Successful",
          description: "Welcome to the admin dashboard.",
        });
        navigate('/admin');
        return;
      }

      // Normal user login
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profileError || !profile || profile.password !== password) {
        throw new Error('Invalid username or password');
      }

      localStorage.setItem("username", profile.username);
      localStorage.setItem("isAdmin", "false");

      toast({
        title: "Login Successful",
        description: `Welcome back, ${profile.full_name}!`,
      });

      navigate('/mainpage');
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  if (signupData.password !== signupData.confirmPassword) {
    toast({
      title: "Password Mismatch",
      description: "Passwords do not match",
      variant: "destructive",
    });
    setIsLoading(false);
    return;
  }

  // 🚫 Age restriction check
  const age = parseInt(signupData.age);
  if (isNaN(age) || age < 18) {
    toast({
      title: "Age Restriction",
      description: "You must be at least 18 years old to create an account.",
      variant: "destructive",
    });
    setIsLoading(false);
    return;
  }

  try {
    const { data: existing } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', signupData.username)
      .single();

    if (existing) throw new Error('Username already exists');

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        full_name: signupData.fullName,
        age: age,
        citizenship: signupData.citizenship,
        gender: signupData.gender,
        username: signupData.username,
        password: signupData.password,
      });

    if (profileError) throw profileError;

    localStorage.setItem("username", signupData.username);

    toast({
      title: "Account Created!",
      description: "Your account has been created successfully.",
    });

    navigate('/mainpage');

    setSignupData({
      fullName: "",
      age: "",
      citizenship: "",
      gender: "",
      username: "",
      password: "",
      confirmPassword: ""
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    toast({
      title: "Signup Failed",
      description: error.message || "Failed to create account",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundImage: `url(${heroImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-brand">
            {isLogin ? "Login" : "Create Account"}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? "Sign in to your account to continue" 
              : "Create your account to get started"
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={loginData.username}
                  onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  className="mt-1"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Login"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setIsLogin(false)}
              >
                Create Account
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={signupData.fullName}
                  onChange={(e) => setSignupData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={signupData.age}
                  onChange={(e) => setSignupData(prev => ({ ...prev, age: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="citizenship">Citizenship</Label>
                <Input
                  id="citizenship"
                  type="text"
                  value={signupData.citizenship}
                  onChange={(e) => setSignupData(prev => ({ ...prev, citizenship: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={signupData.gender} onValueChange={(value) => setSignupData(prev => ({ ...prev, gender: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="signupUsername">Username</Label>
                <Input
                  id="signupUsername"
                  type="text"
                  value={signupData.username}
                  onChange={(e) => setSignupData(prev => ({ ...prev, username: e.target.value }))}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="signupPassword">Password</Label>
                <Input
                  id="signupPassword"
                  type="password"
                  value={signupData.password}
                  onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  className="mt-1"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setIsLogin(true)}
              >
                Already have an account? Login
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
