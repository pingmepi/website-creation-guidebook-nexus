import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase JS handles the hash parsing automatically when detectSessionInUrl: true
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session) {
          toast.success("Logged in with Google");
          navigate("/dashboard", { replace: true });
        } else {
          toast.error("Login failed. Please try again.");
          navigate("/", { replace: true });
        }
      } catch (err) {
        console.error("OAuth callback error:", err);
        toast.error("Login failed. Please try again.");
        navigate("/", { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Signing you in…</span>
      </div>
    </div>
  );
};

export default AuthCallback;

