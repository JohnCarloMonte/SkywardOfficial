import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User, Session } from "@supabase/supabase-js";

interface SubmissionSummaryProps {
  user: User | null;
  session: Session | null;
}

export function SubmissionSummary({ user, session }: SubmissionSummaryProps) {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged Out",
        description: "You have successfully logged out.",
      });
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Submission Summary</CardTitle>
        <CardDescription>
          Review your submission details below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <strong>User ID:</strong> {user?.id}
          </div>
          <div>
            <strong>Email:</strong> {user?.email}
          </div>
          <div>
            <strong>Session ID:</strong> {session?.id}
          </div>
          <div>
            <strong>Created At:</strong> {new Date(session?.created_at!).toLocaleString()}
          </div>
        </div>

        <Button 
          onClick={handleLogout} 
          className="mt-4 w-full bg-red-500 text-white hover:bg-red-600"
        >
          Logout
        </Button>
      </CardContent>
    </Card>
  );
}